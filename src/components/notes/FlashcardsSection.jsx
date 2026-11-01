"use client";

import { useState } from "react";
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCw,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function FlashcardsSection({ noteId, questions = [], onQuestionsChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [practiceIndex, setPracticeIndex] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError("Please fill out both the question and answer.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/notes/${noteId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: newQuestion.trim(),
          answerText: newAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to add flashcard.");

      onQuestionsChange([...questions, data.question]);
      setNewQuestion("");
      setNewAnswer("");
      setIsAdding(false);
    } catch (err) {
      setError(err.message || "Could not save flashcard.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (q) => {
    setEditingId(q._id);
    setEditQuestion(q.questionText);
    setEditAnswer(q.answerText);
  };

  const handleUpdate = async (qId) => {
    if (!editQuestion.trim() || !editAnswer.trim()) return;

    setUpdatingId(qId);
    setError("");

    try {
      const res = await fetch(`/api/notes/${noteId}/questions/${qId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: editQuestion.trim(),
          answerText: editAnswer.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update flashcard.");

      onQuestionsChange(
        questions.map((q) => (q._id === qId ? data.question : q))
      );
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Could not update flashcard.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (qId) => {
    setDeletingId(qId);
    try {
      const res = await fetch(`/api/notes/${noteId}/questions/${qId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete flashcard.");

      onQuestionsChange(questions.filter((q) => q._id !== qId));
      if (practiceIndex !== null && practiceIndex >= questions.length - 1) {
        setPracticeIndex(Math.max(0, questions.length - 2));
      }
    } catch (err) {
      setError(err.message || "Could not delete flashcard.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Flashcards ({questions.length}/10)
          </span>
          {questions.length >= 10 && (
            <span className="text-[11px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Max reached
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {questions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setPracticeIndex(practiceIndex === null ? 0 : null);
                setShowAnswer(false);
              }}
              className="btn btn-secondary btn-sm text-xs py-1.5 px-3"
            >
              <RotateCw size={13} />
              <span>{practiceIndex === null ? "Practice Mode" : "Close Practice"}</span>
            </button>
          )}

          {questions.length < 10 && !isAdding && (
            <button
              type="button"
              onClick={() => {
                setIsAdding(true);
                setError("");
              }}
              className="btn btn-primary btn-sm text-xs py-1.5 px-3"
            >
              <Plus size={13} />
              <span>Add Flashcard</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Interactive Practice Mode Carousel */}
      {practiceIndex !== null && questions.length > 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-purple-50/80 border border-indigo-100 shadow-sm transition-all animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={13} className="text-indigo-500" />
              Practice Card {practiceIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={practiceIndex === 0}
                onClick={() => {
                  setPracticeIndex((i) => Math.max(0, i - 1));
                  setShowAnswer(false);
                }}
                className="btn btn-secondary btn-sm py-1 px-2.5 text-xs disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={practiceIndex === questions.length - 1}
                onClick={() => {
                  setPracticeIndex((i) => Math.min(questions.length - 1, i + 1));
                  setShowAnswer(false);
                }}
                className="btn btn-secondary btn-sm py-1 px-2.5 text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          <div
            onClick={() => setShowAnswer((s) => !s)}
            className="cursor-pointer bg-white p-6 rounded-xl border border-indigo-100 hover:border-indigo-300 transition-all shadow-sm min-h-[140px] flex flex-col justify-between"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Question
              </p>
              <p className="text-base font-semibold text-slate-900">
                {questions[practiceIndex]?.questionText}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              {showAnswer ? (
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                    Answer
                  </p>
                  <p className="text-sm font-medium text-slate-700">
                    {questions[practiceIndex]?.answerText}
                  </p>
                </div>
              ) : (
                <span className="text-xs text-indigo-600 font-semibold flex items-center gap-1">
                  <Eye size={13} /> Click to reveal answer
                </span>
              )}

              {showAnswer && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <EyeOff size={13} /> Click to hide
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add New Flashcard Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-3 animate-fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              New Active Recall Card
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={15} />
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Question <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. What is the rate-determining step in an SN1 reaction?"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="input-base text-sm"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1">
              Answer <span className="text-rose-500">*</span>
            </label>
            <textarea
              placeholder="e.g. The formation of the carbocation intermediate."
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              rows={2}
              className="input-base text-sm resize-y"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              disabled={submitting}
              className="btn btn-secondary btn-sm text-xs py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-sm text-xs py-1.5 min-w-[90px]"
            >
              {submitting ? (
                <>
                  <Loader2 size={13} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Card"
              )}
            </button>
          </div>
        </form>
      )}

      {/* Questions list */}
      {questions.length === 0 && !isAdding ? (
        <div className="p-5 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
          <HelpCircle size={20} className="mx-auto mb-1 text-slate-300" />
          No flashcards created for this note yet. Click{" "}
          <span className="font-semibold text-brand-600">&ldquo;Add Flashcard&rdquo;</span> to create
          Q&amp;A prompts for active recall spaced repetition.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {questions.map((q, idx) => (
            <div
              key={q._id}
              className="p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col gap-2 group"
            >
              {editingId === q._id ? (
                <div className="flex flex-col gap-2.5">
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className="input-base text-sm"
                    placeholder="Question"
                  />
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    rows={2}
                    className="input-base text-sm resize-y"
                    placeholder="Answer"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn btn-secondary btn-sm text-xs py-1 px-2.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdate(q._id)}
                      disabled={updatingId === q._id}
                      className="btn btn-primary btn-sm text-xs py-1 px-2.5"
                    >
                      {updatingId === q._id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Check size={12} />
                      )}
                      <span>Save</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <span className="text-[11px] font-bold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-md shrink-0 mt-0.5">
                      Q{idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 break-words">
                        {q.questionText}
                      </p>
                      <p className="text-xs text-slate-500 mt-1 break-words">
                        <span className="font-semibold text-slate-600">Answer:</span>{" "}
                        {q.answerText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(q)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                      title="Edit flashcard"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(q._id)}
                      disabled={deletingId === q._id}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete flashcard"
                    >
                      {deletingId === q._id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

