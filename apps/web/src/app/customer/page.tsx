"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Store, ChevronRight, MapPin, UtensilsCrossed } from "lucide-react";
import { api } from "@/lib/api-client";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  itemCount: number;
}

export default function CustomerPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await api.getRestaurants()) as Restaurant[];
      setRestaurants(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load restaurants",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurants();
  }, [loadRestaurants]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <LoadingState message="Loading restaurants..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ErrorState
          title="Failed to load restaurants"
          message={error}
          onRetry={loadRestaurants}
        />
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <EmptyState
          icon={Store}
          title="No restaurants available"
          message="Check back later for new restaurants."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Order Food
        </h1>
        <p className="text-gray-600">
          Choose a restaurant to browse their menu
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {restaurants.map((restaurant) => (
          <Link
            key={restaurant.id}
            href={`/r/${restaurant.slug}`}
            className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-300 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
              {restaurant.name}
            </h3>

            {restaurant.address && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{restaurant.address}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {restaurant.itemCount}
                </span>{" "}
                menu items
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
