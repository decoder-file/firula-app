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
  email?: string;
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
  phone: string;
  cpf: string;
}

export interface RegisterCustomerResponseData {
  id: string;
  email: string;
  name: string;
  profile: AuthUserProfile;
  createdAt: string;
}

export interface RegisterCustomerResponse {
  success: boolean;
  data: RegisterCustomerResponseData;
}

export interface RequestLoginCodePayload {
  email: string;
}

export interface RequestLoginCodeResponseData {
  message: string;
  expiresIn: number;
}

export interface RequestLoginCodeResponse {
  success: boolean;
  data: RequestLoginCodeResponseData;
}

export interface VerifyLoginCodePayload {
  email: string;
  code: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const authService = {
  /**
   * POST /public/auth/customer/request-code
   * Requests an authentication code to be sent to customer email.
   */
  requestLoginCode: async (
    payload: RequestLoginCodePayload,
  ): Promise<RequestLoginCodeResponseData> => {
    const { data } = await apiClient.post<RequestLoginCodeResponse>(
      "/public/auth/customer/request-code",
      payload,
    );
    return data.data;
  },

  /**
   * POST /public/auth/customer/verify-code
   * Verifies one-time code and stores access token in tokenStorage on success.
   */
  verifyLoginCode: async (
    payload: VerifyLoginCodePayload,
  ): Promise<LoginResponseData> => {
    const { data } = await apiClient.post<LoginResponse>(
      "/public/auth/customer/verify-code",
      payload,
    );
    tokenStorage.setAccessToken(data.data.accessToken);
    return data.data;
  },

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
   * POST /public/auth/customer/register
   * Creates a customer account without opening a session.
   */
  register: async (payload: RegisterPayload): Promise<RegisterCustomerResponseData> => {
    const { data } = await apiClient.post<RegisterCustomerResponse>(
      "/public/auth/customer/register",
      payload,
    );
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
