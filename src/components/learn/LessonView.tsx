"use client";

import { useEffect, useState } from "react";
import { useProgress } from "@/lib/store";
import { getLesson, getCourseSequence, lessonKey } from "@/data/curriculum";
import { unitTheme } from "@/lib/content/types";
import { BlockList } from "./BlockRenderer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, ListChecks, Timer } from "lucide-react";
import { toast } from "sonner";

export function LessonView() {
  const { view, navigate, completedLessons, markLessonComplete } = useProgress();
  const [readPct, setReadPct] = useState(0);
  const { unit, lesson } =
    view.kind === "lesson" ? getLesson(view.unitId, view.lessonId) : { unit: undefined, lesson: undefined };

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      setReadPct(Math.min(100, Math.max(0, pct || 0)));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [view]);

  if (!unit || !lesson) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        Lesson not found.{" "}
        <button className="underline" onClick={() => navigate({ kind: "home" })}>
          Go home
        </button>
      </div>
    );
  }

  const th = unitTheme[unit.number];
  const key = lessonKey(unit.id, lesson.id);
  const isDone = completedLessons.includes(key);
  const seq = getCourseSequence();
  const idx = seq.findIndex((s) => s.kind === "lesson" && s.unitId === unit.id && s.lessonId === lesson.id);
  const prev = idx > 0 ? seq[idx - 1] : null;
  const next = idx >= 0 && idx < seq.length - 1 ? seq[idx + 1] : null;

  const goNext = () => {
    if (!isDone) {
      markLessonComplete(key);
      toast.success("Lesson completed", { description: "+50 XP earned. Keep going!" });
    }
    if (next) {
      if (next.kind === "quiz") navigate({ kind: "quiz", unitId: next.unitId });
      else navigate({ kind: "lesson", unitId: next.unitId, lessonId: next.lessonId });
    }
  };

  return (
    <div>
      {/* reading progress */}
      <div className="sticky top-13 z-30 h-0.5 w-full bg-transparent">
        <div className={cn("h-full transition-[width] duration-150", th.bg)} style={{ width: `${readPct}%` }} />
      </div>

      <article className="mx-auto max-w-3xl px-4 pb-16 pt-8 sm:px-6">
        {/* Header */}
        <header className="mb-8">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white", th.bg)}>
              {unit.code}
            </span>
            <span>/</span>
            <span className="max-w-[280px] truncate font-medium">{unit.title}</span>
          </nav>
          <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{lesson.title}</h1>
          {lesson.subtitle && <p className="mt-2.5 text-base leading-relaxed text-muted-foreground">{lesson.subtitle}</p>}
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Timer className="h-3.5 w-3.5" /> {lesson.minutes} min read
            </span>
            <span className="flex items-center gap-1.5">
              {isDone ? <CheckCircle2 className={cn("h-3.5 w-3.5", th.text)} /> : <Circle className="h-3.5 w-3.5" />}
              {isDone ? "Completed" : "In progress"}
            </span>
          </div>
        </header>

        {/* Sections */}
        <div className="space-y-4">
          {lesson.sections.map((section, i) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm",
                    th.bg
                  )}
                >
                  {i + 1}
                </span>
                <h2 className="text-lg font-bold tracking-tight sm:text-xl">{section.title}</h2>
              </div>
              <div className="[&>*:first-child]:mt-0">
                <BlockList blocks={section.blocks} />
              </div>
            </section>
          ))}
        </div>

        {/* Footer nav */}
        <footer className="mt-14 border-t pt-6">
          <div className="flex flex-col gap-4">
            {!isDone && (
              <Button onClick={() => { markLessonComplete(key); toast.success("Lesson completed", { description: "+50 XP earned." }); }} className="w-full gap-2 sm:w-auto" size="lg">
                <CheckCircle2 className="h-4 w-4" /> Mark lesson as complete
              </Button>
            )}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {prev ? (
                <Button
                  variant="outline"
                  onClick={() =>
                    prev.kind === "quiz"
                      ? navigate({ kind: "quiz", unitId: prev.unitId })
                      : navigate({ kind: "lesson", unitId: prev.unitId, lessonId: prev.lessonId })
                  }
                  className="justify-start gap-2 text-left"
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate">{prev.title}</span>
                </Button>
              ) : (
                <span />
              )}
              {next ? (
                <Button
                  onClick={goNext}
                  className={cn("justify-between gap-2 sm:justify-end", next.kind === "quiz" && "bg-u1 text-white hover:bg-u1/90")}
                >
                  <span className="flex min-w-0 items-center gap-1.5 truncate">
                    {next.kind === "quiz" && <ListChecks className="h-4 w-4 shrink-0" />}
                    <span className="truncate">{next.title}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Button>
              ) : (
                <span />
              )}
            </div>
          </div>
        </footer>
      </article>
    </div>
  );
}
