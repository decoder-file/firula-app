import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Building2, CalendarDays, Heart, HeartOff, MapPin } from "lucide-react-native";
import { FlatList, Image, StyleSheet, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import {
  BottomSheet,
  Button,
  EmptyState,
  EventCard,
  Skeleton,
  Surface,
  Text,
  TopBar,
  useTheme,
} from "@/design-system";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useToggleFavoriteOrganizationBySlug } from "@/hooks/useOrganizer";
import { useScreenLog } from "@/hooks/useScreenLog";
import type { FavoriteItem } from "@/services/favorites.service";

type EventFavorite = Extract<FavoriteItem, { type: "EVENT" }>;

function formatEventDate(startsAt: string, long = false) {
  return new Intl.DateTimeFormat("pt-BR", long
    ? { dateStyle: "long", timeStyle: "short" }
    : { day: "numeric", month: "short" }
  ).format(new Date(startsAt));
}

function FavoriteSkeleton() {
  const { colors, radius } = useTheme();

  return (
    <View style={[styles.skeletonItem, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}>
      <Skeleton width={72} height={72} radius={radius.md} />
      <View style={styles.skeletonContent}>
        <Skeleton width={72} height={16} radius={999} />
        <Skeleton width="85%" height={15} style={styles.skeletonTitle} />
        <Skeleton width="62%" height={12} style={styles.skeletonMeta} />
      </View>
    </View>
  );
}

function FavoritesHeader({ onBack }: { onBack: () => void }) {
  return <TopBar title="Favoritos" variant="detail" onBack={onBack} />;
}

function FavoriteDetails({ item, removing, onClose, onOpenEvent, onRemove }: {
  item: EventFavorite | null;
  removing: boolean;
  onClose: () => void;
  onOpenEvent: (item: EventFavorite) => void;
  onRemove: (item: EventFavorite) => void;
}) {
  const { colors, radius } = useTheme();

  if (!item) return null;

  const city = `${item.event.location.city}, ${item.event.location.state}`;
  const sport = item.event.sports[0]?.name;

  return (
    <BottomSheet visible title="Detalhes do favorito" onClose={onClose}>
      <View style={styles.detailsContent}>
        {item.event.coverUrl ? (
          <Image
            source={{ uri: item.event.coverUrl }}
            resizeMode="cover"
            style={[styles.detailsImage, { borderRadius: radius.xl }]}
          />
        ) : (
          <View style={[styles.detailsImage, styles.imageFallback, { backgroundColor: colors.surfaceAlt, borderRadius: radius.xl }]}>
            <Heart color={colors.primaryText} size={34} strokeWidth={1.5} />
          </View>
        )}

        {sport ? (
          <View style={[styles.sportTag, { backgroundColor: colors.primarySoft, borderRadius: radius.full }]}>
            <Text token="caption" color="primary" style={styles.sportText}>{sport}</Text>
          </View>
        ) : null}

        <Text token="title" accessibilityRole="header">
          {item.event.name}
        </Text>

        <Surface alt radius="lg" style={styles.eventInfo}>
          <View style={styles.infoRow}>
            <CalendarDays color={colors.textMuted} size={18} strokeWidth={1.75} />
            <Text token="bodySm" color="muted" style={styles.infoText}>
              {formatEventDate(item.event.startsAt, true)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MapPin color={colors.textMuted} size={18} strokeWidth={1.75} />
            <Text token="bodySm" color="muted" style={styles.infoText}>
              {city}
            </Text>
          </View>
        </Surface>

        {item.event.description ? (
          <Text token="body" color="muted" numberOfLines={4}>
            {item.event.description}
          </Text>
        ) : null}

        <View style={styles.detailsActions}>
          <Button
            label="Remover dos favoritos"
            icon={HeartOff}
            variant="secondary"
            loading={removing}
            fullWidth
            onPress={() => onRemove(item)}
          />
          <Button label="Ver evento" fullWidth onPress={() => onOpenEvent(item)} />
        </View>
      </View>
    </BottomSheet>
  );
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function OrganizationFavoriteRow({ item }: { item: Extract<FavoriteItem, { type: "ORGANIZATION" }> }) {
  const router = useRouter();
  const { colors, radius } = useTheme();
  const { mutate: toggle, isPending } = useToggleFavoriteOrganizationBySlug();
  const { organization } = item;
  const location = [organization.city, organization.state].filter(Boolean).join(", ");
  const logoUrl = organization.logoUrl?.trim() || null;

  return (
    <View>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`Organização ${organization.name}${location ? `, ${location}` : ""}`}
        onPress={() => router.push(`/organizer/${organization.slug}` as never)}
        style={[styles.orgRow, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.lg }]}
      >
        {logoUrl ? (
          <Image source={{ uri: logoUrl }} style={[styles.orgLogo, { backgroundColor: colors.surfaceAlt }]} resizeMode="cover" />
        ) : (
          <View style={[styles.orgLogo, styles.imageFallback, { backgroundColor: colors.primarySoft }]}>
            <Text token="subtitle" style={{ color: colors.primaryText }}>
              {getInitials(organization.name)}
            </Text>
          </View>
        )}
        <View style={styles.orgContent}>
          <View>
            <View style={[styles.orgTag, { borderColor: colors.primary }]}>
              <Building2 color={colors.primaryText} size={11} strokeWidth={1.75} />
              <Text token="caption" style={{ color: colors.primaryText, textTransform: "none", letterSpacing: 0 }}>
                Organização
              </Text>
            </View>
            <Text token="subtitle" numberOfLines={2} style={[styles.orgName, { paddingRight: 36 }]}>
              {organization.name}
            </Text>
          </View>
          {location ? (
            <View style={styles.infoRow}>
              <MapPin color={colors.textMuted} size={13} strokeWidth={1.5} />
              <Text token="bodySm" color="muted" numberOfLines={1} style={styles.infoText}>
                {location}
              </Text>
            </View>
          ) : null}
        </View>
      </AnimatedPressable>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel="Remover organização dos favoritos"
        disabled={isPending}
        onPress={() => toggle({ orgSlug: organization.slug, isFavorited: true })}
        style={[styles.orgRemove, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <Heart color={colors.primary} fill={colors.primary} size={16} strokeWidth={1.5} />
      </AnimatedPressable>
    </View>
  );
}

function EventFavoriteRow({ item, onPress }: { item: EventFavorite; onPress: () => void }) {
  const { event } = item;

  return (
    <EventCard
      variant="compact"
      event={{
        id: event.id,
        slug: event.slug,
        title: event.name,
        dateLabel: formatEventDate(event.startsAt),
        city: `${event.location.city}, ${event.location.state}`,
        eventType: event.sports[0]?.name ?? "Evento",
        image: event.coverUrl ? { uri: event.coverUrl } : null,
      }}
      onPress={onPress}
    />
  );
}

function FavoriteRow({ item, onPressEvent }: { item: FavoriteItem; onPressEvent: (item: EventFavorite) => void }) {
  if (item.type === "ORGANIZATION") return <OrganizationFavoriteRow item={item} />;
  return <EventFavoriteRow item={item} onPress={() => onPressEvent(item)} />;
}

export default function FavoritesScreen() {
  useScreenLog();
  const router = useRouter();
  const { colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, refetch, isRefetching } = useFavorites();
  const { mutate: toggleFavorite, isPending: removingFavorite } = useToggleFavorite();
  const [selectedFavorite, setSelectedFavorite] = useState<EventFavorite | null>(null);

  const favorites = data?.favorites ?? [];

  const openEvent = (item: EventFavorite) => {
    setSelectedFavorite(null);
    router.push(`/event/${item.event.slug || item.event.id}`);
  };

  const removeFavorite = (item: EventFavorite) => {
    toggleFavorite(
      { eventId: item.event.id, isFavorited: true },
      { onSuccess: () => setSelectedFavorite(null) },
    );
  };

  return (
    <Screen edges={["left", "right"]}>
      <StatusBar style="auto" />
      <FavoritesHeader
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
            return;
          }

          router.replace("/(tabs)/profile");
        }}
      />

      {!isAuthenticated ? (
        <View style={styles.centeredState}>
          <EmptyState
            icon={Heart}
            title="Faça login para ver favoritos"
            description="Salve eventos que você quer participar e acesse rapidamente."
          />
          <View style={styles.stateAction}>
            <Button label="Entrar" fullWidth onPress={() => router.push("/login-modal")} />
          </View>
        </View>
      ) : isLoading ? (
        <View accessibilityLabel="Carregando favoritos" style={styles.skeletonList}>
          <FavoriteSkeleton />
          <FavoriteSkeleton />
          <FavoriteSkeleton />
        </View>
      ) : favorites.length === 0 ? (
        <View style={styles.centeredState}>
          <EmptyState
            icon={Heart}
            title="Nenhum favorito ainda"
            description="Toque no coração em qualquer evento para salvar aqui."
          />
          <View style={styles.stateAction}>
            <Button
              label="Explorar eventos"
              variant="tonal"
              fullWidth
              onPress={() => router.push("/(tabs)/explore")}
            />
          </View>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.favoriteId}
          renderItem={({ item }) => (
            <FavoriteRow item={item} onPressEvent={(eventItem) => setSelectedFavorite(eventItem)} />
          )}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          style={{ backgroundColor: colors.background }}
        />
      )}

      <FavoriteDetails
        item={selectedFavorite}
        removing={removingFavorite}
        onClose={() => setSelectedFavorite(null)}
        onOpenEvent={openEvent}
        onRemove={removeFavorite}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 32, gap: 10 },
  skeletonList: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  skeletonItem: { flexDirection: "row", gap: 12, padding: 12, borderWidth: 1 },
  skeletonContent: { flex: 1, justifyContent: "center" },
  skeletonTitle: { marginTop: 10 },
  skeletonMeta: { marginTop: 12 },
  centeredState: { flex: 1, justifyContent: "center", paddingBottom: 48 },
  stateAction: { paddingHorizontal: 24, marginTop: -20 },
  detailsContent: { paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  detailsImage: { width: "100%", height: 150 },
  imageFallback: { alignItems: "center", justifyContent: "center" },
  sportTag: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 5, marginTop: 4 },
  sportText: { textTransform: "none", letterSpacing: 0 },
  eventInfo: { padding: 14, gap: 12, marginTop: 4 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  infoText: { flex: 1 },
  detailsActions: { gap: 10, marginTop: 12 },
  orgRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderWidth: 1 },
  orgLogo: { width: 72, height: 72, borderRadius: 12 },
  orgContent: { flex: 1, minWidth: 0, justifyContent: "space-between", alignSelf: "stretch", paddingVertical: 2 },
  orgTag: { flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 1 },
  orgName: { marginTop: 4 },
  orgRemove: { position: "absolute", right: 12, top: 12, padding: 6, borderRadius: 999, borderWidth: 1 },
});
