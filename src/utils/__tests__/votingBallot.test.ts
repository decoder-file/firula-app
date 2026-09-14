import type { VotingBallot } from "@/services/voting.service";
import { clearPosition, filledCount, isComplete, newSubmissionId, sanitizeDraft, selectPlayer, toSelections } from "@/utils/votingBallot";

const school = { name: "Escola A", shortName: "EA", logoUrl: null };
const ballot: VotingBallot = {
  category: { id: "cat", name: "SUB-14", slug: "sub-14", formationKey: "4-3-3" },
  edition: { id: "ed", shortName: "Mineiro 26", captchaRequired: false },
  positions: [
    { id: "gk", key: "GOLEIRO", label: "Goleiro", shortLabel: "GOL", sortOrder: 0, pitchX: 50, pitchY: 90, players: [{ id: "p1", name: "Ana", photoUrl: null, jerseyNumber: 1, school }] },
    {
      id: "ca",
      key: "CENTROAVANTE",
      label: "Centroavante",
      shortLabel: "CA",
      sortOrder: 1,
      pitchX: 50,
      pitchY: 15,
      players: [
        { id: "p2", name: "Bia", photoUrl: null, jerseyNumber: 9, school },
        { id: "p1", name: "Ana", photoUrl: null, jerseyNumber: 1, school },
      ],
    },
  ],
};

describe("votingBallot", () => {
  it("moves a player instead of letting them occupy two positions", () => {
    expect(selectPlayer(selectPlayer({}, "gk", "p1"), "ca", "p1")).toEqual({ ca: "p1" });
  });

  it("counts, completes and clears", () => {
    const draft = selectPlayer(selectPlayer({}, "gk", "p1"), "ca", "p2");
    expect(filledCount(draft, ballot.positions)).toBe(2);
    expect(isComplete(draft, ballot.positions)).toBe(true);
    expect(isComplete(clearPosition(draft, "ca"), ballot.positions)).toBe(false);
  });

  it("sanitizes stale choices and orders selections by position", () => {
    expect(sanitizeDraft({ gk: "p1", ca: "ghost", zz: "p2" }, ballot)).toEqual({ gk: "p1" });
    expect(toSelections({ ca: "p2", gk: "p1" }, ballot)).toEqual([
      { positionId: "gk", playerId: "p1" },
      { positionId: "ca", playerId: "p2" },
    ]);
  });

  it("submission ids are unique and within the backend's accepted format", () => {
    const a = newSubmissionId();
    const b = newSubmissionId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]{8,64}$/);
  });
});
