// ---------------------------------------------------------------------------
// Drivers domain – real API calls + shape transforms
// ---------------------------------------------------------------------------

import { api } from "@/lib/api-client";
import {
  removeLiveRoute,
  upsertLiveRoute,
  type LivePostedRoute,
} from "./live-routes";

export interface RouteOffer {
  id: string;
  restaurantName: string;
  restaurantAddress: string;
  deliveryAddress: string;
  detourDistance: string;
  earnings: number;
  readyTime: string;
  expiresInSeconds: number;
}

export interface ActiveDelivery {
  id: string;
  restaurantName: string;
  deliveryAddress: string;
  items: string[];
  status: "picked_up" | "dropped_off" | "pending";
}

export interface DriverStats {
  todayEarnings: number;
  completedDeliveries: number;
}

// -- Raw API types -----------------------------------------------------------

interface RawOffer {
  id: string;
  orderId: string;
  driverId: string;
  status: string;
  expiresAt: string;
  createdAt: string;
  order: {
    id: string;
    deliveryAddress: string;
    subtotalCents: number;
    restaurant: { name: string; address: string };
  };
}

interface RawAssignment {
  id: string;
  orderId: string;
  driverId: string;
  status: string;
  order: {
    deliveryAddress: string;
    restaurant: { name: string };
    items?: { name: string; quantity: number }[];
  };
}

// -- Transforms --------------------------------------------------------------

function toRouteOffer(raw: RawOffer): RouteOffer {
  const expiresInSeconds = Math.max(
    0,
    Math.floor((new Date(raw.expiresAt).getTime() - Date.now()) / 1000),
  );
  const readyTime = new Date(raw.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return {
    id: raw.id,
    restaurantName: raw.order.restaurant.name,
    restaurantAddress: raw.order.restaurant.address ?? "",
    deliveryAddress: raw.order.deliveryAddress,
    detourDistance: "On route",
    earnings: (raw.order.subtotalCents / 100) * 0.15,
    readyTime,
    expiresInSeconds,
  };
}

const STATUS_FROM_API: Record<string, ActiveDelivery["status"]> = {
  ASSIGNED: "pending",
  PICKED_UP: "picked_up",
  DROPPED_OFF: "dropped_off",
};

const STATUS_TO_API: Record<string, string> = {
  pending: "ASSIGNED",
  picked_up: "PICKED_UP",
  dropped_off: "DROPPED_OFF",
};

function toActiveDelivery(raw: RawAssignment): ActiveDelivery {
  return {
    id: raw.id,
    restaurantName: raw.order.restaurant.name,
    deliveryAddress: raw.order.deliveryAddress,
    items:
      raw.order.items?.map((i) => `${i.quantity}x ${i.name}`) ?? [
        "Order items",
      ],
    status: STATUS_FROM_API[raw.status] ?? "pending",
  };
}

// -- API calls ---------------------------------------------------------------

export async function fetchOffers(driverId: string): Promise<RouteOffer[]> {
  const raw = (await api.getDriverOffers(driverId)) as RawOffer[];
  return raw.map(toRouteOffer);
}

export async function fetchActiveDeliveries(
  driverId: string,
): Promise<ActiveDelivery[]> {
  const raw = (await api.getDriverAssignments(driverId)) as RawAssignment[];
  return raw.map(toActiveDelivery);
}

export async function fetchDriverStats(
  driverId: string,
): Promise<DriverStats> {
  return (await api.getDriverStats(driverId)) as DriverStats;
}

export async function acceptOffer(offerId: string): Promise<ActiveDelivery> {
  const result = (await api.acceptOffer(offerId)) as {
    assignment: RawAssignment;
  };
  return toActiveDelivery(result.assignment);
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: ActiveDelivery["status"],
): Promise<ActiveDelivery> {
  const apiStatus = STATUS_TO_API[status] ?? status.toUpperCase();
  const raw = (await api.updateAssignmentStatus(
    deliveryId,
    apiStatus,
  )) as RawAssignment;
  return toActiveDelivery(raw);
}

// -- Post route (mock — no DB model yet) -------------------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function postRoute(data: {
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  departureTime: string;
  capacity: number;
}): Promise<{
  id: string;
  from: string;
  to: string;
  departureTime: string;
  capacity: number;
}> {
  await delay(400);
  const route: LivePostedRoute = {
    id: `RT-${Date.now().toString().slice(-6)}`,
    driverId: data.driverId,
    driverName: data.driverName,
    from: data.from,
    to: data.to,
    departureTime: data.departureTime,
    capacity: data.capacity,
    filled: 0,
    createdAt: new Date().toISOString(),
  };
  upsertLiveRoute(route);
  return {
    id: route.id,
    from: route.from,
    to: route.to,
    departureTime: route.departureTime,
    capacity: route.capacity,
  };
}

export async function cancelPostedRoute(routeId: string): Promise<void> {
  await delay(150);
  removeLiveRoute(routeId);
}
