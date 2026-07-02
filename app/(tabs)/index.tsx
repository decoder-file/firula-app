import { useState, useMemo } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Bell, Search } from "lucide-react-native";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EventCard } from "@/components/EventCard";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { useApp } from "@/contexts/AppContext";
import { useScreenLog } from "@/hooks/useScreenLog";
import { useFeaturedEvents, useTrendingEvents, useUpcomingEvents } from "@/hooks/useEvents";
import { platformEventToCardItem } from "@/services/events.service";
import { categories, type EventCategory } from "@/data/mockData";
import { colors } from "@/theme/colors";

export default function HomeScreen() {
  useScreenLog();
  const router = useRouter();
  const { profile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasScrolled, setHasScrolled] = useState(false);

  const isSearching = searchQuery.length > 0;
  const isFiltering = selectedCategory !== "todos";
  const showSections = !isSearching && !isFiltering;

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedEvents();
  const { data: trendingData, isLoading: trendingLoading } = useTrendingEvents();
  const { data: upcomingData, isLoading: upcomingLoading } = useUpcomingEvents({
    search: searchQuery || undefined,
    sportSlug: isFiltering ? selectedCategory : undefined,
  });

  const featuredEvents = useMemo(
    () => (featuredData ?? []).map(platformEventToCardItem),
    [featuredData],
  );

  const trendingEvents = useMemo(
    () => (trendingData ?? []).map(platformEventToCardItem),
    [trendingData],
  );

  const upcomingEvents = useMemo(
    () => (upcomingData?.data ?? []).map(platformEventToCardItem),
    [upcomingData],
  );

  return (
    <Screen edges={["top", "left", "right"]}>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      <View
        className="bg-white px-4 pb-4 pt-3"
        style={
          hasScrolled
            ? {
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 8,
                elevation: 4,
              }
            : undefined
        }
      >
        <View className="flex-row items-center justify-between">
          <Text className="font-semibold text-lg text-foreground">Olá, {profile.name.split(" ")[0]}</Text>
          <AnimatedPressable className="relative p-2" onPress={() => router.push("/notifications")}>
            <Bell color={colors.foreground} size={20} strokeWidth={1.5} />
            <View className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
          </AnimatedPressable>
        </View>
        <View className="mt-3 flex-row items-center gap-2 rounded-2xl bg-secondary px-3 py-3">
          <Search color={colors.mutedForeground} size={18} strokeWidth={1.5} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Buscar eventos, locais..."
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 font-sans text-sm text-foreground"
          />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          const nextScrolled = event.nativeEvent.contentOffset.y > 6;
          setHasScrolled((current) => (current === nextScrolled ? current : nextScrolled));
        }}
        scrollEventThrottle={16}
      >
        <View className="px-4">
          <View className="mt-2" />

          {/* ── Destaques ─────────────────────────────────────── */}
          {showSections ? (
            <View className="mt-6">
              <SectionHeader title="Destaques" actionLabel="Ver todos" onPress={() => router.push("/(tabs)/explore")} />
              {featuredLoading ? (
                <FeaturedSkeleton />
              ) : featuredEvents.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
                  {featuredEvents.map((event) => (
                    <EventCard key={event.id} event={event} variant="featured" />
                  ))}
                </ScrollView>
              ) : (
                <EmptySection message="Nenhum evento em destaque" />
              )}
            </View>
          ) : null}

          {/* ── Categorias ────────────────────────────────────── */}
          {showSections ? (
            <View className="mt-2">
              <Text className="font-bold text-base text-foreground">Categorias</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 12 }}>
                {categories
                  .filter((category) => category.id !== "todos")
                  .map((category) => {
                    const active = selectedCategory === category.id;
                    return (
                      <AnimatedPressable
                        key={category.id}
                        onPress={() => setSelectedCategory(category.id)}
                        className={`rounded-full border px-4 py-2 ${active ? "border-primary bg-accent" : "border-border bg-card"}`}
                      >
                        <Text className={`font-medium text-xs ${active ? "text-primary" : "text-foreground"}`}>{category.label}</Text>
                      </AnimatedPressable>
                    );
                  })}
              </ScrollView>
            </View>
          ) : null}

          {isFiltering ? (
            <View className="mt-4 flex-row items-center gap-2">
              <View className="rounded-full bg-primary px-3 py-1">
                <Text className="font-medium text-xs text-primary-foreground">
                  {categories.find((category) => category.id === selectedCategory)?.label}
                </Text>
              </View>
              <AnimatedPressable onPress={() => setSelectedCategory("todos")}>
                <Text className="text-xs text-muted-foreground">Limpar</Text>
              </AnimatedPressable>
            </View>
          ) : null}

          {/* ── Em alta ───────────────────────────────────────── */}
          {showSections ? (
            <View className="mt-6">
              <SectionHeader title="Em alta" actionLabel="Ver todos" onPress={() => router.push("/(tabs)/explore")} />
              {trendingLoading ? (
                <TrendingSkeleton />
              ) : trendingEvents.length > 0 ? (
                <View className="mt-3 gap-3">
                  {trendingEvents.slice(0, 3).map((event) => (
                    <EventCard key={event.id} event={event} variant="compact" />
                  ))}
                </View>
              ) : (
                <EmptySection message="Nenhum evento em alta" />
              )}
            </View>
          ) : null}

          {/* ── Próximos eventos ──────────────────────────────── */}
          <View className="mt-6">
            <Text className="font-bold text-base text-foreground">
              {isSearching
                ? "Resultados"
                : isFiltering
                  ? categories.find((category) => category.id === selectedCategory)?.label
                  : "Próximos eventos"}
            </Text>
            {upcomingLoading ? (
              <UpcomingSkeleton />
            ) : upcomingEvents.length > 0 ? (
              <View className="mt-3 flex-row flex-wrap gap-3">
                {upcomingEvents.map((event) => (
                  <View key={event.id} className="w-[48%]">
                    <EventCard event={event} />
                  </View>
                ))}
              </View>
            ) : (
              <View className="mt-10 items-center">
                <Text className="text-sm text-muted-foreground">Nenhum evento encontrado</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

const SectionHeader = ({ title, actionLabel, onPress }: { title: string; actionLabel?: string; onPress?: () => void }) => (
  <View className="flex-row items-center justify-between">
    <Text className="font-bold text-base text-foreground">{title}</Text>
    {actionLabel ? (
      <AnimatedPressable onPress={onPress}>
        <Text className="font-medium text-xs text-primary">{actionLabel}</Text>
      </AnimatedPressable>
    ) : null}
  </View>
);

const EmptySection = ({ message }: { message: string }) => (
  <View className="mt-3 items-center py-4">
    <Text className="text-sm text-muted-foreground">{message}</Text>
  </View>
);

// ─── Skeletons ─────────────────────────────────────────────────────────────────

/** Mirrors EventCard variant="featured" (300×~220 horizontal card) */
const FeaturedCardSkeleton = () => (
  <View className="mr-3 w-[300px] overflow-hidden rounded-3xl bg-card">
    {/* image area */}
    <Skeleton className="h-44 w-full" />
    {/* meta row */}
    <View className="flex-row items-center gap-2 p-3">
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-3 w-16 rounded-full" />
      <Skeleton className="h-3 w-3 rounded-full" />
      <Skeleton className="h-3 w-24 rounded-full" />
    </View>
  </View>
);

const FeaturedSkeleton = () => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
    <FeaturedCardSkeleton />
    <FeaturedCardSkeleton />
  </ScrollView>
);

/** Mirrors EventCard variant="compact" (horizontal row) */
const TrendingCardSkeleton = () => (
  <View className="flex-row gap-3 rounded-2xl bg-card p-3">
    {/* thumbnail */}
    <Skeleton className="h-20 w-20 rounded-xl" />
    <View className="flex-1 justify-between py-0.5">
      {/* badge */}
      <View>
        <Skeleton className="h-5 w-20 rounded-full" />
        {/* title lines */}
        <Skeleton className="mt-2 h-3.5 w-full rounded-full" />
        <Skeleton className="mt-1.5 h-3.5 w-3/4 rounded-full" />
      </View>
      {/* meta row */}
      <View className="flex-row items-center gap-1.5">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-14 rounded-full" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-full" />
      </View>
    </View>
  </View>
);

const TrendingSkeleton = () => (
  <View className="mt-3 gap-3">
    <TrendingCardSkeleton />
    <TrendingCardSkeleton />
    <TrendingCardSkeleton />
  </View>
);

/** Mirrors EventCard default (grid, 48% width) */
const UpcomingCardSkeleton = () => (
  <View className="w-[48%] overflow-hidden rounded-3xl bg-card">
    {/* image area */}
    <Skeleton className="h-40 w-full" />
    <View className="p-3">
      {/* title lines */}
      <Skeleton className="h-3.5 w-full rounded-full" />
      <Skeleton className="mt-1.5 h-3.5 w-3/4 rounded-full" />
      {/* meta row */}
      <View className="mt-3 flex-row items-center gap-1.5">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-12 rounded-full" />
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-16 rounded-full" />
      </View>
    </View>
  </View>
);

const UpcomingSkeleton = () => (
  <View className="mt-3 flex-row flex-wrap gap-3">
    <UpcomingCardSkeleton />
    <UpcomingCardSkeleton />
    <UpcomingCardSkeleton />
    <UpcomingCardSkeleton />
  </View>
);
