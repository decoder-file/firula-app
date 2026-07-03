import React, { useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { Text, useTheme } from "@/design-system";
import { EXPLORE_CATEGORIES } from "@/features/explore/constants";
import { ExploreEventList } from "@/features/explore/components/ExploreEventList";
import { ExploreHeader } from "@/features/explore/components/ExploreHeader";
import type { ExploreScreenProps } from "@/features/explore/types";

export function ExploreScreen({
  events,
  categories = EXPLORE_CATEGORIES,
  query: controlledQuery,
  selectedCategory: controlledCategory,
  onQueryChange,
  onCategoryChange,
  isLoading = false,
  isFetchingMore = false,
  canLoadMore = false,
  onLoadMore,
  onOpenEvent,
}: ExploreScreenProps) {
  const { colors } = useTheme();
  const [internalQuery, setInternalQuery] = useState("");
  const [internalCategory, setInternalCategory] = useState("todos");

  const query = controlledQuery ?? internalQuery;
  const cat = controlledCategory ?? internalCategory;
  const setQuery = onQueryChange ?? setInternalQuery;
  const setCat = onCategoryChange ?? setInternalCategory;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <ExploreHeader query={query} onQuery={setQuery} />

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
          {categories.map((c) => {
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

      <ExploreEventList
        events={events}
        isLoading={isLoading}
        isFetchingMore={isFetchingMore}
        canLoadMore={canLoadMore}
        onLoadMore={onLoadMore}
        onOpenEvent={onOpenEvent}
        onResetFilters={() => {
          setQuery("");
          setCat("todos");
        }}
      />
    </View>
  );
}
