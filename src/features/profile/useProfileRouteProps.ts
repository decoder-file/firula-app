import { Alert } from "react-native";
import { useRouter } from "expo-router";

import { useAuthUser, useLogout, useMe } from "@/hooks/useAuth";
import { useMyTickets } from "@/hooks/useTickets";
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
  const { data: me } = useMe();
  const authUser = useAuthUser();
  const { data: tickets } = useMyTickets();
  const logout = useLogout();

  const totalTickets = tickets?.length ?? 0;
  const attendedEvents =
    tickets?.filter((ticket) => ticket.status === "USED").length ?? 0;

  const handleNavigate = (key: string) => {
    switch (key) {
      case "tickets":
        router.push("/(tabs)/tickets");
        break;
      case "facial":
        router.push("/facial-id");
        break;
      case "favorites":
        router.push("/favorites");
        break;
      case "notifications":
        router.push("/notifications");
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

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
      onError: () => {
        Alert.alert("Erro", "Não foi possível sair agora. Tente novamente.");
      },
    });
  };

  return {
    name: me?.name || "Atleta",
    email: me?.email || authUser?.email || "",
    memberSince: formatMemberSince(me?.createdAt),
    eventsAttended: attendedEvents,
    level: getLevelFromTickets(totalTickets),
    onEditProfile: () => router.push("/profile-edit"),
    onNavigate: handleNavigate,
    onLogout: handleLogout,
    loggingOut: logout.isPending,
  };
};
