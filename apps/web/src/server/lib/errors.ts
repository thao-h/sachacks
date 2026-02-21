import { NextResponse } from "next/server";
import type { ApiErrorResponse } from "@ddba/shared";

export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(`${resource.toUpperCase()}_NOT_FOUND`, `${resource} with id '${id}' not found`, 404);
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

export function errorResponse(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details ?? {} } },
      { status: error.statusCode },
    );
  }

  console.error("Unhandled error:", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "An unexpected error occurred", details: {} } },
    { status: 500 },
  );
}
