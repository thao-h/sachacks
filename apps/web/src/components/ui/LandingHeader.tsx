"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { UserMenu } from "./UserMenu";
import type { SessionUser } from "@/lib/session";

interface LandingHeaderProps {
  user: SessionUser | null;
  onSignInClick: () => void;
  onUserChange: (user: SessionUser | null) => void;
}

export function LandingHeader({
  user,
  onSignInClick,
  onUserChange,
}: LandingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const links = [
    { path: "/customer", label: "Order" },
    ...(user?.canDrive ? [{ path: "/driver", label: "Drive" }] : []),
    { path: "/routes", label: "Routes" },
    { path: "/communities", label: "Communities" },
  ];

  return (
    <header className="backdrop-blur-xl bg-[#fffef9]/85 border-b border-primary-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              <MapPin className="w-6 h-6 text-primary-600 relative" />
            </div>
            <span className="text-xl font-bold text-stone-900 tracking-tight hidden sm:block">
              DDBA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 mx-4">
            {links.map((link) => {
              const isActive =
                pathname.startsWith(link.path) ||
                (link.path === "/customer" && pathname.startsWith("/r/"));
              return (
                <Link
                  key={link.label}
                  href={link.path}
                  className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-primary-700"
                      : "text-stone-700 hover:text-primary-900 hover:bg-primary-50"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-gradient-to-r from-primary-100 to-accent-100 rounded-lg -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Section: Auth */}
          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu
                user={user}
                onModeChange={(updated) => onUserChange(updated)}
                onLogout={() => onUserChange(null)}
              />
            ) : (
              <button
                onClick={onSignInClick}
                className="flex items-center gap-2 px-4 py-2 bg-pop-500 hover:bg-pop-600 text-white rounded-lg text-sm font-semibold transition-all duration-150 active:scale-[0.98] shadow-sm shadow-pop-500/20"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-primary-700 hover:bg-primary-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden border-t border-primary-100 bg-[#fffef9]/95 backdrop-blur-xl absolute w-full left-0 shadow-lg shadow-stone-900/10 z-50 overflow-hidden"
          >
            <div className="p-2 space-y-1">
              {links.map((link, i) => {
                const isActive =
                  pathname.startsWith(link.path) ||
                  (link.path === "/customer" && pathname.startsWith("/r/"));
                return (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={link.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive
                          ? "bg-gradient-to-r from-primary-100 to-accent-100 text-primary-900"
                          : "text-stone-700 hover:text-primary-900 hover:bg-primary-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
              {user && (
                <div className="mt-2 pt-2 border-t border-primary-100 px-4 py-2">
                  <p className="text-sm font-medium text-primary-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-stone-600">
                    {user.phone || user.email}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
