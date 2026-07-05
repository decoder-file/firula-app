import { apiClient } from "@/api/client";
import type { ApiResponse } from "@/api/types";
import type { UserTicket } from "@/data/mockData";

export type CustomerTicketStatus = "VALID" | "USED" | "CANCELLED" | "EXPIRED" | string;

export interface CustomerTicketEventOrganization {
  id: string;
  tradeName: string;
}

export interface CustomerTicketEventLocation {
  address: string;
  city: string;
  state: string;
}

export interface CustomerTicketEvent {
  id: string;
  name: string;
  startsAt: string;
  coverUrl?: string;
  organization: CustomerTicketEventOrganization;
  location: CustomerTicketEventLocation;
}

export interface CustomerTicketAttendee {
  id: string;
  name: string;
  email: string;
}

export interface CustomerTicketLot {
  id: string;
  name: string;
  price: number;
}

export interface CustomerTicket {
  canTransfer: boolean;
  transferBlockedReason: string | null;
  id: string;
  status: CustomerTicketStatus;
  event: CustomerTicketEvent;
  attendee: CustomerTicketAttendee;
  ticketLot: CustomerTicketLot;
  usedAt: string | null;
  createdAt: string;
}

interface CustomerTicketsResponse {
  success: boolean;
  data: CustomerTicket[];
}

export interface PurchaseTicketPayload {
  eventId: string;
  ticketTypeId: string;
  quantity: number;
  couponCode?: string;
}

export const ticketsService = {
  getMyTickets: async (): Promise<CustomerTicket[]> => {
    const { data } =
      await apiClient.get<CustomerTicketsResponse>("/public/customer/tickets");
    return data.data;
  },

  getAppleWalletPassUrl: async (ticketId: string): Promise<string> => {
    const { data } = await apiClient.post<{ success: boolean; data: { passUrl: string } }>(
      `/public/customer/tickets/${ticketId}/pass`,
    );
    return data.data.passUrl;
  },

  getGoogleWalletUrl: async (ticketId: string): Promise<string> => {
    const { data } = await apiClient.get<{ success: boolean; data: { url: string } }>(
      `/public/customer/tickets/${ticketId}/google-wallet`,
    );
    return data.data.url;
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
