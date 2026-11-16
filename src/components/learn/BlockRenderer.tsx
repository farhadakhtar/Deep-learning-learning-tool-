"use client";

import { useState, memo } from "react";
import type { Block, QuizItem } from "@/lib/content/types";
import { Math, RichText } from "./math";
import { cn } from "@/lib/utils";
import {
  Info,
  Lightbulb,
  AlertTriangle,
  KeyRound,
  GraduationCap,
  PencilLine,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { WidgetRenderer } from "./widgets/registry";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Inline quiz card used inside lessons                                */
/* ------------------------------------------------------------------ */
function InlineQuiz({ items }: { items: QuizItem[] }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  return (
    <div className="not-prose my-6 space-y-4">
      {items.map((q) => {
        const picked = answers[q.id];
        return (
          <div key={q.id} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="mb-3 flex items-start gap-2 text-sm font-medium">
              <PencilLine className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <RichText text={q.question} />
            </p>
            <div className="grid gap-2">
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const isCorrect = i === q.correct;
                const show = picked !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                    disabled={show}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-all",
                      !show && "hover:border-primary/50 hover:bg-accent",
                      show && isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                      show && isPicked && !isCorrect && "border-destructive/60 bg-destructive/10",
                      show && !isCorrect && !isPicked && "opacity-60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold",
                        show && isCorrect
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : show && isPicked
                            ? "border-destructive bg-destructive text-white"
                            : "border-muted-foreground/40"
                      )}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <RichText text={opt} />
                    {show && isCorrect && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />}
                    {show && isPicked && !isCorrect && <XCircle className="ml-auto h-4 w-4 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {picked !== undefined && (
              <p className="mt-3 rounded-lg bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Why: </span>
                <RichText text={q.explanation} />
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Worked example                                                      */
/* ------------------------------------------------------------------ */
function ExampleBlock({ block }: { block: Extract<Block, { type: "example" }> }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border-2 border-primary/25 bg-card shadow-sm">
      <div className="flex items-center gap-2 bg-primary/10 px-4 py-3">
        <PencilLine className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold tracking-tight">{block.title}</h4>
      </div>
      <div className="p-4">
        {block.given && block.given.length > 0 && (
          <div className="mb-4 rounded-lg bg-muted p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Given</p>
            <ul className="space-y-1 text-sm">
              {block.given.map((g, i) => (
                <li key={i} className="flex gap-2">
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  <RichText text={g} />
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="space-y-2">
          {block.steps.map((step, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-lg border">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <RichText text={step.label} />
                  <ChevronRight
                    className={cn("ml-auto h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-90")}
                  />
                </button>
                {isOpen && (
                  <div className="border-t px-4 pb-3 pt-3">
                    <BlockList blocks={step.blocks} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Callouts                                                            */
/* ------------------------------------------------------------------ */
const calloutStyles = {
  info: { icon: Info, cls: "border-sky-500/30 bg-sky-500/5", iconCls: "text-sky-600 dark:text-sky-400" },
  tip: { icon: Lightbulb, cls: "border-emerald-500/30 bg-emerald-500/5", iconCls: "text-emerald-600 dark:text-emerald-400" },
  warning: { icon: AlertTriangle, cls: "border-amber-500/40 bg-amber-500/5", iconCls: "text-amber-600 dark:text-amber-400" },
  key: { icon: KeyRound, cls: "border-violet-500/30 bg-violet-500/5", iconCls: "text-violet-600 dark:text-violet-400" },
  exam: { icon: GraduationCap, cls: "border-rose-500/30 bg-rose-500/5", iconCls: "text-rose-600 dark:text-rose-400" },
} as const;

function Callout({ block }: { block: Extract<Block, { type: "callout" }> }) {
  const s = calloutStyles[block.variant];
  const Icon = s.icon;
  return (
    <div className={cn("not-prose my-5 rounded-xl border p-4", s.cls)}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className={cn("h-4 w-4", s.iconCls)} />
        {block.title}
      </p>
      <div className="space-y-2 text-sm leading-relaxed [&_p]:leading-relaxed">
        <BlockList blocks={block.blocks} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Compare (side by side)                                              */
/* ------------------------------------------------------------------ */
function Compare({ block }: { block: Extract<Block, { type: "compare" }> }) {
  return (
    <div className="not-prose my-6 grid gap-3 md:grid-cols-2">
      {block.pairs.map((p, i) => (
        <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">{p.label}</p>
          <ul className="space-y-1.5 text-sm">
            {p.left.map((l, j) => (
              <li key={j} className="flex gap-2">
                <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                <RichText text={l} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main recursive renderer                                             */
/* ------------------------------------------------------------------ */
export function BlockList({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => (
        <BlockView key={i} block={b} />
      ))}
    </>
  );
}

export const BlockView = memo(function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <p className="my-2.5 text-[0.95rem] leading-7 text-foreground/90">
          <RichText text={block.value} />
        </p>
      );
    case "bullets":
      return (
        <ul className="my-3 space-y-1.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[0.95rem] leading-7 text-foreground/90">
              <span className="mt-[0.65rem] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
              <span>
                <RichText text={it} />
              </span>
            </li>
          ))}
        </ul>
      );
    case "numbered":
      return (
        <ol className="my-3 space-y-1.5">
          {block.items.map((it, i) => (
            <li key={i} className="flex gap-2.5 text-[0.95rem] leading-7 text-foreground/90">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                {i + 1}
              </span>
              <span>
                <RichText text={it} />
              </span>
            </li>
          ))}
        </ol>
      );
    case "heading":
      return (
        <h3 className="mb-2 mt-7 text-base font-semibold tracking-tight text-foreground">
          <RichText text={block.value} />
        </h3>
      );
    case "formula":
      return (
        <figure className="not-prose my-4 rounded-xl border bg-muted/50 px-4 py-3">
          <Math tex={block.tex} display />
          {block.caption && (
            <figcaption className="mt-1 text-center text-xs text-muted-foreground">{block.caption}</figcaption>
          )}
        </figure>
      );
    case "callout":
      return <Callout block={block} />;
    case "table":
      return (
        <figure className="not-prose my-5 overflow-x-auto rounded-xl border shadow-sm">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-3 py-2.5 text-left font-semibold tracking-tight">
                    <RichText text={h} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/40">
                  {r.map((c, j) => (
                    <td key={j} className="px-3 py-2 align-top text-muted-foreground">
                      <RichText text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {block.caption && (
            <figcaption className="border-t bg-muted/30 px-3 py-1.5 text-xs text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    case "example":
      return <ExampleBlock block={block} />;
    case "widget":
      return (
        <div className="not-prose my-7">
          <WidgetRenderer id={block.widgetId} title={block.title} description={block.description} />
        </div>
      );
    case "quiz":
      return <InlineQuiz items={block.items} />;
    case "compare":
      return <Compare block={block} />;
    default:
      return null;
  }
});
