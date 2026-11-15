"use client";

import { useMemo, useState } from "react";
import { useProgress } from "@/lib/store";
import { getUnit } from "@/data/curriculum";
import { unitTheme } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RichText } from "./math";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ListChecks,
  RotateCcw,
  Trophy,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export function QuizView() {
  const { view, navigate, quizBest, recordQuiz } = useProgress();
  const unit = view.kind === "quiz" ? getUnit(view.unitId) : undefined;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = unit?.quiz ?? [];
  const q = questions[current];
  const answeredCount = Object.keys(answers).length;
  const score = questions.filter((qq) => answers[qq.id] === qq.correct).length;

  if (!unit || !q) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        Quiz not found.{" "}
        <button className="underline" onClick={() => navigate({ kind: "home" })}>
          Go home
        </button>
      </div>
    );
  }

  const th = unitTheme[unit.number];
  const picked = answers[q.id];
  const best = quizBest[unit.id];

  const submit = () => {
    setSubmitted(true);
    recordQuiz(unit.id, score, questions.length);
    toast.success(
      `You scored ${score}/${questions.length}`,
      { description: score === questions.length ? "Perfect score! Outstanding." : "Review the explanations below and retry any time." }
    );
  };

  const retry = () => {
    setAnswers({});
    setSubmitted(false);
    setCurrent(0);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-8">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
          <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white", th.bg)}>
            {unit.code}
          </span>
          <span>/</span>
          <span className="font-medium">Unit Quiz</span>
        </nav>
        <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight sm:text-3xl">
          <ListChecks className={cn("h-7 w-7", th.text)} />
          {unit.title} — Quiz
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {questions.length} multiple-choice questions from the lecture notes. Answer all, then submit. Your best
          score is saved.
          {best && (
            <span className="ml-1 font-semibold text-foreground">
              (Best: {best.score}/{best.total})
            </span>
          )}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Progress value={(answeredCount / questions.length) * 100} className="h-2 flex-1" />
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {answeredCount}/{questions.length} answered
          </span>
        </div>
      </header>

      {!submitted ? (
        <div className="rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className={cn("rounded-full px-3 py-1 text-xs font-bold tabular-nums text-white", th.bg)}>
              Question {current + 1} / {questions.length}
            </span>
          </div>
          <p className="mb-5 text-base font-medium leading-relaxed">
            <RichText text={q.question} />
          </p>
          <div className="grid gap-2.5">
            {q.options.map((opt, i) => {
              const isPicked = picked === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                    isPicked
                      ? "border-primary bg-primary/10 font-medium shadow-sm"
                      : "hover:border-primary/40 hover:bg-accent"
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
                      isPicked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <RichText text={opt} />
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              disabled={current === 0}
              onClick={() => setCurrent((c) => Math.max(0, c - 1))}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))} className="gap-1.5">
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={answeredCount < questions.length}
                className="gap-1.5"
              >
                <Award className="h-4 w-4" />
                {answeredCount < questions.length
                  ? `Answer ${questions.length - answeredCount} more`
                  : "Submit answers"}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Result card */}
          <div
            className={cn(
              "rounded-2xl border-2 p-6 text-center shadow-sm",
              score === questions.length
                ? "border-emerald-500/40 bg-emerald-500/5"
                : score >= questions.length * 0.6
                  ? "border-primary/40 bg-primary/5"
                  : "border-destructive/40 bg-destructive/5"
            )}
          >
            <Trophy
              className={cn(
                "mx-auto mb-3 h-10 w-10",
                score === questions.length ? "text-emerald-500" : score >= questions.length * 0.6 ? "text-primary" : "text-destructive"
              )}
            />
            <p className="text-3xl font-extrabold tabular-nums tracking-tight">
              {score}
              <span className="text-xl text-muted-foreground">/{questions.length}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {score === questions.length
                ? "Perfect! You have mastered this unit."
                : score >= questions.length * 0.6
                  ? "Well done — review the misses below."
                  : "Take another look at the lessons, then retry."}
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2.5">
              <Button onClick={retry} variant="outline" className="gap-1.5">
                <RotateCcw className="h-4 w-4" /> Retry quiz
              </Button>
              <Button
                onClick={() => navigate({ kind: "lesson", unitId: unit.id, lessonId: unit.lessons[0].id })}
                className="gap-1.5"
              >
                Back to lessons
              </Button>
            </div>
          </div>

          {/* Review */}
          <h2 className="pt-2 text-sm font-bold uppercase tracking-wider text-muted-foreground">Review answers</h2>
          {questions.map((qq, qi) => {
            const ans = answers[qq.id];
            const ok = ans === qq.correct;
            return (
              <div key={qq.id} className="rounded-xl border bg-card p-4 shadow-sm">
                <p className="mb-2 flex items-start gap-2 text-sm font-medium">
                  {ok ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  )}
                  <span>
                    <span className="mr-1 text-muted-foreground">Q{qi + 1}.</span>
                    <RichText text={qq.question} />
                  </span>
                </p>
                <div className="ml-6 space-y-1 text-xs">
                  {!ok && (
                    <p className="text-destructive">
                      Your answer: <RichText text={qq.options[ans] ?? "—"} />
                    </p>
                  )}
                  <p className="text-emerald-600 dark:text-emerald-400">
                    Correct: <RichText text={qq.options[qq.correct]} />
                  </p>
                  <p className="rounded-lg bg-muted p-2.5 leading-relaxed text-muted-foreground">
                    <RichText text={qq.explanation} />
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
