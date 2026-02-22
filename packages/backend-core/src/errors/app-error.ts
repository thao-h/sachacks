export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 500,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(entity: string, id: string) {
    super("NOT_FOUND", `${entity} not found: ${id}`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super("VALIDATION_ERROR", message, 422, details);
  }
}

export class InvalidStateError extends AppError {
  constructor(message: string) {
    super("INVALID_STATE", message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super("FORBIDDEN", message, 403);
  }
}
