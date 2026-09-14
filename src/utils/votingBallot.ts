import type { VotingBallot, VotingPlayer } from "@/services/voting.service";

/** Rascunho da seleção: posição → atleta escolhido. */
export type BallotDraft = Record<string, string>;

/** Escolher um atleta numa posição. Um atleta não ocupa duas posições: se já estava em outra, sai de lá. */
export function selectPlayer(draft: BallotDraft, positionId: string, playerId: string): BallotDraft {
  const next: BallotDraft = {};
  for (const [position, player] of Object.entries(draft)) {
    if (player !== playerId) next[position] = player;
  }
  next[positionId] = playerId;
  return next;
}

export function clearPosition(draft: BallotDraft, positionId: string): BallotDraft {
  const { [positionId]: _removed, ...rest } = draft;
  return rest;
}

export function filledCount(draft: BallotDraft, positions: Array<{ id: string }>): number {
  return positions.filter((position) => Boolean(draft[position.id])).length;
}

export function isComplete(draft: BallotDraft, positions: Array<{ id: string }>): boolean {
  return positions.length > 0 && filledCount(draft, positions) === positions.length;
}

/** Remove do rascunho escolhas que não existem mais na cédula. */
export function sanitizeDraft(draft: BallotDraft, ballot: VotingBallot): BallotDraft {
  const next: BallotDraft = {};
  for (const position of ballot.positions) {
    const playerId = draft[position.id];
    if (playerId && position.players.some((player) => player.id === playerId)) next[position.id] = playerId;
  }
  return next;
}

export function findPlayer(ballot: VotingBallot, positionId: string, playerId: string | undefined): VotingPlayer | null {
  if (!playerId) return null;
  return ballot.positions.find((item) => item.id === positionId)?.players.find((player) => player.id === playerId) ?? null;
}

export function toSelections(draft: BallotDraft, ballot: VotingBallot): Array<{ positionId: string; playerId: string }> {
  return ballot.positions.map((position) => ({ positionId: position.id, playerId: draft[position.id] }));
}

export function newSubmissionId(): string {
  const random = Array.from({ length: 4 }, () => Math.random().toString(36).slice(2, 10)).join("");
  return `app-${Date.now().toString(36)}-${random}`.slice(0, 64);
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

export function defaultShareTitle(shortName: string): string {
  return `Essa é minha Seleção do ${shortName}`;
}
