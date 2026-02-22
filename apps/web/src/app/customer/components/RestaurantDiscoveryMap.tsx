"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  GoogleMap,
  InfoWindow,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";
import { MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";
import {
  DAVIS_CENTER,
  FIXED_RESTAURANT_LOCATIONS,
} from "@/lib/routes/fixedRestaurantLocations";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address?: string;
  itemCount: number;
}

interface RestaurantDiscoveryMapProps {
  restaurants: Restaurant[];
}

const MAP_CONTAINER: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 380,
  borderRadius: 16,
};

export default function RestaurantDiscoveryMap({
  restaurants,
}: RestaurantDiscoveryMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const locations = useMemo(
    () =>
      restaurants
        .map((restaurant) => ({
          restaurant,
          location: FIXED_RESTAURANT_LOCATIONS[restaurant.slug],
        }))
        .filter(
          (entry): entry is { restaurant: Restaurant; location: { lat: number; lng: number } } =>
            Boolean(entry.location)
        ),
    [restaurants]
  );

  const selected = locations.find((entry) => entry.restaurant.id === selectedId);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  });

  if (!apiKey) {
    return (
      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-100/80 px-6 py-10 text-center">
        <p className="text-primary-900 font-semibold">Map is ready, API key is missing</p>
        <p className="text-stone-600 text-sm mt-1">
          Add <code className="bg-stone-200 px-1.5 py-0.5 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in
          <code className="bg-stone-200 px-1.5 py-0.5 rounded ml-1">apps/web/.env</code>
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
        <p className="text-red-700 font-semibold">Could not load map</p>
        <p className="text-red-600 text-sm mt-1">{loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-stone-100/80 px-6 py-10 text-center animate-pulse">
        <p className="text-stone-600 text-sm">Loading Davis restaurant map…</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-[#fffef9]/95 p-3 shadow-sm shadow-stone-700/10">
      <div className="flex items-start justify-between gap-3 px-2 pb-3">
        <div>
          <p className="text-primary-900 font-bold text-base flex items-center gap-2">
            <Navigation className="w-4 h-4 text-pop-600" />
            Davis Live Restaurant Map
          </p>
          <p className="text-stone-600 text-sm">
            Satellite view with real pinpoints for your local spots
          </p>
        </div>
        <span className="rounded-full bg-accent-100 text-accent-900 text-xs font-semibold px-2.5 py-1">
          {locations.length} mapped
        </span>
      </div>

      <GoogleMap
        mapContainerStyle={MAP_CONTAINER}
        center={DAVIS_CENTER}
        zoom={13}
        options={{
          disableDefaultUI: false,
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: false,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          clickableIcons: false,
        }}
      >
        {locations.map(({ restaurant, location }, i) => (
          <Marker
            key={restaurant.id}
            position={location}
            title={restaurant.name}
            animation={i < 5 ? google.maps.Animation.DROP : undefined}
            onClick={() => setSelectedId(restaurant.id)}
            icon={{
              // Classic Google red teardrop marker.
              url: "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi3.png",
              scaledSize: new google.maps.Size(28, 45),
            }}
          />
        ))}

        {selected && (
          <InfoWindow
            position={selected.location}
            onCloseClick={() => setSelectedId(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-[220px]"
            >
              <p className="font-bold text-primary-900">{selected.restaurant.name}</p>
              {selected.restaurant.address && (
                <p className="text-xs text-stone-600 mt-1 flex items-start gap-1">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{selected.restaurant.address}</span>
                </p>
              )}
              <p className="text-xs text-stone-700 mt-1.5">
                {selected.restaurant.itemCount} menu items
              </p>
              <Link
                href={`/r/${selected.restaurant.slug}`}
                className="inline-flex mt-2 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-pop-500 text-white hover:bg-pop-600 transition-colors"
              >
                Open menu
              </Link>
            </motion.div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
