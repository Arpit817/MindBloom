import { cn } from "@/utils/cn";

/** A single skeleton block */
export function Skeleton({ className, style }) {
  return (
    <div
      className={cn("skeleton", className)}
      style={style}
      aria-hidden="true"
    />
  );
}

/** Skeleton that mimics lines of text */
export function SkeletonText({
  lines = 3,
  className,
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}

/** Skeleton shaped like a card */
export function SkeletonCard({ className }) {
  return (
    <div
      className={cn("card p-5 flex flex-col gap-3", className)}
      aria-hidden="true"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}

/** Skeleton shaped like an avatar circle */
export function SkeletonAvatar({ size = 40 }) {
  return (
    <Skeleton
      className="rounded-full shrink-0"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
