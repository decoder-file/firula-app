import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { tokenStorage } from "@/api/tokenStorage";
import { AppProvider } from "@/contexts/AppContext";
import { useAuthStore } from "@/stores/authStore";
import { isNetworkError, isServerError } from "@/api/errors";
import { colors } from "@/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: (failureCount, error) => {
        // Never retry on client errors (4xx) — only on network/server issues
        if (isNetworkError(error) || isServerError(error)) {
          return failureCount < 2;
        }
        return false;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const clearUser = useAuthStore((state) => state.clearUser);

  const [loaded] = useFonts({
    "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
    "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
    "PlusJakartaSans-ExtraBold": PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    tokenStorage
      .init()
      .then(() => {
        if (!tokenStorage.getRefreshToken() && !tokenStorage.getAccessToken()) {
          clearUser();
        }
      })
      .catch(() => undefined);
  }, [clearUser]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>{children}</AppProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};