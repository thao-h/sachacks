"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, User, Menu, X } from "lucide-react";
import { UserMenu } from "./UserMenu";
import type { SessionUser } from "@/lib/session";

const links = [
  { path: "/customer", label: "Order" },
  { path: "/driver", label: "Drive" },
  { path: "/communities", label: "Communities" },
  { path: "/routes", label: "Routes" },
];

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

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              DDBA
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 mx-4">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.path) || (link.path === "/customer" && pathname.startsWith("/r/"));
              return (
                <Link
                  key={link.label}
                  href={link.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
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
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Sign in</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full left-0 shadow-lg z-50">
          <div className="p-2 space-y-1">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.path) || (link.path === "/customer" && pathname.startsWith("/r/"));
              return (
                <Link
                  key={link.label}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {user && (
              <div className="mt-2 pt-2 border-t border-gray-100 px-4 py-2">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">
                  {user.phone || user.email}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
