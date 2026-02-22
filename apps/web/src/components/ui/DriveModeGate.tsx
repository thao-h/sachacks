"use client";

import { Car, LogIn, Route } from "lucide-react";
import { api } from "@/lib/api-client";
import type { SessionUser } from "@/lib/session";

interface DriveModeGateProps {
  user: SessionUser | null;
  setUser: (user: SessionUser | null) => void;
  openAuth: () => void;
  title: string;
  description: string;
}

export function DriveModeGate({
  user,
  setUser,
  openAuth,
  title,
  description,
}: DriveModeGateProps) {
  const switchToDrive = async () => {
    if (!user) {
      openAuth();
      return;
    }

    const updated = (await api.setMode("drive")) as SessionUser;
    setUser(updated);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="rounded-2xl border border-stone-200 bg-[#fffef9] shadow-sm p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-primary-100 text-primary-700 mx-auto flex items-center justify-center">
          <Route className="w-7 h-7" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-primary-900">{title}</h1>
        <p className="mt-2 text-sm text-stone-600">{description}</p>

        {!user ? (
          <button
            type="button"
            onClick={openAuth}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-pop-500 hover:bg-pop-600 text-white px-4 py-2.5 text-sm font-semibold"
          >
            <LogIn className="w-4 h-4" />
            Sign in to continue
          </button>
        ) : (
          <button
            type="button"
            onClick={switchToDrive}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 text-sm font-semibold"
          >
            <Car className="w-4 h-4" />
            Switch to Drive mode
          </button>
        )}
      </div>
    </div>
  );
}

