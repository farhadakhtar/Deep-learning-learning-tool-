"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { WidgetFrame, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookOpen, ChevronDown, Info, RotateCcw, Sparkles } from "lucide-react";

/* ---------- math (all values computed live from the notes' weights) ---------- */
const f4 = (x: number) => {
  const s = x.toFixed(4);
  return s === "-0.0000" ? "0.0000" : s;
};
const mv = (M: number[][], v: number[]) => M.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
const add = (a: number[], b: number[]) => a.map((x, i) => x + b[i]);
const softmax = (z: number[]) => {
  const m = Math.max(...z);
  const ex = z.map((x) => Math.exp(x - m));
  const s = ex.reduce((p, c) => p + c, 0);
  return ex.map((x) => x / s);
};

const VOCAB = ["I", "love", "deep", "learning"];
const E: number[][] = [
  [0.1, 0.2], // I
  [0.3, -0.1], // love
  [-0.2, 0.4], // deep
  [0.5, 0.1], // learning
];
/* recurrence identical to Worked Example 1 */
const Wxh = [
  [0.5, -0.3],
  [0.2, 0.4],
];
const Whh = [
  [0.1, 0.4],
  [-0.2, 0.3],
];
const bh = [0.1, -0.1];
/* new language-model read-out */
const Why = [
  [0.2, 0.1],
  [0.1, -0.2],
  [-0.3, 0.4],
  [0.4, 0.2],
];
const by = [0, 0, 0, 0.1];

const stepRNN = (e: number[], h: number[]) => {
  const wx = mv(Wxh, e);
  const wh = mv(Whh, h);
  const a = add(add(wx, wh), bh);
  const hn = a.map(Math.tanh);
  return { wx, wh, a, h: hn };
};

/* ---------- display helpers ---------- */
function VecChip({
  label,
  v,
  tone = "default",
  className,
}: {
  label?: string;
  v: number[];
  tone?: "default" | "muted" | "accent" | "warn" | "good";
  className?: string;
}) {
  const tones = {
    default: "border-border bg-muted/50 text-foreground",
    muted: "border-border/60 bg-muted/30 text-muted-foreground",
    accent: "border-u3/40 bg-u3/10 text-u3",
    warn: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
    good: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2 py-1", tones[tone], className)}>
      {label && <span className="text-[10px] font-semibold tracking-wide">{label}</span>}
      <span className="flex items-center gap-0.5 font-mono text-xs leading-tight">
        <span className="text-muted-foreground">[</span>
        <span className="flex flex-col">
          {v.map((x, i) => (
            <span key={i}>{f4(x)}</span>
          ))}
        </span>
        <span className="text-muted-foreground">]</span>
      </span>
    </span>
  );
}

function MatChip({ label, m }: { label: string; m: number[][] }) {
  return (
    <div className="rounded-lg border bg-muted/40 p-2">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${m[0].length}, minmax(0,1fr))` }}>
        {m.flat().map((x, i) => (
          <span key={i} className="min-w-14 rounded bg-background px-1.5 py-0.5 text-center font-mono text-xs">
            {f4(x)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- steps ---------- */
type Step =
  | { kind: "intro" }
  | { kind: "embed" | "recur" | "tanh" | "logits" | "softmax" | "loss"; t: 0 | 1 }
  | { kind: "summary" };

const SUBKINDS = ["embed", "recur", "tanh", "logits", "softmax", "loss"] as const;
const STEPS: Step[] = [
  { kind: "intro" } as Step,
  ...([0, 1] as const).flatMap((t) => SUBKINDS.map((kind) => ({ kind, t }) as Step)),
  { kind: "summary" } as Step,
];

/* ---------- main ---------- */
export default function Component({ title, description }: { title?: string; description?: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [generated, setGenerated] = useState(false);

  /* training forward pass: (I -> love), (love -> deep) */
  const fwd = useMemo(() => {
    const rows: {
      e: number[];
      wx: number[];
      wh: number[];
      a: number[];
      h: number[];
      logits: number[];
      P: number[];
      L: number;
    }[] = [];
    let h = [0, 0];
    for (let t = 0; t < 2; t++) {
      const e = E[t];
      const r = stepRNN(e, h);
      h = r.h;
      const logits = add(mv(Why, h), by);
      const P = softmax(logits);
      const L = -Math.log(P[t + 1]);
      rows.push({ e, wx: r.wx, wh: r.wh, a: r.a, h: r.h, logits, P, L });
    }
    const avg = (rows[0].L + rows[1].L) / 2;
    return { rows, h0: [0, 0] as number[], avg, ppl: Math.exp(avg) };
  }, []);

  /* greedy generation from "I": feed argmax back for 4 steps */
  const greedy = useMemo(() => {
    let h = [0, 0];
    let cur = 0;
    const chain: { word: string; p: number }[] = [];
    for (let s = 0; s < 4; s++) {
      const r = stepRNN(E[cur], h);
      h = r.h;
      const P = softmax(add(mv(Why, h), by));
      let best = 0;
      for (let i = 1; i < 4; i++) if (P[i] > P[best]) best = i;
      chain.push({ word: VOCAB[best], p: P[best] });
      cur = best;
    }
    return chain;
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1100);
    return () => clearInterval(id);
  }, [playing]);

  const cur = STEPS[step];
  const tOf = (s: Step): 0 | 1 | null => ("t" in s ? s.t : null);
  const focusT: 0 | 1 = step >= 7 ? 1 : 0; // which time step the distribution panel shows
  const distVisible = step >= 5; // past t=1 logits
  const lossVisible = (t: 0 | 1) => step >= 6 + t * 6;
  const doneT = (t: 0 | 1) => step >= 4 + t * 6; // past the tanh sub-step of this t
  const cellActive = (t: 0 | 1) => tOf(cur) === t;

  /* diagram geometry */
  const X0 = 85;
  const X1 = 330;
  const X2 = 565;
  const CY = 118;

  const row = fwd.rows[focusT];

  return (
    <WidgetFrame
      title={title ?? "RNN language model — next-word prediction"}
      description={
        description ??
        "Worked Example 5: the same recurrence as before, but inputs are word embeddings and the read-out is a softmax over the vocabulary. Watch cross-entropy loss and perplexity appear."
      }
      accent="u3"
    >
      {/* vocabulary row */}
      <div>
        <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-u3">
          <BookOpen className="h-3.5 w-3.5" /> Toy vocabulary (4 words) — embedding table E
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {VOCAB.map((w, i) => {
            const isInput = step > 0 && ((focusT === 0 && i === 0) || (focusT === 1 && i === 1));
            return (
              <div
                key={w}
                className={cn(
                  "rounded-xl border bg-muted/20 p-2.5 transition-all duration-300",
                  isInput ? "border-u3/50 ring-1 ring-u3/30" : "border-border"
                )}
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold">{w}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">idx {i}</span>
                </div>
                <p className="mt-1 font-mono text-xs">
                  <span className="text-muted-foreground">E[{w}] = [</span>
                  {f4(E[i][0])}, {f4(E[i][1])}
                  <span className="text-muted-foreground">]</span>
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* training sentence */}
      <div className="mt-3 rounded-xl border bg-muted/20 p-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-u3">Training sentence</span>
          {VOCAB.map((w, i) => (
            <span key={w} className="flex items-center gap-2">
              <span
                className={cn(
                  "rounded-lg border px-2.5 py-1 font-mono text-xs font-semibold",
                  i < 2 ? "border-u3/40 bg-u3/10 text-foreground" : "border-border bg-background text-muted-foreground"
                )}
              >
                {w}
              </span>
              {i < 3 && <span className="font-mono text-xs text-muted-foreground">→</span>}
            </span>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-u3/40 bg-u3/10 px-2.5 py-0.5 font-mono text-[11px]">
            (I → love)
          </span>
          <span className="rounded-full border border-u3/40 bg-u3/10 px-2.5 py-0.5 font-mono text-[11px]">
            (love → deep)
          </span>
          <span className="text-[11px] text-muted-foreground">input → target pairs; &ldquo;learning&rdquo; is never a target (sentence end)</span>
        </div>
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2.5">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Teacher forcing:</span> during training the TRUE previous
            word is fed as input even if the model&rsquo;s own prediction was wrong — this stabilises and speeds up
            training. At generation time there is no true word, so the model must feed its own prediction back.
          </p>
        </div>
      </div>

      {/* step controls */}
      <WidgetControls className="mt-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="min-h-11 rounded-lg border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
          className="min-h-11 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40"
        >
          Next
        </button>
        <PlayButton onClick={() => setPlaying((v) => !v)} playing={playing} label="Run" />
        <button
          onClick={() => {
            setStep(0);
            setPlaying(false);
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {step + 1} / {STEPS.length}
        </span>
      </WidgetControls>

      {/* unrolled diagram */}
      <div className="mt-2.5 overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 to-transparent">
        <svg viewBox="0 0 720 262" className="h-auto w-full" role="img" aria-label="RNN language model unrolled across two time steps">
          <defs>
            <marker id="u3lm-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-muted-foreground/60" />
            </marker>
            <marker id="u3lm-ah-on" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-u3" />
            </marker>
            <marker id="u3lm-ah-out" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-primary" />
            </marker>
          </defs>

          {/* softmax read-out chips */}
          {[
            { x: X1, t: 0 as const, label: "P₁(· | I)" },
            { x: X2, t: 1 as const, label: "P₂(· | I love)" },
          ].map(({ x, t, label }) => (
            <g key={`out-${t}`}>
              <line
                x1={x}
                y1={CY - 28}
                x2={x}
                y2={62}
                strokeWidth={cellActive(t) ? 2.2 : 1.4}
                markerEnd={cellActive(t) ? "url(#u3lm-ah-out)" : "url(#u3lm-ah)"}
                className={cn("transition-all duration-300", cellActive(t) ? "stroke-primary" : "stroke-muted-foreground/50")}
              />
              <text x={x + 9} y={78} className="fill-muted-foreground/70 font-mono text-[8.5px]">
                Why, by
              </text>
              <rect
                x={x - 58}
                y={26}
                width={116}
                height={26}
                rx={8}
                strokeWidth={cellActive(t) ? 2 : 1.2}
                className={cn("fill-card transition-all duration-300", cellActive(t) ? "stroke-primary" : "stroke-foreground/50")}
              />
              <text x={x} y={43} textAnchor="middle" className="fill-foreground font-mono text-[10px] font-semibold">
                {label}
              </text>
              <text x={x} y={18} textAnchor="middle" className="fill-u3 font-mono text-[9px]">
                target: {VOCAB[t + 1]}
              </text>
            </g>
          ))}

          {/* recurrent arrows */}
          {[
            { from: X0, to: X1 },
            { from: X1, to: X2 },
          ].map(({ from, to }, i) => (
            <g key={`rec-${i}`}>
              <line
                x1={from + 27}
                y1={CY}
                x2={to - 28}
                y2={CY}
                strokeWidth={cellActive((i + 1) as 0 | 1) ? 2 : 1.4}
                markerEnd={cellActive((i + 1) as 0 | 1) ? "url(#u3lm-ah-on)" : "url(#u3lm-ah)"}
                className={cn("transition-all duration-300", cellActive((i + 1) as 0 | 1) ? "stroke-u3" : "stroke-muted-foreground/50")}
              />
              <text x={(from + to) / 2} y={CY - 9} textAnchor="middle" className="fill-muted-foreground/70 font-mono text-[8.5px]">
                Whh
              </text>
            </g>
          ))}

          {/* h0 start cell */}
          <circle cx={X0} cy={CY} r={24} strokeWidth={1.4} className="fill-card stroke-foreground/50 stroke-dashed" />
          <text x={X0} y={CY + 4} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px]">
            h₀
          </text>
          <text x={X0} y={CY + 42} textAnchor="middle" className="fill-muted-foreground/70 font-mono text-[8.5px]">
            [0, 0]
          </text>

          {/* RNN cells */}
          {[X1, X2].map((x, t) => (
            <g key={`cell-${t}`}>
              <motion.circle
                cx={x}
                cy={CY}
                r={24}
                fill="var(--u3)"
                initial={false}
                animate={{ opacity: cellActive(t as 0 | 1) ? 0.18 : doneT(t as 0 | 1) ? 0.08 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <circle
                cx={x}
                cy={CY}
                r={24}
                strokeWidth={cellActive(t as 0 | 1) ? 2.4 : 1.5}
                className="fill-card stroke-foreground/70 transition-all duration-300"
              />
              <text x={x} y={CY + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
                h{t === 0 ? "₁" : "₂"}
              </text>
              {step >= 3 + t * 6 && (
                <motion.g initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <text x={x + 12} y={CY + 40} textAnchor="start" className="fill-u3 font-mono text-[9px] font-semibold">
                    h{t === 0 ? "₁" : "₂"}=[{f4(fwd.rows[t].h[0])}, {f4(fwd.rows[t].h[1])}]
                  </text>
                </motion.g>
              )}
            </g>
          ))}

          {/* word inputs */}
          {[X1, X2].map((x, t) => (
            <g key={`in-${t}`}>
              <line
                x1={x}
                y1={194}
                x2={x}
                y2={CY + 28}
                strokeWidth={cellActive(t as 0 | 1) ? 2 : 1.4}
                markerEnd={cellActive(t as 0 | 1) ? "url(#u3lm-ah-on)" : "url(#u3lm-ah)"}
                className={cn("transition-all duration-300", cellActive(t as 0 | 1) ? "stroke-u3" : "stroke-muted-foreground/50")}
              />
              <text x={x + 9} y={178} className="fill-muted-foreground/70 font-mono text-[8.5px]">
                Wxh
              </text>
              <rect
                x={x - 26}
                y={194}
                width={52}
                height={32}
                rx={8}
                strokeWidth={cellActive(t as 0 | 1) ? 2 : 1.2}
                className={cn("fill-card transition-all duration-300", cellActive(t as 0 | 1) ? "stroke-u3" : "stroke-foreground/50")}
              />
              <text x={x} y={215} textAnchor="middle" className="fill-foreground font-mono text-[11px] font-semibold">
                {VOCAB[t]}
              </text>
              <text x={x} y={246} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                e{t === 0 ? "₁" : "₂"} = [{f4(fwd.rows[t].e[0])}, {f4(fwd.rows[t].e[1])}]
              </text>
              <text x={x} y={258} textAnchor="middle" className="fill-u3/80 font-mono text-[8.5px]">
                target: {VOCAB[t + 1]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* left: computation + distribution */}
        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">Computation</p>
            <div className="mt-2 min-h-28 space-y-2 text-sm">
              {cur.kind === "intro" && (
                <div className="space-y-2">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    An RNN language model unrolled across two time steps. Each input word is looked up in the embedding
                    table E, pushed through the <span className="font-semibold text-foreground">same recurrence</span>{" "}
                    (Wxh, Whh, bh from Worked Example 1), then read out through a vocabulary-sized softmax. The same
                    shared weights are trained across all steps via BPTT.
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <VecChip label="h₀" v={fwd.h0} tone="muted" />
                    <span className="text-xs text-muted-foreground">initial hidden state (zeros)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Press Next or Run to compute step by step.</p>
                </div>
              )}
              {cur.kind === "embed" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">
                    Step {cur.t + 1}.{1} — embed the input word &ldquo;{VOCAB[cur.t]}&rdquo;
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <VecChip label={`e${cur.t === 0 ? "₁" : "₂"} = E["${VOCAB[cur.t]}"]`} v={fwd.rows[cur.t].e} tone="accent" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    A pure table lookup: the discrete token becomes a point in continuous space, where similar words can
                    end up close together after training.
                  </p>
                </div>
              )}
              {cur.kind === "recur" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">
                    Step {cur.t + 1}.2 — pre-activation a{cur.t === 0 ? "₁" : "₂"} (identical recurrence to Section 2.3)
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <VecChip label={`Wxh·e${cur.t === 0 ? "₁" : "₂"}`} v={fwd.rows[cur.t].wx} tone="muted" />
                    <span className="font-mono text-xs">+</span>
                    <VecChip label={`Whh·h${cur.t === 0 ? "₀" : "₁"}`} v={fwd.rows[cur.t].wh} tone="muted" />
                    <span className="font-mono text-xs">+</span>
                    <VecChip label="bh" v={bh} tone="muted" />
                    <span className="font-mono text-xs">=</span>
                    <VecChip label={`a${cur.t === 0 ? "₁" : "₂"}`} v={fwd.rows[cur.t].a} tone="accent" />
                  </div>
                  {cur.t === 0 && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      h₀ = [0, 0] so the recurrent term is zero — no history yet at the very first word.
                    </p>
                  )}
                  {cur.t === 1 && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Now the recurrent term is non-zero: the hidden state carries forward a trace of &ldquo;I&rdquo; as
                      well.
                    </p>
                  )}
                </div>
              )}
              {cur.kind === "tanh" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">
                    Step {cur.t + 1}.3 — squash into the hidden state
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-mono text-xs font-semibold">
                      h{cur.t === 0 ? "₁" : "₂"} = tanh(a{cur.t === 0 ? "₁" : "₂"}) =
                    </span>
                    <VecChip label={`h${cur.t === 0 ? "₁" : "₂"}`} v={fwd.rows[cur.t].h} tone="accent" />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    The hidden state is the model&rsquo;s running summary of the sentence so far.
                  </p>
                </div>
              )}
              {cur.kind === "logits" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">
                    Step {cur.t + 1}.4 — project to vocabulary-sized logits
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <VecChip
                      label={`logits${cur.t === 0 ? "₁" : "₂"} = Why·h + by`}
                      v={fwd.rows[cur.t].logits}
                      tone="accent"
                    />
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    One raw score per vocabulary word (I, love, deep, learning) — this read-out is the only new part
                    compared with the plain RNN.
                  </p>
                </div>
              )}
              {cur.kind === "softmax" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">
                    Step {cur.t + 1}.5 — softmax → next-word distribution
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    P(word | context) = softmax(logits) = exp(logit) / Σ exp(logit)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {VOCAB.map((w, i) => (
                      <span
                        key={w}
                        className={cn(
                          "rounded-lg border px-2 py-1 font-mono text-xs",
                          i === cur.t + 1 ? "border-u3/50 bg-u3/10 font-semibold" : "border-border bg-muted/40"
                        )}
                      >
                        {w}: {f4(fwd.rows[cur.t].P[i])}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    All four probabilities sit close to 0.25 — see the distribution chart below.
                  </p>
                </div>
              )}
              {cur.kind === "loss" && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold">
                    Step {cur.t + 1}.6 — cross-entropy loss against the true next word
                  </p>
                  <p className="font-mono text-xs">
                    L{cur.t === 0 ? "₁" : "₂"} = −log P({VOCAB[cur.t + 1]}) = −log(
                    {f4(fwd.rows[cur.t].P[cur.t + 1])}) ={" "}
                    <span className="font-semibold text-u3">{f4(fwd.rows[cur.t].L)}</span>
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    The loss measures how <span className="font-semibold text-foreground">surprised</span> the model was
                    by the true next word — a confident wrong prediction is penalised heavily; a confident correct one
                    costs almost nothing. Untrained weights give near-uniform guesses, so L ≈ log 4 ≈ 1.386.
                  </p>
                </div>
              )}
              {cur.kind === "summary" && (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold">Average loss and perplexity</p>
                  <p className="font-mono text-xs">
                    Average loss = (L₁ + L₂) / 2 = ({f4(fwd.rows[0].L)} + {f4(fwd.rows[1].L)}) / 2 ={" "}
                    <span className="font-semibold">{f4(fwd.avg)}</span>
                  </p>
                  <p className="font-mono text-xs">
                    Perplexity = exp(Average loss) = exp({f4(fwd.avg)}) ={" "}
                    <span className="font-semibold text-u3">{f4(fwd.ppl)}</span>
                  </p>
                  {/* perplexity meter: 1 = perfect … 4 = uniform guessing for a 4-word vocab */}
                  <div>
                    <div className="relative h-3.5 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <div
                          key={v}
                          className="absolute inset-y-0 w-px bg-foreground/25"
                          style={{ left: `${((v - 1) / 4) * 100}%` }}
                        />
                      ))}
                      <motion.div
                        className="absolute -top-1 h-[22px] w-1 -translate-x-1/2 rounded-full bg-foreground shadow"
                        initial={false}
                        animate={{ left: `${Math.min(100, ((fwd.ppl - 1) / 4) * 100)}%` }}
                        transition={{ type: "spring", stiffness: 200, damping: 25 }}
                      />
                    </div>
                    <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
                      <span>1 = perfect</span>
                      <span>4 = uniform guessing (4-word vocab)</span>
                      <span>5</span>
                    </div>
                  </div>
                  <div className="rounded-lg border border-u3/30 bg-u3/10 p-2.5">
                    <p className="text-[11px] leading-relaxed text-muted-foreground">
                      Interpretation: a perplexity of {fwd.ppl.toFixed(1)} means the model is, on average, as
                      confused as guessing among ~4.4 equally likely words out of 4 — barely better than random,
                      because these are untrained weights. Lower perplexity = better; perplexity 1 means always
                      certain and always correct.
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-xs">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="py-1.5 pr-3 font-medium">t</th>
                          <th className="py-1.5 pr-3 font-medium">input → target</th>
                          <th className="py-1.5 pr-3 font-medium">P(target)</th>
                          <th className="py-1.5 font-medium">Lₜ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fwd.rows.map((r, t) => (
                          <tr key={t} className="border-b border-border/50">
                            <td className="py-1.5 pr-3">{t + 1}</td>
                            <td className="py-1.5 pr-3">
                              {VOCAB[t]} → {VOCAB[t + 1]}
                            </td>
                            <td className="py-1.5 pr-3">{f4(r.P[t + 1])}</td>
                            <td className="py-1.5">{f4(r.L)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* animated softmax distribution */}
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">
                Next-word distribution P(word | context)
              </p>
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                t = {focusT + 1} ({focusT === 0 ? "after “I”" : "after “I love”"})
              </span>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {VOCAB.map((w, i) => {
                const isTarget = i === focusT + 1;
                const p = distVisible ? row.P[i] : 0;
                return (
                  <div key={w} className="flex items-center gap-2">
                    <span
                      className={cn(
                        "w-16 shrink-0 rounded px-1.5 py-0.5 text-right font-mono text-xs",
                        isTarget ? "bg-u3/15 font-semibold text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {w}
                    </span>
                    <div
                      className={cn(
                        "relative h-5 flex-1 overflow-hidden rounded-md bg-muted/70",
                        isTarget && distVisible && "ring-2 ring-u3 ring-offset-2 ring-offset-background"
                      )}
                    >
                      {/* uniform reference line at 0.25 */}
                      <div className="absolute inset-y-0 left-1/4 w-px border-l border-dashed border-foreground/30" />
                      <motion.div
                        className={cn("h-full rounded-md", isTarget ? "bg-u3" : "bg-u3/45")}
                        initial={false}
                        animate={{ width: `${p * 100}%` }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                      />
                      {isTarget && lossVisible(focusT) && (
                        <motion.span
                          initial={{ opacity: 0, x: 4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-background/85 px-1 font-mono text-[10px] font-semibold text-u3"
                        >
                          L{focusT === 0 ? "₁" : "₂"} = {f4(row.L)}
                        </motion.span>
                      )}
                    </div>
                    <span className="w-14 shrink-0 text-right font-mono text-xs">
                      {distVisible ? f4(row.P[i]) : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {distVisible ? (
                <>
                  Dashed line = uniform 0.25. Every bar hugs it — the model has learned nothing yet, so all four words
                  look equally plausible. The outlined bar is the true next word &ldquo;{VOCAB[focusT + 1]}&rdquo;.
                </>
              ) : (
                <>Run the forward pass (or press Run) to see the predicted distribution appear and animate.</>
              )}
            </p>
          </div>
        </div>

        {/* right: generate + weights */}
        <div className="space-y-3">
          {/* greedy generation */}
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">
              Bonus — generate from the model (greedy decoding)
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              At inference there is no true next word, so the model&rsquo;s own argmax prediction is fed back as the
              next input — the opposite of teacher forcing.
            </p>
            <button
              onClick={() => setGenerated((v) => !v)}
              className="mt-2.5 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.01] active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {generated ? "Hide generation" : "Generate 4 words from “I”"}
            </button>
            {generated && (
              <div className="mt-3 space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 font-mono text-xs text-muted-foreground">
                    I <span className="text-[9px]">(start)</span>
                  </span>
                  {greedy.map((g, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.7, y: 6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: 0.25 + i * 0.4, type: "spring", stiffness: 260, damping: 20 }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="font-mono text-xs text-muted-foreground">→</span>
                      <span className="flex flex-col items-center rounded-lg border border-u3/40 bg-u3/10 px-2.5 py-1">
                        <span className="font-mono text-xs font-semibold">{g.word}</span>
                        <span className="font-mono text-[9px] text-muted-foreground">argmax P = {f4(g.p)}</span>
                      </span>
                    </motion.span>
                  ))}
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  The untrained model latches onto &ldquo;learning&rdquo; (its bias term gives it the highest logit)
                  and repeats it forever — repetition under greedy decoding is a classic failure mode even for trained
                  language models, which is why sampling with temperature and beam search exist.
                </p>
              </div>
            )}
          </div>

          {/* weights */}
          <Collapsible open={weightsOpen} onOpenChange={setWeightsOpen}>
            <CollapsibleTrigger className="flex w-full min-h-11 items-center justify-between rounded-xl border bg-muted/20 px-3.5 text-left">
              <span className="text-xs font-semibold">Weights (fixed, from the notes)</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", weightsOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 flex flex-wrap gap-2 rounded-xl border bg-muted/20 p-3">
                <MatChip label="Wxh (recurrence)" m={Wxh} />
                <MatChip label="Whh (recurrence)" m={Whh} />
                <VecChip label="bh" v={bh} />
                <MatChip label="Why (lm)" m={Why} />
                <VecChip label="by (lm)" v={by} />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Wxh, Whh, bh are reused from Worked Example 1 — the recurrence itself is identical; only the embedding
                lookup and the softmax read-out are new.
              </p>
            </CollapsibleContent>
          </Collapsible>

          {/* probability of the sentence */}
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">
              What training would change
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              The chain rule P(w₁, …, w_T) = P(w₁)·P(w₂|w₁)·⋯ means the model multiplies its per-step probabilities
              together. Training (via BPTT + cross-entropy) would push P(love | I) and P(deep | I love) toward 1 by
              adjusting every weight along the gradient path — dropping the loss toward 0 and the perplexity toward 1.
            </p>
            <p className="mt-2 font-mono text-xs">
              P(&ldquo;I love deep&rdquo;) = P(love|I) · P(deep|I,love) = {f4(fwd.rows[0].P[1])} ×{" "}
              {f4(fwd.rows[1].P[2])} = {f4(fwd.rows[0].P[1] * fwd.rows[1].P[2])}
            </p>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
