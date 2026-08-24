import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

import { useAuthStore } from "@/stores/authStore";

import { ApiError, NetworkError, TimeoutError } from "./errors";
import { tokenStorage } from "./tokenStorage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

// QA is noticeably slower than prod, so it gets a much longer timeout to
// avoid spurious TimeoutErrors during manual testing.
const IS_QA = BASE_URL?.toLowerCase().includes("qa") ?? false;
const TIMEOUT_MS = IS_QA ? 120_000 : 15_000;

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

    // Lets the backend know it's safe to include the refreshToken in the
    // JSON body (mobile has no persistent cookie jar across app restarts).
    config.headers["X-Client-Platform"] = "mobile";

    logApiRequest(config);

    return config;
  },
  (error) => Promise.reject(error),
);

// ---------------------------------------------------------------------------
// Refresh de sessão — single-flight
// ---------------------------------------------------------------------------
// Refresh tokens são de uso único: se duas chamadas concorrentes tentarem
// renovar ao mesmo tempo (ex: o bootstrap de cold-start em AppProviders e o
// interceptor de 401 abaixo, ou vários requests que expiraram juntos logo
// após o login), a segunda chegaria no backend com um refresh token que a
// primeira já consumiu, disparando a detecção de reuso do backend — que
// revoga a sessão inteira e desloga o usuário à toa. Esse guard garante que
// só existe UMA chamada de /auth/refresh em voo por vez; qualquer chamada
// concorrente reaproveita a mesma promise em vez de disparar a sua própria.
type RefreshSessionResponse = { accessToken: string; refreshToken?: string; expiresIn: string };

let inFlightRefresh: Promise<RefreshSessionResponse> | null = null;

export function refreshSession(refreshToken: string): Promise<RefreshSessionResponse> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }

  inFlightRefresh = apiClient
    .post<RefreshSessionResponse>(
      "/auth/refresh",
      { refreshToken },
      { headers: { [RETRY_HEADER]: "1" } },
    )
    .then(({ data }) => {
      tokenStorage.setAccessToken(data.accessToken);
      if (data.refreshToken) {
        tokenStorage.setRefreshToken(data.refreshToken);
      }
      return data;
    })
    .finally(() => {
      inFlightRefresh = null;
    });

  return inFlightRefresh;
}

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

    // On 401: try to refresh the session using the persisted refresh token;
    // if that's not possible or fails, clear tokens and user state.
    if (status === 401 && originalConfig) {
      const refreshToken = tokenStorage.getRefreshToken();

      if (
        refreshToken &&
        !originalConfig.headers?.[RETRY_HEADER]
      ) {
        try {
          const refreshData = await refreshSession(refreshToken);

          originalConfig.headers.Authorization = `Bearer ${refreshData.accessToken}`;
          return apiClient.request(originalConfig);
        } catch {
          // Refresh failed — clear tokens so the user must log in again
          tokenStorage.clear();
          useAuthStore.getState().clearUser();
        }
      } else if (!refreshToken) {
        // Without a refresh token we can't recover automatically.
        // Only destroy the session when we're certain the access token itself
        // is invalid — either no token is stored, or /auth/me explicitly rejected
        // it. A 401 from any other endpoint may be a scope/permission issue (e.g.
        // an admin-scoped token hitting a customer-only endpoint) and must not
        // log the user out spuriously.
        const hasToken = !!tokenStorage.getAccessToken();
        const isIdentityCheck = !!originalConfig.url?.includes("/auth/me");
        if (!hasToken || isIdentityCheck) {
          tokenStorage.clear();
          useAuthStore.getState().clearUser();
        }
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
