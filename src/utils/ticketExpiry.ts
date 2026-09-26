import type { CustomerTicket } from "@/services/tickets.service";

/**
 * Quando um ingresso válido passa a aparecer como "Expirado" na lista.
 *
 * - Passaporte: vale até o FIM do último dia válido (fuso de São Paulo). As datas do
 *   passaporte são dia + horário de entrada; comparar com o instante cru fazia o ingresso
 *   "expirar" no horário de entrada do próprio dia do evento.
 * - Evento com fim cadastrado: vale até o fim do evento (ou até o fim do dia de início,
 *   se o fim estiver antes disso por erro de cadastro).
 * - Evento sem fim cadastrado: vale até o fim do dia de início — não expira às 19:01 de
 *   um evento que começou às 19:00.
 */

/** Brasil sem horário de verão desde 2019: São Paulo = UTC-3 fixo. */
const SAO_PAULO_OFFSET_MS = -3 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Último milissegundo do dia (calendário de São Paulo) em que o instante cai. */
export const endOfSaoPauloDay = (date: Date): Date => {
  const day = Math.floor((date.getTime() + SAO_PAULO_OFFSET_MS) / DAY_MS);
  return new Date((day + 1) * DAY_MS - SAO_PAULO_OFFSET_MS - 1);
};

const parse = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

type ExpiryInput = {
  event: Pick<CustomerTicket["event"], "startsAt" | "endsAt">;
  ticketLot: Pick<CustomerTicket["ticketLot"], "type" | "passportValidDates">;
};

/** Instante a partir do qual o ingresso conta como expirado; null = sem data confiável (nunca expira no app). */
export const getTicketValidUntil = (ticket: ExpiryInput): Date | null => {
  if (ticket.ticketLot.type === "PASSPORT" && ticket.ticketLot.passportValidDates?.length) {
    const times = ticket.ticketLot.passportValidDates
      .map((value) => parse(value)?.getTime())
      .filter((time): time is number => typeof time === "number");
    if (times.length > 0) return endOfSaoPauloDay(new Date(Math.max(...times)));
  }

  const startsAt = parse(ticket.event.startsAt);
  const endsAt = parse(ticket.event.endsAt);
  const startDayEnd = startsAt ? endOfSaoPauloDay(startsAt) : null;
  if (endsAt && startDayEnd) return endsAt > startDayEnd ? endsAt : startDayEnd;
  return endsAt ?? startDayEnd;
};

export const isTicketExpired = (ticket: ExpiryInput, now: Date = new Date()): boolean => {
  const validUntil = getTicketValidUntil(ticket);
  return validUntil !== null && now > validUntil;
};
