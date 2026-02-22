"use client";

import { useRouter } from "next/navigation";
import {
  MapPin,
  ChevronRight,
  ShoppingBag,
  Car,
  Users,
  Lock,
  Route,
  Package,
  Leaf,
  Clock,
  DollarSign,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/components/ui/LayoutShell";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

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
    <main id="main-content" className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-stone-50 via-primary-50/40 to-accent-50/30">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-grain" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="max-w-2xl"
          >
            {/* Badge */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-100/80 text-primary-700 text-sm font-medium rounded-full mb-6">
                <Leaf className="w-3.5 h-3.5" />
                Serving Davis, CA
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-stone-900 tracking-tight leading-[1.1] mb-4"
            >
              Community-Powered{" "}
              <span className="text-primary-600">Delivery</span> for Davis
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg sm:text-xl text-stone-600 mb-8 max-w-lg"
            >
              Order from local restaurants. Share routes. Save money. Support
              your community.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`flex flex-col sm:flex-row gap-3 mb-6 ${loading ? "opacity-50 pointer-events-none" : ""}`}
            >
              <button
                onClick={handleOrderClick}
                disabled={orderDisabled}
                className={`group inline-flex items-center gap-2 rounded-xl py-3.5 px-6 font-semibold text-base transition-all duration-200 active:scale-[0.98] ${
                  orderDisabled
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : "bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:-translate-y-0.5"
                }`}
              >
                {orderDisabled ? (
                  <Lock className="w-5 h-5" />
                ) : (
                  <ShoppingBag className="w-5 h-5" />
                )}
                Order Food
                {!orderDisabled && (
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>

              <button
                onClick={handleDriveClick}
                disabled={driveDisabled}
                className={`group inline-flex items-center gap-2 rounded-xl py-3.5 px-6 font-semibold text-base transition-all duration-200 active:scale-[0.98] ${
                  driveDisabled
                    ? "bg-stone-100 text-stone-400 cursor-not-allowed"
                    : "bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <Car
                  className={`w-5 h-5 ${driveDisabled ? "" : "text-primary-600"}`}
                />
                Drive & Earn
              </button>

              <button
                onClick={handleCommunitiesClick}
                className="group inline-flex items-center gap-2 rounded-xl py-3.5 px-6 font-semibold text-base bg-white hover:bg-stone-50 text-stone-900 border border-stone-200 hover:border-stone-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]"
              >
                <Users className="w-5 h-5 text-accent-600" />
                Communities
              </button>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() =>
                  requireAuth(() => {
                    if (user?.isAdmin) {
                      router.push("/board");
                    } else {
                      router.push("/dashboard");
                    }
                  })
                }
                className="text-sm font-medium text-stone-500 hover:text-primary-600 transition-colors"
              >
                For Restaurants & Dispatchers &rarr;
              </button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              How It Works
            </h2>
            <p className="text-stone-600 max-w-md mx-auto">
              Cheaper delivery through community coordination
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: "1. Order",
                description:
                  "Browse local restaurants and add items to your cart. Pick your delivery style.",
                color: "primary",
              },
              {
                icon: Route,
                title: "2. Route Match",
                description:
                  "We find drivers already heading your way, or batch with your community for savings.",
                color: "accent",
              },
              {
                icon: Package,
                title: "3. Delivered",
                description:
                  "Your food arrives fast and affordable. Drivers earn on routes they're already taking.",
                color: "primary",
              },
            ].map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-center"
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                    step.color === "accent"
                      ? "bg-accent-100 text-accent-600"
                      : "bg-primary-100 text-primary-600"
                  }`}
                >
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-stone-600 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Options Highlight */}
      <section className="py-16 md:py-20 bg-stone-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-stone-900 mb-3">
              Delivery Your Way
            </h2>
            <p className="text-stone-600 max-w-md mx-auto">
              Four flexible options, from free pickup to on-demand courier
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Route,
                title: "Route Match",
                price: "$1.50",
                desc: "A driver heading your way",
                highlight: true,
              },
              {
                icon: Users,
                title: "Community Batch",
                price: "$2.00",
                desc: "Grouped with neighbors",
                highlight: false,
              },
              {
                icon: Car,
                title: "Direct Courier",
                price: "$5.99",
                desc: "On-demand delivery",
                highlight: false,
              },
              {
                icon: MapPin,
                title: "Pickup",
                price: "Free",
                desc: "Grab it yourself",
                highlight: false,
              },
            ].map((option, i) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
                  option.highlight
                    ? "bg-primary-50 border-primary-200 shadow-sm"
                    : "bg-white border-stone-200"
                }`}
              >
                <option.icon
                  className={`w-6 h-6 mb-3 ${option.highlight ? "text-primary-600" : "text-stone-400"}`}
                />
                <h3 className="font-semibold text-stone-900 mb-1">
                  {option.title}
                </h3>
                <p className="text-sm text-stone-500 mb-2">{option.desc}</p>
                <span
                  className={`text-lg font-bold ${option.highlight ? "text-primary-600" : "text-stone-900"}`}
                >
                  {option.price}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 bg-white border-t border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
          >
            {[
              {
                icon: ShoppingBag,
                value: "42+",
                label: "Local Restaurants",
              },
              {
                icon: Clock,
                value: "~25 min",
                label: "Avg. Delivery",
              },
              {
                icon: DollarSign,
                value: "$1.50",
                label: "Starting Delivery Fee",
              },
              {
                icon: MapPin,
                value: "Davis, CA",
                label: "Proudly Local",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center gap-3 text-center"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-stone-500" />
                </div>
                <div className="text-left">
                  <div className="text-lg font-bold text-stone-900">
                    {stat.value}
                  </div>
                  <div className="text-xs text-stone-500">{stat.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
