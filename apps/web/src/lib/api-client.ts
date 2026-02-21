import type { ApiResponse } from "@ddba/shared";

const BASE_URL = process.env.NEXT_PUBLIC_APP_ENV === "production" ? "" : "http://localhost:3000";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  const json = await res.json() as ApiResponse<T>;

  if ("error" in json) {
    throw new Error(json.error.message);
  }

  return json.data;
}

export const api = {
  getMenu: (restaurantId: string) =>
    apiFetch(`/api/v1/restaurants/${restaurantId}/menu`),

  createOrder: (data: unknown) =>
    apiFetch("/api/v1/orders", { method: "POST", body: JSON.stringify(data) }),

  updateOrderStatus: (orderId: string, status: string) =>
    apiFetch(`/api/v1/orders/${orderId}/status`, {
      method: "POST",
      body: JSON.stringify({ status }),
    }),

  assignDriver: (orderId: string, driverId: string) =>
    apiFetch("/api/v1/dispatch/assignments", {
      method: "POST",
      body: JSON.stringify({ orderId, driverId }),
    }),

  getDrivers: () => apiFetch("/api/v1/drivers"),
};
