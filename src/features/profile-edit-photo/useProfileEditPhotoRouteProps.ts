import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

import { isApiError } from "@/api/errors";
import { queryKeys } from "@/hooks/queryKeys";
import { useIsCustomerScoped } from "@/hooks/useAuth";
import { profileService } from "@/services/profile.service";
import type { ProfileEditPhotoScreenProps } from "@/features/profile-edit-photo/types";

export const useProfileEditPhotoRouteProps = (): ProfileEditPhotoScreenProps => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isCustomerScoped = useIsCustomerScoped();

  const { data: profile, isPending: isLoading } = useQuery({
    queryKey: queryKeys.profile.customer(),
    queryFn: profileService.getCompleteProfile,
    enabled: isCustomerScoped,
  });

  const requestAvatarUploadMutation = useMutation({ mutationFn: profileService.requestAvatarUpload });
  const confirmAvatarUploadMutation = useMutation({ mutationFn: profileService.confirmAvatarUpload });

  const [avatar, setAvatar] = useState("");
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isPickingImage, setIsPickingImage] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setAvatar(profile.personal.photoUrl ?? "");
    setAvatarAsset(null);
  }, [profile]);

  const isSavingAvatar =
    requestAvatarUploadMutation.isPending || confirmAvatarUploadMutation.isPending;

  const refreshProfileData = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.profile.customer() });
    await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  };

  const handleSaveAvatar = async () => {
    if (!avatarAsset?.uri) {
      Alert.alert("Nenhuma alteração", "Escolha uma nova foto antes de salvar.");
      return;
    }

    try {
      const localFile = await fetch(avatarAsset.uri);
      const fileBlob = await localFile.blob();
      const fileType = avatarAsset.mimeType || fileBlob.type || "image/jpeg";
      const fileSize = avatarAsset.fileSize ?? fileBlob.size;

      const uploadStart = await requestAvatarUploadMutation.mutateAsync({
        fileType,
        fileSize,
      });

      if (uploadStart.uploadUrl) {
        const uploadResponse = await fetch(uploadStart.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": fileType,
            ...(uploadStart.headers ?? {}),
          },
          body: fileBlob,
        });

        if (!uploadResponse.ok) {
          throw new Error("Falha no upload do avatar");
        }
      }

      await confirmAvatarUploadMutation.mutateAsync({
        fileKey: uploadStart.fileKey,
      });

      setAvatarAsset(null);
      await refreshProfileData();
      Alert.alert("Foto atualizada", "A foto de perfil foi atualizada com sucesso.");
    } catch (error) {
      const message = isApiError(error) ? error.message : "Não foi possível atualizar a foto.";
      Alert.alert("Erro ao salvar", message);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Permita acesso à galeria para escolher sua foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const selected = result.assets[0];
      setAvatar(selected.uri);
      setAvatarAsset(selected);
    }
  };

  const takePhoto = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

    if (!cameraPermission.granted) {
      Alert.alert("Permissão necessária", "Permita acesso à câmera para tirar uma foto.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      const selected = result.assets[0];
      setAvatar(selected.uri);
      setAvatarAsset(selected);
    }
  };

  const handleChangePhoto = () => {
    Alert.alert("Trocar foto", "Escolha como deseja atualizar sua foto de perfil.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Galeria",
        onPress: async () => {
          try {
            setIsPickingImage(true);
            await pickFromGallery();
          } finally {
            setIsPickingImage(false);
          }
        },
      },
      {
        text: "Câmera",
        onPress: async () => {
          try {
            setIsPickingImage(true);
            await takePhoto();
          } finally {
            setIsPickingImage(false);
          }
        },
      },
    ]);
  };

  return {
    isLoading,
    name: profile?.personal.name ?? "",
    avatarPreview: avatar.trim(),
    isPickingImage,
    isSavingAvatar,
    canSaveAvatar: Boolean(avatarAsset),
    onBack: () => router.back(),
    onChangePhoto: handleChangePhoto,
    onSaveAvatar: handleSaveAvatar,
  };
};
