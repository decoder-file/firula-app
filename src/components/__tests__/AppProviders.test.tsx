import { act, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";

import { AppProviders } from "@/components/AppProviders";
import { tokenStorage } from "@/api/tokenStorage";
import { authService } from "@/services/auth.service";
import { appConfigService } from "@/services/appConfig.service";

jest.mock("@expo-google-fonts/plus-jakarta-sans", () => ({
  useFonts: () => [true],
  PlusJakartaSans_400Regular: {},
  PlusJakartaSans_500Medium: {},
  PlusJakartaSans_600SemiBold: {},
  PlusJakartaSans_700Bold: {},
  PlusJakartaSans_800ExtraBold: {},
}));

jest.mock("expo-splash-screen", () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock("@react-native-community/netinfo", () => ({
  addEventListener: jest.fn(() => () => undefined),
}));

jest.mock("@/hooks/usePushNotifications", () => ({
  usePushNotifications: jest.fn(),
}));

jest.mock("@/components/FirulaSplashScreen", () => {
  const { Text: RNText } = require("react-native");
  return {
    __esModule: true,
    default: () => <RNText testID="splash-screen">splash</RNText>,
  };
});

jest.mock("@/api/tokenStorage", () => ({
  tokenStorage: {
    init: jest.fn(),
    getAccessToken: jest.fn(),
    getRefreshToken: jest.fn(),
    setAccessToken: jest.fn(),
    setRefreshToken: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock("@/services/auth.service", () => ({
  authService: {
    refreshToken: jest.fn(),
  },
}));

jest.mock("@/services/appConfig.service", () => ({
  appConfigService: {
    getAppConfig: jest.fn(),
  },
}));

jest.mock("expo-constants", () => ({
  __esModule: true,
  default: { expoConfig: { version: "1.0.4" } },
}));

jest.mock("@/components/ForceUpdateScreen", () => {
  const { Text: RNText } = require("react-native");
  return {
    __esModule: true,
    ForceUpdateScreen: ({ storeUrl }: { storeUrl: string }) => (
      <RNText testID="force-update-screen">{storeUrl}</RNText>
    ),
  };
});

const clearUser = jest.fn();
jest.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: { clearUser: () => void }) => unknown) =>
    selector({ clearUser }),
}));

const SPLASH_MIN_DURATION = 2500;

describe("AppProviders auth bootstrap", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tokenStorage.init as jest.Mock).mockResolvedValue(undefined);
    (appConfigService.getAppConfig as jest.Mock).mockResolvedValue({
      ios: { minVersion: "0.0.0", storeUrl: "https://apps.apple.com/app/id123" },
      android: {
        minVersion: "0.0.0",
        storeUrl: "https://play.google.com/store/apps/details?id=com.firulaapp",
      },
      updateMessage: null,
    });
  });

  it("clears the user when there is no access token and no refresh token", async () => {
    (tokenStorage.getRefreshToken as jest.Mock).mockReturnValue(null);
    (tokenStorage.getAccessToken as jest.Mock).mockReturnValue(null);

    render(
      <AppProviders>
        <Text>children</Text>
      </AppProviders>,
    );

    await waitFor(() => {
      expect(clearUser).toHaveBeenCalledTimes(1);
    });
    expect(authService.refreshToken).not.toHaveBeenCalled();
  });

  it("attempts a silent refresh and preserves the session when a refresh token is persisted", async () => {
    jest.useFakeTimers();

    (tokenStorage.getRefreshToken as jest.Mock).mockReturnValue("stored-refresh-token");
    (tokenStorage.getAccessToken as jest.Mock).mockReturnValue(null);
    (authService.refreshToken as jest.Mock).mockResolvedValue({
      accessToken: "new-access-token",
      expiresIn: "24h",
    });

    const { queryByTestId, findByText } = render(
      <AppProviders>
        <Text>children</Text>
      </AppProviders>,
    );

    // Still checking: splash stays up even though fonts are already "loaded".
    expect(queryByTestId("splash-screen")).toBeTruthy();

    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await jest.advanceTimersByTimeAsync(SPLASH_MIN_DURATION);
    });

    expect(await findByText("children")).toBeTruthy();
    expect(authService.refreshToken).toHaveBeenCalledWith("stored-refresh-token");
    expect(clearUser).not.toHaveBeenCalled();
    expect(tokenStorage.clear).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  it("clears the session when the silent refresh fails", async () => {
    (tokenStorage.getRefreshToken as jest.Mock).mockReturnValue("stored-refresh-token");
    (tokenStorage.getAccessToken as jest.Mock).mockReturnValue(null);
    (authService.refreshToken as jest.Mock).mockRejectedValue(new Error("invalid refresh token"));

    render(
      <AppProviders>
        <Text>children</Text>
      </AppProviders>,
    );

    await waitFor(() => {
      expect(tokenStorage.clear).toHaveBeenCalledTimes(1);
      expect(clearUser).toHaveBeenCalledTimes(1);
    });
  });

  it("keeps the splash screen up until both fonts and the auth check are done", async () => {
    jest.useFakeTimers();

    (tokenStorage.getRefreshToken as jest.Mock).mockReturnValue(null);
    (tokenStorage.getAccessToken as jest.Mock).mockReturnValue(null);

    const { queryByTestId } = render(
      <AppProviders>
        <Text>children</Text>
      </AppProviders>,
    );

    // The auth check resolves almost immediately (no refresh needed), but the
    // splash has a minimum duration tied to font loading — it must still be
    // visible right after mount, before that timer elapses.
    expect(queryByTestId("splash-screen")).toBeTruthy();

    await act(async () => {
      await jest.advanceTimersByTimeAsync(SPLASH_MIN_DURATION);
    });

    expect(queryByTestId("splash-screen")).toBeNull();

    jest.useRealTimers();
  });
});

describe("AppProviders force-update check", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (tokenStorage.init as jest.Mock).mockResolvedValue(undefined);
    (tokenStorage.getRefreshToken as jest.Mock).mockReturnValue(null);
    (tokenStorage.getAccessToken as jest.Mock).mockReturnValue(null);
  });

  it("shows ForceUpdateScreen when the current version is below the configured minimum", async () => {
    jest.useFakeTimers();

    (appConfigService.getAppConfig as jest.Mock).mockResolvedValue({
      ios: { minVersion: "9.9.9", storeUrl: "https://apps.apple.com/app/id123" },
      android: {
        minVersion: "9.9.9",
        storeUrl: "https://play.google.com/store/apps/details?id=com.firulaapp",
      },
      updateMessage: "Atualize agora",
    });

    const { findByTestId } = render(
      <AppProviders>
        <Text>children</Text>
      </AppProviders>,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(SPLASH_MIN_DURATION);
    });

    expect(await findByTestId("force-update-screen")).toBeTruthy();

    jest.useRealTimers();
  });

  it("does not show ForceUpdateScreen when the current version already satisfies the minimum", async () => {
    jest.useFakeTimers();

    (appConfigService.getAppConfig as jest.Mock).mockResolvedValue({
      ios: { minVersion: "1.0.4", storeUrl: "https://apps.apple.com/app/id123" },
      android: {
        minVersion: "1.0.4",
        storeUrl: "https://play.google.com/store/apps/details?id=com.firulaapp",
      },
      updateMessage: null,
    });

    const { findByText, queryByTestId } = render(
      <AppProviders>
        <Text>children</Text>
      </AppProviders>,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(SPLASH_MIN_DURATION);
    });

    expect(await findByText("children")).toBeTruthy();
    expect(queryByTestId("force-update-screen")).toBeNull();

    jest.useRealTimers();
  });

  it("fails open (does not block) when the config check errors", async () => {
    jest.useFakeTimers();

    (appConfigService.getAppConfig as jest.Mock).mockRejectedValue(new Error("network error"));

    const { findByText, queryByTestId } = render(
      <AppProviders>
        <Text>children</Text>
      </AppProviders>,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(SPLASH_MIN_DURATION);
    });

    expect(await findByText("children")).toBeTruthy();
    expect(queryByTestId("force-update-screen")).toBeNull();

    jest.useRealTimers();
  });

  it("keeps the splash screen up until the force-update check resolves", async () => {
    jest.useFakeTimers();

    let resolveConfig: (value: unknown) => void = () => undefined;
    (appConfigService.getAppConfig as jest.Mock).mockReturnValue(
      new Promise((resolve) => {
        resolveConfig = resolve;
      }),
    );

    const { queryByTestId } = render(
      <AppProviders>
        <Text>children</Text>
      </AppProviders>,
    );

    await act(async () => {
      await jest.advanceTimersByTimeAsync(SPLASH_MIN_DURATION);
    });

    // Splash-min-duration and the auth check are both done, but the
    // force-update check is still pending — splash must stay visible.
    expect(queryByTestId("splash-screen")).toBeTruthy();

    await act(async () => {
      resolveConfig({
        ios: { minVersion: "0.0.0", storeUrl: "" },
        android: { minVersion: "0.0.0", storeUrl: "" },
        updateMessage: null,
      });
      await Promise.resolve();
    });

    expect(queryByTestId("splash-screen")).toBeNull();

    jest.useRealTimers();
  });
});
