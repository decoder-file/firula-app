/**
 * O pagamento de reserva de quadra e de Day Use acontece no checkout do site; o app leva a
 * pessoa até lá com tudo que já foi escolhido — inclusive o cupom (`?cupom=`), que o site
 * aplica sozinho ao abrir.
 */

export interface AppliedReservationCoupon {
  code: string;
  discountCents: number;
  finalAmountCents: number;
}

function withCoupon(params: URLSearchParams, couponCode?: string | null): string {
  const code = couponCode?.trim().toUpperCase();
  if (code) params.set("cupom", code);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function buildCourtReservationWebPath(input: {
  orgSlug: string;
  courtId: string;
  date: string;
  startTime: string;
  endTime: string;
  couponCode?: string | null;
}): string {
  const params = new URLSearchParams({ date: input.date, startTime: input.startTime, endTime: input.endTime });
  return `/quadras/${input.orgSlug}/reservar/${input.courtId}${withCoupon(params, input.couponCode)}`;
}

export function buildDayUseWebPath(input: { orgSlug: string; dayUseId: string; couponCode?: string | null }): string {
  return `/quadras/${input.orgSlug}/day-use/${input.dayUseId}${withCoupon(new URLSearchParams(), input.couponCode)}`;
}
