import type { Unit } from "@/lib/content/types";
import { u1 } from "./u1";
import { u2 } from "./u2";
import { u3 } from "./u3";
import { u4 } from "./u4";

export const curriculum: Unit[] = [u1, u2, u3, u4];

export function getUnit(unitId: string): Unit | undefined {
  return curriculum.find((u) => u.id === unitId);
}

export function getLesson(unitId: string, lessonId: string) {
  const unit = getUnit(unitId);
  const lesson = unit?.lessons.find((l) => l.id === lessonId);
  return { unit, lesson };
}

export function lessonKey(unitId: string, lessonId: string) {
  return `${unitId}-${lessonId}`;
}

/** Flat ordered list of all lessons + quizzes for prev/next navigation */
export function getCourseSequence() {
  const seq: { kind: "lesson" | "quiz"; unitId: string; lessonId: string; title: string }[] = [];
  for (const u of curriculum) {
    for (const l of u.lessons) {
      seq.push({ kind: "lesson", unitId: u.id, lessonId: l.id, title: l.title });
    }
    seq.push({ kind: "quiz", unitId: u.id, lessonId: "quiz", title: `${u.code} Quiz` });
  }
  return seq;
}

export function totalLessons() {
  return curriculum.reduce((n, u) => n + u.lessons.length, 0);
}

export function totalQuizQuestions() {
  return curriculum.reduce((n, u) => n + u.quiz.length, 0);
}

export function totalWidgetCount() {
  return curriculum.reduce((n, u) => {
    return (
      n +
      u.lessons.reduce((m, l) => {
        return m + l.sections.reduce((k, s) => k + s.blocks.filter((b) => b.type === "widget").length, 0);
      }, 0)
    );
  }, 0);
}
