import { buildCourtReservationWebPath, buildDayUseWebPath } from "@/utils/reservationCoupon";

describe("buildCourtReservationWebPath", () => {
  const base = { orgSlug: "arena-firula", courtId: "court-1", date: "2026-10-01", startTime: "09:00", endTime: "11:00" };

  it("leva data e horários escolhidos para o checkout do site", () => {
    expect(buildCourtReservationWebPath(base)).toBe("/quadras/arena-firula/reservar/court-1?date=2026-10-01&startTime=09%3A00&endTime=11%3A00");
  });

  it("anexa o cupom normalizado quando houver", () => {
    expect(buildCourtReservationWebPath({ ...base, couponCode: " quadra10 " })).toBe(
      "/quadras/arena-firula/reservar/court-1?date=2026-10-01&startTime=09%3A00&endTime=11%3A00&cupom=QUADRA10",
    );
    expect(buildCourtReservationWebPath({ ...base, couponCode: "   " })).not.toContain("cupom");
  });
});

describe("buildDayUseWebPath", () => {
  it("abre o Day Use no site, com ou sem cupom", () => {
    expect(buildDayUseWebPath({ orgSlug: "arena-firula", dayUseId: "du-1" })).toBe("/quadras/arena-firula/day-use/du-1");
    expect(buildDayUseWebPath({ orgSlug: "arena-firula", dayUseId: "du-1", couponCode: "verao" })).toBe("/quadras/arena-firula/day-use/du-1?cupom=VERAO");
  });
});
