import { Linking, Platform } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ticketsService } from "@/services/tickets.service";
import type { PurchaseTicketPayload } from "@/services/tickets.service";
import { useIsCustomerScoped } from "./useAuth";
import { queryKeys } from "./queryKeys";

// /public/customer/tickets só aceita sessão com scope "customer" — sem esse
// gate, uma sessão de admin/organizador (que também passa por essa tela)
// ficaria em loop de 401 tentando renovar um token que nunca vai servir.
export const useMyTickets = () => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.tickets.mine(),
    queryFn: ticketsService.getMyTickets,
    enabled: isCustomerScoped,
  });
};

export const useTicket = (id: string) => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: async () => {
      const tickets = await ticketsService.getMyTickets();
      const ticket = tickets.find((item) => item.id === id);

      if (!ticket) {
        throw new Error("Ingresso não encontrado");
      }

      return ticket;
    },
    enabled: isCustomerScoped && Boolean(id),
  });
};

export const useAddToWallet = () =>
  useMutation({
    mutationFn: async (ticketId: string) => {
      if (Platform.OS === "ios") {
        const url = await ticketsService.getAppleWalletPassUrl(ticketId);
        await Linking.openURL(url);
      } else {
        const url = await ticketsService.getGoogleWalletUrl(ticketId);
        await Linking.openURL(url);
      }
    },
  });

export const usePurchaseTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PurchaseTicketPayload) =>
      ticketsService.purchase(payload),
    onSuccess: () => {
      // Invalidate the full tickets scope so "my tickets" refreshes
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
};
