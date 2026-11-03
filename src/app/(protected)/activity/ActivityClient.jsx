"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Sparkles,
  BookOpen,
  Compass,
  Layers,
  Clock,
  ArrowRight,
  Loader2,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const ACTIVITY_TYPE_CONFIG = {
  review_completed: {
    label: "Review Completed",
    icon: Sparkles,
    badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
  },
  plan_item_completed: {
    label: "Roadmap Item Done",
    icon: Compass,
    badgeBg: "bg-blue-50 text-brand-700 border-blue-200",
  },
  note_created: {
    label: "Note Created",
    icon: BookOpen,
    badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  default: {
    label: "Study Activity",
    icon: Activity,
    badgeBg: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export default function ActivityClient() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    let cancelled = false;
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const url = filterType === "all" ? "/api/activity" : `/api/activity?type=${filterType}`;
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Failed to load activity logs:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [filterType]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Activity History
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-600 border border-blue-200">
              {logs.length} logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Audit trail of your study milestones, reviews, and learning roadmap achievements.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All" },
            { id: "review_completed", label: "Reviews" },
            { id: "plan_item_completed", label: "Roadmap Items" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center">
          <Loader2 size={32} className="animate-spin text-brand-600 mb-2" />
          <p className="text-xs text-slate-400">Loading activity timeline...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="card p-12 bg-white border border-slate-200/80 text-center my-6">
          <Activity size={36} className="text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No activities recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Complete daily reviews, create notes, or tick off roadmap days to build your study history.
          </p>
          <Link href="/review" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
            <Sparkles size={14} />
            <span>Start Reviewing</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {logs.map((log) => {
            const config = ACTIVITY_TYPE_CONFIG[log.activityType] || ACTIVITY_TYPE_CONFIG.default;
            const IconComponent = config.icon;
            const timeAgo = log.createdAt
              ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })
              : "recently";

            return (
              <div
                key={log._id}
                className="card p-4 sm:p-5 bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex items-start gap-4"
                style={{ borderRadius: "var(--radius-xl)" }}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${config.badgeBg}`}
                >
                  <IconComponent size={18} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${config.badgeBg}`}
                    >
                      {config.label}
                    </span>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-800 break-words mb-1">
                    {log.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    {log.subject && (
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: log.subject.color || "#0e87e8" }}
                        />
                        <span className="font-medium text-slate-600">{log.subject.name}</span>
                      </span>
                    )}

                    {log.noteTitle && (
                      <span className="truncate max-w-[200px]">Note: {log.noteTitle}</span>
                    )}

                    {log.planTitle && (
                      <span className="truncate max-w-[200px]">Plan: {log.planTitle}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

