// ---------------------------------------------------------------------------
// Routes domain – mock data + simulated async operations
// ---------------------------------------------------------------------------

export interface DriverRoute {
  id: string;
  driverName: string;
  rating: number;
  from: string;
  to: string;
  departureTime: string;
  capacity: number;
  filled: number;
  stops: { location: string; time: string }[];
}

import {
  getLiveRoutes,
  reserveLiveRouteSpot,
  type LivePostedRoute,
} from "./live-routes";

// -- Mock data ---------------------------------------------------------------

const MOCK_ROUTES: DriverRoute[] = [
  {
    id: "r1",
    driverName: "Alex M.",
    rating: 4.9,
    from: "UC Davis Campus",
    to: "West Davis",
    departureTime: "5:30 PM",
    capacity: 3,
    filled: 1,
    stops: [
      { location: "MU Terminal", time: "5:35 PM" },
      { location: "University Mall", time: "5:45 PM" },
      { location: "Lake Blvd", time: "5:55 PM" },
    ],
  },
  {
    id: "r2",
    driverName: "Sarah K.",
    rating: 4.8,
    from: "Downtown",
    to: "South Davis",
    departureTime: "6:15 PM",
    capacity: 2,
    filled: 0,
    stops: [
      { location: "3rd & C St", time: "6:20 PM" },
      { location: "Safeway South", time: "6:35 PM" },
    ],
  },
  {
    id: "r3",
    driverName: "Mike T.",
    rating: 5.0,
    from: "North Davis",
    to: "East Davis",
    departureTime: "6:00 PM",
    capacity: 4,
    filled: 3,
    stops: [
      { location: "Anderson Plaza", time: "6:05 PM" },
      { location: "Target", time: "6:25 PM" },
    ],
  },
];

// -- Async fetchers ----------------------------------------------------------

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchRoutes(filters?: {
  from?: string;
  to?: string;
}): Promise<DriverRoute[]> {
  await delay(400);
  const liveRoutes: DriverRoute[] = getLiveRoutes().map(
    (route: LivePostedRoute) => ({
      id: route.id,
      driverName: route.driverName,
      rating: 4.9,
      from: route.from,
      to: route.to,
      departureTime: route.departureTime,
      capacity: route.capacity,
      filled: route.filled,
      stops: [
        { location: route.from, time: route.departureTime },
        { location: route.to, time: route.departureTime },
      ],
    }),
  );

  let routes = [...liveRoutes, ...MOCK_ROUTES];
  if (filters?.from) {
    routes = routes.filter((r) =>
      r.from.toLowerCase().includes(filters.from!.toLowerCase()),
    );
  }
  if (filters?.to) {
    routes = routes.filter((r) =>
      r.to.toLowerCase().includes(filters.to!.toLowerCase()),
    );
  }
  return routes;
}

export async function requestDeliveryOnRoute(
  routeId: string,
): Promise<{ success: boolean; message: string }> {
  await delay(500);

  const reserved = reserveLiveRouteSpot(routeId);
  if (!reserved && routeId.startsWith("RT-")) {
    return {
      success: false,
      message: `Route ${routeId} is already full.`,
    };
  }

  return {
    success: true,
    message: `Delivery requested on route ${routeId}. The driver will be notified.`,
  };
}
