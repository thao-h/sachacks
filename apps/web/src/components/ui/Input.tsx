import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-primary-900 mb-1.5"
          >
            {label}
            {hint && (
              <span className="text-stone-500 font-normal ml-1">({hint})</span>
            )}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 bg-[#fffef9] border rounded-xl text-base transition-all duration-200 ${
            error
              ? "border-red-300 focus:ring-red-500/30 focus:border-red-500"
              : "border-stone-300 focus:ring-primary-500/25 focus:border-primary-500"
          } focus:outline-none focus:ring-2 ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
