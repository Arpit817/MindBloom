"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Compass,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  ExternalLink,
  Video,
  Calendar,
  Layers,
  Sparkles,
  Award,
  X,
} from "lucide-react";

export default function PlanDetailClient({ planId }) {
  const [plan, setPlan] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  // New Item State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemDay, setNewItemDay] = useState(1);
  const [addingLoading, setAddingLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchPlanDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/plans/${planId}`);
        const data = await res.json();
        if (!cancelled) {
          if (res.ok && data.success) {
            setPlan(data.plan);
            setItems(data.items || []);
            setNewItemDay((data.items?.length || 0) + 1);
          } else {
            setError(data.message || "Failed to load plan.");
          }
        }
      } catch {
        if (!cancelled) setError("Network error loading plan.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPlanDetail();
    return () => {
      cancelled = true;
    };
  }, [planId]);

  const handleToggleItem = async (item) => {
    setTogglingId(item._id);
    try {
      const nextCompleted = !item.completed;
      const res = await fetch(`/api/plans/${planId}/items/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) =>
          prev.map((i) => (i._id === item._id ? { ...i, completed: nextCompleted } : i))
        );
        // update plan stats
        setPlan((prev) => {
          if (!prev) return prev;
          const nextCompletedCount = prev.stats.completedItems + (nextCompleted ? 1 : -1);
          const total = prev.stats.totalItems;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              completedItems: nextCompletedCount,
              progressPct: total > 0 ? Math.round((nextCompletedCount / total) * 100) : 0,
            },
          };
        });
      }
    } catch (err) {
      console.error("Failed to toggle item:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    setAddingLoading(true);
    try {
      const res = await fetch(`/api/plans/${planId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newItemTitle.trim(),
          description: newItemDesc.trim(),
          dayNumber: Number(newItemDay) || items.length + 1,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setItems((prev) => [...prev, data.item]);
        setPlan((prev) => {
          if (!prev) return prev;
          const total = prev.stats.totalItems + 1;
          const completed = prev.stats.completedItems;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              totalItems: total,
              progressPct: total > 0 ? Math.round((completed / total) * 100) : 0,
            },
          };
        });
        setNewItemTitle("");
        setNewItemDesc("");
        setNewItemDay(items.length + 2);
        setIsAddingItem(false);
      }
    } catch (err) {
      console.error("Failed to add item:", err);
    } finally {
      setAddingLoading(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const res = await fetch(`/api/plans/${planId}/items/${itemId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const deletedItem = items.find((i) => i._id === itemId);
        setItems((prev) => prev.filter((i) => i._id !== itemId));
        setPlan((prev) => {
          if (!prev) return prev;
          const total = Math.max(0, prev.stats.totalItems - 1);
          const completed = prev.stats.completedItems - (deletedItem?.completed ? 1 : 0);
          return {
            ...prev,
            stats: {
              totalItems: total,
              completedItems: completed,
              progressPct: total > 0 ? Math.round((completed / total) * 100) : 0,
            },
          };
        });
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Plan not found</h2>
        <p className="text-sm text-slate-500 mb-4">{error || "Could not load learning plan."}</p>
        <Link href="/learning" className="btn btn-primary btn-sm">
          <ArrowLeft size={15} />
          Back to Plans
        </Link>
      </div>
    );
  }

  const subjectColor = plan.subject?.color || "#0e87e8";
  const progressPct = plan.stats?.progressPct || 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/learning"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Learning Hub</span>
        </Link>

        {plan.subject && (
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: `${subjectColor}14`,
              color: subjectColor,
              border: `1px solid ${subjectColor}33`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: subjectColor }} />
            <span>{plan.subject.name}</span>
          </span>
        )}
      </div>

      {/* Hero Header Card */}
      <div
        className="card p-6 sm:p-8 bg-white border border-slate-200/80 mb-6 shadow-sm overflow-hidden relative"
        style={{ borderRadius: "var(--radius-xl)" }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ background: subjectColor }}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-600 text-[11px] font-bold border border-blue-200 capitalize">
                {plan.planType || "Day-wise"}
              </span>
              {progressPct === 100 && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center gap-1 border border-emerald-200">
                  <Award size={12} /> Plan Completed!
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              {plan.title}
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed mb-4">
              {plan.description || "Follow this syllabus plan step-by-step to stay on track."}
            </p>

            {plan.resource && (
              <a
                href={plan.resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors"
              >
                {plan.resource.platform === "YouTube" ? <Video size={14} /> : <ExternalLink size={14} />}
                <span>Resource: {plan.resource.title}</span>
              </a>
            )}
          </div>

          {/* Progress Circular / Summary widget */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-center min-w-[160px] self-start sm:self-auto">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Overall Progress
            </p>
            <p className="text-3xl font-extrabold text-brand-600 mb-1">{progressPct}%</p>
            <p className="text-xs font-medium text-slate-500">
              {plan.stats.completedItems} / {plan.stats.totalItems} done
            </p>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-6 overflow-hidden">
          <div
            className="bg-brand-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Checklist Timeline Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Roadmap Items</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {items.length}
          </span>
        </h2>

        {!isAddingItem && (
          <button
            type="button"
            onClick={() => setIsAddingItem(true)}
            className="btn btn-primary btn-sm flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Day / Topic</span>
          </button>
        )}
      </div>

      {/* Add Item Inline Form */}
      {isAddingItem && (
        <form
          onSubmit={handleAddItem}
          className="p-4 sm:p-5 rounded-2xl bg-white border border-brand-200 shadow-sm mb-4 animate-fade-in flex flex-col gap-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              New Plan Day / Step
            </span>
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="sm:col-span-1">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Day / Step #</label>
              <input
                type="number"
                value={newItemDay}
                onChange={(e) => setNewItemDay(e.target.value)}
                min={1}
                className="input-base text-sm"
                required
              />
            </div>
            <div className="sm:col-span-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                Topic / Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Electrophilic Aromatic Substitution mechanism"
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                className="input-base text-sm"
                autoFocus
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Instructions / Subtopics <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              placeholder="e.g. Watch video, write summary notes, practice 5 questions."
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              rows={2}
              className="input-base text-sm resize-y"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingItem(false)}
              disabled={addingLoading}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingLoading}
              className="btn btn-primary btn-sm min-w-[100px]"
            >
              {addingLoading ? (
                <>
                  <Loader2 size={13} className="animate-spin" /> Adding...
                </>
              ) : (
                "Add to Plan"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Items List */}
      {items.length === 0 && !isAddingItem ? (
        <div className="card p-12 bg-white border border-slate-200/80 text-center my-4">
          <Compass size={32} className="text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">No items added yet</h3>
          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
            Click &ldquo;Add Day / Topic&rdquo; to build your structured study timeline.
          </p>
          <button
            type="button"
            onClick={() => setIsAddingItem(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus size={14} />
            <span>Add First Day</span>
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => (
            <div
              key={item._id}
              className={`card p-4 sm:p-5 border transition-all flex items-start justify-between gap-4 group ${
                item.completed
                  ? "bg-slate-50/70 border-slate-200 opacity-80"
                  : "bg-white border-slate-200/90 hover:border-brand-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Toggle checkbox button */}
                <button
                  type="button"
                  onClick={() => handleToggleItem(item)}
                  disabled={togglingId === item._id}
                  className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors shrink-0"
                  aria-label={item.completed ? "Mark incomplete" : "Mark completed"}
                >
                  {togglingId === item._id ? (
                    <Loader2 size={20} className="animate-spin text-brand-600" />
                  ) : item.completed ? (
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  ) : (
                    <Circle size={20} className="hover:text-emerald-500" />
                  )}
                </button>

                {/* Day Badge & Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        item.completed
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-blue-50 text-brand-700 border border-blue-200"
                      }`}
                    >
                      {plan.planType === "step-wise" ? "Step" : "Day"} {item.dayNumber || idx + 1}
                    </span>
                    {item.completed && (
                      <span className="text-[11px] text-emerald-600 font-semibold">Done</span>
                    )}
                  </div>

                  <h3
                    className={`text-sm sm:text-base font-bold ${
                      item.completed ? "line-through text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>

                  {item.description && (
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        item.completed ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Delete button */}
              <button
                type="button"
                onClick={() => handleDeleteItem(item._id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all shrink-0"
                title="Delete item"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

