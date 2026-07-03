import React from "react";
import { Pressable, View } from "react-native";
import { ChevronRight } from "lucide-react-native";

import { Text, useTheme } from "@/design-system";
import type { MenuEntry } from "@/features/profile/types";

export function ProfileMenu({
  menu,
  onNavigate,
}: {
  menu: MenuEntry[];
  onNavigate?: (key: string) => void;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 18,
        overflow: "hidden",
      }}
    >
      {menu.map((m, i) => (
        <Pressable
          key={m.key}
          onPress={() => onNavigate?.(m.key)}
          accessibilityRole="button"
          accessibilityLabel={m.label}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            paddingHorizontal: 16,
            height: 58,
            borderTopWidth: i === 0 ? 0 : 1,
            borderTopColor: colors.border,
          }}
        >
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              backgroundColor: colors.surfaceAlt,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <m.icon size={19} color={colors.text} strokeWidth={1.75} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text token="body" style={{ fontWeight: "600" }}>
              {m.label}
            </Text>
            <Text
              token="caption"
              color="muted"
              style={{
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 11.5,
              }}
            >
              {m.subtitle}
            </Text>
          </View>
          <ChevronRight size={19} color={colors.border} strokeWidth={1.75} />
        </Pressable>
      ))}
    </View>
  );
}
