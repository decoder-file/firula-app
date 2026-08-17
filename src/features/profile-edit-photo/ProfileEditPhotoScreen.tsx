import React from "react";
import { ChevronLeft, Image as ImageIcon } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

import { Avatar } from "@/components/Avatar";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { FormButton } from "@/components/ui/FormButton";
import { IconButton } from "@/components/ui/IconButton";
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
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="px-4 pb-8 pt-4">
          <IconButton
            accessibilityLabel="Voltar"
            className="mb-6"
            icon={<ChevronLeft color="#141821" size={20} strokeWidth={1.75} />}
            onPress={onBack}
          />

          <Text className="font-bold text-[28px] text-foreground">Foto de perfil</Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            Escolha uma foto para aparecer no seu perfil.
          </Text>
        </View>

        {isLoading ? (
          <View className="items-center gap-3 rounded-[28px] bg-card p-5 mx-4">
            <Skeleton className="h-[88px] w-[88px] rounded-full" />
            <Skeleton className="h-3 w-40 rounded-full" />
            <Skeleton className="mt-1 h-12 w-full rounded-2xl" />
          </View>
        ) : (
          <View className="items-center gap-3 rounded-[28px] bg-card p-5 mx-4">
            <Avatar name={name || "Perfil"} size={88} uri={avatarPreview || undefined} />
            <Text className="text-xs text-muted-foreground">Pré-visualização da foto</Text>
            <FormButton
              className="mt-1 bg-secondary"
              disabled={isPickingImage}
              isLoading={isPickingImage}
              label="Trocar foto"
              loadingLabel="Abrindo..."
              onPress={onChangePhoto}
              textClassName="text-foreground"
            />

            <FormButton
              className="mt-1"
              disabled={isSavingAvatar || !canSaveAvatar}
              isLoading={isSavingAvatar}
              label="Salvar foto"
              loadingLabel="Salvando foto..."
              onPress={onSaveAvatar}
            />

            <View className="w-full rounded-2xl bg-secondary/40 px-4 py-3">
              <View className="flex-row items-center gap-2">
                <ImageIcon color="#727985" size={16} strokeWidth={1.75} />
                <Text className="text-xs text-muted-foreground">
                  A foto é selecionada pela galeria ou câmera.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
