"use client";

import Link from "next/link";
import { Brain } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2" aria-label="MindBloom home">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0e87e8,#8b5cf6)" }}
          >
            <Brain size={18} color="white" />
          </div>
          <span
            className="text-xl font-bold text-[var(--foreground)]"
            style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
          >
            MindBloom
          </span>
        </Link>

        {/* CTA buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="btn btn-secondary btn-sm hidden sm:inline-flex"
            id="navbar-login-btn"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="btn btn-primary btn-sm"
            id="navbar-signup-btn"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </header>
  );
}
