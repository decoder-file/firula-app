import React from "react";
import { ChevronLeft, Image as ImageIcon } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  View,
} from "react-native";

import { Avatar } from "@/components/Avatar";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { FormButton } from "@/components/ui/FormButton";
import { FormInput } from "@/components/ui/FormInput";
import { IconButton } from "@/components/ui/IconButton";
import type { ProfileEditScreenProps } from "@/features/profile-edit/types";

export function ProfileEditScreen({
  isLoading,
  name,
  email,
  maskedCpf,
  maskedPhone,
  avatarPreview,
  address,
  addressNumber,
  addressComplement,
  neighborhood,
  city,
  state,
  postalCode,
  username,
  bio,
  instagramHandle,
  xHandle,
  isPublicProfileEnabled,
  showCityOnPublicProfile,
  showEventsOnPublicProfile,
  errors,
  isPickingImage,
  isSavingAvatar,
  canSaveAvatar,
  isSavingPersonal,
  isSavingAddress,
  isSavingPublicSettings,
  isDeletingAccount,
  onBack,
  onNameChange,
  onAddressChange,
  onAddressNumberChange,
  onAddressComplementChange,
  onNeighborhoodChange,
  onCityChange,
  onStateChange,
  onPostalCodeChange,
  onUsernameChange,
  onBioChange,
  onInstagramHandleChange,
  onXHandleChange,
  onPublicProfileEnabledChange,
  onShowCityOnPublicProfileChange,
  onShowEventsOnPublicProfileChange,
  onChangePhoto,
  onSaveAvatar,
  onSavePersonal,
  onSaveAddress,
  onSavePublicSettings,
  onDeleteAccount,
}: ProfileEditScreenProps) {
  return (
    <Screen edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
          <View className="px-4 pb-8 pt-4">
            <IconButton
              accessibilityLabel="Voltar"
              className="mb-6"
              icon={<ChevronLeft color="#141821" size={20} strokeWidth={1.75} />}
              onPress={onBack}
            />

            <Text className="font-bold text-[28px] text-foreground">Editar perfil</Text>
            <Text className="mt-2 text-sm leading-5 text-muted-foreground">
              Atualize seus dados pessoais, endereço e configurações públicas.
            </Text>
          </View>

          {isLoading ? (
            <ProfileEditSkeleton />
          ) : (
            <View className="gap-4 px-4">
              <View className="items-center gap-3 rounded-[28px] bg-card p-5">
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

              <View className="gap-3 rounded-[28px] bg-card p-5">
                <Text className="font-semibold text-sm text-foreground">Dados pessoais</Text>
                <FormInput
                  autoCapitalize="words"
                  autoCorrect={false}
                  error={errors.name}
                  label="Nome"
                  onChangeText={onNameChange}
                  placeholder="Seu nome"
                  placeholderTextColor="#727985"
                  value={name}
                />

                <FormInput
                  autoCapitalize="none"
                  editable={false}
                  label="Email cadastrado"
                  placeholderTextColor="#727985"
                  value={email}
                />

                <FormInput
                  autoCapitalize="none"
                  editable={false}
                  label="CPF"
                  placeholderTextColor="#727985"
                  value={maskedCpf}
                />

                <FormInput
                  autoCapitalize="none"
                  editable={false}
                  label="Telefone"
                  placeholder="(11) 99999-9999"
                  placeholderTextColor="#727985"
                  value={maskedPhone}
                />

                <View className="rounded-2xl bg-secondary/40 px-4 py-3">
                  <Text className="text-xs text-muted-foreground">
                    CPF e telefone são dados protegidos e não podem ser alterados por esta tela.
                  </Text>
                </View>

                <FormButton
                  className="mt-2"
                  label="Salvar dados pessoais"
                  loadingLabel="Salvando..."
                  isLoading={isSavingPersonal}
                  onPress={onSavePersonal}
                  disabled={isLoading}
                />
              </View>

              <View className="gap-3 rounded-[28px] bg-card p-5">
                <Text className="mt-2 font-semibold text-sm text-foreground">Endereço</Text>
                <FormInput
                  autoCapitalize="words"
                  label="Logradouro"
                  onChangeText={onAddressChange}
                  placeholder="Av. Paulista"
                  placeholderTextColor="#727985"
                  value={address}
                />
                <FormInput
                  autoCapitalize="none"
                  label="Número"
                  onChangeText={onAddressNumberChange}
                  placeholder="1000"
                  placeholderTextColor="#727985"
                  value={addressNumber}
                />
                <FormInput
                  autoCapitalize="words"
                  label="Complemento"
                  onChangeText={onAddressComplementChange}
                  placeholder="Apto 101"
                  placeholderTextColor="#727985"
                  value={addressComplement}
                />
                <FormInput
                  autoCapitalize="words"
                  label="Bairro"
                  onChangeText={onNeighborhoodChange}
                  placeholder="Bela Vista"
                  placeholderTextColor="#727985"
                  value={neighborhood}
                />
                <FormInput
                  autoCapitalize="words"
                  label="Cidade"
                  onChangeText={onCityChange}
                  placeholder="São Paulo"
                  placeholderTextColor="#727985"
                  value={city}
                />
                <FormInput
                  autoCapitalize="characters"
                  label="Estado"
                  onChangeText={onStateChange}
                  placeholder="SP"
                  placeholderTextColor="#727985"
                  value={state}
                />
                <FormInput
                  autoCapitalize="none"
                  label="CEP"
                  onChangeText={onPostalCodeChange}
                  placeholder="01310-100"
                  placeholderTextColor="#727985"
                  value={postalCode}
                />

                <FormButton
                  className="mt-2"
                  label="Salvar endereço"
                  loadingLabel="Salvando..."
                  isLoading={isSavingAddress}
                  onPress={onSaveAddress}
                  disabled={isLoading}
                />
              </View>

              <View className="gap-3 rounded-[28px] bg-card p-5">
                <Text className="mt-2 font-semibold text-sm text-foreground">Perfil público</Text>
                <FormInput
                  autoCapitalize="none"
                  error={errors.username}
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

              <View className="gap-3 rounded-[28px] bg-card p-5">
                <FormButton
                  className="bg-red-50"
                  disabled={isDeletingAccount}
                  isLoading={isDeletingAccount}
                  label="Excluir conta"
                  loadingLabel="Excluindo conta..."
                  onPress={onDeleteAccount}
                  textClassName="text-destructive"
                />
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function ProfileEditSkeleton() {
  return (
    <View className="gap-4 px-4">
      <View className="items-center gap-3 rounded-[28px] bg-card p-5">
        <Skeleton className="h-[88px] w-[88px] rounded-full" />
        <Skeleton className="h-3 w-40 rounded-full" />
        <Skeleton className="mt-1 h-12 w-full rounded-2xl" />
      </View>

      <View className="gap-3 rounded-[28px] bg-card p-5">
        <Skeleton className="h-4 w-36 rounded-full" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="mt-2 h-12 w-full rounded-2xl" />
      </View>

      <View className="gap-3 rounded-[28px] bg-card p-5">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </View>
    </View>
  );
}
