"use client";

import { Video, Link2, ExternalLink, Trash2, Edit3 } from "lucide-react";

export default function ResourceCard({ resource, onEdit, onDelete }) {
  const isYoutube = resource.platform === "YouTube";
  const subjectColor = resource.subject?.color || "#0e87e8";

  return (
    <div
      className="card group relative flex flex-col justify-between overflow-hidden bg-white border border-slate-200/80 hover:border-slate-300 transition-all p-5 hover:shadow-md"
      style={{ borderRadius: "var(--radius-xl)" }}
    >
      <div>
        {/* Top Header: Platform Icon + Subject Badge + Actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isYoutube ? "bg-rose-50 text-rose-600" : "bg-blue-50 text-brand-600"
              }`}
            >
              {isYoutube ? <Video size={16} /> : <Link2 size={16} />}
            </div>
            {resource.subject ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold truncate max-w-[120px]"
                style={{
                  backgroundColor: `${subjectColor}14`,
                  color: subjectColor,
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjectColor }} />
                <span className="truncate">{resource.subject.name}</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500">
                General
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(resource)}
              title="Edit Resource"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <Edit3 size={14} />
            </button>
            <button
              onClick={() => onDelete(resource)}
              title="Delete Resource"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3
          className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-2 mb-1.5"
          title={resource.title}
        >
          {resource.title}
        </h3>

        {/* Description */}
        {resource.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {resource.description}
          </p>
        )}
      </div>

      {/* External Link Button */}
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-brand-600 hover:text-brand-700 text-xs font-semibold transition-colors group/btn"
      >
        <span className="truncate flex-1 mr-2">{resource.url}</span>
        <ExternalLink size={13} className="shrink-0 group-hover/btn:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
}

