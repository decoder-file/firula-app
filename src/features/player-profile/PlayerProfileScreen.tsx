import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { AtSign, CalendarX, ChevronLeft, ExternalLink, MoreHorizontal, Swords, UserCheck } from "lucide-react-native";

import { EmptyState, PressScale, Text, useTheme } from "@/design-system";
import { ActionsMenuSheet } from "@/features/player-profile/components/ActionsMenuSheet";
import { AttendedEventRow } from "@/features/player-profile/components/AttendedEventRow";
import { FollowListSheet } from "@/features/player-profile/components/FollowListSheet";
import { HeaderIconButton } from "@/features/player-profile/components/HeaderIconButton";
import type { FollowTab, PlayerProfileScreenProps } from "@/features/player-profile/types";

export function PlayerProfileScreen({
  name,
  handle,
  city,
  initials,
  instagramHandle,
  followersCount,
  followingCount,
  eventsCount,
  events,
  followers,
  following,
  isFollowing,
  isBlocked,
  onBack,
  onOpenInstagram,
  onToggleFollow,
  onUnfollow,
  onChallenge,
  onShareProfile,
  onToggleBlock,
  onReport,
  onToggleFollowPerson,
}: PlayerProfileScreenProps) {
  const { colors, radius } = useTheme();
  const insets = useSafeAreaInsets();

  const [menuOpen, setMenuOpen] = useState(false);
  const [followSheet, setFollowSheet] = useState<{ open: boolean; tab: FollowTab }>({
    open: false,
    tab: "followers",
  });

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* ── Header ─────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerGlow} pointerEvents="none" />

          <View style={[styles.headerTop, { paddingTop: insets.top + 8 }]}>
            <HeaderIconButton accessibilityLabel="Voltar" onPress={onBack}>
              <ChevronLeft size={22} color="#fff" strokeWidth={2} />
            </HeaderIconButton>
            <Text token="label" style={{ fontSize: 13, color: "#fff", textTransform: "none", letterSpacing: 0 }}>
              {handle}
            </Text>
            <HeaderIconButton accessibilityLabel="Mais opções" onPress={() => setMenuOpen(true)}>
              <MoreHorizontal size={18} color="#fff" strokeWidth={2} />
            </HeaderIconButton>
          </View>

          <View style={styles.headerBody}>
            <LinearGradient colors={["#3ED97F", "#12813F"]} style={styles.avatar}>
              <Text token="titleLg" style={{ color: "#0A2E1A", fontSize: 30 }}>
                {initials}
              </Text>
            </LinearGradient>

            <Text token="titleLg" style={{ color: "#fff", fontSize: 19, marginTop: 12 }}>
              {name}
            </Text>
            <Text token="bodySm" style={{ color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              {handle} · {city}
            </Text>

            <PressScale
              onPress={onOpenInstagram}
              accessibilityRole="link"
              accessibilityLabel={`Abrir Instagram ${instagramHandle}`}
              style={styles.igPill}
            >
              <AtSign size={14} color="#3ED97F" strokeWidth={2} />
              <Text token="caption" style={{ color: "#fff", fontWeight: "700", textTransform: "none", letterSpacing: 0 }}>
                {instagramHandle}
              </Text>
              <ExternalLink size={12} color="rgba(255,255,255,0.5)" strokeWidth={2} />
            </PressScale>

            <View style={styles.statsRow}>
              <PressScale
                onPress={() => setFollowSheet({ open: true, tab: "followers" })}
                accessibilityRole="button"
                accessibilityLabel={`Seguidores, ${followersCount}`}
                style={styles.statBtn}
              >
                <Text token="label" style={{ color: "#fff", fontSize: 16 }}>
                  {followersCount}
                </Text>
                <Text token="caption" style={styles.statLabel}>
                  Seguidores
                </Text>
              </PressScale>
              <View style={styles.statDivider} />
              <PressScale
                onPress={() => setFollowSheet({ open: true, tab: "following" })}
                accessibilityRole="button"
                accessibilityLabel={`Seguindo, ${followingCount}`}
                style={styles.statBtn}
              >
                <Text token="label" style={{ color: "#fff", fontSize: 16 }}>
                  {followingCount}
                </Text>
                <Text token="caption" style={styles.statLabel}>
                  Seguindo
                </Text>
              </PressScale>
              <View style={styles.statDivider} />
              <View style={styles.statBtn}>
                <Text token="label" style={{ color: "#fff", fontSize: 16 }}>
                  {eventsCount}
                </Text>
                <Text token="caption" style={styles.statLabel}>
                  Eventos
                </Text>
              </View>
            </View>

            <View style={styles.actionsRow}>
              <PressScale
                onPress={onToggleFollow}
                accessibilityRole="button"
                accessibilityLabel={isFollowing ? "Deixar de seguir" : "Seguir"}
                style={[
                  styles.actionBtn,
                  {
                    borderRadius: radius.lg - 3,
                    backgroundColor: isFollowing ? "rgba(255,255,255,0.08)" : colors.primary,
                    borderColor: isFollowing ? "rgba(255,255,255,0.15)" : colors.primary,
                  },
                ]}
              >
                {isFollowing ? <UserCheck size={16} color="#fff" strokeWidth={2} /> : null}
                <Text
                  token="label"
                  style={{ fontSize: 13.5, color: isFollowing ? "#fff" : "#0A2E1A" }}
                >
                  {isFollowing ? "Seguindo" : "Seguir"}
                </Text>
              </PressScale>
              <PressScale
                onPress={onChallenge}
                accessibilityRole="button"
                accessibilityLabel="Desafiar"
                style={[styles.actionBtn, styles.challengeBtn, { borderRadius: radius.lg - 3 }]}
              >
                <Swords size={16} color="#3ED97F" strokeWidth={2} />
                <Text token="label" style={{ fontSize: 13.5, color: "#fff" }}>
                  Desafiar
                </Text>
              </PressScale>
            </View>
          </View>
        </View>

        {/* ── Eventos que participou ─────────────────────────── */}
        <View style={{ paddingHorizontal: 20, paddingTop: 22 }}>
          <Text token="subtitle" style={{ fontWeight: "800", marginBottom: 12 }}>
            Eventos que participou
          </Text>

          {events.length > 0 ? (
            <View style={[styles.eventsCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl }]}>
              {events.map((event, index) => (
                <AttendedEventRow key={event.id} event={event} isFirst={index === 0} />
              ))}
            </View>
          ) : (
            <View style={[styles.eventsCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.xl }]}>
              <EmptyState icon={CalendarX} variant="empty" title="Nenhum evento ainda" />
            </View>
          )}
        </View>
      </ScrollView>

      <ActionsMenuSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        isFollowing={isFollowing}
        isBlocked={isBlocked}
        onShareProfile={onShareProfile}
        onUnfollow={onUnfollow}
        onToggleBlock={onToggleBlock}
        onReport={onReport}
      />

      <FollowListSheet
        visible={followSheet.open}
        onClose={() => setFollowSheet((s) => ({ ...s, open: false }))}
        profileName={name}
        initialTab={followSheet.tab}
        followers={followers}
        following={following}
        onTogglePerson={onToggleFollowPerson}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: "#141821", paddingHorizontal: 20, paddingBottom: 22, overflow: "hidden" },
  headerGlow: {
    position: "absolute",
    top: -40,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(31,189,99,0.14)",
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerBody: { alignItems: "center", marginTop: 14 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#1FBD63",
  },
  igPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  statsRow: { flexDirection: "row", alignItems: "center", gap: 26, marginTop: 16 },
  statBtn: { alignItems: "center" },
  statLabel: { color: "rgba(255,255,255,0.6)", fontWeight: "600", marginTop: 1, textTransform: "none", letterSpacing: 0, fontSize: 11 },
  statDivider: { width: 1, height: 26, backgroundColor: "rgba(255,255,255,0.15)" },
  actionsRow: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
  actionBtn: {
    flex: 1,
    height: 44,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  challengeBtn: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.15)" },
  eventsCard: { borderWidth: 1, overflow: "hidden" },
});
