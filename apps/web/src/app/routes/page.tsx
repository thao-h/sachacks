"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  MapPin,
  ArrowRight,
  Navigation,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { apiGet } from "@/lib/api-client";
import { attachLocations, findNearRouteRestaurants } from "@/lib/routes/routeMath";
import type {
  RestaurantFromApi,
  RestaurantWithLocation,
  NearRouteRestaurant,
  RouteResult,
} from "@/lib/routes/types";
import DeliveryRouteMap from "./components/DeliveryRouteMap";
import NearRouteRestaurantsPanel from "./components/NearRouteRestaurants";

const DAVIS_LOCATION_PRESETS = [
  "UC Davis Memorial Union",
  "UC Davis Silo",
  "West Village, Davis",
  "Downtown Davis",
  "Davis Amtrak Station",
  "The Green at West Village",
  "North Davis",
  "South Davis",
] as const;

function normalizeLocationInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  const lowered = trimmed.toLowerCase();
  const alreadySpecific =
    lowered.includes("davis") ||
    lowered.includes("california") ||
    /\bca\b/.test(lowered) ||
    /\b\d{5}\b/.test(trimmed) ||
    trimmed.includes(",");

  if (alreadySpecific) {
    return trimmed;
  }

  return `${trimmed}, Davis, CA`;
}

export default function RoutesPage() {
  const [originInput, setOriginInput] = useState("");
  const [destInput, setDestInput] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [focusedField, setFocusedField] = useState<"origin" | "destination">(
    "origin",
  );
  const [normalizationHint, setNormalizationHint] = useState<string | null>(
    null,
  );

  const [restaurants, setRestaurants] = useState<RestaurantWithLocation[]>([]);
  const [nearRoute, setNearRoute] = useState<NearRouteRestaurant[]>([]);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const restaurantsLoaded = useRef(false);

  useEffect(() => {
    if (restaurantsLoaded.current) return;
    restaurantsLoaded.current = true;

    apiGet<RestaurantFromApi[]>("/api/v1/restaurants")
      .then((data) => setRestaurants(attachLocations(data)))
      .catch(() => {});
  }, []);

  const handleRouteCalculated = useCallback(
    (result: RouteResult) => {
      setRouteResult(result);
      setMapError(null);
      setSearching(false);

      const near = findNearRouteRestaurants(restaurants, result, 1.0);
      setNearRoute(near);
    },
    [restaurants],
  );

  const handleMapError = useCallback((msg: string) => {
    setMapError(msg);
    setSearching(false);
  }, []);

  const applyPreset = (preset: string) => {
    if (focusedField === "destination") {
      setDestInput(preset);
      return;
    }
    setOriginInput(preset);
  };

  const handleSwap = () => {
    setOriginInput(destInput);
    setDestInput(originInput);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const o = originInput.trim();
    const d = destInput.trim();
    if (!o || !d) return;

    const normalizedOrigin = normalizeLocationInput(o);
    const normalizedDestination = normalizeLocationInput(d);
    const changedOrigin = normalizedOrigin !== o;
    const changedDestination = normalizedDestination !== d;

    setSearching(true);
    setMapError(null);
    setRouteResult(null);
    setNearRoute([]);
    setOrigin(normalizedOrigin);
    setDestination(normalizedDestination);

    if (changedOrigin || changedDestination) {
      const parts: string[] = [];
      if (changedOrigin) parts.push(`Origin: ${normalizedOrigin}`);
      if (changedDestination) parts.push(`Destination: ${normalizedDestination}`);
      setNormalizationHint(`Using Davis fallback. ${parts.join(" • ")}`);
    } else {
      setNormalizationHint(null);
    }
  };

  const combinedSuggestions = [
    ...DAVIS_LOCATION_PRESETS,
    ...restaurants.map((r) => (r.address ? `${r.name}, ${r.address}` : r.name)),
  ];

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <header className="bg-white border-b border-stone-200 sticky top-16 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900">Route Planner</h1>
              <p className="text-xs text-stone-500">
                Plan a route and see which restaurants you can pick up from along the way
              </p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-green-500" />
              <input
                type="text"
                placeholder="Origin (e.g. UC Davis Memorial Union)"
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                onFocus={() => setFocusedField("origin")}
                list="route-location-suggestions"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center justify-center gap-2 text-stone-300">
              <ArrowRight className="w-5 h-5" />
              <button
                type="button"
                onClick={handleSwap}
                className="text-xs border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 px-2 py-1 rounded-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-red-500" />
              <input
                type="text"
                placeholder="Destination (e.g. West Village, Davis)"
                value={destInput}
                onChange={(e) => setDestInput(e.target.value)}
                onFocus={() => setFocusedField("destination")}
                list="route-location-suggestions"
                className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={!originInput.trim() || !destInput.trim() || searching}
              className="px-6 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Routing…
                </>
              ) : (
                "Find Route"
              )}
            </button>
          </form>

          <datalist id="route-location-suggestions">
            {combinedSuggestions.map((value) => (
              <option key={value} value={value} />
            ))}
          </datalist>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-stone-500">Quick picks:</span>
            {DAVIS_LOCATION_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
              >
                {preset}
              </button>
            ))}
          </div>

          {normalizationHint && (
            <p className="mt-2 text-xs text-primary-700 bg-primary-50 border border-primary-100 rounded-md px-2.5 py-1.5">
              {normalizationHint}
            </p>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {mapError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {mapError}
          </div>
        )}

        {routeResult && (
          <div className="mb-4 flex flex-wrap gap-3">
            <div className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm">
              <span className="text-stone-500">Distance:</span>{" "}
              <span className="font-semibold text-stone-900">{routeResult.distanceMiles} mi</span>
            </div>
            <div className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm">
              <span className="text-stone-500">ETA:</span>{" "}
              <span className="font-semibold text-stone-900">{routeResult.durationMinutes} min</span>
            </div>
            {routeResult.summary && (
              <div className="bg-white border border-stone-200 rounded-lg px-4 py-2 text-sm">
                <span className="text-stone-500">Via:</span>{" "}
                <span className="font-semibold text-stone-900">{routeResult.summary}</span>
              </div>
            )}
            <div className="bg-primary-50 border border-primary-200 rounded-lg px-4 py-2 text-sm">
              <span className="text-primary-600 font-semibold">
                {nearRoute.length} restaurant{nearRoute.length !== 1 ? "s" : ""} near route
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden" style={{ minHeight: 420 }}>
            <DeliveryRouteMap
              origin={origin}
              destination={destination}
              nearRestaurants={nearRoute}
              onRouteCalculated={handleRouteCalculated}
              onError={handleMapError}
            />
          </div>

          <div className="lg:col-span-2">
            {origin && destination ? (
              <NearRouteRestaurantsPanel
                restaurants={nearRoute}
                routeDurationMinutes={routeResult?.durationMinutes ?? null}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4">
                  <Navigation className="w-8 h-8 text-stone-300" />
                </div>
                <h3 className="text-lg font-medium text-stone-900 mb-1">
                  Plan a delivery route
                </h3>
                <p className="text-stone-500 text-sm max-w-xs">
                  Enter an origin and destination to see driving directions and restaurants you can pick up from along the way.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
