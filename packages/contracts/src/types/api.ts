export type ApiSuccessResponse<T> = {
  data: T;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export function isApiError<T>(response: ApiResponse<T>): response is ApiErrorResponse {
  return "error" in response;
}
