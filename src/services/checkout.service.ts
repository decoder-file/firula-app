import { apiClient } from "@/api/client";
import type {
  CheckoutOrderData,
  CreatePurchasePayload,
  CreatePurchaseResponse,
  PurchaseQuote,
  TicketLotSelectionInput,
  ValidateCouponResult,
} from "@/features/checkout/types";

export const checkoutService = {
  getQuote: async (
    eventId: string,
    ticketLots: TicketLotSelectionInput[],
    couponCode?: string,
  ): Promise<PurchaseQuote> => {
    const { data } = await apiClient.post(`/public/events/${eventId}/purchase/quote`, {
      ticketLots,
      ...(couponCode ? { couponCode } : {}),
    });
    return data.data;
  },

  validateCoupon: async (
    eventId: string,
    code: string,
    grossAmountCents: number,
    ticketLotId?: string,
  ): Promise<ValidateCouponResult> => {
    const { data } = await apiClient.post(`/public/events/${eventId}/purchase/coupon/validate`, {
      code,
      grossAmountCents,
      ...(ticketLotId ? { ticketLotId } : {}),
    });
    return data.data;
  },

  createPurchase: async (
    eventId: string,
    payload: CreatePurchasePayload,
  ): Promise<CreatePurchaseResponse> => {
    const { data } = await apiClient.post(`/public/events/${eventId}/purchase`, payload);
    return data.data;
  },

  getOrder: async (orderId: string): Promise<CheckoutOrderData> => {
    const { data } = await apiClient.get(`/public/customer/orders/${orderId}`);
    return data.data;
  },
};
