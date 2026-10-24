import { LayoutDashboard } from "lucide-react";

export const metadata = {
  title: "Dashboard",
  description: "Your MindBloom dashboard.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <div className="max-w-sm text-center animate-fade-in">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: "#eff6ff", border: "1px solid #baddfd" }}
        >
          <LayoutDashboard size={28} style={{ color: "var(--brand-500)" }} />
        </div>
        <h1 className="text-xl font-extrabold text-[var(--foreground)] mb-2">
          Dashboard
        </h1>
        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
          The full dashboard with stats, due cards, subject freshness, and
          upcoming tasks will be built in Stage 10.
        </p>
        <div
          className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{ background: "#eff6ff", color: "#0269c6", border: "1px solid #baddfd" }}
        >
          Coming in Stage 10
        </div>
      </div>
    </div>
  );
}
