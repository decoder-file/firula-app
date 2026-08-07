import { useRouter } from "expo-router";
import { Building2, Heart, MapPin } from "lucide-react-native";
import { FlatList, Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EventCard } from "@/components/EventCard";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { FormButton } from "@/components/ui/FormButton";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorites";
import { useToggleFavoriteOrganizationBySlug } from "@/hooks/useOrganizer";
import { useScreenLog } from "@/hooks/useScreenLog";
import type { FavoriteItem } from "@/services/favorites.service";
import { colors } from "@/theme/colors";

function FavoriteSkeleton() {
  return (
    <View className="flex-row gap-3 rounded-2xl bg-card p-3">
      <Skeleton className="h-20 w-20 rounded-xl" />
      <View className="flex-1 gap-2 py-0.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="h-3.5 w-3/4 rounded-full" />
        <View className="flex-row gap-1.5">
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-16 rounded-full" />
        </View>
      </View>
    </View>
  );
}

function EventFavoriteRow({ item }: { item: Extract<FavoriteItem, { type: "EVENT" }> }) {
  const { mutate: toggle, isPending } = useToggleFavorite();

  const event = {
    id: item.event.id,
    slug: item.event.slug,
    title: item.event.name,
    date: item.event.startsAt.split("T")[0],
    city: `${item.event.location.city}, ${item.event.location.state}`,
    eventType: item.event.sports[0]?.name ?? "",
    image: item.event.coverUrl ? { uri: item.event.coverUrl } : null,
  };

  return (
    <View className="relative">
      <EventCard event={event} variant="compact" />
      <AnimatedPressable
        className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5"
        disabled={isPending}
        onPress={() => toggle({ eventId: item.event.id, isFavorited: true })}
      >
        <Heart color={colors.primary} fill={colors.primary} size={16} strokeWidth={1.5} />
      </AnimatedPressable>
    </View>
  );
}

function OrganizationFavoriteRow({ item }: { item: Extract<FavoriteItem, { type: "ORGANIZATION" }> }) {
  const router = useRouter();
  const { mutate: toggle, isPending } = useToggleFavoriteOrganizationBySlug();
  const { organization } = item;

  return (
    <View className="relative">
      <AnimatedPressable
        className="flex-row items-center gap-3 rounded-2xl bg-card p-3"
        onPress={() => router.push(`/organizer/${organization.slug}` as never)}
      >
        {organization.logoUrl ? (
          <Image source={{ uri: organization.logoUrl }} className="h-20 w-20 rounded-xl" resizeMode="cover" />
        ) : (
          <LinearGradient colors={["#1a3a2a", "#0f2218"]} className="h-20 w-20 items-center justify-center rounded-xl">
            <Building2 color="#ffffff" size={26} strokeWidth={1.5} />
          </LinearGradient>
        )}
        <View className="flex-1 justify-between py-0.5">
          <View>
            <View className="self-start rounded-full border border-primary px-2 py-1">
              <Text className="font-medium text-[10px] text-primary">Organização</Text>
            </View>
            <Text numberOfLines={2} className="mt-1 font-semibold text-sm text-foreground">
              {organization.name}
            </Text>
          </View>
          {organization.city ? (
            <View className="flex-row items-center gap-1.5">
              <MapPin color="#727985" size={12} strokeWidth={1.5} />
              <Text numberOfLines={1} className="flex-1 text-xs text-muted-foreground">
                {[organization.city, organization.state].filter(Boolean).join(", ")}
              </Text>
            </View>
          ) : null}
        </View>
      </AnimatedPressable>
      <AnimatedPressable
        className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5"
        disabled={isPending}
        onPress={() => toggle({ orgSlug: organization.slug, isFavorited: true })}
      >
        <Heart color={colors.primary} fill={colors.primary} size={16} strokeWidth={1.5} />
      </AnimatedPressable>
    </View>
  );
}

function FavoriteRow({ item }: { item: FavoriteItem }) {
  if (item.type === "ORGANIZATION") return <OrganizationFavoriteRow item={item} />;
  return <EventFavoriteRow item={item} />;
}

export default function FavoritesScreen() {
  useScreenLog();
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();

  const { data, isLoading, refetch, isRefetching } = useFavorites();

  const favorites = data?.favorites ?? [];

  if (!isAuthenticated) {
    return (
      <Screen edges={["top", "left", "right"]}>
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Heart color={colors.mutedForeground} size={28} strokeWidth={1.5} />
          </View>
          <Text className="font-bold text-base text-foreground">Faça login para ver favoritos</Text>
          <Text className="mt-2 text-center text-sm text-muted-foreground">
            Salve eventos e organizações que você acompanha e acesse rapidamente.
          </Text>
          <FormButton className="mt-6 w-full" label="Entrar" onPress={() => router.push("/login-modal")} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="px-4 pb-3 pt-4">
        <Text className="font-bold text-lg text-foreground">Favoritos</Text>
        {!isLoading && favorites.length > 0 ? (
          <Text className="mt-0.5 text-xs text-muted-foreground">
            {favorites.length} favorito{favorites.length > 1 ? "s" : ""} salvo{favorites.length > 1 ? "s" : ""}
          </Text>
        ) : null}
      </View>

      <View className="h-px bg-border" />

      {isLoading ? (
        <View className="gap-3 px-4 pt-4">
          <FavoriteSkeleton />
          <FavoriteSkeleton />
          <FavoriteSkeleton />
        </View>
      ) : favorites.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Heart color={colors.mutedForeground} size={28} strokeWidth={1.5} />
          </View>
          <Text className="font-semibold text-sm text-foreground">Nenhum favorito ainda</Text>
          <Text className="mt-1 text-center text-sm text-muted-foreground">
            Toque no coração em qualquer evento ou organização para salvar aqui.
          </Text>
          <AnimatedPressable className="mt-6" onPress={() => router.push("/(tabs)/explore")}>
            <Text className="font-medium text-sm text-primary">Explorar eventos</Text>
          </AnimatedPressable>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.favoriteId}
          renderItem={({ item }) => <FavoriteRow item={item} />}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}
