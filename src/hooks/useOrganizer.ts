import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { organizerService } from "@/services/organizer.service";
import { queryKeys } from "./queryKeys";

export const useOrganizerProfile = (slug: string) =>
  useQuery({
    queryKey: queryKeys.organizer.detail(slug),
    queryFn: () => organizerService.getProfile(slug),
    enabled: Boolean(slug),
  });

export const useOrganizerRatings = (slug: string, enabled = true) =>
  useQuery({
    queryKey: [...queryKeys.organizer.detail(slug), "ratings"],
    queryFn: () => organizerService.getRatings(slug),
    enabled: Boolean(slug) && enabled,
  });

export const useFollowOrganizer = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isFollowing: boolean) =>
      isFollowing ? organizerService.unfollow(slug) : organizerService.follow(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.detail(slug) });
    },
  });
};

export const useFavoriteOrganizer = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isFavorited: boolean) =>
      isFavorited ? organizerService.unfavorite(slug) : organizerService.favorite(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.detail(slug) });
    },
  });
};

/**
 * Igual a useFollowOrganizer, mas não fica preso a um único slug — pensado
 * pra alternar seguir/deixar de seguir em cada linha de uma lista com várias
 * organizações diferentes (ex.: aba "Seguindo" do FollowListSheet), mesmo
 * espírito de useToggleFollowByUsername em usePublicProfile.ts.
 */
export const useToggleFollowOrganizationBySlug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgSlug, isFollowing }: { orgSlug: string; isFollowing: boolean }) =>
      isFollowing ? organizerService.unfollow(orgSlug) : organizerService.follow(orgSlug),
    onSuccess: (_result, { orgSlug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.detail(orgSlug) });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicProfile.followingAll() });
    },
  });
};

/**
 * Igual a useFavoriteOrganizer, mas não fica preso a um único slug — pensado
 * pra alternar favoritar/desfavoritar em cada linha de uma lista com várias
 * organizações diferentes (ex.: tela de Favoritos), mesmo espírito de
 * useToggleFollowByUsername em usePublicProfile.ts.
 */
export const useToggleFavoriteOrganizationBySlug = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgSlug, isFavorited }: { orgSlug: string; isFavorited: boolean }) =>
      isFavorited ? organizerService.unfavorite(orgSlug) : organizerService.favorite(orgSlug),
    onSuccess: (_result, { orgSlug }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.detail(orgSlug) });
    },
  });
};

export const useRateOrganizer = (slug: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      organizerService.rate(slug, rating, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.organizer.detail(slug) });
    },
  });
};

export const useOrganizerStoreProducts = (storeSlug: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.organizer.storeProducts(storeSlug),
    queryFn: () => organizerService.listStoreProducts(storeSlug),
    enabled: Boolean(storeSlug) && enabled,
  });

export const useOrganizerDayUseOfferings = (orgSlug: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.organizer.dayUseOfferings(orgSlug),
    queryFn: () => organizerService.listDayUseOfferings(orgSlug),
    enabled: Boolean(orgSlug) && enabled,
  });

export const useOrganizerCourts = (orgSlug: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.organizer.courts(orgSlug),
    queryFn: () => organizerService.listCourts(orgSlug),
    enabled: Boolean(orgSlug) && enabled,
  });

export const useCourtAvailability = (courtId: string, date: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.organizer.courtAvailability(courtId, date),
    queryFn: () => organizerService.getCourtAvailability(courtId, date),
    enabled: Boolean(courtId) && Boolean(date) && enabled,
  });
