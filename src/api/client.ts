import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/stores/authStore";

import { ApiError, NetworkError, TimeoutError } from "./errors";
import { tokenStorage } from "./tokenStorage";

/**
 * Base URL read from the Expo public environment variable.
 * Create a .env file in the project root:
 *   EXPO_PUBLIC_API_URL=http://localhost:3333
 */
const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3333";

const TIMEOUT_MS = 15_000;

// Sentinel header used to mark refresh-token requests and break retry loops.
const RETRY_HEADER = "x-retry-after-refresh";

const getRequestLabel = (config?: {
  baseURL?: string;
  url?: string;
  method?: string;
}) => {
  const method = config?.method?.toUpperCase() ?? "GET";
  const url = `${config?.baseURL ?? ""}${config?.url ?? ""}`;

  return `${method} ${url}`;
};

const buildCurlCommand = (config: InternalAxiosRequestConfig): string => {
  const method = config.method?.toUpperCase() ?? "GET";
  const url = `${config.baseURL ?? ""}${config.url ?? ""}`;

  let curl = `curl --location '${url}'`;

  if (method !== "GET") {
    curl += ` \\\n  --request ${method}`;
  }

  // Add headers
  const headers = config.headers as Record<string, string>;
  Object.entries(headers).forEach(([key, value]) => {
    if (value && typeof value === "string") {
      curl += ` \\\n  --header '${key}: ${value}'`;
    }
  });

  // Add query params
  if (config.params && Object.keys(config.params).length > 0) {
    const params = new URLSearchParams(config.params).toString();
    curl = curl.replace("'", `'?${params}'`);
  }

  // Add data/body
  if (config.data) {
    const dataStr =
      typeof config.data === "string"
        ? config.data
        : JSON.stringify(config.data);
    curl += ` \\\n  --data-raw '${dataStr}'`;
  }

  return curl;
};

const logApiRequest = (config: InternalAxiosRequestConfig) => {
  const curl = buildCurlCommand(config);
  console.log(`[API] Request: ${getRequestLabel(config)}\n${curl}`);
};

const logApiResponse = (config: { baseURL?: string; url?: string; method?: string }, data: unknown, status: number) => {
  console.log(`[API] Response: ${getRequestLabel(config)} -> ${status}`, data);
};

const logApiError = (config: { baseURL?: string; url?: string; method?: string } | undefined, status: number | undefined, data: unknown) => {
  console.log(`[API] Error: ${getRequestLabel(config)} -> ${status ?? "NO_RESPONSE"}`, data);
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ---------------------------------------------------------------------------
// Request interceptor — attach access token from storage + X-API-Key header
// ---------------------------------------------------------------------------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Inject X-API-Key header for authentication
    config.headers["X-API-Key"] = "supersecretadminkey1";

    logApiRequest(config);

    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Response interceptor — normalize errors + automatic token refresh on 401
// ---------------------------------------------------------------------------
apiClient.interceptors.response.use(
  (response) => {
    logApiResponse(response.config, response.data, response.status);
    return response;
  },
  async (error) => {
    if (!axios.isAxiosError(error)) {
      logApiError(undefined, undefined, error);
      return Promise.reject(error);
    }

    // No response from server (network failure / timeout)
    if (!error.response) {
      logApiError(error.config, undefined, error.message);
      if (error.code === "ECONNABORTED") {
        return Promise.reject(new TimeoutError());
      }
      return Promise.reject(new NetworkError(error.message));
    }

    const { status, data, config: originalConfig } = error.response;
    logApiError(originalConfig, status, data);

    // On 401: clear tokens and user state so user is logged out
    // Note: new API does not provide refresh token, so auto-refresh is not possible
    if (status === 401 && originalConfig) {
      const refreshToken = tokenStorage.getRefreshToken();
      
      // Only attempt refresh if we somehow have a refresh token (legacy support)
      if (
        refreshToken &&
        !originalConfig.headers?.[RETRY_HEADER]
      ) {
        try {
          const { data: refreshData } = await apiClient.post<{
            accessToken: string;
            expiresIn: string;
          }>(
            "/auth/refresh",
            { refreshToken },
            { headers: { [RETRY_HEADER]: "1" } },
          );

          tokenStorage.setAccessToken(refreshData.accessToken);
          originalConfig.headers.Authorization = `Bearer ${refreshData.accessToken}`;
          return apiClient.request(originalConfig);
        } catch {
          // Refresh failed — clear tokens so the user must log in again
          tokenStorage.clear();
          useAuthStore.getState().clearUser();
        }
      } else if (!refreshToken) {
        // No refresh token available, clear state
        tokenStorage.clear();
        useAuthStore.getState().clearUser();
      }
    }

    // Parse the API error envelope: { success: false, error: { code, message } }
    const body = data as {
      success?: boolean;
      error?: { code?: string; message?: string };
      message?: string;
    };
    const message = body?.error?.message ?? body?.message ?? error.message;
    const code = body?.error?.code;

    return Promise.reject(new ApiError(message, status, code, data));
  },
);
