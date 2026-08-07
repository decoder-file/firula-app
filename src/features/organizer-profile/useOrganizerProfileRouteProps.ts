import { useMemo, useState } from "react";
import { Alert, Linking, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useSnackbar } from "@/design-system";
import { isNotFoundError } from "@/api/errors";
import { useIsAuthenticated } from "@/hooks/useAuth";
import {
  useCourtAvailability,
  useFavoriteOrganizer,
  useFollowOrganizer,
  useOrganizerCourts,
  useOrganizerDayUseOfferings,
  useOrganizerProfile,
  useOrganizerRatings,
  useOrganizerStoreProducts,
  useRateOrganizer,
} from "@/hooks/useOrganizer";
import type { DayUseOffering, OrganizerProfile, OrganizerRating, StoreProductSummary } from "@/services/organizer.service";
import type {
  OrganizerContactItem,
  OrganizerCourtItem,
  OrganizerCourtSlotItem,
  OrganizerDayUseOfferingItem,
  OrganizerEventItem,
  OrganizerProfileScreenProps,
  OrganizerReviewItem,
  OrganizerStoreProductItem,
  OrganizerTab,
  OrganizerTabItem,
} from "@/features/organizer-profile/types";

const PROFILE_BASE_URL = "https://firula.com.br/pagina-produtor";

const isActiveService = (services?: { status?: string | null }[]) =>
  Boolean(services?.some((service) => !["INACTIVE", "CANCELED", "DELETED"].includes(service.status ?? "")));

function getCapabilities(organizer: OrganizerProfile) {
  return {
    store: Boolean(organizer.store?.slug),
    courts: Boolean(
      organizer.hasCourts ||
        organizer.has_courts ||
        organizer.courtsEnabled ||
        organizer.courts_enabled ||
        organizer.courtReservationsEnabled ||
        organizer.court_reservations_enabled ||
        organizer.services?.courts ||
        isActiveService(organizer.courts),
    ),
    dayUse: Boolean(
      organizer.hasDayUse ||
        organizer.hasDayUses ||
        organizer.has_day_use ||
        organizer.has_day_uses ||
        organizer.dayUseEnabled ||
        organizer.day_use_enabled ||
        organizer.dayUsesEnabled ||
        organizer.day_uses_enabled ||
        organizer.dayUseReservationsEnabled ||
        organizer.day_use_reservations_enabled ||
        organizer.services?.dayUse ||
        organizer.services?.day_use ||
        organizer.services?.dayUses ||
        organizer.services?.day_uses ||
        isActiveService(organizer.dayUses) ||
        isActiveService(organizer.day_uses),
    ),
  };
}

const normalizeUrl = (value: string, fallbackPrefix = "https://") =>
  /^[a-z][a-z\d+.-]*:/i.test(value) ? value : `${fallbackPrefix}${value.replace(/^\/+/, "")}`;

const normalizeContactUrl = (value: string) => {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  if (/^\+?[\d\s().-]{8,}$/.test(value)) return `tel:${value.replace(/[^+\d]/g, "")}`;
  return normalizeUrl(value);
};

function buildContacts(organizer: OrganizerProfile): OrganizerContactItem[] {
  return [
    organizer.contact && { label: "Contato", value: organizer.contact, href: normalizeContactUrl(organizer.contact) },
    organizer.website && { label: "Site", value: organizer.website, href: normalizeUrl(organizer.website) },
    organizer.instagram && {
      label: "Instagram",
      value: organizer.instagram,
      href: normalizeUrl(organizer.instagram.replace(/^@/, ""), "https://instagram.com/"),
    },
    organizer.facebook && { label: "Facebook", value: organizer.facebook, href: normalizeUrl(organizer.facebook, "https://facebook.com/") },
    organizer.linkedin && { label: "LinkedIn", value: organizer.linkedin, href: normalizeUrl(organizer.linkedin, "https://linkedin.com/company/") },
  ].filter(Boolean) as OrganizerContactItem[];
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function formatEventDateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function reviewAuthorName(rating: OrganizerRating): string {
  return rating.user?.name || rating.author?.name || rating.userName || rating.authorName || "Usuário Firula";
}

function formatPriceCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatPriceRangeCents(minCents: number | null, maxCents: number | null): string {
  if (minCents == null) return "";
  if (maxCents == null || maxCents === minCents) return formatPriceCents(minCents);
  return `${formatPriceCents(minCents)} – ${formatPriceCents(maxCents)}`;
}

function formatDayUseDateLabel(offering: DayUseOffering): string {
  const dateLabel = new Date(`${offering.date}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return `${dateLabel} · ${offering.startTime}–${offering.endTime}`;
}

function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDaysIso(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

function formatDateOptionLabel(iso: string, todayIso: string): string {
  if (iso === todayIso) return "Hoje";
  if (iso === addDaysIso(todayIso, 1)) return "Amanhã";

  const date = new Date(`${iso}T00:00:00`);
  const weekday = date.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
  const day = String(date.getDate()).padStart(2, "0");
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day}`;
}

const COURT_DATE_OPTIONS_COUNT = 14;

function buildDateOptions(todayIso: string) {
  return Array.from({ length: COURT_DATE_OPTIONS_COUNT }, (_, index) => {
    const iso = addDaysIso(todayIso, index);
    return { iso, label: formatDateOptionLabel(iso, todayIso) };
  });
}

function reviewTimeLabel(createdAt?: string | null): string {
  if (!createdAt) return "";
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000);
  if (days <= 0) return "hoje";
  if (days === 1) return "1 dia";
  if (days < 30) return `${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? "1 mês" : `${months} meses`;
}

export function useOrganizerProfileRouteProps(): OrganizerProfileScreenProps {
  const router = useRouter();
  const { id: slugParam } = useLocalSearchParams<{ id: string }>();
  const slug = slugParam ?? "";
  const isAuthenticated = useIsAuthenticated();
  const { show: showSnackbar } = useSnackbar();

  const { data: organizer, isPending, isError, error, refetch } = useOrganizerProfile(slug);
  const followMutation = useFollowOrganizer(slug);
  const favoriteMutation = useFavoriteOrganizer(slug);
  const rateMutation = useRateOrganizer(slug);

  const [activeTab, setActiveTab] = useState<OrganizerTab>("events");
  const [isReviewsOpen, setIsReviewsOpen] = useState(false);
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const ratingsQuery = useOrganizerRatings(slug, isReviewsOpen);

  const storeSlug = organizer?.store?.slug ?? "";
  const storeProductsQuery = useOrganizerStoreProducts(storeSlug, activeTab === "store");
  const dayUseOfferingsQuery = useOrganizerDayUseOfferings(slug, activeTab === "dayuse");

  const todayIso = new Date().toISOString().slice(0, 10);
  const dateOptions = useMemo(() => buildDateOptions(todayIso), [todayIso]);
  const courtsQuery = useOrganizerCourts(slug, activeTab === "booking");
  const [selectedCourtId, setSelectedCourtId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [selectedSlots, setSelectedSlots] = useState<OrganizerCourtSlotItem[]>([]);
  const activeCourtId = selectedCourtId ?? courtsQuery.data?.[0]?.id ?? null;
  const availabilityQuery = useCourtAvailability(
    activeCourtId ?? "",
    selectedDate,
    activeTab === "booking" && Boolean(activeCourtId),
  );

  const status: OrganizerProfileScreenProps["status"] = isPending
    ? "loading"
    : isError
      ? isNotFoundError(error)
        ? "not-found"
        : "error"
      : "ready";

  const capabilities = organizer ? getCapabilities(organizer) : { store: false, courts: false, dayUse: false };
  const contacts = organizer ? buildContacts(organizer) : [];

  const tabs = useMemo<OrganizerTabItem[]>(
    () => [
      { key: "events" as const, label: "Eventos ativos" },
      ...(capabilities.store ? [{ key: "store" as const, label: "Loja" }] : []),
      ...(capabilities.dayUse ? [{ key: "dayuse" as const, label: "Day Use" }] : []),
      ...(capabilities.courts ? [{ key: "booking" as const, label: "Reservar quadra" }] : []),
    ],
    [capabilities.courts, capabilities.dayUse, capabilities.store],
  );

  const events: OrganizerEventItem[] = (organizer?.events ?? []).map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.name,
    dateLabel: formatEventDateLabel(event.startsAt),
    city: [event.location?.city, event.location?.state].filter(Boolean).join(", "),
    eventType: event.status === "PUBLISHED" ? "Vendas abertas" : "Evento",
    coverUrl: event.coverUrl,
  }));

  const reviews: OrganizerReviewItem[] = (ratingsQuery.data ?? []).map((rating) => ({
    id: rating.id,
    name: reviewAuthorName(rating),
    stars: Math.min(5, Math.max(1, Math.round(rating.stars))),
    comment: rating.comment ?? null,
    timeLabel: reviewTimeLabel(rating.createdAt),
  }));

  const storeProducts: OrganizerStoreProductItem[] = (storeProductsQuery.data ?? []).map(
    (product: StoreProductSummary) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      priceLabel: formatPriceRangeCents(product.minPriceCents, product.maxPriceCents),
      imageUrl: product.imageUrl,
    }),
  );

  const dayUseOfferings: OrganizerDayUseOfferingItem[] = (dayUseOfferingsQuery.data ?? [])
    .filter((offering) => offering.date >= todayIso)
    .map((offering) => ({
      id: offering.id,
      name: offering.name,
      description: [offering.description?.trim(), formatDayUseDateLabel(offering)].filter(Boolean).join(" · "),
      priceLabel: formatPriceCents(offering.priceInCents),
      soldOut: offering.confirmedCount >= offering.capacity,
    }));

  const courts: OrganizerCourtItem[] = (courtsQuery.data ?? []).map((court) => ({
    id: court.id,
    name: court.name,
    requiresApproval: court.requiresApproval,
  }));

  const slots: OrganizerCourtSlotItem[] = (availabilityQuery.data ?? []).map((slot) => ({
    startTime: slot.startTime,
    endTime: slot.endTime,
    priceCents: slot.priceInCents,
    priceLabel: formatPriceCents(slot.priceInCents),
  }));

  const requireAuth = (): boolean => {
    if (isAuthenticated) return true;
    router.push(`/login-modal?redirectTo=${encodeURIComponent(`/organizer/${slug}`)}` as never);
    return false;
  };

  const openWebPath = (path: string) => {
    const websiteUrl = process.env.EXPO_PUBLIC_WEBSITE_URL?.replace(/\/$/, "");
    if (!websiteUrl) {
      Alert.alert("Indisponível", "O endereço do site não está configurado.");
      return;
    }
    void Linking.openURL(`${websiteUrl}${path}`);
  };

  return {
    status,
    onRetry: () => refetch(),

    orgName: organizer?.tradeName ?? "",
    initials: getInitials(organizer?.tradeName ?? slug),
    logoUrl: organizer?.logoUrl ?? null,
    location: organizer ? [organizer.city, organizer.state].filter(Boolean).join(", ") || null : null,
    description: organizer?.description ?? null,

    followersCount: organizer?.followersCount ?? 0,
    eventsCount: events.length,
    rating: (Number(organizer?.averageRating) || 0).toFixed(1).replace(".", ","),
    reviewsCount: organizer?.ratingsCount ?? 0,

    isFollowing: Boolean(organizer?.following),
    isFollowBusy: followMutation.isPending,
    isFavorited: Boolean(organizer?.isFavorited),
    isFavoriteBusy: favoriteMutation.isPending,

    tabs,
    activeTab,
    onChangeTab: setActiveTab,

    events,
    hasStore: capabilities.store,
    hasDayUse: capabilities.dayUse,
    hasBooking: capabilities.courts,
    contacts,

    storeProducts,
    isStoreLoading: storeProductsQuery.isPending,
    dayUseOfferings,
    isDayUseLoading: dayUseOfferingsQuery.isPending,

    courts,
    isCourtsLoading: courtsQuery.isPending,
    selectedCourtId: activeCourtId,
    onSelectCourt: (courtId) => {
      setSelectedCourtId(courtId);
      setSelectedSlots([]);
    },
    dateOptions,
    selectedDate,
    onSelectDate: (date) => {
      setSelectedDate(date);
      setSelectedSlots([]);
    },
    slots,
    isSlotsLoading: availabilityQuery.isPending,
    selectedSlots,
    onToggleSlot: (slot) => {
      setSelectedSlots((previous) => {
        const isSelected = previous.some((item) => item.startTime === slot.startTime);
        if (isSelected) return previous.filter((item) => item.startTime !== slot.startTime);

        const next = [...previous, slot].sort((a, b) => a.startTime.localeCompare(b.startTime));
        for (let i = 0; i < next.length - 1; i++) {
          if (next[i].endTime !== next[i + 1].startTime) {
            showSnackbar({ message: "Selecione apenas horários consecutivos.", variant: "error" });
            return previous;
          }
        }
        return next;
      });
    },
    onConfirmBooking: () => {
      if (!activeCourtId || selectedSlots.length === 0) return;
      const startTime = selectedSlots[0].startTime;
      const endTime = selectedSlots[selectedSlots.length - 1].endTime;
      openWebPath(
        `/quadras/${slug}/reservar/${activeCourtId}?date=${selectedDate}&startTime=${startTime}&endTime=${endTime}`,
      );
    },

    onBack: () => router.back(),
    onShare: async () => {
      if (!organizer) return;
      const profileUrl = `${PROFILE_BASE_URL}/${encodeURIComponent(organizer.slug)}`;
      await Share.share({
        title: `${organizer.tradeName} no Firula`,
        message: `Confira o perfil de ${organizer.tradeName} no Firula.\n${profileUrl}`,
        url: profileUrl,
      });
    },
    onToggleFollow: () => {
      if (!requireAuth()) return;
      followMutation.mutate(Boolean(organizer?.following), {
        onError: () => showSnackbar({ message: "Não foi possível atualizar o perfil seguido.", variant: "error" }),
      });
    },
    onToggleFavorite: () => {
      if (!requireAuth()) return;
      const wasFavorited = Boolean(organizer?.isFavorited);
      favoriteMutation.mutate(wasFavorited, {
        onSuccess: () =>
          showSnackbar({
            message: wasFavorited ? "Removido dos favoritos." : "Adicionado aos favoritos.",
            variant: "success",
          }),
        onError: () => showSnackbar({ message: "Não foi possível atualizar os favoritos.", variant: "error" }),
      });
    },
    onOpenEvent: (event) => {
      router.push(`/event/${event.slug ?? event.id}` as never);
    },
    onOpenStoreProduct: (product) => {
      if (!storeSlug) return;
      openWebPath(`/lojas/${storeSlug}/produtos/${product.slug}`);
    },
    onReserveDayUseOffering: () => Alert.alert("Em breve", "A reserva pelo app ainda não está disponível."),
    onOpenContact: (contact) => {
      void Linking.openURL(contact.href);
    },
    isContactSheetOpen,
    onOpenContactSheet: () => setIsContactSheetOpen(true),
    onCloseContactSheet: () => setIsContactSheetOpen(false),

    isReviewsOpen,
    onOpenReviews: () => setIsReviewsOpen(true),
    onCloseReviews: () => setIsReviewsOpen(false),
    reviews,
    isReviewsLoading: ratingsQuery.isPending,
    isReviewSubmitting: rateMutation.isPending,
    onSubmitReview: (stars, comment) => {
      if (!requireAuth()) return Promise.resolve();

      return new Promise<void>((resolve, reject) => {
        rateMutation.mutate(
          { rating: stars, comment },
          {
            onSuccess: () => {
              showSnackbar({ message: "Avaliação enviada. Obrigado!", variant: "success" });
              resolve();
            },
            onError: () => {
              showSnackbar({ message: "Não foi possível enviar a avaliação agora.", variant: "error" });
              reject(new Error("rate failed"));
            },
          },
        );
      });
    },
  };
}
