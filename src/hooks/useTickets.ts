import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ticketsService } from "@/services/tickets.service";
import type { PurchaseTicketPayload } from "@/services/tickets.service";
import { queryKeys } from "./queryKeys";

export const useMyTickets = () =>
  useQuery({
    queryKey: queryKeys.tickets.mine(),
    queryFn: ticketsService.getMyTickets,
  });

export const useTicket = (id: string) =>
  useQuery({
    queryKey: queryKeys.tickets.detail(id),
    queryFn: async () => {
      const tickets = await ticketsService.getMyTickets();
      const ticket = tickets.find((item) => item.id === id);

      if (!ticket) {
        throw new Error("Ingresso não encontrado");
      }

      return ticket;
    },
    enabled: Boolean(id),
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
