/**
 * Catálogo dos eventos de negócio enviados ao PostHog. Nomes em snake_case, no passado.
 * Nunca colocar aqui dado pessoal (nome, e-mail, CPF, telefone, endereço): só ids e números.
 */
export type CheckoutPaymentKind = "FREE" | "PIX" | "CARD";
export type LoginMethod = "password" | "email_code" | "password_reset" | "google" | "apple";

export interface AnalyticsEvents {
  login_completed: { method: LoginMethod };
  signup_completed: Record<string, never>;
  logout_completed: Record<string, never>;

  event_viewed: { event_id: string; event_slug: string };
  checkout_started: { event_id: string; ticket_quantity: number };
  pix_generated: { event_id: string; order_id: string; total_cents: number };
  purchase_completed: {
    event_id: string;
    order_id: string;
    payment_method: CheckoutPaymentKind;
    total_cents: number;
    /** Em reais, para o PostHog somar receita. */
    revenue: number;
    ticket_quantity: number;
    has_coupon: boolean;
  };
  purchase_failed: { event_id: string; payment_method: CheckoutPaymentKind | null; error_message: string };

  ticket_qr_opened: { ticket_id: string };
  ticket_wallet_add_clicked: { ticket_id: string };
}

export type AnalyticsEventName = keyof AnalyticsEvents;
