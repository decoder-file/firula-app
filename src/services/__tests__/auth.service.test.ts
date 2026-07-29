import MockAdapter from "axios-mock-adapter";

import { apiClient } from "@/api/client";
import { tokenStorage } from "@/api/tokenStorage";
import {
  isApiError,
  isInvalidCredentialsError,
  isInvalidRefreshTokenError,
} from "@/api/errors";
import { authService } from "@/services/auth.service";
import type {
  LoginResponse,
  LoginResponseData,
  MeResponse,
  RegisterCustomerResponse,
  RequestLoginCodeResponse,
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

const LOGIN_RESPONSE_DATA_WITH_REFRESH: LoginResponseData = {
  ...LOGIN_RESPONSE_DATA,
  refreshToken: "mobile-refresh-token",
};

const LOGIN_RESPONSE_WITH_REFRESH: LoginResponse = {
  success: true,
  data: LOGIN_RESPONSE_DATA_WITH_REFRESH,
};

const REQUEST_LOGIN_CODE_RESPONSE: RequestLoginCodeResponse = {
  success: true,
  data: {
    message: "Código enviado para o email",
    expiresIn: 900,
  },
};

const REGISTER_CUSTOMER_RESPONSE: RegisterCustomerResponse = {
  success: true,
  data: {
    id: "identity-uuid-123",
    email: "cliente@email.com",
    name: "João Silva",
    profile: {
      id: "customer-profile-uuid",
      phone: "11999887766",
      cpf: "12345678901",
    },
    createdAt: "2026-05-26T12:34:56.789Z",
  },
};

const PROFILE = { id: "profile_uuid", cpf: "12345678900", phone: "11999999999" };

const REFRESH_RESPONSE: RefreshTokenResponse = {
  accessToken: "new-access-token-abc",
  refreshToken: "rotated-refresh-token-def",
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
// requestLoginCode
// ---------------------------------------------------------------------------

describe("authService.requestLoginCode", () => {
  it("returns message and expiration on success", async () => {
    mock
      .onPost("/public/auth/customer/request-code")
      .reply(200, REQUEST_LOGIN_CODE_RESPONSE);

    const result = await authService.requestLoginCode({
      email: "cliente@exemplo.com",
    });

    expect(result.message).toBe("Código enviado para o email");
    expect(result.expiresIn).toBe(900);
  });
});

// ---------------------------------------------------------------------------
// verifyLoginCode
// ---------------------------------------------------------------------------

describe("authService.verifyLoginCode", () => {
  it("returns login payload and stores access token on success", async () => {
    mock
      .onPost("/public/auth/customer/verify-code")
      .reply(200, LOGIN_RESPONSE);

    const result = await authService.verifyLoginCode({
      email: "cliente@exemplo.com",
      code: "12345",
    });

    expect(result.identityId).toBe(LOGIN_RESPONSE_DATA.identityId);
    expect(tokenStorage.getAccessToken()).toBe(LOGIN_RESPONSE_DATA.accessToken);
  });

  it("persists the refresh token when the response includes it", async () => {
    mock
      .onPost("/public/auth/customer/verify-code")
      .reply(200, LOGIN_RESPONSE_WITH_REFRESH);

    await authService.verifyLoginCode({ email: "cliente@exemplo.com", code: "12345" });

    expect(tokenStorage.getRefreshToken()).toBe("mobile-refresh-token");
  });
});

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
  });

  it("does not store a refresh token when the response omits it", async () => {
    mock.onPost("/auth/login").reply(200, LOGIN_RESPONSE);

    await authService.login({ email: "cliente@exemplo.com", password: "senha123" });

    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it("persists the refresh token when the response includes it", async () => {
    mock.onPost("/auth/login").reply(200, LOGIN_RESPONSE_WITH_REFRESH);

    await authService.login({ email: "cliente@exemplo.com", password: "senha123" });

    expect(tokenStorage.getRefreshToken()).toBe("mobile-refresh-token");
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
  it("creates customer account and does not store access token", async () => {
    mock.onPost("/public/auth/customer/register").reply(201, REGISTER_CUSTOMER_RESPONSE);

    const result = await authService.register({
      email: "novo@exemplo.com",
      phone: "11999887766",
      cpf: "12345678901",
      password: "SenhaForte@123",
      name: "Maria Silva",
    });

    expect(result.id).toBe("identity-uuid-123");
    expect(result.profile.phone).toBe("11999887766");
    expect(tokenStorage.getAccessToken()).toBeNull();
  });

  it("throws ApiError with BADREQUESTEXCEPTION when email already exists", async () => {
    mock.onPost("/public/auth/customer/register").reply(400, {
      success: false,
      error: {
        code: "BADREQUESTEXCEPTION",
        message: "Este email já está cadastrado",
      },
    });

    const err = await expectToThrow(
      authService.register({
        email: "cliente@exemplo.com",
        phone: "11999887766",
        cpf: "12345678901",
        password: "SenhaForte@123",
        name: "João Silva",
      }),
    );

    expect(isApiError(err)).toBe(true);
    expect((err as { code?: string }).code).toBe("BADREQUESTEXCEPTION");
    expect((err as Error).message).toBe("Este email já está cadastrado");
    expect((err as { statusCode: number }).statusCode).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// refreshToken
// ---------------------------------------------------------------------------

describe("authService.refreshToken", () => {
  it("returns new access token and updates storage", async () => {
    mock.onPost("/auth/refresh").reply(200, REFRESH_RESPONSE);

    const result = await authService.refreshToken("refresh-token-xyz");

    expect(result.accessToken).toBe("new-access-token-abc");
    expect(tokenStorage.getAccessToken()).toBe("new-access-token-abc");
  });

  it("persists the rotated refresh token returned by the backend", async () => {
    mock.onPost("/auth/refresh").reply(200, REFRESH_RESPONSE);

    await authService.refreshToken("refresh-token-xyz");

    expect(tokenStorage.getRefreshToken()).toBe("rotated-refresh-token-def");
  });

  it("throws ApiError with INVALID_REFRESH_TOKEN code on 401", async () => {
    mock.onPost("/auth/refresh").reply(401, {
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

  it("shares a single in-flight request across concurrent calls", async () => {
    mock.onPost("/auth/refresh").reply(200, REFRESH_RESPONSE);

    const [first, second] = await Promise.all([
      authService.refreshToken("refresh-token-xyz"),
      authService.refreshToken("refresh-token-xyz"),
    ]);

    expect(first).toEqual(second);
    expect(mock.history.post.filter((r) => r.url === "/auth/refresh")).toHaveLength(1);
  });

  it("allows a new request once the in-flight one has settled", async () => {
    mock.onPost("/auth/refresh").reply(200, REFRESH_RESPONSE);

    await authService.refreshToken("refresh-token-xyz");
    await authService.refreshToken("refresh-token-xyz");

    expect(mock.history.post.filter((r) => r.url === "/auth/refresh")).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// confirmPasswordReset
// ---------------------------------------------------------------------------

describe("authService.confirmPasswordReset", () => {
  it("returns session data and stores the access token on success", async () => {
    mock
      .onPost("/public/auth/customer/password-reset/confirm")
      .reply(200, LOGIN_RESPONSE);

    const result = await authService.confirmPasswordReset("reset-token-abc", "NewPassword123!");

    expect(result).toEqual(LOGIN_RESPONSE_DATA);
    expect(tokenStorage.getAccessToken()).toBe(LOGIN_RESPONSE_DATA.accessToken);
  });

  it("persists the refresh token when the response includes it", async () => {
    mock
      .onPost("/public/auth/customer/password-reset/confirm")
      .reply(200, LOGIN_RESPONSE_WITH_REFRESH);

    await authService.confirmPasswordReset("reset-token-abc", "NewPassword123!");

    expect(tokenStorage.getRefreshToken()).toBe("mobile-refresh-token");
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
  it("returns error immediately on 401 when there is no stored refresh token", async () => {
    tokenStorage.setAccessToken("expired-token");

    mock.onGet("/auth/me").reply(401, {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Token expired" },
    });

    const err = await expectToThrow(authService.getMe());

    expect(isApiError(err)).toBe(true);
    expect((err as { statusCode: number }).statusCode).toBe(401);
    // App should handle clearUser() when 401 occurs and there's nothing to refresh
  });

  it("silently refreshes and retries the original request when a refresh token is available", async () => {
    tokenStorage.setAccessToken("expired-token");
    tokenStorage.setRefreshToken("stored-refresh-token");

    let attempt = 0;
    mock.onGet("/auth/me").reply(() => {
      attempt += 1;
      if (attempt === 1) {
        return [401, { success: false, error: { code: "UNAUTHORIZED", message: "Token expired" } }];
      }
      return [200, ME_RESPONSE];
    });
    mock.onPost("/auth/refresh").reply(200, REFRESH_RESPONSE);

    const result = await authService.getMe();

    expect(result).toEqual(ME_RESPONSE);
    expect(tokenStorage.getAccessToken()).toBe("new-access-token-abc");
    expect(tokenStorage.getRefreshToken()).toBe("rotated-refresh-token-def");
  });

  it("clears tokens when the refresh attempt itself fails", async () => {
    tokenStorage.setAccessToken("expired-token");
    tokenStorage.setRefreshToken("expired-refresh-token");

    mock.onGet("/auth/me").reply(401, {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Token expired" },
    });
    mock.onPost("/auth/refresh").reply(401, {
      success: false,
      error: { code: "INVALID_REFRESH_TOKEN", message: "Invalid or expired refresh token" },
    });

    await expectToThrow(authService.getMe());

    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });
});
