import React from "react";
import { Pressable, View } from "react-native";
import { Search } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text, useTheme } from "@/design-system";

export function ExploreHeader({
  onOpenGlobalSearch,
}: {
  onOpenGlobalSearch?: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingTop: insets.top + 8,
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

      <Pressable
        onPress={onOpenGlobalSearch}
        accessibilityRole="button"
        accessibilityLabel="Buscar organizações, eventos e pessoas"
        style={{
          marginTop: 12,
          height: 48,
          borderRadius: 999,
          backgroundColor: colors.surfaceAlt,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Search size={20} color={colors.textMuted} strokeWidth={1.75} />
        <Text token="body" color="muted" style={{ fontSize: 14.5 }}>
          Esporte, local, evento, organização ou pessoa
        </Text>
      </Pressable>
    </View>
  );
}
