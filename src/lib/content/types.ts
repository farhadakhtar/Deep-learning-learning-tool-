/**
 * Content model for the interactive Deep Learning course.
 * Text fields support inline math wrapped in $...$ (rendered via KaTeX).
 */

export type Block =
  | { type: "text"; value: string }
  | { type: "bullets"; items: string[] }
  | { type: "numbered"; items: string[] }
  | { type: "heading"; value: string }
  | { type: "formula"; tex: string; caption?: string }
  | {
      type: "callout";
      variant: "info" | "tip" | "warning" | "key" | "exam";
      title: string;
      blocks: Block[];
    }
  | { type: "table"; headers: string[]; rows: string[][]; caption?: string }
  | {
      type: "example";
      title: string;
      given?: string[];
      steps: { label: string; blocks: Block[] }[];
    }
  | { type: "widget"; widgetId: string; title?: string; description?: string }
  | { type: "quiz"; items: QuizItem[] }
  | { type: "compare"; pairs: { label: string; left: string[]; right?: string[] }[] };

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle?: string;
  minutes: number;
  sections: Section[];
}

export interface Unit {
  id: string;
  number: 1 | 2 | 3 | 4;
  code: string;
  title: string;
  subtitle: string;
  description: string;
  sourceFile: string;
  topics: string[];
  lessons: Lesson[];
  quiz: QuizItem[];
}

/** Helper to keep unit accent classes colocated */
export const unitTheme: Record<
  number,
  {
    text: string;
    bg: string;
    softBg: string;
    border: string;
    dot: string;
    gradient: string;
    ring: string;
  }
> = {
  1: {
    text: "text-u1",
    bg: "bg-u1",
    softBg: "bg-u1/10",
    border: "border-u1/40",
    dot: "bg-u1",
    gradient: "from-u1/20 via-u1/5 to-transparent",
    ring: "ring-u1/30",
  },
  2: {
    text: "text-u2",
    bg: "bg-u2",
    softBg: "bg-u2/10",
    border: "border-u2/40",
    dot: "bg-u2",
    gradient: "from-u2/20 via-u2/5 to-transparent",
    ring: "ring-u2/30",
  },
  3: {
    text: "text-u3",
    bg: "bg-u3",
    softBg: "bg-u3/10",
    border: "border-u3/40",
    dot: "bg-u3",
    gradient: "from-u3/20 via-u3/5 to-transparent",
    ring: "ring-u3/30",
  },
  4: {
    text: "text-u4",
    bg: "bg-u4",
    softBg: "bg-u4/10",
    border: "border-u4/40",
    dot: "bg-u4",
    gradient: "from-u4/20 via-u4/5 to-transparent",
    ring: "ring-u4/30",
  },
};
