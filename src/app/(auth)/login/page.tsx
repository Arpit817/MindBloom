import type { Metadata } from "next";
import Link from "next/link";
import { Brain, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your MindBloom account.",
};

export default function LoginPage() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 bg-[var(--bg)]">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#0e87e8,#8b5cf6)" }}
          >
            <Brain size={22} color="white" />
          </div>
          <span className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            MindBloom
          </span>
        </div>

        {/* Card */}
        <div className="card p-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{ background: "#eff6ff", color: "#0269c6", border: "1px solid #baddfd" }}
          >
            Stage 3 Feature
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--foreground)] mb-3">
            Log In
          </h1>
          <p className="text-[var(--foreground-muted)] text-sm leading-relaxed mb-6">
            Authentication with Supabase will be implemented in Stage 3.
            This page will include email/password login with session persistence.
          </p>
          <Link href="/" className="btn btn-secondary w-full justify-center" id="login-back-home">
            <ArrowLeft size={15} />
            Back to Home
          </Link>
        </div>

        <p className="text-center text-sm text-[var(--foreground-muted)] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold" style={{ color: "var(--brand-600)" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}
