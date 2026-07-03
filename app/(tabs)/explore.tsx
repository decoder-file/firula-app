/**
 * Firula — Explorar redesenhada (mapeia para app/(tabs)/explore.tsx)
 * Construída sobre o Design System. Busca + filtros de esporte + lista de cards compactos.
 *
 * Dados por props para desacoplar da camada de dados. No app, monte os `ExploreEvent`
 * a partir de useUpcomingEvents({ search, sportSlug }) + platformEventToCardItem.
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
  Search,
  X,
  ArrowDownUp,
  CalendarDays,
  MapPin,
  Users,
  Flame,
  SearchX,
} from "lucide-react-native";
import { Button, Text, useTheme } from "@/design-system";
import { useUpcomingEvents } from "@/hooks/useEvents";
import type { PlatformEvent } from "@/services/events.service";

export interface ExploreEvent {
  id: string;
  type: string;
  category: string;
  title: string;
  city: string;
  dateLabel: string;
  price: string;
  attendeesLabel: string;
  hot: boolean;
  image: ImageSourcePropType;
}

const CATEGORIES = [
  { id: "todos", label: "Todos" },
  { id: "futebol", label: "Futebol" },
  { id: "futevolei", label: "Futevôlei" },
  { id: "beach-tennis", label: "Beach" },
  { id: "corrida", label: "Corrida" },
  { id: "surf", label: "Surf" },
  { id: "yoga", label: "Yoga" },
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

const formatDateLabel = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

const mapEventToExploreItem = (event: PlatformEvent): ExploreEvent => {
  const category = inferCategoryFromName(event.name);
  return {
    id: event.slug ?? event.id,
    type: CATEGORY_TYPE_LABEL[category] ?? "Evento",
    category,
    title: event.name,
    city: `${event.location.city}, ${event.location.state}`,
    dateLabel: formatDateLabel(event.startsAt),
    price: "A confirmar",
    attendeesLabel: event.organization.tradeName,
    hot: event.isTrending || event.isFeatured,
    image: event.coverUrl ? { uri: event.coverUrl } : FALLBACK_EVENT_IMAGE,
  };
};

export interface ExploreScreenProps {
  events: ExploreEvent[];
  onOpenEvent?: (id: string) => void;
}

export function ExploreScreen({ events, onOpenEvent }: ExploreScreenProps) {
  const { colors, radius } = useTheme();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("todos");

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    let list = events;
    if (cat !== "todos") list = list.filter((e) => e.category === cat);
    if (q)
      list = list.filter((e) =>
        `${e.title} ${e.type} ${e.city}`.toLowerCase().includes(q),
      );
    return list;
  }, [events, cat, q]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      {/* Header + busca */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingHorizontal: 20,
          paddingTop: 14,
          paddingBottom: 6,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text token="titleLg" style={{ fontSize: 24 }}>
          Explorar
        </Text>
        <Text token="bodySm" color="muted" style={{ marginTop: 2 }}>
          Descubra eventos esportivos perto de você
        </Text>
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
            strokeWidth={1.75}
            style={{ position: "absolute", left: 16, zIndex: 1 }}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Esporte, local ou cidade"
            placeholderTextColor={colors.textMuted}
            accessibilityLabel="Buscar"
            accessibilityRole="search"
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
              onPress={() => setQuery("")}
              hitSlop={8}
              accessibilityLabel="Limpar busca"
              style={[styles.clear, { backgroundColor: colors.border }]}
            >
              <X size={16} color={colors.text} strokeWidth={2} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {/* Chips de esporte */}
      <View style={{ backgroundColor: colors.surface }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 14,
            gap: 8,
          }}
        >
          {CATEGORIES.map((c) => {
            const on = c.id === cat;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCat(c.id)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                accessibilityLabel={c.label}
                style={{
                  height: 38,
                  justifyContent: "center",
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor: on ? colors.primary : colors.surface,
                  borderColor: on ? colors.primary : colors.border,
                }}
              >
                <Text
                  token="label"
                  style={{
                    fontSize: 13,
                    color: on ? colors.onPrimary : colors.textMuted,
                  }}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingHorizontal: 20,
            paddingTop: 10,
          }}
        >
          <Text token="bodySm" color="muted" style={{ fontWeight: "700" }}>
            {results.length} {results.length === 1 ? "evento" : "eventos"}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ordenar por data"
            style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
          >
            <ArrowDownUp size={15} color={colors.text} strokeWidth={2} />
            <Text token="label" style={{ fontSize: 13 }}>
              Data
            </Text>
          </Pressable>
        </View>

        {results.length > 0 ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}>
            {results.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => onOpenEvent?.(e.id)}
                accessibilityRole="button"
                accessibilityLabel={`${e.title}, ${e.dateLabel}, ${e.city}, ${e.price}`}
                style={{
                  flexDirection: "row",
                  gap: 14,
                  alignItems: "center",
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: radius.xl,
                  padding: 12,
                }}
              >
                <View>
                  <Image
                    source={e.image}
                    style={{ width: 88, height: 88, borderRadius: 14 }}
                  />
                  {e.hot ? (
                    <View style={styles.hot}>
                      <Flame size={11} color="#FFB86B" strokeWidth={2} />
                      <Text
                        token="caption"
                        style={{
                          color: "#fff",
                          fontSize: 9,
                          textTransform: "none",
                          letterSpacing: 0,
                        }}
                      >
                        Alta
                      </Text>
                    </View>
                  ) : null}
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View
                    style={[
                      styles.typeOutline,
                      {
                        borderColor: "#A8EBC6",
                        backgroundColor: colors.primarySoft,
                      },
                    ]}
                  >
                    <Text
                      token="caption"
                      color="primary"
                      style={{
                        fontSize: 10,
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      {e.type}
                    </Text>
                  </View>
                  <Text
                    token="subtitle"
                    style={{ fontSize: 14.5, marginTop: 5 }}
                    numberOfLines={2}
                  >
                    {e.title}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      marginTop: 6,
                      marginBottom: 8,
                    }}
                  >
                    <CalendarDays
                      size={13}
                      color={colors.textMuted}
                      strokeWidth={1.5}
                    />
                    <Text token="bodySm" color="muted">
                      {e.dateLabel}
                    </Text>
                    <Text token="bodySm" color="muted">
                      ·
                    </Text>
                    <MapPin
                      size={13}
                      color={colors.textMuted}
                      strokeWidth={1.5}
                    />
                    <Text
                      token="bodySm"
                      color="muted"
                      numberOfLines={1}
                      style={{ flexShrink: 1 }}
                    >
                      {e.city}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      token="label"
                      color="primary"
                      style={{ fontSize: 15 }}
                    >
                      {e.price}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Users
                        size={12}
                        color={colors.textMuted}
                        strokeWidth={2}
                      />
                      <Text
                        token="caption"
                        color="muted"
                        style={{ textTransform: "none", letterSpacing: 0 }}
                      >
                        {e.attendeesLabel}
                      </Text>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingHorizontal: 20,
              paddingTop: 24,
            }}
          >
            <View
              style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}
            >
              <SearchX size={30} color={colors.textMuted} strokeWidth={1.75} />
            </View>
            <Text token="title" style={{ marginBottom: 4 }}>
              Nenhum evento
            </Text>
            <Text
              token="bodySm"
              color="muted"
              style={{ textAlign: "center", maxWidth: 220, marginBottom: 16 }}
            >
              Tente outro esporte, cidade ou remova a busca.
            </Text>
            <Button
              label="Limpar filtros"
              onPress={() => {
                setQuery("");
                setCat("todos");
              }}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  clear: {
    position: "absolute",
    right: 7,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  hot: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(20,24,33,0.72)",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  typeOutline: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
});

export default function ExploreRoute() {
  const router = useRouter();
  const { data } = useUpcomingEvents({ period: "upcoming", page: 1, pageSize: 50 });

  const events = useMemo(
    () => (data?.data ?? []).map(mapEventToExploreItem),
    [data?.data],
  );

  return (
    <ExploreScreen
      events={events}
      onOpenEvent={(slugOrId) => router.push(`/event/${slugOrId}`)}
    />
  );
}
