import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  CreditCard,
  MapPin,
  QrCode,
  Share2,
  Ticket,
  TicketCheck,
  UserRound,
} from "lucide-react-native";
import { Alert, Image, Linking, Platform, ScrollView, Share, Text, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import QRCode from "react-native-qrcode-svg";
import { useRef } from "react";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { AuthGate } from "@/components/AuthGate";
import { Screen } from "@/components/Screen";
import { useScreenLog } from "@/hooks/useScreenLog";
import { useTicket } from "@/hooks/useTickets";
import { colors } from "@/theme/colors";

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatCurrencyFromCents = (value: number) =>
  (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

const getStatusLabel = (status: string) => {
  if (status === "VALID") {
    return "Válido";
  }

  if (status === "USED") {
    return "Usado";
  }

  if (status === "CANCELLED") {
    return "Cancelado";
  }

  if (status === "EXPIRED") {
    return "Expirado";
  }

  return status;
};

const getTicketQrValue = (ticketId: string) => `FIRULA-TICKET-${ticketId}`;

const TicketDetailSkeleton = () => (
  <ScrollView
    className="flex-1"
    contentContainerStyle={{ paddingBottom: 28 }}
    showsVerticalScrollIndicator={false}
  >
    <View className="px-4 pb-4 pt-6">
      <View className="h-6 w-3/4 rounded-full bg-secondary" />
      <View className="mt-3 h-6 w-24 rounded-full bg-secondary" />
    </View>

    <View className="mx-4 rounded-3xl bg-card p-5">
      <View className="h-4 w-1/2 rounded-full bg-secondary" />
      <View className="mt-4 gap-4">
        {[1, 2, 3, 4, 5].map((item) => (
          <View key={item} className="h-10 rounded-2xl bg-secondary" />
        ))}
      </View>
    </View>
  </ScrollView>
);

export default function TicketDetailScreen() {
  useScreenLog();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: ticket, isPending, isError, refetch } = useTicket(id ?? "");
  const qrCodeRef = useRef<QRCode | null>(null);

  const buildShareMessage = () => {
    if (!ticket) {
      return "";
    }

    const eventDate = formatDateTime(ticket.event.startsAt);
    const eventLocation = `${ticket.event.location.address} - ${ticket.event.location.city}/${ticket.event.location.state}`;
    const qrValue = getTicketQrValue(ticket.id);

    return [
      "Ingresso Firula",
      `Evento: ${ticket.event.name}`,
      `Data: ${eventDate}`,
      `Local: ${eventLocation}`,
      `Participante: ${ticket.attendee.name}`,
      `QR Code: ${qrValue}`,
    ].join("\n");
  };

  const handleShareTicket = async () => {
    if (!ticket) {
      return;
    }

    const shareMessage = buildShareMessage();

    try {
      const qrBase64 = await new Promise<string>((resolve, reject) => {
        const qrInstance = qrCodeRef.current as unknown as { toDataURL?: (callback: (data: string) => void) => void } | null;

        if (!qrInstance?.toDataURL) {
          reject(new Error("QR code não disponível para compartilhamento."));
          return;
        }

        qrInstance.toDataURL((data) => resolve(data));
      });

      if (!FileSystem.cacheDirectory) {
        throw new Error("Não foi possível acessar o armazenamento temporário.");
      }

      const fileUri = `${FileSystem.cacheDirectory}ingresso-${ticket.id}-qrcode.png`;

      await FileSystem.writeAsStringAsync(fileUri, qrBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await Share.share({
        title: `Ingresso - ${ticket.event.name}`,
        message: shareMessage,
        url: fileUri,
      });
    } catch {
      try {
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable && FileSystem.cacheDirectory) {
          const fallbackQrValue = getTicketQrValue(ticket.id);
          const fallbackFileUri = `${FileSystem.cacheDirectory}ingresso-${ticket.id}-qrcode.txt`;

          await FileSystem.writeAsStringAsync(fallbackFileUri, `${shareMessage}\n${fallbackQrValue}`);
          await Sharing.shareAsync(fallbackFileUri, {
            mimeType: "text/plain",
            dialogTitle: `Ingresso - ${ticket.event.name}`,
            UTI: "public.plain-text",
          });
          return;
        }
      } catch {
        // If fallback fails, show user-facing alert below.
      }

      Alert.alert("Não foi possível compartilhar", "Tente novamente em instantes.");
    }
  };

  const handleOpenNavigation = async () => {
    if (!ticket) {
      return;
    }

    const destination = `${ticket.event.location.address}, ${ticket.event.location.city}, ${ticket.event.location.state}`;
    const encodedDestination = encodeURIComponent(destination);

    const primaryUrl =
      Platform.OS === "ios"
        ? `http://maps.apple.com/?daddr=${encodedDestination}`
        : `google.navigation:q=${encodedDestination}`;
    const fallbackUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedDestination}`;

    try {
      const canOpenPrimary = await Linking.canOpenURL(primaryUrl);
      await Linking.openURL(canOpenPrimary ? primaryUrl : fallbackUrl);
    } catch {
      Alert.alert("Não foi possível abrir o mapa", "Tente novamente em instantes.");
    }
  };

  return (
    <AuthGate
      title="Faça login para ver seu ingresso"
      description="Entre para acessar os detalhes completos do seu ingresso."
    >
      <Screen edges={["top", "left", "right"]}>
        <Stack.Screen options={{ headerShown: false }} />

        <View className="flex-row items-center justify-between border-b border-border bg-white px-4 py-3">
          <AnimatedPressable onPress={() => router.back()}>
            <ArrowLeft color={colors.foreground} size={22} strokeWidth={1.5} />
          </AnimatedPressable>
          <Text className="font-semibold text-sm text-foreground">Detalhes do ingresso</Text>
          <View className="w-7" />
        </View>

        {isPending ? <TicketDetailSkeleton /> : null}

        {isError ? (
          <View className="m-auto items-center">
            <Text className="text-sm text-muted-foreground">Não foi possível carregar o ingresso.</Text>
            <AnimatedPressable className="mt-4 rounded-2xl bg-primary px-6 py-3" onPress={() => refetch()}>
              <Text className="font-bold text-sm text-primary-foreground">Tentar novamente</Text>
            </AnimatedPressable>
          </View>
        ) : null}

        {!isPending && !isError && ticket ? (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingBottom: 28 }}
            showsVerticalScrollIndicator={false}
          >
            {ticket.event.coverUrl ? (
              <Image source={{ uri: ticket.event.coverUrl }} className="h-44 w-full" resizeMode="cover" />
            ) : (
              <View className="h-44 w-full items-center justify-center bg-secondary">
                <Ticket color="#727985" size={28} strokeWidth={1.5} />
              </View>
            )}

            <View className="px-4 pb-4 pt-6">
              <Text className="font-bold text-lg leading-7 text-foreground">{ticket.event.name}</Text>
              <View className="mt-3 self-start rounded-full border border-primary/30 px-3 py-1">
                <Text className="font-medium text-xs text-primary">{ticket.ticketLot.name}</Text>
              </View>
            </View>

            <View className="mx-4 rounded-3xl bg-card p-5">
              <Text className="font-bold text-sm text-foreground">Detalhes do ingresso</Text>
              <View className="mt-4 gap-4">
                <DetailRow
                  icon={<Ticket color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                  label="Status"
                  value={getStatusLabel(ticket.status)}
                />
                <DetailRow
                  icon={<CreditCard color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                  label="Valor pago"
                  value={formatCurrencyFromCents(ticket.ticketLot.price)}
                />
                <DetailRow
                  icon={<Clock3 color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                  label="Emitido em"
                  value={formatDateTime(ticket.createdAt)}
                />
                {ticket.usedAt ? (
                  <DetailRow
                    icon={<TicketCheck color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                    label="Usado em"
                    value={formatDateTime(ticket.usedAt)}
                  />
                ) : null}
                <DetailRow
                  icon={<MapPin color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                  label="Local"
                  value={`${ticket.event.location.city}/${ticket.event.location.state}`}
                  subtitle={ticket.event.location.address}
                />
                <DetailRow
                  icon={<CalendarDays color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                  label="Data e horário"
                  value={formatDateTime(ticket.event.startsAt)}
                />
                <DetailRow
                  icon={<UserRound color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                  label="Participante"
                  value={ticket.attendee.name}
                  subtitle={ticket.attendee.email}
                />
                <DetailRow
                  icon={<TicketCheck color={colors.mutedForeground} size={16} strokeWidth={1.5} />}
                  label="Transferência"
                  value={ticket.canTransfer ? "Disponível" : "Bloqueada"}
                />
              </View>

              <AnimatedPressable
                className="mt-5 flex-row items-center justify-center gap-2 rounded-2xl border border-primary/30 py-3"
                onPress={handleOpenNavigation}
              >
                <MapPin color="#1fbd63" size={16} strokeWidth={1.5} />
                <Text className="font-medium text-sm text-primary">Como chegar</Text>
              </AnimatedPressable>

              <AnimatedPressable
                className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl border border-border py-3"
                onPress={handleShareTicket}
              >
                <Share2 color="#141821" size={16} strokeWidth={1.5} />
                <Text className="font-medium text-sm text-foreground">Compartilhar ingresso</Text>
              </AnimatedPressable>
            </View>

            <View className="mx-4 mt-4 items-center rounded-3xl bg-card p-5">
              <View className="mb-3 flex-row items-center gap-2">
                <QrCode color="#141821" size={16} strokeWidth={1.5} />
                <Text className="font-bold text-sm text-foreground">QR Code do ingresso</Text>
              </View>
              <QRCode
                getRef={(ref) => {
                  qrCodeRef.current = ref;
                }}
                value={getTicketQrValue(ticket.id)}
                size={180}
              />
            </View>
          </ScrollView>
        ) : null}
      </Screen>
    </AuthGate>
  );
}

const DetailRow = ({
  icon,
  label,
  value,
  subtitle,
  valueClassName = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  valueClassName?: string;
}) => (
  <View className="flex-row gap-3">
    <View className="mt-0.5">{icon}</View>
    <View className="flex-1">
      <Text className="text-[10px] text-muted-foreground">{label}</Text>
      <Text className={`font-medium text-sm ${valueClassName}`}>{value}</Text>
      {subtitle ? <Text className="text-xs text-muted-foreground">{subtitle}</Text> : null}
    </View>
  </View>
);
