"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, UtensilsCrossed, Car, Users, Navigation } from "lucide-react";
import { motion } from "motion/react";
import type { SessionUser } from "@/lib/session";

export function BottomNav({ user }: { user: SessionUser | null }) {
  const pathname = usePathname();
  const tabs = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/customer", icon: UtensilsCrossed, label: "Order" },
    { path: "/routes", icon: Navigation, label: "Routes" },
    ...(user?.canDrive ? [{ path: "/driver", icon: Car, label: "Drive" }] : []),
    { path: "/communities", icon: Users, label: "Hub" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#fffef9]/90 backdrop-blur-xl border-t border-primary-100 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const isActive =
            tab.path === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.path) ||
                (tab.path === "/customer" && pathname.startsWith("/r/"));

          return (
            <Link
              key={tab.path}
              href={tab.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-pop-500 rounded-full"
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
              <tab.icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-pop-600" : "text-stone-500"
                }`}
              />
              <span
                className={`text-[10px] mt-1 font-medium transition-colors ${
                  isActive ? "text-pop-600" : "text-stone-500"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
