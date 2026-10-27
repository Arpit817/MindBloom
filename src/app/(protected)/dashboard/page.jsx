"use client";

import Link from "next/link";
import {
  Layers,
  BookOpen,
  Sparkles,
  ArrowRight,
  Plus,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2
          size={32}
          style={{ animation: "spin 1s linear infinite", color: "var(--brand-500)" }}
        />
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] ?? "Learner";
  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome Banner */}
      <div
        className="card p-6 sm:p-8 mb-8 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0e2a4a 100%)",
          border: "none",
        }}
      >
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(14,135,232,0.3) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold mb-3">
            <span>📅 {todayStr}</span>
            <span>•</span>
            <span>Stage 4: Subjects Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Ready to retain more with active recall? Start by setting up your study subjects,
            or jump right into your flashcard review decks.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/subjects"
              className="btn btn-primary btn-sm flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <Layers size={16} />
              <span>Manage Subjects</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Action / Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {/* Subjects Card */}
        <div className="card p-5 bg-white border border-slate-200/80 flex flex-col justify-between hover:border-brand-500/40 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-4">
              <Layers size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Study Subjects</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Organize notes into color-coded courses and view note counts at a glance.
            </p>
          </div>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Go to Subjects</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Notes Preview Card */}
        <div className="card p-5 bg-white border border-slate-200/80 flex flex-col justify-between opacity-85">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <BookOpen size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Notes & Flashcards</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Coming Stage 5
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Write rich notes, upload diagrams to S3, and generate active recall questions.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Stage 5 will unlock note creation</span>
        </div>

        {/* Spaced Repetition Card */}
        <div className="card p-5 bg-white border border-slate-200/80 flex flex-col justify-between opacity-85">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Spaced Repetition</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Coming Stage 6
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              10-stage exponential intervals calculate when notes need review to beat forgetting.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">Stage 6 will unlock review engine</span>
        </div>
      </div>
    </div>
  );
}
