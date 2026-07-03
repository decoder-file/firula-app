import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SearchX } from "lucide-react-native";

import { Button, Text, useTheme } from "@/design-system";
import { CATEGORIES } from "@/features/home/constants";
import { CategoryRail } from "@/features/home/components/CategoryRail";
import { GridCard, FeaturedCard, TrendingRow } from "@/features/home/components/EventCards";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { SectionHeader } from "@/features/home/components/SectionHeader";
import type { HomeScreenProps } from "@/features/home/types";

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
  const ActiveCatIcon = activeCat?.icon;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

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
            {ActiveCatIcon ? (
              <ActiveCatIcon
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

const styles = StyleSheet.create({
  hpad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 14 },
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
});
