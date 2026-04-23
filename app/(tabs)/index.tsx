import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { Bell, Search } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { EventCard } from "@/components/EventCard";
import { Screen } from "@/components/Screen";
import { useApp } from "@/contexts/AppContext";
import { categories, type EventCategory, events } from "@/data/mockData";
import { colors } from "@/theme/colors";

const bannerAds = [
  { id: 1, title: "Copa Verão 2026", subtitle: "Garanta seu ingresso com 20% OFF", colors: ["#42cd7e", "#1fbd63"] as const },
  { id: 2, title: "Maratona SP", subtitle: "Inscrições abertas - vagas limitadas", colors: ["#16a34a", "#166534"] as const },
  { id: 3, title: "Desafio Futevôlei", subtitle: "Copacabana espera por você", colors: ["#0f766e", "#115e59"] as const },
];

const promoStrips = [
  "Cadastre-se e ganhe R$100 de crédito na sua primeira compra",
  "Indique amigos e ganhe cashback de 15% em todos os eventos",
  "Novidade: Facial ID Firula - segurança e agilidade no acesso",
];

export default function HomeScreen() {
  const router = useRouter();
  const { profile } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBanner] = useState(0);
  const [activePromo] = useState(0);

  const featuredEvents = events.filter((event) => event.isFeatured);
  const hotEvents = events.filter((event) => event.isHot);
  const filteredEvents = events.filter((event) => {
    const categoryMatch = selectedCategory === "todos" || event.category === selectedCategory;
    const searchMatch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.city.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="bg-card px-4 pb-4 pt-3">
          <View className="flex-row items-center justify-between">
            <Text className="font-semibold text-lg text-foreground">Olá, {profile.name.split(" ")[0]}</Text>
            <AnimatedPressable className="relative p-2" onPress={() => router.push("/notifications") }>
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

        <View className="px-4">
          {/* {!searchQuery ? (
            <View className="mt-4 rounded-2xl border border-primary/10 bg-[#f4fcf7] px-3 py-2">
              <Text className="text-center font-medium text-[11px] text-primary">{promoStrips[activePromo]}</Text>
            </View>
          ) : null} */}

          {/* {!searchQuery && selectedCategory === "todos" ? (
            <LinearGradient colors={bannerAds[activeBanner].colors} className="mt-4 h-44 rounded-[24px] p-5">
              <View className="mt-auto">
                <Text className="font-medium text-[10px] uppercase tracking-[1px] text-white/70">Destaque</Text>
                <Text className="mt-1 font-extrabold text-2xl text-white">{bannerAds[activeBanner].title}</Text>
                <Text className="mt-1 text-sm text-white/80">{bannerAds[activeBanner].subtitle}</Text>
              </View>
            </LinearGradient>
          ) : null} */}

          {!searchQuery && selectedCategory === "todos" ? (
            <View className="mt-6">
              <SectionHeader title="Destaques" actionLabel="Ver todos" onPress={() => router.push("/(tabs)/explore")} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 12 }}>
                {featuredEvents.map((event) => (
                  <EventCard key={event.id} event={event} variant="featured" />
                ))}
              </ScrollView>
            </View>
          ) : null}

          {!searchQuery && selectedCategory === "todos" ? (
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

          {selectedCategory !== "todos" ? (
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

          {!searchQuery && selectedCategory === "todos" ? (
            <View className="mt-6">
              <SectionHeader title="Em alta" actionLabel="Ver todos" onPress={() => router.push("/(tabs)/explore")} />
              <View className="mt-3 gap-3">
                {hotEvents.slice(0, 3).map((event) => (
                  <EventCard key={event.id} event={event} variant="compact" />
                ))}
              </View>
            </View>
          ) : null}

          <View className="mt-6">
            <Text className="font-bold text-base text-foreground">
              {searchQuery ? "Resultados" : selectedCategory !== "todos" ? categories.find((category) => category.id === selectedCategory)?.label : "Próximos eventos"}
            </Text>
            <View className="mt-3 flex-row flex-wrap gap-3">
              {filteredEvents.map((event) => (
                <View key={event.id} className="w-[48%]">
                  <EventCard event={event} />
                </View>
              ))}
            </View>
            {!filteredEvents.length ? (
              <View className="mt-10 items-center">
                <Text className="text-sm text-muted-foreground">Nenhum evento encontrado</Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

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