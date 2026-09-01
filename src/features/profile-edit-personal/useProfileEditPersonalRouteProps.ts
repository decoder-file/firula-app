import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { isApiError } from "@/api/errors";
import { queryKeys } from "@/hooks/queryKeys";
import { useIsCustomerScoped } from "@/hooks/useAuth";
import { profileService } from "@/services/profile.service";
import { formatCpf, formatPhone, onlyDigits } from "@/utils/mask";
import type { ProfileEditPersonalScreenProps } from "@/features/profile-edit-personal/types";

export const useProfileEditPersonalRouteProps = (): ProfileEditPersonalScreenProps => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isCustomerScoped = useIsCustomerScoped();

  const { data: profile, isPending: isLoading } = useQuery({
    queryKey: queryKeys.profile.customer(),
    queryFn: profileService.getCompleteProfile,
    enabled: isCustomerScoped,
  });

  const updatePersonalMutation = useMutation({ mutationFn: profileService.updatePersonal });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [nameError, setNameError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.personal.name ?? "");
    setEmail(profile.personal.email ?? profile.identity.email ?? "");
    setCpf(profile.personal.cpf ?? "");
    setPhone(profile.personal.phone ?? "");
  }, [profile]);

  const maskedCpf = useMemo(() => formatCpf(cpf), [cpf]);
  const maskedPhone = useMemo(() => formatPhone(phone), [phone]);

  const handleSavePersonal = async () => {
    if (!profile) {
      return;
    }

    if (!name.trim()) {
      setNameError("Informe seu nome.");
      return;
    }

    try {
      await updatePersonalMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        cpf: onlyDigits(cpf),
        phone: onlyDigits(phone),
      });
      setNameError(undefined);
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.customer() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      Alert.alert("Dados pessoais atualizados", "As informações pessoais foram salvas com sucesso.");
    } catch (error) {
      const message = isApiError(error) ? error.message : "Não foi possível salvar dados pessoais.";
      Alert.alert("Erro ao salvar", message);
    }
  };

  return {
    isLoading,
    name,
    email,
    maskedCpf,
    maskedPhone,
    nameError,
    isSavingPersonal: updatePersonalMutation.isPending,
    onBack: () => router.back(),
    onNameChange: (value: string) => {
      setName(value);
      setNameError(undefined);
    },
    onSavePersonal: handleSavePersonal,
  };
};
