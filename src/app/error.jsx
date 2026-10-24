"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <div className="max-w-md w-full text-center animate-fade-in">
        {/* Icon */}
        <div className="flex items-center justify-center mb-6">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "#fff1f2", border: "1px solid #fecaca" }}
          >
            <AlertTriangle size={36} style={{ color: "var(--stale-500)" }} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold text-[var(--foreground)] mb-3">
          Something went wrong
        </h1>
        <p className="text-[var(--foreground-muted)] mb-8 leading-relaxed">
          An unexpected error occurred. Please try again — your data is safe.
          {error?.digest && (
            <span className="block mt-2 text-xs font-mono text-[var(--muted)]">
              Error ID: {error.digest}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn btn-primary"
            id="error-retry-btn"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary" id="error-home-btn">
            <Home size={16} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
