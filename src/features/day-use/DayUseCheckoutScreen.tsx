import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QRCode from "react-native-qrcode-svg";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  MapPin,
  QrCode,
  Sun,
  Users,
} from "lucide-react-native";

import { isApiError } from "@/api/errors";
import { Button, EmptyState, PressScale, Text, TextField, TopBar, useTheme } from "@/design-system";
import { useAuthUser, useAuthUserProfile, useIsAuthenticated } from "@/hooks/useAuth";
import { courtCouponsService } from "@/services/courtCoupons.service";
import { dayUseService, type DayUsePaymentMethod, type DayUsePaymentResult, type DayUseReservation } from "@/services/dayUse.service";
import { organizerService, type DayUseOffering } from "@/services/organizer.service";
import { formatCardExpiry, formatCardNumber, formatCep, onlyDigits } from "@/utils/mask";
import { formatCurrencyFromCents, formatDateLong } from "@/utils/format";

type Step = "details" | "method" | "payment" | "success";
type AppliedCoupon = { code: string; discountCents: number; finalAmountCents: number };

const generateKey = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

function imageUrl(dayUse: DayUseOffering): string | null {
  return dayUse.coverImageUrl || dayUse.imageUrl ||
    dayUse.images?.map((item) => (typeof item === "string" ? item : item.url)).find(Boolean) || null;
}

function errorMessage(error: unknown, fallback: string): string {
  return isApiError(error) && error.message ? error.message : fallback;
}

export function DayUseCheckoutScreen() {
  const { colors, radius } = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useLocalSearchParams<{ orgSlug: string; dayUseId: string; resume?: string }>();
  const orgSlug = params.orgSlug ?? "";
  const dayUseId = params.dayUseId ?? "";
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser();
  const authProfile = useAuthUserProfile();

  const [step, setStep] = useState<Step>("details");
  const [reservation, setReservation] = useState<DayUseReservation | null>(null);
  const [payment, setPayment] = useState<DayUsePaymentResult | null>(null);
  const [method, setMethod] = useState<DayUsePaymentMethod | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const reservationKey = useRef(generateKey());
  const resumedRef = useRef(false);

  const offeringsQuery = useQuery({
    queryKey: ["day-uses", orgSlug],
    queryFn: () => organizerService.listDayUseOfferings(orgSlug),
    enabled: Boolean(orgSlug),
    staleTime: 60_000,
  });
  const organizerQuery = useQuery({
    queryKey: ["organizer", orgSlug],
    queryFn: () => organizerService.getProfile(orgSlug),
    enabled: Boolean(orgSlug),
    staleTime: 60_000,
  });
  const dayUse = offeringsQuery.data?.find((item) => item.id === dayUseId);
  const methods = organizerQuery.data?.availablePaymentMethods ?? [];
  const cardFlow = organizerQuery.data?.cardFlow ?? null;
  const occupied = dayUse ? dayUse.confirmedCount ?? dayUse._count?.reservations ?? 0 : 0;
  const available = dayUse ? Math.max(0, dayUse.capacity - occupied) : 0;
  const displayTotal = coupon?.finalAmountCents ?? dayUse?.priceInCents ?? 0;

  const reserveMutation = useMutation({
    mutationFn: () => dayUseService.reserve(dayUseId, {
      idempotencyKey: reservationKey.current,
      ...(coupon ? { couponCode: coupon.code } : {}),
    }),
  });
  const payMutation = useMutation({
    mutationFn: ({ reservationId, input }: { reservationId: string; input: Parameters<typeof dayUseService.pay>[1] }) =>
      dayUseService.pay(reservationId, input),
  });

  const paymentStatusQuery = useQuery({
    queryKey: ["day-use-payment-status", reservation?.id],
    queryFn: () => dayUseService.getPaymentStatus(reservation!.id),
    enabled: step === "payment" && Boolean(reservation?.id),
    refetchInterval: (query) => query.state.data?.status === "CONFIRMED" ? false : 3000,
  });

  useEffect(() => {
    if (paymentStatusQuery.data?.status === "CONFIRMED" && reservation) {
      setReservation({ ...reservation, status: "CONFIRMED" });
      setStep("success");
    }
  }, [paymentStatusQuery.data?.status, reservation]);

  const confirmReservation = useCallback(async () => {
    if (!dayUse || reserveMutation.isPending) return;
    if (!isAuthenticated) {
      const redirectTo = `/day-use/${encodeURIComponent(orgSlug)}/${encodeURIComponent(dayUseId)}?resume=1`;
      router.push({ pathname: "/login-modal", params: { redirectTo } });
      return;
    }
    setPaymentError(null);
    try {
      const result = await reserveMutation.mutateAsync();
      setReservation(result.reservation);
      if (result.reservation.status === "CONFIRMED") {
        setStep("success");
      } else if (methods.length > 1) {
        setStep("method");
      } else {
        setMethod(methods[0] ?? "PIX");
        setStep("payment");
      }
    } catch (error) {
      if (isApiError(error) && error.code === "DAY_USE_SOLD_OUT") {
        Alert.alert("Day Use esgotado", "As vagas acabaram de esgotar. Confira outras datas disponíveis.");
        void queryClient.invalidateQueries({ queryKey: ["day-uses", orgSlug] });
        return;
      }
      if (isApiError(error) && error.code === "DAY_USE_ALREADY_RESERVED") {
        Alert.alert("Reserva existente", "Você já possui uma reserva para este Day Use.");
        return;
      }
      if (isApiError(error) && error.code?.startsWith("COURT_COUPON_")) setCoupon(null);
      Alert.alert("Não foi possível reservar", errorMessage(error, "Tente novamente em instantes."));
    }
  }, [dayUse, dayUseId, isAuthenticated, methods, orgSlug, queryClient, reserveMutation, router, coupon]);

  useEffect(() => {
    if (params.resume !== "1" || !isAuthenticated || !dayUse || organizerQuery.isPending || resumedRef.current) return;
    resumedRef.current = true;
    void confirmReservation();
  }, [params.resume, isAuthenticated, dayUse, organizerQuery.isPending, confirmReservation]);

  const createPix = useCallback(async () => {
    if (!reservation) return;
    setPaymentError(null);
    try {
      const result = await payMutation.mutateAsync({
        reservationId: reservation.id,
        input: { method: "PIX", idempotencyKey: generateKey() },
      });
      setPayment(result);
    } catch (error) {
      setPaymentError(errorMessage(error, "Não foi possível gerar o Pix. Tente novamente."));
    }
  }, [payMutation, reservation]);

  useEffect(() => {
    if (step === "payment" && method === "PIX" && !payment && !payMutation.isPending && !paymentError) {
      void createPix();
    }
  }, [step, method, payment, payMutation.isPending, paymentError, createPix]);

  const validateCoupon = async () => {
    const code = couponInput.trim();
    if (!code || !dayUse) return;
    setIsValidatingCoupon(true);
    setCouponError(null);
    try {
      const result = await courtCouponsService.validate(code, { target: "DAY_USE", dayUseId });
      if (!result.valid) {
        setCouponError(result.message);
      } else {
        setCoupon({ code: result.code, discountCents: result.discountCents, finalAmountCents: result.finalAmountCents });
        setCouponInput("");
      }
    } catch (error) {
      setCouponError(errorMessage(error, "Não foi possível validar o cupom."));
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const goBack = () => {
    if (step === "payment" && methods.length > 1) {
      setPayment(null);
      setPaymentError(null);
      setStep("method");
      return;
    }
    router.replace(`/organizer/${orgSlug}` as never);
  };

  if (offeringsQuery.isPending || organizerQuery.isPending) {
    return <Centered><ActivityIndicator size="large" color={colors.primary} /><Text token="body" color="muted">Carregando Day Use…</Text></Centered>;
  }
  if (!dayUse || offeringsQuery.isError || organizerQuery.isError) {
    return <Centered><EmptyState icon={Sun} variant="error" title="Day Use não encontrado" description="Não foi possível carregar esta opção." actionLabel="Voltar" onAction={goBack} /></Centered>;
  }

  if (step === "success" && reservation) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <TopBar title="Day Use confirmado" variant="detail" onBack={() => router.replace(`/organizer/${orgSlug}` as never)} />
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20, alignItems: "center" }}>
          <View style={{ width: 92, height: 92, borderRadius: 46, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
            <CheckCircle2 size={44} color={colors.primaryText} />
          </View>
          <View style={{ alignItems: "center", gap: 6 }}>
            <Text token="title">Seu acesso está garantido</Text>
            <Text token="body" color="muted" style={{ textAlign: "center" }}>O ingresso ficará disponível na sua carteira.</Text>
          </View>
          <SummaryCard dayUse={dayUse} amountCents={payment?.amountCents ?? reservation.priceInCents} />
          <View style={{ width: "100%", gap: 10 }}>
            <Button label="Ver meu ingresso" onPress={() => router.replace("/(tabs)/tickets")} fullWidth />
            <Button label="Voltar para o produtor" variant="secondary" onPress={() => router.replace(`/organizer/${orgSlug}` as never)} fullWidth />
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <TopBar title={dayUse.name} variant="detail" onBack={goBack} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: step === "details" ? 116 : 32, gap: 22 }} keyboardShouldPersistTaps="handled">
        {step === "details" ? (
          <Details
            dayUse={dayUse}
            organizerName={organizerQuery.data?.tradeName ?? orgSlug}
            available={available}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            coupon={coupon}
            couponError={couponError}
            isValidatingCoupon={isValidatingCoupon}
            onApplyCoupon={() => void validateCoupon()}
            onRemoveCoupon={() => { setCoupon(null); setCouponError(null); }}
          />
        ) : null}
        {step === "method" ? <MethodSelection amountCents={reservation?.priceInCents ?? displayTotal} methods={methods} onSelect={(value) => { setMethod(value); setStep("payment"); }} /> : null}
        {step === "payment" && method === "PIX" ? (
          <PixPayment payment={payment?.method === "PIX" ? payment : null} isLoading={payMutation.isPending} error={paymentError} copied={copied} onCopy={async () => { if (payment?.method !== "PIX" || !payment.qrCodeText) return; await Clipboard.setStringAsync(payment.qrCodeText); setCopied(true); setTimeout(() => setCopied(false), 2000); }} onRetry={() => { setPayment(null); setPaymentError(null); void createPix(); }} />
        ) : null}
        {step === "payment" && method === "CARD" ? (
          <CardPayment reservation={reservation!} cardFlow={cardFlow} customer={{ name: authUser?.name ?? "", email: authUser?.email ?? "", cpf: authProfile?.cpf ?? "", phone: authProfile?.phone ?? "" }} mutation={payMutation} onPayment={setPayment} onSuccess={() => setStep("success")} />
        ) : null}
      </ScrollView>
      {step === "details" ? (
        <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 14, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 16 }}>
          <View style={{ flex: 1 }}><Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>Total</Text><Text token="subtitle">{displayTotal === 0 ? "Grátis" : formatCurrencyFromCents(displayTotal)}</Text></View>
          <Button label={available <= 0 ? "Esgotado" : isAuthenticated ? "Continuar" : "Entrar e continuar"} onPress={() => void confirmReservation()} disabled={available <= 0} loading={reserveMutation.isPending} />
        </View>
      ) : null}
    </View>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <View style={{ flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center", gap: 14, padding: 24 }}>{children}</View>;
}

function Details({ dayUse, organizerName, available, couponInput, setCouponInput, coupon, couponError, isValidatingCoupon, onApplyCoupon, onRemoveCoupon }: { dayUse: DayUseOffering; organizerName: string; available: number; couponInput: string; setCouponInput: (value: string) => void; coupon: AppliedCoupon | null; couponError: string | null; isValidatingCoupon: boolean; onApplyCoupon: () => void; onRemoveCoupon: () => void }) {
  const { colors, radius } = useTheme();
  const photo = imageUrl(dayUse);
  return <>
    {photo ? <Image source={{ uri: photo }} style={{ width: "100%", aspectRatio: 16 / 10, borderRadius: radius.xl }} resizeMode="cover" /> : <View style={{ width: "100%", aspectRatio: 16 / 10, borderRadius: radius.xl, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center", gap: 8 }}><Sun size={38} color={colors.primaryText} /><Text token="bodySm" color="primary">Foto do local</Text></View>}
    <View style={{ gap: 7 }}><Text token="caption" color="muted">{organizerName}</Text><Text token="title">{dayUse.name}</Text>{dayUse.description ? <Text token="body" color="muted">{dayUse.description}</Text> : null}</View>
    <View style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: radius.xl, overflow: "hidden" }}>
      <Fact icon={CalendarDays} text={formatDateLong(dayUse.date)} /><Fact icon={Clock3} text={`${dayUse.startTime} – ${dayUse.endTime}`} border /><Fact icon={Users} text={`${available} ${available === 1 ? "vaga disponível" : "vagas disponíveis"}`} border />
    </View>
    <View style={{ gap: 12 }}><Text token="subtitle">Seu acesso</Text><View style={{ padding: 16, borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.primarySoft, borderRadius: radius.xl, flexDirection: "row", alignItems: "center" }}><View style={{ flex: 1, gap: 3 }}><Text token="body" style={{ fontWeight: "800" }}>1x Day Use</Text><Text token="bodySm" color="muted">Um acesso para esta data</Text><Text token="subtitle" style={{ marginTop: 4 }}>{formatCurrencyFromCents(dayUse.priceInCents)}</Text></View><CheckCircle2 size={26} color={colors.primaryText} /></View></View>
    {dayUse.priceInCents > 0 ? <View style={{ gap: 10 }}><Text token="subtitle">Cupom de desconto</Text>{coupon ? <View style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.successSoft, flexDirection: "row", alignItems: "center", gap: 8 }}><Check size={18} color={colors.success} /><Text token="bodySm" style={{ flex: 1, fontWeight: "700", color: colors.success }}>{coupon.code} · -{formatCurrencyFromCents(coupon.discountCents)}</Text><Button label="Remover" size="sm" variant="ghost" onPress={onRemoveCoupon} /></View> : <View style={{ gap: 8 }}><TextField label="Código do cupom" value={couponInput} onChangeText={(value) => setCouponInput(value.toUpperCase())} autoCapitalize="characters" error={couponError ?? undefined} /><Button label="Aplicar cupom" variant="secondary" loading={isValidatingCoupon} disabled={!couponInput.trim()} onPress={onApplyCoupon} fullWidth /></View>}</View> : null}
  </>;
}

function Fact({ icon: Icon, text, border = false }: { icon: typeof CalendarDays; text: string; border?: boolean }) { const { colors } = useTheme(); return <View style={{ flexDirection: "row", alignItems: "center", gap: 11, padding: 15, borderTopWidth: border ? 1 : 0, borderTopColor: colors.border }}><Icon size={18} color={colors.primaryText} /><Text token="bodySm" style={{ flex: 1, textTransform: "capitalize" }}>{text}</Text></View>; }

export function MethodSelection({ amountCents, methods, onSelect }: { amountCents: number; methods: DayUsePaymentMethod[]; onSelect: (method: DayUsePaymentMethod) => void }) { const { colors, radius } = useTheme(); return <View style={{ gap: 16 }}><View><Text token="title">Como você quer pagar?</Text><Text token="body" color="muted" style={{ marginTop: 5 }}>Total de {formatCurrencyFromCents(amountCents)}</Text></View>{methods.map((item) => { const Icon = item === "PIX" ? QrCode : CreditCard; return <PressScale key={item} onPress={() => onSelect(item)} style={{ padding: 18, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, flexDirection: "row", alignItems: "center", gap: 14 }}><View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}><Icon size={22} color={colors.primaryText} /></View><View style={{ flex: 1 }}><Text token="subtitle">{item === "PIX" ? "Pix" : "Cartão de crédito"}</Text><Text token="bodySm" color="muted">{item === "PIX" ? "Aprovação rápida" : "Pagamento seguro"}</Text></View></PressScale>; })}</View>; }

export function PixPayment({ payment, isLoading, error, copied, onCopy, onRetry }: { payment: Extract<DayUsePaymentResult, { method: "PIX" }> | null; isLoading: boolean; error: string | null; copied: boolean; onCopy: () => void; onRetry: () => void }) { const { colors, radius } = useTheme(); if (!payment?.qrCodeText) return <View style={{ alignItems: "center", gap: 16, paddingVertical: 40 }}>{isLoading ? <><ActivityIndicator size="large" color={colors.primary} /><Text token="body" color="muted">Gerando código Pix…</Text></> : <><Text token="body" color="error" style={{ textAlign: "center" }}>{error ?? "Não foi possível gerar o Pix."}</Text><Button label="Tentar novamente" onPress={onRetry} /></>}</View>; return <View style={{ gap: 16 }}><View style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.warningSoft, flexDirection: "row", alignItems: "center", gap: 10 }}><ActivityIndicator color={colors.warning} /><View style={{ flex: 1 }}><Text token="bodySm" style={{ fontWeight: "800", color: colors.warning }}>Aguardando pagamento</Text><Text token="caption" style={{ color: colors.warning, textTransform: "none", letterSpacing: 0 }}>A confirmação é automática</Text></View></View><View style={{ padding: 22, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, alignItems: "center" }}><View style={{ backgroundColor: "#fff", padding: 10, borderRadius: 14 }}><QRCode value={payment.qrCodeText} size={196} /></View><Text token="subtitle" style={{ marginTop: 14 }}>{formatCurrencyFromCents(payment.amountCents)}</Text></View><Button label={copied ? "Código copiado!" : "Copiar código Pix"} icon={copied ? Check : Copy} variant="secondary" onPress={onCopy} fullWidth /></View>; }

function SummaryCard({ dayUse, amountCents }: { dayUse: DayUseOffering; amountCents: number }) { const { colors, radius } = useTheme(); return <View style={{ width: "100%", padding: 18, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 12 }}><Row label="Day Use" value={dayUse.name} /><Row label="Data" value={formatDateLong(dayUse.date)} /><Row label="Acessos" value="1 acesso" /><Row label="Valor" value={formatCurrencyFromCents(amountCents)} /></View>; }
function Row({ label, value }: { label: string; value: string }) { return <View style={{ flexDirection: "row", gap: 12, justifyContent: "space-between" }}><Text token="bodySm" color="muted">{label}</Text><Text token="bodySm" style={{ flex: 1, textAlign: "right", fontWeight: "700" }}>{value}</Text></View>; }

export function CardPayment({ reservation, cardFlow, customer, mutation, onPayment, onSuccess }: { reservation: { id: string; priceInCents: number }; cardFlow: "TRANSPARENT" | "REDIRECT" | null; customer: { name: string; email: string; cpf: string; phone: string }; mutation: ReturnType<typeof useMutation<DayUsePaymentResult, Error, { reservationId: string; input: Parameters<typeof dayUseService.pay>[1] }>>; onPayment: (payment: DayUsePaymentResult) => void; onSuccess: () => void }) {
  const [number, setNumber] = useState(""); const [holder, setHolder] = useState(""); const [expiry, setExpiry] = useState(""); const [cvv, setCvv] = useState(""); const [cep, setCep] = useState(""); const [addressNumber, setAddressNumber] = useState(""); const [street, setStreet] = useState(""); const [neighborhood, setNeighborhood] = useState(""); const [city, setCity] = useState(""); const [state, setState] = useState(""); const [error, setError] = useState<string | null>(null); const [isLookingUpCep, setIsLookingUpCep] = useState(false);
  useEffect(() => { const digits = onlyDigits(cep); if (digits.length !== 8) return; setIsLookingUpCep(true); fetch(`https://viacep.com.br/ws/${digits}/json/`).then((response) => response.json()).then((data) => { if (data.erro) throw new Error(); setStreet(data.logradouro ?? ""); setNeighborhood(data.bairro ?? ""); setCity(data.localidade ?? ""); setState(data.uf ?? ""); }).catch(() => setError("CEP não encontrado.")).finally(() => setIsLookingUpCep(false)); }, [cep]);
  const valid = cardFlow === "REDIRECT" || (onlyDigits(number).length >= 13 && holder.trim().length >= 3 && onlyDigits(expiry).length === 4 && cvv.length >= 3 && onlyDigits(cep).length === 8 && addressNumber.trim().length > 0 && street && city && state.length === 2);
  const submit = async () => { setError(null); try { const digits = onlyDigits(expiry); const input = cardFlow === "REDIRECT" ? { method: "CARD" as const, installments: 1, idempotencyKey: generateKey() } : { method: "CARD" as const, installments: 1, idempotencyKey: generateKey(), creditCard: { holderName: holder.trim(), number: onlyDigits(number), expiryMonth: digits.slice(0, 2), expiryYear: `20${digits.slice(2)}`, ccv: cvv }, creditCardHolderInfo: { name: customer.name, email: customer.email, cpfCnpj: onlyDigits(customer.cpf), postalCode: onlyDigits(cep), addressNumber: addressNumber.trim(), city, state, street, zone: neighborhood, phone: onlyDigits(customer.phone) } }; const result = await mutation.mutateAsync({ reservationId: reservation.id, input }); onPayment(result); if (result.method === "CARD" && result.status === "PAID") { onSuccess(); return; } if (result.method === "CARD" && result.action?.redirectUrl) await Linking.openURL(result.action.redirectUrl); } catch (err) { setError(errorMessage(err, "Não foi possível processar o cartão.")); } };
  return <View style={{ gap: 14 }}><View><Text token="title">Pagamento com cartão</Text><Text token="body" color="muted" style={{ marginTop: 5 }}>{formatCurrencyFromCents(reservation.priceInCents)}</Text></View>{cardFlow !== "REDIRECT" ? <><TextField label="Número do cartão" value={formatCardNumber(number)} onChangeText={setNumber} keyboardType="number-pad" /><TextField label="Nome como está no cartão" value={holder} onChangeText={(value) => setHolder(value.toUpperCase())} autoCapitalize="characters" /><View style={{ flexDirection: "row", gap: 10 }}><View style={{ flex: 1 }}><TextField label="MM/AA" value={formatCardExpiry(expiry)} onChangeText={setExpiry} keyboardType="number-pad" /></View><View style={{ flex: 1 }}><TextField label="CVV" value={cvv} onChangeText={(value) => setCvv(onlyDigits(value).slice(0, 4))} keyboardType="number-pad" secureTextEntry /></View></View><View style={{ flexDirection: "row", gap: 10 }}><View style={{ flex: 1 }}><TextField label="CEP" value={formatCep(cep)} onChangeText={setCep} keyboardType="number-pad" /></View><View style={{ flex: 1 }}><TextField label="Número" value={addressNumber} onChangeText={setAddressNumber} keyboardType="number-pad" /></View></View>{isLookingUpCep ? <ActivityIndicator /> : street ? <View style={{ flexDirection: "row", gap: 7 }}><MapPin size={16} /><Text token="bodySm" color="muted" style={{ flex: 1 }}>{street}, {addressNumber || "s/n"} — {city}/{state}</Text></View> : null}</> : <Text token="body" color="muted">Você será direcionado para o ambiente seguro da operadora.</Text>}{error ? <Text token="bodySm" color="error">{error}</Text> : null}<Button label={cardFlow === "REDIRECT" ? "Ir para pagamento" : "Pagar com cartão"} onPress={() => void submit()} loading={mutation.isPending} disabled={!valid} fullWidth /></View>;
}
