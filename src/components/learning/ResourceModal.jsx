"use client";

import { useState } from "react";
import { X, Loader2, Link2, Video, Layers } from "lucide-react";

function ResourceModalForm({ resource, subjects = [], onClose, onSuccess }) {
  const isEdit = Boolean(resource && resource._id);
  const [title, setTitle] = useState(resource?.title || "");
  const [url, setUrl] = useState(resource?.url || "");
  const [description, setDescription] = useState(resource?.description || "");
  const [platform, setPlatform] = useState(resource?.platform || "Other");
  const [resourceType, setResourceType] = useState(resource?.resourceType || "link");
  const [subjectId, setSubjectId] = useState(resource?.subject?._id || resource?.subjectId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUrlChange = (newUrl) => {
    setUrl(newUrl);
    if (newUrl.includes("youtube.com") || newUrl.includes("youtu.be")) {
      setPlatform("YouTube");
      if (newUrl.includes("list=")) {
        setResourceType("playlist");
      } else {
        setResourceType("video");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setError("Title and URL are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isEdit ? `/api/resources/${resource._id}` : "/api/resources";
      const method = isEdit ? "PATCH" : "POST";
      const body = {
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
        platform,
        resourceType,
        subjectId: subjectId || null,
      };

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save resource.");

      onSuccess(data.resource, isEdit);
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
      aria-labelledby="resource-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content p-6 max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 id="resource-modal-title" className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Resource" : "Add Study Resource"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Link YouTube tutorials, lecture playlists, or documentation to study with your notes.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* URL with auto-detection */}
          <div>
            <label htmlFor="resource-url" className="text-xs font-semibold text-slate-700 block mb-1.5">
              URL / Link <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="resource-url"
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or website link"
                disabled={loading}
                autoFocus
                className="input-base text-sm pl-9"
                required
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                {platform === "YouTube" ? (
                  <Video size={16} className="text-rose-500" />
                ) : (
                  <Link2 size={16} />
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="resource-title" className="text-xs font-semibold text-slate-700 block mb-1.5">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CS50 Lecture 1 — C & Memory"
              disabled={loading}
              className="input-base text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="resource-desc" className="text-xs font-semibold text-slate-700 block mb-1.5">
              Notes / Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="resource-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this resource cover?"
              disabled={loading}
              rows={2}
              className="input-base text-sm resize-y"
            />
          </div>

          {/* Subject & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="resource-subject" className="text-xs font-semibold text-slate-700 block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-slate-400" />
                  Subject
                </span>
              </label>
              <select
                id="resource-subject"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={loading}
                className="input-base text-sm"
              >
                <option value="">No Subject (General)</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="resource-platform" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Platform
              </label>
              <select
                id="resource-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={loading}
                className="input-base text-sm"
              >
                <option value="YouTube">YouTube</option>
                <option value="Other">Article / Website / Other</option>
              </select>
            </div>
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
                "Add Resource"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResourceModal({ isOpen, onClose, resource = null, subjects = [], onSuccess }) {
  if (!isOpen) return null;

  return (
    <ResourceModalForm
      key={resource?._id || "new-res"}
      resource={resource}
      subjects={subjects}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

