import React from "react";
import { Pressable, ScrollView, View } from "react-native";

import { Text, useTheme } from "@/design-system";
import type { HomeCategory } from "@/features/home/types";

export function CategoryRail({
  categories,
  active,
  onSelect,
}: {
  categories: HomeCategory[];
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
      {categories.map((c) => {
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
