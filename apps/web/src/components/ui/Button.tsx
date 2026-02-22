"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const variants = {
  primary:
    "bg-primary-600 hover:bg-primary-700 text-white shadow-sm shadow-primary-600/20 hover:shadow-md hover:shadow-primary-600/30",
  secondary:
    "bg-white border border-stone-200 text-stone-900 hover:bg-primary-50 hover:border-primary-300",
  ghost: "text-stone-600 hover:text-stone-900 hover:bg-stone-100",
  danger: "bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-600/20",
  accent:
    "bg-accent-500 hover:bg-accent-600 text-white shadow-sm shadow-accent-500/20 hover:shadow-md hover:shadow-accent-500/30",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2.5 text-sm rounded-xl gap-2",
  lg: "px-6 py-3 text-base rounded-xl gap-2",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon: Icon,
      iconRight: IconRight,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : Icon ? (
          <Icon className="w-4 h-4" />
        ) : null}
        {children}
        {IconRight && !loading && <IconRight className="w-4 h-4" />}
      </button>
    );
  }
);

Button.displayName = "Button";
