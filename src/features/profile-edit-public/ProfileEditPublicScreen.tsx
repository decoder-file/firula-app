import React from "react";
import { ChevronLeft } from "lucide-react-native";
import { ScrollView, Switch, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { FormButton } from "@/components/ui/FormButton";
import { FormInput } from "@/components/ui/FormInput";
import { IconButton } from "@/components/ui/IconButton";
import type { ProfileEditPublicScreenProps } from "@/features/profile-edit-public/types";

export function ProfileEditPublicScreen({
  isLoading,
  username,
  bio,
  instagramHandle,
  xHandle,
  isPublicProfileEnabled,
  showCityOnPublicProfile,
  showEventsOnPublicProfile,
  usernameError,
  isSavingPublicSettings,
  onBack,
  onUsernameChange,
  onBioChange,
  onInstagramHandleChange,
  onXHandleChange,
  onPublicProfileEnabledChange,
  onShowCityOnPublicProfileChange,
  onShowEventsOnPublicProfileChange,
  onSavePublicSettings,
}: ProfileEditPublicScreenProps) {
  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
        <View className="px-4 pb-8 pt-4">
          <IconButton
            accessibilityLabel="Voltar"
            className="mb-6"
            icon={<ChevronLeft color="#141821" size={20} strokeWidth={1.75} />}
            onPress={onBack}
          />

          <Text className="font-bold text-[28px] text-foreground">Perfil público</Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            Username, bio e redes sociais visíveis para outras pessoas.
          </Text>
        </View>

        {isLoading ? (
          <View className="gap-3 rounded-[28px] bg-card p-5 mx-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
          </View>
        ) : (
          <View className="gap-3 rounded-[28px] bg-card p-5 mx-4">
            <FormInput
              autoCapitalize="none"
              error={usernameError}
              label="Username"
              onChangeText={onUsernameChange}
              placeholder="maria_silva"
              placeholderTextColor="#727985"
              value={username}
            />
            <FormInput
              autoCapitalize="sentences"
              label="Bio"
              onChangeText={onBioChange}
              placeholder="Apaixonada por esporte"
              placeholderTextColor="#727985"
              value={bio}
            />
            <FormInput
              autoCapitalize="none"
              label="Instagram"
              onChangeText={onInstagramHandleChange}
              placeholder="maria.silva"
              placeholderTextColor="#727985"
              value={instagramHandle}
            />
            <FormInput
              autoCapitalize="none"
              label="X (Twitter)"
              onChangeText={onXHandleChange}
              placeholder="mariasilva"
              placeholderTextColor="#727985"
              value={xHandle}
            />

            <View className="rounded-2xl border border-border bg-background px-4 py-3">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Perfil público ativo</Text>
                <Switch value={isPublicProfileEnabled} onValueChange={onPublicProfileEnabledChange} />
              </View>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Exibir cidade no perfil</Text>
                <Switch value={showCityOnPublicProfile} onValueChange={onShowCityOnPublicProfileChange} />
              </View>
              <View className="mt-3 flex-row items-center justify-between">
                <Text className="text-sm text-foreground">Exibir eventos no perfil</Text>
                <Switch value={showEventsOnPublicProfile} onValueChange={onShowEventsOnPublicProfileChange} />
              </View>
            </View>

            <FormButton
              className="mt-2"
              label="Salvar perfil público"
              loadingLabel="Salvando..."
              isLoading={isSavingPublicSettings}
              onPress={onSavePublicSettings}
              disabled={isLoading}
            />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
