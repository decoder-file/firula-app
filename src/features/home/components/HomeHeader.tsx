import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { Bell, ChevronDown, MapPin, Search, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Text, useTheme } from "@/design-system";

export function HomeHeader({
  userName,
  city,
  query,
  onQuery,
  notificationCount,
  onOpenNotifications,
  onChangeCity,
}: {
  userName: string;
  city: string;
  query: string;
  onQuery: (v: string) => void;
  notificationCount: number;
  onOpenNotifications?: () => void;
  onChangeCity?: () => void;
}) {
  const { colors, iconStrokeWidth } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingTop: insets.top + 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Avatar name={userName} size="md" />
        <View style={{ flex: 1 }}>
          <Text token="bodySm" color="muted" style={{ fontWeight: "500" }}>
            Olá, {userName.split(" ")[0]} 👋
          </Text>
          <Pressable
            onPress={onChangeCity}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            accessibilityRole="button"
            accessibilityLabel={`Cidade: ${city}. Toque para mudar.`}
          >
            <MapPin size={14} color={colors.primaryText} strokeWidth={2} />
            <Text token="label" style={{ fontSize: 14 }}>
              {city}
            </Text>
            <ChevronDown
              size={15}
              color={colors.textMuted}
              strokeWidth={iconStrokeWidth}
            />
          </Pressable>
        </View>
        <Pressable
          onPress={onOpenNotifications}
          accessibilityRole="button"
          accessibilityLabel={
            notificationCount
              ? `Notificações, ${notificationCount} novas`
              : "Notificações"
          }
          style={[styles.bellBtn, { backgroundColor: colors.surfaceAlt }]}
        >
          <Bell size={21} color={colors.text} strokeWidth={iconStrokeWidth} />
          {notificationCount > 0 ? (
            <View
              style={[
                styles.bellBadge,
                { backgroundColor: colors.error, borderColor: colors.surface },
              ]}
            >
              <Text
                token="caption"
                style={{ color: "#fff", fontSize: 9, letterSpacing: 0 }}
              >
                {notificationCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

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
          strokeWidth={iconStrokeWidth}
          style={{ position: "absolute", left: 16, zIndex: 1 }}
        />
        <TextInput
          value={query}
          onChangeText={onQuery}
          placeholder="Buscar eventos, esportes, locais…"
          placeholderTextColor={colors.textMuted}
          accessibilityLabel="Buscar"
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
            style={[styles.clearBtn, { backgroundColor: colors.border }]}
          >
            <X size={16} color={colors.text} strokeWidth={2} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadge: {
    position: "absolute",
    top: 8,
    right: 9,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 4,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  clearBtn: {
    position: "absolute",
    right: 7,
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
});
