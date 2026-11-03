"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Compass,
  Link2,
  Plus,
  Search,
  Layers,
  Sparkles,
  BookOpen,
  Video,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import PlanCard from "@/components/learning/PlanCard";
import ResourceCard from "@/components/learning/ResourceCard";
import PlanModal from "@/components/learning/PlanModal";
import ResourceModal from "@/components/learning/ResourceModal";

export default function LearningClient() {
  const [activeTab, setActiveTab] = useState("plans"); // "plans" | "resources"
  const [plans, setPlans] = useState([]);
  const [resources, setResources] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState("");

  // Modals
  const [planModalState, setPlanModalState] = useState({ isOpen: false, plan: null });
  const [resourceModalState, setResourceModalState] = useState({ isOpen: false, resource: null });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      try {
        setLoading(true);
        const [plansRes, resRes, subRes] = await Promise.all([
          fetch("/api/plans"),
          fetch("/api/resources"),
          fetch("/api/subjects"),
        ]);
        const [plansData, resData, subData] = await Promise.all([
          plansRes.json(),
          resRes.json(),
          subRes.json(),
        ]);

        if (!cancelled) {
          if (plansRes.ok && plansData.success) setPlans(plansData.plans || []);
          if (resRes.ok && resData.success) setResources(resData.resources || []);
          if (subRes.ok && subData.success) setSubjects(subData.subjects || []);
        }
      } catch (err) {
        console.error("Error loading learning data:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((p) => {
      const matchSubject = !filterSubjectId || p.subject?._id === filterSubjectId;
      const matchSearch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase().trim()));
      return matchSubject && matchSearch;
    });
  }, [plans, filterSubjectId, searchQuery]);

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchSubject = !filterSubjectId || r.subject?._id === filterSubjectId;
      const matchSearch =
        !searchQuery.trim() ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        r.url.toLowerCase().includes(searchQuery.toLowerCase().trim());
      return matchSubject && matchSearch;
    });
  }, [resources, filterSubjectId, searchQuery]);

  const handlePlanSuccess = (savedPlan, isEdit) => {
    if (isEdit) {
      setPlans((prev) => prev.map((p) => (p._id === savedPlan._id ? { ...p, ...savedPlan } : p)));
      showToast("Plan updated successfully.");
    } else {
      setPlans((prev) => [savedPlan, ...prev]);
      showToast("Learning plan created.");
    }
  };

  const handlePlanDelete = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.title}"? All timeline items will be removed.`)) return;
    try {
      const res = await fetch(`/api/plans/${plan._id}`, { method: "DELETE" });
      if (res.ok) {
        setPlans((prev) => prev.filter((p) => p._id !== plan._id));
        showToast("Plan deleted.");
      }
    } catch {
      showToast("Failed to delete plan.", "error");
    }
  };

  const handleResourceSuccess = (savedRes, isEdit) => {
    if (isEdit) {
      setResources((prev) => prev.map((r) => (r._id === savedRes._id ? savedRes : r)));
      showToast("Resource updated.");
    } else {
      setResources((prev) => [savedRes, ...prev]);
      showToast("Resource added to library.");
    }
  };

  const handleResourceDelete = async (resItem) => {
    if (!window.confirm(`Delete resource "${resItem.title}"?`)) return;
    try {
      const res = await fetch(`/api/resources/${resItem._id}`, { method: "DELETE" });
      if (res.ok) {
        setResources((prev) => prev.filter((r) => r._id !== resItem._id));
        showToast("Resource deleted.");
      }
    } catch {
      showToast("Failed to delete resource.", "error");
    }
  };

  const totalCompletedDays = useMemo(() => {
    return plans.reduce((acc, p) => acc + (p.stats?.completedItems || 0), 0);
  }, [plans]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Toast Alert */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-slide-left text-white"
          style={{ backgroundColor: toast.type === "error" ? "#f43f5e" : "#0f172a" }}
        >
          {toast.type === "error" ? (
            <AlertCircle size={16} className="text-rose-200" />
          ) : (
            <CheckCircle2 size={16} className="text-emerald-400" />
          )}
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 text-white/60 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Learning Hub
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-600 border border-blue-200">
              Stage 7
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Structure your study roadmaps day-by-day and track curated YouTube playlists and guides.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeTab === "plans" ? (
            <button
              onClick={() => setPlanModalState({ isOpen: true, plan: null })}
              className="btn btn-primary flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              <span>Create Plan</span>
            </button>
          ) : (
            <button
              onClick={() => setResourceModalState({ isOpen: true, resource: null })}
              className="btn btn-primary flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              <span>Add Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 bg-white border border-slate-200/80 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
            <Compass size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Roadmaps</p>
            <p className="text-xl font-extrabold text-slate-900">{plans.length}</p>
          </div>
        </div>

        <div className="card p-4 bg-white border border-slate-200/80 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Days / Steps Completed</p>
            <p className="text-xl font-extrabold text-slate-900">{totalCompletedDays}</p>
          </div>
        </div>

        <div className="card p-4 bg-white border border-slate-200/80 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Link2 size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Curated Resources</p>
            <p className="text-xl font-extrabold text-slate-900">{resources.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-6 border-b border-slate-200 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "plans"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Compass size={16} />
          <span>Learning Plans ({plans.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("resources")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "resources"
              ? "border-brand-600 text-brand-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Link2 size={16} />
          <span>Resource Library ({resources.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === "plans" ? "plans" : "resources"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base text-sm pl-9"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="relative">
          <Layers
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="input-base text-sm pr-8 appearance-none cursor-pointer"
            style={{ paddingLeft: "2.25rem", minWidth: "170px" }}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 h-48 skeleton rounded-2xl" />
          ))}
        </div>
      ) : activeTab === "plans" ? (
        /* PLANS TAB */
        filteredPlans.length === 0 ? (
          <div className="card p-12 text-center max-w-lg mx-auto bg-white border border-slate-200/80 my-8">
            <Compass size={36} className="text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">No learning plans found</h2>
            <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto leading-relaxed">
              Create your first structured study plan (e.g. 30-Day Exam Roadmap) and tick off days as you learn.
            </p>
            <button
              onClick={() => setPlanModalState({ isOpen: true, plan: null })}
              className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Create First Plan</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlans.map((plan) => (
              <PlanCard
                key={plan._id}
                plan={plan}
                onEdit={(p) => setPlanModalState({ isOpen: true, plan: p })}
                onDelete={handlePlanDelete}
              />
            ))}
          </div>
        )
      ) : (
        /* RESOURCES TAB */
        filteredResources.length === 0 ? (
          <div className="card p-12 text-center max-w-lg mx-auto bg-white border border-slate-200/80 my-8">
            <Link2 size={36} className="text-slate-300 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-slate-900 mb-1">No resources saved yet</h2>
            <p className="text-xs text-slate-500 mb-5 max-w-sm mx-auto leading-relaxed">
              Save YouTube video lectures, playlists, and study references to easily attach them to plans.
            </p>
            <button
              onClick={() => setResourceModalState({ isOpen: true, resource: null })}
              className="btn btn-primary btn-sm inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add First Resource</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((resItem) => (
              <ResourceCard
                key={resItem._id}
                resource={resItem}
                onEdit={(r) => setResourceModalState({ isOpen: true, resource: r })}
                onDelete={handleResourceDelete}
              />
            ))}
          </div>
        )
      )}

      {/* Modals */}
      <PlanModal
        isOpen={planModalState.isOpen}
        plan={planModalState.plan}
        subjects={subjects}
        resources={resources}
        onClose={() => setPlanModalState({ isOpen: false, plan: null })}
        onSuccess={handlePlanSuccess}
      />

      <ResourceModal
        isOpen={resourceModalState.isOpen}
        resource={resourceModalState.resource}
        subjects={subjects}
        onClose={() => setResourceModalState({ isOpen: false, resource: null })}
        onSuccess={handleResourceSuccess}
      />
    </div>
  );
}

