import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { favoritesService } from "@/services/favorites.service";
import { useIsAuthenticated } from "./useAuth";
import { queryKeys } from "./queryKeys";

export const useFavorites = () => {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: () => favoritesService.getFavorites(0, 50),
    enabled: isAuthenticated,
  });
};

export const useCheckFavorite = (eventId: string) => {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: queryKeys.favorites.check(eventId),
    queryFn: () => favoritesService.check(eventId),
    enabled: isAuthenticated && Boolean(eventId),
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, isFavorited }: { eventId: string; isFavorited: boolean }) =>
      isFavorited ? favoritesService.remove(eventId) : favoritesService.add(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.favorites.all });
    },
  });
};
