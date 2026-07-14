import NetInfo from "@react-native-community/netinfo";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { useFonts } from "@expo-google-fonts/plus-jakarta-sans";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from "@expo-google-fonts/plus-jakarta-sans";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import FirulaSplashScreen from "@/components/FirulaSplashScreen";

import { tokenStorage } from "@/api/tokenStorage";
import { AppProvider } from "@/contexts/AppContext";
import { useAuthStore } from "@/stores/authStore";
import { isNetworkError, isServerError } from "@/api/errors";
import { colors } from "@/theme/colors";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

// Informa o TanStack Query sobre o estado real de conectividade.
// Queries pausam quando offline e refazem automaticamente quando a conexão volta.
onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => {
    setOnline(state.isConnected !== false);
  }),
);

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

const SPLASH_MIN_DURATION = 2500;

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const clearUser = useAuthStore((state) => state.clearUser);
  const [showSplash, setShowSplash] = useState(true);

  const [loaded] = useFonts({
    "PlusJakartaSans-Regular": PlusJakartaSans_400Regular,
    "PlusJakartaSans-Medium": PlusJakartaSans_500Medium,
    "PlusJakartaSans-SemiBold": PlusJakartaSans_600SemiBold,
    "PlusJakartaSans-Bold": PlusJakartaSans_700Bold,
    "PlusJakartaSans-ExtraBold": PlusJakartaSans_800ExtraBold,
  });

  useEffect(() => {
    // Hide the native expo splash immediately so our custom one takes over
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

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
    if (!loaded) return;
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, [loaded]);

  if (!loaded || showSplash) {
    return <FirulaSplashScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>{children}</AppProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};