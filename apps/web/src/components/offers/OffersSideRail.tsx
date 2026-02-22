"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Tag } from "lucide-react";
import {
  getLiveOffers,
  subscribeLiveOfferUpdates,
  type LiveOffer,
} from "@/lib/domain/live-offers";

function minutesLeft(expiresAt: string | null) {
  if (!expiresAt) return null;
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 0;
  return Math.ceil(ms / 60_000);
}

export default function OffersSideRail() {
  const [offers, setOffers] = useState<LiveOffer[]>([]);

  useEffect(() => {
    const sync = () => setOffers(getLiveOffers());
    sync();
    const unsub = subscribeLiveOfferUpdates(sync);
    const timer = window.setInterval(sync, 30_000);
    return () => {
      unsub();
      window.clearInterval(timer);
    };
  }, []);

  const visibleOffers = useMemo(() => offers.slice(0, 8), [offers]);

  return (
    <aside className="bg-white border border-gray-200 rounded-xl p-4 sticky top-24">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Tag className="w-4 h-4 text-blue-600" />
          Live Offers
        </h3>
        <span className="text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
          {visibleOffers.length}
        </span>
      </div>

      {visibleOffers.length === 0 ? (
        <p className="text-sm text-gray-500">
          No active offers yet. Restaurant boosts and surplus bundles will appear here.
        </p>
      ) : (
        <div className="space-y-2">
          {visibleOffers.map((offer) => {
            const timeLeft = minutesLeft(offer.expiresAt);
            return (
              <div
                key={offer.id}
                className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <p className="text-xs text-gray-500 mb-1">{offer.restaurantName}</p>
                <p className="text-sm font-semibold text-gray-900">{offer.title}</p>
                <p className="text-xs text-gray-600 mt-1">{offer.details}</p>
                {timeLeft !== null && (
                  <p className="text-xs text-amber-700 mt-1.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {timeLeft > 0 ? `${timeLeft} min left` : "Expired"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </aside>
  );
}
