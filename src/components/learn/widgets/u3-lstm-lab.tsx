"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WidgetFrame, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Info, RotateCcw, SkipBack, SkipForward } from "lucide-react";

/* ---------- math ---------- */
const fmt = (x: number, dp = 4) => (Math.abs(x) < 0.5 * 10 ** -dp ? 0 : x).toFixed(dp);
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const mv = (M: number[][], v: number[]) => M.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
const add = (a: number[], b: number[]) => a.map((x, i) => x + b[i]);
const had = (a: number[], b: number[]) => a.map((x, i) => x * b[i]);

/* ---------- notes' weights (Worked Example 3) ---------- */
const Wf = [
  [0.3, 0.1, 0.2, -0.1],
  [-0.2, 0.4, 0.1, 0.3],
];
const bf = [0.1, 0];
const Wi = [
  [0.2, -0.3, 0.4, 0.1],
  [0.1, 0.2, -0.2, 0.3],
];
const bi = [0, 0.1];
const Wc = [
  [0.4, 0.1, -0.3, 0.2],
  [-0.1, 0.3, 0.2, 0.1],
];
const bc = [0.1, -0.1];
const Wo = [
  [0.3, 0.2, 0.1, -0.2],
  [0.2, -0.1, 0.3, 0.1],
];
const bo = [0, 0.2];

const X: number[][] = [
  [1, 0.5],
  [0.5, -1],
];
const H0 = [0, 0];
const C0 = [0, 0];

interface LstmState {
  z: number[];
  fPre: number[];
  f: number[];
  iPre: number[];
  i: number[];
  cPre: number[];
  cT: number[];
  C: number[];
  oPre: number[];
  o: number[];
  h: number[];
}

function lstmStep(prevH: number[], prevC: number[], x: number[]): LstmState {
  const z = [...prevH, ...x];
  const fPre = add(mv(Wf, z), bf);
  const f = fPre.map(sigmoid);
  const iPre = add(mv(Wi, z), bi);
  const i = iPre.map(sigmoid);
  const cPre = add(mv(Wc, z), bc);
  const cT = cPre.map(Math.tanh);
  const C = f.map((fv, k) => fv * prevC[k] + i[k] * cT[k]);
  const oPre = add(mv(Wo, z), bo);
  const o = oPre.map(sigmoid);
  const h = had(o, C.map(Math.tanh));
  return { z, fPre, f, iPre, i, cPre, cT, C, oPre, o, h };
}

/* ---------- step model ---------- */
type Phase = "z" | "f" | "i" | "c" | "C" | "o" | "h";
const PHASES: { key: Phase; label: string }[] = [
  { key: "z", label: "z_t concat" },
  { key: "f", label: "forget f" },
  { key: "i", label: "input i" },
  { key: "c", label: "candidate c̃" },
  { key: "C", label: "cell C" },
  { key: "o", label: "output o" },
  { key: "h", label: "hidden h" },
];
const TOTAL = 14; // 7 phases x 2 timesteps

function stepIndex(s: number): { t: 0 | 1 | 2; phase: Phase | null; idx: number } {
  if (s === 0) return { t: 0, phase: null, idx: 0 };
  const k = s - 1;
  return { t: (Math.floor(k / 7) + 1) as 1 | 2, phase: PHASES[k % 7].key, idx: s };
}

/* ---------- display helpers ---------- */
function Vec({
  label,
  v,
  tone = "default",
  className,
}: {
  label?: string;
  v: number[];
  tone?: "default" | "f" | "i" | "c" | "o" | "C" | "h";
  className?: string;
}) {
  const tones: Record<string, string> = {
    default: "border-border bg-muted/50 text-foreground",
    f: "border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    i: "border-amber-400/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    c: "border-teal-400/50 bg-teal-500/10 text-teal-700 dark:text-teal-300",
    o: "border-emerald-400/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    C: "border-violet-400/50 bg-violet-500/10 text-violet-700 dark:text-violet-300",
    h: "border-u3/40 bg-u3/10 text-u3",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2 py-1", tones[tone], className)}>
      {label && <span className="text-[10px] font-semibold tracking-wide">{label}</span>}
      <span className="flex items-center gap-0.5 font-mono text-xs leading-tight">
        <span className="text-muted-foreground">[</span>
        <span className="flex flex-col">
          {v.map((x, j) => (
            <span key={j}>{fmt(x)}</span>
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
      <div
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `repeat(${m[0].length}, minmax(0,1fr))` }}
      >
        {m.flat().map((x, j) => (
          <span key={j} className="min-w-11 rounded bg-background px-1 py-0.5 text-center font-mono text-[11px]">
            {fmt(x)}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- cell diagram ---------- */
const GATE_POS = {
  f: { x: 96, y: 168 },
  i: { x: 236, y: 168 },
  c: { x: 316, y: 168 },
  o: { x: 452, y: 168 },
};
const GATE_COLOR = {
  f: "#f43f5e",
  i: "#f59e0b",
  c: "#14b8a6",
  o: "#10b981",
};
const CELL_COLOR = "#8b5cf6";

function CellDiagram({
  t,
  phase,
  s1,
  s2,
}: {
  t: number;
  phase: Phase | null;
  s1: LstmState;
  s2: LstmState;
}) {
  const cur = t === 1 ? s1 : t === 2 ? s2 : null;
  const prevH = t === 1 ? H0 : s1.h;
  const prevC = t === 1 ? C0 : s1.C;
  const x = t >= 1 ? X[t - 1] : [0, 0];
  const lit = (p: Phase) => t >= 1 && phase === p;
  const done = (p: Phase) => {
    if (t === 0 || !phase) return false;
    const order = PHASES.map((q) => q.key);
    if (t === 2) return true;
    return order.indexOf(p) <= order.indexOf(phase);
  };
  const line = (active: boolean, color = "var(--border)") => ({
    stroke: active ? color : "var(--border)",
    strokeWidth: active ? 2.2 : 1.4,
    opacity: active ? 1 : 0.65,
  });

  return (
    <svg viewBox="0 0 580 350" className="mx-auto w-full max-w-2xl" role="img" aria-label="LSTM cell diagram">
      {/* ---- cell state conveyor ---- */}
      <text x={16} y={40} fontSize={11} fontWeight={700} fill={CELL_COLOR} fontFamily="monospace">
        {t === 1 ? "C₀" : "C₁"}
      </text>
      <line x1={45} y1={45} x2={165} y2={45} {...line(t >= 1, CELL_COLOR)} />
      {/* forget multiply */}
      <g>
        <circle cx={185} cy={45} r={11} fill="none" stroke={lit("f") || done("f") ? GATE_COLOR.f : "var(--border)"} strokeWidth={lit("f") ? 2.4 : 1.4} />
        <text x={185} y={49} textAnchor="middle" fontSize={11} fill={lit("f") || done("f") ? GATE_COLOR.f : "currentColor"} className="fill-current">
          ×
        </text>
      </g>
      <line x1={196} y1={45} x2={322} y2={45} {...line(done("C"), CELL_COLOR)} />
      {/* add junction */}
      <g>
        <circle cx={337} cy={45} r={11} fill="none" stroke={lit("C") || done("C") ? CELL_COLOR : "var(--border)"} strokeWidth={lit("C") ? 2.4 : 1.4} />
        <text x={337} y={50} textAnchor="middle" fontSize={13} className="fill-current">
          +
        </text>
      </g>
      <line x1={348} y1={45} x2={470} y2={45} {...line(done("C"), CELL_COLOR)} />
      {/* branch down to tanh */}
      <line x1={470} y1={45} x2={470} y2={96} {...line(done("h"), CELL_COLOR)} />
      <line x1={470} y1={45} x2={545} y2={45} {...line(done("C"), CELL_COLOR)} />
      <text x={548} y={40} fontSize={11} fontWeight={700} fill={CELL_COLOR} fontFamily="monospace">
        {t === 1 ? "C₁" : "C₂"}
      </text>
      {cur && done("C") && (
        <text x={548} y={54} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
          [{fmt(cur.C[0])}, {fmt(cur.C[1])}]
        </text>
      )}

      {/* tanh on cell branch */}
      <g>
        <rect x={451} y={96} width={38} height={22} rx={6} fill="none" stroke={lit("h") ? GATE_COLOR.o : "var(--border)"} strokeWidth={lit("h") ? 2 : 1.3} />
        <text x={470} y={111} textAnchor="middle" fontSize={10} className="fill-current font-mono">
          tanh
        </text>
      </g>
      <line x1={470} y1={118} x2={470} y2={140} {...line(lit("h"))} />

      {/* output multiply */}
      <circle cx={470} cy={152} r={11} fill="none" stroke={lit("h") ? GATE_COLOR.o : "var(--border)"} strokeWidth={lit("h") ? 2.4 : 1.4} />
      <text x={470} y={156} textAnchor="middle" fontSize={11} className="fill-current">
        ×
      </text>
      <line x1={470} y1={163} x2={470} y2={330} {...line(lit("h") || t === 0, "var(--u3)")} />
      <text x={478} y={330} fontSize={11} fontWeight={700} fill="var(--u3)" fontFamily="monospace">
        {t === 1 ? "h₁" : "h₂"}
      </text>
      {cur && lit("h") && (
        <text x={486} y={316} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
          [{fmt(cur.h[0])}, {fmt(cur.h[1])}]
        </text>
      )}

      {/* o gate feeds the output multiply (from left) */}
      <path d={`M ${GATE_POS.o.x + 24} ${GATE_POS.o.y} L 459 152`} fill="none" {...line(lit("o") || done("o"), GATE_COLOR.o)} />

      {/* ---- inputs & concat ---- */}
      <text x={14} y={244} fontSize={11} fontWeight={700} className="fill-current font-mono">
        h{t === 1 ? "₀" : "₁"}
      </text>
      <text x={22} y={258} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
        [{fmt(prevH[0])}, {fmt(prevH[1])}]
      </text>
      <line x1={44} y1={240} x2={170} y2={240} {...line(t >= 1)} />
      <text x={167} y={337} fontSize={11} fontWeight={700} className="fill-current font-mono" textAnchor="middle">
        x{t === 1 ? "₁" : "₂"}
      </text>
      <text x={167} y={348} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground" textAnchor="middle">
        [{fmt(x[0])}, {fmt(x[1])}]
      </text>
      <line x1={185} y1={322} x2={185} y2={252} {...line(t >= 1)} />
      {/* concat node */}
      <circle cx={185} cy={240} r={6} className="fill-current" opacity={lit("z") ? 1 : 0.5} />
      {lit("z") && cur && (
        <text x={197} y={234} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
          z = [{fmt(cur.z[0])}, {fmt(cur.z[1])}, {fmt(cur.z[2])}, {fmt(cur.z[3])}]
        </text>
      )}

      {/* fan-out from concat to gates */}
      {(["f", "i", "c", "o"] as const).map((g) => (
        <path
          key={g}
          d={`M 185 240 L 185 214 L ${GATE_POS[g].x} 214 L ${GATE_POS[g].x} ${GATE_POS[g].y - 14}`}
          fill="none"
          {...line(t >= 1, lit(g) ? GATE_COLOR[g] : "var(--border)")}
        />
      ))}

      {/* ---- gate blocks ---- */}
      {(["f", "i", "c", "o"] as const).map((g) => {
        const isOn = lit(g) || done(g);
        return (
          <g key={g}>
            <rect
              x={GATE_POS[g].x - 24}
              y={GATE_POS[g].y - 14}
              width={48}
              height={28}
              rx={7}
              fill={isOn ? `${GATE_COLOR[g]}22` : "transparent"}
              stroke={isOn ? GATE_COLOR[g] : "var(--border)"}
              strokeWidth={lit(g) ? 2.2 : 1.4}
            />
            <text x={GATE_POS[g].x} y={GATE_POS[g].y + 4} textAnchor="middle" fontSize={11} fontFamily="monospace" fontWeight={700} fill={isOn ? GATE_COLOR[g] : "currentColor"}>
              {g === "c" ? "tanh" : "σ"}
            </text>
            <text x={GATE_POS[g].x} y={GATE_POS[g].y + 32} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="monospace" fill={isOn ? GATE_COLOR[g] : "currentColor"} opacity={isOn ? 1 : 0.6}>
              {g === "c" ? "c̃" : g}
              {t === 1 ? "₁" : "₂"}
            </text>
            {cur && done(g) && (
              <text x={GATE_POS[g].x} y={GATE_POS[g].y + 44} textAnchor="middle" fontSize={8} fontFamily="monospace" className="fill-muted-foreground">
                [{fmt(cur[g === "c" ? "cT" : g][0])}, {fmt(cur[g === "c" ? "cT" : g][1])}]
              </text>
            )}
          </g>
        );
      })}

      {/* f gate up to conveyor multiply */}
      <path d={`M ${GATE_POS.f.x} ${GATE_POS.f.y - 14} L ${GATE_POS.f.x} 45 L 174 45`} fill="none" {...line(lit("f") || done("f"), GATE_COLOR.f)} />
      {/* i gate + c candidate merge into multiply then up to add */}
      <path d={`M ${GATE_POS.i.x} ${GATE_POS.i.y - 14} L ${GATE_POS.i.x} 104 L 280 104`} fill="none" {...line(lit("i") || done("i"), GATE_COLOR.i)} />
      <path d={`M ${GATE_POS.c.x} ${GATE_POS.c.y - 14} L ${GATE_POS.c.x} 116 L 296 116 L 296 104`} fill="none" {...line(lit("c") || done("c"), GATE_COLOR.c)} />
      <circle cx={288} cy={104} r={9} fill="none" stroke={lit("C") || done("C") ? CELL_COLOR : "var(--border)"} strokeWidth={lit("C") ? 2.2 : 1.3} />
      <text x={288} y={108} textAnchor="middle" fontSize={9} className="fill-current">
        ×
      </text>
      <path d="M 288 95 L 288 45 L 326 45" fill="none" {...line(lit("C") || done("C"), CELL_COLOR)} />
    </svg>
  );
}

/* ---------- equation panel content per phase ---------- */
function eqPanel(t: number, phase: Phase | null, s1: LstmState, s2: LstmState) {
  const sub = t === 1 ? "₁" : "₂";
  const cur = t === 1 ? s1 : s2;
  if (!cur || !phase) return null;
  switch (phase) {
    case "z":
      return {
        title: `Concatenate: z${sub} = [ h${t === 1 ? "₀" : "₁"} ; x${sub} ]`,
        body: `z${sub} = [ ${fmt(cur.z[0])}, ${fmt(cur.z[1])} ; ${fmt(cur.z[2])}, ${fmt(cur.z[3])} ]`,
        note:
          t === 1
            ? "All four gate computations read this same concatenated vector."
            : "Now the previous hidden state h₁ participates — memory from step 1 flows in.",
      };
    case "f":
      return {
        title: `Forget gate: f${sub} = σ(Wf·z${sub} + bf)`,
        body: `= σ([${fmt(cur.fPre[0])}, ${fmt(cur.fPre[1])}]) = [${fmt(cur.f[0])}, ${fmt(cur.f[1])}]`,
        note: "Near 0 erases that part of memory; near 1 preserves it completely.",
      };
    case "i":
      return {
        title: `Input gate: i${sub} = σ(Wi·z${sub} + bi)`,
        body: `= σ([${fmt(cur.iPre[0])}, ${fmt(cur.iPre[1])}]) = [${fmt(cur.i[0])}, ${fmt(cur.i[1])}]`,
        note: "Decides how much of the new candidate to write in.",
      };
    case "c":
      return {
        title: `Candidate: c̃${sub} = tanh(Wc·z${sub} + bc)`,
        body: `= tanh([${fmt(cur.cPre[0])}, ${fmt(cur.cPre[1])}]) = [${fmt(cur.cT[0])}, ${fmt(cur.cT[1])}]`,
        note: "The new content proposed for the cell state (not yet gated).",
      };
    case "C":
      return {
        title: `Cell update: C${sub} = f${sub} ⊙ C${t === 1 ? "₀" : "₁"} + i${sub} ⊙ c̃${sub}`,
        body: `= [${fmt(cur.C[0])}, ${fmt(cur.C[1])}]`,
        note:
          t === 1
            ? "C₀ = [0, 0] so the forget gate has nothing to act on yet — the cell state comes entirely from the gated candidate."
            : "Additive and element-wise — no matrix multiply, no squashing. This is the gradient highway.",
      };
    case "o":
      return {
        title: `Output gate: o${sub} = σ(Wo·z${sub} + bo)`,
        body: `= σ([${fmt(cur.oPre[0])}, ${fmt(cur.oPre[1])}]) = [${fmt(cur.o[0])}, ${fmt(cur.o[1])}]`,
        note: "Decides how much of the updated cell state to expose.",
      };
    case "h":
      return {
        title: `Hidden state: h${sub} = o${sub} ⊙ tanh(C${sub})`,
        body: `= [${fmt(cur.h[0])}, ${fmt(cur.h[1])}]`,
        note: "Memory (C) and what to output right now (h) are decoupled.",
      };
  }
}

/* ---------- main ---------- */
export default function Component({ title, description }: { title?: string; description?: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const s1 = useMemo(() => lstmStep(H0, C0, X[0]), []);
  const s2 = useMemo(() => lstmStep(s1.h, s1.C, X[1]), [s1]);
  const { t, phase } = stepIndex(step);
  const eq = eqPanel(t, phase, s1, s2);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= TOTAL) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1300);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <WidgetFrame
      title={title ?? "LSTM cell — Worked Example 3, step by step"}
      description={
        description ??
        "The same inputs x₁=[1, 0.5] and x₂=[0.5, −1] as the plain RNN example. Step through both timesteps and watch every gate open and close."
      }
    >
      <div className="space-y-4">
        {/* step strip */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">t=1</span>
          {PHASES.map((p, j) => (
            <button
              key={p.key}
              onClick={() => setStep(1 + j)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                step > j && step <= 7 ? "border-u3/50 bg-u3/15 text-u3" : step > 7 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" : "text-muted-foreground hover:border-u3/40"
              )}
            >
              {p.label}
            </button>
          ))}
          <span className="mx-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">t=2</span>
          {PHASES.map((p, j) => (
            <button
              key={p.key}
              onClick={() => setStep(8 + j)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                step > 7 + j ? "border-u3/50 bg-u3/15 text-u3" : "text-muted-foreground hover:border-u3/40"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* controls */}
        <WidgetControls>
          <PlayButton playing={playing} onClick={() => setPlaying((p) => !p)} label={step >= TOTAL ? "Replay" : "Play"} />
          <button
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.max(0, s - 1));
            }}
            className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
          >
            <SkipBack className="h-3.5 w-3.5" /> Prev
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStep((s) => Math.min(TOTAL, s + 1));
            }}
            className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
          >
            Next <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setStep(0);
            }}
            className="inline-flex items-center gap-1 rounded-lg border bg-background px-2.5 py-1.5 text-xs font-medium hover:bg-accent"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
          <span className="ml-auto font-mono text-xs text-muted-foreground">
            step {step}/{TOTAL}
          </span>
        </WidgetControls>

        {/* diagram */}
        <div className="overflow-x-auto rounded-xl border bg-muted/20 p-2">
          <CellDiagram t={t} phase={phase} s1={s1} s2={s2} />
        </div>

        {/* equation panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl border bg-card p-3.5"
          >
            {eq ? (
              <>
                <p className="font-mono text-[13px] font-semibold">{eq.title}</p>
                <p className="mt-1 font-mono text-[13px] text-muted-foreground">{eq.body}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{eq.note}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Press <strong>Play</strong> (or Next) to walk through both timesteps. The cell state C runs along the
                top with only element-wise operations — that is what protects the gradient.
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* live values */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time step 1</p>
            <div className="flex flex-wrap gap-1.5">
              <Vec label="f₁" v={s1.f} tone="f" />
              <Vec label="i₁" v={s1.i} tone="i" />
              <Vec label="c̃₁" v={s1.cT} tone="c" />
              <Vec label="C₁" v={s1.C} tone="C" />
              <Vec label="o₁" v={s1.o} tone="o" />
              <Vec label="h₁" v={s1.h} tone="h" />
            </div>
          </div>
          <div className="rounded-xl border p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time step 2</p>
            <div className="flex flex-wrap gap-1.5">
              <Vec label="f₂" v={s2.f} tone="f" />
              <Vec label="i₂" v={s2.i} tone="i" />
              <Vec label="c̃₂" v={s2.cT} tone="c" />
              <Vec label="C₂" v={s2.C} tone="C" />
              <Vec label="o₂" v={s2.o} tone="o" />
              <Vec label="h₂" v={s2.h} tone="h" />
            </div>
          </div>
        </div>

        {/* footer cards */}
        <div className="grid gap-2.5 md:grid-cols-2">
          <div className="rounded-xl border border-u3/30 bg-u3/5 p-3.5 text-xs leading-relaxed">
            <p className="mb-1 font-semibold">Compare with the plain RNN</p>
            <p className="text-muted-foreground">
              On the same input x₁=[1, 0.5] the plain RNN produced h₁=[0.4219, 0.2913] — the LSTM gives h₁=
              [{fmt(s1.h[0])}, {fmt(s1.h[1])}]. The values differ because the gates actively control how much new
              information enters the state. After training, gates learn to open and close purposefully.
            </p>
          </div>
          <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-3.5 text-xs leading-relaxed">
            <p className="mb-1 flex items-center gap-1.5 font-semibold">
              <Info className="h-3.5 w-3.5" /> Why the vanishing gradient is solved
            </p>
            <p className="text-muted-foreground">
              The cell recurrence C_t = f_t ⊙ C_t−1 + (new) is additive, so ∂C_t/∂C_t−1 = f_t — an element-wise
              scaling, not a matrix multiply followed by a squashing nonlinearity. If f_t stays close to 1, gradients
              flow back through many steps almost unshrinked: a gradient highway.
            </p>
          </div>
        </div>

        {/* weights */}
        <Collapsible>
          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg border bg-muted/40 px-3 py-2 text-xs font-medium hover:bg-accent">
            <span>Show the weights used (from the lecture notes)</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-2 flex flex-wrap gap-2 rounded-xl border p-3">
              <MatChip label="Wf" m={Wf} />
              <MatChip label="bf" m={[bf]} />
              <MatChip label="Wi" m={Wi} />
              <MatChip label="bi" m={[bi]} />
              <MatChip label="Wc" m={Wc} />
              <MatChip label="bc" m={[bc]} />
              <MatChip label="Wo" m={Wo} />
              <MatChip label="bo" m={[bo]} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </WidgetFrame>
  );
}
