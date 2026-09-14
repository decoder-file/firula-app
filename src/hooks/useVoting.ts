import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { votingService, type SubmitVoteInput, type VotingEdition } from "@/services/voting.service";
import { useAuthHydrated, useIsCustomerScoped } from "./useAuth";
import { queryKeys } from "./queryKeys";

/** Votações ativas de uma organização (gancho na página do organizador). */
export const useOrganizationVotingEditions = (organizationSlug: string | null | undefined) =>
  useQuery({
    queryKey: queryKeys.voting.organizationEditions(organizationSlug ?? ""),
    queryFn: () => votingService.getOrganizationEditions(organizationSlug!),
    enabled: Boolean(organizationSlug),
    staleTime: 60_000,
    retry: false,
  });

/** Edição + categorias; refeita quando o login muda (o `me` depende dele). */
export const useVotingEdition = (competitionSlug: string | undefined, editionSlug: string | undefined) => {
  const isCustomerScoped = useIsCustomerScoped();
  const hydrated = useAuthHydrated();
  return useQuery({
    queryKey: queryKeys.voting.edition(competitionSlug ?? "", editionSlug ?? "", isCustomerScoped),
    queryFn: () => votingService.getEdition(competitionSlug!, editionSlug!),
    enabled: Boolean(competitionSlug && editionSlug) && hydrated,
    staleTime: 30_000,
  });
};

export const findCategoryBySlug = (edition: VotingEdition | undefined, categorySlug: string | undefined) =>
  edition && categorySlug ? edition.categories.find((category) => category.slug === categorySlug) : undefined;

export const useVotingBallot = (categoryId: string | undefined) => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.voting.ballot(categoryId ?? ""),
    queryFn: () => votingService.getBallot(categoryId!),
    enabled: Boolean(categoryId) && isCustomerScoped,
    staleTime: 60_000,
    retry: false,
  });
};

export const useMyVote = (categoryId: string | undefined) => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.voting.myVote(categoryId ?? ""),
    queryFn: () => votingService.getMyVoteForCategory(categoryId!),
    enabled: Boolean(categoryId) && isCustomerScoped,
    retry: false,
  });
};

export const useSubmitVote = (categoryId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitVoteInput) => votingService.submitVote(categoryId, input),
    onSuccess: (vote) => {
      queryClient.setQueryData(queryKeys.voting.myVote(categoryId), vote);
      queryClient.invalidateQueries({ queryKey: [...queryKeys.voting.all, "edition"] });
    },
  });
};

export const useVotingShare = (shareId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.voting.share(shareId ?? ""),
    queryFn: () => votingService.getShare(shareId!),
    enabled: Boolean(shareId),
    retry: false,
  });

export const useVotingResults = (categoryId: string | undefined) =>
  useQuery({
    queryKey: queryKeys.voting.results(categoryId ?? ""),
    queryFn: () => votingService.getResults(categoryId!),
    enabled: Boolean(categoryId),
    retry: false,
  });
