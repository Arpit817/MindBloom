"use client";

import Link from "next/link";
import { BookOpen, Edit3, Trash2, Clock, Sparkles, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

/** Returns freshness label + CSS class based on freshnessScore */
function getFreshness(score) {
  if (score >= 80) return { label: "Fresh", className: "freshness-badge-fresh" };
  if (score >= 50) return { label: "Moderate", className: "freshness-badge-moderate" };
  if (score >= 20) return { label: "Stale", className: "freshness-badge-stale" };
  return { label: "Critical", className: "freshness-badge-critical" };
}

export default function NoteCard({ note, subject, onEdit, onDelete }) {
  const freshness = getFreshness(note.freshnessScore);
  const updatedAgo = note.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : "just now";

  const subjectColor = subject?.color || "#0e87e8";
  const previewText = note.content
    ? note.content.replace(/\n/g, " ").slice(0, 120) + (note.content.length > 120 ? "…" : "")
    : "No content yet. Click to start writing.";

  return (
    <div
      className="card group relative flex flex-col justify-between overflow-hidden bg-white border border-slate-200/80 hover:border-slate-300"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      {/* Left accent border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5"
        style={{ background: subjectColor }}
      />

      <div className="pl-5 pr-4 pt-4 pb-3 flex flex-col flex-1">
        {/* Top row: subject badge + action buttons */}
        <div className="flex items-center justify-between gap-2 mb-2">
          {subject && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold max-w-[120px] truncate"
              style={{
                backgroundColor: `${subjectColor}14`,
                color: subjectColor,
                border: `1px solid ${subjectColor}30`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: subjectColor }}
              />
              <span className="truncate">{subject.name}</span>
            </span>
          )}

          <div className="flex items-center gap-1 ml-auto opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(note)}
              title="Edit Note"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={`Edit ${note.title}`}
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(note)}
              title="Delete Note"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label={`Delete ${note.title}`}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1.5"
          title={note.title}
        >
          {note.title}
        </h3>

        {/* Content preview */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {previewText}
        </p>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Freshness badge */}
            <span className={`badge text-[11px] ${freshness.className}`}>
              <Sparkles size={11} />
              {freshness.label}
            </span>
            {/* Review stage */}
            <span className="text-[11px] text-slate-400 font-medium">
              Stage {note.reviewStage}/10
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Clock size={11} />
            <span>{updatedAgo}</span>
          </div>
        </div>
      </div>

      {/* Open / Edit link */}
      <Link
        href={`/notes/${note._id}`}
        className="flex items-center justify-between px-5 py-3 bg-slate-50 text-xs font-semibold text-brand-600 hover:bg-blue-50 hover:text-brand-700 transition-colors border-t border-slate-100 group/link"
      >
        <span className="flex items-center gap-1.5">
          <BookOpen size={13} />
          Open & Edit Note
        </span>
        <ArrowRight size={13} className="transition-transform group-hover/link:translate-x-0.5" />
      </Link>
    </div>
  );
}
