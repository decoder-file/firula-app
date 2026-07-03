import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Globe, Instagram, MapPin, Star, Users } from "lucide-react-native";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Avatar } from "@/components/Avatar";
import { EventCard } from "@/components/EventCard";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { FormButton } from "@/components/ui/FormButton";
import { useIsAuthenticated } from "@/hooks/useAuth";
import { useFollowOrganizer, useOrganizerProfile, useRateOrganizer } from "@/hooks/useOrganizer";
import { useScreenLog } from "@/hooks/useScreenLog";
import { colors } from "@/theme/colors";
import { formatDateShort } from "@/utils/format";

export default function OrganizerScreen() {
  useScreenLog();
  const router = useRouter();
  const { id: slug } = useLocalSearchParams<{ id: string }>();
  const isAuthenticated = useIsAuthenticated();

  const { data: organizer, isLoading, isError } = useOrganizerProfile(slug ?? "");
  const followMutation = useFollowOrganizer(slug ?? "");
  const rateMutation = useRateOrganizer(slug ?? "");

  const [following, setFollowing] = useState(false);
  const [userRating, setUserRating] = useState(0);

  const handleFollow = () => {
    if (!isAuthenticated) {
      router.push("/login-modal");
      return;
    }
    followMutation.mutate(following, {
      onSuccess: () => setFollowing((f) => !f),
    });
  };

  const handleRate = (rating: number) => {
    if (!isAuthenticated) {
      router.push("/login-modal");
      return;
    }
    rateMutation.mutate(
      { rating },
      {
        onSuccess: () => {
          setUserRating(rating);
          Alert.alert("Avaliação enviada", "Obrigado pela sua avaliação!");
        },
      },
    );
  };

  if (isLoading) {
    return (
      <Screen edges={["left", "right"]}>
        <Stack.Screen options={{ title: "Organizador", headerShadowVisible: false, headerStyle: { backgroundColor: "#ffffff" } }} />
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          <View className="items-center px-4 pt-6">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="mt-3 h-5 w-40 rounded-full" />
            <Skeleton className="mt-2 h-3.5 w-24 rounded-full" />
          </View>
          <View className="mt-5 flex-row justify-center gap-10 px-4">
            <Skeleton className="h-14 w-20 rounded-2xl" />
            <Skeleton className="h-14 w-20 rounded-2xl" />
            <Skeleton className="h-14 w-20 rounded-2xl" />
          </View>
          <View className="mt-5 gap-3 px-4">
            <Skeleton className="h-12 rounded-2xl" />
            <Skeleton className="h-3.5 w-full rounded-full" />
            <Skeleton className="h-3.5 w-3/4 rounded-full" />
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (isError || !organizer) {
    return (
      <Screen>
        <Stack.Screen options={{ title: "Organizador", headerShadowVisible: false }} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-muted-foreground">Organizador não encontrado</Text>
          <AnimatedPressable className="mt-4" onPress={() => router.back()}>
            <Text className="font-medium text-sm text-primary">Voltar</Text>
          </AnimatedPressable>
        </View>
      </Screen>
    );
  }

  const events = organizer.events.map((e) => ({
    id: e.id,
    slug: e.slug,
    title: e.name,
    date: e.startsAt.split("T")[0],
    city: `${e.location.city}, ${e.location.state}`,
    eventType: "",
    image: e.coverUrl ? { uri: e.coverUrl } : null,
  }));

  return (
    <Screen edges={["left", "right"]}>
      <Stack.Screen options={{ title: organizer.tradeName, headerShadowVisible: false, headerStyle: { backgroundColor: "#ffffff" } }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* ── Header ───────────────────────────────────────── */}
        <View className="items-center px-4 pt-6">
          {organizer.logoUrl ? (
            <Image source={{ uri: organizer.logoUrl }} className="h-20 w-20 rounded-full" resizeMode="cover" />
          ) : (
            <Avatar name={organizer.tradeName} size={80} />
          )}

          <Text className="mt-3 font-bold text-xl text-foreground">{organizer.tradeName}</Text>

          <View className="mt-1 flex-row items-center gap-1">
            <MapPin color={colors.mutedForeground} size={12} strokeWidth={1.5} />
            <Text className="text-xs text-muted-foreground">
              {organizer.city}, {organizer.state}
            </Text>
          </View>

          {/* Social links */}
          <View className="mt-3 flex-row gap-3">
            {organizer.website ? (
              <View className="rounded-full bg-secondary p-2">
                <Globe color={colors.mutedForeground} size={14} strokeWidth={1.5} />
              </View>
            ) : null}
            {organizer.instagram ? (
              <View className="rounded-full bg-secondary p-2">
                <Instagram color={colors.mutedForeground} size={14} strokeWidth={1.5} />
              </View>
            ) : null}
          </View>
        </View>

        {/* ── Stats ─────────────────────────────────────────── */}
        <View className="mt-5 flex-row justify-center gap-6 px-4">
          <StatCard value={organizer.followersCount} label="Seguidores" />
          <StatCard value={organizer.ratingsCount} label="Avaliações" />
          <StatCard value={organizer.averageRating.toFixed(1)} label="Nota" suffix="★" />
        </View>

        {/* ── Follow button ─────────────────────────────────── */}
        <View className="mt-5 px-4">
          <FormButton
            label={following ? "Seguindo" : "Seguir"}
            loadingLabel="Aguarde..."
            isLoading={followMutation.isPending}
            onPress={handleFollow}
            className={following ? "bg-secondary" : undefined}
            textClassName={following ? "text-foreground" : undefined}
          />
        </View>

        {/* ── Description ───────────────────────────────────── */}
        {organizer.description ? (
          <View className="mt-5 px-4">
            <Text className="font-bold text-sm text-foreground">Sobre</Text>
            <Text className="mt-2 leading-6 text-sm text-muted-foreground">{organizer.description}</Text>
          </View>
        ) : null}

        {/* ── Events ────────────────────────────────────────── */}
        {events.length > 0 ? (
          <View className="mt-6 px-4">
            <Text className="font-bold text-sm text-foreground">Eventos</Text>
            <View className="mt-3 gap-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} variant="compact" />
              ))}
            </View>
          </View>
        ) : null}

        {/* ── Rating ────────────────────────────────────────── */}
        <View className="mt-6 px-4">
          <Text className="font-bold text-sm text-foreground">Avaliar organizador</Text>
          <View className="mt-3 flex-row gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <AnimatedPressable key={star} onPress={() => handleRate(star)} disabled={rateMutation.isPending}>
                <Star
                  size={32}
                  strokeWidth={1.5}
                  color={star <= userRating ? colors.primary : colors.mutedForeground}
                  fill={star <= userRating ? colors.primary : "transparent"}
                />
              </AnimatedPressable>
            ))}
          </View>
          {!isAuthenticated ? (
            <Text className="mt-2 text-xs text-muted-foreground">Faça login para avaliar</Text>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

const StatCard = ({ value, label, suffix }: { value: number | string; label: string; suffix?: string }) => (
  <View className="min-w-[70px] items-center rounded-2xl bg-card px-3 py-3">
    <Text className="font-bold text-base text-foreground">
      {value}
      {suffix}
    </Text>
    <Text className="mt-0.5 text-xs text-muted-foreground">{label}</Text>
  </View>
);
