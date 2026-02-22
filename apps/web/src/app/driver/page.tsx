"use client";

import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Clock,
  ChevronRight,
  DollarSign,
  Navigation,
  Package,
  CheckCircle,
  X,
  Minus,
  Plus,
  Truck,
  Inbox,
} from "lucide-react";
import {
  fetchOffers,
  fetchActiveDeliveries,
  fetchDriverStats,
  acceptOffer,
  updateDeliveryStatus,
  postRoute,
  type RouteOffer,
  type ActiveDelivery,
  type DriverStats,
} from "@/lib/domain/drivers";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DriverDashboardPage() {
  const [isOnline, setIsOnline] = useState(true);
  const [capacity, setCapacity] = useState(3);
  const [offers, setOffers] = useState<RouteOffer[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<ActiveDelivery[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [activeRoute, setActiveRoute] = useState<{
    id: string;
    from: string;
    to: string;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [postingRoute, setPostingRoute] = useState(false);

  const fromRef = useRef<HTMLInputElement>(null);
  const toRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [offersData, deliveriesData, statsData] = await Promise.all([
        fetchOffers(),
        fetchActiveDeliveries(),
        fetchDriverStats(),
      ]);
      setOffers(offersData);
      setActiveDeliveries(deliveriesData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAcceptOffer = async (offerId: string) => {
    setAcceptingId(offerId);
    try {
      const delivery = await acceptOffer(offerId);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      setActiveDeliveries((prev) => [...prev, delivery]);
    } catch (err) {
      // silently fail or could add toast
    } finally {
      setAcceptingId(null);
    }
  };

  const handleUpdateStatus = async (
    deliveryId: string,
    status: ActiveDelivery["status"]
  ) => {
    setUpdatingId(deliveryId);
    try {
      const updated = await updateDeliveryStatus(deliveryId, status);
      if (status === "dropped_off") {
        setActiveDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));
        setStats((prev) =>
          prev
            ? {
                ...prev,
                completedDeliveries: prev.completedDeliveries + 1,
              }
            : prev
        );
      } else {
        setActiveDeliveries((prev) =>
          prev.map((d) => (d.id === deliveryId ? updated : d))
        );
      }
    } catch (err) {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePostRoute = async () => {
    const from = fromRef.current?.value ?? "";
    const to = toRef.current?.value ?? "";
    const departureTime = timeRef.current?.value ?? "17:30";
    if (!from || !to) return;

    setPostingRoute(true);
    try {
      const route = await postRoute({ from, to, departureTime, capacity });
      setActiveRoute(route);
    } catch (err) {
      // silently fail
    } finally {
      setPostingRoute(false);
    }
  };

  const handleCancelRoute = () => {
    setActiveRoute(null);
  };

  if (loading) {
    return <LoadingState message="Loading your dashboard..." />;
  }

  if (error) {
    return (
      <ErrorState
        title="Something went wrong"
        message={error}
        onRetry={loadData}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-200 sticky top-16 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Hey Alex</h1>
            <p className="text-sm text-gray-500">Ready to drive?</p>
          </div>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isOnline
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
            />
            {isOnline ? "Online" : "Offline"}
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Post Route Card */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-blue-600" />
              Post Your Route
            </h2>
          </div>

          {!activeRoute ? (
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3 top-3.5 w-2 h-2 rounded-full bg-blue-600" />
                  <input
                    ref={fromRef}
                    type="text"
                    placeholder="Starting from..."
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                  {/* Connector Line */}
                  <div className="absolute left-4 top-6 bottom-[-18px] w-0.5 bg-gray-200 z-10" />
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-3.5 w-2 h-2 rounded-full bg-orange-500" />
                  <input
                    ref={toRef}
                    type="text"
                    placeholder="Heading to..."
                    className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Leaving at
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      ref={timeRef}
                      type="time"
                      defaultValue="17:30"
                      className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                    Capacity
                  </label>
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                    <button
                      onClick={() => setCapacity(Math.max(1, capacity - 1))}
                      className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-gray-500"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-medium text-gray-900">
                      {capacity} orders
                    </span>
                    <button
                      onClick={() => setCapacity(Math.min(5, capacity + 1))}
                      className="p-1 hover:bg-white hover:shadow-sm rounded transition-all text-gray-500"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePostRoute}
                disabled={postingRoute}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50"
              >
                {postingRoute ? "Posting..." : "Post Route"}
              </button>
            </div>
          ) : (
            <div className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    Active Route
                  </div>
                  <div className="font-semibold text-gray-900">
                    {activeRoute.from} &rarr; {activeRoute.to}
                  </div>
                  <div className="text-sm text-blue-600 mt-1">
                    Leaving at {timeRef.current?.value ?? "5:30 PM"} &bull; {capacity} spots left
                  </div>
                </div>
                <button
                  onClick={handleCancelRoute}
                  className="text-gray-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-1/3 rounded-full" />
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-400">
                <span>Start</span>
                <span>En Route</span>
                <span>Destination</span>
              </div>
            </div>
          )}
        </section>

        {/* Your Offers */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center justify-between">
            Your Offers
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {offers.length}
            </span>
          </h2>

          {offers.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No offers yet"
              message="New delivery offers will appear here when they match your route."
            />
          ) : (
            <div className="space-y-3">
              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden relative animate-fade-in-up"
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {offer.restaurantName}
                        </h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          {offer.deliveryAddress}
                        </div>
                        <div className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs font-medium px-2 py-0.5 rounded border border-orange-100">
                          <Navigation className="w-3 h-3" />
                          {offer.detourDistance}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                          ${offer.earnings.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Earnings</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500">
                        Ready at{" "}
                        <span className="font-medium text-gray-900">
                          {offer.readyTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-red-600 text-xs font-medium animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        Expires in {formatTime(offer.expiresInSeconds)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptOffer(offer.id)}
                      disabled={acceptingId === offer.id}
                      className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-sm active:scale-[0.98] disabled:opacity-50"
                    >
                      {acceptingId === offer.id
                        ? "Accepting..."
                        : "Accept Delivery"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Active Deliveries */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            Active Deliveries
          </h2>

          {activeDeliveries.length === 0 ? (
            <EmptyState
              icon={Truck}
              title="No active deliveries"
              message="Accept an offer to start delivering."
            />
          ) : (
            <div className="space-y-3">
              {activeDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded">
                          {delivery.id}
                        </span>
                        <span className="text-sm text-gray-500">
                          &bull; {delivery.restaurantName}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">
                        {delivery.deliveryAddress}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {delivery.items.join(", ")}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-2 rounded-full">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button
                      onClick={() =>
                        handleUpdateStatus(delivery.id, "picked_up")
                      }
                      disabled={
                        updatingId === delivery.id ||
                        delivery.status === "picked_up"
                      }
                      className="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium py-2 rounded-lg transition-colors text-sm border border-blue-200 disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Picked Up
                    </button>
                    <button
                      onClick={() =>
                        handleUpdateStatus(delivery.id, "dropped_off")
                      }
                      disabled={updatingId === delivery.id}
                      className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium py-2 rounded-lg transition-colors text-sm border border-green-200 disabled:opacity-50"
                    >
                      <MapPin className="w-4 h-4" />
                      Dropped Off
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Bottom Earnings Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">Today&apos;s Earnings</div>
            <div className="text-xl font-bold text-gray-900">
              ${stats?.todayEarnings.toFixed(2) ?? "0.00"}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Completed</div>
            <div className="text-base font-semibold text-gray-900">
              {stats?.completedDeliveries ?? 0} Deliveries
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
