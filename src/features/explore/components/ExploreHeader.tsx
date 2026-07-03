import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text, useTheme } from "@/design-system";

export function ExploreHeader({
  query,
  onQuery,
}: {
  query: string;
  onQuery: (value: string) => void;
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
          onChangeText={onQuery}
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
            onPress={() => onQuery("")}
            hitSlop={8}
            accessibilityLabel="Limpar busca"
            style={{
              position: "absolute",
              right: 7,
              width: 34,
              height: 34,
              borderRadius: 999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.border,
            }}
          >
            <X size={16} color={colors.text} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
