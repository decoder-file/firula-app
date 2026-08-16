/**
 * Tipos do fluxo de compra nativo (PIX + cartão, sem 3DS/tokenização). Contratos
 * confirmados diretamente no backend (`firula-event-back-end`) — não copiados dos tipos
 * do b2c, que estão desatualizados em alguns pontos (formato da resposta de `/purchase`,
 * enum de `OrderStatus`).
 */

export type PaymentMethod = "PIX" | "CARD";

export interface PurchaseQuoteItem {
  ticketLotId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
  subtotalCents: number;
}

export interface PurchaseQuoteInstallment {
  installments: number;
  interestRate: number;
  totalCents: number;
  installmentValueCents: number;
}

export interface PurchaseQuote {
  event: { id: string; name: string };
  items: PurchaseQuoteItem[];
  grossAmountCents: number;
  discountCents: number;
  couponDiscountCents: number;
  cpfDiscountCents: number;
  coupon: { code: string; discountType: string; discountValue: number } | null;
  hasCpfDiscount: boolean;
  finalAmountCents: number;
  isFree: boolean;
  availablePaymentMethods: PaymentMethod[];
  pix: { totalCents: number } | null;
  card: { flow?: "TRANSPARENT" | "REDIRECT"; installments: PurchaseQuoteInstallment[] } | null;
}

export type ValidateCouponResult =
  | { valid: false; error: string; message: string }
  | { valid: true; discountType: string; discountValue: number; discountCents: number; finalAmountCents: number };

export interface CustomFieldAnswerInput {
  key: string;
  value: string;
}

export interface AttendeeInput {
  name: string;
  cpf: string;
  phone?: string;
  customFields?: CustomFieldAnswerInput[];
}

export interface TicketLotSelectionInput {
  ticketLotId: string;
  quantity: number;
}

export interface RawCreditCardInput {
  holderName: string;
  number: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string;
  postalCode: string;
  addressNumber: string;
  city?: string;
  complement?: string;
  state?: string;
  street?: string;
  zone?: string;
  phone?: string;
}

export type PurchasePaymentInput =
  | { method: "PIX"; expiresInMinutes?: number; idempotencyKey?: string }
  | {
      method: "CARD";
      creditCard?: RawCreditCardInput;
      creditCardHolderInfo?: CreditCardHolderInfo;
      installments?: number;
      idempotencyKey?: string;
    };

export interface CreatePurchasePayload {
  fullName: string;
  phone: string;
  cpf: string;
  email: string;
  ticketLots: TicketLotSelectionInput[];
  attendees: AttendeeInput[];
  couponCode?: string;
  /** Ausente só quando o pedido é gratuito (`isFree`). */
  payment?: PurchasePaymentInput;
}

export interface CreatedTicket {
  id: string;
  qrCode: string;
  status: string;
  attendee?: { id: string; name: string; cpf: string } | null;
  orderItem?: { ticketLot?: { id: string; name: string } | null } | null;
}

export interface CreatePurchaseResponse {
  order: { id: string; status: string; totalAmount: number; totalAmountCents: number };
  event: { id: string; name: string };
  tickets: CreatedTicket[];
  isPaidOrder: boolean;
  grossAmountCents: number;
  discountCents: number;
  finalAmountCents: number;
  coupon: { id: string; code: string; discountType: string; discountValue: number } | null;
  payment?: {
    paymentId: string;
    orderId: string;
    method: "PIX" | "CARD";
    status: string;
    amountCents: number;
    pix?: { expiresAt: string; qrCodeText: string; qrCodeImage: string | null };
    checkoutUrl?: string | null;
    requiresAction?: boolean;
    action?: { type: "REDIRECT"; redirectUrl: string };
  };
}

/**
 * `CONFIRMED`/`CREATED` = pedido gratuito, já confirmado. `PENDING_PAYMENT` = aguardando
 * pagamento (PIX gerado). `PAID` = pago. `CANCELED`/`EXPIRED` = falha terminal do polling.
 * Os `REFUND_*` não ocorrem durante uma compra em andamento.
 */
export type OrderStatus =
  | "CONFIRMED"
  | "CANCELED"
  | "CREATED"
  | "PENDING_PAYMENT"
  | "PAID"
  | "EXPIRED"
  | "REFUNDED"
  | "REFUND_REQUESTED"
  | "REFUND_PROCESSING"
  | "REFUND_FAILED";

export interface CheckoutOrderData {
  id: string;
  event: { id: string; name: string };
  status: OrderStatus;
  totalAmount: number;
  items: Array<{
    id: string;
    ticketLot: { id: string; name: string; price: number } | null;
    ticket: {
      id: string;
      qrCode: string;
      status: string;
      attendee: { id: string; name: string; cpf: string } | null;
    } | null;
  }>;
}
