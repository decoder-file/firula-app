import React from "react";
import { Pressable, View } from "react-native";
import { ChevronRight, Crown } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Avatar, Text, useTheme } from "@/design-system";

export function ProfileHeader({
  name,
  email,
  level,
  onEditProfile,
}: {
  name: string;
  email: string;
  level: string;
  onEditProfile?: () => void;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingTop: insets.top + 8,
        paddingBottom: 20,
      }}
    >
      <Text token="titleLg" style={{ fontSize: 24 }}>
        Perfil
      </Text>
      <Pressable
        onPress={onEditProfile}
        accessibilityRole="button"
        accessibilityLabel="Editar perfil"
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
          marginTop: 16,
        }}
      >
        <Avatar name={name} size="xl" />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text token="title">{name}</Text>
          <Text token="bodySm" color="muted" style={{ marginTop: 1 }}>
            {email}
          </Text>
          {/* <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              alignSelf: "flex-start",
              backgroundColor: colors.warningSoft,
              borderRadius: 999,
              paddingHorizontal: 9,
              paddingVertical: 2,
              marginTop: 6,
            }}
          >
            <Crown size={12} color={colors.warning} strokeWidth={2} />
            <Text
              token="caption"
              style={{
                color: colors.warning,
                textTransform: "none",
                letterSpacing: 0,
                fontSize: 10.5,
              }}
            >
              Membro {level}
            </Text>
          </View> */}
        </View>
        <ChevronRight size={20} color={colors.border} strokeWidth={1.75} />
      </Pressable>
    </View>
  );
}
