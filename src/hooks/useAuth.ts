import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authService, type AuthCustomer } from "@/services/auth.service";
import type {
  AuthUserProfile,
  LoginPayload,
  RegisterPayload,
  VerifyLoginCodePayload,
} from "@/services/auth.service";
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

const useCompleteAuthSession = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return {
    completeSession: (
      data: {
        identityId: string;
        scope: string;
        adminProfiles: AuthCustomer["adminProfiles"];
        customerProfile: AuthUserProfile | null | undefined;
        email?: string;
      },
      fallbackEmail: string,
    ) => {
      const customer: AuthCustomer = {
        identityId: data.identityId,
        email: data.email ?? fallbackEmail,
        scope: data.scope,
        adminProfiles: data.adminProfiles,
      };

      setUser(customer, data.customerProfile ?? null);
      queryClient.invalidateQueries();
      queryClient.refetchQueries({ type: "active" });
    },
  };
};

export const useRequestLoginCode = () =>
  useMutation({
    mutationFn: authService.requestLoginCode,
  });

export const useLogin = () => {
  const { completeSession } = useCompleteAuthSession();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data, variables) => {
      completeSession(data, variables.email);
    },
  });
};

export const useVerifyLoginCode = () => {
  const { completeSession } = useCompleteAuthSession();

  return useMutation({
    mutationFn: (payload: VerifyLoginCodePayload) => authService.verifyLoginCode(payload),
    onSuccess: (data, variables) => {
      completeSession(data, variables.email);
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });
};

export const useRequestPasswordResetCode = () =>
  useMutation({
    mutationFn: (email: string) => authService.requestPasswordResetCode(email),
  });

export const useVerifyPasswordResetCode = () =>
  useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authService.verifyPasswordResetCode(email, code),
  });

export const useConfirmPasswordReset = () => {
  const { completeSession } = useCompleteAuthSession();
  return useMutation({
    mutationFn: ({ resetToken, password }: { resetToken: string; password: string; email: string }) =>
      authService.confirmPasswordReset(resetToken, password),
    onSuccess: (data, variables) => {
      completeSession(data, variables.email);
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
