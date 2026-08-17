import React from "react";
import { ChevronLeft } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { FormButton } from "@/components/ui/FormButton";
import { FormInput } from "@/components/ui/FormInput";
import { IconButton } from "@/components/ui/IconButton";
import type { ProfileEditAddressScreenProps } from "@/features/profile-edit-address/types";

export function ProfileEditAddressScreen({
  isLoading,
  address,
  addressNumber,
  addressComplement,
  neighborhood,
  city,
  state,
  postalCode,
  isSavingAddress,
  onBack,
  onAddressChange,
  onAddressNumberChange,
  onAddressComplementChange,
  onNeighborhoodChange,
  onCityChange,
  onStateChange,
  onPostalCodeChange,
  onSaveAddress,
}: ProfileEditAddressScreenProps) {
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

          <Text className="font-bold text-[28px] text-foreground">Endereço</Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            Usado para cobrança e para calcular distância de eventos.
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
        )}
      </ScrollView>
    </Screen>
  );
}
