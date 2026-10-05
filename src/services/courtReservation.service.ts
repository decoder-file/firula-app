import type { VenueAddress } from "@/services/organizer.service";
import { apiClient } from "@/api/client";
import type { DayUsePaymentResult, PayDayUseInput } from "@/services/dayUse.service";

export type CourtReservationStatus =
  | "PENDING_APPROVAL"
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "CANCELED"
  | "REJECTED"
  | "PENDING_CANCELLATION";

export interface CourtReservation {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  priceInCents: number;
  originalPriceInCents?: number | null;
  couponDiscountCents?: number;
  status: CourtReservationStatus;
  notes?: string | null;
}

export interface MyCourtReservation extends CourtReservation {
  createdAt: string;
  court: {
    id: string;
    name: string;
    address?: VenueAddress | null;
    organization: { id: string; tradeName: string; slug: string };
  };
}

export interface CreateCourtReservationInput {
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
  idempotencyKey: string;
  couponCode?: string;
}

export const courtReservationService = {
  create: async (input: CreateCourtReservationInput) => {
    const { data } = await apiClient.post("/public/courts/reservations", input);
    return data.data as { reservation: CourtReservation; payment: null };
  },

  pay: async (reservationId: string, input: PayDayUseInput): Promise<DayUsePaymentResult> => {
    const { data } = await apiClient.post(`/public/courts/reservations/${reservationId}/pay`, input);
    return data.data;
  },

  getPaymentStatus: async (reservationId: string): Promise<{ status: CourtReservationStatus }> => {
    const { data } = await apiClient.get(`/public/courts/reservations/${reservationId}/payment-status`);
    return data.data;
  },

  listMine: async (): Promise<MyCourtReservation[]> => {
    const { data } = await apiClient.get("/public/courts/reservations/my");
    return data.data ?? [];
  },

  cancel: async (reservationId: string): Promise<CourtReservation> => {
    const { data } = await apiClient.delete(`/public/courts/reservations/${reservationId}`);
    return data.data;
  },
};
