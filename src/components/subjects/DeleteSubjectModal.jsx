"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteSubjectModal({ isOpen, onClose, subject, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !subject) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/subjects/${subject._id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete subject.");
      }

      onSuccess(subject._id);
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
      aria-labelledby="delete-subject-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content p-6 max-w-sm w-full animate-fade-in text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} />
        </div>

        <h3 id="delete-subject-modal-title" className="text-lg font-bold text-slate-900 mb-1">
          Delete Subject?
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Are you sure you want to delete <span className="font-semibold text-slate-800">“{subject.name}”</span>?
          {subject.noteCount > 0 ? (
            <span className="block mt-1 text-rose-600 font-medium">
              ⚠️ This will also delete {subject.noteCount} associated note{subject.noteCount > 1 ? "s" : ""}. This action cannot be undone.
            </span>
          ) : (
            <span className="block mt-1">This action cannot be undone.</span>
          )}
        </p>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-secondary btn-sm flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="btn btn-danger btn-sm flex-1"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
