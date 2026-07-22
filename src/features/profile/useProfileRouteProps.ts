import { Alert } from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

import { useAuthUser, useIsAuthenticated, useLogout, useMe } from "@/hooks/useAuth";
import { useMyTickets } from "@/hooks/useTickets";
import { pushTokenService } from "@/services/pushToken.service";
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
  const isAuthenticated = useIsAuthenticated();
  const { data: me } = useMe();
  const authUser = useAuthUser();
  const { data: tickets } = useMyTickets();
  const logout = useLogout();
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
    onEditProfile: () => router.push("/profile-edit"),
    onNavigate: handleNavigate,
    onLogout: handleLogout,
    loggingOut: logout.isPending,
  };
};
