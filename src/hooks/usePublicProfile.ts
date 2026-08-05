import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { publicProfileService } from "@/services/publicProfile.service";
import { queryKeys } from "./queryKeys";

export const usePublicProfile = (username: string) =>
  useQuery({
    queryKey: queryKeys.publicProfile.detail(username),
    queryFn: () => publicProfileService.getByUsername(username),
    enabled: Boolean(username),
    retry: false,
  });

export const usePublicProfileFollowStatus = (username: string, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.publicProfile.followStatus(username),
    queryFn: () => publicProfileService.getFollowStatus(username),
    enabled: Boolean(username) && enabled,
  });

export const useFollowPublicProfile = (username: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isFollowing: boolean) =>
      isFollowing ? publicProfileService.unfollow(username) : publicProfileService.follow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicProfile.detail(username) });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicProfile.followStatus(username) });
    },
  });
};

/**
 * Igual a useFollowPublicProfile, mas não fica preso a um único username —
 * pensado pra alternar seguir/deixar de seguir em cada linha de uma lista de
 * seguidores/seguindo, onde cada linha é uma pessoa diferente.
 */
export const useToggleFollowByUsername = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ username, isFollowing }: { username: string; isFollowing: boolean }) =>
      isFollowing ? publicProfileService.unfollow(username) : publicProfileService.follow(username),
    onSuccess: (_result, { username }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.publicProfile.detail(username) });
      queryClient.invalidateQueries({ queryKey: queryKeys.publicProfile.followStatus(username) });
    },
  });
};

export const usePublicProfileFollowers = (username: string, skip: number, take: number, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.publicProfile.followers(username, skip, take),
    queryFn: () => publicProfileService.getFollowers(username, skip, take),
    enabled: Boolean(username) && enabled,
  });

export const usePublicProfileFollowing = (username: string, skip: number, take: number, enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.publicProfile.following(username, skip, take),
    queryFn: () => publicProfileService.getFollowing(username, skip, take),
    enabled: Boolean(username) && enabled,
  });
