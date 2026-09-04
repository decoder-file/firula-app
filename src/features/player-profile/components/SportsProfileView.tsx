import React, { useMemo, useState } from "react";
import { Image, StyleSheet, useWindowDimensions, View } from "react-native";
import { FlatList } from "react-native";
import { AtSign, CalendarDays, Camera, MapPin, Trophy } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Rect } from "react-native-svg";

import { Button, EmptyState, PressScale, Skeleton, Text, useTheme } from "@/design-system";
import { PhotoLightbox } from "@/features/player-profile/components/PhotoLightbox";
import type { AttendedEvent } from "@/features/player-profile/types";

interface SportsProfileViewProps {
  name: string;
  handle: string;
  photoUrl: string | null;
  bio?: string | null;
  city?: string | null;
  events: AttendedEvent[];
  eventsCount: number;
  followersCount?: number;
  followingCount?: number;
  onOpenFollowers?: () => void;
  onOpenFollowing?: () => void;
  instagramHandle?: string | null;
  xHandle?: string | null;
  onOpenInstagram?: () => void;
  onOpenX?: () => void;
  eventsLoading?: boolean;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
  primaryActionLabel?: string;
  primaryActionBusy?: boolean;
  onPrimaryAction?: () => void;
  onShareProfile: () => void;
  onExploreEvents?: () => void;
  onOpenEvent: (event: AttendedEvent) => void;
}

const INITIAL_EVENTS = 12;

export function SportsProfileView({
  name,
  handle,
  photoUrl,
  bio,
  city,
  events,
  eventsCount,
  followersCount,
  followingCount,
  onOpenFollowers,
  onOpenFollowing,
  instagramHandle,
  xHandle,
  onOpenInstagram,
  onOpenX,
  eventsLoading = false,
  isOwnProfile,
  onEditProfile,
  primaryActionLabel,
  primaryActionBusy,
  onPrimaryAction,
  onShareProfile,
  onExploreEvents,
  onOpenEvent,
}: SportsProfileViewProps) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 720);
  const [visibleCount, setVisibleCount] = useState(INITIAL_EVENTS);
  const visibleEvents = useMemo(() => events.slice(0, visibleCount), [events, visibleCount]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const Header = (
    <>
      <View style={styles.identityRow}>
        <View style={styles.avatarWrap}>
          {photoUrl ? (
            <PressScale onPress={() => setLightboxOpen(true)} accessibilityRole="button" accessibilityLabel="Ver foto do perfil ampliada">
              <Image source={{ uri: photoUrl }} style={styles.profileAvatar} resizeMode="cover" />
            </PressScale>
          ) : (
            <LinearGradient colors={["#35D879", "#12A653"]} style={styles.profileAvatarFallback}>
              <Text token="titleLg" style={styles.avatarInitials}>{profileInitials(name)}</Text>
            </LinearGradient>
          )}
          {isOwnProfile && onEditProfile ? (
            <PressScale onPress={onEditProfile} accessibilityRole="button" accessibilityLabel="Alterar foto do perfil" style={[styles.avatarEdit, { backgroundColor: colors.primary, borderColor: colors.surface }]}>
              <Camera size={12} color={colors.onPrimary} strokeWidth={2} />
            </PressScale>
          ) : null}
        </View>
        <View style={styles.metrics}>
          {typeof followersCount === "number" ? <Metric value={followersCount} label="Seguidores" onPress={onOpenFollowers} /> : null}
          {typeof followingCount === "number" ? <Metric value={followingCount} label="Seguindo" onPress={onOpenFollowing} /> : null}
          <Metric value={eventsCount} label="Eventos" />
        </View>
      </View>

      <View style={styles.details}>
        <Text token="title" numberOfLines={2} style={styles.profileName}>{name}</Text>
        <Text token="bodySm" color="muted" style={styles.handle}>{handle}</Text>
        {bio ? <Text token="bodySm" style={styles.bio}>{bio}</Text> : null}
        {city ? (
          <View style={styles.location}>
            <MapPin size={14} color={colors.textMuted} strokeWidth={1.8} />
            <Text token="caption" color="muted" style={styles.normalText}>{city}</Text>
          </View>
        ) : null}
        {instagramHandle || xHandle ? (
          <View style={styles.socials}>
            {instagramHandle && onOpenInstagram ? (
              <PressScale onPress={onOpenInstagram} accessibilityRole="link" accessibilityLabel={`Abrir Instagram ${instagramHandle}`} style={[styles.socialButton, { backgroundColor: colors.surfaceAlt }]}>
                <InstagramIcon size={17} color={colors.primaryText} />
                <Text token="caption" numberOfLines={1} style={styles.normalText}>{instagramHandle.replace(/^@/, "")}</Text>
              </PressScale>
            ) : null}
            {xHandle && onOpenX ? (
              <PressScale onPress={onOpenX} accessibilityRole="link" accessibilityLabel={`Abrir X ${xHandle}`} style={[styles.socialButton, { backgroundColor: colors.surfaceAlt }]}>
                <AtSign size={17} color={colors.primaryText} strokeWidth={2} />
                <Text token="caption" numberOfLines={1} style={styles.normalText}>{xHandle.replace(/^@/, "")}</Text>
              </PressScale>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {isOwnProfile && onEditProfile ? (
          <View style={styles.action}><Button label="Editar perfil" variant="tonal" size="sm" fullWidth onPress={onEditProfile} /></View>
        ) : null}
        {!isOwnProfile && primaryActionLabel && onPrimaryAction ? (
          <View style={styles.action}><Button label={primaryActionLabel} loading={primaryActionBusy} size="sm" fullWidth onPress={onPrimaryAction} /></View>
        ) : null}
        <View style={styles.action}><Button label={isOwnProfile ? "Compartilhar" : "Compartilhar perfil"} variant="tonal" size="sm" fullWidth onPress={onShareProfile} /></View>
      </View>

      <View style={[styles.eventsHeader, { backgroundColor: colors.surfaceAlt }]}> 
        <View style={[styles.eventsHeaderIcon, { backgroundColor: colors.surface }]}> 
          <Trophy size={19} color={colors.textMuted} strokeWidth={2} />
        </View>
        <View style={styles.eventsHeaderCopy}>
          <Text token="subtitle">Jornada esportiva</Text>
          <Text token="caption" color="muted" style={styles.eventsSubtitle}>Eventos que fizeram parte dessa história</Text>
        </View>
        <View style={[styles.eventsCountPill, { backgroundColor: colors.surface }]}> 
          <Text token="label" color="muted">{eventsCount}</Text>
        </View>
      </View>
      {eventsLoading ? (
        <View style={styles.skeletonList}>
          {Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} width="100%" height={142} radius={18} />)}
        </View>
      ) : null}
    </>
  );

  return (
    <>
    <FlatList
      style={{ backgroundColor: colors.surface }}
      data={eventsLoading ? [] : visibleEvents}
      keyExtractor={(item) => item.id}
      initialNumToRender={6}
      maxToRenderPerBatch={6}
      windowSize={5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[styles.content, { width: contentWidth }]}
      ListHeaderComponent={Header}
      onEndReached={() => {
        if (visibleCount < events.length) setVisibleCount((current) => Math.min(current + 12, events.length));
      }}
      onEndReachedThreshold={0.5}
      renderItem={({ item }) => (
        <PressScale
          onPress={() => onOpenEvent(item)}
          accessibilityRole="button"
          accessibilityLabel={`Abrir evento ${item.title}`}
          style={[styles.eventCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <View style={[styles.eventImage, { backgroundColor: colors.surfaceAlt }]}> 
            {item.coverUrl ? (
              <Image source={{ uri: item.coverUrl }} style={StyleSheet.absoluteFill} resizeMode="cover" />
            ) : (
              <CalendarDays size={28} color={colors.textMuted} strokeWidth={1.5} />
            )}
            <View style={styles.statusBadge}>
              <Text token="caption" style={styles.statusLabel}>{item.statusLabel}</Text>
            </View>
          </View>
          <View style={styles.eventInfo}>
            <View style={styles.eventMetaRow}>
              <View style={[styles.dateBadge, { backgroundColor: colors.surfaceAlt }]}> 
                <CalendarDays size={13} color={colors.textMuted} strokeWidth={2} />
                <Text token="caption" color="muted" numberOfLines={1} style={styles.eventDate}>{item.dateLabel}</Text>
              </View>
            </View>
            <Text token="subtitle" numberOfLines={2} style={styles.eventTitle}>{item.title}</Text>
            <View style={[styles.eventMetaRow, styles.organizationRow]}>
              <MapPin size={14} color={colors.textMuted} strokeWidth={1.8} />
              <Text token="caption" color="muted" numberOfLines={1} style={styles.eventOrganization}>{item.organizationName}</Text>
            </View>
            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}> 
              <Text token="label" color="primary" style={styles.viewEventLabel}>Ver evento</Text>
            </View>
          </View>
        </PressScale>
      )}
      ListEmptyComponent={!eventsLoading ? (
        <EmptyState
          icon={CalendarDays}
          variant="empty"
          title="Nenhum evento por aqui ainda"
          description={isOwnProfile ? "Explore eventos e comece a construir sua vida esportiva." : undefined}
          actionLabel={isOwnProfile && onExploreEvents ? "Explorar eventos" : undefined}
          onAction={isOwnProfile ? onExploreEvents : undefined}
        />
      ) : null}
    />
    <PhotoLightbox photoUrl={lightboxOpen ? photoUrl : null} onClose={() => setLightboxOpen(false)} />
    </>
  );
}

function Metric({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  const content = (
    <>
      <Text token="subtitle" style={styles.metricValue}>{value}</Text>
      <Text token="caption" color="muted" style={styles.normalText}>{label}</Text>
    </>
  );
  return onPress ? <PressScale style={styles.metric} onPress={onPress} accessibilityRole="button" accessibilityLabel={`${value} ${label}`}>{content}</PressScale> : <View style={styles.metric} accessibilityLabel={`${value} ${label}`}>{content}</View>;
}

function profileInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return `${parts[0][0] ?? ""}${parts.length > 1 ? parts[parts.length - 1][0] ?? "" : ""}`.toUpperCase();
}

function InstagramIcon({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" accessibilityLabel="Instagram">
      <Rect x="3" y="3" width="18" height="18" rx="5" stroke={color} strokeWidth="2" />
      <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth="2" />
      <Circle cx="17.5" cy="6.5" r="1" fill={color} />
    </Svg>
  );
}

const styles = StyleSheet.create({
  content: { alignSelf: "center", paddingBottom: 28 },
  identityRow: { flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: 20, paddingTop: 16 },
  avatarWrap: { width: 82, height: 82 },
  profileAvatar: { width: 82, height: 82, borderRadius: 999 },
  profileAvatarFallback: { width: 82, height: 82, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  avatarInitials: { color: "#0A2E1A", fontSize: 25 },
  avatarEdit: { position: "absolute", right: -2, bottom: 1, width: 25, height: 25, borderRadius: 999, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  metrics: { flex: 1, flexDirection: "row", justifyContent: "space-around", minWidth: 0 },
  metric: { alignItems: "center", minWidth: 54 },
  metricValue: { fontSize: 18, lineHeight: 22 },
  normalText: { textTransform: "none", letterSpacing: 0 },
  details: { paddingHorizontal: 20, paddingTop: 14 },
  profileName: { fontSize: 18, lineHeight: 23 },
  handle: { marginTop: 0 },
  bio: { marginTop: 6, lineHeight: 18 },
  location: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7 },
  socials: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  socialButton: { minHeight: 32, maxWidth: "100%", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, paddingHorizontal: 10 },
  actions: { flexDirection: "row", gap: 12, marginHorizontal: 20, marginTop: 16, marginBottom: 20 },
  action: { flex: 1, minWidth: 0 },
  eventsHeader: { flexDirection: "row", alignItems: "center", gap: 12, marginHorizontal: 20, marginBottom: 14, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 16 },
  eventsHeaderIcon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  eventsHeaderCopy: { flex: 1, minWidth: 0 },
  eventsSubtitle: { textTransform: "none", letterSpacing: 0, marginTop: 2 },
  eventsCountPill: { minWidth: 34, height: 34, borderRadius: 999, alignItems: "center", justifyContent: "center", paddingHorizontal: 7 },
  skeletonList: { gap: 14, paddingHorizontal: 16 },
  eventCard: { minHeight: 148, marginHorizontal: 20, marginBottom: 14, borderWidth: 1, borderRadius: 18, overflow: "hidden", flexDirection: "row", shadowColor: "#141821", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 9, elevation: 2 },
  eventImage: { width: "36%", minHeight: 146, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  statusBadge: { position: "absolute", left: 9, bottom: 9, minHeight: 23, borderRadius: 999, paddingHorizontal: 8, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(20,24,33,0.76)" },
  statusLabel: { color: "#FFFFFF", fontSize: 9, fontWeight: "700", textTransform: "none", letterSpacing: 0 },
  eventInfo: { flex: 1, minWidth: 0, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 10 },
  eventMetaRow: { flexDirection: "row", alignItems: "center", minWidth: 0 },
  dateBadge: { alignSelf: "flex-start", minHeight: 24, maxWidth: "100%", borderRadius: 999, paddingHorizontal: 8, flexDirection: "row", alignItems: "center", gap: 5 },
  eventDate: { fontWeight: "800", textTransform: "uppercase", letterSpacing: 0, flexShrink: 1, fontSize: 10 },
  eventTitle: { marginTop: 8, lineHeight: 20, fontSize: 15 },
  organizationRow: { marginTop: 5 },
  eventOrganization: { flex: 1, textTransform: "none", letterSpacing: 0 },
  cardFooter: { borderTopWidth: 1, flexDirection: "row", alignItems: "center", marginTop: "auto", paddingTop: 8 },
  viewEventLabel: { textTransform: "none", letterSpacing: 0 },
});
