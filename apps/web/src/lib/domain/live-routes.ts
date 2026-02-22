export interface LivePostedRoute {
  id: string;
  driverId: string;
  driverName: string;
  from: string;
  to: string;
  departureTime: string;
  capacity: number;
  filled: number;
  createdAt: string;
}

const STORAGE_KEY = "ddba.liveRoutes.v1";
const UPDATE_EVENT = "ddba-live-routes-updated";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function readRoutes(): LivePostedRoute[] {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as LivePostedRoute[]) : [];
  } catch {
    return [];
  }
}

function writeRoutes(routes: LivePostedRoute[]) {
  if (!hasWindow()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(routes));
  window.dispatchEvent(new Event(UPDATE_EVENT));
}

export function getLiveRoutes(): LivePostedRoute[] {
  return readRoutes().sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function upsertLiveRoute(route: LivePostedRoute): LivePostedRoute {
  const current = readRoutes();
  const index = current.findIndex((r) => r.id === route.id);
  if (index >= 0) {
    current[index] = route;
  } else {
    current.push(route);
  }
  writeRoutes(current);
  return route;
}

export function removeLiveRoute(routeId: string) {
  const next = readRoutes().filter((r) => r.id !== routeId);
  writeRoutes(next);
}

export function reserveLiveRouteSpot(routeId: string): LivePostedRoute | null {
  const current = readRoutes();
  const index = current.findIndex((r) => r.id === routeId);
  if (index < 0) return null;

  const route = current[index];
  if (route.filled >= route.capacity) return null;

  const updated: LivePostedRoute = {
    ...route,
    filled: route.filled + 1,
  };
  current[index] = updated;
  writeRoutes(current);
  return updated;
}

export function subscribeLiveRoutesUpdates(cb: () => void): () => void {
  if (!hasWindow()) return () => {};
  const handler = () => cb();
  window.addEventListener(UPDATE_EVENT, handler);
  return () => {
    window.removeEventListener(UPDATE_EVENT, handler);
  };
}
