import type {
  LatLng,
  RestaurantFromApi,
  RestaurantWithLocation,
  NearRouteRestaurant,
  RouteResult,
} from "./types";
import {
  FIXED_RESTAURANT_LOCATIONS,
  DEFAULT_PREP_MINUTES,
} from "./fixedRestaurantLocations";

// ---------------------------------------------------------------------------
// Haversine distance (miles)
// ---------------------------------------------------------------------------

const EARTH_RADIUS_MILES = 3958.8;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceMiles(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
}

// ---------------------------------------------------------------------------
// Attach fixed coords to API restaurants
// ---------------------------------------------------------------------------

export function attachLocations(
  restaurants: RestaurantFromApi[],
): RestaurantWithLocation[] {
  return restaurants
    .filter((r) => FIXED_RESTAURANT_LOCATIONS[r.slug] !== undefined)
    .map((r) => ({
      ...r,
      location: FIXED_RESTAURANT_LOCATIONS[r.slug]!,
    }));
}

// ---------------------------------------------------------------------------
// Minimum distance from a point to any point on a polyline
// ---------------------------------------------------------------------------

export function minDistanceToPolyline(
  point: LatLng,
  polyline: LatLng[],
): number {
  let min = Infinity;
  for (const p of polyline) {
    const d = haversineDistanceMiles(point, p);
    if (d < min) min = d;
  }
  return min;
}

// ---------------------------------------------------------------------------
// Estimate how many minutes into the route a driver is nearest a point.
// Uses linear interpolation along the polyline by index fraction.
// ---------------------------------------------------------------------------

function estimateMinutesAlongRoute(
  point: LatLng,
  polyline: LatLng[],
  totalDurationMinutes: number,
): number {
  if (polyline.length === 0) return 0;

  let closestIdx = 0;
  let closestDist = Infinity;
  for (let i = 0; i < polyline.length; i++) {
    const d = haversineDistanceMiles(point, polyline[i]!);
    if (d < closestDist) {
      closestDist = d;
      closestIdx = i;
    }
  }

  const fraction = polyline.length > 1 ? closestIdx / (polyline.length - 1) : 0;
  return fraction * totalDurationMinutes;
}

// ---------------------------------------------------------------------------
// Filter restaurants near a route and compute timing insights
// ---------------------------------------------------------------------------

export function findNearRouteRestaurants(
  restaurants: RestaurantWithLocation[],
  route: RouteResult,
  thresholdMiles: number = 1.0,
): NearRouteRestaurant[] {
  return restaurants
    .map((r) => {
      const distanceToRouteMiles = minDistanceToPolyline(
        r.location,
        route.polyline,
      );
      const minutesUntilDriverNearby = estimateMinutesAlongRoute(
        r.location,
        route.polyline,
        route.durationMinutes,
      );
      const prepMinutes = DEFAULT_PREP_MINUTES;
      const likelyReadyInTime = prepMinutes <= minutesUntilDriverNearby;

      return {
        ...r,
        distanceToRouteMiles,
        minutesUntilDriverNearby,
        prepMinutes,
        likelyReadyInTime,
      };
    })
    .filter((r) => r.distanceToRouteMiles <= thresholdMiles)
    .sort((a, b) => a.distanceToRouteMiles - b.distanceToRouteMiles);
}

// ---------------------------------------------------------------------------
// Decode a Google-encoded polyline string into LatLng[]
// ---------------------------------------------------------------------------

export function decodePolyline(encoded: string): LatLng[] {
  const points: LatLng[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }

  return points;
}
