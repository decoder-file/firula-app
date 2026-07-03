/**
 * Firula — Home redesenhada (mapeia para app/(tabs)/index.tsx)
 * Construída sobre o Design System. Mantém a estrutura de conteúdo atual
 * (Destaques, Categorias, Em alta, Próximos) com hierarquia e navegação melhores.
 *
 * Dados: use os hooks reais do app (useFeaturedEvents, useTrendingEvents,
 * useUpcomingEvents) — aqui eles entram por props/adaptadores para manter o
 * arquivo focado na camada visual. Substitua os `HomeEvent` pelo seu
 * platformEventToCardItem + campos (price, attendees, day/mon).
 */

import React, { useMemo, useState } from "react";
import { useRouter } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ImageSourcePropType,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  Search,
  X,
  ChevronDown,
  MapPin,
  CalendarDays,
  Users,
  Heart,
  Flame,
  SearchX,
  LayoutGrid,
  Goal,
  Volleyball,
  Grip,
  Footprints,
  Waves,
  Flower2,
  type LucideIcon,
} from "lucide-react-native";
import { Avatar, Button, Text, useTheme } from "@/design-system";
import { useMe } from "@/hooks/useAuth";
import {
  useFeaturedEvents,
  useTrendingEvents,
  useUpcomingEvents,
} from "@/hooks/useEvents";
import { useUnreadCount } from "@/hooks/useNotifications";
import type { PlatformEvent } from "@/services/events.service";

// ─────────────────────────────────────────────────────────────── tipos + dados

export interface HomeEvent {
  id: string;
  type: string; // ex.: "Beach Tennis"
  category: string; // slug: "beach-tennis"
  title: string;
  city: string;
  dateLabel: string; // "15 abr"
  day: string; // "15"
  mon: string; // "ABR"
  price: string; // "R$ 45"
  attendeesLabel: string; // "342 indo"
  hot: boolean;
  image: ImageSourcePropType;
}

const CATEGORIES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "todos", label: "Todos", icon: LayoutGrid },
  { id: "futebol", label: "Futebol", icon: Goal },
  { id: "futevolei", label: "Futevôlei", icon: Volleyball },
  { id: "beach-tennis", label: "Beach", icon: Grip },
  { id: "corrida", label: "Corrida", icon: Footprints },
  { id: "surf", label: "Surf", icon: Waves },
  { id: "yoga", label: "Yoga", icon: Flower2 },
];

const FALLBACK_EVENT_IMAGE = require("../../assets/events/event-running.jpg");

const CATEGORY_TYPE_LABEL: Record<string, string> = {
  futebol: "Futebol",
  futevolei: "Futevôlei",
  "beach-tennis": "Beach Tennis",
  corrida: "Corrida",
  surf: "Surf",
  yoga: "Yoga",
};

const inferCategoryFromName = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("beach")) return "beach-tennis";
  if (n.includes("futev") || n.includes("futv")) return "futevolei";
  if (n.includes("futebol") || n.includes("soccer")) return "futebol";
  if (n.includes("corrida") || n.includes("run") || n.includes("marat")) return "corrida";
  if (n.includes("surf")) return "surf";
  if (n.includes("yoga")) return "yoga";
  return "todos";
};

const formatDateBits = (isoDate: string) => {
  const date = new Date(isoDate);
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit" });
  const mon = date
    .toLocaleDateString("pt-BR", { month: "short" })
    .replace(".", "")
    .toUpperCase();
  const dateLabel = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return { day, mon, dateLabel };
};

const mapEventToHomeItem = (
  event: PlatformEvent,
  isHot: boolean,
): HomeEvent => {
  const category = inferCategoryFromName(event.name);
  const { day, mon, dateLabel } = formatDateBits(event.startsAt);
  return {
    id: event.slug ?? event.id,
    type: CATEGORY_TYPE_LABEL[category] ?? "Evento",
    category,
    title: event.name,
    city: `${event.location.city}, ${event.location.state}`,
    dateLabel,
    day,
    mon,
    price: "A confirmar",
    attendeesLabel: event.organization.tradeName,
    hot: isHot,
    image: event.coverUrl ? { uri: event.coverUrl } : FALLBACK_EVENT_IMAGE,
  };
};

export interface HomeScreenProps {
  userName: string;
  city: string;
  events: HomeEvent[];
  notificationCount?: number;
  onOpenNotifications?: () => void;
  onChangeCity?: () => void;
  onOpenEvent?: (id: string) => void;
  onSeeAll?: () => void;
}

// ─────────────────────────────────────────────────────────────── tela

export function HomeScreen({
  userName,
  city,
  events,
  notificationCount = 0,
  onOpenNotifications,
  onChangeCity,
  onOpenEvent,
  onSeeAll,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("todos");

  const q = query.trim().toLowerCase();
  const isFiltering = cat !== "todos";
  const showSections = q.length === 0 && !isFiltering;

  const grid = useMemo(() => {
    let list = events;
    if (isFiltering) list = list.filter((e) => e.category === cat);
    if (q)
      list = list.filter((e) =>
        `${e.title} ${e.type} ${e.city}`.toLowerCase().includes(q),
      );
    return list;
  }, [events, cat, q, isFiltering]);

  const featured = useMemo(() => events.filter((e) => e.hot), [events]);
  const trending = featured.slice(0, 3);
  const activeCat = CATEGORIES.find((c) => c.id === cat);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      {/* Header fixo */}
      <HomeHeader
        userName={userName}
        city={city}
        query={query}
        onQuery={setQuery}
        notificationCount={notificationCount}
        onOpenNotifications={onOpenNotifications}
        onChangeCity={onChangeCity}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <CategoryRail active={cat} onSelect={setCat} />

        {showSections ? (
          <>
            <SectionHeader title="Destaques" onSeeAll={onSeeAll} />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hpad}
            >
              {featured.map((e) => (
                <FeaturedCard
                  key={e.id}
                  event={e}
                  onPress={() => onOpenEvent?.(e.id)}
                />
              ))}
            </ScrollView>

            <SectionHeader title="Em alta 🔥" onSeeAll={onSeeAll} />
            <View style={{ paddingHorizontal: 20, gap: 12 }}>
              {trending.map((e, i) => (
                <TrendingRow
                  key={e.id}
                  rank={i + 1}
                  event={e}
                  onPress={() => onOpenEvent?.(e.id)}
                />
              ))}
            </View>
          </>
        ) : null}

        {isFiltering ? (
          <View style={styles.activeFilter}>
            {activeCat ? (
              <activeCat.icon
                size={15}
                color={colors.onPrimary}
                strokeWidth={2}
              />
            ) : null}
            <Text token="label" style={{ color: colors.onPrimary }}>
              {activeCat?.label}
            </Text>
            <Pressable onPress={() => setCat("todos")} hitSlop={8}>
              <Text token="bodySm" color="muted" style={{ fontWeight: "600" }}>
                Limpar
              </Text>
            </Pressable>
          </View>
        ) : null}

        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <Text token="titleLg">
            {q
              ? "Resultados"
              : isFiltering
                ? activeCat?.label
                : "Próximos eventos"}
          </Text>
          {grid.length > 0 ? (
            <View style={styles.grid}>
              {grid.map((e) => (
                <View key={e.id} style={{ width: "48%" }}>
                  <GridCard event={e} onPress={() => onOpenEvent?.(e.id)} />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.empty}>
              <View
                style={[
                  styles.emptyIcon,
                  { backgroundColor: colors.surfaceAlt },
                ]}
              >
                <SearchX
                  size={30}
                  color={colors.textMuted}
                  strokeWidth={1.75}
                />
              </View>
              <Text token="title" style={{ marginBottom: 4 }}>
                Nada por aqui
              </Text>
              <Text
                token="bodySm"
                color="muted"
                style={{ textAlign: "center", maxWidth: 220, marginBottom: 16 }}
              >
                Tente outra busca ou remova o filtro de categoria.
              </Text>
              <Button
                label="Limpar tudo"
                onPress={() => {
                  setQuery("");
                  setCat("todos");
                }}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────── sub-componentes

function HomeHeader({
  userName,
  city,
  query,
  onQuery,
  notificationCount,
  onOpenNotifications,
  onChangeCity,
}: {
  userName: string;
  city: string;
  query: string;
  onQuery: (v: string) => void;
  notificationCount: number;
  onOpenNotifications?: () => void;
  onChangeCity?: () => void;
}) {
  const { colors, iconStrokeWidth } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={userName} size="md" />
        <View style={{ flex: 1 }}>
          <Text token="bodySm" color="muted" style={{ fontWeight: "500" }}>
            Olá, {userName.split(" ")[0]} 👋
          </Text>
          <Pressable
            onPress={onChangeCity}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            accessibilityRole="button"
            accessibilityLabel={`Cidade: ${city}. Toque para mudar.`}
          >
            <MapPin size={14} color={colors.primaryText} strokeWidth={2} />
            <Text token="label" style={{ fontSize: 14 }}>
              {city}
            </Text>
            <ChevronDown
              size={15}
              color={colors.textMuted}
              strokeWidth={iconStrokeWidth}
            />
          </Pressable>
        </View>
        <Pressable
          onPress={onOpenNotifications}
          accessibilityRole="button"
          accessibilityLabel={
            notificationCount
              ? `Notificações, ${notificationCount} novas`
              : "Notificações"
          }
          style={[styles.bellBtn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Bell size={21} color={colors.text} strokeWidth={iconStrokeWidth} />
          {notificationCount > 0 ? (
            <View
              style={[
                styles.bellBadge,
                { backgroundColor: colors.error, borderColor: colors.surface },
              ]}
            >
              <Text
                token="caption"
                style={{ color: "#fff", fontSize: 9, letterSpacing: 0 }}
              >
                {notificationCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      <View
        style={{
          marginTop: 12,
          position: "relative",
          justifyContent: "center",
        }}
      >
        <Search
          size={20}
          color={colors.textMuted}
          strokeWidth={iconStrokeWidth}
          style={{ position: "absolute", left: 16, zIndex: 1 }}
        />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Buscar eventos, esportes, locais…"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Buscar"
          style={{
            height: 48,
            borderRadius: 999,
            backgroundColor: colors.surfaceAlt,
            paddingHorizontal: 48,
            fontFamily: "PlusJakartaSans-Regular",
            fontSize: 14.5,
            color: colors.text,
          }}
        />
        {query.length > 0 ? (
          <Pressable
            onPress={() => onQuery("")}
            hitSlop={8}
            accessibilityLabel="Limpar busca"
            style={[styles.clearBtn, { backgroundColor: colors.border }]}
          >
            <X size={16} color={colors.text} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function CategoryRail({
  active,
  onSelect,
}: {
  active: string;
  onSelect: (id: string) => void;
}) {
  const { colors, radius } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 4,
        gap: 10,
      }}
    >
      {CATEGORIES.map((c) => {
        const on = c.id === active;
        return (
          <Pressable
            key={c.id}
            onPress={() => onSelect(c.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: on }}
            accessibilityLabel={c.label}
            style={{ alignItems: "center", gap: 7, width: 62 }}
          >
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: radius.xl,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? colors.primary : colors.surfaceAlt,
                borderWidth: 1.5,
                borderColor: on ? colors.primary : colors.border,
              }}
            >
              <c.icon
                size={24}
                color={on ? colors.onPrimary : colors.text}
                strokeWidth={1.75}
              />
            </View>
            <Text
              token="caption"
              style={{
                fontSize: 11,
                textTransform: "none",
                letterSpacing: 0,
                color: on ? colors.primaryText : colors.textMuted,
                fontWeight: on ? "700" : "500",
              }}
            >
              {c.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function SectionHeader({
  title,
  onSeeAll,
}: {
  title: string;
  onSeeAll?: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        marginTop: 20,
      }}
    >
      <Text token="titleLg">{title}</Text>
      {onSeeAll ? (
        <Pressable onPress={onSeeAll} hitSlop={8}>
          <Text token="label" color="primary">
            Ver todos
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function FeaturedCard({
  event,
  onPress,
}: {
  event: HomeEvent;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.dateLabel}, ${event.city}, a partir de ${event.price}`}
      style={styles.featured}
    >
      <Image
        source={event.image}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(20,24,33,0.32)" },
        ]}
      />
      <View style={styles.featTop}>
        <View style={styles.dateBadge}>
          <Text token="titleLg" style={{ fontSize: 20, lineHeight: 22 }}>
            {event.day}
          </Text>
          <Text token="caption" color="primary">
            {event.mon}
          </Text>
        </View>
        {event.hot ? (
          <View style={styles.hotPill}>
            <Flame size={13} color="#FFB86B" strokeWidth={2} />
            <Text
              token="caption"
              style={{
                color: "#fff",
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 10.5,
              }}
            >
              Em alta
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.featBottom}>
        <View style={[styles.typePill, { backgroundColor: colors.primary }]}>
          <Text
            token="caption"
            style={{ color: colors.onPrimary, fontSize: 10 }}
          >
            {event.type.toUpperCase()}
          </Text>
        </View>
        <Text
          token="title"
          style={{ color: "#fff", marginTop: 8 }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
          }}
        >
          <MapPin size={14} color="rgba(255,255,255,0.8)" strokeWidth={2} />
          <Text token="bodySm" style={{ color: "rgba(255,255,255,0.85)" }}>
            {event.city}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Users size={15} color="rgba(255,255,255,0.85)" strokeWidth={2} />
            <Text
              token="bodySm"
              style={{ color: "rgba(255,255,255,0.9)", fontWeight: "600" }}
            >
              {event.attendeesLabel}
            </Text>
          </View>
          <View style={styles.pricePill}>
            <Text
              token="caption"
              color="muted"
              style={{ textTransform: "none", letterSpacing: 0, fontSize: 10 }}
            >
              a partir de
            </Text>
            <Text token="label" style={{ fontSize: 15 }}>
              {event.price}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function TrendingRow({
  rank,
  event,
  onPress,
}: {
  rank: number;
  event: HomeEvent;
  onPress?: () => void;
}) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${rank}º em alta: ${event.title}, ${event.dateLabel}, ${event.attendeesLabel}`}
      style={[
        styles.trend,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.xl,
        },
      ]}
    >
      <View>
        <Image
          source={event.image}
          style={{ width: 84, height: 84, borderRadius: 14 }}
        />
        <View
          style={[
            styles.rank,
            { backgroundColor: colors.primary, borderColor: colors.surface },
          ]}
        >
          <Text token="label" style={{ color: colors.onPrimary, fontSize: 12 }}>
            {rank}
          </Text>
        </View>
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={[
            styles.typeOutline,
            { borderColor: "#A8EBC6", backgroundColor: colors.primarySoft },
          ]}
        >
          <Text
            token="caption"
            color="primary"
            style={{ textTransform: "none", letterSpacing: 0, fontSize: 10 }}
          >
            {event.type}
          </Text>
        </View>
        <Text
          token="subtitle"
          style={{ fontSize: 14.5, marginTop: 5 }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginTop: 6,
          }}
        >
          <CalendarDays size={13} color={colors.textMuted} strokeWidth={1.5} />
          <Text token="bodySm" color="muted">
            {event.dateLabel}
          </Text>
          <Text token="bodySm" color="muted">
            ·
          </Text>
          <Users size={13} color={colors.textMuted} strokeWidth={1.5} />
          <Text token="bodySm" color="muted">
            {event.attendeesLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function GridCard({
  event,
  onPress,
}: {
  event: HomeEvent;
  onPress?: () => void;
}) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.dateLabel}, ${event.price}`}
      style={{
        borderRadius: radius.xl,
        overflow: "hidden",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ height: 120 }}>
        <Image
          source={event.image}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.favBtn}>
          <Heart size={17} color={colors.text} strokeWidth={2} />
        </View>
        <View style={styles.gridType}>
          <Text
            token="caption"
            style={{
              color: "#fff",
              textTransform: "none",
              letterSpacing: 0,
              fontSize: 10.5,
            }}
          >
            {event.type}
          </Text>
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <Text
          token="subtitle"
          style={{ fontSize: 13.5, height: 34 }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 7,
          }}
        >
          <CalendarDays size={12} color={colors.textMuted} strokeWidth={1.5} />
          <Text token="bodySm" color="muted" style={{ fontSize: 11.5 }}>
            {event.dateLabel}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text token="label" color="primary">
            {event.price}
          </Text>
          <Text
            token="caption"
            color="muted"
            style={{ textTransform: "none", letterSpacing: 0 }}
          >
            {event.city.split(",")[0]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hpad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 14 },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadge: {
    position: "absolute",
    top: 8,
    right: 9,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtn: {
    position: "absolute",
    right: 7,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  activeFilter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  grid: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  empty: { marginTop: 24, alignItems: "center", padding: 20 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  featured: {
    width: 300,
    height: 340,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#141821",
  },
  featTop: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  dateBadge: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 52,
  },
  hotPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  typePill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pricePill: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  trend: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    borderWidth: 1,
    padding: 12,
  },
  rank: {
    position: "absolute",
    top: -6,
    left: -6,
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  typeOutline: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridType: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(20,24,33,0.7)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
});

export default function HomeRoute() {
  const router = useRouter();
  const { data: me } = useMe();
  const { data: featuredData } = useFeaturedEvents();
  const { data: trendingData } = useTrendingEvents();
  const { data: upcomingData } = useUpcomingEvents({ period: "upcoming", page: 1, pageSize: 50 });
  const { data: unreadCount } = useUnreadCount();

  const events = useMemo(() => {
    const featured = featuredData ?? [];
    const trending = trendingData ?? [];
    const upcoming = upcomingData?.data ?? [];

    const hotIds = new Set(
      [...featured, ...trending]
        .map((event) => event.id),
    );

    const uniqueById = new Map<string, PlatformEvent>();
    [...featured, ...trending, ...upcoming].forEach((event) => {
      if (!uniqueById.has(event.id)) {
        uniqueById.set(event.id, event);
      }
    });

    return Array.from(uniqueById.values()).map((event) =>
      mapEventToHomeItem(event, hotIds.has(event.id) || event.isTrending || event.isFeatured),
    );
  }, [featuredData, trendingData, upcomingData?.data]);

  return (
    <HomeScreen
      userName={me?.name || "Atleta"}
      city="Brasil"
      events={events}
      notificationCount={unreadCount ?? 0}
      onOpenNotifications={() => router.push("/notifications")}
      onOpenEvent={(slugOrId) => router.push(`/event/${slugOrId}`)}
      onSeeAll={() => router.push("/(tabs)/explore")}
    />
  );
}
