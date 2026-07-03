import React, { useMemo } from "react";
import { useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { useMyTickets } from "@/hooks/useTickets";
import type { CustomerTicket } from "@/services/tickets.service";
import type { AppTicket, TicketStatus, TicketsScreenProps } from "@/features/tickets/types";

const toAppTicketStatus = (status: string): TicketStatus =>
  status === "VALID" ? "active" : "used";

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
  status: toAppTicketStatus(ticket.status),
  facial: false,
  image: ticket.event.coverUrl ? { uri: ticket.event.coverUrl } : undefined,
});

export const useTicketsRouteProps = (): TicketsScreenProps => {
  const router = useRouter();
  const { data, isPending } = useMyTickets();

  const tickets = useMemo(() => (data ?? []).map(mapCustomerTicket), [data]);

  return {
    tickets,
    isLoading: isPending,
    renderQr: (value, size) =>
      React.createElement(QRCode, { value, size }),
    onExplore: () => router.push("/(tabs)/explore"),
  };
};
