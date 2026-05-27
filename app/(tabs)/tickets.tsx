import { useMemo, useState } from "react";
import { Image, Modal, ScrollView, Text, View } from "react-native";
import {
  CalendarDays,
  CircleX,
  ChevronRight,
  MapPin,
  QrCode,
  Ticket,
  TicketCheck,
  UserRound,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { AnimatedPressable } from "@/components/AnimatedPressable";
import { AuthGate } from "@/components/AuthGate";
import { Screen } from "@/components/Screen";
import { TicketsHeader } from "@/components/TicketsHeader";
import { useScreenLog } from "@/hooks/useScreenLog";
import { useMyTickets } from "@/hooks/useTickets";
import type { CustomerTicket } from "@/services/tickets.service";

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

const filterTicket = (ticket: CustomerTicket, filter: "active" | "used" | "all") => {
  if (filter === "all") {
    return true;
  }

  if (filter === "active") {
    return ticket.status === "VALID";
  }

  return ticket.status === "USED";
};

const getTicketQrValue = (ticket: CustomerTicket) => `FIRULA-TICKET-${ticket.id}`;

const TicketsSkeleton = () => (
  <View className="gap-4">
    {[1, 2, 3].map((item) => (
      <View key={item} className="rounded-3xl bg-card p-4">
        <View className="h-32 rounded-2xl bg-secondary" />
        <View className="h-5 w-3/4 rounded-full bg-secondary" />
        <View className="mt-2 h-4 w-1/2 rounded-full bg-secondary" />

        <View className="mt-4 gap-2">
          <View className="h-4 w-2/3 rounded-full bg-secondary" />
          <View className="h-4 w-4/5 rounded-full bg-secondary" />
          <View className="h-4 w-3/5 rounded-full bg-secondary" />
        </View>

        <View className="mt-4 h-10 rounded-2xl bg-secondary" />
        <View className="mt-3 h-10 rounded-2xl bg-secondary" />
      </View>
    ))}
  </View>
);

export default function TicketsScreen() {
  useScreenLog();
  const router = useRouter();
  const [filter, setFilter] = useState<"active" | "used" | "all">("active");
  const [selectedTicket, setSelectedTicket] = useState<CustomerTicket | null>(null);

  const { data: tickets = [], isPending, isError, refetch } = useMyTickets();

  const filteredTickets = useMemo(
    () => tickets.filter((ticket) => filterTicket(ticket, filter)),
    [filter, tickets],
  );

  return (
    <AuthGate
      title="Faça login para ver seus ingressos"
      description="Entre na sua conta para acessar seus ingressos ativos, usados e detalhes de cada evento."
    >
      <Screen edges={["top", "left", "right"]}>
        <TicketsHeader filter={filter} onFilterChange={setFilter} />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="gap-4 px-4 pt-4">
            {isPending ? (
              <TicketsSkeleton />
            ) : null}

            {isError ? (
              <View className="mt-14 items-center">
                <Ticket color="#c8ccd4" size={48} strokeWidth={1.5} />
                <Text className="mt-3 text-sm text-muted-foreground">Não foi possível carregar seus ingressos.</Text>
                <AnimatedPressable className="mt-4 rounded-2xl bg-primary px-6 py-3" onPress={() => refetch()}>
                  <Text className="font-bold text-sm text-primary-foreground">Tentar novamente</Text>
                </AnimatedPressable>
              </View>
            ) : null}

            {!isPending && !isError && !filteredTickets.length ? (
              <View className="mt-14 items-center">
                <Ticket color="#c8ccd4" size={48} strokeWidth={1.5} />
                <Text className="mt-3 text-sm text-muted-foreground">Nenhum ingresso encontrado para este filtro.</Text>
              </View>
            ) : null}

            {!isPending && !isError
              ? filteredTickets.map((ticket) => (
                  <View key={ticket.id} className="rounded-3xl bg-card p-4">
                    {ticket.event.coverUrl ? (
                      <Image
                        source={{ uri: ticket.event.coverUrl }}
                        className="mb-3 h-32 w-full rounded-2xl"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="mb-3 h-32 w-full items-center justify-center rounded-2xl bg-secondary">
                        <Ticket color="#727985" size={22} strokeWidth={1.5} />
                      </View>
                    )}

                    <View className="flex-row items-start justify-between gap-3">
                      <Text className="flex-1 font-bold text-base text-foreground">{ticket.event.name}</Text>
                      <View className="rounded-full bg-accent px-3 py-1">
                        <Text className="font-medium text-[11px] text-accent-foreground">{getStatusLabel(ticket.status)}</Text>
                      </View>
                    </View>

                    <Text className="mt-1 text-xs text-muted-foreground">Organização: {ticket.event.organization.tradeName}</Text>

                    <View className="mt-3 gap-2">
                      <View className="flex-row items-center gap-2">
                        <CalendarDays color="#727985" size={14} strokeWidth={1.5} />
                        <Text className="text-xs text-muted-foreground">{formatDateTime(ticket.event.startsAt)}</Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <MapPin color="#727985" size={14} strokeWidth={1.5} />
                        <Text className="text-xs text-muted-foreground">
                          {ticket.event.location.address} - {ticket.event.location.city}/{ticket.event.location.state}
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <UserRound color="#727985" size={14} strokeWidth={1.5} />
                        <Text className="text-xs text-muted-foreground">
                          {ticket.attendee.name} ({ticket.attendee.email})
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-2">
                        <TicketCheck color="#727985" size={14} strokeWidth={1.5} />
                        <Text className="text-xs text-muted-foreground">
                          {ticket.ticketLot.name} - {formatCurrencyFromCents(ticket.ticketLot.price)}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-3 rounded-2xl bg-secondary px-3 py-2.5">
                      <Text className="text-xs text-muted-foreground">
                        {ticket.canTransfer
                          ? "Transferência disponível"
                          : "Transferência bloqueada"}
                      </Text>
                    </View>

                    <View className="mt-3 gap-1">
                      <Text className="text-[11px] text-muted-foreground">Emitido em: {formatDateTime(ticket.createdAt)}</Text>
                      {ticket.usedAt ? (
                        <Text className="text-[11px] text-muted-foreground">Usado em: {formatDateTime(ticket.usedAt)}</Text>
                      ) : null}
                    </View>

                    <AnimatedPressable
                      className="mt-3 flex-row items-center justify-center gap-1 rounded-2xl border border-primary/30 py-3"
                      onPress={() => setSelectedTicket(ticket)}
                    >
                      <QrCode color="#1fbd63" size={14} strokeWidth={1.5} />
                      <Text className="font-medium text-xs text-primary">Acesso rápido ao QR Code</Text>
                    </AnimatedPressable>

                    <AnimatedPressable
                      className="mt-3 flex-row items-center justify-center gap-1 rounded-2xl border border-border py-3"
                      onPress={() => router.push(`/ticket/${ticket.id}`)}
                    >
                      <Text className="font-medium text-xs text-foreground">Ver detalhes do ingresso</Text>
                      <ChevronRight color="#727985" size={14} strokeWidth={1.5} />
                    </AnimatedPressable>
                  </View>
                ))
              : null}
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent
          visible={Boolean(selectedTicket)}
          onRequestClose={() => setSelectedTicket(null)}
        >
          <View className="flex-1 justify-end bg-black/50">
            <View className="rounded-t-[28px] bg-card p-5">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="font-bold text-base text-foreground">QR Code do ingresso</Text>
                <AnimatedPressable onPress={() => setSelectedTicket(null)}>
                  <CircleX color="#727985" size={20} strokeWidth={1.5} />
                </AnimatedPressable>
              </View>

              {selectedTicket ? (
                <View className="items-center gap-3 rounded-2xl bg-secondary/40 px-4 py-5">
                  <QRCode value={getTicketQrValue(selectedTicket)} size={180} />
                  <Text className="text-center text-xs text-muted-foreground">{selectedTicket.event.name}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </Modal>
      </Screen>
    </AuthGate>
  );
}
