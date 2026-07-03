import React from "react";
import { Image, Pressable, StyleSheet, View } from "react-native";
import { CalendarDays, Flame, Heart, MapPin, Users } from "lucide-react-native";

import { Text, useTheme } from "@/design-system";
import type { HomeEvent } from "@/features/home/types";

export function FeaturedCard({
  event,
  onPress,
}: {
  event: HomeEvent;
  onPress?: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.dateLabel}, ${event.city}, a partir de ${event.price}`}
      style={styles.featured}
    >
      <Image
        source={event.image}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: "rgba(20,24,33,0.32)" },
        ]}
      />
      <View style={styles.featTop}>
        <View style={styles.dateBadge}>
          <Text token="titleLg" style={{ fontSize: 20, lineHeight: 22 }}>
            {event.day}
          </Text>
          <Text token="caption" color="primary">
            {event.mon}
          </Text>
        </View>
        {event.hot ? (
          <View style={styles.hotPill}>
            <Flame size={13} color="#FFB86B" strokeWidth={2} />
            <Text
              token="caption"
              style={{
                color: "#fff",
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 10.5,
              }}
            >
              Em alta
            </Text>
          </View>
        ) : null}
      </View>
      <View style={styles.featBottom}>
        <View style={[styles.typePill, { backgroundColor: colors.primary }]}> 
          <Text
            token="caption"
            style={{ color: colors.onPrimary, fontSize: 10 }}
          >
            {event.type.toUpperCase()}
          </Text>
        </View>
        <Text
          token="title"
          style={{ color: "#fff", marginTop: 8 }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            marginTop: 8,
          }}
        >
          <MapPin size={14} color="rgba(255,255,255,0.8)" strokeWidth={2} />
          <Text token="bodySm" style={{ color: "rgba(255,255,255,0.85)" }}>
            {event.city}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Users size={15} color="rgba(255,255,255,0.85)" strokeWidth={2} />
            <Text
              token="bodySm"
              style={{ color: "rgba(255,255,255,0.9)", fontWeight: "600" }}
            >
              {event.attendeesLabel}
            </Text>
          </View>
          <View style={styles.pricePill}>
            <Text
              token="caption"
              color="muted"
              style={{ textTransform: "none", letterSpacing: 0, fontSize: 10 }}
            >
              a partir de
            </Text>
            <Text token="label" style={{ fontSize: 15 }}>
              {event.price}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function TrendingRow({
  rank,
  event,
  onPress,
}: {
  rank: number;
  event: HomeEvent;
  onPress?: () => void;
}) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${rank}º em alta: ${event.title}, ${event.dateLabel}, ${event.attendeesLabel}`}
      style={[
        styles.trend,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderRadius: radius.xl,
        },
      ]}
    >
      <View>
        <Image
          source={event.image}
          style={{ width: 84, height: 84, borderRadius: 14 }}
        />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <View
          style={[
            styles.typeOutline,
            { borderColor: "#A8EBC6", backgroundColor: colors.primarySoft },
          ]}
        >
          <Text
            token="caption"
            color="primary"
            style={{ textTransform: "none", letterSpacing: 0, fontSize: 10 }}
          >
            {event.type}
          </Text>
        </View>
        <Text
          token="subtitle"
          style={{ fontSize: 14.5, marginTop: 5 }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            marginTop: 6,
          }}
        >
          <CalendarDays size={13} color={colors.textMuted} strokeWidth={1.5} />
          <Text token="bodySm" color="muted">
            {event.dateLabel}
          </Text>
          <Text token="bodySm" color="muted">
            ·
          </Text>
          <Users size={13} color={colors.textMuted} strokeWidth={1.5} />
          <Text token="bodySm" color="muted">
            {event.attendeesLabel}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function GridCard({
  event,
  onPress,
}: {
  event: HomeEvent;
  onPress?: () => void;
}) {
  const { colors, radius } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${event.dateLabel}, ${event.price}`}
      style={{
        borderRadius: radius.xl,
        overflow: "hidden",
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ height: 120 }}>
        <Image
          source={event.image}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
        <View style={styles.favBtn}>
          <Heart size={17} color={colors.text} strokeWidth={2} />
        </View>
        <View style={styles.gridType}>
          <Text
            token="caption"
            style={{
              color: "#fff",
              textTransform: "none",
              letterSpacing: 0,
              fontSize: 10.5,
            }}
          >
            {event.type}
          </Text>
        </View>
      </View>
      <View style={{ padding: 12 }}>
        <Text
          token="subtitle"
          style={{ fontSize: 13.5, height: 34 }}
          numberOfLines={2}
        >
          {event.title}
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            marginTop: 7,
          }}
        >
          <CalendarDays size={12} color={colors.textMuted} strokeWidth={1.5} />
          <Text token="bodySm" color="muted" style={{ fontSize: 11.5 }}>
            {event.dateLabel}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text token="label" color="primary">
            {event.price}
          </Text>
          <Text
            token="caption"
            color="muted"
            style={{ textTransform: "none", letterSpacing: 0 }}
          >
            {event.city.split(",")[0]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  featured: {
    width: 300,
    height: 340,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#141821",
  },
  featTop: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  dateBadge: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minWidth: 52,
  },
  hotPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  featBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
  },
  typePill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pricePill: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignItems: "flex-start",
  },
  trend: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    borderWidth: 1,
    padding: 12,
  },
  rank: {
    position: "absolute",
    top: -6,
    left: -6,
    width: 26,
    height: 26,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  typeOutline: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  favBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  gridType: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(20,24,33,0.7)",
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
});
