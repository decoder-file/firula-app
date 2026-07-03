import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

import { isApiError } from "@/api/errors";
import { useLogout } from "@/hooks/useAuth";
import { queryKeys } from "@/hooks/queryKeys";
import { profileService } from "@/services/profile.service";
import type { ProfileEditScreenProps } from "@/features/profile-edit/types";

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

export const useProfileEditRouteProps = (): ProfileEditScreenProps => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutMutation = useLogout();

  const { data: profile, isPending: isLoading } = useQuery({
    queryKey: queryKeys.profile.customer(),
    queryFn: profileService.getCompleteProfile,
  });

  const updatePersonalMutation = useMutation({ mutationFn: profileService.updatePersonal });
  const updateAddressMutation = useMutation({ mutationFn: profileService.updateAddress });
  const updatePublicSettingsMutation = useMutation({ mutationFn: profileService.updatePublicSettings });
  const requestAvatarUploadMutation = useMutation({ mutationFn: profileService.requestAvatarUpload });
  const confirmAvatarUploadMutation = useMutation({ mutationFn: profileService.confirmAvatarUpload });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [address, setAddress] = useState("");
  const [addressNumber, setAddressNumber] = useState("");
  const [addressComplement, setAddressComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [xHandle, setXHandle] = useState("");
  const [isPublicProfileEnabled, setIsPublicProfileEnabled] = useState(false);
  const [showCityOnPublicProfile, setShowCityOnPublicProfile] = useState(false);
  const [showEventsOnPublicProfile, setShowEventsOnPublicProfile] = useState(false);
  const [avatarAsset, setAvatarAsset] = useState<ImagePicker.ImagePickerAsset | null>(null);

  const [errors, setErrors] = useState<{ name?: string; username?: string }>({});
  const [isPickingImage, setIsPickingImage] = useState(false);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setName(profile.personal.name ?? "");
    setEmail(profile.personal.email ?? profile.identity.email ?? "");
    setCpf(profile.personal.cpf ?? "");
    setPhone(profile.personal.phone ?? "");
    setAvatar(profile.personal.photoUrl ?? "");
    setAddress(profile.address.address ?? "");
    setAddressNumber(profile.address.addressNumber ?? "");
    setAddressComplement(profile.address.addressComplement ?? "");
    setNeighborhood(profile.address.neighborhood ?? "");
    setCity(profile.address.city ?? "");
    setState(profile.address.state ?? "");
    setPostalCode(profile.address.postalCode ?? "");
    setUsername(profile.publicSettings.username ?? "");
    setBio(profile.publicSettings.bio ?? "");
    setInstagramHandle(profile.publicSettings.instagramHandle ?? "");
    setXHandle(profile.publicSettings.xHandle ?? "");
    setIsPublicProfileEnabled(profile.publicSettings.isPublicProfileEnabled);
    setShowCityOnPublicProfile(profile.publicSettings.showCityOnPublicProfile);
    setShowEventsOnPublicProfile(profile.publicSettings.showEventsOnPublicProfile);
    setAvatarAsset(null);
  }, [profile]);

  const avatarPreview = useMemo(() => avatar.trim(), [avatar]);
  const maskedCpf = useMemo(() => formatCpf(cpf), [cpf]);
  const maskedPhone = useMemo(() => formatPhone(phone), [phone]);

  const isSavingAvatar =
    requestAvatarUploadMutation.isPending ||
    confirmAvatarUploadMutation.isPending;

  const refreshProfileData = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.profile.customer() });
    await queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
  };

  const handleSavePersonal = async () => {
    if (!profile) {
      return;
    }

    if (!name.trim()) {
      setErrors((current) => ({ ...current, name: "Informe seu nome." }));
      return;
    }

    try {
      await updatePersonalMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        cpf: onlyDigits(cpf),
        phone: onlyDigits(phone),
      });
      setErrors((current) => ({ ...current, name: undefined }));
      await refreshProfileData();
      Alert.alert("Dados pessoais atualizados", "As informações pessoais foram salvas com sucesso.");
    } catch (error) {
      const message = isApiError(error) ? error.message : "Não foi possível salvar dados pessoais.";
      Alert.alert("Erro ao salvar", message);
    }
  };

  const handleSaveAddress = async () => {
    try {
      await updateAddressMutation.mutateAsync({
        address: address.trim(),
        addressNumber: addressNumber.trim(),
        addressComplement: addressComplement.trim() || undefined,
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
      });
      await refreshProfileData();
      Alert.alert("Endereço atualizado", "As informações de endereço foram salvas com sucesso.");
    } catch (error) {
      const message = isApiError(error) ? error.message : "Não foi possível salvar endereço.";
      Alert.alert("Erro ao salvar", message);
    }
  };

  const handleSavePublicSettings = async () => {
    if (!username.trim()) {
      setErrors((current) => ({ ...current, username: "Informe o username público." }));
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
      setErrors((current) => ({ ...current, username: undefined }));
      await refreshProfileData();
      Alert.alert("Perfil público atualizado", "As configurações públicas foram salvas com sucesso.");
    } catch (error) {
      const message = isApiError(error) ? error.message : "Não foi possível salvar perfil público.";
      Alert.alert("Erro ao salvar", message);
    }
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

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "Tem certeza que deseja excluir sua conta? Essa ação encerra sua sessão no aplicativo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await logoutMutation.mutateAsync();
              router.replace("/login");
            } catch {
              Alert.alert("Erro", "Não foi possível excluir a conta agora. Tente novamente.");
            }
          },
        },
      ],
    );
  };

  return {
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
    canSaveAvatar: Boolean(avatarAsset),
    isSavingPersonal: updatePersonalMutation.isPending,
    isSavingAddress: updateAddressMutation.isPending,
    isSavingPublicSettings: updatePublicSettingsMutation.isPending,
    onBack: () => router.back(),
    onNameChange: (value: string) => {
      setName(value);
      setErrors((current) => ({ ...current, name: undefined }));
    },
    onAddressChange: setAddress,
    onAddressNumberChange: setAddressNumber,
    onAddressComplementChange: setAddressComplement,
    onNeighborhoodChange: setNeighborhood,
    onCityChange: setCity,
    onStateChange: setState,
    onPostalCodeChange: setPostalCode,
    onUsernameChange: (value: string) => {
      setUsername(value);
      setErrors((current) => ({ ...current, username: undefined }));
    },
    onBioChange: setBio,
    onInstagramHandleChange: setInstagramHandle,
    onXHandleChange: setXHandle,
    onPublicProfileEnabledChange: setIsPublicProfileEnabled,
    onShowCityOnPublicProfileChange: setShowCityOnPublicProfile,
    onShowEventsOnPublicProfileChange: setShowEventsOnPublicProfile,
    onChangePhoto: handleChangePhoto,
    onSaveAvatar: handleSaveAvatar,
    onSavePersonal: handleSavePersonal,
    onSaveAddress: handleSaveAddress,
    onSavePublicSettings: handleSavePublicSettings,
    onDeleteAccount: handleDeleteAccount,
  };
};
