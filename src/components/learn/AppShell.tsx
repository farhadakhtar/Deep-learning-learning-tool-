"use client";

import { useState, useMemo } from "react";
import { useProgress } from "@/lib/store";
import { curriculum, lessonKey } from "@/data/curriculum";
import { unitTheme } from "@/lib/content/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  BrainCircuit,
  Menu,
  House,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Moon,
  Sun,
  ListChecks,
  Award,
} from "lucide-react";
import { useTheme } from "next-themes";
import { HomeView } from "./HomeView";
import { LessonView } from "./LessonView";
import { QuizView } from "./QuizView";
import { cn } from "@/lib/utils";

function UnitNavList({ onNavigate }: { onNavigate?: () => void }) {
  const { view, navigate, completedLessons, quizBest } = useProgress();
  return (
    <nav aria-label="Course units" className="flex-1 space-y-4 overflow-y-auto px-3 py-4 nice-scroll">
      {curriculum.map((unit) => {
        const th = unitTheme[unit.number];
        const done = unit.lessons.filter((l) => completedLessons.includes(lessonKey(unit.id, l.id))).length;
        const pct = Math.round((done / unit.lessons.length) * 100);
        const expanded = view.kind === "lesson" || view.kind === "quiz" ? view.unitId === unit.id : unit.number === 1;
        return (
          <div key={unit.id}>
            <button
              onClick={() => {
                if (onNavigate) onNavigate();
                navigate({ kind: "lesson", unitId: unit.id, lessonId: unit.lessons[0].id });
              }}
              className="group flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-accent"
              aria-label={`Go to ${unit.title}`}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm",
                  th.bg
                )}
              >
                {unit.number}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold tracking-tight">{unit.title}</span>
                <span className="mt-0.5 flex items-center gap-2">
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                    <span className={cn("block h-full rounded-full transition-all", th.bg)} style={{ width: `${pct}%` }} />
                  </span>
                  <span className="text-[10px] tabular-nums text-muted-foreground">
                    {done}/{unit.lessons.length}
                  </span>
                </span>
              </span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>

            <div className={cn("ml-[26px] mt-1 space-y-0.5 border-l pl-3", expanded ? "border-border" : "border-transparent")}>
              {unit.lessons.map((lesson) => {
                const isDone = completedLessons.includes(lessonKey(unit.id, lesson.id));
                const active = view.kind === "lesson" && view.unitId === unit.id && view.lessonId === lesson.id;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      if (onNavigate) onNavigate();
                      navigate({ kind: "lesson", unitId: unit.id, lessonId: lesson.id });
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] transition-colors",
                      active ? "bg-accent font-semibold text-accent-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className={cn("h-3.5 w-3.5 shrink-0", th.text)} />
                    ) : (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/30" />
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  if (onNavigate) onNavigate();
                  navigate({ kind: "quiz", unitId: unit.id });
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12.5px] font-medium transition-colors",
                  view.kind === "quiz" && view.unitId === unit.id
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                )}
              >
                <ListChecks className="h-3.5 w-3.5 shrink-0" />
                <span>Unit Quiz</span>
                {quizBest[unit.id] && (
                  <span className="ml-auto rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-bold tabular-nums">
                    {quizBest[unit.id].score}/{quizBest[unit.id].total}
                  </span>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { xp, completedLessons, navigate } = useProgress();
  const total = curriculum.reduce((n, u) => n + u.lessons.length, 0);
  const pct = Math.round((completedLessons.length / total) * 100);
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-4 py-4">
        <button
          onClick={() => {
            if (onNavigate) onNavigate();
            navigate({ kind: "home" });
          }}
          className="flex items-center gap-2.5 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight">NeuralScholar</span>
            <span className="block text-[11px] text-muted-foreground">CCE3144 · Deep Learning</span>
          </span>
        </button>
        <div className="mt-4 rounded-xl border bg-muted/40 p-3">
          <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
            <span>Course progress</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Award className="h-3 w-3 text-primary" /> {xp} XP
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
          <p className="mt-1.5 text-[10px] tabular-nums text-muted-foreground">
            {completedLessons.length} of {total} lessons · {pct}%
          </p>
        </div>
      </div>
      <UnitNavList onNavigate={onNavigate} />
      <div className="border-t px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-xs"
          onClick={() => {
            if (onNavigate) onNavigate();
            navigate({ kind: "home" });
          }}
        >
          <House className="h-3.5 w-3.5" /> Course home
        </Button>
      </div>
    </div>
  );
}

export function AppShell() {
  const { view } = useProgress();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="flex h-13 items-center gap-2 px-3 py-2.5 sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open course menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">Course navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate between the four course units, their lessons and quizzes.
              </SheetDescription>
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <button
            onClick={() => useProgress.getState().navigate({ kind: "home" })}
            className="flex items-center gap-2 lg:hidden"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <BrainCircuit className="h-4 w-4" />
            </span>
            <span className="text-sm font-bold tracking-tight">NeuralScholar</span>
          </button>

          <p className="ml-2 hidden items-center gap-1.5 text-xs text-muted-foreground lg:flex">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Interactive Deep Learning — learn every concept of CCE3144 visually
          </p>

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="sticky top-13 hidden h-[calc(100vh-3.25rem)] w-72 shrink-0 border-r bg-sidebar lg:block">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1">
          {view.kind === "home" && <HomeView />}
          {view.kind === "lesson" && <LessonView />}
          {view.kind === "quiz" && <QuizView />}
        </main>
      </div>

      <footer className="mt-auto border-t bg-muted/30">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-4 py-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] text-xs text-muted-foreground sm:flex-row">
          <p>
            <span className="font-semibold text-foreground">NeuralScholar</span> — Interactive course built from
            CCE3144 lecture notes (Dr. Manoj Kumar Sharma, Manipal University Jaipur)
          </p>
          <p>Progress is saved in your browser</p>
        </div>
      </footer>
    </div>
  );
}
