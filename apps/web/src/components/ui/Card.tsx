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
      className={`bg-[#fffef9]/95 rounded-2xl border border-stone-200/90 shadow-sm shadow-stone-600/10 backdrop-blur-sm ${
        hover
          ? "hover:shadow-md hover:shadow-primary-600/10 hover:-translate-y-0.5 hover:border-primary-200 transition-all duration-300 cursor-pointer"
          : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
