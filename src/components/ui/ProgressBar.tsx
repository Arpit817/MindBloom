import { cn } from "@/utils/cn";

type ProgressColor = "blue" | "green" | "amber" | "red" | "purple";

interface ProgressBarProps {
  value: number; // 0–100
  color?: ProgressColor;
  showLabel?: boolean;
  className?: string;
  height?: number; // px, default 8
}

const colorMap: Record<ProgressColor, string> = {
  blue:   "linear-gradient(90deg, #0e87e8, #38a6f7)",
  green:  "linear-gradient(90deg, #059669, #10b981)",
  amber:  "linear-gradient(90deg, #d97706, #f59e0b)",
  red:    "linear-gradient(90deg, #e11d48, #f43f5e)",
  purple: "linear-gradient(90deg, #7c3aed, #8b5cf6)",
};

export default function ProgressBar({
  value,
  color = "blue",
  showLabel = false,
  className,
  height = 8,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="progress-track flex-1"
        style={{ height }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Progress: ${clamped}%`}
      >
        <div
          className="progress-fill"
          style={{ width: `${clamped}%`, background: colorMap[color] }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-bold text-[var(--foreground-muted)] w-8 text-right shrink-0">
          {clamped}%
        </span>
      )}
    </div>
  );
}
