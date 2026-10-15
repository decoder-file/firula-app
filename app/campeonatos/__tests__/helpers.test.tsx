import { defaultRoundId, filterMatches, formatDates, groupRounds, initials, pickStripMatches, scoreText, shortRoundLabel } from "@/features/championship/helpers";
import type { Match } from "@/services/championship.service";

function match(over: Partial<Match> = {}): Match {
  return {
    id: over.id ?? "m1",
    number: over.number ?? 1,
    stage: "KNOCKOUT",
    bracket: null,
    round: 1,
    roundLabel: "Quartas de final",
    position: 0,
    groupId: null,
    isThirdPlace: false,
    isBye: false,
    home: { entryId: "a", placeholder: null },
    away: { entryId: "b", placeholder: null },
    status: "SCHEDULED",
    homeScore: null,
    awayScore: null,
    sets: null,
    homePenalties: null,
    awayPenalties: null,
    walkover: false,
    winnerEntryId: null,
    scheduledAt: null,
    venue: null,
    notes: null,
    finishedAt: null,
    ...over,
  };
}

describe("championship helpers", () => {
  it("initials", () => {
    expect(initials("João Pedro Silva")).toBe("JS");
    expect(initials("Mari")).toBe("MA");
    expect(initials("")).toBe("?");
  });

  it("scoreText hides the score until the match ends", () => {
    expect(scoreText(match({ status: "IN_PROGRESS" }))).toEqual({ home: "–", away: "–", detail: null });
    expect(scoreText(match({ status: "FINISHED", homeScore: 2, awayScore: 1, sets: [{ home: 21, away: 18 }, { home: 19, away: 21 }, { home: 10, away: 7 }] }))).toEqual({ home: "2", away: "1", detail: "21-18  19-21  10-7" });
    expect(scoreText(match({ status: "FINISHED", walkover: true, winnerEntryId: "b" })).detail).toBe("W.O.");
  });

  it("pickStripMatches prefers live matches, otherwise the next 6 defined ones", () => {
    const live = match({ id: "live", status: "IN_PROGRESS" });
    const next = match({ id: "next", scheduledAt: "2026-10-14T19:30:00Z" });
    const undefinedSide = match({ id: "nd", home: { entryId: null, placeholder: "Vencedor do jogo 1" } });
    expect(pickStripMatches([next, live]).items.map((m) => m.id)).toEqual(["live"]);
    expect(pickStripMatches([undefinedSide, next]).items.map((m) => m.id)).toEqual(["next"]);
  });

  it("groupRounds opens on the first round with a pending match", () => {
    const rounds = groupRounds([
      match({ id: "q1", round: 1, status: "FINISHED", winnerEntryId: "a", homeScore: 1, awayScore: 0 }),
      match({ id: "s1", round: 2, roundLabel: "Semifinal" }),
      match({ id: "f", round: 3, roundLabel: "Final", home: { entryId: null, placeholder: "Vencedor do jogo 2" } }),
    ]);
    expect(rounds.map((r) => r.short)).toEqual(["Quartas", "Semifinal", "Final"]);
    expect(rounds[0].done).toBe(true);
    expect(defaultRoundId(rounds)).toBe(rounds[1].id);
  });

  it("shortRoundLabel for double elimination", () => {
    expect(shortRoundLabel(match({ bracket: "WINNERS", roundLabel: "Chave principal · 1ª rodada" }))).toBe("P 1ª rodada");
    expect(shortRoundLabel(match({ bracket: "LOSERS", roundLabel: "Final da repescagem" }))).toBe("Final R");
    expect(shortRoundLabel(match({ bracket: "FINAL", roundLabel: "Grande final" }))).toBe("Grande final");
  });

  it("filterMatches drops byes and applies group and status filters", () => {
    const list = [match({ id: "bye", isBye: true }), match({ id: "g", stage: "GROUP", groupId: "A" }), match({ id: "k", status: "FINISHED" })];
    expect(filterMatches(list, "all", "all").map((m) => m.id)).toEqual(["g", "k"]);
    expect(filterMatches(list, "finished", "knockout").map((m) => m.id)).toEqual(["k"]);
    expect(filterMatches(list, "all", "A").map((m) => m.id)).toEqual(["g"]);
  });

  it("formatDates", () => {
    expect(formatDates("2026-10-12T12:00:00Z", "2026-10-14T12:00:00Z")).toMatch(/^12 out a 14 out$/);
    expect(formatDates(null, null)).toBeNull();
  });
});
