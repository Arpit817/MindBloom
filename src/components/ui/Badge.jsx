import { cn } from "@/utils/cn";

const variantClass = {
  default: "bg-slate-100 text-slate-700 border border-slate-200",
  fresh: "freshness-badge-fresh",
  moderate: "freshness-badge-moderate",
  stale: "freshness-badge-stale",
  critical: "freshness-badge-critical",
  blue: "bg-blue-50 text-blue-700 border border-blue-200",
  purple: "bg-violet-50 text-violet-700 border border-violet-200",
};

export default function Badge({ variant = "default", children, className }) {
  return (
    <span className={cn("badge", variantClass[variant], className)}>
      {children}
    </span>
  );
}
