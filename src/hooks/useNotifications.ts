import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationsService } from "@/services/notifications.service";
import { useIsAuthenticated } from "./useAuth";
import { queryKeys } from "./queryKeys";

export const useUnreadCount = () => {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsService.getUnreadCount,
    refetchInterval: 60_000,
    enabled: isAuthenticated,
  });
};

export const useNotifications = () => {
  const isAuthenticated = useIsAuthenticated();
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsService.getNotifications(0, 50),
    enabled: isAuthenticated,
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: notificationsService.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
