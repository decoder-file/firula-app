import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AuthCustomer, AuthUserProfile } from "@/services/auth.service";

interface AuthState {
  customer: AuthCustomer | null;
  userProfile: AuthUserProfile | null;
  isHydrated: boolean;
}

interface AuthActions {
  setUser: (customer: AuthCustomer, userProfile: AuthUserProfile | null) => void;
  clearUser: () => void;
  setHydrated: (value: boolean) => void;
}

export type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      customer: null,
      userProfile: null,
      isHydrated: false,
      setUser: (customer, userProfile) => set({ customer, userProfile }),
      clearUser: () => set({ customer: null, userProfile: null }),
      setHydrated: (value) => set({ isHydrated: value }),
    }),
    {
      name: "firula-auth-user",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        customer: state.customer,
        userProfile: state.userProfile,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);

export const selectIsAuthenticated = (state: AuthStore): boolean =>
  state.customer !== null;