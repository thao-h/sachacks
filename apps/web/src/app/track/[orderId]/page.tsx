"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Home,
  MapPin,
  Phone,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Share2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface OrderData {
  cart?: { id: string; name: string; price: number; quantity: number }[];
  grandTotal?: number;
  deliveryOption?: string;
  name?: string;
  phone?: string;
  address?: string;
}

export default function OrderTrackingPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [orderData, setOrderData] = useState<OrderData>({});
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [shareLocation, setShareLocation] = useState(false);
  const [driverLocation, setDriverLocation] = useState({
    lat: 38.5449,
    lng: -121.7405,
  });

  useEffect(() => {
    const raw = sessionStorage.getItem("ddba_order");
    if (raw) {
      setOrderData(JSON.parse(raw));
    }
  }, []);

  // Mock driver movement
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverLocation((prev) => ({
        lat: prev.lat + 0.0001,
        lng: prev.lng + 0.0001,
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const statusSteps = [
    { label: "Confirmed", icon: CheckCircle2, status: "complete" },
    { label: "Preparing", icon: Package, status: "complete" },
    { label: "On the way", icon: Truck, status: "current" },
    { label: "Delivered", icon: Home, status: "pending" },
  ];

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-stone-50 relative overflow-hidden">
      {/* Map Placeholder */}
      <div className="flex-1 bg-stone-200 relative w-full h-1/2 min-h-[300px]">
        {/* Mock Map Background */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center opacity-40 grayscale" />

        {/* Map Elements Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Restaurant Pin */}
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="bg-orange-500 p-2 rounded-full shadow-lg border-2 border-white">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div className="mt-1 bg-white px-2 py-1 rounded text-xs font-bold shadow-md">
                Restaurant
              </div>
            </div>
          </div>

          {/* Customer Pin */}
          <div className="absolute top-2/3 left-3/4 -translate-x-1/2 -translate-y-1/2">
            <div className="flex flex-col items-center">
              <div className="bg-primary-600 p-2 rounded-full shadow-lg border-2 border-white">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div className="mt-1 bg-white px-2 py-1 rounded text-xs font-bold shadow-md">
                You
              </div>
            </div>
          </div>

          {/* Driver Pin (Moving) */}
          <motion.div
            animate={{ x: [0, 100], y: [0, 50] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/3 left-1/4"
          >
            <div className="flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
              <div className="bg-green-500 p-1.5 rounded-full shadow-lg border-2 border-white ring-4 ring-green-500/20">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="mt-1 bg-black/80 text-white px-2 py-1 rounded text-xs font-bold shadow-md whitespace-nowrap">
                Alex M.
              </div>
            </div>
          </motion.div>

          {/* Route Line Mock */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <path
              d="M 25% 33% Q 50% 50% 75% 66%"
              stroke="#3B82F6"
              strokeWidth="4"
              fill="none"
              strokeDasharray="8 4"
              className="animate-pulse"
            />
          </svg>
        </div>

        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-stone-200">
          <span className="text-xs font-bold text-stone-900">
            Order #{orderId}
          </span>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-white rounded-t-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] relative z-10 -mt-6 flex flex-col max-h-[60vh]">
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-3 mb-1" />

        <div className="px-6 py-4 overflow-y-auto">
          {/* Status Stepper */}
          <div className="flex justify-between items-center mb-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-100 -z-10" />
            {statusSteps.map((step, index) => {
              const Icon = step.icon;
              const isComplete = step.status === "complete";
              const isCurrent = step.status === "current";

              return (
                <div
                  key={index}
                  className="flex flex-col items-center bg-white px-1"
                >
                  <div className="relative">
                    {isCurrent && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary-400"
                        animate={{
                          scale: [1, 1.6, 1],
                          opacity: [0.6, 0, 0.6],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all ${
                        isComplete
                          ? "bg-green-500 text-white"
                          : isCurrent
                            ? "bg-primary-600 text-white ring-4 ring-primary-100"
                            : "bg-stone-100 text-stone-300"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-medium ${isCurrent ? "text-primary-600" : "text-stone-500"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-stone-900">
              Alex is 4 mins away
            </h2>
            <p className="text-stone-500 text-sm">
              Arriving between 6:15 - 6:20 PM
            </p>
          </div>

          {/* Driver Card */}
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-100 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                A
              </div>
              <div>
                <h3 className="font-bold text-stone-900">Alex M.</h3>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span className="bg-stone-200 px-1.5 py-0.5 rounded text-stone-700 font-medium">
                    4.9 *
                  </span>
                  <span>Silver Toyota Prius</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="p-2 bg-white border border-stone-200 rounded-full text-primary-600 hover:bg-primary-50 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
              <button className="p-2 bg-white border border-stone-200 rounded-full text-green-600 hover:bg-green-50 transition-colors">
                <Phone className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Location Sharing */}
          <div className="flex items-center justify-between py-3 border-t border-stone-100 mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-50 p-2 rounded-full text-primary-600">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium text-stone-900 text-sm">
                  Share location
                </div>
                <div className="text-xs text-stone-500">
                  Help driver find you faster
                </div>
              </div>
            </div>
            <button
              onClick={() => setShareLocation(!shareLocation)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                shareLocation ? "bg-primary-600" : "bg-stone-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  shareLocation ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Order Details Accordion */}
          <div className="border rounded-xl border-stone-200 overflow-hidden mb-6">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-stone-50 transition-colors"
            >
              <span className="font-medium text-stone-900 text-sm">
                View Order Details
              </span>
              {isDetailsOpen ? (
                <ChevronUp className="w-4 h-4 text-stone-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-stone-500" />
              )}
            </button>

            <AnimatePresence>
              {isDetailsOpen && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden bg-stone-50"
                >
                  <div className="p-4 border-t border-stone-200 space-y-3">
                    {orderData.cart?.map(
                      (item: {
                        id: string;
                        name: string;
                        price: number;
                        quantity: number;
                      }) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-stone-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-stone-900 font-medium">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      )
                    )}
                    <div className="border-t border-stone-200 pt-3 flex justify-between font-bold text-stone-900 text-sm">
                      <span>Total</span>
                      <span>
                        ${(orderData.grandTotal || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link
              href="/customer"
              className="flex items-center justify-center py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium rounded-xl text-sm transition-colors"
            >
              Menu
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl text-sm transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
