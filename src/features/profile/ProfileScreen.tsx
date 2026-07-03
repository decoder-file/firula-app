import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LogOut, Trophy } from "lucide-react-native";

import { Text, useTheme } from "@/design-system";
import { PROFILE_ACHIEVEMENTS, PROFILE_MENU } from "@/features/profile/constants";
import { ProfileHeader } from "@/features/profile/components/ProfileHeader";
import { ProfileMenu } from "@/features/profile/components/ProfileMenu";
import type { ProfileScreenProps } from "@/features/profile/types";

export function ProfileScreen({
  name,
  email,
  memberSince,
  eventsAttended,
  level = "Gold",
  onEditProfile,
  onNavigate,
  onLogout,
  loggingOut = false,
}: ProfileScreenProps) {
  const { colors } = useTheme();

  const stats = [
    { value: String(eventsAttended), label: "Eventos" },
    { value: memberSince, label: "Membro desde" },
    { value: level, label: "Nível" },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        <ProfileHeader
          name={name}
          email={email}
          level={level}
          onEditProfile={onEditProfile}
        />

        {/* <View style={{ paddingHorizontal: 20, marginTop: -4 }}>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            {stats.map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 16,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  alignItems: "center",
                }}
              >
                <Text token="subtitle" style={{ fontWeight: "800" }}>
                  {s.value}
                </Text>
                <Text
                  token="caption"
                  color="muted"
                  style={{
                    marginTop: 3,
                    textTransform: "none",
                    letterSpacing: 0,
                    fontWeight: "600",
                  }}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
        </View> */}

        {/* <View style={{ paddingTop: 20 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
              paddingHorizontal: 20,
              marginBottom: 12,
            }}
          >
            <Trophy size={16} color={colors.primaryText} strokeWidth={1.75} />
            <Text token="subtitle" style={{ fontWeight: "800" }}>
              Conquistas
            </Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
          >
            {PROFILE_ACHIEVEMENTS.map((a) => (
              <View
                key={a.label}
                style={{
                  width: 96,
                  borderRadius: 18,
                  paddingVertical: 14,
                  paddingHorizontal: 8,
                  alignItems: "center",
                  backgroundColor: a.unlocked
                    ? colors.surface
                    : colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                  opacity: a.unlocked ? 1 : 0.5,
                }}
              >
                <Text style={{ fontSize: 26 }}>{a.icon}</Text>
                <Text
                  token="caption"
                  style={{
                    marginTop: 6,
                    textAlign: "center",
                    textTransform: "none",
                    letterSpacing: 0,
                    color: colors.text,
                    fontWeight: "600",
                  }}
                >
                  {a.label}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View> */}

        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <ProfileMenu menu={PROFILE_MENU} onNavigate={onNavigate} />

          <Pressable
            onPress={onLogout}
            disabled={loggingOut}
            accessibilityRole="button"
            accessibilityLabel="Sair da conta"
            style={{
              marginTop: 16,
              height: 52,
              borderRadius: 16,
              backgroundColor: colors.errorSoft,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loggingOut ? 0.6 : 1,
            }}
          >
            <LogOut size={17} color={colors.error} strokeWidth={2} />
            <Text token="label" style={{ color: colors.error }}>
              {loggingOut ? "Saindo…" : "Sair da conta"}
            </Text>
          </Pressable>

          <Text
            token="caption"
            style={{
              textAlign: "center",
              color: colors.textMuted,
              marginTop: 16,
              textTransform: "none",
              letterSpacing: 0,
              opacity: 0.7,
            }}
          >
            Firula · versão 1.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
