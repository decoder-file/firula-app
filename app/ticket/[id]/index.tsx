import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, CalendarDays, Clock3, CreditCard, MapPin, QrCode, ScanFace, Ticket, UserRound } from "lucide-react-native";
import QRCode from "react-native-qrcode-svg";
import { ScrollView, Text, View } from "react-native";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { Screen } from "@/components/Screen";
import { useApp } from "@/contexts/AppContext";
import { getEventById } from "@/data/mockData";
import { colors } from "@/theme/colors";
import { formatCurrency, formatDateWithYear } from "@/utils/format";

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tickets } = useApp();

  const ticket = tickets.find((item) => item.id === id);
  const event = ticket ? getEventById(ticket.eventId) : null;

  if (!ticket || !event) {
    return (
      <Screen>
        <Text className="m-auto text-sm text-muted-foreground">Ingresso não encontrado</Text>
      </Screen>
    );
  }

  const ticketType = event.ticketTypes.find((item) => item.name === ticket.ticketType);

  return (
    <Screen edges={["top", "left", "right"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between border-b border-border bg-white px-4 py-3">
          <AnimatedPressable onPress={() => router.back()}>
            <ArrowLeft color={colors.foreground} size={22} strokeWidth={1.5} />
          </AnimatedPressable>
          <Text className="font-semibold text-sm text-foreground">Detalhes do ingresso</Text>
          <View className="rounded-full bg-accent px-2.5 py-1">
            <Text className="font-semibold text-[10px] text-accent-foreground">Ativo</Text>
          </View>
        </View>

        <View className="px-4 pb-4 pt-6">
          <Text className="font-bold text-lg leading-7 text-foreground">{event.title}</Text>
          <View className="mt-3 self-start rounded-full border border-primary/30 px-3 py-1">
            <Text className="font-medium text-xs text-primary">{ticket.ticketType}</Text>
          </View>
        </View>

        <View className="mx-4 rounded-3xl bg-card p-6">
          {event.requiresFacialId ? (
            <View className="items-center">
              <View className="flex-row items-center gap-3">
                <UserRound color={colors.primary} size={52} strokeWidth={1} />
                <ScanFace color={colors.primary} size={52} strokeWidth={1} />
              </View>
              <Text className="mt-3 font-semibold text-sm text-primary">Acesso via Facial ID Firula</Text>
              <Text className="mt-1 text-center text-xs text-muted-foreground">Seu reconhecimento facial será utilizado na entrada do evento.</Text>
            </View>
          ) : (
            <View className="items-center">
              <QRCode value={ticket.qrCode} size={180} color={colors.foreground} backgroundColor={colors.card} />
              <Text className="mt-3 text-[11px] text-muted-foreground">{ticket.qrCode}</Text>
              <Text className="mt-1 text-xs text-muted-foreground">Apresente na entrada para check-in</Text>
            </View>
          )}
        </View>

        <View className="mx-4 mt-4 rounded-3xl bg-card p-5">
          <Text className="font-bold text-sm text-foreground">Detalhes do ingresso</Text>
          <View className="mt-4 gap-4">
            <DetailRow icon={<Ticket color={colors.mutedForeground} size={16} strokeWidth={1.5} />} label="Tipo" value={ticket.ticketType} />
            <DetailRow icon={<CreditCard color={colors.mutedForeground} size={16} strokeWidth={1.5} />} label="Valor pago" value={ticketType ? formatCurrency(ticketType.price) : "--"} />
            <DetailRow icon={<Clock3 color={colors.mutedForeground} size={16} strokeWidth={1.5} />} label="Data da compra" value={formatDateWithYear(ticket.purchaseDate)} />
            <DetailRow icon={<MapPin color={colors.mutedForeground} size={16} strokeWidth={1.5} />} label="Local" value={event.location} subtitle={event.address} />
            <DetailRow icon={<CalendarDays color={colors.mutedForeground} size={16} strokeWidth={1.5} />} label="Data e horário" value={`${formatDateWithYear(event.date)} - ${event.time}`} />
            {event.requiresFacialId ? (
              <DetailRow icon={<ScanFace color={colors.primary} size={16} strokeWidth={1.5} />} label="Segurança" value="Facial ID registrado" valueClassName="text-primary" />
            ) : null}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const DetailRow = ({ icon, label, value, subtitle, valueClassName = "text-foreground" }: { icon: React.ReactNode; label: string; value: string; subtitle?: string; valueClassName?: string }) => (
  <View className="flex-row gap-3">
    <View className="mt-0.5">{icon}</View>
    <View className="flex-1">
      <Text className="text-[10px] text-muted-foreground">{label}</Text>
      <Text className={`font-medium text-sm ${valueClassName}`}>{value}</Text>
      {subtitle ? <Text className="text-xs text-muted-foreground">{subtitle}</Text> : null}
    </View>
  </View>
);