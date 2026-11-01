"use client";

import { useState } from "react";
import { X, Loader2, Layers } from "lucide-react";

function NoteModalForm({ subjects, note, onClose, onSuccess }) {
  const isEdit = Boolean(note && note._id);
  const [title, setTitle] = useState(note?.title || "");
  const [content, setContent] = useState(note?.content || "");
  const [subjectId, setSubjectId] = useState(
    note?.subjectId || (subjects.length > 0 ? subjects[0]._id : "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Note title is required.");
      return;
    }
    if (trimmedTitle.length > 150) {
      setError("Title cannot exceed 150 characters.");
      return;
    }
    if (!isEdit && !subjectId) {
      setError("Please select a subject.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/notes/${note._id}` : "/api/notes";
      const method = isEdit ? "PATCH" : "POST";
      const body = isEdit
        ? { title: trimmedTitle, content }
        : { subjectId, title: trimmedTitle, content };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save note.");
      }

      onSuccess(data.note, isEdit);
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
      aria-labelledby="note-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content p-6 max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 id="note-modal-title" className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Note" : "Create New Note"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEdit
                ? "Update the title and content of your note."
                : "Add a note to a subject. You can add images inside the note editor."}
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

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Subject selector (only on create) */}
          {!isEdit && (
            <div>
              <label htmlFor="note-subject" className="text-xs font-semibold text-slate-700 block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-slate-400" />
                  Subject <span className="text-rose-500">*</span>
                </span>
              </label>
              {subjects.length === 0 ? (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  No subjects yet.{" "}
                  <a href="/subjects" className="underline font-semibold">
                    Create a subject first
                  </a>{" "}
                  before adding notes.
                </div>
              ) : (
                <select
                  id="note-subject"
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={loading}
                  className="input-base text-sm"
                  required
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="note-title" className="text-xs font-semibold text-slate-700">
                Title <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">{title.length}/150</span>
            </div>
            <input
              id="note-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Nucleophilic Substitution Reactions"
              maxLength={150}
              disabled={loading}
              autoFocus
              className="input-base"
              required
            />
          </div>

          {/* Content */}
          <div>
            <label htmlFor="note-content" className="text-xs font-semibold text-slate-700 block mb-1.5">
              Content{" "}
              <span className="text-slate-400 font-normal">(optional — you can add more in the editor)</span>
            </label>
            <textarea
              id="note-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing your note here…"
              disabled={loading}
              rows={4}
              className="input-base resize-y min-h-[80px] text-sm"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Actions */}
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
              disabled={loading || (!isEdit && subjects.length === 0)}
              className="btn btn-primary btn-sm min-w-[110px]"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Create Note"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NoteModal({ isOpen, onClose, note = null, subjects = [], onSuccess }) {
  if (!isOpen) return null;

  return (
    <NoteModalForm
      key={note?._id || "new-note"}
      note={note}
      subjects={subjects}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}
