"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  BookOpen,
  ImageIcon,
  ChevronDown,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import ImageUploader from "@/components/notes/ImageUploader";
import FlashcardsSection from "@/components/notes/FlashcardsSection";
import DeleteNoteModal from "@/components/notes/DeleteNoteModal";

function getFreshnessStyle(score) {
  if (score >= 80) return { label: "Fresh", className: "freshness-badge-fresh" };
  if (score >= 50) return { label: "Moderate", className: "freshness-badge-moderate" };
  if (score >= 20) return { label: "Stale", className: "freshness-badge-stale" };
  return { label: "Critical", className: "freshness-badge-critical" };
}

export default function NoteEditorClient({ noteId }) {
  const router = useRouter();
  const [note, setNote] = useState(null);
  const [subject, setSubject] = useState(null);
  const [images, setImages] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);
  const [showImages, setShowImages] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Load note + images
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/notes/${noteId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          setError(data.message || "Note not found.");
          return;
        }

        if (!cancelled) {
          setNote(data.note);
          setTitle(data.note.title);
          setContent(data.note.content || "");
          setImages(data.images || []);
          setQuestions(data.questions || []);

          // Load subject details
          if (data.note.subjectId) {
            const subRes = await fetch("/api/subjects");
            const subData = await subRes.json();
            if (subRes.ok && subData.success) {
              const sub = subData.subjects.find((s) => s._id === data.note.subjectId);
              if (!cancelled) setSubject(sub || null);
            }
          }
        }
      } catch {
        if (!cancelled) setError("Failed to load note.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [noteId]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError("Title cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");
    setSaveMsg("");

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), content }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save note.");

      setNote(data.note);
      setIsDirty(false);
      setSaveMsg("Saved!");
      setTimeout(() => setSaveMsg(""), 3000);
    } catch (err) {
      setError(err.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }, [noteId, title, content]);

  // Ctrl/Cmd+S shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (isDirty) handleSave();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isDirty, handleSave]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} style={{ animation: "spin 1s linear infinite", color: "var(--brand-500)" }} />
      </div>
    );
  }

  if (error && !note) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={40} className="text-rose-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">Note not found</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Link href="/notes" className="btn btn-primary btn-sm">
          <ArrowLeft size={15} />
          Back to Notes
        </Link>
      </div>
    );
  }

  const freshness = note ? getFreshnessStyle(note.freshnessScore) : null;
  const subjectColor = subject?.color || "#0e87e8";
  const updatedAgo = note?.updatedAt
    ? formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })
    : "";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in">
      {/* Top Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Link
            href="/notes"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Notes</span>
          </Link>
          <span className="text-slate-300">/</span>
          {subject && (
            <>
              <Link
                href={`/notes?subjectId=${subject._id}`}
                className="flex items-center gap-1.5"
                style={{ color: subjectColor }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: subjectColor }}
                />
                <span className="font-semibold text-xs truncate max-w-[120px]">{subject.name}</span>
              </Link>
              <span className="text-slate-300">/</span>
            </>
          )}
          <span className="text-slate-700 font-semibold text-xs truncate max-w-[180px]">
            {title || "Untitled"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {saveMsg && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 animate-fade-in">
              <CheckCircle2 size={13} />
              {saveMsg}
            </span>
          )}
          {error && (
            <span className="flex items-center gap-1 text-xs font-semibold text-rose-600">
              <AlertCircle size={13} />
              {error}
            </span>
          )}
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="btn btn-secondary btn-sm text-rose-600 border-rose-200 hover:bg-rose-50"
          >
            <Trash2 size={14} />
            <span className="hidden sm:inline">Delete</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="btn btn-primary btn-sm min-w-[90px]"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save size={14} />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Note Meta Row */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {freshness && (
          <span className={`badge ${freshness.className}`}>
            <Sparkles size={11} />
            {freshness.label} · Stage {note?.reviewStage}/10
          </span>
        )}
        {updatedAgo && (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Clock size={11} />
            Updated {updatedAgo}
          </span>
        )}
        {isDirty && (
          <span className="text-xs text-amber-600 font-semibold animate-fade-in">
            • Unsaved changes — press Ctrl+S to save
          </span>
        )}
      </div>

      {/* Note Editor Card */}
      <div className="card bg-white border border-slate-200/80 overflow-hidden mb-6" style={{ borderRadius: "var(--radius-xl)" }}>
        {/* Subject accent */}
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${subjectColor}, ${subjectColor}60)` }}
        />

        <div className="p-5 sm:p-7 flex flex-col gap-5">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              <BookOpen size={13} className="inline mr-1 mb-0.5" />
              Note Title
            </label>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Give your note a clear title…"
              maxLength={150}
              className="w-full text-xl sm:text-2xl font-bold text-slate-900 placeholder:text-slate-300 border-none outline-none bg-transparent p-0 focus:ring-0"
              style={{ lineHeight: 1.3 }}
            />
            <div className="h-px bg-slate-100 mt-2" />
          </div>

          {/* Content */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Content
            </label>
            <textarea
              value={content}
              onChange={handleContentChange}
              placeholder={"Write your notes here…\n\nTips:\n• Use • for bullet points\n• Include key concepts, definitions, and examples\n• Write in your own words for better retention"}
              rows={16}
              className="w-full text-sm text-slate-800 placeholder:text-slate-300 border-none outline-none bg-transparent p-0 focus:ring-0 resize-y leading-relaxed"
              style={{ fontFamily: "inherit", minHeight: "320px" }}
            />
          </div>
        </div>
      </div>

      {/* Active Recall Flashcards Section */}
      <div className="card bg-white border border-slate-200/80 overflow-hidden mb-6" style={{ borderRadius: "var(--radius-xl)" }}>
        <button
          onClick={() => setShowQuestions((v) => !v)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <HelpCircle size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-800">Active Recall Flashcards</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {questions.length} / 10
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Create Q&amp;A pairs to test your memory during spaced repetition revision.
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${showQuestions ? "rotate-180" : ""}`}
          />
        </button>

        {showQuestions && (
          <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4">
            <FlashcardsSection
              noteId={noteId}
              questions={questions}
              onQuestionsChange={setQuestions}
            />
          </div>
        )}
      </div>

      {/* Images Section */}
      <div className="card bg-white border border-slate-200/80 overflow-hidden" style={{ borderRadius: "var(--radius-xl)" }}>
        <button
          onClick={() => setShowImages((v) => !v)}
          className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <ImageIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Attached Images</h3>
              <p className="text-xs text-slate-500">
                {images.length > 0
                  ? `${images.length} image${images.length > 1 ? "s" : ""} attached`
                  : "Upload diagrams, screenshots, or handwritten notes"}
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform duration-200 ${showImages ? "rotate-180" : ""}`}
          />
        </button>

        {showImages && (
          <div className="px-4 sm:px-5 pb-5 border-t border-slate-100 pt-4">
            <ImageUploader
              noteId={noteId}
              images={images}
              onImageAdded={(img) => setImages((prev) => [...prev, img])}
              onImageDeleted={(imgId) => setImages((prev) => prev.filter((i) => i._id !== imgId))}
            />
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {note && (
        <DeleteNoteModal
          isOpen={deleteModalOpen}
          note={note}
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => router.push("/notes")}
        />
      )}
    </div>
  );
}
