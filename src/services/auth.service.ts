import { apiClient } from "@/api/client";
import { tokenStorage } from "@/api/tokenStorage";

// ---------------------------------------------------------------------------
// Response types matching the real API contract
// ---------------------------------------------------------------------------

export interface AdminOrganization {
  id: string;
  legalName: string;
}

export interface AdminProfile {
  id: string;
  role: string;
  organization: AdminOrganization;
}

export interface AuthCustomer {
  identityId: string;
  email: string;
  scope: string;
  adminProfiles: AdminProfile[];
}

export interface AuthUserProfile {
  id: string;
  cpf: string;
  phone: string;
}

export interface LoginResponseData {
  accessToken: string;
  identityId: string;
  scope: string;
  adminProfiles: AdminProfile[];
  customerProfile: AuthUserProfile | null;
}

export interface LoginResponse {
  success: boolean;
  data: LoginResponseData;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: string;
}

export interface LogoutResponse {
  loggedOut: boolean;
}

export interface MeResponse {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  profile: AuthUserProfile | null;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Request payload types
// ---------------------------------------------------------------------------

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const authService = {
  /**
   * POST /auth/login
   * Stores access token in tokenStorage on success.
   * Returns the full response with identity data.
   */
  login: async (payload: LoginPayload): Promise<LoginResponseData> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/login",
      payload,
    );
    tokenStorage.setAccessToken(data.data.accessToken);
    // Note: new API does not provide a refresh token
    return data.data;
  },

  /**
   * POST /auth/register
   * Stores access token in tokenStorage on success.
   * Returns the full response with identity data.
   */
  register: async (payload: RegisterPayload): Promise<LoginResponseData> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/auth/register",
      payload,
    );
    tokenStorage.setAccessToken(data.data.accessToken);
    // Note: new API does not provide a refresh token
    return data.data;
  },

  /**
   * POST /public/auth/refresh
   * Updates the access token in tokenStorage on success.
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const { data } = await apiClient.post<RefreshTokenResponse>(
      "/public/auth/refresh",
      { refreshToken },
    );
    tokenStorage.setAccessToken(data.accessToken);
    return data;
  },

  /**
   * POST /auth/logout
   * Clears all tokens from tokenStorage.
   */
  logout: async (): Promise<LogoutResponse> => {
    const { data } = await apiClient.post<LogoutResponse>(
      "/auth/logout",
    );
    tokenStorage.clear();
    return data;
  },

  /**
   * GET /auth/me
   * Returns the authenticated user's profile.
   */
  getMe: async (): Promise<MeResponse> => {
    const { data } = await apiClient.get<MeResponse>("/auth/me");
    return data;
  },
};
