import Link from "next/link";
import type { Metadata } from "next";
import { Home, SearchX } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <div className="max-w-md w-full text-center animate-fade-in">
        {/* 404 display */}
        <div className="text-[9rem] font-extrabold leading-none tracking-tighter gradient-text mb-4 select-none">
          404
        </div>

        <div className="flex items-center justify-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "#eff6ff", border: "1px solid #baddfd" }}
          >
            <SearchX size={28} style={{ color: "var(--brand-500)" }} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--foreground)] mb-3">
          Page not found
        </h1>
        <p className="text-[var(--foreground-muted)] mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <Link href="/" className="btn btn-primary" id="not-found-home-btn">
          <Home size={16} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
