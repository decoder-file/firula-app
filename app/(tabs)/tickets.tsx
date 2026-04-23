import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { CalendarDays, ChevronRight, MapPin, QrCode, ScanFace, Ticket, UserRound } from "lucide-react-native";
import { useRouter } from "expo-router";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import { useApp } from "@/contexts/AppContext";
import { useScreenLog } from "@/hooks/useScreenLog";
import { getEventById } from "@/data/mockData";
import { formatDateWithYear } from "@/utils/format";
import { Image, Text as RNText } from "react-native";

export default function TicketsScreen() {
  useScreenLog();
  const router = useRouter();
  const { tickets } = useApp();
  const [filter, setFilter] = useState<"active" | "used" | "all">("active");

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === "all") return true;
    if (filter === "active") return ticket.status === "active";
    return ticket.status === "used";
  });

  return (
    <Screen edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="bg-card px-4 py-4">
          <Text className="font-bold text-lg text-foreground">Meus Ingressos</Text>
          <View className="mt-3 flex-row gap-2">
            {([
              { id: "active", label: "Ativos" },
              { id: "used", label: "Usados" },
              { id: "all", label: "Todos" },
            ] as const).map((item) => {
              const active = filter === item.id;

              return (
                <AnimatedPressable
                  key={item.id}
                  onPress={() => setFilter(item.id)}
                  className={`rounded-full px-4 py-2 ${active ? "bg-primary" : "bg-secondary"}`}
                >
                  <Text className={`font-medium text-xs ${active ? "text-primary-foreground" : "text-secondary-foreground"}`}>{item.label}</Text>
                </AnimatedPressable>
              );
            })}
          </View>
        </View>

        <View className="gap-4 px-4 pt-4">
          {!filteredTickets.length ? (
            <View className="mt-14 items-center">
              <Ticket color="#c8ccd4" size={48} strokeWidth={1.5} />
              <Text className="mt-3 text-sm text-muted-foreground">Nenhum ingresso encontrado para este filtro.</Text>
              <AnimatedPressable className="mt-4 rounded-2xl bg-primary px-6 py-3" onPress={() => router.push("/") }>
                <Text className="font-bold text-sm text-primary-foreground">Descobrir eventos</Text>
              </AnimatedPressable>
            </View>
          ) : null}

          {filteredTickets.map((ticket) => {
            const event = getEventById(ticket.eventId);

            if (!event) return null;

            return (
              <View key={ticket.id} className="overflow-hidden rounded-3xl bg-card">
                <View className="relative h-32">
                  <Image source={event.image} className="h-full w-full" resizeMode="cover" />
                  <View className="absolute inset-0 bg-black/35" />
                  <View className="absolute bottom-3 left-3 right-3">
                    <Text numberOfLines={1} className="font-bold text-sm text-white">
                      {event.title}
                    </Text>
                  </View>
                </View>
                <View className="gap-3 p-4">
                  <View className="flex-row items-center gap-4">
                    <View className="flex-row items-center gap-1">
                      <CalendarDays color="#727985" size={12} strokeWidth={1.5} />
                      <Text className="text-xs text-muted-foreground">{formatDateWithYear(event.date)}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <MapPin color="#727985" size={12} strokeWidth={1.5} />
                      <Text className="text-xs text-muted-foreground">{event.city}</Text>
                    </View>
                  </View>

                  <View className="self-start rounded-full bg-accent px-3 py-1">
                    <Text className="font-medium text-xs text-accent-foreground">{ticket.ticketType}</Text>
                  </View>

                  <View className="flex-row items-center gap-2 rounded-2xl bg-secondary px-3 py-2.5">
                    {event.requiresFacialId ? (
                      <>
                        <UserRound color="#1fbd63" size={14} strokeWidth={1.5} />
                        <ScanFace color="#1fbd63" size={14} strokeWidth={1.5} />
                        <Text className="font-medium text-xs text-primary">Acesso com Facial ID Firula</Text>
                      </>
                    ) : (
                      <>
                        <QrCode color="#141821" size={14} strokeWidth={1.5} />
                        <Text className="font-medium text-xs text-foreground">Acesso com QR Code</Text>
                      </>
                    )}
                  </View>

                  <AnimatedPressable
                    className="flex-row items-center justify-center gap-1 rounded-2xl border border-border py-3"
                    onPress={() => router.push(`/ticket/${ticket.id}`)}
                  >
                    <RNText className="font-medium text-xs text-foreground">Ver detalhes do ingresso</RNText>
                    <ChevronRight color="#727985" size={14} strokeWidth={1.5} />
                  </AnimatedPressable>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}