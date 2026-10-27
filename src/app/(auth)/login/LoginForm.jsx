"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Brain, Eye, EyeOff, LogIn, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const { login, user } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  // Already logged in — redirect immediately
  useEffect(() => {
    if (user) router.replace(redirect);
  }, [user, redirect, router]);

  const validate = () => {
    const errs = {};
    if (!formData.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Enter a valid email address.";
    if (!formData.password) errs.password = "Password is required.";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setIsLoading(true);
    setApiError("");

    try {
      await login(formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => router.replace(redirect), 600);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4" style={{ background: "var(--bg)" }}>
      {/* Background decorations */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(14,135,232,0.12), transparent)",
      }} />

      <div className="w-full max-w-md animate-fade-in" style={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", marginBottom: "2rem" }}>
          <div style={{
            width: "2.75rem", height: "2.75rem", borderRadius: "0.875rem",
            background: "linear-gradient(135deg,#0e87e8,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(14,135,232,0.35)",
          }}>
            <Brain size={22} color="white" />
          </div>
          <span style={{ fontSize: "1.6rem", fontWeight: 800, fontFamily: "'Plus Jakarta Sans',sans-serif", letterSpacing: "-0.03em" }}>
            MindBloom
          </span>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "1.25rem", boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          padding: "2rem",
        }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h1 style={{
              fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em",
              fontFamily: "'Plus Jakarta Sans',sans-serif", marginBottom: "0.375rem",
            }}>
              Welcome back 👋
            </h1>
            <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
              Log in to continue your learning journey.
            </p>
          </div>

          {/* API Error */}
          {apiError && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1rem", borderRadius: "0.625rem", marginBottom: "1rem",
              background: "#fff1f2", border: "1px solid #fecdd3", color: "#be123c",
              fontSize: "0.875rem",
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              {apiError}
            </div>
          )}

          {/* Success */}
          {success && (
            <div style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1rem", borderRadius: "0.625rem", marginBottom: "1rem",
              background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#15803d",
              fontSize: "0.875rem",
            }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
              Logged in! Redirecting…
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Email address
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`input-base${errors.email ? " input-error" : ""}`}
                disabled={isLoading || success}
              />
              {errors.email && (
                <p style={{ color: "var(--stale-500)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                <label htmlFor="login-password" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "0.8rem", color: "var(--brand-600)", fontWeight: 500 }}>
                  Forgot password?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  className={`input-base${errors.password ? " input-error" : ""}`}
                  style={{ paddingRight: "2.75rem" }}
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute", right: "0.75rem", top: "50%",
                    transform: "translateY(-50%)", background: "none", border: "none",
                    cursor: "pointer", color: "var(--muted)", padding: 0,
                    display: "flex", alignItems: "center",
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: "var(--stale-500)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading || success}
              style={{ width: "100%", marginTop: "0.25rem" }}
            >
              {isLoading ? (
                <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Logging in…</>
              ) : (
                <><LogIn size={18} /> Log In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--foreground-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "var(--brand-600)", fontWeight: 700 }}>
              Sign up free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
