import { Alert, Linking, Share } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useQuery } from "@tanstack/react-query";
import { useSnackbar } from "@/design-system";
import { useAuthUser, useIsAuthenticated, useLogout, useMe } from "@/hooks/useAuth";
import { queryKeys } from "@/hooks/queryKeys";
import { useMyTickets } from "@/hooks/useTickets";
import { usePublicProfile } from "@/hooks/usePublicProfile";
import { profileService } from "@/services/profile.service";
import { pushTokenService } from "@/services/pushToken.service";
import type { AttendedEvent } from "@/features/player-profile/types";
import type { ProfileScreenProps } from "@/features/profile/types";

const PROFILE_BASE_URL = "https://firula.com.br/pagina-perfil";

export const useProfileRouteProps = (): ProfileScreenProps => {
  const router = useRouter();
  const { show } = useSnackbar();
  const isAuthenticated = useIsAuthenticated();
  const authUser = useAuthUser();
  const { data: me } = useMe();
  const profileQuery = useQuery({ queryKey: queryKeys.profile.customer(), queryFn: profileService.getCompleteProfile, enabled: isAuthenticated });
  const ticketsQuery = useMyTickets();
  const logout = useLogout();
  const complete = profileQuery.data;
  const name = complete?.personal.name || authUser?.name || me?.name || "Atleta";
  const username = complete?.publicSettings.username ?? null;
  const publicProfileQuery = usePublicProfile(username ?? "");
  const uniqueEvents = new Map<string, AttendedEvent>();
  (ticketsQuery.data ?? []).forEach((ticket) => {
    if (!uniqueEvents.has(ticket.event.id)) uniqueEvents.set(ticket.event.id, {
      id: ticket.event.id, slug: ticket.event.slug ?? null, title: ticket.event.name,
      dateLabel: new Date(ticket.event.startsAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }),
      organizationName: ticket.event.organization.tradeName, statusLabel: "Concluído", coverUrl: ticket.event.coverUrl ?? null,
    });
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
      router.push("/profile-edit");
      return;
    }
    try {
      await Share.share({ message: `Confira o perfil de ${name} na Firula\n${publicUrl}`, url: publicUrl, title: `${name} na Firula` });
    } catch {
      await Clipboard.setStringAsync(publicUrl);
      show({ message: "Link do perfil copiado.", variant: "success" });
    }
  };

  const handleNavigate = (key: string) => {
    const paths: Record<string, string> = { tickets: "/(tabs)/tickets", facial: "/facial-id", favorites: "/favorites", notifications: "/notifications", privacy: "/privacy", terms: "/terms", settings: "/settings", help: "/help" };
    const path = paths[key];
    if (!path) return;
    if (!isAuthenticated && ["tickets", "favorites", "notifications"].includes(key)) router.push("/login-modal");
    else router.push(path as never);
  };
  const handleLogout = async () => {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    const tokenData = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined).catch(() => null);
    if (tokenData) await pushTokenService.deregister(tokenData.data).catch(() => {});
    logout.mutate(undefined, { onSuccess: () => router.replace("/(tabs)"), onError: () => Alert.alert("Erro", "Não foi possível sair agora. Tente novamente.") });
  };

  return {
    status: !isAuthenticated ? "guest" : profileQuery.isPending ? "loading" : profileQuery.isError ? "error" : "ready",
    name, username, photoUrl: complete?.personal.photoUrl || authUser?.photoUrl || null,
    bio: complete?.publicSettings.bio ?? null,
    city: complete?.publicSettings.showCityOnPublicProfile ? [complete.address.city, complete.address.state].filter(Boolean).join(", ") || null : null,
    events, eventsCount: events.length,
    followersCount: publicProfileQuery.data?.followersCount ?? 0,
    followingCount: publicProfileQuery.data?.followingCount ?? 0,
    instagramHandle,
    xHandle,
    eventsLoading: ticketsQuery.isPending,
    email: complete?.personal.email || me?.email || authUser?.email || "", loggingOut: logout.isPending,
    onLogin: () => router.push("/login-modal"), onRetry: () => { profileQuery.refetch(); ticketsQuery.refetch(); },
    onEditProfile: () => router.push("/profile-edit"), onShareProfile: shareProfile,
    onOpenEvent: (event) => router.push(`/event/${event.slug ?? event.id}` as never),
    onExploreEvents: () => router.push("/(tabs)/explore"), onNavigate: handleNavigate, onLogout: handleLogout,
    onOpenInstagram: () => { void openSocialProfile(instagramHandle, "https://instagram.com"); },
    onOpenX: () => { void openSocialProfile(xHandle, "https://x.com"); },
    onOpenFollowPerson: (person) => { if (person.username) router.push(`/player/${person.username}` as never); },
  };
};
