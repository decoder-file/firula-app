import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { CalendarDays } from "lucide-react-native";

import { Badge, PressScale, Text, useTheme } from "@/design-system";
import type { AttendedEvent } from "@/features/player-profile/types";

interface AttendedEventRowProps {
  event: AttendedEvent;
  isFirst: boolean;
  onPress: () => void;
}

export function AttendedEventRow({ event, isFirst, onPress }: AttendedEventRowProps) {
  const { colors } = useTheme();

  return (
    <PressScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. ${event.dateLabel}, ${event.organizationName}`}
      style={[
        styles.row,
        !isFirst && { borderTopWidth: 1, borderTopColor: colors.border },
      ]}
    >
      {event.coverUrl ? (
        <Image source={{ uri: event.coverUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={[styles.image, styles.imageFallback, { backgroundColor: colors.surfaceAlt }]}>
          <CalendarDays size={18} color={colors.textMuted} strokeWidth={1.75} />
        </View>
      )}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text token="bodySm" style={{ fontWeight: "700" }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 1 }} numberOfLines={1}>
          {event.dateLabel} · {event.organizationName}
        </Text>
      </View>
      <Badge label={event.statusLabel} variant="neutral" />
    </PressScale>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  image: { width: 42, height: 42, borderRadius: 11 },
  imageFallback: { alignItems: "center", justifyContent: "center" },
});
