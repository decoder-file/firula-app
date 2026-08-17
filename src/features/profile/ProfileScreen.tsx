import React, { useState } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AlertCircle, LogOut, Menu, Pencil, UserRound } from "lucide-react-native";
import { Drawer, EmptyState, TopBar, useTheme } from "@/design-system";
import type { DrawerItem } from "@/design-system";
import { PROFILE_MENU } from "@/features/profile/constants";
import { SportsProfileView } from "@/features/player-profile/components/SportsProfileView";
import { FollowListSheet } from "@/features/player-profile/components/FollowListSheet";
import type { FollowTab } from "@/features/player-profile/types";
import type { ProfileScreenProps } from "@/features/profile/types";

const PUBLIC_MENU_KEYS = new Set(["privacy", "terms", "settings", "help"]);

export function ProfileScreen(props: ProfileScreenProps) {
  const { colors } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [followSheet, setFollowSheet] = useState<{ open: boolean; tab: FollowTab }>({ open: false, tab: "followers" });
  const authenticated = props.status !== "guest";
  const visibleMenu = authenticated ? PROFILE_MENU : PROFILE_MENU.filter((item) => PUBLIC_MENU_KEYS.has(item.key));
  const drawerItems: DrawerItem[] = [
    authenticated
      ? { key: "edit-profile", label: "Editar perfil", icon: Pencil, onPress: props.onEditProfile }
      : { key: "login", label: "Entrar ou criar conta", icon: UserRound, onPress: props.onLogin },
    ...visibleMenu.map((item) => ({ key: item.key, label: item.label, icon: item.icon, onPress: () => props.onNavigate(item.key) })),
    ...(authenticated ? [{ key: "logout", label: props.loggingOut ? "Saindo…" : "Sair da conta", icon: LogOut, danger: true, dividerBefore: true, onPress: props.onLogout }] : []),
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar style="auto" />
      <TopBar variant="root" centeredTitle compactTitle title={props.username ? `@${props.username}` : "Perfil"} actions={[{ icon: Menu, label: "Abrir menu", onPress: () => setMenuOpen(true) }]} />
      {props.status === "guest" ? (
        <View style={{ flex: 1, justifyContent: "center" }}><EmptyState icon={UserRound} title="Seu perfil esportivo começa aqui" description="Entre para ver seus eventos e compartilhar seu perfil." actionLabel="Entrar ou criar conta" onAction={props.onLogin} /></View>
      ) : props.status === "error" ? (
        <View style={{ flex: 1, justifyContent: "center" }}><EmptyState icon={AlertCircle} variant="error" title="Não foi possível carregar seu perfil" description="Tente novamente em alguns instantes." actionLabel="Tentar novamente" onAction={props.onRetry} /></View>
      ) : (
        <SportsProfileView
          name={props.name}
          handle={props.status === "loading" ? "Carregando…" : props.username ? `@${props.username}` : "Configure seu username"}
          photoUrl={props.photoUrl}
          bio={props.bio}
          city={props.city}
          events={props.events}
          eventsCount={props.eventsCount}
          followersCount={props.followersCount}
          followingCount={props.followingCount}
          onOpenFollowers={() => setFollowSheet({ open: true, tab: "followers" })}
          onOpenFollowing={() => setFollowSheet({ open: true, tab: "following" })}
          instagramHandle={props.instagramHandle}
          xHandle={props.xHandle}
          onOpenInstagram={props.onOpenInstagram}
          onOpenX={props.onOpenX}
          eventsLoading={props.status === "loading" || props.eventsLoading}
          isOwnProfile
          onEditProfile={props.onEditProfile}
          onShareProfile={props.onShareProfile}
          onExploreEvents={props.onExploreEvents}
          onOpenEvent={props.onOpenEvent}
        />
      )}
      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} header={authenticated ? { name: props.name, subtitle: props.email, photoUrl: props.photoUrl } : undefined} items={drawerItems} />
      {props.username ? (
        <FollowListSheet
          visible={followSheet.open}
          onClose={() => setFollowSheet((current) => ({ ...current, open: false }))}
          profileName={props.name}
          username={props.username}
          initialTab={followSheet.tab}
          followersCount={props.followersCount}
          followingCount={props.followingCount}
          onOpenPerson={(person) => {
            setFollowSheet((current) => ({ ...current, open: false }));
            props.onOpenFollowPerson(person);
          }}
        />
      ) : null}
    </View>
  );
}
