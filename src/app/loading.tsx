import { Brain } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-5 bg-[var(--bg)]">
      {/* Animated logo */}
      <div className="relative">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center animate-glow"
          style={{ background: "linear-gradient(135deg,#0e87e8,#8b5cf6)" }}
        >
          <Brain size={30} color="white" />
        </div>
        {/* Spinning ring */}
        <svg
          className="absolute -inset-2 w-20 h-20"
          style={{ animation: "spin-slow 1.2s linear infinite" }}
          viewBox="0 0 80 80"
          fill="none"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="url(#spinGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="56 170"
          />
          <defs>
            <linearGradient id="spinGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0e87e8" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <p className="text-sm font-medium text-[var(--foreground-muted)] animate-pulse-soft">
        Loading MindBloom…
      </p>
    </div>
  );
}
