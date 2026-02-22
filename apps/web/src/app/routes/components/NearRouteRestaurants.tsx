"use client";

import { Clock, MapPin, Check, AlertTriangle } from "lucide-react";
import type { NearRouteRestaurant } from "@/lib/routes/types";

interface NearRouteRestaurantsProps {
  restaurants: NearRouteRestaurant[];
  routeDurationMinutes: number | null;
}

export default function NearRouteRestaurants({
  restaurants,
  routeDurationMinutes,
}: NearRouteRestaurantsProps) {
  if (restaurants.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MapPin className="w-6 h-6 text-stone-400" />
        </div>
        <p className="text-stone-500 text-sm">
          No restaurants found near this route.
        </p>
        <p className="text-stone-400 text-xs mt-1">
          Try a different origin or destination in Davis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-stone-900">
          Restaurants Near Route
        </h3>
        {routeDurationMinutes !== null && (
          <span className="text-xs text-stone-500 bg-stone-100 px-2 py-1 rounded-full">
            Route ETA: {routeDurationMinutes} min
          </span>
        )}
      </div>

      {restaurants.map((r) => (
        <div
          key={r.id}
          className="bg-white border border-stone-200 rounded-xl p-4 hover:border-primary-200 transition-colors"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-stone-900 truncate">
                  {r.name}
                </h4>
                <TimingBadge ready={r.likelyReadyInTime} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {r.distanceToRouteMiles < 0.1
                    ? "On route"
                    : `${r.distanceToRouteMiles.toFixed(1)} mi from route`}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Driver nearby in ~{Math.round(r.minutesUntilDriverNearby)} min
                </span>
              </div>

              <p className="text-xs text-stone-400 mt-1.5">
                Est. prep: {r.prepMinutes} min
                {r.itemCount > 0 && <> &middot; {r.itemCount} menu items</>}
              </p>
            </div>

            <a
              href={`/r/${r.slug}`}
              className="shrink-0 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              Menu
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}

function TimingBadge({ ready }: { ready: boolean }) {
  if (ready) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
        <Check className="w-3 h-3" />
        Likely ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
      <AlertTriangle className="w-3 h-3" />
      Tight timing
    </span>
  );
}
