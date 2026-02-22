"use client";

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { LandingHeader } from "./LandingHeader";
import { AuthModal } from "./AuthModal";
import { api } from "@/lib/api-client";
import type { SessionUser } from "@/lib/session";

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  openAuth: () => void;
  setUser: (user: SessionUser | null) => void;
  requireAuth: (action: () => void) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  openAuth: () => {},
  setUser: () => {},
  requireAuth: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    api
      .me()
      .then((u) => setUser(u as SessionUser))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const requireAuth = useCallback(
    (action: () => void) => {
      if (!user) {
        setAuthOpen(true);
        return;
      }
      action();
    },
    [user],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        openAuth: () => setAuthOpen(true),
        setUser,
        requireAuth,
      }}
    >
      <LandingHeader
        user={user}
        onSignInClick={() => setAuthOpen(true)}
        onUserChange={setUser}
      />
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onLogin={setUser}
      />
      {children}
    </AuthContext.Provider>
  );
}
