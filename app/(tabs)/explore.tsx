import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Search } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EventCard } from "@/components/EventCard";
import { Screen } from "@/components/Screen";
import { useScreenLog } from "@/hooks/useScreenLog";
import { categories, type EventCategory, events } from "@/data/mockData";
import { colors } from "@/theme/colors";

export default function ExploreScreen() {
  useScreenLog();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("todos");

  const filteredEvents = events.filter((event) => {
    const categoryMatch = selectedCategory === "todos" || event.category === selectedCategory;
    const queryMatch =
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.location.toLowerCase().includes(query.toLowerCase()) ||
      event.city.toLowerCase().includes(query.toLowerCase());
    return categoryMatch && queryMatch;
  });

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
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} variant="compact" />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}