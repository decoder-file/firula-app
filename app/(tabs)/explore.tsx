import { useMemo, useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EventCard } from "@/components/EventCard";
import { Screen } from "@/components/Screen";
import { Skeleton } from "@/components/Skeleton";
import { useScreenLog } from "@/hooks/useScreenLog";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { platformEventToCardItem } from "@/services/events.service";
import { categories, type EventCategory } from "@/data/mockData";
import { colors } from "@/theme/colors";

function EventSkeleton() {
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
          <Skeleton className="h-3 w-3 rounded-full" />
          <Skeleton className="h-3 w-20 rounded-full" />
        </View>
      </View>
    </View>
  );
}

export default function ExploreScreen() {
  useScreenLog();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("todos");

  const isFiltering = selectedCategory !== "todos";

  const { data, isLoading } = useUpcomingEvents({
    search: query || undefined,
    sportSlug: isFiltering ? selectedCategory : undefined,
    period: "upcoming",
  });

  const events = useMemo(
    () => (data?.data ?? []).map(platformEventToCardItem),
    [data],
  );

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="pb-4 pt-3">
          <Text className="font-bold text-lg text-foreground">Explorar</Text>
          <View className="mt-3 flex-row items-center gap-2 rounded-2xl bg-card px-3 py-3">
            <Search color={colors.mutedForeground} size={18} strokeWidth={1.5} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Busque por esporte, local ou cidade"
              placeholderTextColor={colors.mutedForeground}
              className="flex-1 font-sans text-sm text-foreground"
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
          {categories.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <AnimatedPressable
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                className={`rounded-full border px-4 py-2 ${active ? "border-primary bg-primary" : "border-border bg-card"}`}
              >
                <Text className={`font-medium text-xs ${active ? "text-primary-foreground" : "text-foreground"}`}>{category.label}</Text>
              </AnimatedPressable>
            );
          })}
        </ScrollView>

        <View className="mt-3 gap-3">
          {isLoading ? (
            <>
              <EventSkeleton />
              <EventSkeleton />
              <EventSkeleton />
              <EventSkeleton />
            </>
          ) : events.length === 0 ? (
            <View className="mt-10 items-center">
              <Text className="text-sm text-muted-foreground">Nenhum evento encontrado</Text>
            </View>
          ) : (
            events.map((event) => (
              <EventCard key={event.id} event={event} variant="compact" />
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
