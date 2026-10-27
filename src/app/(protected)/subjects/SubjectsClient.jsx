"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Layers,
  Plus,
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import SubjectCard from "@/components/subjects/SubjectCard";
import SubjectModal from "@/components/subjects/SubjectModal";
import DeleteSubjectModal from "@/components/subjects/DeleteSubjectModal";

export default function SubjectsClient() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalState, setModalState] = useState({ isOpen: false, subject: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, subject: null });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  useEffect(() => {
    let isCancelled = false;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/subjects");
        const data = await res.json();
        if (!isCancelled && res.ok && data.success) {
          setSubjects(data.subjects || []);
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchSubjects();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, subject: null });
  };

  const handleOpenEdit = (subject) => {
    setModalState({ isOpen: true, subject });
  };

  const handleOpenDelete = (subject) => {
    setDeleteModalState({ isOpen: true, subject });
  };

  const handleSaveSuccess = (savedSubject, isEdit) => {
    if (isEdit) {
      setSubjects((prev) =>
        prev.map((s) => (s._id === savedSubject._id ? savedSubject : s))
      );
      showToast(`Subject "${savedSubject.name}" updated successfully.`);
    } else {
      setSubjects((prev) => [savedSubject, ...prev]);
      showToast(`Subject "${savedSubject.name}" created successfully.`);
    }
  };

  const handleDeleteSuccess = (deletedId) => {
    setSubjects((prev) => prev.filter((s) => s._id !== deletedId));
    showToast("Subject deleted successfully.");
  };

  // Filtered by search query
  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const q = searchQuery.toLowerCase().trim();
    return subjects.filter((s) => s.name.toLowerCase().includes(q));
  }, [subjects, searchQuery]);

  // Total notes count
  const totalNotes = useMemo(() => {
    return subjects.reduce((acc, curr) => acc + (curr.noteCount || 0), 0);
  }, [subjects]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-medium animate-slide-left"
          style={{
            backgroundColor: toast.type === "error" ? "#f43f5e" : "#0f172a",
            color: "#ffffff",
          }}
        >
          {toast.type === "error" ? (
            <AlertCircle size={18} className="text-rose-200" />
          ) : (
            <CheckCircle2 size={18} className="text-emerald-400" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 text-white/70 hover:text-white"
            aria-label="Dismiss toast"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Subjects
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-600 border border-blue-200">
              {subjects.length} Total
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Organize notes and review schedules by subject or academic course.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="btn btn-primary self-start sm:self-auto shadow-md hover:shadow-lg transition-all"
        >
          <Plus size={18} />
          <span>New Subject</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-4 bg-white border border-slate-200/80">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Subjects
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {loading ? "..." : subjects.length}
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-white border border-slate-200/80">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Notes Assigned
            </p>
            <p className="text-xl font-extrabold text-slate-900">
              {loading ? "..." : totalNotes}
            </p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-white border border-slate-200/80">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Spaced Repetition
            </p>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Optimized for Active Recall
            </p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search subjects by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base text-sm"
            style={{ paddingLeft: "2.5rem", paddingRight: "2.25rem" }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {searchQuery && (
          <p className="text-xs text-slate-500 self-center">
            Found {filteredSubjects.length} of {subjects.length} subjects
          </p>
        )}
      </div>

      {/* Subject Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="card p-5 h-44 flex flex-col justify-between border border-slate-200/70"
            >
              <div>
                <div className="skeleton h-5 w-24 mb-4 rounded-md" />
                <div className="skeleton h-6 w-3/4 mb-2 rounded-md" />
              </div>
              <div className="skeleton h-4 w-1/2 rounded-md" />
            </div>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        /* Empty State: No subjects created yet */
        <div className="card p-12 text-center max-w-lg mx-auto bg-white border border-slate-200/80 my-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg,#0e87e81a,#8b5cf61a)",
              border: "1px solid rgba(14,135,232,0.2)",
            }}
          >
            <Layers size={32} className="text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No subjects yet</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Create your first subject (like &ldquo;Organic Chemistry&rdquo; or &ldquo;Data Structures&rdquo;) to organize your study notes and spaced-repetition schedules.
          </p>
          <button
            onClick={handleOpenCreate}
            className="btn btn-primary inline-flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus size={16} />
            <span>Create First Subject</span>
          </button>
        </div>
      ) : filteredSubjects.length === 0 ? (
        /* Search Empty State */
        <div className="card p-10 text-center max-w-md mx-auto bg-white border border-slate-200/80 my-8">
          <Search size={28} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">
            No subjects matching &ldquo;{searchQuery}&rdquo;
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Try searching with a different keyword or create a new subject.
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="btn btn-secondary btn-sm"
          >
            Clear Search
          </button>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredSubjects.map((sub) => (
            <SubjectCard
              key={sub._id}
              subject={sub}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <SubjectModal
        isOpen={modalState.isOpen}
        subject={modalState.subject}
        onClose={() => setModalState({ isOpen: false, subject: null })}
        onSuccess={handleSaveSuccess}
      />

      <DeleteSubjectModal
        isOpen={deleteModalState.isOpen}
        subject={deleteModalState.subject}
        onClose={() => setDeleteModalState({ isOpen: false, subject: null })}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
