import React from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Monitor,
  Moon,
  Shield,
  Sun,
  Trash2,
} from "lucide-react-native";

import { Text, useTheme } from "@/design-system";
import type { ThemeMode } from "@/design-system";
import { isApiError } from "@/api/errors";
import { tokenStorage } from "@/api/tokenStorage";
import { profileService } from "@/services/profile.service";
import { useAuthStore } from "@/stores/authStore";

const APP_VERSION = "1.0.0";

const THEME_OPTIONS: { label: string; value: ThemeMode; Icon: typeof Sun }[] = [
  { label: "Sistema", value: "system", Icon: Monitor },
  { label: "Claro",   value: "light",  Icon: Sun },
  { label: "Escuro",  value: "dark",   Icon: Moon },
];

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, mode, setMode } = useTheme();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  const deleteAccountMutation = useMutation({
    mutationFn: profileService.deleteAccount,
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "Tem certeza que deseja excluir sua conta? Essa ação desativa sua conta e encerra sua sessão no aplicativo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteAccountMutation.mutateAsync();
              tokenStorage.clear();
              clearUser();
              queryClient.clear();
              Alert.alert("Conta desativada", response.message, [
                { text: "OK", onPress: () => router.replace("/(tabs)") },
              ]);
            } catch (error) {
              const message = isApiError(error)
                ? error.message
                : "Não foi possível excluir a conta agora. Tente novamente.";
              Alert.alert("Erro", message);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />

      {/* Header */}
      <View
        style={{
          backgroundColor: colors.surface,
          paddingTop: insets.top + 8,
          paddingBottom: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
          style={{ alignSelf: "flex-start", marginBottom: 12 }}
          hitSlop={8}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={1.75} />
        </Pressable>
        <Text token="titleLg" style={{ fontSize: 24 }}>
          Configurações
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28, paddingTop: 24, gap: 24, paddingHorizontal: 20 }}
      >
        {/* ── Aparência ───────────────────────────── */}
        <Section label="Aparência">
          <View style={{ padding: 16, gap: 12 }}>
            <Text token="body" style={{ fontWeight: "600" }}>
              Tema do app
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {THEME_OPTIONS.map(({ label, value, Icon }) => {
                const selected = mode === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setMode(value)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={label}
                    style={{
                      flex: 1,
                      alignItems: "center",
                      gap: 6,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1.5,
                      borderColor: selected ? colors.primary : colors.border,
                      backgroundColor: selected ? colors.primarySoft : colors.surfaceAlt,
                    }}
                  >
                    <Icon
                      size={20}
                      color={selected ? colors.primaryText : colors.textMuted}
                      strokeWidth={1.75}
                    />
                    <Text
                      token="caption"
                      style={{
                        textTransform: "none",
                        letterSpacing: 0,
                        fontSize: 12,
                        fontWeight: selected ? "700" : "500",
                        color: selected ? colors.primaryText : colors.textMuted,
                      }}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Section>

        {/* ── Sobre ───────────────────────────────── */}
        <Section label="Sobre">
          <LinkRow
            label="Termos de uso"
            icon={<FileText size={19} color={colors.text} strokeWidth={1.75} />}
            onPress={() => router.push("/terms")}
            colors={colors}
          />
          <Separator colors={colors} />
          <LinkRow
            label="Política de privacidade"
            icon={<Shield size={19} color={colors.text} strokeWidth={1.75} />}
            onPress={() => router.push("/privacy")}
            colors={colors}
          />
          <Separator colors={colors} />
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              height: 54,
            }}
          >
            <Text token="body" style={{ fontWeight: "600" }}>
              Versão
            </Text>
            <Text token="bodySm" color="muted">
              {APP_VERSION}
            </Text>
          </View>
        </Section>

        {/* ── Conta ───────────────────────────────── */}
        <Section label="Conta">
          <Pressable
            onPress={handleDeleteAccount}
            disabled={deleteAccountMutation.isPending}
            accessibilityRole="button"
            accessibilityLabel="Excluir conta"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              paddingHorizontal: 16,
              height: 54,
              opacity: deleteAccountMutation.isPending ? 0.6 : 1,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                backgroundColor: colors.errorSoft,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trash2 size={18} color={colors.error} strokeWidth={1.75} />
            </View>
            <Text token="body" style={{ fontWeight: "600", color: colors.error, flex: 1 }}>
              {deleteAccountMutation.isPending ? "Excluindo…" : "Excluir conta"}
            </Text>
          </Pressable>
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 8 }}>
      <Text
        token="caption"
        style={{
          textTransform: "uppercase",
          letterSpacing: 0.8,
          fontSize: 11,
          fontWeight: "700",
          color: colors.textMuted,
          paddingHorizontal: 4,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 18,
          overflow: "hidden",
        }}
      >
        {children}
      </View>
    </View>
  );
}

function LinkRow({
  label,
  icon,
  onPress,
  colors,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 16,
        height: 54,
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
        {icon}
      </View>
      <Text token="body" style={{ fontWeight: "600", flex: 1 }}>
        {label}
      </Text>
      <ChevronRight size={18} color={colors.border} strokeWidth={1.75} />
    </Pressable>
  );
}

function Separator({ colors }: { colors: ReturnType<typeof useTheme>["colors"] }) {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 16 + 38 + 12,
      }}
    />
  );
}
