import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { favoritesService } from "@/services/favorites.service";
import { useIsCustomerScoped } from "./useAuth";
import { queryKeys } from "./queryKeys";

// /public/customer/favorites só aceita sessão com scope "customer" — ver
// useNotifications.ts pro motivo de checar isso em vez de "está autenticado".
export const useFavorites = () => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.favorites.list(),
    queryFn: () => favoritesService.getFavorites(0, 50),
    enabled: isCustomerScoped,
  });
};

export const useCheckFavorite = (eventId: string) => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.favorites.check(eventId),
    queryFn: () => favoritesService.check(eventId),
    enabled: isCustomerScoped && Boolean(eventId),
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
