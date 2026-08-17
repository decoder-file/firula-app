import React from "react";
import { ScrollView, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Camera, Info } from "lucide-react-native";

import { Avatar, Button, Skeleton, Text, TopBar, useTheme } from "@/design-system";
import type { ProfileEditPhotoScreenProps } from "@/features/profile-edit-photo/types";

export function ProfileEditPhotoScreen({
  isLoading,
  name,
  avatarPreview,
  isPickingImage,
  isSavingAvatar,
  canSaveAvatar,
  onBack,
  onChangePhoto,
  onSaveAvatar,
}: ProfileEditPhotoScreenProps) {
  const { colors, radius } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="auto" />
      <TopBar title="Foto de perfil" variant="detail" onBack={onBack} />

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <View
            style={{
              alignItems: "center",
              gap: 12,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: 20,
            }}
          >
            <Skeleton width={88} height={88} radius={999} />
            <Skeleton width={140} height={12} />
            <Skeleton width="100%" height={48} radius={radius.md} style={{ marginTop: 4 }} />
            <Skeleton width="100%" height={48} radius={radius.md} />
          </View>
        ) : (
          <View
            style={{
              alignItems: "center",
              gap: 14,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radius.xl,
              padding: 20,
            }}
          >
            <Avatar name={name || "Perfil"} size="xl" source={avatarPreview ? { uri: avatarPreview } : undefined} />
            <Text token="caption" color="muted" style={{ textTransform: "none", letterSpacing: 0 }}>
              Pré-visualização da foto
            </Text>

            <Button
              label="Trocar foto"
              icon={Camera}
              variant="secondary"
              fullWidth
              loading={isPickingImage}
              disabled={isPickingImage}
              onPress={onChangePhoto}
            />

            <Button
              label="Salvar foto"
              variant="primary"
              fullWidth
              loading={isSavingAvatar}
              disabled={isSavingAvatar || !canSaveAvatar}
              onPress={onSaveAvatar}
            />

            <View
              style={{
                flexDirection: "row",
                gap: 8,
                width: "100%",
                backgroundColor: colors.surfaceAlt,
                borderRadius: radius.md,
                padding: 12,
                marginTop: 2,
              }}
            >
              <Info size={15} color={colors.textMuted} strokeWidth={2} style={{ marginTop: 1 }} />
              <Text token="caption" color="muted" style={{ flex: 1, textTransform: "none", letterSpacing: 0, lineHeight: 16 }}>
                A foto é selecionada pela galeria ou câmera.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
