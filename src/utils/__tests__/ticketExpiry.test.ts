import { endOfSaoPauloDay, getTicketValidUntil, isTicketExpired } from "@/utils/ticketExpiry";

const single = (startsAt: string, endsAt: string | null = null) => ({
  event: { startsAt, endsAt },
  ticketLot: { type: "SINGLE_DAY" },
});
const passport = (dates: string[], startsAt = "2026-09-20T22:00:00Z") => ({
  event: { startsAt, endsAt: null },
  ticketLot: { type: "PASSPORT", passportValidDates: dates },
});

describe("endOfSaoPauloDay", () => {
  it("usa o dia de São Paulo, não o dia UTC", () => {
    // 26/09 19:00 em SP (22:00 UTC) → fim de 26/09 em SP = 27/09 02:59:59.999 UTC
    expect(endOfSaoPauloDay(new Date("2026-09-26T22:00:00Z")).toISOString()).toBe("2026-09-27T02:59:59.999Z");
    // 26/09 23:30 em SP já é 27/09 UTC, mas ainda é dia 26 em SP
    expect(endOfSaoPauloDay(new Date("2026-09-27T02:30:00Z")).toISOString()).toBe("2026-09-27T02:59:59.999Z");
  });
});

describe("isTicketExpired", () => {
  it("passaporte do dia 26 vale o dia 26 inteiro, inclusive depois do horário de entrada", () => {
    const ticket = passport(["2026-09-26T22:00:00Z"]); // 26/09 às 19:00
    expect(isTicketExpired(ticket, new Date("2026-09-24T15:00:00Z"))).toBe(false);
    expect(isTicketExpired(ticket, new Date("2026-09-27T01:00:00Z"))).toBe(false); // 26/09 22:00 SP
    expect(isTicketExpired(ticket, new Date("2026-09-27T03:00:01Z"))).toBe(true); // 27/09 00:00:01 SP
  });

  it("passaporte usa a última data válida, mesmo fora de ordem", () => {
    const ticket = passport(["2026-09-27T13:00:00Z", "2026-09-26T22:00:00Z"]);
    expect(getTicketValidUntil(ticket)?.toISOString()).toBe("2026-09-28T02:59:59.999Z");
  });

  it("evento sem fim: vale até o fim do dia de início (não expira no horário de começo)", () => {
    const ticket = single("2026-09-26T22:00:00Z");
    expect(isTicketExpired(ticket, new Date("2026-09-26T22:30:00Z"))).toBe(false);
    expect(isTicketExpired(ticket, new Date("2026-09-27T03:00:01Z"))).toBe(true);
  });

  it("evento com fim na madrugada seguinte vale até o fim; fim antes do início não encurta a validade", () => {
    expect(getTicketValidUntil(single("2026-09-26T22:00:00Z", "2026-09-27T05:00:00Z"))?.toISOString()).toBe("2026-09-27T05:00:00.000Z");
    expect(getTicketValidUntil(single("2026-09-26T22:00:00Z", "2026-09-20T22:00:00Z"))?.toISOString()).toBe("2026-09-27T02:59:59.999Z");
  });

  it("data inválida nunca marca como expirado", () => {
    expect(isTicketExpired(single("não é data"), new Date("2030-01-01T00:00:00Z"))).toBe(false);
  });
});
