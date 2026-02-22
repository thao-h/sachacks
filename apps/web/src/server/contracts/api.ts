import { NextResponse } from "next/server";
import type { ApiSuccessResponse, ApiErrorResponse } from "@ddba/shared";
import { toApiError } from "@/server/lib/errors";

// Re-export shared types for convenience
export type { ApiResponse, ApiErrorResponse, ApiSuccessResponse, ApiError, ApiSuccess } from "@ddba/shared";
export { isApiError } from "@ddba/shared";

// ---------------------------------------------------------------------------
// Route-handler response helpers
// ---------------------------------------------------------------------------

/** Return a success envelope */
export function ok<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ data }, { status });
}

/** Return an error envelope from an AppError, ZodError, or unknown */
export function fail(error: unknown): NextResponse<ApiErrorResponse> {
  const { body, status } = toApiError(error);
  return NextResponse.json(body, { status });
}

// ---------------------------------------------------------------------------
// handleRoute – wraps an async handler with try/catch + envelope
// ---------------------------------------------------------------------------

type RouteHandler = (
  request: Request,
  context: { params: Promise<Record<string, string>> },
) => Promise<NextResponse>;

/**
 * Wraps an API route handler so that any thrown error is automatically
 * converted into a consistent error envelope response.
 *
 * Usage:
 *   export const GET = handleRoute(async (request) => {
 *     const data = await someService.list();
 *     return ok(data);
 *   });
 */
export function handleRoute(fn: RouteHandler): RouteHandler {
  return async (request, context) => {
    try {
      return await fn(request, context);
    } catch (error) {
      return fail(error);
    }
  };
}
