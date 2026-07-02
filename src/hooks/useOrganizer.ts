import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { organizerService } from "@/services/organizer.service";
import { queryKeys } from "./queryKeys";

export const useOrganizerProfile = (slug: string) =>
  useQuery({
    queryKey: queryKeys.organizer.detail(slug),
    queryFn: () => organizerService.getProfile(slug),
    enabled: Boolean(slug),
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
