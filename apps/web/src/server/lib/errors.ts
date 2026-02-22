import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorResponse } from "@ddba/shared";

// ---------------------------------------------------------------------------
// Error codes – generic codes now, domain codes added per-module later
// ---------------------------------------------------------------------------
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INVALID_STATE"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "INTERNAL_ERROR"
  // TODO: domain-specific codes (ORDER_INVALID_TRANSITION, DISPATCH_ALREADY_ASSIGNED, …)
  | (string & {}); // allow arbitrary strings while keeping autocomplete

// ---------------------------------------------------------------------------
// Base error class
// ---------------------------------------------------------------------------
export class AppError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// ---------------------------------------------------------------------------
// Convenience subclasses
// ---------------------------------------------------------------------------
export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super("NOT_FOUND", `${resource} with id '${id}' not found`, 404);
  }
}

export class InvalidStateError extends AppError {
  constructor(message: string) {
    super("INVALID_STATE", message, 409);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 422, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Insufficient permissions") {
    super("FORBIDDEN", message, 403);
  }
}

// ---------------------------------------------------------------------------
// Convert any unknown error into a safe API error envelope
// ---------------------------------------------------------------------------
export function toApiError(error: unknown): { body: ApiErrorResponse; status: number } {
  if (error instanceof AppError) {
    return {
      body: { error: { code: error.code, message: error.message, details: error.details ?? {} } },
      status: error.statusCode,
    };
  }

  if (error instanceof ZodError) {
    const flat = error.flatten();
    return {
      body: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed",
          details: { fieldErrors: flat.fieldErrors, formErrors: flat.formErrors },
        },
      },
      status: 422,
    };
  }

  // Unknown / unexpected error – log but never leak internals
  console.error("Unhandled error:", error);
  return {
    body: { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred", details: {} } },
    status: 500,
  };
}

// ---------------------------------------------------------------------------
// Legacy helper – delegates to toApiError
// ---------------------------------------------------------------------------
export function errorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  const { body, status } = toApiError(error);
  return NextResponse.json(body, { status });
}
