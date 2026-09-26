import { useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CalendarClock, ChevronRight, Sun, Trophy } from "lucide-react-native";

import { EmptyState, Surface, Text, TopBar, useSnackbar, useTheme } from "@/design-system";
import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import { CourtBookingSection, DayUseOfferingsList } from "@/features/organizer-profile/OrganizerProfileScreen";
import type { OrganizerCourtItem, OrganizerCourtSlotItem, OrganizerDayUseOfferingItem } from "@/features/organizer-profile/types";
import { useCourtAvailability, useOrganizerCourts, useOrganizerDayUseOfferings, useOrganizerProfile } from "@/hooks/useOrganizer";
import { courtCouponsService } from "@/services/courtCoupons.service";
import type { DayUseOffering } from "@/services/organizer.service";
import type { AppliedReservationCoupon } from "@/utils/reservationCoupon";

type ReservationTab = "dayuse" | "courts";

const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const addDays = (iso: string, amount: number) => { const date = new Date(`${iso}T00:00:00`); date.setDate(date.getDate() + amount); return toIsoDate(date); };
const formatPrice = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dayUseImage = (item: DayUseOffering) => item.coverImageUrl || item.imageUrl || item.images?.map((image) => typeof image === "string" ? image : image.url).find(Boolean) || null;

export function ReservationsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { show } = useSnackbar();
  const { orgSlug = "" } = useLocalSearchParams<{ orgSlug: string }>();
  const profileQuery = useOrganizerProfile(orgSlug);
  const dayUseQuery = useOrganizerDayUseOfferings(orgSlug);
  const courtsQuery = useOrganizerCourts(orgSlug);
  const today = useMemo(() => toIsoDate(new Date()), []);
  const [activeTab, setActiveTab] = useState<ReservationTab | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedSlots, setSelectedSlots] = useState<OrganizerCourtSlotItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedReservationCoupon | null>(null);
  const activeCourtId = selectedCourtId ?? courtsQuery.data?.[0]?.id ?? "";
  const availabilityQuery = useCourtAvailability(activeCourtId, selectedDate, activeTab === "courts" && Boolean(activeCourtId));

  const dayUses: OrganizerDayUseOfferingItem[] = (dayUseQuery.data ?? []).filter((item) => item.date >= today).map((item) => {
    const date = new Date(`${item.date}T00:00:00`).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    const remaining = Math.max(0, item.capacity - (item.confirmedCount ?? item._count?.reservations ?? 0));
    return { id: item.id, name: item.name, description: item.description?.trim() ?? "", dateLabel: date, timeLabel: `${item.startTime} – ${item.endTime}`, availabilityLabel: remaining === 1 ? "1 vaga disponível" : `${remaining} vagas disponíveis`, priceLabel: formatPrice(item.priceInCents), soldOut: remaining <= 0, imageUrl: dayUseImage(item) };
  });
  const courts: OrganizerCourtItem[] = (courtsQuery.data ?? []).map((item) => ({ id: item.id, name: item.name, requiresApproval: item.requiresApproval, imageUrl: item.imageUrl?.trim() || null }));
  const slots: OrganizerCourtSlotItem[] = (availabilityQuery.data ?? []).map((item) => ({ startTime: item.startTime, endTime: item.endTime, priceCents: item.priceInCents, priceLabel: formatPrice(item.priceInCents) }));
  const dateOptions = useMemo(() => Array.from({ length: 14 }, (_, index) => { const iso = addDays(today, index); const date = new Date(`${iso}T00:00:00`); const label = index === 0 ? "Hoje" : index === 1 ? "Amanhã" : `${date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "")} ${String(date.getDate()).padStart(2, "0")}`; return { iso, label }; }), [today]);

  const toggleSlot = (slot: OrganizerCourtSlotItem) => {
    setCoupon(null);
    setSelectedSlots((current) => {
      if (current.some((item) => item.startTime === slot.startTime)) return current.filter((item) => item.startTime !== slot.startTime);
      const next = [...current, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
      if (next.some((item, index) => index < next.length - 1 && item.endTime !== next[index + 1].startTime)) {
        show({ message: "Selecione apenas horários consecutivos.", variant: "error" });
        return current;
      }
      return next;
    });
  };

  const applyCoupon = async (code: string) => {
    if (!activeCourtId || selectedSlots.length === 0) return "Escolha um horário antes de aplicar o cupom.";
    try {
      const result = await courtCouponsService.validate(code, { target: "COURT_RESERVATION", courtId: activeCourtId, date: selectedDate, startTime: selectedSlots[0].startTime, endTime: selectedSlots[selectedSlots.length - 1].endTime });
      if (!result.valid) return result.message;
      setCoupon({ code: result.code, discountCents: result.discountCents, finalAmountCents: result.finalAmountCents });
      return null;
    } catch { return "Não foi possível validar o cupom agora."; }
  };

  const hasDayUse = dayUses.length > 0;
  const hasCourts = courts.length > 0;
  const isLoading = dayUseQuery.isPending || courtsQuery.isPending;
  const goBack = () => {
    if (activeTab) {
      setActiveTab(null);
      return;
    }
    router.back();
  };

  return (
    <Screen edges={[]}>
      <TopBar title={activeTab === "dayuse" ? "Day Use" : activeTab === "courts" ? "Reservar quadra" : "Day Use e Reservas"} variant="detail" onBack={goBack} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 40 }}>
        {activeTab ? (
          <View style={{ gap: 4 }}>
            <Text token="title">{activeTab === "dayuse" ? "Day Uses disponíveis" : "Escolha sua quadra"}</Text>
            <Text token="body" color="muted">{profileQuery.data?.tradeName ?? "Confira as opções disponíveis."}</Text>
          </View>
        ) : (
          <>
            <View style={{ borderRadius: 24, overflow: "hidden", backgroundColor: "#0B1A12", minHeight: 190, justifyContent: "flex-end", padding: 20, gap: 9 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Trophy size={14} color="#5FE39A" />
                <Text token="caption" style={{ color: "#5FE39A" }}>SUA PRÓXIMA EXPERIÊNCIA</Text>
              </View>
              <Text token="title" style={{ color: "#FFFFFF", fontSize: 30, lineHeight: 34, textTransform: "uppercase" }}>
                DAY USE E RESERVAS
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.82)", lineHeight: 21 }}>
                Escolha como você quer aproveitar o espaço.
              </Text>
              <Text token="caption" style={{ color: "rgba(255,255,255,0.6)", textTransform: "none", letterSpacing: 0 }}>
                Consulte as opções disponíveis antes de continuar.
              </Text>
            </View>
            <View style={{ gap: 4 }}>
              <Text token="subtitle">Escolha uma opção</Text>
              <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
                Acesse Day Use ou selecione uma quadra e um horário.
              </Text>
            </View>
          </>
        )}
        <View>
          {!activeTab && isLoading ? (
            <View style={{ alignItems: "center", gap: 10, paddingVertical: 48 }}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text token="body" color="muted">Carregando opções…</Text>
            </View>
          ) : null}
          {!activeTab && !isLoading ? (
            <View style={{ gap: 12 }}>
              <ServiceChoice
                icon={Sun}
                title="Comprar Day Use"
                description="Acesso ao espaço em uma data e período definidos"
                action="Ver mais"
                onPress={() => setActiveTab("dayuse")}
              />
              <ServiceChoice
                icon={CalendarClock}
                title="Reservar quadra"
                description="Escolha a quadra, o dia e os horários disponíveis"
                action="Ver mais"
                onPress={() => setActiveTab("courts")}
              />
            </View>
          ) : null}
          {activeTab === "dayuse" ? <DayUseOfferingsList offerings={dayUses} isLoading={dayUseQuery.isPending} onReserve={(item) => router.push(`/day-use/${encodeURIComponent(orgSlug)}/${encodeURIComponent(item.id)}` as never)} /> : null}
          {activeTab === "courts" ? <CourtBookingSection courts={courts} isCourtsLoading={courtsQuery.isPending} selectedCourtId={activeCourtId || null} onSelectCourt={(id) => { setSelectedCourtId(id); setSelectedSlots([]); setCoupon(null); }} dateOptions={dateOptions} selectedDate={selectedDate} onSelectDate={(date) => { setSelectedDate(date); setSelectedSlots([]); setCoupon(null); }} slots={slots} isSlotsLoading={availabilityQuery.isPending} selectedSlots={selectedSlots} onToggleSlot={toggleSlot} coupon={coupon} onApplyCoupon={applyCoupon} onRemoveCoupon={() => setCoupon(null)} onConfirm={() => { if (!activeCourtId || selectedSlots.length === 0) return; router.push({ pathname: "/court-booking/[orgSlug]/[courtId]", params: { orgSlug, courtId: activeCourtId, date: selectedDate, startTime: selectedSlots[0].startTime, endTime: selectedSlots[selectedSlots.length - 1].endTime, ...(coupon?.code ? { coupon: coupon.code } : {}) } } as never); }} /> : null}
          {!isLoading && !hasDayUse && !hasCourts ? <EmptyState icon={CalendarClock} variant="empty" title="Nenhuma opção disponível no momento" /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function ServiceChoice({ icon: Icon, title, description, action, onPress }: { icon: typeof Sun; title: string; description: string; action: string; onPress: () => void }) {
  const { colors, spacing } = useTheme();
  return (
    <AnimatedPressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`${title}. ${action}`}>
      <Surface level={1} style={{ padding: spacing.s4 }}>
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }}>
            <Icon size={22} color={colors.primaryText} strokeWidth={1.8} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text token="title" style={{ fontSize: 24, lineHeight: 29 }}>{title}</Text>
            <Text token="caption" color="muted" style={{ marginTop: 3, textTransform: "none", letterSpacing: 0 }}>
              {description}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 6, marginTop: spacing.s3 }}>
          <Text token="label" style={{ color: colors.primaryText }}>{action}</Text>
          <ChevronRight size={16} color={colors.primaryText} />
        </View>
      </Surface>
    </AnimatedPressable>
  );
}
