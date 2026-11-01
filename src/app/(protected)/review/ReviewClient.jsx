"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  BookOpen,
  Layers,
  Award,
  Flame,
  ChevronRight,
  ChevronLeft,
  Loader2,
  RefreshCcw,
} from "lucide-react";

export default function ReviewClient() {
  const [mode, setMode] = useState("due"); // "due" | "all"
  const [notes, setNotes] = useState([]);
  const [stats, setStats] = useState({ totalDue: 0, completedToday: 0, masteredCount: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Session state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);

  const [reloadTrigger, setReloadTrigger] = useState(0);

  // Fetch review items
  useEffect(() => {
    let cancelled = false;
    const fetchQueue = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/review?mode=${mode}`);
        const data = await res.json();
        if (!cancelled && res.ok && data.success) {
          setNotes(data.notes || []);
          if (data.stats) setStats(data.stats);
        }
      } catch (err) {
        console.error("Failed to load review items:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchQueue();
    return () => {
      cancelled = true;
    };
  }, [mode, reloadTrigger]);

  const currentNote = notes[currentIndex] || null;
  const currentQuestions = currentNote?.questions || [];
  const currentQuestion = currentQuestions[questionIndex] || null;

  // Handle Review response
  const handleRate = useCallback(
    async (result) => {
      if (!currentNote || submitting) return;

      setSubmitting(true);
      try {
        const res = await fetch("/api/review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            noteId: currentNote._id,
            result,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to record review.");

        // Record result for session summary
        setSessionResults((prev) => [
          ...prev,
          {
            noteTitle: currentNote.title,
            result,
            newStage: data.review?.newStage ?? currentNote.reviewStage,
            intervalDays: data.review?.intervalDays ?? 1,
          },
        ]);

        // Move to next note or finish session
        if (currentIndex + 1 < notes.length) {
          setCurrentIndex((i) => i + 1);
          setIsFlipped(false);
          setQuestionIndex(0);
        } else {
          setSessionCompleted(true);
          // Refresh today's stats
          setStats((prev) => ({
            ...prev,
            completedToday: prev.completedToday + 1,
            totalDue: Math.max(0, prev.totalDue - 1),
          }));
        }
      } catch (err) {
        console.error("Error submitting review:", err);
      } finally {
        setSubmitting(false);
      }
    },
    [currentNote, submitting, currentIndex, notes.length]
  );

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (sessionCompleted || loading || !currentNote) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      } else if (isFlipped) {
        if (e.key === "1") {
          e.preventDefault();
          handleRate("forgot");
        } else if (e.key === "2") {
          e.preventDefault();
          handleRate("partial");
        } else if (e.key === "3") {
          e.preventDefault();
          handleRate("remembered");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFlipped, sessionCompleted, loading, currentNote, handleRate]);

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setQuestionIndex(0);
    setSessionCompleted(false);
    setSessionResults([]);
    setReloadTrigger((t) => t + 1);
  };

  const subjectColor = currentNote?.subject?.color || "#0e87e8";

  // Session summary calculations
  const rememberedCount = useMemo(
    () => sessionResults.filter((r) => r.result === "remembered").length,
    [sessionResults]
  );
  const accuracyPct = sessionResults.length
    ? Math.round((rememberedCount / sessionResults.length) * 100)
    : 100;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Active Recall Review
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              Stage 6
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Retain knowledge faster using spaced repetition &amp; Leitner exponential review stages.
          </p>
        </div>

        {/* Mode toggle */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setMode("due");
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionCompleted(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "due"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Due Today ({stats.totalDue})
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("all");
              setCurrentIndex(0);
              setIsFlipped(false);
              setSessionCompleted(false);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Practice All ({notes.length})
          </button>
        </div>
      </div>

      {/* Top Stats Banner */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
        <div className="card p-4 bg-white border border-slate-200/80 text-center">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-1">
            <Flame size={16} />
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Due Today</p>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-900">{stats.totalDue}</p>
        </div>

        <div className="card p-4 bg-white border border-slate-200/80 text-center">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-1">
            <CheckCircle2 size={16} />
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Reviewed Today</p>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-900">{stats.completedToday}</p>
        </div>

        <div className="card p-4 bg-white border border-slate-200/80 text-center">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-1">
            <Award size={16} />
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">Mastered</p>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-900">{stats.masteredCount}</p>
        </div>
      </div>

      {/* Main Review Session Area */}
      {loading ? (
        <div className="card p-16 bg-white border border-slate-200/80 flex flex-col items-center justify-center min-h-[360px]">
          <Loader2 size={36} className="animate-spin text-brand-600 mb-3" />
          <p className="text-sm font-semibold text-slate-600">Loading your review queue...</p>
        </div>
      ) : sessionCompleted ? (
        /* Session Completed Screen */
        <div className="card p-8 sm:p-12 bg-white border border-slate-200/80 text-center animate-fade-in" style={{ borderRadius: "var(--radius-xl)" }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
            <Award size={32} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
            Session Complete! 🎉
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            Great job! You reviewed {sessionResults.length} item{sessionResults.length !== 1 ? "s" : ""} and strengthened your memory retention.
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-8">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-0.5">Recall Accuracy</p>
              <p className="text-2xl font-extrabold text-emerald-600">{accuracyPct}%</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold mb-0.5">Cards Remembered</p>
              <p className="text-2xl font-extrabold text-brand-600">
                {rememberedCount} / {sessionResults.length}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={restartSession}
              className="btn btn-secondary btn-sm flex items-center gap-2"
            >
              <RefreshCcw size={14} />
              <span>Review Again</span>
            </button>
            <Link href="/dashboard" className="btn btn-primary btn-sm flex items-center gap-2">
              <span>Back to Dashboard</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      ) : notes.length === 0 ? (
        /* Empty State */
        <div className="card p-12 bg-white border border-slate-200/80 text-center my-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">All Caught Up! 🌟</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
            {mode === "due"
              ? "You have zero notes due for review right now. Switch to 'Practice All' mode above to practice any notes at any time."
              : "You haven't created any study notes yet. Create a note and add flashcards to start your active recall journey."}
          </p>

          <div className="flex items-center justify-center gap-3">
            {mode === "due" ? (
              <button
                type="button"
                onClick={() => setMode("all")}
                className="btn btn-primary btn-sm"
              >
                <span>Switch to Practice All</span>
              </button>
            ) : (
              <Link href="/notes" className="btn btn-primary btn-sm inline-flex items-center gap-1.5">
                <BookOpen size={15} />
                <span>Go to Notes</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* Active Flashcard Review Card */
        <div className="flex flex-col gap-6">
          {/* Progress Bar & Indicators */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>Card {currentIndex + 1} of {notes.length}</span>
              <span>•</span>
              <span className="text-purple-600">Stage {currentNote?.reviewStage} / 10</span>
            </div>

            {currentNote?.subject && (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: `${subjectColor}14`,
                  color: subjectColor,
                  border: `1px solid ${subjectColor}33`,
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: subjectColor }} />
                <span>{currentNote.subject.name}</span>
              </span>
            )}
          </div>

          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-brand-600 h-1.5 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / notes.length) * 100}%` }}
            />
          </div>

          {/* Flashcard Component */}
          <div
            onClick={() => setIsFlipped((f) => !f)}
            className="cursor-pointer card bg-white border border-slate-200 hover:border-slate-300 shadow-sm transition-all duration-200 min-h-[340px] flex flex-col justify-between p-6 sm:p-8 relative overflow-hidden group select-none"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            {/* Subject Accent Bar */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5"
              style={{ background: subjectColor }}
            />

            {/* Card Header */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles size={13} className="text-brand-500" />
                {isFlipped ? "Answer / Takeaways" : "Active Recall Prompt"}
              </span>

              <span className="text-[11px] text-slate-400 group-hover:text-brand-600 font-medium transition-colors flex items-center gap-1">
                <RotateCw size={12} />
                Click card or press [Space] to {isFlipped ? "show question" : "flip answer"}
              </span>
            </div>

            {/* Card Content Body */}
            <div className="my-auto py-4">
              {!isFlipped ? (
                /* FRONT: Question Prompt */
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 leading-snug">
                    {currentQuestion ? currentQuestion.questionText : currentNote.title}
                  </h3>
                  {currentQuestions.length > 1 && (
                    <div className="flex items-center gap-2 mt-4 text-xs text-slate-400">
                      <span>Question {questionIndex + 1} of {currentQuestions.length}</span>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          disabled={questionIndex === 0}
                          onClick={() => setQuestionIndex((i) => Math.max(0, i - 1))}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          type="button"
                          disabled={questionIndex === currentQuestions.length - 1}
                          onClick={() => setQuestionIndex((i) => Math.min(currentQuestions.length - 1, i + 1))}
                          className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                  {!currentQuestion && (
                    <p className="text-xs text-slate-400">
                      (No explicit flashcards added to this note. Recall key facts, definitions, or equations from memory!)
                    </p>
                  )}
                </div>
              ) : (
                /* BACK: Answer / Full Note Content */
                <div className="animate-fade-in">
                  {currentQuestion ? (
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">
                        Answer:
                      </p>
                      <p className="text-base sm:text-lg font-semibold text-slate-800 leading-relaxed mb-4">
                        {currentQuestion.answerText}
                      </p>
                      {currentNote.content && (
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 line-clamp-3">
                          <span className="font-bold text-slate-700">Note Excerpt: </span>
                          {currentNote.content}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">
                        Note Content:
                      </p>
                      <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap max-h-[220px] overflow-y-auto">
                        {currentNote.content || "No written content in this note yet."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bottom hint */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="truncate max-w-[200px]">Note: {currentNote.title}</span>
              <span>Freshness: {currentNote.freshnessScore}%</span>
            </div>
          </div>

          {/* Rating Response Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Button 1: Forgot / Again */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleRate("forgot")}
              className="flex-1 w-full p-4 rounded-xl border border-rose-200 bg-rose-50/60 hover:bg-rose-100/70 text-rose-700 font-semibold text-center transition-all flex flex-col items-center justify-center gap-1 group shadow-sm disabled:opacity-50"
            >
              <span className="text-sm font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Forgot (Again)
              </span>
              <span className="text-[11px] text-rose-500 font-normal">
                Reset to Stage 0 · Review tomorrow [1]
              </span>
            </button>

            {/* Button 2: Partial */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleRate("partial")}
              className="flex-1 w-full p-4 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/70 text-amber-800 font-semibold text-center transition-all flex flex-col items-center justify-center gap-1 group shadow-sm disabled:opacity-50"
            >
              <span className="text-sm font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Hard (Partial)
              </span>
              <span className="text-[11px] text-amber-600 font-normal">
                Keep Stage {currentNote?.reviewStage} · Short interval [2]
              </span>
            </button>

            {/* Button 3: Remembered / Good */}
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleRate("remembered")}
              className="flex-1 w-full p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-800 font-semibold text-center transition-all flex flex-col items-center justify-center gap-1 group shadow-sm disabled:opacity-50"
            >
              <span className="text-sm font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Remembered (Good)
              </span>
              <span className="text-[11px] text-emerald-600 font-normal">
                Advance to Stage {Math.min(10, (currentNote?.reviewStage || 0) + 1)} [3]
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
