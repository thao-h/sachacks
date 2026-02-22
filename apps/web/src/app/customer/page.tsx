"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Store, ChevronRight, MapPin, UtensilsCrossed } from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/lib/api-client";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import OffersSideRail from "@/components/offers/OffersSideRail";

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
        err instanceof Error ? err.message : "Failed to load restaurants"
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="animate-shimmer h-8 w-48 rounded-lg mb-2" />
              <div className="animate-shimmer h-5 w-72 rounded-lg" />
            </div>
            <SkeletonGrid count={4} />
          </div>
        </div>
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              Order Food
            </h1>
            <p className="text-stone-600">
              Choose a restaurant to browse their menu
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {restaurants.map((restaurant, i) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link
                  href={`/r/${restaurant.slug}`}
                  className="group block bg-white rounded-2xl border border-stone-200/60 p-5 shadow-sm hover:shadow-md hover:shadow-stone-900/5 hover:-translate-y-0.5 hover:border-primary-300 transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-primary-50 p-2.5 rounded-xl text-primary-600 group-hover:bg-primary-100 transition-colors">
                      <UtensilsCrossed className="w-6 h-6" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="text-lg font-bold text-stone-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {restaurant.name}
                  </h3>

                  {restaurant.address && (
                    <div className="flex items-center gap-1.5 text-sm text-stone-500 mb-3">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{restaurant.address}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                    <span className="text-sm text-stone-600">
                      <span className="font-semibold text-stone-900">
                        {restaurant.itemCount}
                      </span>{" "}
                      menu items
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <OffersSideRail />
        </div>
      </div>
    </div>
  );
}
