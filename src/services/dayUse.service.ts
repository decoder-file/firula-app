import { apiClient } from "@/api/client";
import type { CreditCardHolderInfo, RawCreditCardInput } from "@/features/checkout/types";

export type DayUsePaymentMethod = "PIX" | "CARD";
export type DayUseReservationStatus = "PENDING_PAYMENT" | "CONFIRMED" | "CANCELED";

export interface DayUseReservation {
  id: string;
  status: DayUseReservationStatus;
  priceInCents: number;
  originalPriceInCents?: number | null;
  couponDiscountCents?: number;
  createdAt: string;
}

export type DayUsePaymentResult =
  | { method: "PIX"; qrCodeText: string | null; expiresAt: string | null; amountCents: number }
  | {
      method: "CARD";
      status: string;
      requiresAction: boolean;
      action: { type: "3DS" | "REDIRECT"; redirectUrl: string } | null;
      amountCents: number;
    };

export type PayDayUseInput =
  | { method: "PIX"; idempotencyKey: string }
  | {
      method: "CARD";
      installments: number;
      idempotencyKey: string;
      creditCard?: RawCreditCardInput;
      creditCardHolderInfo?: CreditCardHolderInfo;
    };

export const dayUseService = {
  reserve: async (dayUseId: string, input: { idempotencyKey: string; couponCode?: string }) => {
    const { data } = await apiClient.post(`/public/courts/day-uses/${dayUseId}/reserve`, input);
    return data.data as { reservation: DayUseReservation; payment: null };
  },

  pay: async (reservationId: string, input: PayDayUseInput): Promise<DayUsePaymentResult> => {
    const { data } = await apiClient.post(
      `/public/courts/day-uses/reservations/${reservationId}/pay`,
      input,
    );
    return data.data;
  },

  getPaymentStatus: async (reservationId: string): Promise<{ status: DayUseReservationStatus }> => {
    const { data } = await apiClient.get(
      `/public/courts/day-uses/reservations/${reservationId}/payment-status`,
    );
    return data.data;
  },
};
