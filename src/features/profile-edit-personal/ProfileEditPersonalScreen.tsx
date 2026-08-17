import React from "react";
import { ChevronLeft } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";

import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { FormButton } from "@/components/ui/FormButton";
import { FormInput } from "@/components/ui/FormInput";
import { IconButton } from "@/components/ui/IconButton";
import type { ProfileEditPersonalScreenProps } from "@/features/profile-edit-personal/types";

export function ProfileEditPersonalScreen({
  isLoading,
  name,
  email,
  maskedCpf,
  maskedPhone,
  nameError,
  isSavingPersonal,
  onBack,
  onNameChange,
  onSavePersonal,
}: ProfileEditPersonalScreenProps) {
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

          <Text className="font-bold text-[28px] text-foreground">Dados pessoais</Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            Nome, e-mail, CPF e telefone cadastrados.
          </Text>
        </View>

        {isLoading ? (
          <View className="gap-3 rounded-[28px] bg-card p-5 mx-4">
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="h-16 w-full rounded-2xl" />
            <Skeleton className="mt-2 h-12 w-full rounded-2xl" />
          </View>
        ) : (
          <View className="gap-3 rounded-[28px] bg-card p-5 mx-4">
            <FormInput
              autoCapitalize="words"
              autoCorrect={false}
              error={nameError}
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
        )}
      </ScrollView>
    </Screen>
  );
}
