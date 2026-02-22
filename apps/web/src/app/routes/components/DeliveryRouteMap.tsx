"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import type { LatLng, NearRouteRestaurant, RouteResult } from "@/lib/routes/types";
import { DAVIS_CENTER } from "@/lib/routes/fixedRestaurantLocations";
import { decodePolyline } from "@/lib/routes/routeMath";

const MAP_CONTAINER: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 400,
  borderRadius: 12,
};

const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
};

interface DeliveryRouteMapProps {
  origin: string;
  destination: string;
  nearRestaurants: NearRouteRestaurant[];
  onRouteCalculated: (result: RouteResult) => void;
  onError: (msg: string) => void;
}

export default function DeliveryRouteMap({
  origin,
  destination,
  nearRestaurants,
  onRouteCalculated,
  onError,
}: DeliveryRouteMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  const requestedRef = useRef<string>("");

  const calcRoute = useCallback(() => {
    if (!origin || !destination) return;
    const key = `${origin}|${destination}`;
    if (requestedRef.current === key) return;
    requestedRef.current = key;

    const svc = new google.maps.DirectionsService();
    svc.route(
      {
        origin,
        destination,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);

          const leg = result.routes[0]?.legs[0];
          if (leg) {
            const overviewPolyline =
              result.routes[0]?.overview_polyline;
            const encoded =
              typeof overviewPolyline === "string"
                ? overviewPolyline
                : (overviewPolyline as unknown as { points?: string })?.points ?? "";

            const polyline =
              encoded.length > 0
                ? decodePolyline(encoded)
                : (result.routes[0]?.overview_path?.map((p) => ({
                    lat: p.lat(),
                    lng: p.lng(),
                  })) as LatLng[]) ?? [];

            onRouteCalculated({
              polyline,
              durationMinutes: Math.round(
                (leg.duration?.value ?? 0) / 60,
              ),
              distanceMiles: parseFloat(
                ((leg.distance?.value ?? 0) / 1609.34).toFixed(1),
              ),
              summary: result.routes[0]?.summary ?? "",
            });
          }
        } else {
          onError(
            status === google.maps.DirectionsStatus.NOT_FOUND
              ? "Could not find one of the addresses. Try a more specific location."
              : `Directions request failed: ${status}`,
          );
        }
      },
    );
  }, [origin, destination, onRouteCalculated, onError]);

  useEffect(() => {
    if (isLoaded && origin && destination) {
      calcRoute();
    }
  }, [isLoaded, origin, destination, calcRoute]);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-80 bg-stone-100 rounded-xl border-2 border-dashed border-stone-300">
        <div className="text-center px-6">
          <p className="text-stone-700 font-semibold mb-1">
            Google Maps API key not configured
          </p>
          <p className="text-stone-500 text-sm">
            Add <code className="bg-stone-200 px-1.5 py-0.5 rounded text-xs">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to{" "}
            <code className="bg-stone-200 px-1.5 py-0.5 rounded text-xs">apps/web/.env.local</code>
          </p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-80 bg-red-50 rounded-xl">
        <p className="text-red-600 text-sm">Failed to load Google Maps: {loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-80 bg-stone-50 rounded-xl animate-pulse">
        <p className="text-stone-400 text-sm">Loading map…</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER}
      center={DAVIS_CENTER}
      zoom={13}
      options={MAP_OPTIONS}
    >
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: "#2563eb",
              strokeWeight: 5,
              strokeOpacity: 0.85,
            },
          }}
        />
      )}

      {nearRestaurants.map((r) => (
        <Marker
          key={r.id}
          position={r.location}
          title={r.name}
          icon={{
            url: "https://maps.google.com/mapfiles/ms/icons/restaurant.png",
          }}
        />
      ))}
    </GoogleMap>
  );
}
