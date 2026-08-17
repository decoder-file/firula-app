import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { isApiError } from "@/api/errors";
import { tokenStorage } from "@/api/tokenStorage";
import { useAuthUser, useIsAuthenticated, useLogout, useMe } from "@/hooks/useAuth";
import { useMyTickets } from "@/hooks/useTickets";
import { profileService } from "@/services/profile.service";
import { pushTokenService } from "@/services/pushToken.service";
import { useAuthStore } from "@/stores/authStore";
import type { ProfileScreenProps } from "@/features/profile/types";

const formatMemberSince = (createdAt?: string): string => {
  if (!createdAt) {
    return "-";
  }

  return new Date(createdAt).toLocaleDateString("pt-BR", {
    month: "short",
    year: "2-digit",
  });
};

const getLevelFromTickets = (totalTickets: number): string => {
  if (totalTickets >= 25) return "Platina";
  if (totalTickets >= 10) return "Gold";
  if (totalTickets >= 5) return "Silver";
  return "Bronze";
};

export const useProfileRouteProps = (): ProfileScreenProps => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  const { data: me } = useMe();
  const authUser = useAuthUser();
  const { data: tickets } = useMyTickets();
  const logout = useLogout();
  const clearUser = useAuthStore((state) => state.clearUser);
  const deleteAccountMutation = useMutation({ mutationFn: profileService.deleteAccount });
  const displayName = authUser?.name || me?.name || "Atleta";
  const displayPhotoUrl = authUser?.photoUrl || me?.profile?.photoUrl || null;

  const totalTickets = tickets?.length ?? 0;
  const attendedEvents =
    tickets?.filter((ticket) => ticket.status === "USED").length ?? 0;

  const openProtectedRoute = (path: string) => {
    if (!isAuthenticated) {
      router.push("/login-modal");
      return;
    }

    router.push(path as never);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir conta",
      "Tem certeza que deseja excluir sua conta? Essa ação desativa sua conta e encerra sua sessão no aplicativo.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await deleteAccountMutation.mutateAsync();
              tokenStorage.clear();
              clearUser();
              queryClient.clear();
              Alert.alert("Conta desativada", response.message);
              router.replace("/login");
            } catch (error) {
              const message = isApiError(error)
                ? error.message
                : "Não foi possível excluir a conta agora. Tente novamente.";
              Alert.alert("Erro", message);
            }
          },
        },
      ],
    );
  };

  const handleNavigate = (key: string) => {
    switch (key) {
      case "tickets":
        openProtectedRoute("/(tabs)/tickets");
        break;
      case "facial":
        router.push("/facial-id");
        break;
      case "favorites":
        openProtectedRoute("/favorites");
        break;
      case "notifications":
        openProtectedRoute("/notifications");
        break;
      case "privacy":
        router.push("/privacy");
        break;
      case "terms":
        router.push("/terms");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "help":
        router.push("/help");
        break;
      case "edit-photo":
        openProtectedRoute("/profile-edit/photo");
        break;
      case "edit-personal":
        openProtectedRoute("/profile-edit/personal");
        break;
      case "edit-address":
        openProtectedRoute("/profile-edit/address");
        break;
      case "edit-public":
        openProtectedRoute("/profile-edit/public-profile");
        break;
      case "delete-account":
        handleDeleteAccount();
        break;
      default:
        break;
    }
  };

  const handleLogout = async () => {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    ).catch(() => null);
    if (tokenData) {
      await pushTokenService.deregister(tokenData.data).catch(() => {});
    }

    logout.mutate(undefined, {
      onSuccess: () => router.replace("/(tabs)"),
      onError: () => {
        Alert.alert("Erro", "Não foi possível sair agora. Tente novamente.");
      },
    });
  };

  return {
    name: displayName,
    photoUrl: displayPhotoUrl,
    email: me?.email || authUser?.email || "",
    memberSince: formatMemberSince(me?.createdAt),
    eventsAttended: attendedEvents,
    level: getLevelFromTickets(totalTickets),
    isAuthenticated,
    onLogin: () => router.push("/login-modal"),
    onNavigate: handleNavigate,
    onLogout: handleLogout,
    loggingOut: logout.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
  };
};
