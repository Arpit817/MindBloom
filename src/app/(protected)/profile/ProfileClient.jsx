"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Mail,
  Lock,
  HardDrive,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Calendar,
  Layers,
  BookOpen,
  Compass,
  Database,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function ProfileClient() {
  const { user: authUser, logout, refetchUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Name form state
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/user/profile");
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setProfileData(data);
          setName(data.user.name);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSavingName(true);
    setNameError("");
    setNameSuccess("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update name.");

      setNameSuccess("Name updated successfully.");
      if (refetchUser) refetchUser();
      setTimeout(() => setNameSuccess(""), 4000);
    } catch (err) {
      setNameError(err.message || "Failed to update profile name.");
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setSavingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update password.");

      setPasswordSuccess("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 4000);
    } catch (err) {
      setPasswordError(err.message || "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-brand-600" />
      </div>
    );
  }

  const user = profileData?.user || authUser;
  const storage = profileData?.storage || {
    totalImages: 0,
    totalBytesUsed: 0,
    freeTierLimitBytes: 5 * 1024 * 1024 * 1024,
    freeTierUsedPct: 0,
    notesCount: 0,
    subjectsCount: 0,
    plansCount: 0,
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : "U";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Account &amp; Storage Profile
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Stage 9
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Manage your personal profile, security credentials, and AWS S3 / MongoDB free-tier space.
          </p>
        </div>

        <button
          onClick={logout}
          className="btn btn-secondary btn-sm flex items-center gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 self-start sm:self-auto"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* User Hero Banner */}
      <div
        className="card p-6 sm:p-8 bg-white border border-slate-200/80 mb-8 flex flex-col sm:flex-row items-center gap-6"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-extrabold text-white shrink-0 shadow-lg shadow-blue-500/20"
          style={{ background: "linear-gradient(135deg, #0e87e8, #8b5cf6)" }}
        >
          {initial}
        </div>

        <div className="flex-1 text-center sm:text-left min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 truncate">
              {user?.name}
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-brand-700 border border-blue-200">
              Verified Student
            </span>
          </div>

          <p className="text-sm text-slate-500 flex items-center justify-center sm:justify-start gap-1.5 mb-3">
            <Mail size={14} />
            <span>{user?.email}</span>
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar size={13} /> Member since {memberSince}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" /> Password Protected
            </span>
          </div>
        </div>
      </div>

      {/* Cloud & Free-Tier Storage Meters */}
      <div className="card p-6 sm:p-7 bg-white border border-slate-200/80 mb-8" style={{ borderRadius: "var(--radius-xl)" }}>
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <Cloud size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Cloud Storage &amp; Free Tier</h3>
            <p className="text-xs text-slate-500">
              Real-time space consumption across AWS S3 (5 GB Free) and MongoDB Atlas.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          {/* AWS S3 Free Tier Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <HardDrive size={14} className="text-amber-500" />
                  AWS S3 Diagram Storage
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                  5.0 GB Free Tier
                </span>
              </div>

              <p className="text-2xl font-extrabold text-slate-900 mb-1">
                {formatBytes(storage.totalBytesUsed)}
              </p>
              <p className="text-xs text-slate-500 mb-4">
                {storage.totalImages} uploaded note image{storage.totalImages === 1 ? "" : "s"}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1 font-semibold">
                <span>Usage ({storage.freeTierUsedPct}%)</span>
                <span>5.0 GB limit</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(2, storage.freeTierUsedPct)}%` }}
                />
              </div>
            </div>
          </div>

          {/* MongoDB Atlas M0 Sandbox Card */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Database size={14} className="text-emerald-600" />
                  MongoDB Atlas
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                  M0 Sandbox
                </span>
              </div>

              <p className="text-2xl font-extrabold text-slate-900 mb-1">
                {storage.notesCount + storage.subjectsCount + storage.plansCount}{" "}
                <span className="text-sm font-semibold text-slate-500">documents</span>
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Fast document indexing for all study materials
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 text-center">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Subjects</p>
                <p className="text-sm font-extrabold text-slate-800">{storage.subjectsCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Notes</p>
                <p className="text-sm font-extrabold text-slate-800">{storage.notesCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Plans</p>
                <p className="text-sm font-extrabold text-slate-800">{storage.plansCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column: Edit Profile & Change Password */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info Form */}
        <div className="card p-6 bg-white border border-slate-200/80" style={{ borderRadius: "var(--radius-xl)" }}>
          <h3 className="text-base font-bold text-slate-900 mb-1">Personal Details</h3>
          <p className="text-xs text-slate-500 mb-5">Update your display name.</p>

          {nameSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 size={15} />
              <span>{nameSuccess}</span>
            </div>
          )}

          {nameError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
              <AlertCircle size={15} />
              <span>{nameError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
            <div>
              <label htmlFor="user-name" className="text-xs font-semibold text-slate-700 block mb-1">
                Full Name
              </label>
              <input
                id="user-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={savingName}
                maxLength={60}
                className="input-base text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="input-base text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-400 mt-1">Email is tied to your account identity.</p>
            </div>

            <button
              type="submit"
              disabled={savingName || !name.trim() || name.trim() === user?.name}
              className="btn btn-primary btn-sm self-start min-w-[120px] mt-2"
            >
              {savingName ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card p-6 bg-white border border-slate-200/80" style={{ borderRadius: "var(--radius-xl)" }}>
          <h3 className="text-base font-bold text-slate-900 mb-1">Security &amp; Password</h3>
          <p className="text-xs text-slate-500 mb-5">Change your account password.</p>

          {passwordSuccess && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 size={15} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
              <AlertCircle size={15} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <div>
              <label htmlFor="curr-pass" className="text-xs font-semibold text-slate-700 block mb-1">
                Current Password
              </label>
              <input
                id="curr-pass"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={savingPassword}
                placeholder="••••••••"
                className="input-base text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="new-pass" className="text-xs font-semibold text-slate-700 block mb-1">
                New Password
              </label>
              <input
                id="new-pass"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={savingPassword}
                placeholder="At least 6 characters"
                minLength={6}
                className="input-base text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="conf-pass" className="text-xs font-semibold text-slate-700 block mb-1">
                Confirm New Password
              </label>
              <input
                id="conf-pass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={savingPassword}
                placeholder="••••••••"
                className="input-base text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
              className="btn btn-primary btn-sm self-start min-w-[140px] mt-2"
            >
              {savingPassword ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

