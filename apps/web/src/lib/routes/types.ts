// ---------------------------------------------------------------------------
// Route-feature types – isolated from the rest of the codebase
// ---------------------------------------------------------------------------

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RestaurantFromApi {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  itemCount: number;
}

export interface RestaurantWithLocation extends RestaurantFromApi {
  location: LatLng;
}

export interface NearRouteRestaurant extends RestaurantWithLocation {
  distanceToRouteMiles: number;
  minutesUntilDriverNearby: number;
  prepMinutes: number;
  likelyReadyInTime: boolean;
}

export interface RouteResult {
  polyline: LatLng[];
  durationMinutes: number;
  distanceMiles: number;
  summary: string;
}
