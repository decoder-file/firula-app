/**
 * Standard API response envelope used across all endpoints.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Paginated response envelope for list endpoints.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Common pagination query params.
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
}
