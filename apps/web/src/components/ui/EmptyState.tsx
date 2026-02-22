"use client";

import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { motion } from "motion/react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  message?: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  message = "Check back later.",
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-4 relative">
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-stone-200 animate-[spin_20s_linear_infinite]" />
          <Icon className="w-8 h-8 text-stone-400" />
        </div>
      </motion.div>
      <h3 className="text-lg font-medium text-stone-900 mb-1">{title}</h3>
      <p className="text-stone-500 text-sm mb-4">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all duration-150 active:scale-[0.98]"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
