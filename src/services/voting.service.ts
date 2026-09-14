import { apiClient } from "@/api/client";

/**
 * "Melhores do Ano" — votação por categoria com campo virtual. Mesma API
 * pública do site (/public/voting/*); toda regra (quem pode votar, peso,
 * voto único, apuração) fica no backend.
 */

export type VotingCategoryStatus = "DRAFT" | "SCHEDULED" | "OPEN" | "PAUSED" | "CLOSED" | "RESULTS_PUBLISHED";

export interface VotingCategorySummary {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  status: VotingCategoryStatus;
  votingStartsAt: string | null;
  votingEndsAt: string | null;
  resultsPublished: boolean;
  positionsCount: number;
}

export interface MyVotingStatus {
  eligibleCategoryIds: string[];
  votedCategoryIds: string[];
  votes: Array<{ voteId: string; categoryId: string }>;
  canVotePublic: boolean;
}

export interface VotingCompetitionRef {
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface VotingEdition {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  allowPublicVoting: boolean;
  captchaRequired: boolean;
  heroTitle: string | null;
  heroSubtitle: string | null;
  shareTitle: string | null;
  coverImageUrl: string | null;
  competition: VotingCompetitionRef;
  categories: VotingCategorySummary[];
  me: MyVotingStatus | null;
}

export interface VotingSchool {
  name: string;
  shortName: string | null;
  logoUrl: string | null;
}

export interface VotingPlayer {
  id: string;
  name: string;
  photoUrl: string | null;
  jerseyNumber: number | null;
  school: VotingSchool;
}

export interface VotingPosition {
  id?: string;
  key: string;
  label: string;
  shortLabel: string;
  sortOrder: number;
  pitchX: number;
  pitchY: number;
}

export interface BallotPosition extends VotingPosition {
  id: string;
  players: VotingPlayer[];
}

export interface VotingBallot {
  category: { id: string; name: string; slug: string; formationKey: string | null };
  edition: { id: string; shortName: string; captchaRequired: boolean };
  positions: BallotPosition[];
}

export interface VoteSelectionView {
  positionId?: string;
  position: VotingPosition;
  player: VotingPlayer;
}

export interface VoteView {
  id: string;
  categoryId: string;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  edition: { id: string; name: string; shortName: string; slug: string; shareTitle: string | null; competition: VotingCompetitionRef };
  selections: VoteSelectionView[];
  share: { shareId: string; displayName: string | null; imageUrl9x16: string | null; imageUrl1x1: string | null } | null;
}

export interface ShareView {
  shareId: string;
  displayName: string | null;
  title: string;
  category: { name: string; slug: string; formationKey: string | null };
  edition: { shortName: string; slug: string; coverImageUrl: string | null; competition: VotingCompetitionRef };
  selections: VoteSelectionView[];
  images: { story: string | null; square: string | null };
  publicUrl: string;
  voteUrl: string;
}

export interface PublicResults {
  category: { id: string; name: string; slug: string };
  edition: { shortName: string; slug: string; competition: { name: string; slug: string } };
  publishedAt: string | null;
  totalVotes: number;
  positions: Array<
    VotingPosition & {
      positionId: string;
      rows: Array<{ rank: number; playerId: string; player: VotingPlayer; rawVotes: number; weightedTotal: number; wonTieBreak: boolean }>;
    }
  >;
}

export interface SubmitVoteInput {
  submissionId: string;
  selections: Array<{ positionId: string; playerId: string }>;
}

export type ShareImageVariant = "9x16" | "1x1";

export interface OrganizationVotingEdition {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  coverImageUrl: string | null;
  allowPublicVoting: boolean;
  competition: VotingCompetitionRef;
  categoriesTotal: number;
  categoriesOpen: number;
  categoriesScheduled: number;
  categoriesWithResults: number;
}

const BASE = "/public/voting";

export const votingService = {
  /** GET /public/voting/organizations/:slug/editions — gancho da página do organizador. */
  getOrganizationEditions: async (organizationSlug: string): Promise<OrganizationVotingEdition[]> => {
    const { data } = await apiClient.get(`${BASE}/organizations/${organizationSlug}/editions`);
    return data.data ?? [];
  },

  /** GET /public/voting/editions/:competitionSlug/:editionSlug — com `me` quando logado. */
  getEdition: async (competitionSlug: string, editionSlug: string): Promise<VotingEdition> => {
    const { data } = await apiClient.get(`${BASE}/editions/${competitionSlug}/${editionSlug}`);
    return data.data;
  },

  /** GET /public/voting/categories/:id/ballot — posições + atletas elegíveis (exige votação aberta). */
  getBallot: async (categoryId: string): Promise<VotingBallot> => {
    const { data } = await apiClient.get(`${BASE}/categories/${categoryId}/ballot`);
    return data.data;
  },

  /** POST /public/voting/categories/:id/votes — o app é cliente confiável: sem captcha. */
  submitVote: async (categoryId: string, input: SubmitVoteInput): Promise<VoteView> => {
    const { data } = await apiClient.post(`${BASE}/categories/${categoryId}/votes`, input);
    return data.data;
  },

  getMyVoteForCategory: async (categoryId: string): Promise<VoteView | null> => {
    const { data } = await apiClient.get(`${BASE}/categories/${categoryId}/my-vote`);
    return data.data ?? null;
  },

  createShare: async (voteId: string, displayName: string | null): Promise<ShareView> => {
    const { data } = await apiClient.post(`${BASE}/votes/${voteId}/share`, { displayName });
    return data.data;
  },

  /** Envia o card gerado no aparelho (PNG) para virar preview do link. */
  uploadShareImage: async (voteId: string, variant: ShareImageVariant, fileUri: string): Promise<ShareView> => {
    const form = new FormData();
    form.append("file", { uri: fileUri, name: `selecao-${variant}.png`, type: "image/png" } as unknown as Blob);
    const { data } = await apiClient.post(`${BASE}/votes/${voteId}/share-image`, form, {
      params: { variant },
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  getShare: async (shareId: string): Promise<ShareView> => {
    const { data } = await apiClient.get(`${BASE}/share/${shareId}`);
    return data.data;
  },

  getResults: async (categoryId: string): Promise<PublicResults> => {
    const { data } = await apiClient.get(`${BASE}/categories/${categoryId}/results`);
    return data.data;
  },
};
