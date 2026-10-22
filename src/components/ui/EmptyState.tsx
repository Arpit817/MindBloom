import { cn } from "@/utils/cn";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("empty-state", className)}>
      {Icon && (
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: "#eff6ff", border: "1px solid #baddfd" }}
        >
          <Icon size={28} style={{ color: "var(--brand-500)" }} />
        </div>
      )}
      <h3 className="text-base font-bold text-[var(--foreground)] mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--foreground-muted)] max-w-xs leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="btn btn-primary btn-sm"
          id="empty-state-action"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
