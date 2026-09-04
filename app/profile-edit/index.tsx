import React from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChevronRight, Globe, MapPin, UserRound, Image as ImageIcon } from "lucide-react-native";

import { Text, TopBar, useTheme } from "@/design-system";

type EditSection = {
  key: string;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  href: "/profile-edit/personal" | "/profile-edit/photo" | "/profile-edit/address" | "/profile-edit/public-profile";
};

export default function ProfileEditHubScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const sections: EditSection[] = [
    {
      key: "personal",
      label: "Dados pessoais",
      subtitle: "Nome, e-mail, CPF e telefone",
      icon: <UserRound size={19} color={colors.text} strokeWidth={1.75} />,
      href: "/profile-edit/personal",
    },
    {
      key: "photo",
      label: "Foto de perfil",
      subtitle: "A foto exibida no seu perfil",
      icon: <ImageIcon size={19} color={colors.text} strokeWidth={1.75} />,
      href: "/profile-edit/photo",
    },
    {
      key: "address",
      label: "Endereço",
      subtitle: "Usado para cobrança e distância de eventos",
      icon: <MapPin size={19} color={colors.text} strokeWidth={1.75} />,
      href: "/profile-edit/address",
    },
    {
      key: "public-profile",
      label: "Perfil público",
      subtitle: "Username, bio e redes sociais",
      icon: <Globe size={19} color={colors.text} strokeWidth={1.75} />,
      href: "/profile-edit/public-profile",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <TopBar
        title="Editar perfil"
        variant="detail"
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }
          router.replace("/(tabs)/profile");
        }}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28, paddingTop: 24, paddingHorizontal: 20 }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
            overflow: "hidden",
          }}
        >
          {sections.map((section, index) => (
            <React.Fragment key={section.key}>
              {index > 0 && (
                <View style={{ height: 1, backgroundColor: colors.border, marginLeft: 16 + 38 + 12 }} />
              )}
              <Pressable
                onPress={() => router.push(section.href)}
                accessibilityRole="button"
                accessibilityLabel={section.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  height: 64,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    backgroundColor: colors.surfaceAlt,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {section.icon}
                </View>
                <View style={{ flex: 1 }}>
                  <Text token="body" style={{ fontWeight: "600" }}>
                    {section.label}
                  </Text>
                  <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
                    {section.subtitle}
                  </Text>
                </View>
                <ChevronRight size={18} color={colors.border} strokeWidth={1.75} />
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
