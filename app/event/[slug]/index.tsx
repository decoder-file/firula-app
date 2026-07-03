import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Animated, Linking, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarDays, ChevronDown, ChevronUp, Clock3, MapPin, Minus, Plus } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EventDetailHeader } from "@/components/EventDetailHeader";
import { EventDetailHeaderCompact } from "@/components/EventDetailHeaderCompact";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { useScreenLog } from "@/hooks/useScreenLog";
import { useEventBySlug } from "@/hooks/useEvents";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useCheckFavorite, useToggleFavorite } from "@/hooks/useFavorites";
import { colors } from "@/theme/colors";
import { formatCurrencyFromCents, formatDateLong } from "@/utils/format";
import type { AdminEventTicketLot } from "@/services/events.service";

const formatTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

const isLotAvailable = (lot: AdminEventTicketLot) => {
  if (!lot.active) return false;
  const now = new Date();
  return now < new Date(lot.salesEnd) && lot.quantity - lot.quantitySold > 0;
};

export default function EventDetailScreen() {
  useScreenLog();
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();

  const isAuthenticated = useIsAuthenticated();
  const { data: event, isLoading, isError } = useEventBySlug(slug ?? "");

  const { data: favoriteStatus } = useCheckFavorite(event?.id ?? "");
  const { mutate: toggleFavorite, isPending: isFavoritePending } = useToggleFavorite();

  const isFavorited = favoriteStatus?.isFavorited ?? false;

  const handleToggleFavorite = () => {
    if (!isAuthenticated) { router.push("/login-modal"); return; }
    if (!event) return;
    toggleFavorite({ eventId: event.id, isFavorited });
  };

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [1, 0], extrapolate: "clamp" });
  const compactHeaderOpacity = scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, 1], extrapolate: "clamp" });

  const [selectedLots, setSelectedLots] = useState<Record<string, number>>({});

  const handleAdd = (lotId: string) =>
    setSelectedLots((prev) => ({ ...prev, [lotId]: (prev[lotId] ?? 0) + 1 }));

  const handleRemove = (lotId: string) =>
    setSelectedLots((prev) => {
      const next = { ...prev };
      if ((next[lotId] ?? 0) > 1) next[lotId]--;
      else delete next[lotId];
      return next;
    });

  const handleScroll = useCallback(
    (e: any) => Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })(e),
    [scrollY],
  );

  const totalTickets = Object.values(selectedLots).reduce((s, q) => s + q, 0);
  const totalPrice = event
    ? event.ticketLots.reduce((s, lot) => s + lot.price * (selectedLots[lot.id] ?? 0), 0)
    : 0;

  const handleBuy = () => {
    if (totalTickets === 0 || !event) return;
    const eventRef = event.slug;
    const ticketsParam = Object.entries(selectedLots)
      .filter(([, qty]) => qty > 0)
      .map(([lotId, qty]) => `${lotId}:${qty}`)
      .join(",");
    Linking.openURL(
      `${process.env.EXPO_PUBLIC_WEBSITE_URL}/eventos/${eventRef}?tickets=${ticketsParam}&checkout=1`,
    );
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Screen edges={["left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ paddingTop: insets.top + 16 }} className="absolute left-4 z-10">
          <AnimatedPressable className="rounded-full bg-white/85 p-2" onPress={() => router.back()}>
            <View className="h-5 w-5" />
          </AnimatedPressable>
        </View>
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <Skeleton className="h-64 w-full" />
          <View className="gap-4 px-4 pt-4">
            <Skeleton className="h-7 w-3/4 rounded-xl" />
            <View className="flex-row items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <View className="gap-1.5">
                <Skeleton className="h-3.5 w-32 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-full" />
              </View>
            </View>
            <View className="flex-row gap-3">
              <Skeleton className="h-16 flex-1 rounded-2xl" />
              <Skeleton className="h-16 flex-1 rounded-2xl" />
            </View>
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="mt-2 h-4 w-1/3 rounded-full" />
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-2/3 rounded-full" />
            <Skeleton className="mt-2 h-4 w-1/3 rounded-full" />
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  // ── Error / not found ────────────────────────────────────────────────────────
  if (isError || !event) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-muted-foreground">Evento não encontrado</Text>
          <AnimatedPressable className="mt-4" onPress={() => router.back()}>
            <Text className="font-medium text-sm text-primary">Voltar</Text>
          </AnimatedPressable>
        </View>
      </Screen>
    );
  }

  // ── Derived values ───────────────────────────────────────────────────────────
  const eventImage = event.coverUrl ? { uri: event.coverUrl } : null;
  const locationLabel = `${event.location.address}, ${event.location.addressNumber}`;
  const cityLabel = `${event.location.neighborhood} · ${event.location.city}, ${event.location.state}`;

  return (
    <Screen edges={["left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1">
        <Animated.View style={{ opacity: compactHeaderOpacity, paddingTop: insets.top }}>
          <EventDetailHeaderCompact />
        </Animated.View>

        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <Animated.View style={{ opacity: headerOpacity }}>
            <EventDetailHeader
              eventImage={eventImage}
              isFavorited={isFavorited}
              isFavoritePending={isFavoritePending}
              onToggleFavorite={handleToggleFavorite}
            />
          </Animated.View>

          <View className="px-4 pt-4">
            {/* Title */}
            <Text className="font-extrabold text-xl text-foreground">{event.name}</Text>

            {/* Organizer */}
            <View className="mt-3 flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-accent">
                <Text className="font-bold text-xs text-primary">
                  {event.organization.tradeName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text className="font-medium text-sm text-foreground">{event.organization.tradeName}</Text>
                <Text className="text-xs text-muted-foreground">Organizador</Text>
              </View>
            </View>

            {/* Date + Time */}
            <View className="mt-4 flex-row gap-3">
              <InfoCard
                icon={<CalendarDays color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                label="Data"
                value={formatDateLong(event.startsAt.split("T")[0])}
              />
              <InfoCard
                icon={<Clock3 color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                label="Horário"
                value={formatTime(event.startsAt)}
              />
            </View>

            {/* Location */}
            <View className="mt-3 rounded-2xl bg-card p-3">
              <View className="flex-row items-center gap-2">
                <MapPin color={colors.mutedForeground} size={16} strokeWidth={1.5} />
                <Text className="font-medium text-xs text-muted-foreground">Local</Text>
              </View>
              <Text className="mt-1 font-semibold text-sm text-foreground">{locationLabel}</Text>
              <Text className="text-xs text-muted-foreground">{cityLabel}</Text>
            </View>

            {/* Description */}
            {event.description ? (
              <View className="mt-5">
                <Text className="font-bold text-sm text-foreground">Sobre o evento</Text>
                <Text className="mt-2 leading-6 text-sm text-muted-foreground">{event.description}</Text>
              </View>
            ) : null}

            {/* Ticket lots */}
            <View className="mt-6">
              <Text className="font-bold text-sm text-foreground">Escolha seu ingresso</Text>
              <View className="mt-3 gap-3">
                {event.ticketLots.map((lot) => {
                  const quantity = selectedLots[lot.id] ?? 0;
                  const available = lot.quantity - lot.quantitySold;
                  const soldOut = !isLotAvailable(lot);

                  return (
                    <View
                      key={lot.id}
                      className={`rounded-2xl border-2 p-4 ${quantity > 0 ? "border-primary bg-accent" : soldOut ? "border-border bg-muted opacity-50" : "border-border bg-card"}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-bold text-sm text-foreground">{lot.name}</Text>
                          {lot.description ? (
                            <Text className="mt-1 text-xs text-muted-foreground">{lot.description}</Text>
                          ) : null}
                        </View>
                        <Text className="font-bold text-sm text-primary">
                          {lot.price === 0 ? "Grátis" : formatCurrencyFromCents(lot.price)}
                        </Text>
                      </View>
                      <View className="mt-3 flex-row items-center justify-between">
                        <Text className="text-[10px] text-muted-foreground">
                          {soldOut ? "Esgotado" : `${available} disponíveis`}
                        </Text>
                        {!soldOut ? (
                          <View className="flex-row items-center gap-2 rounded-full bg-white px-2 py-1">
                            <AnimatedPressable disabled={quantity === 0} onPress={() => handleRemove(lot.id)} className="rounded-full p-1">
                              <Minus color={quantity === 0 ? colors.mutedForeground : colors.primary} size={16} strokeWidth={2} />
                            </AnimatedPressable>
                            <Text className="w-6 text-center font-semibold text-sm text-foreground">{quantity}</Text>
                            <AnimatedPressable onPress={() => handleAdd(lot.id)} className="rounded-full p-1">
                              <Plus color={colors.primary} size={16} strokeWidth={2} />
                            </AnimatedPressable>
                          </View>
                        ) : null}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        {/* Bottom CTA */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-4 pb-8 pt-4">
          <View className="flex-row items-center gap-4">
            <View>
              <Text className="text-xs text-muted-foreground">Total ({totalTickets})</Text>
              <Text className="font-extrabold text-lg text-foreground">{formatCurrencyFromCents(totalPrice)}</Text>
            </View>
            <AnimatedPressable
              className={`flex-1 rounded-2xl py-4 ${totalTickets > 0 ? "bg-primary" : "bg-primary/40"}`}
              disabled={totalTickets === 0}
              onPress={handleBuy}
            >
              <Text className="text-center font-bold text-sm text-primary-foreground">
                Comprar ingresso{totalTickets > 1 ? "s" : ""}
              </Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <View className="flex-1 rounded-2xl bg-card p-3">
    <View className="flex-row items-center gap-2">
      {icon}
      <Text className="font-medium text-xs text-muted-foreground">{label}</Text>
    </View>
    <Text className="mt-1 font-semibold text-sm text-foreground">{value}</Text>
  </View>
);

const AccordionSection = ({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
  <View className="mt-4">
    <AnimatedPressable className="flex-row items-center justify-between" onPress={onToggle}>
      <Text className="font-bold text-sm text-foreground">{title}</Text>
      {open ? <ChevronUp color={colors.mutedForeground} size={18} strokeWidth={1.5} /> : <ChevronDown color={colors.mutedForeground} size={18} strokeWidth={1.5} />}
    </AnimatedPressable>
    {open ? children : null}
  </View>
);
