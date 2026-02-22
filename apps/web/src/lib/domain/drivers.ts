// ---------------------------------------------------------------------------
// Drivers domain – mock data + simulated async operations
// ---------------------------------------------------------------------------

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

// -- Mock data ---------------------------------------------------------------

const MOCK_OFFERS: RouteOffer[] = [
  {
    id: "OFF-1",
    restaurantName: "Burger King",
    restaurantAddress: "500 1st St",
    deliveryAddress: "123 Oak Ave",
    detourDistance: "0.2 mi detour",
    earnings: 3.5,
    readyTime: "5:45 PM",
    expiresInSeconds: 272,
  },
  {
    id: "OFF-2",
    restaurantName: "Thai Canteen",
    restaurantAddress: "2nd & E St",
    deliveryAddress: "456 Pine Ln",
    detourDistance: "0.5 mi detour",
    earnings: 5.25,
    readyTime: "5:50 PM",
    expiresInSeconds: 120,
  },
];

const MOCK_ACTIVE: ActiveDelivery[] = [
  {
    id: "DEL-101",
    restaurantName: "Dos Coyotes",
    deliveryAddress: "789 Elm St",
    items: ["2x Border Burrito", "1x Chips & Salsa"],
    status: "pending",
  },
];

// -- Async fetchers ----------------------------------------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchOffers(): Promise<RouteOffer[]> {
  await delay(500);
  return MOCK_OFFERS;
}

export async function fetchActiveDeliveries(): Promise<ActiveDelivery[]> {
  await delay(300);
  return MOCK_ACTIVE;
}

export async function fetchDriverStats(): Promise<DriverStats> {
  await delay(200);
  return { todayEarnings: 24.5, completedDeliveries: 4 };
}

export async function acceptOffer(offerId: string): Promise<ActiveDelivery> {
  await delay(400);
  const offer = MOCK_OFFERS.find((o) => o.id === offerId);
  return {
    id: `DEL-${Date.now().toString().slice(-4)}`,
    restaurantName: offer?.restaurantName ?? "Restaurant",
    deliveryAddress: offer?.deliveryAddress ?? "Unknown",
    items: ["Order items"],
    status: "pending",
  };
}

export async function updateDeliveryStatus(
  deliveryId: string,
  status: ActiveDelivery["status"],
): Promise<ActiveDelivery> {
  await delay(300);
  const d = MOCK_ACTIVE.find((d) => d.id === deliveryId);
  return { ...(d ?? MOCK_ACTIVE[0]), status };
}

export async function postRoute(data: {
  from: string;
  to: string;
  departureTime: string;
  capacity: number;
}): Promise<{ id: string; from: string; to: string }> {
  await delay(400);
  return { id: `RT-${Date.now().toString().slice(-4)}`, ...data };
}
