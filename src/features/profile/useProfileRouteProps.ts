import { Alert, Linking, Share } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useSnackbar } from "@/design-system";
import { isApiError } from "@/api/errors";
import { tokenStorage } from "@/api/tokenStorage";
import { useAuthUser, useIsAuthenticated, useLogout, useMe } from "@/hooks/useAuth";
import { queryKeys } from "@/hooks/queryKeys";
import { useMyTickets } from "@/hooks/useTickets";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { profileService } from "@/services/profile.service";
import { pushTokenService } from "@/services/pushToken.service";
import { useAuthStore } from "@/stores/authStore";
import type { AttendedEvent } from "@/features/player-profile/types";
import type { ProfileScreenProps } from "@/features/profile/types";

const PROFILE_BASE_URL = "https://firula.com.br/pagina-perfil";

export const useProfileRouteProps = (): ProfileScreenProps => {
  const router = useRouter();
  const { show } = useSnackbar();
  const queryClient = useQueryClient();
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser();
  const { data: me } = useMe();
  const profileQuery = useQuery({ queryKey: queryKeys.profile.customer(), queryFn: profileService.getCompleteProfile, enabled: isAuthenticated });
  const ticketsQuery = useMyTickets();
  const logout = useLogout();
  const clearUser = useAuthStore((state) => state.clearUser);
  const deleteAccountMutation = useMutation({ mutationFn: profileService.deleteAccount });

  const complete = profileQuery.data;
  const name = complete?.personal.name || authUser?.name || me?.name || "Atleta";
  const username = complete?.publicSettings.username ?? null;
  const publicProfileQuery = usePublicProfile(username ?? "");
  const uniqueEvents = new Map<string, AttendedEvent>();

  (ticketsQuery.data ?? []).forEach((ticket) => {
    if (!uniqueEvents.has(ticket.event.id)) {
      uniqueEvents.set(ticket.event.id, {
        id: ticket.event.id,
        slug: ticket.event.slug ?? null,
        title: ticket.event.name,
        dateLabel: new Date(ticket.event.startsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
        organizationName: ticket.event.organization.tradeName,
        statusLabel: "Concluído",
        coverUrl: ticket.event.coverUrl ?? null,
      });
    }
  });

  const events = [...uniqueEvents.values()];
  const publicUrl = complete?.publicSettings.publicProfileUrl || (username ? `${PROFILE_BASE_URL}/${username}` : null);
  const instagramHandle = complete?.publicSettings.instagramHandle ?? null;
  const xHandle = complete?.publicSettings.xHandle ?? null;

  const openSocialProfile = async (handle: string | null, baseUrl: string) => {
    if (!handle) return;
    const url = handle.startsWith("http") ? handle : `${baseUrl}/${handle.replace(/^@/, "")}`;
    if (await Linking.canOpenURL(url)) await Linking.openURL(url);
  };

  const shareProfile = async () => {
    if (!publicUrl) {
      show({ message: "Defina seu username para compartilhar o perfil.", variant: "error" });
      router.push("/profile-edit/public-profile");
      return;
    }

    try {
      await Share.share({ message: `Confira o perfil de ${name} na Firula\n${publicUrl}`, url: publicUrl, title: `${name} na Firula` });
    } catch {
      await Clipboard.setStringAsync(publicUrl);
      show({ message: "Link do perfil copiado.", variant: "success" });
    }
  };

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
              Alert.alert("Conta desativada", response.message, [{
                text: "OK",
                onPress: () => {
                  tokenStorage.clear();
                  clearUser();
                  queryClient.clear();
                  router.replace("/login");
                },
              }]);
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
    const tokenData = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined).catch(() => null);
    if (tokenData) await pushTokenService.deregister(tokenData.data).catch(() => {});

    logout.mutate(undefined, {
      onSuccess: () => router.replace("/(tabs)"),
      onError: () => Alert.alert("Erro", "Não foi possível sair agora. Tente novamente."),
    });
  };

  return {
    status: !isAuthenticated ? "guest" : profileQuery.isPending ? "loading" : profileQuery.isError ? "error" : "ready",
    name,
    username,
    photoUrl: complete?.personal.photoUrl || authUser?.photoUrl || null,
    bio: complete?.publicSettings.bio ?? null,
    city: complete?.publicSettings.showCityOnPublicProfile ? [complete.address.city, complete.address.state].filter(Boolean).join(", ") || null : null,
    events,
    eventsCount: events.length,
    followersCount: publicProfileQuery.data?.followersCount ?? 0,
    followingCount: publicProfileQuery.data?.followingCount ?? 0,
    instagramHandle,
    xHandle,
    eventsLoading: ticketsQuery.isPending,
    email: complete?.personal.email || me?.email || authUser?.email || "",
    loggingOut: logout.isPending,
    isDeletingAccount: deleteAccountMutation.isPending,
    onLogin: () => router.push("/login-modal"),
    onRetry: () => {
      profileQuery.refetch();
      ticketsQuery.refetch();
    },
    onEditProfile: () => openProtectedRoute("/profile-edit/personal"),
    onShareProfile: shareProfile,
    onOpenEvent: (event) => router.push(`/event/${event.slug ?? event.id}` as never),
    onExploreEvents: () => router.push("/(tabs)/explore"),
    onNavigate: handleNavigate,
    onLogout: handleLogout,
    onOpenInstagram: () => {
      void openSocialProfile(instagramHandle, "https://instagram.com");
    },
    onOpenX: () => {
      void openSocialProfile(xHandle, "https://x.com");
    },
    onOpenFollowPerson: (person) => {
      if (person.username) router.push(`/player/${person.username}` as never);
    },
  };
};
