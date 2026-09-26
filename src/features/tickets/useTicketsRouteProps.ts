import React, { useMemo } from "react";
import { Alert } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import QRCode from "react-native-qrcode-svg";

import { WalletError, useAddToWallet, useMyTickets } from "@/hooks/useTickets";
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
        const walletError = error instanceof WalletError ? error : null;
        const cause = walletError?.cause ?? error;
        // Log completo para diagnóstico (Metro / Xcode / Sentry breadcrumbs).
        console.warn(
          "[Wallet] failed",
          JSON.stringify({
            ticketId,
            step: walletError?.step ?? "unknown",
            code: walletError?.code,
            message: walletError?.message ?? (error as Error)?.message,
            apiStatus: isApiError(cause) ? cause.statusCode : undefined,
            apiMessage: isApiError(cause) ? cause.message : undefined,
          }),
        );

        if (isApiError(cause) && cause.statusCode === 400) {
          Alert.alert("Indisponível", "Este ingresso não pode ser adicionado à carteira.");
          return;
        }
        if (walletError?.step === "native-module") {
          Alert.alert("Atualize o app", "Esta versão do app não consegue adicionar ingressos à Apple Wallet. Atualize pela App Store.");
          return;
        }
        if (walletError?.step === "can-add-passes") {
          Alert.alert("Carteira indisponível", "A Apple Wallet não está disponível neste aparelho.");
          return;
        }
        const detail = walletError?.code ? ` (${walletError.code})` : walletError ? ` (${walletError.step})` : "";
        Alert.alert("Erro", `Não foi possível abrir a carteira. Tente novamente.${detail}`);
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
