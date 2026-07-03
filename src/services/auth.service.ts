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
  name: string;
  photoUrl: string | null;
  scope: string;
  adminProfiles: AdminProfile[];
}

export interface AuthUserProfile {
  id: string;
  cpf: string;
  phone: string;
  photoUrl?: string | null;
}

export interface LoginResponseData {
  accessToken: string;
  identityId: string;
  name: string;
  photoUrl: string | null;
  scope: string;
  adminProfiles: AdminProfile[];
  customerProfile: AuthUserProfile | null;
  email?: string;
}

export interface LoginResponse {
  success: boolean;
  data: LoginResponseData;
}

type MaybeWrappedLoginResponse = LoginResponseData | LoginResponse;

const unwrapLoginResponse = (payload: MaybeWrappedLoginResponse): LoginResponseData => {
  const wrapped = payload as LoginResponse;
  if (wrapped?.data?.accessToken) {
    return wrapped.data;
  }

  return payload as LoginResponseData;
};

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
    const { data } = await apiClient.post<MaybeWrappedLoginResponse>(
      "/public/auth/customer/verify-code",
      payload,
    );
    const parsed = unwrapLoginResponse(data);
    tokenStorage.setAccessToken(parsed.accessToken);
    return parsed;
  },

  /**
   * POST /auth/login
   * Stores access token in tokenStorage on success.
   * Returns the full response with identity data.
   */
  login: async (payload: LoginPayload): Promise<LoginResponseData> => {
    const { data } = await apiClient.post<MaybeWrappedLoginResponse>(
      "/auth/login",
      payload,
    );
    const parsed = unwrapLoginResponse(data);
    tokenStorage.setAccessToken(parsed.accessToken);
    // Note: new API does not provide a refresh token
    return parsed;
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

  /**
   * POST /public/auth/customer/password-reset/request-code
   * Sends a 6-digit reset code to the customer email.
   */
  requestPasswordResetCode: async (email: string): Promise<{ message: string; expiresIn: number }> => {
    const { data } = await apiClient.post(
      "/public/auth/customer/password-reset/request-code",
      { email },
    );
    return data.data;
  },

  /**
   * POST /public/auth/customer/password-reset/verify-code
   * Validates the code and returns a short-lived resetToken.
   */
  verifyPasswordResetCode: async (email: string, code: string): Promise<{ resetToken: string; expiresIn: number }> => {
    const { data } = await apiClient.post(
      "/public/auth/customer/password-reset/verify-code",
      { email, code },
    );
    return data.data;
  },

  /**
   * POST /public/auth/customer/password-reset/confirm
   * Sets the new password and opens a full session.
   * Stores the returned accessToken in tokenStorage.
   */
  confirmPasswordReset: async (resetToken: string, password: string): Promise<LoginResponseData> => {
    const { data } = await apiClient.post<MaybeWrappedLoginResponse>(
      "/public/auth/customer/password-reset/confirm",
      { resetToken, password },
    );
    const parsed = unwrapLoginResponse(data);
    tokenStorage.setAccessToken(parsed.accessToken);
    return parsed;
  },
};
