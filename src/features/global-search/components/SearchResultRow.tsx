import React from "react";
import { Image, StyleSheet, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";

import { PressScale, Text, useTheme } from "@/design-system";

interface SearchResultRowProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  fallbackIcon: LucideIcon;
  rounded?: boolean;
  onPress: () => void;
}

export function SearchResultRow({ title, subtitle, imageUrl, fallbackIcon: Icon, rounded = true, onPress }: SearchResultRowProps) {
  const { colors } = useTheme();

  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      style={styles.row}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[styles.thumb, { borderRadius: rounded ? 999 : 11 }]}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumb, styles.fallback, { backgroundColor: colors.surfaceAlt, borderRadius: rounded ? 999 : 11 }]}>
          <Icon size={19} color={colors.textMuted} strokeWidth={1.75} />
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text token="bodySm" style={{ fontWeight: "700" }} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 1 }} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </PressScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 10 },
  thumb: { width: 42, height: 42 },
  fallback: { alignItems: "center", justifyContent: "center" },
});
