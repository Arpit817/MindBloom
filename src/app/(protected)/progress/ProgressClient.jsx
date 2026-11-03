"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart2,
  Flame,
  Sparkles,
  Award,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  BookOpen,
  Loader2,
  Calendar,
} from "lucide-react";
import HeatmapGrid from "@/components/analytics/HeatmapGrid";
import StageDistributionChart from "@/components/analytics/StageDistributionChart";

export default function ProgressClient() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/analytics");
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setAnalytics(data.analytics);
        }
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAnalytics();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-brand-600" />
      </div>
    );
  }

  const {
    totalNotes = 0,
    totalReviews = 0,
    averageFreshness = 100,
    accuracyRate = 100,
    currentStreak = 0,
    stageDistribution = new Array(11).fill(0),
    masteryBreakdown = { learning: 0, retaining: 0, mastered: 0 },
    accuracy = { remembered: 0, partial: 0, forgot: 0 },
    heatmap = [],
  } = analytics || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Progress &amp; Retention Analytics
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Stage 8
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time insight into your memory health, review consistency, and Leitner stage mastery.
          </p>
        </div>

        <Link href="/review" className="btn btn-primary self-start sm:self-auto flex items-center gap-2 shadow-md">
          <Sparkles size={16} />
          <span>Start Review</span>
        </Link>
      </div>

      {/* Top 4 KPI Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Streak */}
        <div className="card p-5 bg-white border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Current Streak
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900 flex items-baseline gap-1">
              {currentStreak} <span className="text-xs text-slate-500 font-normal">days</span>
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              {currentStreak > 0 ? "Keep the flame burning!" : "Review today to start a streak!"}
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <Flame size={24} />
          </div>
        </div>

        {/* Memory Freshness Health */}
        <div className="card p-5 bg-white border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Memory Health
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {averageFreshness}%
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Average freshness score
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Total Reviews Done */}
        <div className="card p-5 bg-white border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Total Reviews
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {totalReviews}
            </h3>
            <p className="text-[11px] text-brand-600 font-medium mt-1">
              Across all flashcards
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-600 flex items-center justify-center">
            <Sparkles size={24} />
          </div>
        </div>

        {/* Recall Accuracy */}
        <div className="card p-5 bg-white border border-slate-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Recall Accuracy
            </p>
            <h3 className="text-2xl font-extrabold text-slate-900">
              {accuracyRate}%
            </h3>
            <p className="text-[11px] text-purple-600 font-medium mt-1">
              {accuracy.remembered} remembered
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award size={24} />
          </div>
        </div>
      </div>

      {/* 60-Day Memory Activity Heatmap */}
      <div className="card p-6 bg-white border border-slate-200/80 mb-8" style={{ borderRadius: "var(--radius-xl)" }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar size={16} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">60-Day Study Consistency Heatmap</h2>
              <p className="text-xs text-slate-500">Your daily review and learning activity graph.</p>
            </div>
          </div>
        </div>

        <HeatmapGrid heatmap={heatmap} />
      </div>

      {/* 2-Column Grid: Stage Distribution & Retention Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Stage Mastery Bar Chart */}
        <div className="card p-6 bg-white border border-slate-200/80 flex flex-col justify-between" style={{ borderRadius: "var(--radius-xl)" }}>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">Stage Distribution</h3>
              <span className="text-xs text-slate-400">Total Notes: {totalNotes}</span>
            </div>
            <p className="text-xs text-slate-500">
              Distribution of study notes across the 10 Leitner spaced repetition stages.
            </p>
          </div>

          <StageDistributionChart distribution={stageDistribution} />
        </div>

        {/* Mastery Tier Breakdown */}
        <div className="card p-6 bg-white border border-slate-200/80 flex flex-col justify-between" style={{ borderRadius: "var(--radius-xl)" }}>
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Mastery Progress Tiers</h3>
            <p className="text-xs text-slate-500 mb-6">
              Track how your knowledge transitions into permanent long-term memory.
            </p>

            <div className="flex flex-col gap-4">
              {/* Early Learning */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Early Learning (Stages 0–3)</span>
                  <span className="text-slate-500">{masteryBreakdown.learning} notes ({totalNotes > 0 ? Math.round((masteryBreakdown.learning / totalNotes) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-blue-400 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${totalNotes > 0 ? (masteryBreakdown.learning / totalNotes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Intermediate Retaining */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Retaining (Stages 4–7)</span>
                  <span className="text-slate-500">{masteryBreakdown.retaining} notes ({totalNotes > 0 ? Math.round((masteryBreakdown.retaining / totalNotes) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-brand-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${totalNotes > 0 ? (masteryBreakdown.retaining / totalNotes) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Mastered */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-700">Long-Term Mastered (Stages 8–10)</span>
                  <span className="text-purple-600 font-bold">{masteryBreakdown.mastered} notes ({totalNotes > 0 ? Math.round((masteryBreakdown.mastered / totalNotes) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${totalNotes > 0 ? (masteryBreakdown.mastered / totalNotes) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Accuracy Breakdown:</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 font-semibold">{accuracy.remembered} Good</span>
              <span className="text-amber-600 font-semibold">{accuracy.partial} Hard</span>
              <span className="text-rose-600 font-semibold">{accuracy.forgot} Again</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

