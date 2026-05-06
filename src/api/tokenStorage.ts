import * as SecureStore from "expo-secure-store";

const REFRESH_TOKEN_KEY = "firula_refresh_token";

/**
 * Token strategy:
 * - access token lives only in memory
 * - refresh token is mirrored to SecureStore for session restoration
 */

let _accessToken: string | null = null;
let _refreshToken: string | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    return _accessToken;
  },
  setAccessToken(token: string | null): void {
    _accessToken = token;
  },

  getRefreshToken(): string | null {
    return _refreshToken;
  },
  setRefreshToken(token: string | null): void {
    _refreshToken = token;
    if (token) {
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token).catch(() => undefined);
      return;
    }

    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY).catch(() => undefined);
  },

  async init(): Promise<void> {
    const storedRefreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    _refreshToken = storedRefreshToken ?? null;
  },

  clear(): void {
    _accessToken = null;
    this.setRefreshToken(null);
  },
};
