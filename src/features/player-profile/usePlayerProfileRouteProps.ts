import { useState } from "react";
import { Alert, Linking, Share } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useSnackbar } from "@/design-system";
import { isNotFoundError } from "@/api/errors";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useFollowPublicProfile, usePublicProfile, usePublicProfileFollowStatus } from "@/hooks/usePublicProfile";
import type { AttendedEvent, FollowPerson, PlayerProfileScreenProps } from "@/features/player-profile/types";

const PROFILE_BASE_URL = "https://firula.com.br/pagina-perfil";

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "??";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function formatEventDateLabel(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function buildInstagramUrl(handle: string): string {
  return handle.startsWith("http") ? handle : `https://instagram.com/${handle.replace(/^@/, "")}`;
}

export function usePlayerProfileRouteProps(): PlayerProfileScreenProps {
  const router = useRouter();
  const { username: rawUsername } = useLocalSearchParams<{ username: string }>();
  const username = rawUsername ?? "";
  const isAuthenticated = useIsAuthenticated();
  const { show: showSnackbar } = useSnackbar();

  const [isBlocked, setIsBlocked] = useState(false);

  const { data: profile, isPending, isError, error, refetch } = usePublicProfile(username);
  const isReady = !isPending && !isError && !!profile;

  const { data: followStatus } = usePublicProfileFollowStatus(username, isAuthenticated && isReady);
  const followMutation = useFollowPublicProfile(username);

  const status: PlayerProfileScreenProps["status"] = isPending
    ? "loading"
    : isError
      ? isNotFoundError(error)
        ? "not-found"
        : "error"
      : "ready";

  const events: AttendedEvent[] = (profile?.attendedEvents ?? []).map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.name,
    dateLabel: formatEventDateLabel(event.startsAt),
    organizationName: event.organizationName,
    statusLabel: new Date(event.startsAt).getTime() < Date.now() ? "Concluído" : "Confirmado",
    coverUrl: event.coverUrl,
  }));

  const instagramHandle = profile?.socialLinks?.instagram ?? null;
  const instagramUrl = instagramHandle ? buildInstagramUrl(instagramHandle) : null;

  const city =
    profile?.location && (profile.location.city || profile.location.state)
      ? [profile.location.city, profile.location.state].filter(Boolean).join(", ")
      : null;

  const isFollowing = followStatus?.isFollowing ?? false;
  const profileUrl = `${PROFILE_BASE_URL}/${username}`;

  const requireAuth = (): boolean => {
    if (isAuthenticated) return true;
    router.push(`/login-modal?redirectTo=/player/${username}` as never);
    return false;
  };

  return {
    status,
    onRetry: () => refetch(),

    name: profile?.name ?? username,
    username,
    handle: `@${username}`,
    photoUrl: profile?.photoUrl ?? null,
    initials: getInitials(profile?.name ?? username),
    city,
    instagramUrl,
    instagramHandle,

    followersCount: profile?.followersCount ?? 0,
    followingCount: profile?.followingCount ?? 0,
    eventsCount: events.length,
    events,

    isFollowing,
    isFollowBusy: followMutation.isPending,
    isBlocked,

    onBack: () => router.back(),
    onOpenInstagram: async () => {
      if (!instagramUrl) return;
      const canOpen = await Linking.canOpenURL(instagramUrl);
      if (canOpen) await Linking.openURL(instagramUrl);
    },
    onToggleFollow: () => {
      if (!requireAuth()) return;
      followMutation.mutate(isFollowing, {
        onError: (mutationError) => {
          const message =
            mutationError instanceof Error ? mutationError.message : "Não foi possível atualizar o perfil seguido.";
          showSnackbar({ message, variant: "error" });
        },
      });
    },
    onUnfollow: () => {
      if (!requireAuth()) return;
      followMutation.mutate(true, {
        onError: () => showSnackbar({ message: "Não foi possível deixar de seguir agora.", variant: "error" }),
      });
    },
    onChallenge: () => Alert.alert("Em breve", "Os desafios 1x1 ainda não estão disponíveis."),
    onShareProfile: async () => {
      await Share.share({ message: `Confira o perfil de ${profile?.name ?? username} na Firula\n${profileUrl}` });
    },
    onToggleBlock: () => setIsBlocked((value) => !value),
    onReport: () => {},
    onOpenEvent: (event: AttendedEvent) => {
      router.push(`/event/${event.slug ?? event.id}` as never);
    },
    onOpenFollowPerson: (person: FollowPerson) => {
      if (!person.username) return;
      router.push(`/player/${person.username}` as never);
    },
  };
}
