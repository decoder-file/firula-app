import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { Button, Skeleton, Text, useTheme } from "@/design-system";
import { HOME_DEFAULT_CATEGORIES } from "@/features/home/constants";
import { CategoryRail } from "@/features/home/components/CategoryRail";
import {
  FeaturedCard,
  TrendingRow,
} from "@/features/home/components/EventCards";
import { HomeHeader } from "@/features/home/components/HomeHeader";
import { SectionHeader } from "@/features/home/components/SectionHeader";
import type { HomeScreenProps } from "@/features/home/types";

export function HomeScreen({
  userName,
  city,
  events,
  categories = HOME_DEFAULT_CATEGORIES,
  query: controlledQuery,
  selectedCategory: controlledCategory,
  onQueryChange,
  onCategoryChange,
  searchResults,
  isSearchLoading = false,
  isSearchFetchingMore = false,
  canLoadMoreSearchResults = false,
  onLoadMoreSearchResults,
  isLoading = false,
  notificationCount = 0,
  onOpenNotifications,
  onChangeCity,
  onOpenEvent,
  onSeeAll,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const [internalQuery, setInternalQuery] = useState("");
  const [internalCategory, setInternalCategory] = useState("todos");

  const query = controlledQuery ?? internalQuery;
  const cat = controlledCategory ?? internalCategory;
  const setQuery = onQueryChange ?? setInternalQuery;
  const setCat = onCategoryChange ?? setInternalCategory;

  const q = query.trim().toLowerCase();
  const isSearchMode = q.length > 0;
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
  const activeCat = categories.find((c) => c.id === cat);
  const ActiveCatIcon = activeCat?.icon;
  const effectiveSearchResults = searchResults ?? grid;

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
        {isLoading ? (
          <HomeContentSkeleton />
        ) : (
          <>
            <CategoryRail categories={categories} active={cat} onSelect={setCat} />

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

                <SectionHeader title="Em alta" onSeeAll={onSeeAll} />
                <View style={{ paddingHorizontal: 20, marginTop: 12, gap: 12 }}>
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

            {isSearchMode ? (
              <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
                <SectionHeader title="Resultados" />

                {isSearchLoading ? (
                  <View style={{ marginTop: 12, gap: 12 }}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <View
                        key={i}
                        style={{
                          height: 110,
                          borderRadius: 20,
                          borderWidth: 1,
                          borderColor: colors.border,
                          backgroundColor: colors.surface,
                          padding: 12,
                          flexDirection: "row",
                          gap: 12,
                          alignItems: "center",
                        }}
                      >
                        <Skeleton width={84} height={84} radius={14} />
                        <View style={{ flex: 1 }}>
                          <Skeleton width={70} height={18} radius={999} />
                          <Skeleton width="85%" height={18} radius={7} style={{ marginTop: 10 }} />
                          <Skeleton width="70%" height={16} radius={7} style={{ marginTop: 8 }} />
                          <Skeleton width="55%" height={16} radius={7} style={{ marginTop: 8 }} />
                        </View>
                      </View>
                    ))}
                  </View>
                ) : effectiveSearchResults.length > 0 ? (
                  <View style={{ marginTop: 12, gap: 12 }}>
                    {effectiveSearchResults.map((e, i) => (
                      <TrendingRow
                        key={e.id}
                        rank={i + 1}
                        event={e}
                        onPress={() => onOpenEvent?.(e.id)}
                      />
                    ))}

                    {canLoadMoreSearchResults ? (
                      <View style={{ marginTop: 8, alignItems: "center" }}>
                        <Button
                          label={isSearchFetchingMore ? "Carregando..." : "Carregar mais"}
                          onPress={onLoadMoreSearchResults}
                        />
                      </View>
                    ) : null}
                  </View>
                ) : (
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 16,
                      backgroundColor: colors.surface,
                      padding: 16,
                      marginTop: 12,
                    }}
                  >
                    <Text token="subtitle">Nenhum resultado encontrado</Text>
                    <Text token="bodySm" color="muted" style={{ marginTop: 6 }}>
                      Ajuste sua busca ou troque o esporte selecionado.
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function HomeContentSkeleton() {
  const { colors } = useTheme();

  return (
    <View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
          gap: 12,
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={{ width: 62, alignItems: "center", gap: 8 }}>
            <Skeleton width={58} height={58} radius={18} />
            <Skeleton width={50} height={10} radius={5} />
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, marginTop: 8 }}>
        <View style={styles.sectionHeaderSkeleton}>
          <Skeleton width={140} height={32} radius={8} />
          <Skeleton width={84} height={22} radius={8} />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hpad}
      >
        {Array.from({ length: 2 }).map((_, i) => (
          <View
            key={i}
            style={{
              width: 300,
              height: 340,
              borderRadius: 24,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              padding: 14,
              justifyContent: "space-between",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Skeleton width={54} height={54} radius={14} />
              <Skeleton width={86} height={30} radius={999} />
            </View>
            <View>
              <Skeleton width={78} height={22} radius={999} />
              <Skeleton width={190} height={28} radius={8} style={{ marginTop: 10 }} />
              <Skeleton width={150} height={18} radius={8} style={{ marginTop: 10 }} />
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 14 }}>
                <Skeleton width={120} height={18} radius={8} />
                <Skeleton width={95} height={44} radius={12} />
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, marginTop: 12 }}>
        <View style={styles.sectionHeaderSkeleton}>
          <Skeleton width={120} height={32} radius={8} />
          <Skeleton width={84} height={22} radius={8} />
        </View>

        <View style={{ marginTop: 12, gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <View
              key={i}
              style={{
                height: 110,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                padding: 12,
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
              }}
            >
              <Skeleton width={84} height={84} radius={14} />
              <View style={{ flex: 1 }}>
                <Skeleton width={70} height={18} radius={999} />
                <Skeleton width="85%" height={18} radius={7} style={{ marginTop: 10 }} />
                <Skeleton width="70%" height={16} radius={7} style={{ marginTop: 8 }} />
                <Skeleton width="55%" height={16} radius={7} style={{ marginTop: 8 }} />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hpad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 14 },
  sectionHeaderSkeleton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
});
