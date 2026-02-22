"use client";

import { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ApiClientError, api } from "@/lib/api-client";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string | null;
  category: string;
}

interface RestaurantInfo {
  id: string;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

type Props = {
  params: Promise<{ restaurantSlug: string }>;
};

export default function RestaurantMenuPage({ params }: Props) {
  const { restaurantSlug } = use(params);
  const router = useRouter();

  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const loadMenu = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await api.getMenuBySlug(restaurantSlug)) as {
        restaurant: RestaurantInfo;
        items: MenuItem[];
      };
      setRestaurant(data.restaurant);
      setMenuItems(data.items);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "NOT_FOUND") {
        router.replace("/customer");
        return;
      }
      setError(err instanceof Error ? err.message : "Failed to load menu");
    } finally {
      setLoading(false);
    }
  }, [restaurantSlug, router]);

  useEffect(() => {
    loadMenu();
  }, [loadMenu]);

  const categories = [
    "All",
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i,
        );
      }
      return prev.filter((i) => i.id !== itemId);
    });
  };

  const getItemQuantity = (itemId: string) => {
    return cart.find((i) => i.id === itemId)?.quantity || 0;
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.priceCents * item.quantity,
    0,
  );
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    // Convert cart to the format the checkout page expects (dollars)
    const checkoutCart = cart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.priceCents / 100,
      quantity: item.quantity,
      description: item.description,
      image: item.imageUrl || FALLBACK_IMAGE,
    }));
    sessionStorage.setItem(
      "ddba_cart",
      JSON.stringify({
        cart: checkoutCart,
        total: cartTotal / 100,
        restaurantName: restaurant?.name,
        restaurantSlug,
      }),
    );
    router.push("/checkout");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <LoadingState message="Loading menu..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ErrorState title="Failed to load menu" message={error} onRetry={loadMenu} />
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/customer")}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Restaurants
        </button>
        <EmptyState
          title="No menu items"
          message="This restaurant hasn't added any items yet."
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
      <button
        onClick={() => router.push("/customer")}
        className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Restaurants
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              {restaurant?.name}
            </h1>
            {restaurant?.address && (
              <p className="text-stone-600">{restaurant.address}</p>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors text-sm ${
                  selectedCategory === category
                    ? "bg-primary-600 text-white"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item) => {
              const quantity = getItemQuantity(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl || FALLBACK_IMAGE}
                    alt={item.name}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-stone-900 text-sm leading-tight flex-1 mr-2">
                        {item.name}
                      </h3>
                      <span className="font-semibold text-primary-600 whitespace-nowrap">
                        {formatPrice(item.priceCents)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-stone-500 mb-3 line-clamp-2">
                        {item.description}
                      </p>
                    )}

                    {quantity === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="flex items-center justify-between bg-primary-50 rounded-lg p-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          aria-label={`Remove one ${item.name} from cart`}
                          className="w-8 h-8 bg-white hover:bg-stone-100 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4 text-primary-600" />
                        </button>
                        <motion.span
                          key={quantity}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="font-semibold text-primary-600"
                        >
                          {quantity}
                        </motion.span>
                        <button
                          onClick={() => addToCart(item)}
                          aria-label={`Add one more ${item.name} to cart`}
                          className="w-8 h-8 bg-white hover:bg-stone-100 rounded-lg flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4 text-primary-600" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Cart Summary - Desktop */}
        <div className="hidden lg:block w-96">
          <div className="sticky top-24">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingCart className="w-5 h-5 text-stone-700" />
                <h2 className="font-semibold text-stone-900">Your Cart</h2>
                {cartItemCount > 0 && (
                  <span className="ml-auto bg-primary-100 text-primary-700 text-sm font-medium px-2 py-0.5 rounded-full">
                    {cartItemCount}
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <p className="text-stone-500 text-center py-8 text-sm">
                  Your cart is empty
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex-1 min-w-0 mr-2">
                          <span className="text-stone-900 font-medium truncate block">
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-stone-600 whitespace-nowrap">
                            {formatPrice(item.priceCents * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-stone-400 hover:text-red-600 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-stone-200 pt-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-700">Subtotal</span>
                      <span className="font-semibold text-stone-900">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-stone-200/60 z-40"
          >
            <button
              onClick={handleCheckout}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-xl flex items-center justify-between transition-all duration-150 active:scale-[0.98] shadow-lg shadow-primary-600/25"
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
              </span>
              <span className="font-semibold">{formatPrice(cartTotal)}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
