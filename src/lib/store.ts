"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type View =
  | { kind: "home" }
  | { kind: "lesson"; unitId: string; lessonId: string }
  | { kind: "quiz"; unitId: string }
  | { kind: "glossary" };

interface ProgressState {
  view: View;
  completedLessons: string[]; // "u1-l2"
  quizBest: Record<string, { score: number; total: number }>; // unitId -> best
  xp: number;
  lastLesson: string | null; // lesson key
  navigate: (view: View) => void;
  markLessonComplete: (key: string) => void;
  markLessonIncomplete: (key: string) => void;
  recordQuiz: (unitId: string, score: number, total: number) => void;
  resetProgress: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      view: { kind: "home" },
      completedLessons: [],
      quizBest: {},
      xp: 0,
      lastLesson: null,
      navigate: (view) => {
        if (view.kind === "lesson") set({ lastLesson: `${view.unitId}/${view.lessonId}` });
        set({ view });
        if (typeof window !== "undefined") {
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }
      },
      markLessonComplete: (key) => {
        const done = get().completedLessons;
        if (!done.includes(key)) {
          set({ completedLessons: [...done, key], xp: get().xp + 50 });
        }
      },
      markLessonIncomplete: (key) => {
        set({ completedLessons: get().completedLessons.filter((k) => k !== key) });
      },
      recordQuiz: (unitId, score, total) => {
        const prev = get().quizBest[unitId];
        if (!prev || score > prev.score) {
          set({ quizBest: { ...get().quizBest, [unitId]: { score, total } } });
        }
        set({ xp: get().xp + score * 10 });
      },
      resetProgress: () =>
        set({ completedLessons: [], quizBest: {}, xp: 0, lastLesson: null, view: { kind: "home" } }),
    }),
    {
      name: "dl-course-progress",
    }
  )
);
