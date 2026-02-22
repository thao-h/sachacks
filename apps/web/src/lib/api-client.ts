import { isApiError, type ApiSuccessResponse } from "@ddba/shared";

// ---------------------------------------------------------------------------
// API error class (client-side)
// ---------------------------------------------------------------------------
export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// ---------------------------------------------------------------------------
// Generic fetchers
// ---------------------------------------------------------------------------

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json: unknown = await res.json();

  if (isApiError(json)) {
    throw new ApiClientError(
      json.error.code,
      json.error.message,
      res.status,
      json.error.details as Record<string, unknown> | undefined,
    );
  }

  return (json as ApiSuccessResponse<T>).data;
}

/** GET helper */
export function apiGet<T>(path: string): Promise<T> {
  return request<T>(path);
}

/** POST helper */
export function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: "POST", body: JSON.stringify(body) });
}

// ---------------------------------------------------------------------------
// Feature-specific convenience methods (thin wrappers, add as needed)
// ---------------------------------------------------------------------------
export const api = {
  // Auth
  login: (identifier: string, name?: string) =>
    apiPost("/api/auth/login", { identifier, name }),

  logout: () =>
    apiPost("/api/auth/logout", {}),

  me: () =>
    apiGet("/api/auth/me"),

  setMode: (mode: string) =>
    apiPost("/api/auth/mode", { mode }),

  // Restaurants
  getRestaurants: () =>
    apiGet("/api/v1/restaurants"),

  getMenuBySlug: (slug: string) =>
    apiGet(`/api/v1/restaurants/slug/${slug}/menu`),

  // Menu & orders
  createOrder: (data: unknown) =>
    apiPost("/api/v1/orders", data),

  updateOrderStatus: (orderId: string, status: string) =>
    apiPost(`/api/v1/orders/${orderId}/status`, { status }),

  assignDriver: (orderId: string, driverId: string) =>
    apiPost("/api/v1/dispatch/assignments", { orderId, driverId }),

  getDrivers: () => apiGet("/api/v1/drivers"),
};
