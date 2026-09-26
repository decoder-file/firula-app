import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CalendarDays, CheckCircle2, Clock3, MapPin } from "lucide-react-native";

import { isApiError } from "@/api/errors";
import { Button, EmptyState, Text, TextField, TopBar, useTheme } from "@/design-system";
import { CardPayment, MethodSelection, PixPayment } from "@/features/day-use/DayUseCheckoutScreen";
import { useAuthUser, useAuthUserProfile, useIsAuthenticated } from "@/hooks/useAuth";
import { courtCouponsService } from "@/services/courtCoupons.service";
import { courtReservationService, type CourtReservation } from "@/services/courtReservation.service";
import type { DayUsePaymentMethod, DayUsePaymentResult } from "@/services/dayUse.service";
import { organizerService } from "@/services/organizer.service";
import { formatCurrencyFromCents, formatDateLong } from "@/utils/format";

type Step = "confirm" | "method" | "payment" | "success";
type AppliedCoupon = { code: string; discountCents: number; finalAmountCents: number };

const generateKey = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const messageFor = (error: unknown, fallback: string) => isApiError(error) && error.message ? error.message : fallback;

export function CourtBookingCheckoutScreen() {
  const { colors, radius } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ orgSlug: string; courtId: string; date: string; startTime: string; endTime: string; coupon?: string; resume?: string }>();
  const { orgSlug = "", courtId = "", date = "", startTime = "", endTime = "" } = params;
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser();
  const authProfile = useAuthUserProfile();
  const [step, setStep] = useState<Step>("confirm");
  const [notes, setNotes] = useState("");
  const [couponInput, setCouponInput] = useState(params.coupon ?? "");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [reservation, setReservation] = useState<CourtReservation | null>(null);
  const [method, setMethod] = useState<DayUsePaymentMethod | null>(null);
  const [payment, setPayment] = useState<DayUsePaymentResult | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const resumedRef = useRef(false);
  const autoCouponRef = useRef(false);
  const idempotencyKey = useMemo(() => `court_${courtId}_${date}_${startTime}_${endTime}_${generateKey()}`, [courtId, date, startTime, endTime]);

  const courtsQuery = useQuery({ queryKey: ["courts", orgSlug], queryFn: () => organizerService.listCourts(orgSlug), enabled: Boolean(orgSlug), staleTime: 60_000 });
  const organizerQuery = useQuery({ queryKey: ["organizer", orgSlug], queryFn: () => organizerService.getProfile(orgSlug), enabled: Boolean(orgSlug), staleTime: 60_000 });
  const slotsQuery = useQuery({ queryKey: ["court-availability", courtId, date], queryFn: () => organizerService.getCourtAvailability(courtId, date), enabled: Boolean(courtId && date), staleTime: 30_000 });
  const court = courtsQuery.data?.find((item) => item.id === courtId);
  const selectedSlots = (slotsQuery.data ?? []).filter((slot) => slot.startTime >= startTime && slot.endTime <= endTime);
  const totalCents = selectedSlots.reduce((sum, slot) => sum + slot.priceInCents, 0);
  const methods = organizerQuery.data?.availablePaymentMethods ?? [];
  const cardFlow = organizerQuery.data?.cardFlow ?? null;

  const createMutation = useMutation({ mutationFn: () => courtReservationService.create({ courtId, date, startTime, endTime, notes: notes.trim() || undefined, idempotencyKey, ...(coupon ? { couponCode: coupon.code } : {}) }) });
  const payMutation = useMutation({ mutationFn: ({ reservationId, input }: { reservationId: string; input: Parameters<typeof courtReservationService.pay>[1] }) => courtReservationService.pay(reservationId, input) });
  const statusQuery = useQuery({ queryKey: ["court-reservation-payment-status", reservation?.id], queryFn: () => courtReservationService.getPaymentStatus(reservation!.id), enabled: step === "payment" && Boolean(reservation?.id), refetchInterval: (query) => query.state.data?.status === "CONFIRMED" ? false : 3000 });

  useEffect(() => { if (statusQuery.data?.status === "CONFIRMED" && reservation) { setReservation({ ...reservation, status: "CONFIRMED" }); setStep("success"); } }, [statusQuery.data?.status, reservation]);

  const validateCoupon = useCallback(async (requestedCode?: string) => {
    const code = (requestedCode ?? couponInput).trim();
    if (!code || !startTime || !endTime) return;
    setIsValidatingCoupon(true); setCouponError(null);
    try {
      const result = await courtCouponsService.validate(code, { target: "COURT_RESERVATION", courtId, date, startTime, endTime });
      if (!result.valid) setCouponError(result.message);
      else { setCoupon({ code: result.code, discountCents: result.discountCents, finalAmountCents: result.finalAmountCents }); setCouponInput(""); }
    } catch (error) { setCouponError(messageFor(error, "Não foi possível validar o cupom.")); }
    finally { setIsValidatingCoupon(false); }
  }, [couponInput, courtId, date, startTime, endTime]);

  useEffect(() => { if (!params.coupon || autoCouponRef.current || slotsQuery.isPending) return; autoCouponRef.current = true; void validateCoupon(params.coupon); }, [params.coupon, slotsQuery.isPending, validateCoupon]);

  const createReservation = useCallback(async () => {
    if (!court || selectedSlots.length === 0 || createMutation.isPending) return;
    if (!isAuthenticated) {
      const query = new URLSearchParams({ date, startTime, endTime, resume: "1", ...(coupon?.code ? { coupon: coupon.code } : {}) });
      router.push({ pathname: "/login-modal", params: { redirectTo: `/court-booking/${encodeURIComponent(orgSlug)}/${encodeURIComponent(courtId)}?${query}` } });
      return;
    }
    try {
      const result = await createMutation.mutateAsync();
      setReservation(result.reservation);
      if (result.reservation.status === "CONFIRMED" || result.reservation.status === "PENDING_APPROVAL" || court.requiresApproval) { setStep("success"); return; }
      if (methods.length > 1) setStep("method");
      else { setMethod(methods[0] ?? "PIX"); setStep("payment"); }
    } catch (error) {
      if ((isApiError(error) && error.statusCode === 409) || (isApiError(error) && error.code === "COURT_SLOT_IN_PAST")) {
        void queryClient.invalidateQueries({ queryKey: ["court-availability", courtId, date] });
        Alert.alert("Horário indisponível", error.code === "COURT_SLOT_IN_PAST" ? "Esse horário já passou. Escolha outro horário." : "Esse horário acabou de ser reservado por outra pessoa.", [{ text: "Escolher outro", onPress: () => router.replace(`/organizer/${orgSlug}` as never) }]);
        return;
      }
      if (isApiError(error) && error.code?.startsWith("COURT_COUPON_")) setCoupon(null);
      Alert.alert("Não foi possível reservar", messageFor(error, "Tente novamente em instantes."));
    }
  }, [court, selectedSlots.length, createMutation, isAuthenticated, date, startTime, endTime, coupon, router, orgSlug, courtId, methods, queryClient]);

  useEffect(() => { if (params.resume !== "1" || !isAuthenticated || !court || selectedSlots.length === 0 || resumedRef.current) return; resumedRef.current = true; void createReservation(); }, [params.resume, isAuthenticated, court, selectedSlots.length, createReservation]);

  const createPix = useCallback(async () => {
    if (!reservation) return;
    setPaymentError(null);
    try { setPayment(await payMutation.mutateAsync({ reservationId: reservation.id, input: { method: "PIX", idempotencyKey: generateKey() } })); }
    catch (error) { setPaymentError(messageFor(error, "Não foi possível gerar o Pix.")); }
  }, [reservation, payMutation]);
  useEffect(() => { if (step === "payment" && method === "PIX" && !payment && !payMutation.isPending && !paymentError) void createPix(); }, [step, method, payment, payMutation.isPending, paymentError, createPix]);

  const back = () => {
    if (step === "payment" && methods.length > 1) { setPayment(null); setPaymentError(null); setStep("method"); return; }
    router.replace(`/organizer/${orgSlug}` as never);
  };

  if (courtsQuery.isPending || organizerQuery.isPending || slotsQuery.isPending) return <Centered><ActivityIndicator size="large" color={colors.primary} /><Text token="body" color="muted">Conferindo sua reserva…</Text></Centered>;
  if (!court || selectedSlots.length === 0 || courtsQuery.isError || slotsQuery.isError) return <Centered><EmptyState icon={CalendarDays} variant="error" title="Horário indisponível" description="Volte ao perfil do produtor e escolha outro horário." actionLabel="Escolher outro" onAction={back} /></Centered>;

  const amountCents = coupon?.finalAmountCents ?? totalCents;
  const pendingApproval = reservation?.status === "PENDING_APPROVAL";
  if (step === "success" && reservation) return <View style={{ flex: 1, backgroundColor: colors.background }}><TopBar title={pendingApproval ? "Aguardando aprovação" : "Reserva confirmada"} variant="detail" onBack={() => router.replace(`/organizer/${orgSlug}` as never)} /><ScrollView contentContainerStyle={{ padding: 20, gap: 20, alignItems: "center" }}><View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: pendingApproval ? colors.warningSoft : colors.primarySoft, alignItems: "center", justifyContent: "center" }}>{pendingApproval ? <AlertCircle size={44} color={colors.warning} /> : <CheckCircle2 size={44} color={colors.primaryText} />}</View><Text token="title" style={{ textAlign: "center" }}>{pendingApproval ? "Reserva recebida" : "Quadra reservada!"}</Text><Text token="body" color="muted" style={{ textAlign: "center" }}>{pendingApproval ? "O administrador precisa aprovar sua solicitação antes do pagamento." : "Sua reserva foi confirmada com sucesso."}</Text><BookingSummary courtName={court.name} date={date} startTime={startTime} endTime={endTime} amountCents={payment?.amountCents ?? reservation.priceInCents} /><View style={{ width: "100%", gap: 10 }}><Button label="Fazer outra reserva" onPress={() => router.replace(`/organizer/${orgSlug}` as never)} fullWidth /><Button label="Ir para o início" variant="secondary" onPress={() => router.replace("/(tabs)")} fullWidth /></View></ScrollView></View>;

  return <View style={{ flex: 1, backgroundColor: colors.background }}><TopBar title={court.name} variant="detail" onBack={back} /><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: step === "confirm" ? 108 : 32 }}>{step === "confirm" ? <>{court.imageUrl ? <Image source={{ uri: court.imageUrl }} style={{ width: "100%", aspectRatio: 16 / 8, borderRadius: radius.xl }} /> : null}<View><Text token="caption" color="primary">RESUMO</Text><Text token="title" style={{ marginTop: 6 }}>Confirmar reserva</Text><Text token="body" color="muted" style={{ marginTop: 4 }}>Revise os detalhes antes de continuar.</Text></View><BookingSummary courtName={court.name} date={date} startTime={startTime} endTime={endTime} amountCents={amountCents} originalAmountCents={coupon ? totalCents : undefined} requiresApproval={court.requiresApproval} /><View style={{ gap: 10 }}><Text token="subtitle">Cupom de desconto</Text>{coupon ? <View style={{ padding: 14, backgroundColor: colors.successSoft, borderRadius: radius.lg }}><Text token="bodySm" style={{ color: colors.success, fontWeight: "800" }}>{coupon.code} · -{formatCurrencyFromCents(coupon.discountCents)}</Text><Button label="Remover" size="sm" variant="ghost" onPress={() => setCoupon(null)} /></View> : <><TextField label="Código do cupom" value={couponInput} onChangeText={(value) => setCouponInput(value.toUpperCase())} error={couponError ?? undefined} /><Button label="Aplicar cupom" variant="secondary" loading={isValidatingCoupon} disabled={!couponInput.trim()} onPress={() => void validateCoupon()} fullWidth /></>}</View><TextField label="Observações (opcional)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} /></> : null}{step === "method" ? <MethodSelection amountCents={reservation?.priceInCents ?? amountCents} methods={methods} onSelect={(value) => { setMethod(value); setStep("payment"); }} /> : null}{step === "payment" && method === "PIX" ? <PixPayment payment={payment?.method === "PIX" ? payment : null} isLoading={payMutation.isPending} error={paymentError} copied={copied} onCopy={async () => { if (payment?.method !== "PIX" || !payment.qrCodeText) return; await Clipboard.setStringAsync(payment.qrCodeText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} onRetry={() => { setPayment(null); setPaymentError(null); void createPix(); }} /> : null}{step === "payment" && method === "CARD" ? <CardPayment reservation={reservation!} cardFlow={cardFlow} customer={{ name: authUser?.name ?? "", email: authUser?.email ?? "", cpf: authProfile?.cpf ?? "", phone: authProfile?.phone ?? "" }} mutation={payMutation} onPayment={setPayment} onSuccess={() => setStep("success")} /> : null}</ScrollView>{step === "confirm" ? <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 14, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}><Button label={isAuthenticated ? "Confirmar reserva" : "Entrar para reservar"} onPress={() => void createReservation()} loading={createMutation.isPending} fullWidth /></View> : null}</View>;
}

function Centered({ children }: { children: React.ReactNode }) { const { colors } = useTheme(); return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>{children}</View>; }

function BookingSummary({ courtName, date, startTime, endTime, amountCents, originalAmountCents, requiresApproval }: { courtName: string; date: string; startTime: string; endTime: string; amountCents: number; originalAmountCents?: number; requiresApproval?: boolean }) { const { colors, radius } = useTheme(); return <View style={{ width: "100%", padding: 18, gap: 13, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl }}><View style={{ flexDirection: "row", gap: 10 }}><MapPin size={18} color={colors.primaryText} /><Text token="subtitle" style={{ flex: 1 }}>{courtName}</Text></View><Info icon={CalendarDays} label="Data" value={formatDateLong(date)} /><Info icon={Clock3} label="Horário" value={`${startTime} – ${endTime}`} /><View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text token="bodySm" color="muted">Valor</Text><View style={{ alignItems: "flex-end" }}>{originalAmountCents !== undefined ? <Text token="caption" color="muted" style={{ textDecorationLine: "line-through" }}>{formatCurrencyFromCents(originalAmountCents)}</Text> : null}<Text token="subtitle">{amountCents === 0 ? "Grátis" : formatCurrencyFromCents(amountCents)}</Text></View></View>{requiresApproval ? <View style={{ padding: 11, backgroundColor: colors.warningSoft, borderRadius: radius.md, flexDirection: "row", gap: 8 }}><AlertCircle size={17} color={colors.warning} /><Text token="bodySm" style={{ color: colors.warning, flex: 1 }}>Esta quadra requer aprovação. O pagamento será liberado depois que o administrador confirmar.</Text></View> : null}</View>; }
function Info({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) { const { colors } = useTheme(); return <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}><Icon size={17} color={colors.primaryText} /><Text token="bodySm" color="muted">{label}</Text><Text token="bodySm" style={{ flex: 1, textAlign: "right", fontWeight: "700", textTransform: "capitalize" }}>{value}</Text></View>; }
