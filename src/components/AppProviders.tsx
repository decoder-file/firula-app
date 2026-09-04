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
import Constants from "expo-constants";
import * as SplashScreen from "expo-splash-screen";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import FirulaSplashScreen from "@/components/FirulaSplashScreen";
import { ForceUpdateScreen } from "@/components/ForceUpdateScreen";

import { tokenStorage } from "@/api/tokenStorage";
import { authService } from "@/services/auth.service";
import { appConfigService } from "@/services/appConfig.service";
import { ensureFirstLaunchRecorded } from "@/services/appRating.service";
import { checkAndMaybeShowRatingPrompt } from "@/features/app-rating/RateAppModal";
import { AppProvider } from "@/contexts/AppContext";
import { useAuthStore } from "@/stores/authStore";
import { isNetworkError, isServerError } from "@/api/errors";
import { isVersionBelow } from "@/utils/version";
import { colors } from "@/theme/colors";
import { usePushNotifications } from "@/hooks/usePushNotifications";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function PushSetup() {
  usePushNotifications();
  return null;
}

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
  const [authCheckDone, setAuthCheckDone] = useState(false);
  const [forceUpdateCheckDone, setForceUpdateCheckDone] = useState(false);
  const [updateRequired, setUpdateRequired] = useState(false);
  const [updateStoreUrl, setUpdateStoreUrl] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

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
    let cancelled = false;

    tokenStorage
      .init()
      .then(async () => {
        const storedRefreshToken = tokenStorage.getRefreshToken();

        if (!storedRefreshToken && !tokenStorage.getAccessToken()) {
          if (!cancelled) clearUser();
          return;
        }

        if (storedRefreshToken && !tokenStorage.getAccessToken()) {
          // Cold start: the in-memory access token is gone (by design), but
          // we have a persisted refresh token — try a silent refresh before
          // deciding the session is actually over, so the user isn't logged
          // out just because the app process restarted.
          try {
            await authService.refreshToken(storedRefreshToken);
          } catch {
            if (!cancelled) {
              tokenStorage.clear();
              clearUser();
            }
          }
        }
      })
      .catch(() => {
        if (!cancelled) clearUser();
      })
      .finally(() => {
        if (!cancelled) setAuthCheckDone(true);
      });

    return () => {
      cancelled = true;
    };
  }, [clearUser]);

  useEffect(() => {
    let cancelled = false;

    appConfigService
      .getAppConfig()
      .then((config) => {
        if (cancelled) return;

        const currentVersion = Constants.expoConfig?.version;
        const platformConfig =
          Platform.OS === "ios" ? config.ios : Platform.OS === "android" ? config.android : null;

        if (
          currentVersion &&
          platformConfig &&
          isVersionBelow(currentVersion, platformConfig.minVersion)
        ) {
          setUpdateRequired(true);
          setUpdateStoreUrl(platformConfig.storeUrl);
          setUpdateMessage(config.updateMessage || null);
        }
      })
      .catch(() => {
        // Fail-open: network/timeout/server errors never block the app.
      })
      .finally(() => {
        if (!cancelled) setForceUpdateCheckDone(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // Non-blocking by design: an OTA update, if found, is only fetched here.
    // It becomes active on the next full app restart — never interrupts the
    // current session, and a failure here must never affect app launch.
    if (__DEV__ || !Updates.isEnabled) return;

    let cancelled = false;

    Updates.checkForUpdateAsync()
      .then((result) => {
        if (cancelled || !result.isAvailable) return;
        return Updates.fetchUpdateAsync();
      })
      .catch(() => {
        // Silent: no update fetched, next restart just keeps the current bundle.
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = setTimeout(() => setShowSplash(false), SPLASH_MIN_DURATION);
    return () => clearTimeout(timer);
  }, [loaded]);

  // Caminho "tempo de uso" do gate de avaliação (o outro caminho, "tarefa
  // importante", roda em SuccessStep após uma compra) — só depois que o app
  // realmente terminou de abrir, nunca competindo com splash/login.
  useEffect(() => {
    if (!loaded || showSplash || !authCheckDone || !forceUpdateCheckDone) return;
    ensureFirstLaunchRecorded().then(checkAndMaybeShowRatingPrompt);
  }, [loaded, showSplash, authCheckDone, forceUpdateCheckDone]);

  if (!loaded || showSplash || !authCheckDone || !forceUpdateCheckDone) {
    return <FirulaSplashScreen />;
  }

  if (updateRequired && updateStoreUrl) {
    return <ForceUpdateScreen storeUrl={updateStoreUrl} message={updateMessage} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <PushSetup />
          {children}
        </AppProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
};