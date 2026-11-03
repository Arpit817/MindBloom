"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  BookOpen,
  Plus,
  Search,
  Layers,
  Sparkles,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import NoteCard from "@/components/notes/NoteCard";
import NoteModal from "@/components/notes/NoteModal";
import DeleteNoteModal from "@/components/notes/DeleteNoteModal";

export default function NotesClient({ initialSubjectId }) {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubjectId, setFilterSubjectId] = useState(initialSubjectId || "");
  const [modalState, setModalState] = useState({ isOpen: false, note: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, note: null });
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Fetch subjects
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/subjects");
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setSubjects(data.subjects || []);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // Fetch notes
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoadingNotes(true);
        const url = filterSubjectId
          ? `/api/notes?subjectId=${filterSubjectId}`
          : "/api/notes";
        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setNotes(data.notes || []);
        }
      } catch {
        // silent
      } finally {
        if (!cancelled) setLoadingNotes(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [filterSubjectId]);

  // Build subject map
  const subjectMap = useMemo(() => {
    const map = {};
    for (const s of subjects) map[s._id] = s;
    return map;
  }, [subjects]);

  // Filter notes by search
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const q = searchQuery.toLowerCase().trim();
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        (n.content && n.content.toLowerCase().includes(q))
    );
  }, [notes, searchQuery]);

  const handleSaveSuccess = useCallback((savedNote, isEdit) => {
    if (isEdit) {
      setNotes((prev) =>
        prev.map((n) => (n._id === savedNote._id ? savedNote : n))
      );
      showToast(`Note updated successfully.`);
    } else {
      setNotes((prev) => [savedNote, ...prev]);
      showToast(`Note created successfully.`);
    }
  }, [showToast]);

  const handleDeleteSuccess = useCallback((deletedId) => {
    setNotes((prev) => prev.filter((n) => n._id !== deletedId));
    showToast("Note deleted.");
  }, [showToast]);

  const totalNotes = notes.length;
  const dueCount = useMemo(
    () => notes.filter((n) => n.nextReviewAt && new Date(n.nextReviewAt) <= new Date()).length,
    [notes]
  );

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
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Notes
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-brand-600 border border-blue-200">
              {loadingNotes ? "…" : totalNotes}
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Write, edit, and organize your study notes with spaced repetition tracking.
          </p>
        </div>
        <button
          onClick={() => setModalState({ isOpen: true, note: null })}
          className="btn btn-primary self-start sm:self-auto shadow-md"
        >
          <Plus size={18} />
          <span>New Note</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="card p-4 flex items-center gap-4 bg-white border border-slate-200/80">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Notes</p>
            <p className="text-xl font-extrabold text-slate-900">{loadingNotes ? "…" : totalNotes}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-white border border-slate-200/80">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Due for Review</p>
            <p className="text-xl font-extrabold text-slate-900">{loadingNotes ? "…" : dueCount}</p>
          </div>
        </div>

        <div className="card p-4 flex items-center gap-4 bg-white border border-slate-200/80">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subjects Covered</p>
            <p className="text-xl font-extrabold text-slate-900">{loadingSubjects ? "…" : subjects.length}</p>
          </div>
        </div>
      </div>

      {/* Search + Subject Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes by title or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-base text-sm"
            style={{ paddingLeft: "2.5rem", paddingRight: searchQuery ? "2.25rem" : "0.875rem" }}
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

        {/* Subject filter */}
        <div className="relative">
          <Layers
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <select
            value={filterSubjectId}
            onChange={(e) => setFilterSubjectId(e.target.value)}
            className="input-base text-sm pr-8 appearance-none cursor-pointer"
            style={{ paddingLeft: "2.25rem", minWidth: "180px" }}
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>

        {(searchQuery || filterSubjectId) && (
          <p className="text-xs text-slate-500 self-center whitespace-nowrap">
            {filteredNotes.length} of {totalNotes} notes
          </p>
        )}
      </div>

      {/* Notes Grid */}
      {loadingNotes ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5 h-52 flex flex-col justify-between border border-slate-200/70">
              <div>
                <div className="skeleton h-3 w-20 mb-3 rounded" />
                <div className="skeleton h-5 w-4/5 mb-2 rounded" />
                <div className="skeleton h-3 w-full mb-1 rounded" />
                <div className="skeleton h-3 w-3/4 rounded" />
              </div>
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : notes.length === 0 ? (
        /* Empty state */
        <div className="card p-12 text-center max-w-lg mx-auto bg-white border border-slate-200/80 my-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background: "linear-gradient(135deg,#0e87e81a,#8b5cf61a)",
              border: "1px solid rgba(14,135,232,0.2)",
            }}
          >
            <BookOpen size={32} className="text-brand-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No notes yet</h2>
          <p className="text-sm text-slate-500 mb-4 leading-relaxed">
            {subjects.length === 0 ? (
              <>
                First{" "}
                <Link href="/subjects" className="text-brand-600 underline font-medium">
                  create a subject
                </Link>{" "}
                to organize your notes, then come back to add your first note.
              </>
            ) : (
              "Create your first note to start studying with spaced repetition."
            )}
          </p>
          {subjects.length > 0 && (
            <button
              onClick={() => setModalState({ isOpen: true, note: null })}
              className="btn btn-primary inline-flex items-center gap-2 shadow-md"
            >
              <Plus size={16} />
              <span>Create First Note</span>
            </button>
          )}
        </div>
      ) : filteredNotes.length === 0 ? (
        /* Search empty state */
        <div className="card p-10 text-center max-w-md mx-auto bg-white border border-slate-200/80 my-8">
          <Search size={28} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No notes found</h3>
          <p className="text-xs text-slate-500 mb-4">
            Try different search terms or clear the subject filter.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setFilterSubjectId(""); }}
            className="btn btn-secondary btn-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.map((note) => (
            <NoteCard
              key={note._id}
              note={note}
              subject={subjectMap[note.subjectId]}
              onEdit={(n) => setModalState({ isOpen: true, note: n })}
              onDelete={(n) => setDeleteModalState({ isOpen: true, note: n })}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <NoteModal
        isOpen={modalState.isOpen}
        note={modalState.note}
        subjects={subjects}
        onClose={() => setModalState({ isOpen: false, note: null })}
        onSuccess={handleSaveSuccess}
      />

      <DeleteNoteModal
        isOpen={deleteModalState.isOpen}
        note={deleteModalState.note}
        onClose={() => setDeleteModalState({ isOpen: false, note: null })}
        onSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
