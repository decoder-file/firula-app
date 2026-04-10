import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { ArrowLeft, CalendarDays, CheckCircle2, ChevronDown, ChevronUp, Clock3, Heart, MapPin, Share2 } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Avatar } from "@/components/Avatar";
import { FacialIdModal } from "@/components/FacialIdModal";
import { Screen } from "@/components/Screen";
import { useApp } from "@/contexts/AppContext";
import { getEventById, getOrganizerSlug } from "@/data/mockData";
import { colors } from "@/theme/colors";
import { formatCurrency, formatDateLong } from "@/utils/format";

export default function EventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useApp();
  const event = useMemo(() => getEventById(id ?? ""), [id]);

  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showFacialModal, setShowFacialModal] = useState(false);
  const [facialRegistered, setFacialRegistered] = useState(false);
  const [facialDismissed, setFacialDismissed] = useState(false);

  if (!event) {
    return (
      <Screen>
        <Text className="m-auto text-sm text-muted-foreground">Evento não encontrado</Text>
      </Screen>
    );
  }

  const handleBuy = () => {
    if (event.requiresFacialId && !facialRegistered) {
      setShowFacialModal(true);
      return;
    }

    const ticket = event.ticketTypes.find((item) => item.id === selectedTicket);
    if (!ticket) return;

    addToCart({
      eventId: event.id,
      ticketTypeId: ticket.id,
      ticketTypeName: ticket.name,
      quantity: 1,
      price: ticket.price,
    });
    router.push("/checkout");
  };

  return (
    <Screen edges={["left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <FacialIdModal
        open={showFacialModal}
        onClose={() => {
          setFacialDismissed(true);
          setShowFacialModal(false);
        }}
        onRegister={() => {
          setFacialRegistered(true);
          setShowFacialModal(false);
        }}
        mandatory={selectedTicket !== null && !facialRegistered && !!event.requiresFacialId && !facialDismissed}
      />

      <View className="flex-1">
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
          <View className="relative">
            <Image source={event.image} className="h-64 w-full" resizeMode="cover" />
            <View className="absolute inset-0 bg-black/30" />
            <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between p-4 pt-14">
              <AnimatedPressable className="rounded-full bg-white/85 p-2" onPress={() => router.back()}>
                <ArrowLeft color={colors.foreground} size={20} strokeWidth={1.5} />
              </AnimatedPressable>
              <View className="flex-row gap-2">
                <AnimatedPressable className="rounded-full bg-white/85 p-2">
                  <Share2 color={colors.foreground} size={20} strokeWidth={1.5} />
                </AnimatedPressable>
                <AnimatedPressable className="rounded-full bg-white/85 p-2" onPress={() => setLiked((value) => !value)}>
                  <Heart color={liked ? colors.primary : colors.foreground} fill={liked ? colors.primary : "transparent"} size={20} strokeWidth={1.5} />
                </AnimatedPressable>
              </View>
            </View>
          </View>

          <View className="px-4 pt-4">
            <Text className="font-extrabold text-xl text-foreground">{event.title}</Text>

            <AnimatedPressable className="mt-3 flex-row items-center gap-2" onPress={() => router.push(`/organizer/${getOrganizerSlug(event.organizer.name)}`)}>
              <Avatar uri={event.organizer.avatar} name={event.organizer.name} size={34} />
              <View>
                <View className="flex-row items-center gap-1">
                  <Text className="font-medium text-sm text-foreground">{event.organizer.name}</Text>
                  {event.organizer.verified ? <CheckCircle2 color={colors.primary} size={14} strokeWidth={1.5} /> : null}
                </View>
                <Text className="text-xs text-muted-foreground">Organizador</Text>
              </View>
            </AnimatedPressable>

            <View className="mt-4 flex-row gap-3">
              <InfoCard icon={<CalendarDays color={colors.mutedForeground} size={16} strokeWidth={1.5} />} label="Data" value={formatDateLong(event.date)} />
              <InfoCard icon={<Clock3 color={colors.mutedForeground} size={16} strokeWidth={1.5} />} label="Horário" value={`${event.time}h`} />
            </View>

            <View className="mt-3 rounded-2xl bg-card p-3">
              <View className="flex-row items-center gap-2">
                <MapPin color={colors.mutedForeground} size={16} strokeWidth={1.5} />
                <Text className="font-medium text-xs text-muted-foreground">Local</Text>
              </View>
              <Text className="mt-1 font-semibold text-sm text-foreground">{event.location}</Text>
              <Text className="text-xs text-muted-foreground">{event.address} · {event.city}</Text>
            </View>

            <View className="mt-5">
              <Text className="font-bold text-sm text-foreground">Sobre o evento</Text>
              <Text className="mt-2 leading-6 text-sm text-muted-foreground">{event.description}</Text>
            </View>

            <AccordionSection title="Cronograma" open={showSchedule} onToggle={() => setShowSchedule((value) => !value)}>
              <View className="mt-3 gap-3">
                {event.schedule.map((item) => (
                  <View key={`${item.time}-${item.title}`} className="flex-row gap-3">
                    <View className="mt-1 h-2 w-2 rounded-full bg-primary" />
                    <View className="flex-1">
                      <Text className="font-bold text-xs text-primary">{item.time}</Text>
                      <Text className="font-medium text-sm text-foreground">{item.title}</Text>
                      {item.description ? <Text className="text-xs text-muted-foreground">{item.description}</Text> : null}
                    </View>
                  </View>
                ))}
              </View>
            </AccordionSection>

            <AccordionSection title="Regras" open={showRules} onToggle={() => setShowRules((value) => !value)}>
              <View className="mt-3 gap-2">
                {event.rules.map((rule) => (
                  <View key={rule} className="flex-row gap-2">
                    <Text className="text-xs text-muted-foreground">•</Text>
                    <Text className="flex-1 text-sm text-muted-foreground">{rule}</Text>
                  </View>
                ))}
              </View>
            </AccordionSection>

            <AccordionSection title="Perguntas frequentes" open={showFaq} onToggle={() => setShowFaq((value) => !value)}>
              <View className="mt-3 gap-3">
                {event.faqs.map((faq) => (
                  <View key={faq.question}>
                    <Text className="font-medium text-sm text-foreground">{faq.question}</Text>
                    <Text className="mt-1 text-xs text-muted-foreground">{faq.answer}</Text>
                  </View>
                ))}
              </View>
            </AccordionSection>

            <View className="mt-6">
              <Text className="font-bold text-sm text-foreground">Escolha seu ingresso</Text>
              <View className="mt-3 gap-3">
                {event.ticketTypes.map((ticket) => {
                  const selected = selectedTicket === ticket.id;
                  const soldOut = ticket.available === 0;

                  return (
                    <AnimatedPressable
                      key={ticket.id}
                      disabled={soldOut}
                      onPress={() => setSelectedTicket(ticket.id)}
                      className={`rounded-2xl border-2 p-4 ${selected ? "border-primary bg-accent" : soldOut ? "border-border bg-muted opacity-50" : "border-border bg-card"}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <Text className="font-bold text-sm text-foreground">{ticket.name}</Text>
                        <Text className="font-bold text-sm text-primary">{formatCurrency(ticket.price)}</Text>
                      </View>
                      <Text className="mt-1 text-xs text-muted-foreground">{ticket.description}</Text>
                      <View className="mt-2 flex-row items-center justify-between">
                        <Text className="text-[10px] text-muted-foreground">
                          {soldOut ? "Esgotado" : `${ticket.available} disponíveis`}
                        </Text>
                        {selected ? <CheckCircle2 color={colors.primary} size={16} strokeWidth={1.5} /> : null}
                      </View>
                    </AnimatedPressable>
                  );
                })}
              </View>
            </View>
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-4 pb-8 pt-4">
          <View className="flex-row items-center gap-4">
            <View>
              <Text className="text-xs text-muted-foreground">A partir de</Text>
              <Text className="font-extrabold text-lg text-foreground">{formatCurrency(event.price)}</Text>
            </View>
            <AnimatedPressable className={`flex-1 rounded-2xl py-4 ${selectedTicket ? "bg-primary" : "bg-primary/40"}`} disabled={!selectedTicket} onPress={handleBuy}>
              <Text className="text-center font-bold text-sm text-primary-foreground">Comprar ingresso</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>
    </Screen>
  );
}

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <View className="flex-1 rounded-2xl bg-card p-3">
    <View className="flex-row items-center gap-2">
      {icon}
      <Text className="font-medium text-xs text-muted-foreground">{label}</Text>
    </View>
    <Text className="mt-1 font-semibold text-sm capitalize text-foreground">{value}</Text>
  </View>
);

const AccordionSection = ({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) => (
  <View className="mt-4">
    <AnimatedPressable className="flex-row items-center justify-between" onPress={onToggle}>
      <Text className="font-bold text-sm text-foreground">{title}</Text>
      {open ? <ChevronUp color={colors.mutedForeground} size={18} strokeWidth={1.5} /> : <ChevronDown color={colors.mutedForeground} size={18} strokeWidth={1.5} />}
    </AnimatedPressable>
    {open ? children : null}
  </View>
);