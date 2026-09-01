import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { isApiError } from "@/api/errors";
import { queryKeys } from "@/hooks/queryKeys";
import { useIsCustomerScoped } from "@/hooks/useAuth";
import { profileService } from "@/services/profile.service";
import type { ProfileEditPublicScreenProps } from "@/features/profile-edit-public/types";

export const useProfileEditPublicRouteProps = (): ProfileEditPublicScreenProps => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isCustomerScoped = useIsCustomerScoped();

  // Só alcançável hoje pelo menu de perfil (já bloqueado pra sessão não-cliente),
  // mas o gate fica aqui também como defesa — sem ele, uma sessão de
  // admin/organizador que chegasse aqui de outra forma entraria em loop de
  // refresh tentando /public/customer/profile/complete.
  const { data: profile, isPending: isLoading } = useQuery({
    queryKey: queryKeys.profile.customer(),
    queryFn: profileService.getCompleteProfile,
    enabled: isCustomerScoped,
  });

  const updatePublicSettingsMutation = useMutation({ mutationFn: profileService.updatePublicSettings });

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [isPublicProfileEnabled, setIsPublicProfileEnabled] = useState(false);
  const [showCityOnPublicProfile, setShowCityOnPublicProfile] = useState(false);
  const [showEventsOnPublicProfile, setShowEventsOnPublicProfile] = useState(false);
  const [usernameError, setUsernameError] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setUsername(profile.publicSettings.username ?? "");
    setBio(profile.publicSettings.bio ?? "");
    setInstagramHandle(profile.publicSettings.instagramHandle ?? "");
    setXHandle(profile.publicSettings.xHandle ?? "");
    setIsPublicProfileEnabled(profile.publicSettings.isPublicProfileEnabled);
    setShowCityOnPublicProfile(profile.publicSettings.showCityOnPublicProfile);
    setShowEventsOnPublicProfile(profile.publicSettings.showEventsOnPublicProfile);
  }, [profile]);

  const handleSavePublicSettings = async () => {
    if (!username.trim()) {
      setUsernameError("Informe o username público.");
      return;
    }

    try {
      await updatePublicSettingsMutation.mutateAsync({
        username: username.trim(),
        bio: bio.trim() || undefined,
        instagramHandle: instagramHandle.trim() || undefined,
        xHandle: xHandle.trim() || undefined,
        isPublicProfileEnabled,
        showCityOnPublicProfile,
        showEventsOnPublicProfile,
      });
      setUsernameError(undefined);
      await queryClient.invalidateQueries({ queryKey: queryKeys.profile.customer() });
      await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      Alert.alert("Perfil público atualizado", "As configurações públicas foram salvas com sucesso.");
    } catch (error) {
      const message = isApiError(error) ? error.message : "Não foi possível salvar perfil público.";
      Alert.alert("Erro ao salvar", message);
    }
  };

  return {
    isLoading,
    username,
    bio,
    instagramHandle,
    xHandle,
    isPublicProfileEnabled,
    showCityOnPublicProfile,
    showEventsOnPublicProfile,
    usernameError,
    isSavingPublicSettings: updatePublicSettingsMutation.isPending,
    onBack: () => router.back(),
    onUsernameChange: (value: string) => {
      setUsername(value);
      setUsernameError(undefined);
    },
    onBioChange: setBio,
    onInstagramHandleChange: setInstagramHandle,
    onXHandleChange: setXHandle,
    onPublicProfileEnabledChange: setIsPublicProfileEnabled,
    onShowCityOnPublicProfileChange: setShowCityOnPublicProfile,
    onShowEventsOnPublicProfileChange: setShowEventsOnPublicProfile,
    onSavePublicSettings: handleSavePublicSettings,
  };
};
