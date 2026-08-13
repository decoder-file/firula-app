import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { CalendarDays, Heart, HeartOff, MapPin } from "lucide-react-native";
import { FlatList, Image, StyleSheet, View } from "react-native";

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
import { useScreenLog } from "@/hooks/useScreenLog";
import type { FavoriteItem } from "@/services/favorites.service";

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
  item: FavoriteItem | null;
  removing: boolean;
  onClose: () => void;
  onOpenEvent: (item: FavoriteItem) => void;
  onRemove: (item: FavoriteItem) => void;
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

export default function FavoritesScreen() {
  useScreenLog();
  const router = useRouter();
  const { colors } = useTheme();
  const isAuthenticated = useIsAuthenticated();
  const { data, isLoading, refetch, isRefetching } = useFavorites();
  const { mutate: toggleFavorite, isPending: removingFavorite } = useToggleFavorite();
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteItem | null>(null);

  const favorites = data?.favorites ?? [];

  const openEvent = (item: FavoriteItem) => {
    setSelectedFavorite(null);
    router.push(`/event/${item.event.slug || item.event.id}`);
  };

  const removeFavorite = (item: FavoriteItem) => {
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
            <EventCard
              variant="compact"
              event={{
                id: item.event.id,
                slug: item.event.slug,
                title: item.event.name,
                dateLabel: formatEventDate(item.event.startsAt),
                city: `${item.event.location.city}, ${item.event.location.state}`,
                eventType: item.event.sports[0]?.name ?? "Evento",
                image: item.event.coverUrl ? { uri: item.event.coverUrl } : null,
              }}
              onPress={() => setSelectedFavorite(item)}
            />
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
});
