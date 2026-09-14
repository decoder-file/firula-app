import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { clearPosition, selectPlayer, type BallotDraft } from "@/utils/votingBallot";

/**
 * Rascunhos da seleção por categoria — sobrevivem a fechar o app (a pessoa
 * monta o time aos poucos) e são apagados ao votar.
 */
interface VotingDraftState {
  drafts: Record<string, BallotDraft>;
  select: (categoryId: string, positionId: string, playerId: string) => void;
  clear: (categoryId: string, positionId: string) => void;
  replace: (categoryId: string, draft: BallotDraft) => void;
  reset: (categoryId: string) => void;
}

export const useVotingDraftStore = create<VotingDraftState>()(
  persist(
    (set) => ({
      drafts: {},
      select: (categoryId, positionId, playerId) =>
        set((state) => ({ drafts: { ...state.drafts, [categoryId]: selectPlayer(state.drafts[categoryId] ?? {}, positionId, playerId) } })),
      clear: (categoryId, positionId) =>
        set((state) => ({ drafts: { ...state.drafts, [categoryId]: clearPosition(state.drafts[categoryId] ?? {}, positionId) } })),
      replace: (categoryId, draft) => set((state) => ({ drafts: { ...state.drafts, [categoryId]: draft } })),
      reset: (categoryId) =>
        set((state) => {
          const { [categoryId]: _removed, ...rest } = state.drafts;
          return { drafts: rest };
        }),
    }),
    { name: "firula-voting-drafts", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

const EMPTY: BallotDraft = {};
export const selectDraft = (categoryId: string) => (state: VotingDraftState) => state.drafts[categoryId] ?? EMPTY;
