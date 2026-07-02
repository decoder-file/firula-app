import { useRouter } from "expo-router";
import { ChevronLeft, Image as ImageIcon } from "lucide-react-native";
import * as ImagePicker from "expo-image-picker";
import { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { Avatar } from "@/components/Avatar";
import { Screen } from "@/components/Screen";
import { FormButton } from "@/components/ui/FormButton";
import { FormInput } from "@/components/ui/FormInput";
import { IconButton } from "@/components/ui/IconButton";
import { useApp } from "@/contexts/AppContext";
import { useLogout } from "@/hooks/useAuth";
import { profileService } from "@/services/profile.service";
import { isApiError } from "@/api/errors";

export default function ProfileEditScreen() {
  const router = useRouter();
  const { profile, updateProfile, deleteAccount } = useApp();
  const logoutMutation = useLogout();

  const [name, setName] = useState(profile.name);
  const [avatar, setAvatar] = useState(profile.avatar);
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const avatarPreview = useMemo(() => avatar.trim() || profile.avatar, [avatar, profile.avatar]);

  const handleSave = async () => {
    const nextErrors: { name?: string } = {};

    if (!name.trim()) {
      nextErrors.name = "Informe seu nome.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSaving(true);
    try {
      await profileService.updateProfile({ name: name.trim() });
      updateProfile({ name: name.trim(), avatar: avatar.trim() || profile.avatar });
      Alert.alert("Perfil atualizado", "Suas alterações foram salvas com sucesso.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      const message = isApiError(error) ? error.message : "Não foi possível salvar. Tente novamente.";
      Alert.alert("Erro ao salvar", message);
    } finally {
      setIsSaving(false);
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
      setAvatar(result.assets[0].uri);
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
      setAvatar(result.assets[0].uri);
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

  const confirmDeleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "Tem certeza que deseja excluir sua conta? Essa ação remove seus dados locais no app e encerra sua sessão.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              deleteAccount();
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
              onPress={() => router.back()}
            />

            <Text className="font-bold text-[28px] text-foreground">Editar perfil</Text>
            <Text className="mt-2 text-sm leading-5 text-muted-foreground">
              Atualize seu nome e foto de perfil. Seu email é exibido abaixo.
            </Text>
          </View>

          <View className="gap-4 px-4">
            <View className="items-center gap-3 rounded-[28px] bg-card p-5">
              <Avatar name={name || profile.name} size={88} uri={avatarPreview} />
              <Text className="text-xs text-muted-foreground">Pré-visualização da foto</Text>
              <FormButton
                className="mt-1 bg-secondary"
                disabled={isPickingImage}
                isLoading={isPickingImage}
                label="Trocar foto"
                loadingLabel="Abrindo..."
                onPress={handleChangePhoto}
                textClassName="text-foreground"
              />
            </View>

            <View className="gap-3 rounded-[28px] bg-card p-5">
              <FormInput
                autoCapitalize="words"
                autoCorrect={false}
                error={errors.name}
                label="Nome"
                onChangeText={(value) => {
                  setName(value);
                  setErrors((current) => ({ ...current, name: undefined }));
                }}
                placeholder="Seu nome"
                placeholderTextColor="#727985"
                value={name}
              />

              <View className="rounded-2xl bg-secondary/40 px-4 py-3">
                <View className="flex-row items-center gap-2">
                  <ImageIcon color="#727985" size={16} strokeWidth={1.75} />
                  <Text className="text-xs text-muted-foreground">
                    A foto é selecionada pela galeria ou câmera.
                  </Text>
                </View>
              </View>

              <FormInput
                editable={false}
                label="Email cadastrado"
                placeholderTextColor="#727985"
                value={profile.email}
              />

              <FormButton className="mt-2" label="Salvar alterações" loadingLabel="Salvando..." isLoading={isSaving} onPress={handleSave} />

              <FormButton
                className="mt-2 bg-red-50"
                label="Excluir conta"
                onPress={confirmDeleteAccount}
                textClassName="text-destructive"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
