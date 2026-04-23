import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Animated, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CalendarDays, CheckCircle2, ChevronDown, ChevronUp, Clock3, MapPin, Minus, Plus } from "lucide-react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Avatar } from "@/components/Avatar";
import { EventDetailHeader } from "@/components/EventDetailHeader";
import { EventDetailHeaderCompact } from "@/components/EventDetailHeaderCompact";
import { FacialIdModal } from "@/components/FacialIdModal";
import { Screen } from "@/components/Screen";
import { useApp } from "@/contexts/AppContext";
import { useScreenLog } from "@/hooks/useScreenLog";
import { getEventById, getOrganizerSlug } from "@/data/mockData";
import { colors } from "@/theme/colors";
import { formatCurrency, formatDateLong } from "@/utils/format";

export default function EventDetailScreen() {
  useScreenLog();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart } = useApp();
  const insets = useSafeAreaInsets();
  const event = useMemo(() => getEventById(id ?? ""), [id]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const compactHeaderOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [showSchedule, setShowSchedule] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showFaq, setShowFaq] = useState(false);
  const [showFacialModal, setShowFacialModal] = useState(false);
  const [facialRegistered, setFacialRegistered] = useState(false);
  const [facialDismissed, setFacialDismissed] = useState(false);

  const handleAddTicket = (ticketId: string) => {
    setSelectedTickets((prev) => ({
      ...prev,
      [ticketId]: (prev[ticketId] || 0) + 1,
    }));
  };

  const handleRemoveTicket = (ticketId: string) => {
    setSelectedTickets((prev) => {
      const newTickets = { ...prev };
      if (newTickets[ticketId] > 1) {
        newTickets[ticketId]--;
      } else {
        delete newTickets[ticketId];
      }
      return newTickets;
    });
  };

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  const handleScroll = useCallback(
    (event: any) => {
      Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      })(event);
    },
    [scrollY]
  );

  if (!event) {
    return (
      <Screen>
        <Text className="m-auto text-sm text-muted-foreground">Evento não encontrado</Text>
      </Screen>
    );
  }

  const totalPrice = event.ticketTypes.reduce((sum, ticket) => {
    const quantity = selectedTickets[ticket.id] || 0;
    return sum + ticket.price * quantity;
  }, 0);

  const handleBuy = () => {
    if (event.requiresFacialId && !facialRegistered) {
      setShowFacialModal(true);
      return;
    }

    if (totalTickets === 0) return;

    Object.entries(selectedTickets).forEach(([ticketId, quantity]) => {
      const ticket = event.ticketTypes.find((item) => item.id === ticketId);
      if (!ticket) return;

      addToCart({
        eventId: event.id,
        ticketTypeId: ticket.id,
        ticketTypeName: ticket.name,
        quantity,
        price: ticket.price,
      });
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
        mandatory={totalTickets > 0 && !facialRegistered && !!event.requiresFacialId && !facialDismissed}
      />

      <View className="flex-1">
        {/* Animated Compact Header */}
        <Animated.View style={{ opacity: compactHeaderOpacity, paddingTop: insets.top }}>
          <EventDetailHeaderCompact />
        </Animated.View>

        {/* Scrollable Content */}
        <Animated.ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 140 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {/* Full Header with Image */}
          <Animated.View style={{ opacity: headerOpacity }}>
            <EventDetailHeader eventImage={event.image} />
          </Animated.View>

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
                  const quantity = selectedTickets[ticket.id] || 0;
                  const soldOut = ticket.available === 0;

                  return (
                    <View
                      key={ticket.id}
                      className={`rounded-2xl border-2 p-4 ${quantity > 0 ? "border-primary bg-accent" : soldOut ? "border-border bg-muted opacity-50" : "border-border bg-card"}`}
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1">
                          <Text className="font-bold text-sm text-foreground">{ticket.name}</Text>
                          <Text className="mt-1 text-xs text-muted-foreground">{ticket.description}</Text>
                        </View>
                        <Text className="font-bold text-sm text-primary">{formatCurrency(ticket.price)}</Text>
                      </View>
                      <View className="mt-3 flex-row items-center justify-between">
                        <Text className="text-[10px] text-muted-foreground">
                          {soldOut ? "Esgotado" : `${ticket.available} disponíveis`}
                        </Text>
                        {!soldOut && (
                          <View className="flex-row items-center gap-2 rounded-full bg-white px-2 py-1">
                            <AnimatedPressable
                              disabled={quantity === 0}
                              onPress={() => handleRemoveTicket(ticket.id)}
                              className="rounded-full p-1"
                            >
                              <Minus color={quantity === 0 ? colors.mutedForeground : colors.primary} size={16} strokeWidth={2} />
                            </AnimatedPressable>
                            <Text className="w-6 text-center font-semibold text-sm text-foreground">{quantity}</Text>
                            <AnimatedPressable onPress={() => handleAddTicket(ticket.id)} className="rounded-full p-1">
                              <Plus color={colors.primary} size={16} strokeWidth={2} />
                            </AnimatedPressable>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        </Animated.ScrollView>

        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-card px-4 pb-8 pt-4">
          <View className="flex-row items-center gap-4">
            <View>
              <Text className="text-xs text-muted-foreground">Total ({totalTickets})</Text>
              <Text className="font-extrabold text-lg text-foreground">{formatCurrency(totalPrice)}</Text>
            </View>
            <AnimatedPressable className={`flex-1 rounded-2xl py-4 ${totalTickets > 0 ? "bg-primary" : "bg-primary/40"}`} disabled={totalTickets === 0} onPress={handleBuy}>
              <Text className="text-center font-bold text-sm text-primary-foreground">Comprar ingresso{totalTickets > 1 ? "s" : ""}</Text>
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