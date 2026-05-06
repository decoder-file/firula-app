import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService, type AuthCustomer } from "@/services/auth.service";
import type { LoginPayload, RegisterPayload } from "@/services/auth.service";
import { selectIsAuthenticated, useAuthStore } from "@/stores/authStore";
import { usersService } from "@/services/users.service";
import { queryKeys } from "./queryKeys";

export const useIsAuthenticated = () => useAuthStore(selectIsAuthenticated);

export const useAuthUser = () => useAuthStore((state) => state.customer);

export const useAuthUserProfile = () => useAuthStore((state) => state.userProfile);

export const useAuthHydrated = () => useAuthStore((state) => state.isHydrated);

export const useProfile = () =>
  useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: usersService.getProfile,
  });

export const useMe = () =>
  useQuery({
    queryKey: queryKeys.users.profile(),
    queryFn: authService.getMe,
  });

export const useLogin = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      // Map LoginResponseData to AuthCustomer and AuthUserProfile
      const customer: AuthCustomer = {
        identityId: data.identityId,
        email: data.email,
        scope: data.scope,
        adminProfiles: data.adminProfiles,
      };
      setUser(customer, data.customerProfile);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
    onSuccess: (data) => {
      // Map LoginResponseData to AuthCustomer and AuthUserProfile
      const customer: AuthCustomer = {
        identityId: data.identityId,
        email: data.email,
        scope: data.scope,
        adminProfiles: data.adminProfiles,
      };
      setUser(customer, data.customerProfile);
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: authService.logout,
    onSettled: () => {
      clearUser();
      queryClient.clear();
    },
  });
};
