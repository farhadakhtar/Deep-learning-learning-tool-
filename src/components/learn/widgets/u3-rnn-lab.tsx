"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { WidgetFrame, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Info, RotateCcw } from "lucide-react";

/* ---------- math ---------- */
const fmt = (x: number, dp = 4) => (Math.abs(x) < 0.5 * 10 ** -dp ? 0 : x).toFixed(dp);
const mv = (M: number[][], v: number[]) => M.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
const add = (a: number[], b: number[]) => a.map((x, i) => x + b[i]);

const Wxh = [
  [0.5, -0.3],
  [0.2, 0.4],
];
const Whh = [
  [0.1, 0.4],
  [-0.2, 0.3],
];
const bh = [0.1, -0.1];
const Why = [
  [0.6, -0.3],
  [0.2, 0.5],
];
const by = [0.1, 0.2];

const DEFAULT_X: number[][] = [
  [1, 0.5],
  [0.5, -1],
  [-0.5, 1],
];
const SUB = ["₁", "₂", "₃"];

/* ---------- tiny display helpers ---------- */
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
            <span key={i}>{fmt(x)}</span>
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
            {fmt(x)}
          </span>
        ))}
      </div>
    </div>
  );
}

function SvgVec({
  cx,
  top,
  label,
  v,
  tone = "accent",
}: {
  cx: number;
  top: number;
  label: string;
  v: number[];
  tone?: "muted" | "accent" | "out";
}) {
  const colors = { muted: "fill-muted-foreground", accent: "fill-u3", out: "fill-primary" };
  return (
    <g className={cn("font-mono", colors[tone])} textAnchor="middle">
      <text x={cx} y={top} fontSize={9.5} fontWeight={600}>
        {label}
      </text>
      <text x={cx} y={top + 12} fontSize={9}>
        [{fmt(v[0])},
      </text>
      <text x={cx} y={top + 22} fontSize={9}>
        {fmt(v[1])}]
      </text>
    </g>
  );
}

/* ---------- main ---------- */
type Step =
  | { kind: "intro" }
  | { kind: "wxh" | "rec" | "sum" | "tanh"; t: number }
  | { kind: "out" }
  | { kind: "table" };

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [xs, setXs] = useState<number[][]>(DEFAULT_X.map((x) => [...x]));
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [weightsOpen, setWeightsOpen] = useState(false);

  const steps: Step[] = useMemo(
    () => [
      { kind: "intro" } as Step,
      ...([0, 1, 2] as const).flatMap((t) => [
        { kind: "wxh", t } as Step,
        { kind: "rec", t } as Step,
        { kind: "sum", t } as Step,
        { kind: "tanh", t } as Step,
      ]),
      { kind: "out" } as Step,
      { kind: "table" } as Step,
    ],
    []
  );

  const fwd = useMemo(() => {
    const rows: { x: number[]; wx: number[]; wh: number[]; a: number[]; h: number[] }[] = [];
    let h = [0, 0];
    for (let t = 0; t < 3; t++) {
      const wx = mv(Wxh, xs[t]);
      const wh = mv(Whh, h);
      const a = add(add(wx, wh), bh);
      h = a.map(Math.tanh);
      rows.push({ x: xs[t], wx, wh, a, h });
    }
    const y3 = add(mv(Why, rows[2].h), by);
    return { rows, h0: [0, 0], y3 };
  }, [xs]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= steps.length - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1200);
    return () => clearInterval(id);
  }, [playing, steps.length]);

  const cur = steps[step];
  // how far each time step has progressed (for diagram chips)
  const doneT = (t: number) => {
    const idx = 1 + t * 4;
    return step >= idx + 3; // past the "tanh" sub-step of this t
  };
  const aShown = (t: number) => step >= 1 + t * 4 + 2; // past "sum"
  const yShown = () => step >= steps.length - 2;
  const cellActive = (t: number) => {
    const s = steps[step];
    return s.kind !== "intro" && s.kind !== "table" && "t" in s && s.t === t;
  };

  const setX = (t: number, j: number, v: number) =>
    setXs((old) => old.map((row, i) => (i === t ? row.map((x, k) => (k === j ? v : x)) : row)));

  const X = [120, 340, 560];
  const CY = 120;

  return (
    <WidgetFrame title={title ?? "RNN forward pass, step by step"} description={description} accent="u3">
      {/* step controls */}
      <WidgetControls>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="min-h-11 rounded-lg border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}
          disabled={step === steps.length - 1}
          className="min-h-11 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40"
        >
          Next
        </button>
        <PlayButton onClick={() => setPlaying((v) => !v)} playing={playing} label="Run" />
        <button
          onClick={() => {
            setXs(DEFAULT_X.map((x) => [...x]));
            setStep(0);
            setPlaying(false);
          }}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border bg-background px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {step + 1} / {steps.length}
        </span>
      </WidgetControls>

      {/* diagram */}
      <div className="mt-2.5 overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 to-transparent">
        <svg viewBox="0 0 720 300" className="h-auto w-full" role="img" aria-label="Unrolled 3-step RNN">
          <defs>
            <marker id="u3rnn-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-muted-foreground/60" />
            </marker>
            <marker id="u3rnn-ah-on" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-u3" />
            </marker>
            <marker id="u3rnn-ah-out" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-primary" />
            </marker>
          </defs>

          {/* inputs */}
          {X.map((x, t) => (
            <g key={`in-${t}`}>
              <rect
                x={x - 21}
                y={214}
                width={42}
                height={42}
                rx={7}
                strokeWidth={cellActive(t) ? 2 : 1.4}
                className={cn("fill-card transition-all duration-300", cellActive(t) ? "stroke-u3" : "stroke-foreground/60")}
              />
              <text x={x} y={240} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
                x{SUB[t]}
              </text>
              <line
                x1={x}
                y1={212}
                x2={x}
                y2={CY + 28}
                strokeWidth={cellActive(t) ? 2 : 1.4}
                markerEnd={cellActive(t) ? "url(#u3rnn-ah-on)" : "url(#u3rnn-ah)"}
                className={cn("transition-all duration-300", cellActive(t) ? "stroke-u3" : "stroke-muted-foreground/50")}
              />
              <text x={x + 10} y={190} className="fill-muted-foreground/70 font-mono text-[8.5px]">Wxh</text>
              <text x={x} y={276} textAnchor="middle" className="fill-foreground font-mono text-[9px]">
                [{fmt(xs[t][0])}, {fmt(xs[t][1])}]
              </text>
            </g>
          ))}

          {/* recurrent arrows */}
          {[0, 1].map((t) => (
            <g key={`rec-${t}`}>
              <line
                x1={X[t] + 27}
                y1={CY}
                x2={X[t + 1] - 28}
                y2={CY}
                strokeWidth={cellActive(t + 1) ? 2 : 1.4}
                markerEnd={cellActive(t + 1) ? "url(#u3rnn-ah-on)" : "url(#u3rnn-ah)"}
                className={cn("transition-all duration-300", cellActive(t + 1) ? "stroke-u3" : "stroke-muted-foreground/50")}
              />
              <text x={(X[t] + X[t + 1]) / 2} y={CY - 10} textAnchor="middle" className="fill-muted-foreground/70 font-mono text-[8.5px]">
                Whh
              </text>
            </g>
          ))}

          {/* cells */}
          {X.map((x, t) => (
            <g key={`cell-${t}`}>
              <motion.circle
                cx={x}
                cy={CY}
                r={25}
                fill="var(--u3)"
                initial={false}
                animate={{ opacity: cellActive(t) ? 0.18 : doneT(t) ? 0.08 : 0 }}
                transition={{ duration: 0.3 }}
              />
              <circle
                cx={x}
                cy={CY}
                r={25}
                strokeWidth={cellActive(t) ? 2.4 : 1.5}
                className="fill-card stroke-foreground/70 transition-all duration-300"
              />
              <text x={x} y={CY + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
                h{SUB[t]}
              </text>
              {aShown(t) && (
                <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <SvgVec cx={x} top={16} label={`a${SUB[t]}`} v={fwd.rows[t].a} tone="muted" />
                </motion.g>
              )}
              {doneT(t) && (
                <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                  <SvgVec cx={x} top={52} label={`h${SUB[t]}`} v={fwd.rows[t].h} tone="accent" />
                </motion.g>
              )}
            </g>
          ))}

          {/* output y3 */}
          <line
            x1={X[2] + 27}
            y1={CY}
            x2={622}
            y2={CY}
            strokeWidth={cur.kind === "out" || cur.kind === "table" ? 2.4 : 1.4}
            markerEnd={cur.kind === "out" || cur.kind === "table" ? "url(#u3rnn-ah-out)" : "url(#u3rnn-ah)"}
            className={cn(
              "transition-all duration-300",
              cur.kind === "out" || cur.kind === "table" ? "stroke-primary" : "stroke-muted-foreground/50"
            )}
          />
          <text x={(X[2] + 622) / 2} y={CY - 10} textAnchor="middle" className="fill-muted-foreground/70 font-mono text-[8.5px]">
            Why
          </text>
          {yShown() && (
            <motion.g initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}>
              <SvgVec cx={670} top={100} label="y₃" v={fwd.y3} tone="out" />
            </motion.g>
          )}
          <text x={16} y={292} className="fill-muted-foreground text-[10px]">
            h₂ already contains a trace of x₁ — that is how the RNN carries information forward
          </text>
        </svg>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* step detail panel */}
        <div className="rounded-xl border bg-muted/20 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">Computation</p>
          <div className="mt-2 min-h-24 space-y-2 text-sm">
            {cur.kind === "intro" && (
              <div className="space-y-2">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Unrolled 3-step RNN with h₀ = [0, 0]. At every step: aₜ = Wxh·xₜ + Whh·hₜ₋₁ + bh, then hₜ = tanh(aₜ).
                  The final state h₃ is read out as y₃ = Why·h₃ + by (a many-to-one read-out).
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <VecChip label="h₀" v={fwd.h0} tone="muted" />
                  <span className="text-xs text-muted-foreground">initial hidden state (zeros)</span>
                </div>
                <p className="text-xs text-muted-foreground">Press Next or Run to compute step by step.</p>
              </div>
            )}
            {cur.kind === "wxh" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Step {cur.t + 1} — input contribution Wxh·x{SUB[cur.t]}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <VecChip label={`Wxh·x${SUB[cur.t]}`} v={fwd.rows[cur.t].wx} tone="accent" />
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  Wxh·x{SUB[cur.t]} = [{fmt(fwd.rows[cur.t].wx[0])}, {fmt(fwd.rows[cur.t].wx[1])}]
                </p>
              </div>
            )}
            {cur.kind === "rec" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">
                  Step {cur.t + 1} — recurrent contribution Whh·h{cur.t === 0 ? "₀" : SUB[cur.t - 1]}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <VecChip label={`Whh·h${cur.t === 0 ? "₀" : SUB[cur.t - 1]}`} v={fwd.rows[cur.t].wh} tone="accent" />
                </div>
                {cur.t === 0 && (
                  <div className="flex items-start gap-2 rounded-lg border border-u3/30 bg-u3/10 p-2.5">
                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-u3" />
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      h₀ = [0, 0] so the recurrent term contributes nothing yet — this is the very first step, so there
                      is no history to bring forward.
                    </p>
                  </div>
                )}
              </div>
            )}
            {cur.kind === "sum" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Step {cur.t + 1} — pre-activation a{SUB[cur.t]}</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <VecChip label={`Wxh·x${SUB[cur.t]}`} v={fwd.rows[cur.t].wx} tone="muted" />
                  <span className="font-mono text-xs">+</span>
                  <VecChip label={`Whh·h${cur.t === 0 ? "₀" : SUB[cur.t - 1]}`} v={fwd.rows[cur.t].wh} tone="muted" />
                  <span className="font-mono text-xs">+</span>
                  <VecChip label="bh" v={bh} tone="muted" />
                  <span className="font-mono text-xs">=</span>
                  <VecChip label={`a${SUB[cur.t]}`} v={fwd.rows[cur.t].a} tone="accent" />
                </div>
                <p className="font-mono text-xs text-muted-foreground">
                  a{SUB[cur.t]} = [{fmt(fwd.rows[cur.t].a[0])}, {fmt(fwd.rows[cur.t].a[1])}]
                </p>
              </div>
            )}
            {cur.kind === "tanh" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Step {cur.t + 1} — squash into the hidden state</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs font-semibold">h{SUB[cur.t]} = tanh(a{SUB[cur.t]}) =</span>
                  <VecChip label={`h${SUB[cur.t]}`} v={fwd.rows[cur.t].h} tone="accent" />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  tanh bounds the state in (−1, 1), keeping it numerically stable step after step.
                </p>
              </div>
            )}
            {cur.kind === "out" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Read-out — y₃ = Why·h₃ + by</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <VecChip label="Why·h₃" v={mv(Why, fwd.rows[2].h)} tone="muted" />
                  <span className="font-mono text-xs">+</span>
                  <VecChip label="by" v={by} tone="muted" />
                  <span className="font-mono text-xs">=</span>
                  <VecChip label="y₃" v={fwd.y3} tone="good" />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  This is a many-to-one read-out: only the final time step produces an output. The same Why, by could be
                  applied to h₁ and h₂ if a prediction were needed at every step.
                </p>
              </div>
            )}
            {cur.kind === "table" && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Summary of the forward pass</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-xs">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="py-1.5 pr-3 font-medium">t</th>
                        <th className="py-1.5 pr-3 font-medium">xₜ</th>
                        <th className="py-1.5 pr-3 font-medium">aₜ</th>
                        <th className="py-1.5 font-medium">hₜ = tanh(aₜ)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fwd.rows.map((r, t) => (
                        <tr key={t} className="border-b border-border/50">
                          <td className="py-1.5 pr-3">{t + 1}</td>
                          <td className="py-1.5 pr-3">[{fmt(r.x[0])}, {fmt(r.x[1])}]</td>
                          <td className="py-1.5 pr-3">[{fmt(r.a[0])}, {fmt(r.a[1])}]</td>
                          <td className="py-1.5">[{fmt(r.h[0])}, {fmt(r.h[1])}]</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-1.5 pr-3 text-primary" colSpan={3}>
                          y₃ = Why·h₃ + by
                        </td>
                        <td className="py-1.5 text-primary">[{fmt(fwd.y3[0])}, {fmt(fwd.y3[1])}]</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* inputs + weights */}
        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">Inputs (editable)</p>
              <button
                onClick={() => setXs(DEFAULT_X.map((x) => [...x]))}
                className="inline-flex min-h-9 items-center gap-1 rounded-md border px-2 text-[11px] text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" /> notes values
              </button>
            </div>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {[0, 1, 2].map((t) => (
                <div key={t} className="rounded-lg border bg-background/60 p-2">
                  <p className="font-mono text-xs font-semibold">
                    x{SUB[t]} = [{xs[t][0].toFixed(1)}, {xs[t][1].toFixed(1)}]
                  </p>
                  {[0, 1].map((j) => (
                    <div key={j} className="mt-1 flex items-center gap-2">
                      <span className="w-12 shrink-0 font-mono text-[10px] text-muted-foreground">
                        x{SUB[t]}[{j + 1}]
                      </span>
                      <div className="flex-1 py-1.5">
                        <Slider
                          value={[xs[t][j]]}
                          min={-1.5}
                          max={1.5}
                          step={0.1}
                          onValueChange={(v) => setX(t, j, v[0])}
                          aria-label={`x${t + 1} component ${j + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Defaults are the notes&rsquo; values. Drag any component (−1.5 to 1.5) and every number above recomputes
              live.
            </p>
          </div>

          <Collapsible open={weightsOpen} onOpenChange={setWeightsOpen}>
            <CollapsibleTrigger className="flex w-full min-h-11 items-center justify-between rounded-xl border bg-muted/20 px-3.5 text-left">
              <span className="text-xs font-semibold">Weights (fixed, from the notes)</span>
              <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", weightsOpen && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="mt-2 flex flex-wrap gap-2 rounded-xl border bg-muted/20 p-3">
                <MatChip label="Wxh" m={Wxh} />
                <MatChip label="Whh" m={Whh} />
                <VecChip label="bh" v={bh} />
                <MatChip label="Why" m={Why} />
                <VecChip label="by" v={by} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </WidgetFrame>
  );
}
