"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import {
  DeliveryOptions,
  type DeliveryOptionType,
} from "@/components/ui/DeliveryOptions";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("ddba_cart");
    if (raw) {
      const data = JSON.parse(raw);
      setCart(data.cart || []);
      setTotal(data.total || 0);
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

  const deliveryFee = useMemo(() => {
    switch (deliveryOption) {
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
  }, [deliveryOption]);

  const tax = total * 0.08;
  const grandTotal = total + deliveryFee + tax;

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
              <span className="text-stone-900">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone-600">Tax</span>
              <span className="text-stone-900">${tax.toFixed(2)}</span>
            </div>
          </div>

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
