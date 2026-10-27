"use client";

import { LayoutDashboard, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--brand-500)" }} />
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      <div className="max-w-md w-full text-center animate-fade-in">
        {/* Icon */}
        <div
          style={{
            width: "4.5rem", height: "4.5rem", borderRadius: "1.25rem",
            background: "linear-gradient(135deg,#0e87e8,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 1.5rem",
            boxShadow: "0 8px 24px rgba(14,135,232,0.3)",
          }}
        >
          <LayoutDashboard size={28} color="white" />
        </div>

        {/* Welcome */}
        <h1 style={{ fontSize: "1.8rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "0.5rem" }}>
          Welcome back, {user?.name?.split(" ")[0] ?? "Learner"} 👋
        </h1>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
          {user?.email}
        </p>
        <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
          Your full dashboard with stats, due review cards, subject freshness,
          and day-wise learning plans will be ready in the upcoming stages.
        </p>

        {/* Stage badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.4rem",
          padding: "0.375rem 0.875rem", borderRadius: "99px",
          background: "#eff6ff", color: "#0269c6", border: "1px solid #baddfd",
          fontSize: "0.8rem", fontWeight: 600, marginBottom: "1.5rem",
        }}>
          ✅ Stage 3 Complete — Auth is live!
        </div>

        {/* Logout */}
        <div>
          <button
            id="dashboard-logout"
            onClick={logout}
            className="btn btn-secondary"
            style={{ gap: "0.5rem" }}
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
