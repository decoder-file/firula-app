import React from "react";
import { Image, StyleSheet, View } from "react-native";

import { Badge, Text, useTheme } from "@/design-system";
import type { AttendedEvent } from "@/features/player-profile/types";

interface AttendedEventRowProps {
  event: AttendedEvent;
  isFirst: boolean;
}

export function AttendedEventRow({ event, isFirst }: AttendedEventRowProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.row,
        !isFirst && { borderTopWidth: 1, borderTopColor: colors.border },
      ]}
    >
      <Image source={event.image} style={styles.image} resizeMode="cover" />
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text token="bodySm" style={{ fontWeight: "700" }} numberOfLines={1}>
          {event.title}
        </Text>
        <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0, marginTop: 1 }}>
          {event.date} · {event.city}
        </Text>
      </View>
      <Badge label={event.tag} variant="neutral" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  image: { width: 42, height: 42, borderRadius: 11 },
});
