import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import {
  Globe,
  Image as ImageIcon,
  LogOut,
  MapPin,
  Menu,
  Trash2,
  User,
  UserRound,
} from "lucide-react-native";

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
  onNavigate,
  onLogout,
  loggingOut = false,
  isDeletingAccount = false,
}: ProfileScreenProps) {
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleMenu = isAuthenticated
    ? PROFILE_MENU
    : PROFILE_MENU.filter((item) => PUBLIC_MENU_KEYS.has(item.key));

  const drawerItems: DrawerItem[] = [
    ...(isAuthenticated
      ? [
          { key: "edit-photo", label: "Foto de perfil", icon: ImageIcon, onPress: () => onNavigate?.("edit-photo") },
          { key: "edit-personal", label: "Dados pessoais", icon: User, onPress: () => onNavigate?.("edit-personal") },
          { key: "edit-address", label: "Endereço", icon: MapPin, onPress: () => onNavigate?.("edit-address") },
          { key: "edit-public", label: "Perfil público", icon: Globe, onPress: () => onNavigate?.("edit-public") },
        ]
      : [{ key: "login", label: "Entrar ou criar conta", icon: UserRound, onPress: () => onLogin?.() }]),
    ...visibleMenu.map((item, index) => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      dividerBefore: isAuthenticated && index === 0,
      onPress: () => onNavigate?.(item.key),
    })),
    ...(isAuthenticated
      ? [
          {
            key: "delete-account",
            label: isDeletingAccount ? "Excluindo conta…" : "Excluir conta",
            icon: Trash2,
            danger: true,
            dividerBefore: true,
            onPress: () => {
              if (!isDeletingAccount) onNavigate?.("delete-account");
            },
          },
          {
            key: "logout",
            label: loggingOut ? "Saindo…" : "Sair da conta",
            icon: LogOut,
            danger: true,
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
