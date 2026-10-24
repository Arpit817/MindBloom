import { cn } from "@/utils/cn";

const sizeMap = { sm: 16, md: 24, lg: 36 };

export default function LoadingSpinner({
  size = "md",
  className,
  label = "Loading…",
}) {
  const px = sizeMap[size] || 24;

  return (
    <span
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeOpacity="0.2"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="url(#spinnerGrad)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="spinnerGrad" x1="12" y1="2" x2="22" y2="12" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0e87e8" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
