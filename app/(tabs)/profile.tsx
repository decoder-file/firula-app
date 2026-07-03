/**
 * Firula — Perfil redesenhado (mapeia para app/(tabs)/profile.tsx)
 * Construído sobre o Design System. Cabeçalho + stats + conquistas + menu + sair.
 */

import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  Bell,
  ChevronRight,
  CircleHelp,
  Crown,
  FileText,
  LogOut,
  ScanFace,
  Settings,
  Shield,
  Star,
  Ticket,
  Trophy,
  type LucideIcon,
} from "lucide-react-native";
import { Avatar, Text, useTheme } from "@/design-system";
import { useAuthUser, useLogout, useMe } from "@/hooks/useAuth";
import { useMyTickets } from "@/hooks/useTickets";

interface Stat {
  value: string;
  label: string;
}
interface Achievement {
  icon: string;
  label: string;
  unlocked: boolean;
}
interface MenuEntry {
  icon: LucideIcon;
  label: string;
  subtitle: string;
  key: string;
}

const MENU: MenuEntry[] = [
  {
    key: "tickets",
    icon: Ticket,
    label: "Meus ingressos",
    subtitle: "Ingressos comprados",
  },
  {
    key: "facial",
    icon: ScanFace,
    label: "Facial ID Firula",
    subtitle: "Reconhecimento facial",
  },
  {
    key: "favorites",
    icon: Star,
    label: "Favoritos",
    subtitle: "Eventos salvos",
  },
  {
    key: "notifications",
    icon: Bell,
    label: "Notificações",
    subtitle: "Lembretes e alertas",
  },
  {
    key: "privacy",
    icon: Shield,
    label: "Privacidade",
    subtitle: "Dados e segurança",
  },
  {
    key: "terms",
    icon: FileText,
    label: "Termos de uso",
    subtitle: "Políticas e termos",
  },
  {
    key: "settings",
    icon: Settings,
    label: "Configurações",
    subtitle: "Preferências do app",
  },
  {
    key: "help",
    icon: CircleHelp,
    label: "Ajuda",
    subtitle: "Central de suporte",
  },
];

const ACHIEVEMENTS: Achievement[] = [
  { icon: "🏅", label: "Primeiro evento", unlocked: true },
  { icon: "🥉", label: "5 eventos", unlocked: true },
  { icon: "🥈", label: "10 eventos", unlocked: true },
  { icon: "🔒", label: "Facial ID", unlocked: true },
  { icon: "🥇", label: "25 eventos", unlocked: false },
  { icon: "🏆", label: "50 eventos", unlocked: false },
];

const formatMemberSince = (createdAt?: string): string => {
  if (!createdAt) {
    return "-";
  }

  return new Date(createdAt).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
};

const getLevelFromTickets = (totalTickets: number): string => {
  if (totalTickets >= 25) return "Platina";
  if (totalTickets >= 10) return "Gold";
  if (totalTickets >= 5) return "Silver";
  return "Bronze";
};

export interface ProfileScreenProps {
  name: string;
  email: string;
  memberSince: string; // ex.: "ago 25"
  eventsAttended: number;
  level?: string; // ex.: "Gold"
  onEditProfile?: () => void;
  onNavigate?: (key: string) => void;
  onLogout?: () => void;
  loggingOut?: boolean;
}

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
  const { colors, radius } = useTheme();

  const stats: Stat[] = [
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
        {/* Cabeçalho */}
        <View
          style={{
            backgroundColor: colors.surface,
            paddingHorizontal: 20,
            paddingTop: 16,
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
              <View
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
              </View>
            </View>
            <ChevronRight size={20} color={colors.border} strokeWidth={1.75} />
          </Pressable>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
            {stats.map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  backgroundColor: colors.background,
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
        </View>

        {/* Conquistas */}
        <View style={{ paddingTop: 20 }}>
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
            {ACHIEVEMENTS.map((a) => (
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
        </View>

        {/* Menu */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <View
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 18,
              overflow: "hidden",
            }}
          >
            {MENU.map((m, i) => (
              <Pressable
                key={m.key}
                onPress={() => onNavigate?.(m.key)}
                accessibilityRole="button"
                accessibilityLabel={m.label}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                  paddingHorizontal: 16,
                  height: 58,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.border,
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
                  <m.icon size={19} color={colors.text} strokeWidth={1.75} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text token="body" style={{ fontWeight: "600" }}>
                    {m.label}
                  </Text>
                  <Text
                    token="caption"
                    color="muted"
                    style={{
                      textTransform: "none",
                      letterSpacing: 0,
                      fontSize: 11.5,
                    }}
                  >
                    {m.subtitle}
                  </Text>
                </View>
                <ChevronRight
                  size={19}
                  color={colors.border}
                  strokeWidth={1.75}
                />
              </Pressable>
            ))}
          </View>

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
            Firula · versão 2.0.0
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

export default function ProfileRoute() {
  const router = useRouter();
  const { data: me } = useMe();
  const authUser = useAuthUser();
  const { data: tickets } = useMyTickets();
  const logout = useLogout();

  const totalTickets = tickets?.length ?? 0;
  const attendedEvents = tickets?.filter((ticket) => ticket.status === "USED").length ?? 0;

  const handleNavigate = (key: string) => {
    switch (key) {
      case "tickets":
        router.push("/(tabs)/tickets");
        break;
      case "facial":
        router.push("/facial-id");
        break;
      case "favorites":
        router.push("/favorites");
        break;
      case "notifications":
        router.push("/notifications");
        break;
      case "privacy":
        router.push("/privacy");
        break;
      case "terms":
        router.push("/terms");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "help":
        router.push("/help");
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
      onError: () => {
        Alert.alert("Erro", "Não foi possível sair agora. Tente novamente.");
      },
    });
  };

  return (
    <ProfileScreen
      name={me?.name || "Atleta"}
      email={me?.email || authUser?.email || ""}
      memberSince={formatMemberSince(me?.createdAt)}
      eventsAttended={attendedEvents}
      level={getLevelFromTickets(totalTickets)}
      onEditProfile={() => router.push("/profile-edit")}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      loggingOut={logout.isPending}
    />
  );
}
