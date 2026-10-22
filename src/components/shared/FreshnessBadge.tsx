import type { FreshnessStatus } from "@/types/database";
import Badge from "@/components/ui/Badge";

interface FreshnessBadgeProps {
  score: number; // 0–100
  showScore?: boolean;
  className?: string;
}

export function getFreshnessStatus(score: number): FreshnessStatus {
  if (score >= 80) return "fresh";
  if (score >= 50) return "moderate";
  if (score >= 25) return "stale";
  return "critical";
}

const statusConfig: Record<
  FreshnessStatus,
  { label: string; variant: "fresh" | "moderate" | "stale" | "critical"; emoji: string }
> = {
  fresh:    { label: "Fresh",    variant: "fresh",    emoji: "🌱" },
  moderate: { label: "Moderate", variant: "moderate", emoji: "🌤️" },
  stale:    { label: "Stale",    variant: "stale",    emoji: "🍂" },
  critical: { label: "Critical", variant: "critical", emoji: "❄️" },
};

export default function FreshnessBadge({ score, showScore = false, className }: FreshnessBadgeProps) {
  const status = getFreshnessStatus(score);
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={className}>
      <span aria-hidden>{config.emoji}</span>
      {config.label}
      {showScore && <span className="opacity-70 ml-0.5">· {score}</span>}
    </Badge>
  );
}
