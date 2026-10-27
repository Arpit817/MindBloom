"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Eye, EyeOff, UserPlus, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["", "#f43f5e", "#f59e0b", "#3b82f6", "#10b981"];

function getPasswordStrength(pwd) {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

export default function SignupPage() {
  const router = useRouter();
  const { signup, user } = useAuth();

  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(formData.password);

  // Already logged in — redirect
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      errs.name = "Name must be at least 2 characters.";
    if (!formData.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errs.email = "Enter a valid email address.";
    if (!formData.password) errs.password = "Password is required.";
    else if (formData.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (formData.confirm !== formData.password)
      errs.confirm = "Passwords do not match.";
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
      await signup(formData.name, formData.email, formData.password);
      setSuccess(true);
      setTimeout(() => router.replace("/dashboard"), 800);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-10" style={{ background: "var(--bg)" }}>
      {/* Background decorations */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(139,92,246,0.1), transparent)",
      }} />

      <div className="w-full max-w-md animate-fade-in" style={{ position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.625rem", marginBottom: "2rem" }}>
          <div style={{
            width: "2.75rem", height: "2.75rem", borderRadius: "0.875rem",
            background: "linear-gradient(135deg,#0e87e8,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(139,92,246,0.35)",
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
              Start learning smarter 🌱
            </h1>
            <p style={{ color: "var(--foreground-muted)", fontSize: "0.9rem" }}>
              Create your free account and begin blooming.
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
              Account created! Taking you to your dashboard…
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Name */}
            <div>
              <label htmlFor="signup-name" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Full name
              </label>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Alex Johnson"
                className={`input-base${errors.name ? " input-error" : ""}`}
                disabled={isLoading || success}
              />
              {errors.name && (
                <p style={{ color: "var(--stale-500)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="signup-email" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Email address
              </label>
              <input
                id="signup-email"
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
              <label htmlFor="signup-password" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
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
              {/* Strength meter */}
              {formData.password && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: "4px", marginBottom: "0.25rem" }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: "4px", borderRadius: "99px",
                        background: i <= strength ? STRENGTH_COLORS[strength] : "#e2e8f0",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: "0.75rem", color: STRENGTH_COLORS[strength] || "var(--muted)" }}>
                    {strength > 0 && STRENGTH_LABELS[strength]}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="signup-confirm" style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.375rem" }}>
                Confirm password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="signup-confirm"
                  name="confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.confirm}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  className={`input-base${errors.confirm ? " input-error" : ""}`}
                  style={{ paddingRight: "2.75rem" }}
                  disabled={isLoading || success}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    position: "absolute", right: "0.75rem", top: "50%",
                    transform: "translateY(-50%)", background: "none", border: "none",
                    cursor: "pointer", color: "var(--muted)", padding: 0,
                    display: "flex", alignItems: "center",
                  }}
                  aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {errors.confirm && (
                <p style={{ color: "var(--stale-500)", fontSize: "0.8rem", marginTop: "0.25rem" }}>{errors.confirm}</p>
              )}
            </div>

            {/* Submit */}
            <button
              id="signup-submit"
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={isLoading || success}
              style={{ width: "100%", marginTop: "0.25rem", background: "linear-gradient(135deg,#0e87e8,#8b5cf6)" }}
            >
              {isLoading ? (
                <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Creating account…</>
              ) : (
                <><UserPlus size={18} /> Create Account</>
              )}
            </button>

            <p style={{ fontSize: "0.75rem", color: "var(--foreground-muted)", textAlign: "center", lineHeight: 1.5 }}>
              By signing up, you agree to our{" "}
              <Link href="/terms" style={{ color: "var(--brand-600)" }}>Terms</Link> and{" "}
              <Link href="/privacy" style={{ color: "var(--brand-600)" }}>Privacy Policy</Link>.
            </p>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", margin: "1.5rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>already have an account?</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          <Link
            href="/login"
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            Log In Instead
          </Link>
        </div>
      </div>
    </div>
  );
}
