import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const variantClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
};

const sizeClass = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

const Button = forwardRef(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn("btn", variantClass[variant], sizeClass[size], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
            Loading…
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
