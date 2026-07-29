import { act, render, waitFor } from "@testing-library/react-native";
import { Text } from "react-native";

import { AppProviders } from "@/components/AppProviders";
import { tokenStorage } from "@/api/tokenStorage";
import { authService } from "@/services/auth.service";

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
