import React from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { ArrowDownUp, CalendarDays, Flame, MapPin, SearchX, Users } from "lucide-react-native";

import { Button, Text, useTheme } from "@/design-system";
import type { ExploreEvent } from "@/features/explore/types";

export function ExploreEventList({
  events,
  onOpenEvent,
  onResetFilters,
}: {
  events: ExploreEvent[];
  onOpenEvent?: (id: string) => void;
  onResetFilters: () => void;
}) {
  const { colors, radius } = useTheme();

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 28 }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 10,
        }}
      >
        <Text token="bodySm" color="muted" style={{ fontWeight: "700" }}>
          {events.length} {events.length === 1 ? "evento" : "eventos"}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ordenar por data"
          style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
        >
          <ArrowDownUp size={15} color={colors.text} strokeWidth={2} />
          <Text token="label" style={{ fontSize: 13 }}>
            Data
          </Text>
        </Pressable>
      </View>

      {events.length > 0 ? (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, gap: 12 }}>
          {events.map((e) => (
            <Pressable
              key={e.id}
              onPress={() => onOpenEvent?.(e.id)}
              accessibilityRole="button"
              accessibilityLabel={`${e.title}, ${e.dateLabel}, ${e.city}, ${e.price}`}
              style={{
                flexDirection: "row",
                gap: 14,
                alignItems: "center",
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radius.xl,
                padding: 12,
              }}
            >
              <View>
                <Image
                  source={e.image}
                  style={{ width: 88, height: 88, borderRadius: 14 }}
                />
                {e.hot ? (
                  <View style={styles.hot}>
                    <Flame size={11} color="#FFB86B" strokeWidth={2} />
                    <Text
                      token="caption"
                      style={{
                        color: "#fff",
                        fontSize: 9,
                        textTransform: "none",
                        letterSpacing: 0,
                      }}
                    >
                      Alta
                    </Text>
                  </View>
                ) : null}
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View
                  style={[
                    styles.typeOutline,
                    {
                      borderColor: "#A8EBC6",
                      backgroundColor: colors.primarySoft,
                    },
                  ]}
                >
                  <Text
                    token="caption"
                    color="primary"
                    style={{
                      fontSize: 10,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    {e.type}
                  </Text>
                </View>
                <Text
                  token="subtitle"
                  style={{ fontSize: 14.5, marginTop: 5 }}
                  numberOfLines={2}
                >
                  {e.title}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 5,
                    marginTop: 6,
                    marginBottom: 8,
                  }}
                >
                  <CalendarDays
                    size={13}
                    color={colors.textMuted}
                    strokeWidth={1.5}
                  />
                  <Text token="bodySm" color="muted">
                    {e.dateLabel}
                  </Text>
                  <Text token="bodySm" color="muted">
                    ·
                  </Text>
                  <MapPin
                    size={13}
                    color={colors.textMuted}
                    strokeWidth={1.5}
                  />
                  <Text
                    token="bodySm"
                    color="muted"
                    numberOfLines={1}
                    style={{ flexShrink: 1 }}
                  >
                    {e.city}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    token="label"
                    color="primary"
                    style={{ fontSize: 15 }}
                  >
                    {e.price}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <Users
                      size={12}
                      color={colors.textMuted}
                      strokeWidth={2}
                    />
                    <Text
                      token="caption"
                      color="muted"
                      style={{ textTransform: "none", letterSpacing: 0 }}
                    >
                      {e.attendeesLabel}
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      ) : (
        <View
          style={{
            alignItems: "center",
            paddingHorizontal: 20,
            paddingTop: 24,
          }}
        >
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
            <SearchX size={30} color={colors.textMuted} strokeWidth={1.75} />
          </View>
          <Text token="title" style={{ marginBottom: 4 }}>
            Nenhum evento
          </Text>
          <Text
            token="bodySm"
            color="muted"
            style={{ textAlign: "center", maxWidth: 220, marginBottom: 16 }}
          >
            Tente outro esporte, cidade ou remova a busca.
          </Text>
          <Button label="Limpar filtros" onPress={onResetFilters} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hot: {
    position: "absolute",
    top: 6,
    left: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(20,24,33,0.72)",
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  typeOutline: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 2,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
});
