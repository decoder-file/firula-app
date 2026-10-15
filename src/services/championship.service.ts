import { apiClient } from "@/api/client";

/**
 * Campeonatos (tabela ao vivo). Mesma API pública do site
 * (/public/championships/*); classificação, campeão e rótulos de rodada vêm
 * prontos do backend para o app e o site nunca divergirem.
 */

export type ChampionshipFormat = "SINGLE_ELIMINATION" | "ROUND_ROBIN" | "GROUPS_KNOCKOUT" | "DOUBLE_ELIMINATION";
export type ParticipantType = "INDIVIDUAL" | "PAIR" | "TEAM";
export type ChampionshipStatus = "PUBLISHED" | "IN_PROGRESS" | "FINISHED";
export type MatchStage = "GROUP" | "KNOCKOUT";
export type MatchStatus = "SCHEDULED" | "IN_PROGRESS" | "FINISHED" | "CANCELED";
export type BracketKind = "WINNERS" | "LOSERS" | "FINAL";

export const FORMAT_LABEL: Record<ChampionshipFormat, string> = {
  SINGLE_ELIMINATION: "Mata-mata",
  ROUND_ROBIN: "Pontos corridos",
  GROUPS_KNOCKOUT: "Grupos + mata-mata",
  DOUBLE_ELIMINATION: "Dupla eliminatória",
};

export const PARTICIPANT_TYPE_LABEL: Record<ParticipantType, string> = {
  INDIVIDUAL: "Individual",
  PAIR: "Duplas",
  TEAM: "Times",
};

export const BRACKET_LABEL: Record<BracketKind, string> = {
  WINNERS: "Chave principal",
  LOSERS: "Repescagem",
  FINAL: "Grande final",
};

export interface EntryMember {
  athleteId: string;
  name: string;
  nickname: string | null;
  photoUrl: string | null;
  jerseyNumber: number | null;
}

export interface Entry {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  seed: number;
  status: "ACTIVE" | "WITHDRAWN";
  groupId: string | null;
  members: EntryMember[];
}

export interface StandingRow {
  entryId: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  scored: number;
  conceded: number;
  diff: number;
  points: number;
  rank: number;
}

export interface Group {
  id: string;
  index: number;
  name: string;
  entryIds: string[];
  standings: StandingRow[];
}

export interface MatchSide {
  entryId: string | null;
  placeholder: string | null;
}

export interface Match {
  id: string;
  number: number;
  stage: MatchStage;
  bracket: BracketKind | null;
  round: number;
  roundLabel: string;
  position: number;
  groupId: string | null;
  isThirdPlace: boolean;
  isBye: boolean;
  home: MatchSide;
  away: MatchSide;
  status: MatchStatus;
  homeScore: number | null;
  awayScore: number | null;
  sets: Array<{ home: number; away: number }> | null;
  homePenalties: number | null;
  awayPenalties: number | null;
  walkover: boolean;
  winnerEntryId: string | null;
  scheduledAt: string | null;
  venue: string | null;
  notes: string | null;
  finishedAt: string | null;
}

export interface Progress {
  total: number;
  finished: number;
  live: number;
}

export interface PublicCategory {
  id: string;
  name: string;
  order: number;
  format: ChampionshipFormat;
  participantType: ParticipantType;
  teamSize: number;
  drawMode: "AUTO" | "MANUAL";
  config: { thirdPlaceMatch: boolean; doubleRound: boolean; groupsCount: number; advancePerGroup: number; pointsWin: number; pointsDraw: number; pointsLoss: number; allowDraw: boolean; usesSets: boolean; bestOf: number | null; hideLosersBracket?: boolean };
  tableGeneratedAt: string | null;
  progress: Progress;
  champion: string | null;
  entries: Entry[];
  groups: Group[];
  standings: StandingRow[] | null;
  matches: Match[];
}

export interface PublicChampionship {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  status: ChampionshipStatus;
  sport: { id: string; name: string; slug: string } | null;
  event: { id: string; name: string; slug: string } | null;
  organization: { id: string; slug: string; name: string; logoUrl: string | null };
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  version: number;
  publishedAt: string | null;
  finishedAt: string | null;
  updatedAt: string;
  progress: Progress;
  categories: PublicCategory[];
}

export interface ChampionshipVersion {
  version: number;
  status: ChampionshipStatus;
  updatedAt: string;
}

export interface ChampionshipSummary {
  id: string;
  slug: string;
  name: string;
  coverUrl: string | null;
  status: ChampionshipStatus;
  startsAt: string | null;
  endsAt: string | null;
  location: string | null;
  sport: { id: string; name: string } | null;
  categories: Array<{ id: string; name: string; format: ChampionshipFormat; participantType: ParticipantType }>;
  _count: { entries: number };
}

const BASE = "/public/championships";

export const championshipService = {
  getBySlug: async (slug: string): Promise<PublicChampionship> => {
    const { data } = await apiClient.get(`${BASE}/${encodeURIComponent(slug)}`);
    return data.data ?? data;
  },
  /** Campeonatos publicados de um organizador (gancho na página dele). */
  getOrganizationChampionships: async (organizationSlug: string): Promise<ChampionshipSummary[]> => {
    const { data } = await apiClient.get(`${BASE}/organizations/${encodeURIComponent(organizationSlug)}`);
    const list = data.data ?? data;
    return Array.isArray(list) ? list : [];
  },
  getVersion: async (slug: string): Promise<ChampionshipVersion> => {
    const { data } = await apiClient.get(`${BASE}/${encodeURIComponent(slug)}/version`);
    return data.data ?? data;
  },
};
