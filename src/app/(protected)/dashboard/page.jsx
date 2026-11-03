"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  BookOpen,
  Sparkles,
  ArrowRight,
  Plus,
  Loader2,
  Clock,
  CheckCircle2,
  HelpCircle,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchDashboardData = async () => {
      try {
        const [subRes, noteRes] = await Promise.all([
          fetch("/api/subjects"),
          fetch("/api/notes"),
        ]);
        const [subData, noteData] = await Promise.all([
          subRes.json(),
          noteRes.json(),
        ]);

        if (!cancelled) {
          if (subRes.ok && subData.success) {
            setSubjects(subData.subjects || []);
          }
          if (noteRes.ok && noteData.success) {
            setNotes(noteData.notes || []);
          }
        }
      } catch (err) {
        console.error("Dashboard data fetch error:", err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    };

    fetchDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

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

  const dueNotesCount = notes.filter(
    (n) => n.nextReviewAt && new Date(n.nextReviewAt) <= new Date()
  ).length;

  const subjectMap = {};
  for (const s of subjects) {
    subjectMap[s._id] = s;
  }

  const recentNotes = notes.slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Welcome Banner */}
      <div
        className="card p-6 sm:p-8 mb-8 text-white relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0e2a4a 100%)",
          border: "none",
          borderRadius: "var(--radius-xl)",
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
            <span className="flex items-center gap-1">
              <Compass size={12} /> Stage 7 Active: Learning Plans &amp; Resources
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed mb-6">
            Master your knowledge with active recall, spaced repetition, and structured day-by-day learning roadmaps.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/learning"
              className="btn btn-primary btn-sm flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <Compass size={16} />
              <span>Learning Hub</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/review"
              className="btn btn-secondary btn-sm flex items-center gap-2 bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700"
            >
              <Sparkles size={16} />
              <span>Review ({dueNotesCount} Due)</span>
            </Link>
            <Link
              href="/notes"
              className="btn btn-secondary btn-sm flex items-center gap-2 bg-slate-800/80 text-white border-slate-700 hover:bg-slate-700"
            >
              <BookOpen size={16} />
              <span>Notes ({notes.length})</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        {/* Subjects Stat */}
        <div className="card p-5 bg-white border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Active Subjects
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {loadingData ? "…" : subjects.length}
            </h3>
            <Link
              href="/subjects"
              className="text-xs text-brand-600 font-semibold inline-flex items-center gap-1 mt-2 hover:underline"
            >
              <span>View subjects</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <Layers size={22} />
          </div>
        </div>

        {/* Notes Stat */}
        <div className="card p-5 bg-white border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Created Notes
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {loadingData ? "…" : notes.length}
            </h3>
            <Link
              href="/notes"
              className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1 mt-2 hover:underline"
            >
              <span>Browse notes</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <BookOpen size={22} />
          </div>
        </div>

        {/* Due Reviews Stat */}
        <div className="card p-5 bg-white border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Due For Review
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {loadingData ? "…" : dueNotesCount}
            </h3>
            <Link
              href="/review"
              className="text-xs text-purple-600 font-semibold inline-flex items-center gap-1 mt-2 hover:underline"
            >
              <Sparkles size={12} />
              <span>Start daily review</span>
              <ArrowRight size={12} />
            </Link>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock size={22} />
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Subjects Card */}
        <div className="card p-5 bg-white border border-slate-200/80 flex flex-col justify-between hover:border-brand-500/40 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center mb-4">
              <Layers size={20} />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Study Subjects</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Organize notes into color-coded courses and view counts.
            </p>
          </div>
          <Link
            href="/subjects"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            <span>Manage Subjects</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Notes & Flashcards Card */}
        <div className="card p-5 bg-white border border-slate-200/80 flex flex-col justify-between hover:border-emerald-500/40 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <BookOpen size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Notes &amp; Cards</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Rich study notes, AWS S3 image diagrams, and flashcards.
            </p>
          </div>
          <Link
            href="/notes"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            <span>Open Notes ({notes.length})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Spaced Repetition Card */}
        <div className="card p-5 bg-white border border-slate-200/80 flex flex-col justify-between hover:border-purple-500/40 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Sparkles size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Spaced Review</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              10-stage exponential intervals to beat the forgetting curve.
            </p>
          </div>
          <Link
            href="/review"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-700"
          >
            <span>Review Cards ({dueNotesCount})</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {/* Learning Hub Card - STAGE 7 */}
        <div className="card p-5 bg-white border border-slate-200/80 flex flex-col justify-between hover:border-blue-500/40 transition-all">
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Compass size={20} />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-slate-900">Learning Plans</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Stage 7 Active
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Day-by-day study roadmaps and YouTube/web resource tracker.
            </p>
          </div>
          <Link
            href="/learning"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <span>Open Learning Hub</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* Recent Notes Preview Section */}
      <div className="card p-6 bg-white border border-slate-200/80">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Recent Notes</h2>
          </div>
          <Link
            href="/notes"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        {loadingData ? (
          <div className="py-8 flex justify-center">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : notes.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <p className="mb-3">No notes created yet.</p>
            <Link href="/notes" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
              <Plus size={14} />
              <span>Create Your First Note</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentNotes.map((note) => {
              const sub = subjectMap[note.subjectId];
              const subColor = sub?.color || "#0e87e8";
              return (
                <Link
                  key={note._id}
                  href={`/notes/${note._id}`}
                  className="py-3 px-2 flex items-center justify-between hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: subColor }}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                        {note.title}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {sub?.name || "General"} · Stage {note.reviewStage}/10 ·{" "}
                        {note.updatedAt
                          ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
                          : "recently"}
                      </p>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
