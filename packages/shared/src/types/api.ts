// ---------------------------------------------------------------------------
// Generic API error codes
// ---------------------------------------------------------------------------
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INVALID_STATE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR"
  // TODO: add domain-specific codes as modules mature
  | (string & {});

// ---------------------------------------------------------------------------
// Response envelopes
// ---------------------------------------------------------------------------

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

/** Alias for readability in handler return types */
export type ApiError = ApiErrorResponse;

export type ApiSuccessResponse<T> = {
  data: T;
};

/** Alias for readability */
export type ApiSuccess<T> = ApiSuccessResponse<T>;

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Type guard
// ---------------------------------------------------------------------------

export function isApiError(response: unknown): response is ApiErrorResponse {
  return (
    typeof response === "object" &&
    response !== null &&
    "error" in response &&
    typeof (response as ApiErrorResponse).error?.code === "string"
  );
}
