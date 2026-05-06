import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type { UserTicket } from "@/data/mockData";

export interface PurchaseTicketPayload {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  couponCode?: string;
}

export const ticketsService = {
  getMyTickets: async (): Promise<UserTicket[]> => {
    const { data } =
      await apiClient.get<ApiResponse<UserTicket[]>>("/tickets/me");
    return data.data;
  },

  getById: async (id: string): Promise<UserTicket> => {
    const { data } = await apiClient.get<ApiResponse<UserTicket>>(
      `/tickets/${id}`,
    );
    return data.data;
  },

  purchase: async (payload: PurchaseTicketPayload): Promise<UserTicket> => {
    const { data } = await apiClient.post<ApiResponse<UserTicket>>(
      "/tickets/purchase",
      payload,
    );
    return data.data;
  },
};
