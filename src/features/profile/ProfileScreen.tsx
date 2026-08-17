import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { LogOut, Menu, Pencil, UserRound } from "lucide-react-native";

import { Drawer, TopBar, useTheme } from "@/design-system";
import type { DrawerItem } from "@/design-system";
import { PROFILE_MENU } from "@/features/profile/constants";
import type { ProfileScreenProps } from "@/features/profile/types";

const PUBLIC_MENU_KEYS = new Set(["privacy", "terms", "settings", "help"]);

export function ProfileScreen({
  name,
  photoUrl,
  email,
  isAuthenticated = false,
  onLogin,
  onEditProfile,
  onNavigate,
  onLogout,
  loggingOut = false,
}: ProfileScreenProps) {
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleMenu = isAuthenticated
    ? PROFILE_MENU
    : PROFILE_MENU.filter((item) => PUBLIC_MENU_KEYS.has(item.key));

  const drawerItems: DrawerItem[] = [
    isAuthenticated
      ? { key: "edit-profile", label: "Editar perfil", icon: Pencil, onPress: () => onEditProfile?.() }
      : { key: "login", label: "Entrar ou criar conta", icon: UserRound, onPress: () => onLogin?.() },
    ...visibleMenu.map((item) => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      onPress: () => onNavigate?.(item.key),
    })),
    ...(isAuthenticated
      ? [
          {
            key: "logout",
            label: loggingOut ? "Saindo…" : "Sair da conta",
            icon: LogOut,
            danger: true,
            dividerBefore: true,
            onPress: () => {
              if (!loggingOut) onLogout?.();
            },
          },
        ]
      : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      <TopBar
        variant="root"
        title="Perfil"
        actions={[{ icon: Menu, label: "Abrir menu", onPress: () => setMenuOpen(true) }]}
      />

      <View style={{ flex: 1 }} />

      <Drawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        header={isAuthenticated ? { name, subtitle: email, photoUrl } : undefined}
        items={drawerItems}
        side="right"
      />
    </View>
  );
}
