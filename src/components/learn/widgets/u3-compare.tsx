"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { WidgetFrame } from "./frame";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Cpu, Database, Gauge, Layers, Sigma, Zap } from "lucide-react";

/* ---------------- mini cell diagrams (SVG) ---------------- */

function RnnGlyph() {
  return (
    <svg viewBox="0 0 92 64" className="h-14 w-auto" role="img" aria-label="Plain RNN cell: tanh loop">
      <defs>
        <marker id="cmp-rnn-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" className="fill-muted-foreground/70" />
        </marker>
      </defs>
      {/* self loop */}
      <path
        d="M 48 19 C 32 4, 12 10, 14 28 C 15 42, 30 47, 38 43"
        fill="none"
        strokeWidth={1.6}
        markerEnd="url(#cmp-rnn-ah)"
        className="stroke-sky-500"
      />
      <text x={8} y={8} fontSize={7} className="fill-muted-foreground font-mono">
        h
      </text>
      {/* input */}
      <line x1={4} y1={34} x2={30} y2={34} strokeWidth={1.6} markerEnd="url(#cmp-rnn-ah)" className="stroke-foreground/50" />
      <text x={6} y={29} fontSize={7.5} className="fill-foreground font-mono">
        xₜ
      </text>
      {/* cell */}
      <circle cx={48} cy={34} r={13} strokeWidth={1.8} className="fill-card stroke-sky-500" />
      <text x={48} y={37} textAnchor="middle" fontSize={7.5} className="fill-foreground font-mono">
        tanh
      </text>
      {/* output */}
      <line x1={61} y1={34} x2={88} y2={34} strokeWidth={1.6} markerEnd="url(#cmp-rnn-ah)" className="stroke-foreground/50" />
      <text x={70} y={29} fontSize={7.5} className="fill-foreground font-mono">
        hₜ
      </text>
    </svg>
  );
}

function LstmGlyph() {
  return (
    <svg viewBox="0 0 100 74" className="h-14 w-auto" role="img" aria-label="LSTM cell: cell-state highway plus three gates">
      <defs>
        <marker id="cmp-lstm-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" className="fill-muted-foreground/70" />
        </marker>
      </defs>
      {/* cell-state highway */}
      <line x1={6} y1={16} x2={94} y2={16} strokeWidth={3} className="stroke-emerald-500" />
      <text x={4} y={9} fontSize={7} className="fill-emerald-600 dark:fill-emerald-400 font-mono">
        Cₜ₋₁
      </text>
      <text x={82} y={9} fontSize={7} className="fill-emerald-600 dark:fill-emerald-400 font-mono">
        Cₜ
      </text>
      {/* multiply / add nodes on the highway */}
      <circle cx={34} cy={16} r={6} strokeWidth={1.5} className="fill-card stroke-foreground/60" />
      <text x={34} y={19} textAnchor="middle" fontSize={8} className="fill-foreground font-mono">
        ×
      </text>
      <circle cx={66} cy={16} r={6} strokeWidth={1.5} className="fill-card stroke-foreground/60" />
      <text x={66} y={19.5} textAnchor="middle" fontSize={8} className="fill-foreground font-mono">
        +
      </text>
      {/* gates */}
      <g>
        <rect x={14} y={44} width={16} height={14} rx={3} strokeWidth={1.5} className="fill-violet-500/15 stroke-violet-500" />
        <text x={22} y={54} textAnchor="middle" fontSize={8} className="fill-violet-600 dark:fill-violet-400 font-mono">
          σ
        </text>
        <line x1={22} y1={44} x2={30} y2={23} strokeWidth={1.3} markerEnd="url(#cmp-lstm-ah)" className="stroke-foreground/45" />
      </g>
      <g>
        <rect x={38} y={44} width={16} height={14} rx={3} strokeWidth={1.5} className="fill-violet-500/15 stroke-violet-500" />
        <text x={46} y={54} textAnchor="middle" fontSize={8} className="fill-violet-600 dark:fill-violet-400 font-mono">
          σ
        </text>
        <line x1={46} y1={44} x2={63} y2={23} strokeWidth={1.3} markerEnd="url(#cmp-lstm-ah)" className="stroke-foreground/45" />
      </g>
      <g>
        <rect x={62} y={44} width={20} height={14} rx={3} strokeWidth={1.5} className="fill-card stroke-foreground/60" />
        <text x={72} y={54} textAnchor="middle" fontSize={7.5} className="fill-foreground font-mono">
          tanh
        </text>
        <line x1={72} y1={44} x2={69} y2={23} strokeWidth={1.3} markerEnd="url(#cmp-lstm-ah)" className="stroke-foreground/45" />
      </g>
      {/* input + output */}
      <line x1={2} y1={51} x2={13} y2={51} strokeWidth={1.4} markerEnd="url(#cmp-lstm-ah)" className="stroke-foreground/50" />
      <text x={2} y={46} fontSize={7} className="fill-foreground font-mono">
        xₜ,hₜ₋₁
      </text>
      <line x1={88} y1={28} x2={88} y2={60} strokeWidth={1.4} className="stroke-foreground/35" />
      <line x1={88} y1={60} x2={98} y2={60} strokeWidth={1.4} markerEnd="url(#cmp-lstm-ah)" className="stroke-foreground/50" />
      <text x={80} y={70} fontSize={7.5} className="fill-foreground font-mono">
        hₜ
      </text>
    </svg>
  );
}

function GruGlyph() {
  return (
    <svg viewBox="0 0 100 74" className="h-14 w-auto" role="img" aria-label="GRU cell: two gates and a convex blend">
      <defs>
        <marker id="cmp-gru-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" className="fill-muted-foreground/70" />
        </marker>
      </defs>
      {/* input */}
      <line x1={2} y1={38} x2={20} y2={38} strokeWidth={1.5} markerEnd="url(#cmp-gru-ah)" className="stroke-foreground/50" />
      <text x={2} y={32} fontSize={7.5} className="fill-foreground font-mono">
        hₜ₋₁
      </text>
      {/* update gate */}
      <rect x={22} y={18} width={16} height={14} rx={3} strokeWidth={1.5} className="fill-emerald-500/15 stroke-emerald-500" />
      <text x={30} y={28} textAnchor="middle" fontSize={8} className="fill-emerald-600 dark:fill-emerald-400 font-mono">
        σ
      </text>
      <text x={22} y={14} fontSize={7} className="fill-muted-foreground font-mono">
        z (update)
      </text>
      {/* reset gate */}
      <rect x={22} y={44} width={16} height={14} rx={3} strokeWidth={1.5} className="fill-emerald-500/15 stroke-emerald-500" />
      <text x={30} y={54} textAnchor="middle" fontSize={8} className="fill-emerald-600 dark:fill-emerald-400 font-mono">
        σ
      </text>
      <text x={16} y={68} fontSize={7} className="fill-muted-foreground font-mono">
        r (reset)
      </text>
      {/* candidate */}
      <rect x={48} y={44} width={20} height={14} rx={3} strokeWidth={1.5} className="fill-card stroke-foreground/60" />
      <text x={58} y={54} textAnchor="middle" fontSize={7.5} className="fill-foreground font-mono">
        tanh
      </text>
      <line x1={38} y1={51} x2={47} y2={51} strokeWidth={1.3} markerEnd="url(#cmp-gru-ah)" className="stroke-foreground/45" />
      <text x={47} y={40} fontSize={7.5} className="fill-muted-foreground font-mono">
        h̃ₜ
      </text>
      {/* blend */}
      <circle cx={74} cy={30} r={7} strokeWidth={1.5} className="fill-card stroke-foreground/60" />
      <text x={74} y={33.5} textAnchor="middle" fontSize={9} className="fill-foreground font-mono">
        ⊙
      </text>
      <line x1={30} y1={32} x2={30} y2={30} strokeWidth={1.2} className="stroke-foreground/35" />
      <path d="M 30 30 C 44 30, 56 30, 66.5 30" fill="none" strokeWidth={1.3} markerEnd="url(#cmp-gru-ah)" className="stroke-foreground/45" />
      <line x1={58} y1={44} x2={72} y2={37} strokeWidth={1.3} markerEnd="url(#cmp-gru-ah)" className="stroke-foreground/45" />
      <text x={60} y={22} fontSize={6.5} className="fill-muted-foreground font-mono">
        (1−z), z
      </text>
      {/* output */}
      <line x1={81} y1={30} x2={98} y2={30} strokeWidth={1.5} markerEnd="url(#cmp-gru-ah)" className="stroke-foreground/50" />
      <text x={88} y={24} fontSize={7.5} className="fill-foreground font-mono">
        hₜ
      </text>
    </svg>
  );
}

/* ---------------- comparison table data (notes Section 6.1) ---------------- */

const COLS = [
  {
    key: "rnn",
    name: "Plain RNN",
    glyph: <RnnGlyph />,
    header: "text-sky-600 dark:text-sky-400",
    bar: "bg-sky-500",
    chip: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  },
  {
    key: "lstm",
    name: "LSTM",
    glyph: <LstmGlyph />,
    header: "text-violet-600 dark:text-violet-400",
    bar: "bg-violet-500",
    chip: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  },
  {
    key: "gru",
    name: "GRU",
    glyph: <GruGlyph />,
    header: "text-emerald-600 dark:text-emerald-400",
    bar: "bg-emerald-500",
    chip: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
] as const;

const ROWS: { label: string; cells: [string, string, string]; mono?: boolean }[] = [
  {
    label: "Memory",
    cells: ["Hidden state hₜ only", "Cell state Cₜ + hidden state hₜ", "Hidden state hₜ only (no separate cell state)"],
  },
  {
    label: "Gates",
    cells: ["None", "3 (forget, input, output)", "2 (update, reset)"],
  },
  {
    label: "Update rule",
    cells: ["Fully overwritten every step (through tanh)", "Additive, gated", "Convex blend, gated"],
  },
  {
    label: "Gradient flow",
    cells: [
      "Repeated matrix multiply → vanishes / explodes",
      "Protected by additive cell-state highway",
      "Protected by the blend / update gate",
    ],
  },
  {
    label: "Relative params (same hidden size)",
    cells: ["1×", "≈ 4×", "≈ 3×"],
    mono: true,
  },
  {
    label: "Typical training speed",
    cells: ["Fastest per step, hardest to train well on long sequences", "Slower per step", "Slightly faster than LSTM per step"],
  },
];

/* ---------------- main ---------------- */

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [d, setD] = useState(100);
  const [h, setH] = useState(128);

  /* parameter counting (notes Section 6.2) */
  const base = h * (d + h + 1);
  const counts = [base, 4 * base, 3 * base];
  const MAXP = 4 * 512 * (512 + 512 + 1); // largest possible with these sliders
  const widthPct = (v: number) => (Math.log10(Math.max(1, v)) / Math.log10(MAXP)) * 100;
  const fmtInt = (v: number) => v.toLocaleString("en-US");

  return (
    <WidgetFrame
      title={title ?? "RNN vs LSTM vs GRU — structural comparison"}
      description={
        description ??
        "Same recurrence idea, three ways of protecting memory: none, a gated cell-state highway, or a gated convex blend. Hover any row to compare it across all three columns."
      }
      accent="u3"
    >
      {/* comparison table */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="w-[120px] px-3 py-2.5 align-bottom">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Feature</span>
              </th>
              {COLS.map((c) => (
                <th key={c.key} className="px-3 py-2.5 align-bottom">
                  <div className="flex flex-col items-start gap-1.5">
                    <span className={cn("text-sm font-semibold", c.header)}>{c.name}</span>
                    <div className="rounded-lg border bg-background/60 px-2 py-1">{c.glyph}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.label} className="group/row border-b transition-colors last:border-b-0">
                <td className="px-3 py-2.5 align-top text-xs font-semibold text-muted-foreground group-hover/row:bg-muted/30 group-hover/row:text-foreground">
                  {r.label}
                </td>
                {r.cells.map((cell, i) => (
                  <td
                    key={i}
                    className={cn(
                      "px-3 py-2.5 align-top text-xs leading-relaxed transition-colors group-hover/row:bg-muted/30",
                      r.mono ? "font-mono text-sm font-semibold" : "text-foreground/90",
                      i === 1 && "border-l border-r", // visually separate columns
                      i === 2 && "border-l"
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">
        Hover a row to highlight it across all three architectures. The mini diagrams show each cell&rsquo;s signature:
        RNN — a single tanh loop; LSTM — a cell-state highway Cₜ with 3 gates; GRU — 2 gates feeding a convex blend.
      </p>

      {/* parameter counter */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border bg-muted/30 p-3.5">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-u3">
            <Sigma className="h-3.5 w-3.5" /> Parameter counter
          </p>
          <div className="mt-3 space-y-3">
            <div className="flex min-h-11 items-center gap-3">
              <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">d (input size)</span>
              <Slider value={[d]} min={8} max={512} step={4} onValueChange={(v) => setD(v[0])} className="h-11 flex-1" aria-label="input size d" />
              <span className="w-12 shrink-0 text-right font-mono text-xs font-semibold">{d}</span>
            </div>
            <div className="flex min-h-11 items-center gap-3">
              <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground">h (hidden size)</span>
              <Slider value={[h]} min={8} max={512} step={4} onValueChange={(v) => setH(v[0])} className="h-11 flex-1" aria-label="hidden size h" />
              <span className="w-12 shrink-0 text-right font-mono text-xs font-semibold">{h}</span>
            </div>
          </div>
          <div className="mt-3 space-y-1.5 rounded-lg bg-background/60 p-2.5 font-mono text-[11px] leading-relaxed">
            <p className="text-muted-foreground">
              RNN = h(d+h+1) = <span className="text-foreground">{h}×({d}+{h}+1)</span>
            </p>
            <p className="text-muted-foreground">
              LSTM = 4·h(d+h+1) = <span className="text-foreground">4×{fmtInt(base)}</span>
            </p>
            <p className="text-muted-foreground">
              GRU = 3·h(d+h+1) = <span className="text-foreground">3×{fmtInt(base)}</span>
            </p>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Sliders default to the notes&rsquo; example (d = 100, h = 128). Every number recomputes live.
          </p>
        </div>

        <div className="rounded-xl border bg-muted/20 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">Weight parameters (log-scaled bars)</p>
          <div className="mt-3 space-y-4">
            {COLS.map((c, i) => (
              <div key={c.key}>
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className={cn("text-xs font-semibold", c.header)}>{c.name}</span>
                  <span className="font-mono text-xs">
                    <span className="font-semibold">{fmtInt(counts[i])}</span>
                    <span className="text-muted-foreground"> params</span>
                  </span>
                </div>
                <div className="mt-1 h-6 w-full overflow-hidden rounded-lg bg-muted/70">
                  <motion.div
                    className={cn("h-full rounded-lg", c.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPct(counts[i])}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 20 }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", COLS[1].chip)}>
              LSTM = 4 × RNN
            </span>
            <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", COLS[2].chip)}>
              GRU = 3 × RNN
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
              bar widths use a log₁₀ scale
            </span>
          </div>
          <div className="mt-3 rounded-lg border border-u3/30 bg-u3/10 p-2.5">
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              The 4× / 3× factors come from counting gate weight-sets: LSTM has 4 (forget, input, candidate, output),
              GRU has 3 (update, reset, candidate), all sharing input shape (d+h)→h. For a fixed parameter budget, a
              GRU can therefore afford a larger hidden size than an LSTM.
            </p>
          </div>
        </div>
      </div>

      {/* when to use which */}
      <div className="mt-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">When to use which</p>
        <div className="mt-2 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
              <Zap className="h-3.5 w-3.5" /> Plain RNN
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Short sequences, when simplicity and speed matter more than long-range memory, or as a teaching baseline.
              Rarely the best choice for real long-sequence tasks.
            </p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
              <Database className="h-3.5 w-3.5" /> LSTM
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              Tasks needing the most reliable long-range memory and fine-grained control (separately tunable
              forget / input / output behaviour). A strong default when the compute budget is not tight.
            </p>
          </div>
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Gauge className="h-3.5 w-3.5" /> GRU
            </p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              A strong default when training speed or parameter budget is constrained (mobile / embedded, very large
              hidden sizes, limited data). Frequently matches LSTM accuracy with fewer resources.
            </p>
          </div>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <Cpu className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Modern context:</span> Transformers have largely replaced
            all three for state-of-the-art language tasks — they parallelise across time and use attention instead of a
            single recurrent bottleneck. But RNN / LSTM / GRU remain important for streaming and online settings,
            resource-constrained devices, and as the conceptual foundation for sequence modelling.
          </p>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Layers className="h-3.5 w-3.5" />
          All three share the same training loop (BPTT + cross-entropy) and the same read-outs — swap the cell, keep
          everything else.
        </p>
      </div>
    </WidgetFrame>
  );
}
