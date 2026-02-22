import type { LatLng } from "./types";

// ---------------------------------------------------------------------------
// Fixed restaurant coordinates for the 7 Davis-area restaurants in the DB.
// Keyed by slug (matching the slugify() output from the import script).
// These are real-world approximate coords — NO geocoding API is used.
// ---------------------------------------------------------------------------

export const FIXED_RESTAURANT_LOCATIONS: Record<string, LatLng> = {
  "ali-baba":             { lat: 38.5449, lng: -121.7405 }, // Ali Baba – downtown Davis
  "black-bear-diner":     { lat: 38.5556, lng: -121.7372 }, // Black Bear Diner – N Davis
  "blakes-pizza":         { lat: 38.5442, lng: -121.7419 }, // Blake's Pizza – downtown Davis
  "thai-centeen":         { lat: 38.5440, lng: -121.7408 }, // Thai Centeen – downtown Davis
  "tommyjs":              { lat: 38.5452, lng: -121.7390 }, // TommyJ's – downtown Davis
  "tres-hermanos-cocina": { lat: 38.5535, lng: -121.7185 }, // Tres Hermanos – E Davis
  "itea":                 { lat: 38.5445, lng: -121.7425 }, // iTea – downtown Davis
};

export const DAVIS_CENTER: LatLng = { lat: 38.5449, lng: -121.7405 };

export const DEFAULT_PREP_MINUTES = 15;
