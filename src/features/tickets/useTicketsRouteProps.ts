import React, { useMemo } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { useAddToWallet, useMyTickets } from "@/hooks/useTickets";
import { isApiError } from "@/api/errors";
import type { CustomerTicket } from "@/services/tickets.service";
import type { AppTicket, TicketStatus, TicketsScreenProps } from "@/features/tickets/types";
import { isTicketExpired } from "@/utils/ticketExpiry";

const toAppTicketStatus = (ticket: CustomerTicket): TicketStatus => {
  if (ticket.status !== "VALID") return "used";
  return isTicketExpired(ticket) ? "expired" : "active";
};

const formatTicketDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const mapCustomerTicket = (ticket: CustomerTicket): AppTicket => ({
  id: ticket.id,
  event: ticket.event.name,
  tier: ticket.ticketLot.name,
  dateLabel: formatTicketDate(ticket.event.startsAt),
  city: `${ticket.event.location.city}/${ticket.event.location.state}`,
  code: `FIRULA-${ticket.id.slice(0, 8).toUpperCase()}`,
  status: toAppTicketStatus(ticket),
  facial: false,
  image: ticket.event.coverUrl ? { uri: ticket.event.coverUrl } : undefined,
  passportValidDates: ticket.ticketLot.type === "PASSPORT" ? ticket.ticketLot.passportValidDates : undefined,
});

export const useTicketsRouteProps = (): TicketsScreenProps => {
  const router = useRouter();
  const { data, isPending, isFetching, refetch } = useMyTickets();
  const addToWallet = useAddToWallet();

  useFocusEffect(
    React.useCallback(() => {
      void refetch();
    }, [refetch])
  );

  const tickets = useMemo(() => (data ?? []).map(mapCustomerTicket), [data]);

  const handleAddToWallet = (ticketId: string) => {
    addToWallet.mutate(ticketId, {
      onError: (error) => {
        if (isApiError(error) && error.statusCode === 400) {
          Alert.alert("Indisponível", "Este ingresso não pode ser adicionado à carteira.");
        } else {
          Alert.alert("Erro", "Não foi possível abrir a carteira. Tente novamente.");
        }
      },
    });
  };

  return {
    tickets,
    isLoading: isPending || isFetching,
    renderQr: (value, size) =>
      React.createElement(QRCode, { value, size }),
    onExplore: () => router.push("/(tabs)/explore"),
    onBack: () => {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace("/(tabs)/profile");
    },
    onAddToWallet: handleAddToWallet,
    isAddingToWallet: addToWallet.isPending,
  };
};
