"use client";

import { useProgress } from "@/lib/store";
import { curriculum, lessonKey, totalLessons, totalQuizQuestions } from "@/data/curriculum";
import { unitTheme } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  BookOpen,
  FlaskConical,
  ListChecks,
  PlayCircle,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";

function HeroArt() {
  // Lightweight animated neural network SVG
  const layers = [4, 6, 6, 3];
  const w = 560;
  const h = 260;
  const gap = w / (layers.length + 1);
  const nodes: { x: number; y: number; l: number; i: number }[] = [];
  layers.forEach((n, l) => {
    for (let i = 0; i < n; i++) {
      nodes.push({ x: gap * (l + 1), y: h / 2 + (i - (n - 1) / 2) * 36, l, i });
    }
  });
  const edges: { a: (typeof nodes)[0]; b: (typeof nodes)[0] }[] = [];
  for (const a of nodes) for (const b of nodes) if (b.l === a.l + 1) edges.push({ a, b });
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-40 w-full sm:h-52" role="img" aria-label="Animated neural network illustration">
      <defs>
        <linearGradient id="hero-line" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--u1)" stopOpacity="0.1" />
          <stop offset="100%" stopColor="var(--u4)" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {edges.map((e, i) => (
        <line
          key={i}
          x1={e.a.x}
          y1={e.a.y}
          x2={e.b.x}
          y2={e.b.y}
          stroke="url(#hero-line)"
          strokeWidth="1.2"
          className="flow-line"
          style={{ animationDelay: `${(i % 12) * 0.09}s`, animationDuration: `${1.4 + (i % 5) * 0.22}s` }}
        />
      ))}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.x}
          cy={n.y}
          r={n.l === 0 ? 7 : 6}
          fill={n.l === 0 ? "var(--u1)" : n.l === layers.length - 1 ? "var(--u4)" : "var(--primary)"}
          opacity={n.l === 0 || n.l === layers.length - 1 ? 1 : 0.75}
          className="pulse-soft"
          style={{ animationDelay: `${(i % 8) * 0.21}s` }}
        />
      ))}
    </svg>
  );
}

export function HomeView() {
  const { navigate, completedLessons, quizBest, lastLesson, xp } = useProgress();
  const total = totalLessons();
  const donePct = Math.round((completedLessons.length / total) * 100);
  const bestQuizTotal = Object.values(quizBest).reduce((n, q) => n + q.score, 0);
  const bestQuizPossible = Object.values(quizBest).reduce((n, q) => n + q.total, 0);

  let continueTarget: { unitId: string; lessonId: string; title: string; unitNumber: number } | null = null;
  if (lastLesson) {
    const [unitId, lessonId] = lastLesson.split("/");
    const unit = curriculum.find((u) => u.id === unitId);
    const lesson = unit?.lessons.find((l) => l.id === lessonId);
    if (unit && lesson) continueTarget = { unitId, lessonId, title: lesson.title, unitNumber: unit.number };
  }
  if (!continueTarget) {
    outer: for (const u of curriculum) {
      for (const l of u.lessons) {
        if (!completedLessons.includes(lessonKey(u.id, l.id))) {
          continueTarget = { unitId: u.id, lessonId: l.id, title: l.title, unitNumber: u.number };
          break outer;
        }
      }
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="hero-grid relative border-b">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Full course · 4 units · {total} lessons · {totalQuizQuestions()} quiz questions
              </p>
              <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
                Learn Deep Learning
                <span className="block bg-gradient-to-r from-u1 via-u3 to-u4 bg-clip-text text-transparent">
                  completely, visually.
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                Every concept from the CCE3144 lecture notes — perceptrons, backpropagation, CNNs, RNNs,
                LSTMs, GRUs, autoencoders, VAEs, GANs and Boltzmann machines — taught through step-by-step
                worked examples and hands-on interactive labs you can experiment with.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button
                  size="lg"
                  className="gap-2 shadow-md"
                  onClick={() =>
                    continueTarget
                      ? navigate({ kind: "lesson", unitId: continueTarget.unitId, lessonId: continueTarget.lessonId })
                      : navigate({ kind: "lesson", unitId: "u1", lessonId: "u1-l1" })
                  }
                >
                  <PlayCircle className="h-4.5 w-4.5" />
                  {completedLessons.length > 0 ? "Continue learning" : "Start learning"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  onClick={() => navigate({ kind: "quiz", unitId: "u1" })}
                >
                  <ListChecks className="h-4.5 w-4.5" /> Try a quiz
                </Button>
              </div>
              {continueTarget && (
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ArrowRight className="h-3 w-3 text-primary" />
                  Up next: <span className="font-medium text-foreground">{continueTarget.title}</span>
                </p>
              )}
            </div>
            <div className="hidden lg:block">
              <HeroArt />
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: BookOpen, label: "Lessons completed", value: `${completedLessons.length}/${total}` },
              { icon: Target, label: "Course progress", value: `${donePct}%` },
              { icon: ListChecks, label: "Best quiz score", value: bestQuizPossible > 0 ? `${bestQuizTotal}/${bestQuizPossible}` : "—" },
              { icon: Sparkles, label: "Experience", value: `${xp} XP` },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border bg-card/80 p-3.5 shadow-sm backdrop-blur">
                <s.icon className="mb-2 h-4 w-4 text-primary" />
                <p className="text-lg font-bold tabular-nums tracking-tight">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Units */}
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h2 className="mb-1 text-xl font-bold tracking-tight">The four modules</h2>
        <p className="mb-6 text-sm text-muted-foreground">
          Each unit is a self-contained journey — theory, worked numerical examples, interactive labs and a
          final quiz.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {curriculum.map((unit) => {
            const th = unitTheme[unit.number];
            const done = unit.lessons.filter((l) => completedLessons.includes(lessonKey(unit.id, l.id))).length;
            const pct = Math.round((done / unit.lessons.length) * 100);
            const mins = unit.lessons.reduce((n, l) => n + l.minutes, 0);
            return (
              <button
                key={unit.id}
                onClick={() => navigate({ kind: "lesson", unitId: unit.id, lessonId: unit.lessons[0].id })}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
                )}
              >
                <div className={cn("absolute inset-x-0 top-0 h-1", th.bg)} />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm",
                        th.bg
                      )}
                    >
                      {unit.number}
                    </span>
                    <div>
                      <p className={cn("text-[11px] font-bold uppercase tracking-wider", th.text)}>{unit.code}</p>
                      <h3 className="text-base font-bold leading-snug tracking-tight">{unit.title}</h3>
                    </div>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{unit.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {unit.topics.slice(0, 4).map((t) => (
                    <span key={t} className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-medium", th.softBg, th.text)}>
                      {t}
                    </span>
                  ))}
                  {unit.topics.length > 4 && (
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      +{unit.topics.length - 4} more
                    </span>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <Progress value={pct} className="h-1.5 flex-1" />
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground">{pct}%</span>
                </div>
                <div className="mt-2.5 flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" /> {unit.lessons.length} lessons
                  </span>
                  <span className="flex items-center gap-1">
                    <Timer className="h-3 w-3" /> ~{Math.round(mins / 6) * 5} min
                  </span>
                  <span className="flex items-center gap-1">
                    <FlaskConical className="h-3 w-3" /> {unit.quiz.length}-question quiz
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* How it teaches */}
      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <h2 className="mb-6 text-xl font-bold tracking-tight">How you will learn</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Every concept, faithfully covered",
                body: "Lessons follow the full lecture notes — definitions, formulas, comparison tables and all worked numerical examples, nothing dropped.",
              },
              {
                icon: FlaskConical,
                title: "20+ interactive labs",
                body: "Slide filters across images, step through backpropagation numbers, open and close LSTM gates, train a live autoencoder — learning by doing.",
              },
              {
                icon: ListChecks,
                title: "Check yourself constantly",
                body: "Inline concept checks inside lessons plus a 15-question MCQ exam at the end of every unit, each with a full explanation.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border bg-card p-5 shadow-sm">
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mb-1.5 text-sm font-bold tracking-tight">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
