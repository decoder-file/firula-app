import { apiClient } from "@/api/client";

/** Alvo do cupom de quadras: reserva de horário ou Day Use. O servidor calcula o preço. */
export type ReservationCouponTarget =
  | { target: "COURT_RESERVATION"; courtId: string; date: string; startTime: string; endTime: string }
  | { target: "DAY_USE"; dayUseId: string };

export type ReservationCouponResult =
  | {
      valid: true;
      code: string;
      discountType: "PERCENTAGE" | "FIXED";
      discountValue: number;
      grossAmountCents: number;
      discountCents: number;
      finalAmountCents: number;
      /** Só vale no app (o app manda `X-Client-Platform: mobile`, então aqui é sempre aceito). */
      appOnly?: boolean;
      appDiscountValue?: number | null;
    }
  | { valid: false; error: string; message: string; grossAmountCents?: number };

export const courtCouponsService = {
  /**
   * POST /public/courts/coupons/validate — prévia do cupom da organização para reserva de
   * quadra ou Day Use. Não consome o cupom: ele só é usado quando a reserva é criada.
   */
  validate: async (code: string, target: ReservationCouponTarget): Promise<ReservationCouponResult> => {
    const { data } = await apiClient.post("/public/courts/coupons/validate", { code: code.trim(), ...target });
    return data.data;
  },
};
