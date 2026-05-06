/**
 * Base class for all application errors.
 */
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Represents an HTTP error returned by the API (4xx / 5xx).
 * `code` maps to the machine-readable error code in the response body
 * (e.g. "INVALID_CREDENTIALS", "EMAIL_ALREADY_EXISTS").
 */
export class ApiError extends AppError {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly payload?: unknown,
  ) {
    super(message);
  }
}

/**
 * Raised when there is no network connectivity or the request never reached
 * the server (e.g. DNS failure, connection refused).
 */
export class NetworkError extends AppError {
  constructor(message = "Sem conexão com a internet") {
    super(message);
  }
}

/**
 * Raised when a request exceeds the configured timeout.
 */
export class TimeoutError extends AppError {
  constructor() {
    super("A requisição expirou. Tente novamente.");
  }
}

// ---------------------------------------------------------------------------
// Type guards
// ---------------------------------------------------------------------------

export const isApiError = (error: unknown): error is ApiError =>
  error instanceof ApiError;

export const isNetworkError = (error: unknown): error is NetworkError =>
  error instanceof NetworkError;

export const isTimeoutError = (error: unknown): error is TimeoutError =>
  error instanceof TimeoutError;

export const isNotFoundError = (error: unknown): error is ApiError =>
  isApiError(error) && error.statusCode === 404;

export const isUnauthorizedError = (error: unknown): error is ApiError =>
  isApiError(error) && error.statusCode === 401;

export const isForbiddenError = (error: unknown): error is ApiError =>
  isApiError(error) && error.statusCode === 403;

export const isServerError = (error: unknown): error is ApiError =>
  isApiError(error) && error.statusCode >= 500;

export const isValidationError = (error: unknown): error is ApiError =>
  isApiError(error) && error.statusCode === 422;

// ---------------------------------------------------------------------------
// Domain-specific API error code guards
// ---------------------------------------------------------------------------

export const hasErrorCode =
  (code: string) =>
  (error: unknown): error is ApiError =>
    isApiError(error) && error.code === code;

export const isInvalidCredentialsError = hasErrorCode("INVALID_CREDENTIALS");
export const isInvalidRefreshTokenError = hasErrorCode("INVALID_REFRESH_TOKEN");
export const isEmailAlreadyExistsError = hasErrorCode("EMAIL_ALREADY_EXISTS");
export const isWeakPasswordError = hasErrorCode("WEAK_PASSWORD");

