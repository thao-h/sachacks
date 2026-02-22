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

  getDriverOffers: (driverId: string) =>
    apiGet(`/api/v1/drivers/${driverId}/offers`),

  getDriverAssignments: (driverId: string) =>
    apiGet(`/api/v1/drivers/${driverId}/assignments`),

  getDriverStats: (driverId: string) =>
    apiGet(`/api/v1/drivers/${driverId}/stats`),

  acceptOffer: (offerId: string) =>
    apiPost(`/api/v1/drivers/offers/${offerId}/accept`, {}),

  updateAssignmentStatus: (assignmentId: string, status: string) =>
    apiPost(`/api/v1/dispatch/assignments/${assignmentId}/status`, { status }),

  // Communities
  getCommunities: (query?: { search?: string; area?: string }) => {
    const params = new URLSearchParams();
    if (query?.search) params.set("search", query.search);
    if (query?.area) params.set("area", query.area);
    const suffix = params.toString();
    return apiGet(`/api/v1/communities${suffix ? `?${suffix}` : ""}`);
  },

  createCommunity: (data: unknown) => apiPost("/api/v1/communities", data),

  joinCommunity: (communityId: string, inviteCode?: string) =>
    apiPost(`/api/v1/communities/${communityId}/join`, { inviteCode }),

  issueCommunityInvite: (communityId: string, expiresAt?: string) =>
    apiPost(`/api/v1/communities/${communityId}/invite`, { expiresAt }),

  setCommunityAreaPreference: (area: string | null) =>
    apiPost("/api/v1/communities/preferences/area", { area }),

  // Bulk orders
  getBulkOrders: (query?: { communityId?: string; status?: string }) => {
    const params = new URLSearchParams();
    if (query?.communityId) params.set("communityId", query.communityId);
    if (query?.status) params.set("status", query.status);
    const suffix = params.toString();
    return apiGet(`/api/v1/bulk-orders${suffix ? `?${suffix}` : ""}`);
  },

  createBulkOrder: (data: unknown) => apiPost("/api/v1/bulk-orders", data),

  joinBulkOrder: (bulkOrderId: string) =>
    apiPost(`/api/v1/bulk-orders/${bulkOrderId}/join`, {}),

  lockBulkOrder: (bulkOrderId: string) =>
    apiPost(`/api/v1/bulk-orders/${bulkOrderId}/lock`, {}),

  // Pricing estimates
  getPricingEstimate: (data: {
    restaurantSlug: string;
    deliveryAddress?: string;
    deliveryOption: "route-match" | "community-batch" | "direct-courier" | "pickup";
    subtotal: number;
  }) => apiPost("/api/v1/pricing/estimate", data),
};
