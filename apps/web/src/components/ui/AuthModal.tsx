"use client";

import { useState } from "react";
import { X, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "@/lib/api-client";
import type { SessionUser } from "@/lib/session";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: (user: SessionUser) => void;
}

export function AuthModal({ open, onClose, onLogin }: AuthModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = (await api.login(
        identifier,
        name || undefined
      )) as SessionUser;
      onLogin(user);
      onClose();
      setIdentifier("");
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8"
          >
            <button
              onClick={onClose}
              aria-label="Close sign in modal"
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">
                Sign in to DDBA
              </h2>
              <p className="text-stone-500 mt-1">
                Enter your phone number or email to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Phone or Email
                </label>
                <input
                  id="identifier"
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="(555) 123-4567 or you@email.com"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200 text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-stone-700 mb-1.5"
                >
                  Name{" "}
                  <span className="text-stone-400 font-normal">(optional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200 text-base"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading || !identifier}
                className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-150 active:scale-[0.98] text-base"
              >
                {loading ? "Signing in..." : "Continue"}
              </button>
            </form>

            <p className="text-xs text-stone-400 text-center mt-4">
              Join 500+ Davis community members
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
