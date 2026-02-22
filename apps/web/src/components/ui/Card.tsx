import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  as?: "div" | "article" | "section";
}

export function Card({
  children,
  className = "",
  hover = false,
  onClick,
  as: Component = "div",
}: CardProps) {
  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-2xl border border-stone-200/60 shadow-sm ${
        hover
          ? "hover:shadow-md hover:shadow-stone-900/5 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
