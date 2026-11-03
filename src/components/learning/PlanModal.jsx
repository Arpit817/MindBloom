"use client";

import { useState } from "react";
import { X, Loader2, Layers, Calendar, Compass } from "lucide-react";

function PlanModalForm({ plan, subjects = [], resources = [], onClose, onSuccess }) {
  const isEdit = Boolean(plan && plan._id);
  const [title, setTitle] = useState(plan?.title || "");
  const [description, setDescription] = useState(plan?.description || "");
  const [planType, setPlanType] = useState(plan?.planType || "day-wise");
  const [subjectId, setSubjectId] = useState(plan?.subject?._id || plan?.subjectId || "");
  const [resourceId, setResourceId] = useState(plan?.resource?._id || plan?.resourceId || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Plan title is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const url = isEdit ? `/api/plans/${plan._id}` : "/api/plans";
      const method = isEdit ? "PATCH" : "POST";
      const body = {
        title: title.trim(),
        description: description.trim(),
        planType,
        subjectId: subjectId || null,
        resourceId: resourceId || null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save plan.");

      onSuccess(data.plan, isEdit);
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
      aria-labelledby="plan-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="modal-content p-6 max-w-lg w-full animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h2 id="plan-modal-title" className="text-xl font-bold text-slate-900">
              {isEdit ? "Edit Learning Plan" : "Create Learning Plan"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Build a structured day-by-day study roadmap to track syllabus progress.
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
          {/* Title */}
          <div>
            <label htmlFor="plan-title" className="text-xs font-semibold text-slate-700 block mb-1.5">
              Plan Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="plan-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 30-Day Organic Chemistry Roadmap"
              disabled={loading}
              autoFocus
              className="input-base text-sm"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="plan-desc" className="text-xs font-semibold text-slate-700 block mb-1.5">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="plan-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics and goals are covered in this plan?"
              disabled={loading}
              rows={3}
              className="input-base text-sm resize-y"
            />
          </div>

          {/* Grid row: Plan Type & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Plan Type */}
            <div>
              <label htmlFor="plan-type" className="text-xs font-semibold text-slate-700 block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Compass size={13} className="text-slate-400" />
                  Format
                </span>
              </label>
              <select
                id="plan-type"
                value={planType}
                onChange={(e) => setPlanType(e.target.value)}
                disabled={loading}
                className="input-base text-sm"
              >
                <option value="day-wise">Day-wise (Day 1, Day 2...)</option>
                <option value="step-wise">Step-wise (Step 1, Step 2...)</option>
                <option value="custom">Custom Schedule</option>
              </select>
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="plan-subject" className="text-xs font-semibold text-slate-700 block mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers size={13} className="text-slate-400" />
                  Subject
                </span>
              </label>
              <select
                id="plan-subject"
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
          </div>

          {/* Optional Linked Resource */}
          {resources.length > 0 && (
            <div>
              <label htmlFor="plan-resource" className="text-xs font-semibold text-slate-700 block mb-1.5">
                Attach Learning Resource <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <select
                id="plan-resource"
                value={resourceId}
                onChange={(e) => setResourceId(e.target.value)}
                disabled={loading}
                className="input-base text-sm"
              >
                <option value="">None</option>
                {resources.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.platform === "YouTube" ? "📺" : "🔗"} {r.title}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                "Create Plan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PlanModal({ isOpen, onClose, plan = null, subjects = [], resources = [], onSuccess }) {
  if (!isOpen) return null;

  return (
    <PlanModalForm
      key={plan?._id || "new-plan"}
      plan={plan}
      subjects={subjects}
      resources={resources}
      onClose={onClose}
      onSuccess={onSuccess}
    />
  );
}

