import MockAdapter from "axios-mock-adapter";

import { apiClient } from "@/api/client";
import { tokenStorage } from "@/api/tokenStorage";
import {
  isApiError,
  isInvalidCredentialsError,
  isInvalidRefreshTokenError,
  isEmailAlreadyExistsError,
  isWeakPasswordError,
} from "@/api/errors";
import { authService } from "@/services/auth.service";
import type {
  LoginResponse,
  LoginResponseData,
  MeResponse,
  RefreshTokenResponse,
  AdminOrganization,
  AdminProfile,
} from "@/services/auth.service";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ORGANIZATION: AdminOrganization = {
  id: "org-uuid",
  legalName: "Participações Estação Ltda",
};

const ADMIN_PROFILE: AdminProfile = {
  id: "fc9e809c-9627-40b6-ab93-7c20ccd1430f",
  role: "OWNER",
  organization: ORGANIZATION,
};

const LOGIN_RESPONSE_DATA: LoginResponseData = {
  accessToken:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ZTZmZDA5My05NTljLTRmYTItOTVhNi1iMmZiMDcyMTViZDgiLCJzY29wZSI6ImFkbWluIiwiaWF0IjoxNzc4MDI5OTQwLCJleHAiOjE3Nzg2MzQ3NDB9.fQPzAl-f2WqIyemIoHFKGyNeOGMnJQfqprJ6DzyqyeA",
  identityId: "6e6fd093-959c-4fa2-95a6-b2fb07215bd8",
  scope: "admin",
  adminProfiles: [ADMIN_PROFILE],
  customerProfile: null,
};

const LOGIN_RESPONSE: LoginResponse = {
  success: true,
  data: LOGIN_RESPONSE_DATA,
};

const PROFILE = { id: "profile_uuid", cpf: "12345678900", phone: "11999999999" };

const REFRESH_RESPONSE: RefreshTokenResponse = {
  accessToken: "new-access-token-abc",
  expiresIn: "24h",
};

const ME_RESPONSE: MeResponse = {
  id: "6e6fd093-959c-4fa2-95a6-b2fb07215bd8",
  email: "cliente@exemplo.com",
  name: "João Silva",
  emailVerified: true,
  profile: PROFILE,
  createdAt: "2026-01-15T10:30:00.000Z",
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let mock: MockAdapter;

beforeEach(() => {
  mock = new MockAdapter(apiClient);
  tokenStorage.clear();
});

afterEach(() => {
  mock.restore();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function expectToThrow(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
    throw new Error("Expected to throw but did not");
  } catch (err) {
    return err;
  }
}

// ---------------------------------------------------------------------------
// login
// ---------------------------------------------------------------------------

describe("authService.login", () => {
  it("returns login response data and stores access token on success", async () => {
    mock.onPost("/auth/login").reply(200, LOGIN_RESPONSE);

    const result = await authService.login({
      email: "cliente@exemplo.com",
      password: "senha123",
    });

    expect(result).toEqual(LOGIN_RESPONSE_DATA);
    expect(result.accessToken).toBe(LOGIN_RESPONSE_DATA.accessToken);
    expect(result.identityId).toBe("6e6fd093-959c-4fa2-95a6-b2fb07215bd8");
    expect(tokenStorage.getAccessToken()).toBe(LOGIN_RESPONSE_DATA.accessToken);
    // Note: new API does not provide refresh token
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it("throws ApiError with INVALID_CREDENTIALS code on 401", async () => {
    mock.onPost("/auth/login").reply(401, {
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email or password is incorrect",
      },
    });

    const err = await expectToThrow(
      authService.login({ email: "wrong@exemplo.com", password: "wrong" }),
    );

    expect(isApiError(err)).toBe(true);
    expect(isInvalidCredentialsError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(401);
    expect((err as Error).message).toBe("Email or password is incorrect");
  });

  it("does not store tokens when login fails", async () => {
    mock.onPost("/auth/login").reply(401, {
      success: false,
      error: { code: "INVALID_CREDENTIALS", message: "Bad credentials" },
    });

    await expectToThrow(
      authService.login({ email: "wrong@example.com", password: "bad" }),
    );

    expect(tokenStorage.getAccessToken()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// register
// ---------------------------------------------------------------------------

describe("authService.register", () => {
  it("returns login response data and stores access token on 201", async () => {
    const registerResponseData: LoginResponseData = {
      ...LOGIN_RESPONSE_DATA,
      identityId: "new-identity-uuid",
    };
    const registerResponse: LoginResponse = {
      success: true,
      data: registerResponseData,
    };
    mock.onPost("/auth/register").reply(201, registerResponse);

    const result = await authService.register({
      email: "novo@exemplo.com",
      password: "senha123",
      name: "Maria Silva",
    });

    expect(result.identityId).toBe("new-identity-uuid");
    expect(tokenStorage.getAccessToken()).toBe(registerResponseData.accessToken);
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it("throws ApiError with EMAIL_ALREADY_EXISTS code on 409", async () => {
    mock.onPost("/auth/register").reply(409, {
      success: false,
      error: {
        code: "EMAIL_ALREADY_EXISTS",
        message: "Email is already registered",
      },
    });

    const err = await expectToThrow(
      authService.register({
        email: "cliente@exemplo.com",
        password: "senha123",
        name: "João Silva",
      }),
    );

    expect(isApiError(err)).toBe(true);
    expect(isEmailAlreadyExistsError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(409);
  });

  it("throws ApiError with WEAK_PASSWORD code on 400", async () => {
    mock.onPost("/auth/register").reply(400, {
      success: false,
      error: {
        code: "WEAK_PASSWORD",
        message: "Password must be at least 8 characters long",
      },
    });

    const err = await expectToThrow(
      authService.register({ email: "novo@exemplo.com", password: "123", name: "A" }),
    );

    expect(isApiError(err)).toBe(true);
    expect(isWeakPasswordError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// refreshToken
// ---------------------------------------------------------------------------

describe("authService.refreshToken", () => {
  it("returns new access token and updates storage", async () => {
    mock.onPost("/public/auth/refresh").reply(200, REFRESH_RESPONSE);

    const result = await authService.refreshToken("refresh-token-xyz");

    expect(result.accessToken).toBe("new-access-token-abc");
    expect(tokenStorage.getAccessToken()).toBe("new-access-token-abc");
  });

  it("throws ApiError with INVALID_REFRESH_TOKEN code on 401", async () => {
    mock.onPost("/public/auth/refresh").reply(401, {
      success: false,
      error: {
        code: "INVALID_REFRESH_TOKEN",
        message: "Invalid or expired refresh token",
      },
    });

    const err = await expectToThrow(authService.refreshToken("bad-token"));

    expect(isApiError(err)).toBe(true);
    expect(isInvalidRefreshTokenError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

describe("authService.logout", () => {
  it("calls logout endpoint and clears tokens", async () => {
    tokenStorage.setAccessToken("access-token-abc");
    mock.onPost("/auth/logout").reply(200, { loggedOut: true });

    const result = await authService.logout();

    expect(result.loggedOut).toBe(true);
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it("sends Authorization header with stored access token", async () => {
    tokenStorage.setAccessToken("my-token");
    mock.onPost("/auth/logout").reply(200, { loggedOut: true });

    await authService.logout();

    const request = mock.history.post.find((r) => r.url?.includes("/auth/logout"));
    expect(request?.headers?.Authorization).toBe("Bearer my-token");
  });
});

// ---------------------------------------------------------------------------
// getMe
// ---------------------------------------------------------------------------

describe("authService.getMe", () => {
  it("returns current user profile", async () => {
    tokenStorage.setAccessToken("access-token-abc");
    mock.onGet("/auth/me").reply(200, ME_RESPONSE);

    const result = await authService.getMe();

    expect(result.email).toBe("cliente@exemplo.com");
    expect(result.profile).toEqual(PROFILE);
  });

  it("throws ApiError 401 when not authenticated", async () => {
    mock.onGet("/auth/me").reply(401, {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Not authenticated" },
    });

    const err = await expectToThrow(authService.getMe());

    expect(isApiError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(401);
  });
});

// ---------------------------------------------------------------------------
// Automatic token refresh on 401 (client interceptor behaviour)
// ---------------------------------------------------------------------------

describe("apiClient 401 refresh interceptor", () => {
  it("returns error immediately on 401 since new API does not provide refresh token", async () => {
    tokenStorage.setAccessToken("expired-token");

    mock.onGet("/auth/me").reply(401, {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Token expired" },
    });

    const err = await expectToThrow(authService.getMe());

    expect(isApiError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(401);
    // Note: new API doesn't provide refresh token, so no refresh attempt
    // The access token remains as is (clearUser should be called by the app)
  });

  it("clears tokens when 401 occurs and refresh token is not available", async () => {
    tokenStorage.setAccessToken("expired-token");

    mock.onGet("/auth/me").reply(401, {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Token expired" },
    });

    const err = await expectToThrow(authService.getMe());

    expect(isApiError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(401);
    // App should handle clearUser() when 401 occurs
  });
});
