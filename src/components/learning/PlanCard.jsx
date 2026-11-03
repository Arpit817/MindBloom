"use client";

import Link from "next/link";
import { Compass, CheckCircle2, ArrowRight, Trash2, Edit3, Calendar } from "lucide-react";

export default function PlanCard({ plan, onEdit, onDelete }) {
  const subjectColor = plan.subject?.color || "#0e87e8";
  const progressPct = plan.stats?.progressPct || 0;
  const completedCount = plan.stats?.completedItems || 0;
  const totalCount = plan.stats?.totalItems || 0;

  return (
    <div
      className="card group relative flex flex-col justify-between overflow-hidden bg-white border border-slate-200/80 hover:border-slate-300 transition-all hover:shadow-md"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      {/* Top Subject Color Accent Line */}
      <div
        className="h-1.5 w-full"
        style={{
          background: `linear-gradient(90deg, ${subjectColor}, ${subjectColor}80)`,
        }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header: Subject & Action buttons */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {plan.subject ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold max-w-[140px] truncate"
              style={{
                backgroundColor: `${subjectColor}14`,
                color: subjectColor,
                border: `1px solid ${subjectColor}33`,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: subjectColor }} />
              <span className="truncate">{plan.subject.name}</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
              General
            </span>
          )}

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(plan)}
              title="Edit Plan"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(plan)}
              title="Delete Plan"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1.5"
          title={plan.title}
        >
          {plan.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {plan.description || "Structured day-by-day learning roadmap."}
        </p>

        {/* Progress Bar & Stats */}
        <div className="mt-auto pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-600">
              {completedCount} of {totalCount} completed
            </span>
            <span className="font-bold text-brand-600">{progressPct}%</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-brand-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="capitalize flex items-center gap-1">
              <Compass size={12} />
              {plan.planType || "Day-wise"}
            </span>
            {plan.resource && (
              <span className="truncate max-w-[120px] text-slate-500 font-medium">
                📺 {plan.resource.title}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Link to Roadmap */}
      <Link
        href={`/learning/${plan._id}`}
        className="flex items-center justify-between px-5 py-3 bg-slate-50 text-xs font-semibold text-brand-600 hover:bg-blue-50 hover:text-brand-700 transition-colors border-t border-slate-100 group/link"
      >
        <span className="flex items-center gap-1.5">
          <Compass size={13} />
          Open Plan Roadmap
        </span>
        <ArrowRight size={13} className="transition-transform group-hover/link:translate-x-0.5" />
      </Link>
    </div>
  );
}

