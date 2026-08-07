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
