import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationsService } from "@/services/notifications.service";
import { useIsCustomerScoped } from "./useAuth";
import { queryKeys } from "./queryKeys";

// /public/customer/notifications/* só aceita sessão com scope "customer" —
// numa sessão de admin/organizador (ex: professor logado numa organização)
// essas chamadas sempre voltam 401, e como o token está válido, o interceptor
// tenta renovar e repetir a cada refetch (a cada 60s pro contador), gastando
// refresh de token à toa e aumentando o risco de cair na detecção de reuso.
export const useUnreadCount = () => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: notificationsService.getUnreadCount,
    refetchInterval: 60_000,
    enabled: isCustomerScoped,
  });
};

export const useNotifications = () => {
  const isCustomerScoped = useIsCustomerScoped();
  return useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsService.getNotifications(0, 50),
    enabled: isCustomerScoped,
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
