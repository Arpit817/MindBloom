"use client";

import { useState } from "react";
import { X, Check, Loader2, Palette } from "lucide-react";

export const PRESET_COLORS = [
  { hex: "#0e87e8", name: "MindBloom Blue" },
  { hex: "#8b5cf6", name: "Violet" },
  { hex: "#10b981", name: "Emerald" },
  { hex: "#f59e0b", name: "Amber" },
  { hex: "#f43f5e", name: "Rose" },
  { hex: "#06b6d4", name: "Cyan" },
  { hex: "#ec4899", name: "Pink" },
  { hex: "#6366f1", name: "Indigo" },
  { hex: "#14b8a6", name: "Teal" },
  { hex: "#64748b", name: "Slate" },
];

function SubjectModalForm({ subject, onClose, onSuccess }) {
  const [name, setName] = useState(subject?.name || "");
  const [color, setColor] = useState(subject?.color || PRESET_COLORS[0].hex);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(subject && subject._id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a subject name.");
      return;
    }

    if (trimmed.length > 80) {
      setError("Subject name cannot exceed 80 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/subjects/${subject._id}` : "/api/subjects";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed, color }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save subject.");
      }

      onSuccess(data.subject, isEdit);
      onClose();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="subject-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content p-6 max-w-md w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 id="subject-modal-title" className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Subject" : "Create New Subject"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? "Update your subject title and color identifier."
                : "Organize notes and review cards under a dedicated topic."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Subject Name */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="subject-name" className="text-xs font-semibold text-slate-700">
                Subject Name <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{name.length}/80</span>
            </div>
            <input
              id="subject-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Chemistry, Algorithms, History..."
              maxLength={80}
              disabled={loading}
              autoFocus
              className="input-base"
              required
            />
          </div>

          {/* Color Palette */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Palette size={14} className="text-slate-500" />
                Color Theme
              </label>
              <span className="text-[11px] font-mono font-medium text-slate-400 uppercase">
                {color}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2.5">
              {PRESET_COLORS.map((preset) => {
                const isSelected = color.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.hex}
                    type="button"
                    onClick={() => setColor(preset.hex)}
                    disabled={loading}
                    title={preset.name}
                    className="h-10 rounded-xl relative transition-all flex items-center justify-center group"
                    style={{
                      backgroundColor: preset.hex,
                      boxShadow: isSelected
                        ? `0 0 0 2px white, 0 0 0 4px ${preset.hex}`
                        : "none",
                    }}
                  >
                    {isSelected && (
                      <Check size={16} className="text-white drop-shadow-md" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Pill */}
          <div className="pt-2 pb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
              Card Preview
            </span>
            <div
              className="p-3 rounded-xl border flex items-center gap-3 transition-colors"
              style={{
                backgroundColor: `${color}0D`,
                borderColor: `${color}33`,
              }}
            >
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: color }}
              />
              <span
                className="text-sm font-semibold truncate"
                style={{ color: "#0f172a" }}
              >
                {name.trim() || "Subject Name Preview"}
              </span>
              <span
                className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                }}
              >
                {subject?.noteCount || 0} notes
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-sm min-w-[100px]"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Subject"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function SubjectModal({ isOpen, onClose, subject = null, onSuccess }) {
  if (!isOpen) return null;

  return (
    <SubjectModalForm
      key={subject?._id || "new-subject"}
      subject={subject}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
