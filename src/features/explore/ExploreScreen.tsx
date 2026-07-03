import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { Text, useTheme } from "@/design-system";
import { EXPLORE_CATEGORIES } from "@/features/explore/constants";
import { ExploreEventList } from "@/features/explore/components/ExploreEventList";
import { ExploreHeader } from "@/features/explore/components/ExploreHeader";
import type { ExploreScreenProps } from "@/features/explore/types";

export function ExploreScreen({ events, onOpenEvent }: ExploreScreenProps) {
  const { colors } = useTheme();
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
          {EXPLORE_CATEGORIES.map((c) => {
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
        events={results}
        onOpenEvent={onOpenEvent}
        onResetFilters={() => {
          setQuery("");
          setCat("todos");
        }}
      />
    </View>
  );
}
