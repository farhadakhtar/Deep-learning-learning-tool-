"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WidgetFrame, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, RotateCcw, SkipBack, SkipForward } from "lucide-react";

/* ---------- math ---------- */
const fmt = (x: number, dp = 4) => (Math.abs(x) < 0.5 * 10 ** -dp ? 0 : x).toFixed(dp);
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const mv = (M: number[][], v: number[]) => M.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
const add = (a: number[], b: number[]) => a.map((x, i) => x + b[i]);
const had = (a: number[], b: number[]) => a.map((x, i) => x * b[i]);

/* ---------- notes' weights (Worked Example 4) ---------- */
const Wz = [
  [0.2, -0.1, 0.3, 0.1],
  [0.1, 0.3, -0.2, 0.2],
];
const bz = [0.1, 0];
const Wr = [
  [0.4, 0.2, -0.1, 0.3],
  [-0.2, 0.1, 0.2, -0.3],
];
const br = [0, 0.1];
const Wh = [
  [0.3, -0.2, 0.4, 0.1],
  [0.2, 0.1, -0.3, 0.2],
];
const bh = [0.1, -0.1];

const X: number[][] = [
  [1, 0.5],
  [0.5, -1],
];
const H0 = [0, 0];

interface GruState {
  zIn: number[];
  zPre: number[];
  z: number[];
  rPre: number[];
  r: number[];
  rh: number[];
  candIn: number[];
  hTPre: number[];
  hT: number[];
  keepOld: number[];
  h: number[];
}

function gruStep(prevH: number[], x: number[]): GruState {
  const zIn = [...prevH, ...x];
  const zPre = add(mv(Wz, zIn), bz);
  const z = zPre.map(sigmoid);
  const rPre = add(mv(Wr, zIn), br);
  const r = rPre.map(sigmoid);
  const rh = had(r, prevH);
  const candIn = [...rh, ...x];
  const hTPre = add(mv(Wh, candIn), bh);
  const hT = hTPre.map(Math.tanh);
  const keepOld = z.map((zv) => 1 - zv);
  const h = prevH.map((ph, k) => keepOld[k] * ph + z[k] * hT[k]);
  return { zIn, zPre, z, rPre, r, rh, candIn, hTPre, hT, keepOld, h };
}

/* ---------- step model ---------- */
type Phase = "z" | "r" | "rh" | "cand" | "blend";
const PHASES: { key: Phase; label: string }[] = [
  { key: "z", label: "update z" },
  { key: "r", label: "reset r" },
  { key: "rh", label: "r ⊙ h" },
  { key: "cand", label: "candidate h̃" },
  { key: "blend", label: "blend h" },
];
const TOTAL = 10; // 5 phases x 2 timesteps

function stepIndex(s: number): { t: 0 | 1 | 2; phase: Phase | null } {
  if (s === 0) return { t: 0, phase: null };
  const k = s - 1;
  return { t: (Math.floor(k / 5) + 1) as 1 | 2, phase: PHASES[k % 5].key };
}

/* ---------- display helpers ---------- */
function Vec({
  label,
  v,
  tone = "default",
}: {
  label?: string;
  v: number[];
  tone?: "default" | "z" | "r" | "c" | "h" | "old";
}) {
  const tones: Record<string, string> = {
    default: "border-border bg-muted/50 text-foreground",
    z: "border-rose-400/50 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    r: "border-amber-400/50 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    c: "border-teal-400/50 bg-teal-500/10 text-teal-700 dark:text-teal-300",
    h: "border-u3/40 bg-u3/10 text-u3",
    old: "border-slate-400/50 bg-slate-500/10 text-slate-600 dark:text-slate-300",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-lg border px-2 py-1", tones[tone])}>
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
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `repeat(${m[0].length}, minmax(0,1fr))` }}>
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
const C = {
  z: "#f43f5e",
  r: "#f59e0b",
  cand: "#14b8a6",
  blend: "#10b981",
  old: "#64748b",
};

function CellDiagram({ t, phase, s1, s2 }: { t: number; phase: Phase | null; s1: GruState; s2: GruState }) {
  const cur = t === 1 ? s1 : t === 2 ? s2 : null;
  const prevH = t === 1 ? H0 : s1.h;
  const x = t >= 1 ? X[t - 1] : [0, 0];
  const lit = (p: Phase) => t >= 1 && phase === p;
  const done = (p: Phase) => {
    if (t === 0 || !phase) return false;
    const order = PHASES.map((q) => q.key);
    if (t === 2) return order.indexOf(p) <= order.indexOf(phase) + 5; // everything from t=1 done
    return order.indexOf(p) <= order.indexOf(phase);
  };
  const line = (active: boolean, color = "var(--border)") => ({
    stroke: active ? color : "var(--border)",
    strokeWidth: active ? 2.2 : 1.4,
    opacity: active ? 1 : 0.65,
  });

  return (
    <svg viewBox="0 0 580 330" className="mx-auto w-full max-w-2xl" role="img" aria-label="GRU cell diagram">
      {/* inputs */}
      <text x={14} y={64} fontSize={11} fontWeight={700} className="fill-current font-mono">
        h{t === 1 ? "₀" : "₁"}
      </text>
      <text x={22} y={78} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
        [{fmt(prevH[0])}, {fmt(prevH[1])}]
      </text>
      <text x={160} y={317} fontSize={11} fontWeight={700} textAnchor="middle" className="fill-current font-mono">
        x{t === 1 ? "₁" : "₂"}
      </text>
      <text x={160} y={328} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground" textAnchor="middle">
        [{fmt(x[0])}, {fmt(x[1])}]
      </text>

      {/* h path from left, splits: up to concat for gates AND across to blend */}
      <line x1={46} y1={60} x2={120} y2={60} {...line(t >= 1)} />
      <line x1={120} y1={60} x2={120} y2={200} {...line(t >= 1)} />
      <line x1={120} y1={200} x2={330} y2={200} {...line(t >= 1, C.old)} />

      {/* x_t up to concat */}
      <line x1={160} y1={300} x2={160} y2={200} {...line(t >= 1)} />
      <circle cx={160} cy={200} r={5} className="fill-current" opacity={0.6} />
      <line x1={160} y1={200} x2={160} y2={60} {...line(t >= 1)} />
      <line x1={160} y1={60} x2={236} y2={60} {...line(t >= 1)} />
      {lit("z") && cur && (
        <text x={238} y={52} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
          z_in = [{fmt(cur.zIn[0])}, {fmt(cur.zIn[1])}, {fmt(cur.zIn[2])}, {fmt(cur.zIn[3])}]
        </text>
      )}

      {/* gates row */}
      <g>
        <rect x={236} y={48} width={52} height={26} rx={7} fill={lit("z") || done("z") ? `${C.z}22` : "transparent"} stroke={lit("z") || done("z") ? C.z : "var(--border)"} strokeWidth={lit("z") ? 2.2 : 1.4} />
        <text x={262} y={65} textAnchor="middle" fontSize={10} fontFamily="monospace" fontWeight={700} fill={lit("z") || done("z") ? C.z : "currentColor"}>
          σ
        </text>
        <text x={262} y={92} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="monospace" fill={lit("z") || done("z") ? C.z : "currentColor"} opacity={lit("z") || done("z") ? 1 : 0.55}>
          z{t === 1 ? "₁" : "₂"}
        </text>
        {cur && done("z") && (
          <text x={262} y={104} textAnchor="middle" fontSize={8} fontFamily="monospace" className="fill-muted-foreground">
            [{fmt(cur.z[0])}, {fmt(cur.z[1])}]
          </text>
        )}
      </g>
      <g>
        <rect x={336} y={48} width={52} height={26} rx={7} fill={lit("r") || done("r") ? `${C.r}22` : "transparent"} stroke={lit("r") || done("r") ? C.r : "var(--border)"} strokeWidth={lit("r") ? 2.2 : 1.4} />
        <text x={362} y={65} textAnchor="middle" fontSize={10} fontFamily="monospace" fontWeight={700} fill={lit("r") || done("r") ? C.r : "currentColor"}>
          σ
        </text>
        <text x={362} y={92} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="monospace" fill={lit("r") || done("r") ? C.r : "currentColor"} opacity={lit("r") || done("r") ? 1 : 0.55}>
          r{t === 1 ? "₁" : "₂"}
        </text>
        {cur && done("r") && (
          <text x={362} y={104} textAnchor="middle" fontSize={8} fontFamily="monospace" className="fill-muted-foreground">
            [{fmt(cur.r[0])}, {fmt(cur.r[1])}]
          </text>
        )}
      </g>

      {/* r output down-left to the multiply on h path */}
      <path d="M 336 74 L 300 74 L 300 152" fill="none" {...line(lit("rh") || done("rh"), C.r)} />
      <path d="M 300 152 L 300 172" fill="none" {...line(lit("rh") || done("rh"), C.r)} />
      <circle cx={300} cy={182} r={10} fill="none" stroke={lit("rh") ? C.r : "var(--border)"} strokeWidth={lit("rh") ? 2.2 : 1.4} />
      <text x={300} y={186} textAnchor="middle" fontSize={10} className="fill-current">
        ×
      </text>
      {cur && lit("rh") && (
        <text x={316} y={196} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
          r⊙h = [{fmt(cur.rh[0])}, {fmt(cur.rh[1])}]
        </text>
      )}

      {/* r⊙h + x concat into candidate tanh */}
      <path d="M 300 192 L 300 232 L 420 232" fill="none" {...line(lit("cand") || done("cand"), C.cand)} />
      <path d="M 160 232 L 408 232" fill="none" {...line(lit("cand") || done("cand"))} />
      <circle cx={414} cy={232} r={5} className="fill-current" opacity={0.6} />
      <g>
        <rect x={420} y={150} width={56} height={26} rx={7} fill={lit("cand") || done("cand") ? `${C.cand}22` : "transparent"} stroke={lit("cand") || done("cand") ? C.cand : "var(--border)"} strokeWidth={lit("cand") ? 2.2 : 1.4} />
        <text x={448} y={167} textAnchor="middle" fontSize={10} fontFamily="monospace" fontWeight={700} fill={lit("cand") || done("cand") ? C.cand : "currentColor"}>
          tanh
        </text>
        <text x={448} y={144} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="monospace" fill={lit("cand") || done("cand") ? C.cand : "currentColor"} opacity={lit("cand") || done("cand") ? 1 : 0.55}>
          h̃{t === 1 ? "₁" : "₂"}
        </text>
        {cur && done("cand") && (
          <text x={448} y={188} textAnchor="middle" fontSize={8} fontFamily="monospace" className="fill-muted-foreground">
            [{fmt(cur.hT[0])}, {fmt(cur.hT[1])}]
          </text>
        )}
      </g>
      <path d="M 414 232 L 448 232 L 448 176" fill="none" {...line(lit("cand") || done("cand"), C.cand)} />

      {/* blend node */}
      <circle cx={448} cy={252} r={13} fill="none" stroke={lit("blend") || done("blend") ? C.blend : "var(--border)"} strokeWidth={lit("blend") ? 2.4 : 1.4} />
      <text x={448} y={256} textAnchor="middle" fontSize={12} className="fill-current">
        ⊕
      </text>
      <path d="M 448 190 L 448 239" fill="none" {...line(lit("blend") || done("blend"), C.cand)} />
      {/* old h arrives from left into blend */}
      <path d="M 330 200 L 435 200 L 435 246" fill="none" {...line(t >= 1, C.old)} />
      <text x={340} y={192} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
        (1−z)⊙h{t === 1 ? "₀" : "₁"}
      </text>
      {/* z gate feeds blend from the right */}
      <path d="M 262 74 L 500 74 L 500 244 L 461 252" fill="none" {...line(lit("blend") || done("blend"), C.z)} />
      <text x={505} y={180} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
        z⊙h̃
      </text>

      {/* output */}
      <line x1={448} y1={265} x2={448} y2={305} {...line(lit("blend") || t === 0, "var(--u3)")} />
      <text x={456} y={318} fontSize={11} fontWeight={700} fill="var(--u3)" fontFamily="monospace">
        h{t === 1 ? "₁" : "₂"}
      </text>
      {cur && lit("blend") && (
        <text x={486} y={302} fontSize={8.5} fontFamily="monospace" className="fill-muted-foreground">
          [{fmt(cur.h[0])}, {fmt(cur.h[1])}]
        </text>
      )}
    </svg>
  );
}

/* ---------- equation panel ---------- */
function eqPanel(t: number, phase: Phase | null, s1: GruState, s2: GruState) {
  const sub = t === 1 ? "₁" : "₂";
  const cur = t === 1 ? s1 : s2;
  if (!cur || !phase) return null;
  switch (phase) {
    case "z":
      return {
        title: `Update gate: z${sub} = σ(Wz·[h${t === 1 ? "₀" : "₁"} ; x${sub}] + bz)`,
        body: `= σ([${fmt(cur.zPre[0])}, ${fmt(cur.zPre[1])}]) = [${fmt(cur.z[0])}, ${fmt(cur.z[1])}]`,
        note: "Close to 0 keeps the old state almost unchanged; close to 1 replaces it with the new candidate. It plays the combined role of LSTM's forget and input gates.",
      };
    case "r":
      return {
        title: `Reset gate: r${sub} = σ(Wr·[h${t === 1 ? "₀" : "₁"} ; x${sub}] + br)`,
        body: `= σ([${fmt(cur.rPre[0])}, ${fmt(cur.rPre[1])}]) = [${fmt(cur.r[0])}, ${fmt(cur.r[1])}]`,
        note: "Close to 0 makes the candidate ignore the past and depend mostly on the current input.",
      };
    case "rh":
      return {
        title: `Apply the reset: r${sub} ⊙ h${t === 1 ? "₀" : "₁"}`,
        body: `= [${fmt(cur.rh[0])}, ${fmt(cur.rh[1])}]`,
        note:
          t === 1
            ? "With h₀ = 0 there is nothing to reset yet — this step has no visible effect at t = 1. Its role becomes clear at t = 2."
            : "The gated (partially forgotten) past state feeds the candidate.",
      };
    case "cand":
      return {
        title: `Candidate: h̃${sub} = tanh(Wh·[ r${sub}⊙h${t === 1 ? "₀" : "₁"} ; x${sub} ] + bh)`,
        body: `= tanh([${fmt(cur.hTPre[0])}, ${fmt(cur.hTPre[1])}]) = [${fmt(cur.hT[0])}, ${fmt(cur.hT[1])}]`,
        note: "A proposed new hidden-state value, computed from the reset past and the current input.",
      };
    case "blend":
      return {
        title: `Final blend: h${sub} = (1−z${sub}) ⊙ h${t === 1 ? "₀" : "₁"} + z${sub} ⊙ h̃${sub}`,
        body: `= [${fmt(cur.h[0])}, ${fmt(cur.h[1])}]`,
        note:
          t === 1
            ? "h₀ = 0, so h₁ is simply z₁ ⊙ h̃₁ — the update gate scales down how much of the fresh candidate is accepted."
            : "A convex combination of old state and new candidate — simple arithmetic protects the gradient.",
      };
  }
}

/* ---------- main ---------- */
export default function Component({ title, description }: { title?: string; description?: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const s1 = useMemo(() => gruStep(H0, X[0]), []);
  const s2 = useMemo(() => gruStep(s1.h, X[1]), [s1]);
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
      title={title ?? "GRU cell — Worked Example 4, step by step"}
      description={
        description ??
        "Same inputs as the RNN and LSTM examples (x₁=[1, 0.5], x₂=[0.5, −1]). Two gates instead of three, and no separate cell state."
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
                step > j && step <= 5 ? "border-u3/50 bg-u3/15 text-u3" : step > 5 ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" : "text-muted-foreground hover:border-u3/40"
              )}
            >
              {p.label}
            </button>
          ))}
          <span className="mx-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">t=2</span>
          {PHASES.map((p, j) => (
            <button
              key={p.key}
              onClick={() => setStep(6 + j)}
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                step > 5 + j ? "border-u3/50 bg-u3/15 text-u3" : "text-muted-foreground hover:border-u3/40"
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
                Press <strong>Play</strong> to walk both timesteps. The final blend node interpolates between the old
                hidden state and the new candidate — controlled entirely by the update gate.
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* live values */}
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time step 1</p>
            <div className="flex flex-wrap gap-1.5">
              <Vec label="z₁" v={s1.z} tone="z" />
              <Vec label="r₁" v={s1.r} tone="r" />
              <Vec label="r₁⊙h₀" v={s1.rh} tone="old" />
              <Vec label="h̃₁" v={s1.hT} tone="c" />
              <Vec label="h₁" v={s1.h} tone="h" />
            </div>
          </div>
          <div className="rounded-xl border p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Time step 2</p>
            <div className="flex flex-wrap gap-1.5">
              <Vec label="z₂" v={s2.z} tone="z" />
              <Vec label="r₂" v={s2.r} tone="r" />
              <Vec label="r₂⊙h₁" v={s2.rh} tone="old" />
              <Vec label="h̃₂" v={s2.hT} tone="c" />
              <Vec label="h₂" v={s2.h} tone="h" />
            </div>
          </div>
        </div>

        {/* three-way comparison + differences */}
        <div className="grid gap-2.5 md:grid-cols-2">
          <div className="rounded-xl border border-u3/30 bg-u3/5 p-3.5 text-xs leading-relaxed">
            <p className="mb-1 font-semibold">Same input, three architectures (h₁)</p>
            <div className="mt-2 space-y-1.5 font-mono">
              <p>
                Plain RNN: <span className="font-semibold">[0.4219, 0.2913]</span>
              </p>
              <p>
                LSTM: <span className="font-semibold">[−0.0304, 0.0483]</span>
              </p>
              <p>
                GRU: <span className="font-semibold">[0.3056, −0.1384]</span>
              </p>
            </div>
            <p className="mt-2 text-muted-foreground">
              Each combines the input differently because each has a different internal gating structure.
            </p>
          </div>
          <div className="rounded-xl border border-teal-500/30 bg-teal-500/5 p-3.5 text-xs leading-relaxed">
            <p className="mb-1 font-semibold">GRU vs LSTM</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>• No output gate — the full hidden state is always exposed.</li>
              <li>• No separate cell state — memory and output are the same vector.</li>
              <li>• One combined update gate instead of two independent gates (forget, input).</li>
              <li>• ≈3× the parameters of a plain RNN vs LSTM's ≈4× — GRU is often preferred when speed or parameter budget matters.</li>
            </ul>
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
              <MatChip label="Wz" m={Wz} />
              <MatChip label="bz" m={[bz]} />
              <MatChip label="Wr" m={Wr} />
              <MatChip label="br" m={[br]} />
              <MatChip label="Wh" m={Wh} />
              <MatChip label="bh" m={[bh]} />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </WidgetFrame>
  );
}
