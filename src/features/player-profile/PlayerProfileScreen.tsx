import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AlertCircle, MoreHorizontal, UserX } from "lucide-react-native";
import { EmptyState, TopBar, useTheme } from "@/design-system";
import { ActionsMenuSheet } from "@/features/player-profile/components/ActionsMenuSheet";
import { FollowListSheet } from "@/features/player-profile/components/FollowListSheet";
import { ReportProfileSheet } from "@/features/player-profile/components/ReportProfileSheet";
import { SportsProfileView } from "@/features/player-profile/components/SportsProfileView";
import type { FollowTab, PlayerProfileScreenProps } from "@/features/player-profile/types";

export function PlayerProfileScreen(props: PlayerProfileScreenProps) {
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [followSheet, setFollowSheet] = useState<{ open: boolean; tab: FollowTab }>({ open: false, tab: "followers" });

  const state = props.status === "not-found"
    ? { icon: UserX, title: "Perfil não encontrado", description: "Esse perfil pode ter sido desativado ou ainda não estar público.", action: props.onBack, label: "Voltar" }
    : props.status === "error"
      ? { icon: AlertCircle, title: "Não foi possível carregar o perfil", description: "Tente novamente em alguns instantes.", action: props.onRetry, label: "Tentar novamente" }
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style="auto" />
      <TopBar variant="detail" title={props.handle} onBack={props.onBack} actions={[{ icon: MoreHorizontal, label: "Mais opções", onPress: () => setMenuOpen(true) }]} />
      {state ? (
        <View style={{ flex: 1, justifyContent: "center" }}><EmptyState icon={state.icon} variant={props.status === "error" ? "error" : "empty"} title={state.title} description={state.description} actionLabel={state.label} onAction={state.action} /></View>
      ) : (
        <SportsProfileView
          name={props.name}
          handle={props.handle}
          photoUrl={props.photoUrl}
          bio={props.bio}
          city={props.city}
          followersCount={props.followersCount}
          followingCount={props.followingCount}
          onOpenFollowers={() => setFollowSheet({ open: true, tab: "followers" })}
          onOpenFollowing={() => setFollowSheet({ open: true, tab: "following" })}
          instagramHandle={props.instagramHandle}
          xHandle={props.xHandle}
          onOpenInstagram={props.onOpenInstagram}
          onOpenX={props.onOpenX}
          eventsCount={props.eventsCount}
          events={props.events}
          eventsLoading={props.status === "loading"}
          isOwnProfile={false}
          primaryActionLabel={props.isFollowing ? "Seguindo" : "Seguir"}
          isFollowing={props.isFollowing}
          primaryActionBusy={props.isFollowBusy}
          onPrimaryAction={props.onToggleFollow}
          onShareProfile={props.onShareProfile}
          onOpenEvent={props.onOpenEvent}
        />
      )}
      <ActionsMenuSheet visible={menuOpen} onClose={() => setMenuOpen(false)} isFollowing={props.isFollowing} isFollowedBy={props.isFollowedBy} isBlocked={props.isBlocked} hasReported={props.hasReported} isAuthenticated={props.isAuthenticated} onShareProfile={props.onShareProfile} onUnfollow={props.onUnfollow} onRemoveFollower={props.onRemoveFollower} onToggleBlock={props.onToggleBlock} onOpenReport={() => setReportOpen(true)} />
      <ReportProfileSheet visible={reportOpen} onClose={() => setReportOpen(false)} isSubmitting={props.isReportBusy} onSubmit={props.onSubmitReport} />
      <FollowListSheet visible={followSheet.open} onClose={() => setFollowSheet((s) => ({ ...s, open: false }))} profileName={props.name} username={props.username} initialTab={followSheet.tab} followersCount={props.followersCount} followingCount={props.followingCount} onOpenPerson={(person) => { setFollowSheet((s) => ({ ...s, open: false })); props.onOpenFollowPerson(person); }} />
    </View>
  );
}
