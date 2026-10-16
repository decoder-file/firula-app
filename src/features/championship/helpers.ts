import type { BracketKind, Entry, Match, PublicCategory } from "@/services/championship.service";

/** Paleta do handoff (tela light-only, igual ao site). */
export const C = {
  primary: "#1FBD63",
  onPrimary: "#0A2E1A",
  primaryText: "#12813F",
  primaryGlow: "#3ED97F",
  primarySoft: "#EBFAF1",
  rowQualified: "#F4FCF7",
  champBorder: "#A8EBC6",
  dark: "#0E1116",
  ink: "#141821",
  text2: "#3C4453",
  text3: "#5C6470",
  text4: "#8A93A1",
  text5: "#A6AEBB",
  dash: "#C6CCD4",
  controlBorder: "#E1E4E9",
  cardBorder: "#EDEFF2",
  divider: "#F1F2F4",
  alt: "#F3F4F6",
  page: "#F7F7F8",
  warnBg: "#FEF4E6",
  warnIcon: "#B45309",
  warnText: "#7A3E06",
  white: "#FFFFFF",
} as const;

export const F = {
  regular: "PlusJakartaSans-Regular",
  medium: "PlusJakartaSans-Medium",
  semibold: "PlusJakartaSans-SemiBold",
  bold: "PlusJakartaSans-Bold",
  extrabold: "PlusJakartaSans-ExtraBold",
} as const;

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function sideLabel(entries: Map<string, Entry>, side: Match["home"]): string {
  if (side.entryId) {
    const entry = entries.get(side.entryId);
    if (!entry) return "Participante";
    return entry.status === "WITHDRAWN" ? `${entry.name} (desistiu)` : entry.name;
  }
  return side.placeholder ?? "A definir";
}

/** Placar só depois de encerrado; em andamento mostra "– : –". */
export function scoreText(match: Match): { home: string; away: string; detail: string | null } {
  if (match.status !== "FINISHED") return { home: "–", away: "–", detail: null };
  if (match.walkover) {
    const homeWon = match.winnerEntryId === match.home.entryId;
    return { home: homeWon ? "W" : "O", away: homeWon ? "O" : "W", detail: "W.O." };
  }
  const details: string[] = [];
  if (match.sets && match.sets.length > 0) details.push(match.sets.map((s) => `${s.home}-${s.away}`).join("  "));
  if (match.homePenalties !== null && match.awayPenalties !== null) details.push(`pênaltis ${match.homePenalties}-${match.awayPenalties}`);
  return { home: String(match.homeScore ?? 0), away: String(match.awayScore ?? 0), detail: details.length ? details.join(" · ") : null };
}

export function formatMatchTime(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  const weekday = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."][date.getDay()];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${weekday}, ${pad(date.getDate())}/${pad(date.getMonth() + 1)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
export function formatDates(start: string | null, end: string | null): string | null {
  if (!start && !end) return null;
  const fmt = (value: string) => {
    const d = new Date(value);
    return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]}`;
  };
  if (start && end && start.slice(0, 10) !== end.slice(0, 10)) return `${fmt(start)} a ${fmt(end)}`;
  return fmt((start ?? end)!);
}

export function pickStripMatches(matches: Match[]): { items: Match[]; isLive: boolean } {
  const live = matches.filter((m) => m.status === "IN_PROGRESS" && !m.isBye);
  if (live.length > 0) return { items: live, isLive: true };
  const upcoming = matches
    .filter((m) => m.status === "SCHEDULED" && !m.isBye && m.home.entryId && m.away.entryId)
    .sort((a, b) => (a.scheduledAt ?? "9").localeCompare(b.scheduledAt ?? "9") || a.number - b.number)
    .slice(0, 6);
  return { items: upcoming, isLive: false };
}

export type MatchFilter = "all" | "live" | "pending" | "finished";

export function filterMatches(matches: Match[], filter: MatchFilter, group: string): Match[] {
  let list = matches.filter((m) => !m.isBye);
  if (group === "knockout") list = list.filter((m) => m.stage === "KNOCKOUT");
  else if (group !== "all") list = list.filter((m) => m.groupId === group);
  switch (filter) {
    case "live":
      return list.filter((m) => m.status === "IN_PROGRESS");
    case "pending":
      return list.filter((m) => m.status === "SCHEDULED");
    case "finished":
      return list.filter((m) => m.status === "FINISHED");
    default:
      return list;
  }
}

export interface RoundKey {
  id: string;
  bracket: BracketKind | null;
  round: number;
  label: string;
  short: string;
  matches: Match[];
  pending: number;
  live: boolean;
  done: boolean;
}

/** Rodadas do mata-mata na ordem de exibição (principal, repescagem, grande final). */
export function groupRounds(matches: Match[]): RoundKey[] {
  const order: Array<BracketKind | null> = [null, "WINNERS", "LOSERS", "FINAL"];
  const groups = new Map<string, RoundKey>();
  for (const match of matches) {
    const key = `${match.bracket ?? "-"}:${match.round}:${match.isThirdPlace ? "3" : ""}`;
    if (!groups.has(key)) groups.set(key, { id: key, bracket: match.bracket, round: match.round, label: match.roundLabel, short: shortRoundLabel(match), matches: [], pending: 0, live: false, done: false });
    const group = groups.get(key)!;
    group.matches.push(match);
    if (!match.isBye && match.status !== "FINISHED" && match.status !== "CANCELED") group.pending += 1;
    if (match.status === "IN_PROGRESS") group.live = true;
  }
  for (const group of groups.values()) group.done = group.pending === 0 && group.matches.some((m) => m.status === "FINISHED");
  // Ordem de jogo: o backend numera na sequência em que os jogos podem acontecer (repescagem intercalada).
  const firstNumber = (group: RoundKey) => Math.min(...group.matches.map((m) => m.number));
  return [...groups.values()].sort((a, b) => {
    const na = firstNumber(a);
    const nb = firstNumber(b);
    if (na !== nb) return na - nb;
    const ab = order.indexOf(a.bracket);
    const bb = order.indexOf(b.bracket);
    if (ab !== bb) return ab - bb;
    if (a.round !== b.round) return a.round - b.round;
    return a.matches[0].isThirdPlace ? 1 : -1;
  });
}

/** Bracket FINAL com 2 rodadas = semifinais cruzadas (semis + final/3º lugar). */
export function isCrossoverFinal(matches: Array<{ bracket: BracketKind | null; round: number }>): boolean {
  return matches.some((m) => m.bracket === "FINAL" && m.round >= 2);
}

/** Primeira rodada com jogo pendente e lados definidos; senão a última. */
export function defaultRoundId(rounds: RoundKey[]): string | undefined {
  const next = rounds.find((r) => r.pending > 0 && r.matches.some((m) => m.home.entryId && m.away.entryId));
  return (next ?? rounds.find((r) => r.pending > 0) ?? rounds[rounds.length - 1])?.id;
}

export function shortRoundLabel(match: Match): string {
  if (match.isThirdPlace) return "3º lugar";
  if (match.bracket === "FINAL") return match.roundLabel || "Grande final";
  const base = match.roundLabel.replace(/^(Chave principal|Repescagem) · /, "");
  const prefix = match.bracket === "WINNERS" ? "P " : match.bracket === "LOSERS" ? "R " : "";
  if (base === "Final da chave principal") return "Final P";
  if (base === "Final da repescagem") return "Final R";
  if (base === "rodada decisiva") return `${prefix}Decisiva`;
  if (base === "Quartas de final") return `${prefix}Quartas`;
  if (base === "Oitavas de final") return `${prefix}Oitavas`;
  if (base === "16 avos de final") return `${prefix}16 avos`;
  return `${prefix}${base}`;
}

export function supportLine(entry: Entry, category: PublicCategory): string {
  const groupName = new Map(category.groups.map((g) => [g.id, g.name]));
  const parts = [`Seed ${entry.seed}`];
  if (entry.groupId && groupName.get(entry.groupId)) parts.push(groupName.get(entry.groupId)!);
  if (category.participantType === "INDIVIDUAL" && entry.members[0] && entry.members[0].name !== entry.name) parts.push(entry.members[0].name);
  if (entry.status === "WITHDRAWN") parts.push("desistiu");
  return parts.join(" · ");
}

export function categoryHasTable(category: PublicCategory): boolean {
  return category.groups.length > 0 || Boolean(category.standings) || category.matches.some((m) => m.stage === "KNOCKOUT");
}
