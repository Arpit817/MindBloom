import Link from "next/link";
import {
  Brain,
  PlayCircle,
  BarChart2,
  Camera,
  Layers,
  Clock,
  ChevronRight,
  Star,
  Zap,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Active Recall",
    description:
      "Answer questions from memory before revealing answers. The most powerful revision technique proven by cognitive science.",
    color: "#8b5cf6",
    bg: "#f5f3ff",
  },
  {
    icon: Clock,
    title: "Spaced Repetition",
    description:
      "Review cards at optimal intervals: 2 → 7 → 14 → 30 days. Never forget what you've learned.",
    color: "#0e87e8",
    bg: "#eff6ff",
  },
  {
    icon: Camera,
    title: "Photo Notes",
    description:
      "Upload up to 10 photos per note. Capture handwritten diagrams, class slides, and textbook pages.",
    color: "#10b981",
    bg: "#f0fdf4",
  },
  {
    icon: PlayCircle,
    title: "YouTube Study Plans",
    description:
      "Link YouTube videos and playlists. Create day-wise or step-wise learning plans with progress tracking.",
    color: "#f43f5e",
    bg: "#fff1f2",
  },
  {
    icon: Layers,
    title: "Subject Tracking",
    description:
      "Organise notes by subject. See freshness scores and overdue counts at a glance for every subject.",
    color: "#f59e0b",
    bg: "#fffbeb",
  },
  {
    icon: BarChart2,
    title: "Progress Analytics",
    description:
      "Track revision streaks, completion rates, and your strongest and most neglected subjects over time.",
    color: "#06b6d4",
    bg: "#ecfeff",
  },
];

const steps = [
  {
    step: "01",
    title: "Create a Note",
    description:
      "After class, add your note with typed content or upload photos of your handwriting.",
  },
  {
    step: "02",
    title: "Add Questions",
    description:
      "Write 2–3 questions and answers for each note. These become your revision cards.",
  },
  {
    step: "03",
    title: "Review Daily",
    description:
      "MindBloom tells you exactly which notes are due. Answer from memory, reveal the answer, rate yourself.",
  },
  {
    step: "04",
    title: "Track Progress",
    description:
      "Watch freshness scores grow. See your streak, completion rates, and overall subject health.",
  },
];

const freshnessExamples = [
  { label: "Fresh", score: 95, color: "freshness-badge-fresh", desc: "Reviewed recently" },
  { label: "Moderate", score: 55, color: "freshness-badge-moderate", desc: "Due soon" },
  { label: "Stale", score: 28, color: "freshness-badge-stale", desc: "Overdue" },
  { label: "Critical", score: 8, color: "freshness-badge-critical", desc: "Forgotten" },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-dvh">
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0e87e8,#8b5cf6)" }}
            >
              <Brain size={18} color="white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}
            >
              MindBloom
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[var(--foreground-muted)]">
            <a href="#features" className="hover:text-[var(--foreground)] transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-[var(--foreground)] transition-colors">
              How It Works
            </a>
            <a href="#freshness" className="hover:text-[var(--foreground)] transition-colors">
              Freshness
            </a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-secondary btn-sm hidden sm:inline-flex">
              Log In
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden flex flex-col items-center justify-center text-center px-4 py-24 md:py-36">
        {/* Glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 70% 40% at 50% 0%, rgba(14,135,232,0.22) 0%, transparent 70%)",
          }}
        />
        {/* Floating orbs */}
        <div
          className="absolute top-12 left-12 w-64 h-64 rounded-full opacity-10 animate-float"
          style={{
            background: "radial-gradient(circle, #8b5cf6, transparent)",
            animationDelay: "0s",
          }}
        />
        <div
          className="absolute bottom-12 right-12 w-48 h-48 rounded-full opacity-10 animate-float"
          style={{
            background: "radial-gradient(circle, #0e87e8, transparent)",
            animationDelay: "1.5s",
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto animate-fade-in">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
            style={{ background: "rgba(14,135,232,0.15)", color: "#7dc4fb", border: "1px solid rgba(14,135,232,0.3)" }}>
            <Star size={13} />
            <span>Built for students · 100% Free</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
            Never forget{" "}
            <span className="gradient-text">what you learned</span>{" "}
            in class
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            MindBloom uses spaced repetition and active recall to schedule your
            note reviews at the perfect time — so exam night doesn&apos;t feel like
            meeting your notes for the first time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="btn btn-primary btn-lg animate-glow"
              id="hero-cta-signup"
            >
              Start Blooming Free
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="btn btn-sm flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius-md)", padding: "0.625rem 1.25rem", fontWeight: 600 }}
            >
              See How It Works
              <ChevronRight size={16} />
            </a>
          </div>

          {/* Stats row */}
          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "2→30", label: "Day review cycle" },
              { value: "10×", label: "Photos per note" },
              { value: "₹0", label: "Forever free" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4 bg-[var(--bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: "#eff6ff", color: "#0269c6", border: "1px solid #baddfd" }}>
              <Zap size={12} />
              FEATURES
            </div>
            <h2 className="section-heading text-3xl sm:text-4xl">
              Everything you need to revise smarter
            </h2>
            <p className="section-subheading mt-3 max-w-xl mx-auto">
              MindBloom combines the best study techniques into one free tool built for students.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="card p-6">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: f.bg }}
                  >
                    <Icon size={22} color={f.color} />
                  </div>
                  <h3 className="font-bold text-[var(--foreground)] mb-2">{f.title}</h3>
                  <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4" style={{ background: "#f1f5f9" }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
              style={{ background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0" }}>
              <Target size={12} />
              HOW IT WORKS
            </div>
            <h2 className="section-heading text-3xl sm:text-4xl">Four steps to never forgetting</h2>
            <p className="section-subheading mt-3 max-w-xl mx-auto">
              After class, it takes less than 5 minutes to set up a note. MindBloom handles the rest.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-12px)] w-6 h-0.5 bg-[var(--border)] z-10" />
                )}
                <div className="card p-6 h-full">
                  <div
                    className="text-4xl font-extrabold mb-4 opacity-15"
                    style={{ color: "#0e87e8" }}
                  >
                    {s.step}
                  </div>
                  <h3 className="font-bold text-[var(--foreground)] mb-2">{s.title}</h3>
                  <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Freshness System ────────────────────────────────────── */}
      <section id="freshness" className="py-20 px-4 bg-[var(--bg)]">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
                style={{ background: "#fff7ed", color: "#9a3412", border: "1px solid #fed7aa" }}>
                <TrendingUp size={12} />
                FRESHNESS SYSTEM
              </div>
              <h2 className="section-heading text-3xl sm:text-4xl mb-4">
                Always know which subjects need attention
              </h2>
              <p className="text-[var(--foreground-muted)] leading-relaxed mb-6">
                Every note has a freshness score from 0–100. As time passes without review, the
                score drops. MindBloom surfaces overdue notes before they become forgotten.
              </p>
              <ul className="space-y-3">
                {[
                  "New note created → starts at 100 (Fresh)",
                  "Review after 2 days → stays Fresh",
                  "Skipped review → score drops to Moderate",
                  "Long delay → becomes Stale or Critical",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--foreground-muted)]">
                    <CheckCircle2 size={16} className="text-[var(--fresh-500)] mt-0.5 shrink-0" style={{ color: "var(--fresh-500)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              {freshnessExamples.map((ex) => (
                <div key={ex.label} className="card p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`badge ${ex.color}`}>{ex.label}</span>
                    <span className="text-sm text-[var(--foreground-muted)]">{ex.desc}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="progress-track w-24">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${ex.score}%`,
                          background: ex.score >= 80 ? "var(--fresh-500)" : ex.score >= 50 ? "var(--moderate-500)" : ex.score >= 25 ? "var(--stale-500)" : "#db2777",
                        }}
                      />
                    </div>
                    <span className="text-sm font-bold w-8 text-right text-[var(--foreground)]">
                      {ex.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────── */}
      <section className="py-20 px-4 hero-gradient">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Start your revision streak today
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Free forever. No credit card. No downloads. Just better study habits.
          </p>
          <Link
            href="/signup"
            className="btn btn-primary btn-lg"
            id="bottom-cta-signup"
          >
            Create Your Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[var(--foreground-muted)]">
          <div className="flex items-center gap-2 font-semibold text-[var(--foreground)]">
            <div className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#0e87e8,#8b5cf6)" }}>
              <Brain size={13} color="white" />
            </div>
            MindBloom
          </div>
          <p>Built for students · Free forever · ₹0 cost</p>
          <p>© 2026 Arpit Anand Patel</p>
        </div>
      </footer>
    </div>
  );
}
