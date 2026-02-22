"use client";

import { useRouter } from "next/navigation";
import {
  MapPin,
  ChevronRight,
  ShoppingBag,
  Car,
  Users,
  Lock,
} from "lucide-react";
import { useAuth } from "@/components/ui/LayoutShell";

export default function HomePage() {
  const router = useRouter();
  const { user, loading, requireAuth } = useAuth();

  const handleOrderClick = () => {
    requireAuth(() => {
      if (user?.canOrder) {
        router.push("/customer");
      }
    });
  };

  const handleDriveClick = () => {
    requireAuth(() => {
      if (user?.canDrive) {
        router.push("/driver");
      }
    });
  };

  const handleCommunitiesClick = () => {
    requireAuth(() => {
      router.push("/communities");
    });
  };

  const orderDisabled = user !== null && !user.canOrder;
  const driveDisabled = user !== null && !user.canDrive;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl animate-fade-in-up">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Content */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {/* Logo and Header */}
              <div className="mb-8 animate-fade-in-up-delayed">
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 rounded-full" />
                    <MapPin
                      className="w-10 h-10 text-blue-600 relative"
                      strokeWidth={2.5}
                    />
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900">DDBA</h1>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight leading-tight">
                  Local Delivery OS
                </h2>

                <p className="text-lg text-gray-600 font-medium">
                  Community-powered delivery for Davis
                </p>
              </div>

              {/* Action Buttons */}
              <div className={`space-y-4 ${loading ? "opacity-50 pointer-events-none" : ""}`}>
                {/* Order Food CTA */}
                <button
                  onClick={handleOrderClick}
                  disabled={orderDisabled}
                  className={`group w-full rounded-xl py-4 px-6 font-semibold transition-all duration-300 flex items-center justify-between ${
                    orderDisabled
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {orderDisabled ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <ShoppingBag className="w-5 h-5" />
                    )}
                    Order Food
                  </div>
                  {!orderDisabled && (
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                  )}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  {/* Drive & Earn */}
                  <button
                    onClick={handleDriveClick}
                    disabled={driveDisabled}
                    className={`group w-full rounded-xl py-4 px-4 font-semibold transition-all duration-300 flex flex-col items-start gap-2 ${
                      driveDisabled
                        ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                        : "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5"
                    }`}
                  >
                    <Car
                      className={`w-6 h-6 mb-1 ${driveDisabled ? "text-gray-300" : "text-blue-600"}`}
                    />
                    <span>Drive & Earn</span>
                  </button>

                  {/* My Communities */}
                  <button
                    onClick={handleCommunitiesClick}
                    className="group w-full bg-white hover:bg-gray-50 text-gray-900 rounded-xl py-4 px-4 font-semibold transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 flex flex-col items-start gap-2"
                  >
                    <Users className="w-6 h-6 text-green-600 mb-1" />
                    <span>My Communities</span>
                  </button>
                </div>
              </div>

              <div className="mt-8 text-center md:text-left">
                <button
                  onClick={() =>
                    requireAuth(() => {
                      if (user?.restaurantIds.length) {
                        router.push("/dashboard");
                      }
                    })
                  }
                  className={`text-sm font-medium transition-colors ${
                    user && user.restaurantIds.length > 0
                      ? "text-gray-500 hover:text-blue-600"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  For Restaurants & Dispatchers &rarr;
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-64 md:h-auto bg-blue-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1717250265987-b5c58bb96b8a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjb21tdW5pdHklMjBkZWxpdmVyeSUyMGlsbHVzdHJhdGlvbiUyMG9yJTIwdmVjdG9yJTIwYXJ0fGVufDF8fHx8MTc3MTcyNzE5NHww&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Community Delivery"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:bg-gradient-to-l md:from-transparent md:to-white/10" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
