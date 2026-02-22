"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  DeliveryOptions,
  type DeliveryOptionType,
} from "@/components/ui/DeliveryOptions";
import { api } from "@/lib/api-client";
import {
  getCheckoutOfferDiscount,
  subscribeLiveOfferUpdates,
} from "@/lib/domain/live-offers";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PricingEstimate {
  distanceMiles: number;
  distanceSource: "google-directions" | "fallback";
  deliveryFee: number;
  tax: number;
  taxRate: number;
  grandTotal: number;
}

function fallbackDeliveryFee(option: DeliveryOptionType): number {
  switch (option) {
    case "route-match":
      return 1.5;
    case "community-batch":
      return 2.0;
    case "direct-courier":
      return 5.99;
    case "pickup":
      return 0;
    default:
      return 0;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [restaurantSlug, setRestaurantSlug] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("ddba_cart");
    if (raw) {
      const data = JSON.parse(raw);
      setCart(data.cart || []);
      setTotal(data.total || 0);
      setRestaurantName(data.restaurantName || "");
      setRestaurantSlug(data.restaurantSlug || "");
    }
    setLoaded(true);
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [deliveryOption, setDeliveryOption] =
    useState<DeliveryOptionType>("route-match");

  const [pricing, setPricing] = useState<PricingEstimate>({
    distanceMiles: 0,
    distanceSource: "fallback",
    deliveryFee: fallbackDeliveryFee("route-match"),
    tax: 0,
    taxRate: Number(process.env.NEXT_PUBLIC_TAX_RATE ?? "0.08") || 0.08,
    grandTotal: 0,
  });
  const [pricingLoading, setPricingLoading] = useState(false);
  const [, setDiscountTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeLiveOfferUpdates(() => {
      setDiscountTick((n) => n + 1);
    });
    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    if (!loaded) return;

    const fallbackRateRaw = Number(process.env.NEXT_PUBLIC_TAX_RATE ?? "0.08");
    const fallbackTaxRate = Number.isFinite(fallbackRateRaw)
      ? fallbackRateRaw
      : 0.08;
    const fee = fallbackDeliveryFee(deliveryOption);
    const fallbackTax = Math.round(total * fallbackTaxRate * 100) / 100;
    const fallbackGrandTotal =
      Math.round((total + fee + fallbackTax) * 100) / 100;

    if (deliveryOption === "pickup") {
      setPricing({
        distanceMiles: 0,
        distanceSource: "fallback",
        deliveryFee: 0,
        tax: fallbackTax,
        taxRate: fallbackTaxRate,
        grandTotal: Math.round((total + fallbackTax) * 100) / 100,
      });
      setPricingLoading(false);
      return;
    }

    if (!restaurantSlug || !formData.address.trim()) {
      setPricing({
        distanceMiles: 0,
        distanceSource: "fallback",
        deliveryFee: fee,
        tax: fallbackTax,
        taxRate: fallbackTaxRate,
        grandTotal: fallbackGrandTotal,
      });
      setPricingLoading(false);
      return;
    }

    let cancelled = false;
    setPricingLoading(true);
    const timer = window.setTimeout(() => {
      api
        .getPricingEstimate({
          restaurantSlug,
          deliveryAddress: formData.address,
          deliveryOption,
          subtotal: total,
        })
        .then((estimate) => {
          if (cancelled) return;
          setPricing(estimate as PricingEstimate);
        })
        .catch(() => {
          if (cancelled) return;
          setPricing({
            distanceMiles: 0,
            distanceSource: "fallback",
            deliveryFee: fee,
            tax: fallbackTax,
            taxRate: fallbackTaxRate,
            grandTotal: fallbackGrandTotal,
          });
        })
        .finally(() => {
          if (!cancelled) setPricingLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [deliveryOption, formData.address, loaded, restaurantSlug, total]);

  const deliveryFee = pricing.deliveryFee;
  const tax = pricing.tax;
  const activeDiscount = getCheckoutOfferDiscount({
    restaurantName,
    deliveryOption,
  });
  const discountAmount = activeDiscount
    ? Math.round(total * (activeDiscount.percent / 100) * 100) / 100
    : 0;
  const grandTotal = Math.max(
    0,
    Math.round((pricing.grandTotal - discountAmount) * 100) / 100
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderId = "ORD" + Date.now().toString().slice(-6);
    sessionStorage.setItem(
      "ddba_order",
      JSON.stringify({
        ...formData,
        cart,
        total,
        orderId,
        deliveryOption,
        deliveryFee,
        tax,
        offerDiscountAmount: discountAmount,
        offerDiscountPercent: activeDiscount?.percent ?? 0,
        offerDiscountTitle: activeDiscount?.title ?? null,
        distanceMiles: pricing.distanceMiles,
        distanceSource: pricing.distanceSource,
        grandTotal,
      })
    );
    router.push(`/track/${orderId}`);
  };

  if (!loaded) return null;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-stone-600 mb-4">Your cart is empty</p>
        <button
          onClick={() => router.push("/customer")}
          className="text-primary-600 hover:text-primary-700"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.push("/customer")}
        className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Menu
      </button>

      <h1 className="text-3xl font-bold text-stone-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Checkout Form */}
        <div className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="font-semibold text-stone-900 mb-6">
            Delivery Information
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                required
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-stone-700 mb-1.5"
              >
                Delivery Address
              </label>
              <textarea
                id="address"
                required={deliveryOption !== "pickup"}
                disabled={deliveryOption === "pickup"}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={3}
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="123 Main St, Apt 4B"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">
                Delivery Method
              </label>
              <DeliveryOptions
                selectedOption={deliveryOption}
                onSelect={setDeliveryOption}
                communityActive={true}
                distanceMiles={pricing.distanceMiles}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Place Order
            </button>
          </form>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-stone-200 p-6 h-fit">
          <h2 className="font-semibold text-stone-900 mb-6">Order Summary</h2>

          <div className="space-y-4 mb-6">
            {cart.map((item: CartItem) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-stone-600">
                  {item.quantity}x {item.name}
                </span>
                <span className="text-stone-900 font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 pt-4 space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Subtotal</span>
              <span className="text-stone-900">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Delivery Fee</span>
              <span className="text-stone-900">
                {pricingLoading ? "Calculating..." : `$${deliveryFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Estimated Tax</span>
              <span className="text-stone-900">${tax.toFixed(2)}</span>
            </div>
            {activeDiscount && (
              <div className="flex justify-between text-sm">
                <span className="text-green-700">
                  Offer Discount ({activeDiscount.percent}%)
                </span>
                <span className="text-green-700">-${discountAmount.toFixed(2)}</span>
              </div>
            )}
          </div>

          {deliveryOption !== "pickup" && (
            <p className="text-xs text-stone-500 mb-4">
              {formData.address.trim()
                ? `Distance estimate: ${pricing.distanceMiles.toFixed(1)} mi (${pricing.distanceSource === "google-directions" ? "Google Directions" : "fallback"}).`
                : "Enter delivery address to get distance-based fee estimate."}
            </p>
          )}

          {activeDiscount && (
            <p className="text-xs text-green-700 mb-4">
              Active offer applied from {restaurantName || "restaurant"}: {activeDiscount.title}
            </p>
          )}

          <div className="border-t border-stone-200 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-stone-900">Total</span>
              <span className="text-xl font-bold text-primary-600">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
