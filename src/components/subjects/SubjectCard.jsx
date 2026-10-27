"use client";

import Link from "next/link";
import { Edit2, Trash2, BookOpen, ArrowRight } from "lucide-react";

export default function SubjectCard({ subject, onEdit, onDelete }) {
  const color = subject.color || "#0e87e8";
  const noteCount = subject.noteCount || 0;

  return (
    <div
      className="card group relative flex flex-col justify-between overflow-hidden border border-slate-200/80 bg-white hover:border-slate-300 transition-all duration-200 hover:shadow-lg"
      style={{
        borderRadius: "var(--radius-xl)",
      }}
    >
      {/* Top Color Accent Line */}
      <div
        className="h-1.5 w-full transition-all group-hover:h-2"
        style={{
          background: `linear-gradient(90deg, ${color}, ${color}99)`,
        }}
      />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row: Color Tag & Action Buttons */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${color}14`,
              color: color,
              border: `1px solid ${color}33`,
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>Subject</span>
          </div>

          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(subject)}
              title="Edit Subject"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label={`Edit ${subject.name}`}
            >
              <Edit2 size={15} />
            </button>
            <button
              onClick={() => onDelete(subject)}
              title="Delete Subject"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              aria-label={`Delete ${subject.name}`}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-2"
          title={subject.name}
        >
          {subject.name}
        </h3>

        {/* Stats */}
        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <BookOpen size={14} className="text-slate-400" />
            <span>
              {noteCount} {noteCount === 1 ? "note" : "notes"}
            </span>
          </div>

          <Link
            href={`/notes?subjectId=${subject._id}`}
            className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700 transition-colors group/link"
          >
            <span>View Notes</span>
            <ArrowRight
              size={13}
              className="transition-transform group-hover/link:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
