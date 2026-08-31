import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  Clock,
  Heart,
  Globe,
  MapPin,
  Share2,
  Star,
  Zap,
} from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { PressScale, Text, ThemeProvider, useTheme } from "@/design-system";
import { EventDescriptionSection } from "@/features/event-detail/components/EventDescriptionSection";
import {
  EventProgramSection,
  EventScheduleModal,
  EventTermsSection,
} from "@/features/event-detail/components/EventExtras";
import { FactItem } from "@/features/event-detail/components/FactItem";
import { LotCard } from "@/features/event-detail/components/LotCard";
import { RoundButton } from "@/features/event-detail/components/RoundButton";
import { ParticipantsSection } from "@/features/event-detail/components/ParticipantsSection";
import { SpeakersSection } from "@/features/event-detail/components/SpeakersSection";
import { SponsorsCarousel } from "@/features/event-detail/components/SponsorsCarousel";
import type { EventDetailScreenProps } from "@/features/event-detail/types";
import { getEventAccentColors } from "@/utils/eventTheme";

// Abaixo desse offset de scroll, a imagem de capa (dark) já saiu praticamente toda de
// trás da status bar — troca pra ícones escuros pra não ficar branco sobre branco.
const HERO_SCROLL_THRESHOLD = 260;

const getInitialsForDisplay = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "CP";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
};

function formatBRL(cents: number) {
  return (
    "R$ " +
    (cents / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function EventDetailScreen(props: EventDetailScreenProps) {
  const accentColors = useMemo(
    () => getEventAccentColors(props.event?.accentColor),
    [props.event?.accentColor],
  );

  return (
    <ThemeProvider paletteOverride={accentColors}>
      <EventDetailScreenContent {...props} />
    </ThemeProvider>
  );
}

function EventDetailScreenContent({
  event,
  isLoading,
  isError,
  favorite = false,
  onToggleFavorite,
  onBack,
  onShare,
  onOpenMap,
  onAddToCalendar,
  onOpenOrganizer,
  onOpenOrganizerWebsite,
  onFollowOrganizer,
  onCheckout,
}: EventDetailScreenProps) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [qty, setQty] = useState<Record<string, number>>({});
  const [statusBarStyle, setStatusBarStyle] = useState<"light" | "dark">("light");
  const [scheduleVisible, setScheduleVisible] = useState(false);
  const [activeSupporterId, setActiveSupporterId] = useState<string | null>(null);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const shouldBeDark = e.nativeEvent.contentOffset.y > HERO_SCROLL_THRESHOLD;
    setStatusBarStyle((prev) => {
      const next = shouldBeDark ? "dark" : "light";
      return prev === next ? prev : next;
    });
  }, []);

  const add = useCallback(
    (id: string) => setQty((q) => ({ ...q, [id]: (q[id] ?? 0) + 1 })),
    [],
  );
  const remove = useCallback(
    (id: string) =>
      setQty((q) => ({ ...q, [id]: Math.max(0, (q[id] ?? 0) - 1) })),
    [],
  );
  const clearAll = useCallback(() => setQty({}), []);

  const { total, count } = useMemo(() => {
    if (!event) {
      return { total: 0, count: 0 };
    }

    let sum = 0;
    let selected = 0;
    for (const lot of event.lots) {
      const n = qty[lot.id] ?? 0;
      sum += lot.priceCents * n;
      selected += n;
    }
    return { total: sum, count: selected };
  }, [qty, event]);

  const hasItems = count > 0;

  if (isLoading) {
    return (
      <Screen edges={["left", "right"]}>
        <View className="flex-1">
          <Skeleton className="h-80 w-full" />
          <View className="gap-3 px-4 pt-4">
            <Skeleton className="h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-5 w-1/3 rounded-xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-20 w-full rounded-2xl" />
          </View>
        </View>
      </Screen>
    );
  }

  if (isError || !event) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-muted-foreground">
            Evento não encontrado.
          </Text>
          <AnimatedPressable className="mt-4" onPress={onBack}>
            <Text className="font-medium text-sm text-primary">Voltar</Text>
          </AnimatedPressable>
        </View>
      </Screen>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style={statusBarStyle} />

      <View
        pointerEvents="box-none"
        style={[
          styles.fixedHeader,
          {
            top: insets.top + 8,
          },
        ]}
      >
        <RoundButton label="Voltar" onPress={onBack}>
          <ChevronLeft size={22} color="#141821" strokeWidth={2} />
        </RoundButton>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <RoundButton label="Compartilhar" onPress={onShare}>
            <Share2 size={20} color="#141821" strokeWidth={1.75} />
          </RoundButton>
          <RoundButton
            label={favorite ? "Remover dos favoritos" : "Favoritar"}
            onPress={onToggleFavorite}
          >
            <Heart
              size={20}
              color={favorite ? "#E5484D" : "#141821"}
              fill={favorite ? "#E5484D" : "none"}
              strokeWidth={1.75}
            />
          </RoundButton>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 132 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={{ height: 340 }}>
          <Image
            source={event.image}
            style={[StyleSheet.absoluteFillObject as any, styles.heroImage]}
            resizeMode="contain"
          />
          <View style={[StyleSheet.absoluteFillObject, styles.heroScrim]} />

          <View
            style={{ position: "absolute", left: 20, right: 20, bottom: 18 }}
          >
            {event.hot ? (
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                <View
                  style={[styles.pill, { backgroundColor: colors.primary }]}
                >
                  <Zap size={13} color={colors.onPrimary} strokeWidth={2.5} />
                  <Text
                    token="caption"
                    color="onPrimary"
                    style={styles.pillTxt}
                  >
                    Alta procura
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        {event.sponsors && event.sponsors.length > 0 ? (
          <SponsorsCarousel
            sponsors={event.sponsors}
            backgroundColor={event.sponsorsBackgroundColor}
          />
        ) : null}

        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <Text token="titleLg" style={styles.pageTitle}>
            {event.title}
          </Text>

          {/* {event.social ? (
            <View style={[styles.socialRow, { borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                {event.social.avatars?.length ? (
                  <View style={{ flexDirection: 'row' }}>
                    {event.social.avatars.map((a, i) => (
                      <View key={i} style={[styles.avatar, { backgroundColor: a.bg, borderColor: colors.surface, marginLeft: i === 0 ? 0 : -8 }]}>
                        <Text token="caption" style={{ color: a.fg, textTransform: 'none', letterSpacing: 0, fontSize: 11 }}>{a.initials}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text token="bodySm" style={{ fontWeight: '700' }}>+{event.social.count.toLocaleString('pt-BR')} confirmados</Text>
                  {event.social.friendsText ? <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>{event.social.friendsText}</Text> : null}
                </View>
              </View>
              {event.social.rating != null ? (
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <Star size={14} color="#F5A524" fill="#F5A524" />
                    <Text token="bodySm" style={{ fontWeight: '800' }}>{event.social.rating.toLocaleString('pt-BR')}</Text>
                  </View>
                  {event.social.reviews != null ? <Text token="caption" color="muted" style={{ textTransform: 'none', letterSpacing: 0 }}>{event.social.reviews} avaliações</Text> : null}
                </View>
              ) : null}
            </View>
          ) : null} */}

          <View style={{ gap: 10, paddingVertical: 16 }}>
            <FactItem
              icon={
                <CalendarDays
                  size={19}
                  color={colors.primaryText}
                  strokeWidth={1.75}
                />
              }
              title={event.dateLabel}
              subtitle={event.timeLabel}
              actionLabel={event.daySchedules?.length ? "Ver datas" : "Lembrar"}
              onAction={event.daySchedules?.length ? () => setScheduleVisible(true) : onAddToCalendar}
              colors={colors}
            />
            <FactItem
              icon={
                <MapPin
                  size={19}
                  color={colors.primaryText}
                  strokeWidth={1.75}
                />
              }
              title={event.venueName}
              subtitle={event.address}
              actionLabel="Mapa"
              onAction={onOpenMap}
              colors={colors}
              contained
            />
          </View>

          {event.organizer ? (
            <View style={[styles.orgCard, { backgroundColor: colors.background }]}>
              <PressScale
                onPress={onOpenOrganizer}
                disabled={!onOpenOrganizer}
                accessibilityRole="button"
                accessibilityLabel={`Ver perfil de ${event.organizer.name}`}
                style={styles.organizerMainRow}
              >
                <View style={[styles.orgAvatar, { backgroundColor: colors.text }]}>
                  {event.organizer.logoUrl ? (
                    <Image source={{ uri: event.organizer.logoUrl }} resizeMode="cover" style={styles.orgLogo} />
                  ) : (
                    <Text token="subtitle" style={{ color: colors.primary, fontWeight: "800" }}>
                      {event.organizer.initials}
                    </Text>
                  )}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <Text token="body" style={{ fontWeight: "700" }}>
                      {event.organizer.name}
                    </Text>
                    {event.organizer.verified ? (
                      <BadgeCheck size={15} color={colors.primary} fill={colors.primarySoft} />
                    ) : null}
                  </View>
                  <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
                    Organizador
                    {event.organizer.eventsCount != null
                      ? ` · ${event.organizer.eventsCount} eventos realizados`
                      : ""}
                  </Text>
                </View>
                <ArrowRight size={18} color={colors.textMuted} />
              </PressScale>
              {/* <PressScale onPress={onFollowOrganizer ?? (() => {})} accessibilityRole="button" accessibilityLabel="Seguir organizador"
                style={[styles.followBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text token="label" style={{ fontSize: 12.5 }}>Seguir</Text>
              </PressScale> */}
              {event.coProducer && event.primaryOrganizer !== "CO_PRODUCER" ? (
                <View style={[styles.coProducerRow, { borderTopColor: colors.border }]}>
                  <View style={[styles.coProducerAvatar, { backgroundColor: colors.primarySoft }]}>
                    {event.coProducer.logoUrl ? (
                      <Image source={{ uri: event.coProducer.logoUrl }} resizeMode="cover" style={styles.orgLogo} />
                    ) : (
                      <Text token="label" color="primary">{getInitialsForDisplay(event.coProducer.name)}</Text>
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text token="caption" color="muted" style={styles.coProducerLabel}>Em coprodução com</Text>
                    <Text token="bodySm" style={{ fontWeight: "700" }}>{event.coProducer.name}</Text>
                  </View>
                </View>
              ) : null}

              {event.organizer.websiteUrl ? (
                <PressScale
                  onPress={onOpenOrganizerWebsite}
                  disabled={!onOpenOrganizerWebsite}
                  accessibilityRole="link"
                  accessibilityLabel={event.organizer.websiteLabel || "Visitar site"}
                  style={[styles.organizerWebsiteButton, { borderColor: colors.primary }]}
                >
                  <Globe size={17} color={colors.primaryText} />
                  <Text token="label" color="primary">
                    {event.organizer.websiteLabel?.trim() || "Visitar site"}
                  </Text>
                </PressScale>
              ) : null}
            </View>
          ) : null}

          <EventDescriptionSection description={event.about} colors={colors} radius={radius} />

          {event.schedule ? <EventProgramSection schedule={event.schedule} colors={colors} radius={radius} /> : null}

          {event.speakers && event.speakers.length > 0 ? (
            <SpeakersSection speakers={event.speakers} colors={colors} radius={radius} />
          ) : null}

          {event.showParticipants ? <ParticipantsSection eventId={event.id} /> : null}

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <Text token="subtitle" style={{ fontWeight: "800" }}>
              Escolha seu ingresso
            </Text>
            {/* {event.lotDeadlineText ? (
              <View style={[styles.deadline, { backgroundColor: colors.warningSoft }]}>
                <Clock size={13} color={colors.warning} strokeWidth={2} />
                <Text token="caption" style={{ color: colors.warning, textTransform: 'none', letterSpacing: 0, fontSize: 11.5 }}>{event.lotDeadlineText}</Text>
              </View>
            ) : null} */}
          </View>

          <View style={{ gap: 12, marginTop: 12 }}>
            {event.lots.map((lot) => (
              <LotCard
                key={lot.id}
                lot={lot}
                qty={qty[lot.id] ?? 0}
                onAdd={() => add(lot.id)}
                onRemove={() => remove(lot.id)}
                colors={colors}
                radius={radius}
              />
            ))}
          </View>

        </View>

        {event.terms && event.terms.length > 0 ? (
          <View style={styles.bottomSectionContent}>
            <EventTermsSection terms={event.terms} colors={colors} radius={radius} />
          </View>
        ) : null}

        {event.supporters && event.supporters.length > 0 ? (
          <View
            style={[
              styles.supportersSection,
              {
                backgroundColor: colors.surface,
                borderTopColor: colors.border,
              },
            ]}
          >
            <Text token="caption" color="muted" style={styles.supportersTitle}>
              Apoio
            </Text>
            <ScrollView
              accessibilityLabel="Logos de apoiadores do evento"
              accessibilityRole="summary"
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.supportersRow}
            >
              {event.supporters.map((supporter) => (
                <Pressable
                  key={supporter.id}
                  accessibilityRole="image"
                  accessibilityLabel={supporter.name}
                  onHoverIn={() => setActiveSupporterId(supporter.id)}
                  onHoverOut={() => setActiveSupporterId(null)}
                  onPressIn={() => setActiveSupporterId(supporter.id)}
                  onPressOut={() => setActiveSupporterId(null)}
                  style={[
                    styles.supporterLogoContainer,
                    activeSupporterId === supporter.id
                      ? null
                      : styles.supporterLogoMonochrome,
                  ]}
                >
                  <Image
                    source={{ uri: supporter.logoUrl }}
                    resizeMode="contain"
                    style={styles.supporterLogo}
                  />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <EventScheduleModal
        visible={scheduleVisible}
        days={event.daySchedules ?? []}
        onClose={() => setScheduleVisible(false)}
        colors={colors}
        radius={radius}
      />

      <View
        style={[
          styles.ctaBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + 14,
          },
        ]}
      >
        {hasItems ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text
              token="caption"
              color="muted"
              style={{ textTransform: "none", letterSpacing: 0 }}
            >
              {count}{" "}
              {count === 1 ? "ingresso selecionado" : "ingressos selecionados"}
            </Text>
            <Pressable onPress={clearAll} hitSlop={8}>
              <Text
                token="caption"
                color="muted"
                style={{
                  textTransform: "none",
                  letterSpacing: 0,
                  fontWeight: "700",
                }}
              >
                Limpar
              </Text>
            </Pressable>
          </View>
        ) : null}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View>
            <Text
              token="caption"
              color="muted"
              style={{
                textTransform: "none",
                letterSpacing: 0,
                fontWeight: "600",
              }}
            >
              Total
            </Text>
            <Text token="titleLg" style={{ fontSize: 22 }}>
              {formatBRL(total)}
            </Text>
          </View>
          <PressScale
            onPress={() => hasItems && onCheckout?.(qty, total)}
            disabled={!hasItems}
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasItems }}
            accessibilityLabel={
              hasItems ? "Continuar para o checkout" : "Selecione um ingresso"
            }
            style={[
              styles.cta,
              {
                backgroundColor: hasItems ? colors.primary : colors.surfaceAlt,
              },
            ]}
          >
            <Text
              token="label"
              style={{
                fontSize: 15,
                color: hasItems ? colors.onPrimary : colors.textMuted,
              }}
            >
              {hasItems ? "Continuar" : "Selecione um ingresso"}
            </Text>
            {hasItems ? (
              <ArrowRight
                size={19}
                color={colors.onPrimary}
                strokeWidth={2.5}
              />
            ) : null}
          </PressScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fixedHeader: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 20,
    elevation: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroScrim: { backgroundColor: "transparent" },
  heroImage: {
    alignSelf: "center",
  },
  supportersSection: {
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingTop: 24,
  },
  supportersTitle: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    marginBottom: 16,
    textAlign: "center",
    textTransform: "uppercase",
  },
  supportersRow: {
    alignItems: "center",
    flexDirection: "row",
    flexGrow: 1,
    gap: 8,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  supporterLogoContainer: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 88,
  },
  supporterLogo: {
    height: "100%",
    width: "100%",
  },
  supporterLogoMonochrome: {
    filter: [{ grayscale: 1 }],
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillTxt: {
    textTransform: "none",
    letterSpacing: 0,
    fontSize: 12,
    fontWeight: "700",
  },
  pageTitle: { fontSize: 25, marginBottom: 12 },
  socialRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  orgCard: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 20,
  },
  organizerMainRow: { alignItems: "center", flexDirection: "row", gap: 12 },
  orgAvatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  orgLogo: { height: "100%", width: "100%" },
  coProducerRow: { alignItems: "center", borderTopWidth: 1, flexDirection: "row", gap: 10, marginTop: 12, paddingTop: 12, width: "100%" },
  coProducerAvatar: { alignItems: "center", borderRadius: 999, height: 34, justifyContent: "center", overflow: "hidden", width: 34 },
  coProducerLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 0.5, textTransform: "uppercase" },
  organizerWebsiteButton: { alignItems: "center", borderRadius: 999, borderWidth: 1, flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 12, minHeight: 44, paddingHorizontal: 16 },
  followBtn: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  deadline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  bottomSectionContent: { paddingHorizontal: 20 },
  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  cta: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
});
