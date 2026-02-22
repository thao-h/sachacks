"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, ArrowRight, Star, ChevronRight } from "lucide-react";
import { fetchRoutes, requestDeliveryOnRoute } from "@/lib/domain/routes";
import type { DriverRoute } from "@/lib/domain/routes";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";

export default function RouteBoardPage() {
  const [fromFilter, setFromFilter] = useState("");
  const [toFilter, setToFilter] = useState("");
  const [routes, setRoutes] = useState<DriverRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters: { from?: string; to?: string } = {};
      if (fromFilter) filters.from = fromFilter;
      if (toFilter) filters.to = toFilter;
      const data = await fetchRoutes(filters);
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch routes");
    } finally {
      setLoading(false);
    }
  }, [fromFilter, toFilter]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleRequestDelivery = async (routeId: string) => {
    setRequestingId(routeId);
    try {
      const result = await requestDeliveryOnRoute(routeId);
      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        window.alert(result.message || "Request failed. Please try again.");
      }
    } catch (err) {
      window.alert(
        err instanceof Error ? err.message : "Failed to request delivery",
      );
    } finally {
      setRequestingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b border-gray-200 sticky top-16 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Route Board</h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="From..."
                value={fromFilter}
                onChange={(e) => setFromFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="hidden sm:flex items-center justify-center text-gray-400">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="To..."
                value={toFilter}
                onChange={(e) => setToFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm font-medium">
            {successMessage}
          </div>
        )}

        {loading && <LoadingState message="Loading routes..." />}

        {error && (
          <ErrorState
            title="Failed to load routes"
            message={error}
            onRetry={loadRoutes}
          />
        )}

        {!loading &&
          !error &&
          routes.map((route) => (
            <div
              key={route.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-blue-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {route.driverName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      {route.driverName}
                      <span className="flex items-center gap-0.5 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
                        <Star className="w-3 h-3 fill-current" /> {route.rating}
                      </span>
                    </h3>
                    <div className="text-sm text-gray-500">
                      Leaving at <span className="font-medium text-gray-900">{route.departureTime}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {route.capacity - route.filled} spots left
                  </div>
                  <div className="flex gap-1 justify-end mt-1">
                    {[...Array(route.capacity)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-4 rounded-full ${
                          i < route.filled ? "bg-gray-300" : "bg-green-500"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative pl-8 border-l-2 border-gray-100 space-y-6 my-6">
                <div className="relative">
                  <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full border-2 border-blue-500 bg-white" />
                  <div className="font-semibold text-gray-900">{route.from}</div>
                  <div className="text-xs text-gray-500">Start</div>
                </div>

                {route.stops.map((stop, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[35px] top-1.5 w-3 h-3 rounded-full bg-gray-200" />
                    <div className="text-sm text-gray-600">{stop.location}</div>
                    <div className="text-xs text-gray-400">~{stop.time}</div>
                  </div>
                ))}

                <div className="relative">
                  <div className="absolute -left-[37px] top-0 w-4 h-4 rounded-full bg-blue-500" />
                  <div className="font-semibold text-gray-900">{route.to}</div>
                  <div className="text-xs text-gray-500">Destination</div>
                </div>
              </div>

              <button
                disabled={requestingId === route.id}
                onClick={() => handleRequestDelivery(route.id)}
                className="w-full bg-white border-2 border-blue-600 text-blue-700 font-semibold py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestingId === route.id
                  ? "Requesting..."
                  : "Request Delivery on this Route"}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}

        {!loading && !error && routes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No routes found</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        )}
      </main>
    </div>
  );
}
