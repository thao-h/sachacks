"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, ShoppingBag, Car, Store, Shield } from "lucide-react";
import { api } from "@/lib/api-client";
import type { SessionUser, UserMode } from "@/lib/session";

interface UserMenuProps {
  user: SessionUser;
  onModeChange: (user: SessionUser) => void;
  onLogout: () => void;
}

const MODE_CONFIG: Record<
  UserMode,
  { label: string; color: string; icon: typeof ShoppingBag }
> = {
  order: { label: "Ordering", color: "bg-primary-100 text-primary-700", icon: ShoppingBag },
  drive: { label: "Driving", color: "bg-green-100 text-green-700", icon: Car },
  restaurant: { label: "Restaurant", color: "bg-orange-100 text-orange-700", icon: Store },
  admin: { label: "Admin", color: "bg-purple-100 text-purple-700", icon: Shield },
};

function canUseMode(user: SessionUser, mode: UserMode): boolean {
  switch (mode) {
    case "order": return user.canOrder;
    case "drive": return user.canDrive;
    case "restaurant": return user.restaurantIds.length > 0;
    case "admin": return user.isAdmin === true;
    default: return false;
  }
}

export function UserMenu({ user, onModeChange, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = MODE_CONFIG[user.mode];
  const initial = user.name.charAt(0).toUpperCase();

  const handleModeSwitch = async (mode: UserMode) => {
    try {
      const updated = (await api.setMode(mode)) as SessionUser;
      onModeChange(updated);
      setOpen(false);
    } catch {
      // mode not allowed — ignore
    }
  };

  const handleLogout = async () => {
    await api.logout();
    onLogout();
    setOpen(false);
  };

  const availableModes = (Object.keys(MODE_CONFIG) as UserMode[]).filter(
    (m) => canUseMode(user, m),
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 hover:bg-stone-100 rounded-lg transition-colors border border-transparent hover:border-stone-200"
      >
        {/* Mode chip */}
        <div
          className={`hidden sm:flex px-2.5 py-1 rounded-full text-xs font-bold items-center gap-1.5 ${current.color}`}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          {current.label}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold">
          {initial}
        </div>
        <ChevronDown className="w-4 h-4 text-stone-500 hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-[60]">
          {/* User info */}
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="font-semibold text-stone-900 text-sm">{user.name}</p>
            <p className="text-xs text-stone-500">
              {user.phone || user.email}
            </p>
          </div>

          {/* Mode switcher */}
          <div className="px-2 py-2 border-b border-stone-100">
            <p className="px-2 text-xs font-semibold text-stone-400 uppercase tracking-wider mb-1">
              Switch Mode
            </p>
            {availableModes.map((mode) => {
              const config = MODE_CONFIG[mode];
              const Icon = config.icon;
              const isActive = user.mode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => handleModeSwitch(mode)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-stone-100 font-semibold text-stone-900"
                      : "text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                  {isActive && (
                    <span className="ml-auto text-xs text-primary-600">Active</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Logout */}
          <div className="px-2 pt-1">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
