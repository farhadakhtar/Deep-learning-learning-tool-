"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { ArrowRight, ChevronRight, Grid3x3, Info, Lightbulb, Network, RotateCcw, Sigma, Zap } from "lucide-react";

/* ---------------- helpers ---------------- */

const sig = (x: number) => 1 / (1 + Math.exp(-x));
const f1 = (x: number) => {
  const s = x.toFixed(1);
  return s === "-0.0" ? "0.0" : s;
};
const f2 = (x: number) => {
  const s = x.toFixed(2);
  return s === "-0.00" ? "0.00" : s;
};
const f4 = (x: number) => {
  const s = x.toFixed(4);
  return s === "-0.0000" ? "0.0000" : s;
};

const C = {
  v: "#0ea5e9", // visible layer
  h1: "#8b5cf6", // hidden 1 (violet)
  h2: "#d946ef", // hidden 2 (fuchsia)
  up: "#10b981", // bottom-up (emerald)
  down: "#8b5cf6", // top-down (violet)
};

/* ================================================================== */
/* Shared diagram pieces                                               */
/* ================================================================== */

/* an undirected edge drawn as a double line */
function DoubleLine({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number; color: string }) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ox = (-dy / len) * 1.9;
  const oy = (dx / len) * 1.9;
  return (
    <g stroke={color} strokeOpacity={0.55}>
      <line x1={x1 + ox} y1={y1 + oy} x2={x2 + ox} y2={y2 + oy} strokeWidth={1.3} />
      <line x1={x1 - ox} y1={y1 - oy} x2={x2 - ox} y2={y2 - oy} strokeWidth={1.3} />
    </g>
  );
}

/* an animated inference arrow travelling along an edge */
function FlowArrow({
  x1,
  y1,
  x2,
  y2,
  color,
  markerId,
  delay = 0,
  duration = 1.8,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  markerId: string;
  delay?: number;
  duration?: number;
}) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const r1 = 15; // start past the source node
  const r2 = 20; // stop before the target node (room for the arrowhead)
  const sx = x1 + ux * r1;
  const sy = y1 + uy * r1;
  const ex = x1 + ux * (len - r2);
  const ey = y1 + uy * (len - r2);
  const seg = 14;
  const tx = ex - sx - ux * seg;
  const ty = ey - sy - uy * seg;
  return (
    <motion.g
      initial={false}
      animate={{
        x: [0, 0, tx, tx],
        y: [0, 0, ty, ty],
        opacity: [0, 1, 1, 0],
      }}
      transition={{ duration, repeat: Infinity, ease: "linear", delay, times: [0, 0.12, 0.85, 1] }}
    >
      <line x1={sx} y1={sy} x2={sx + ux * seg} y2={sy + uy * seg} stroke={color} strokeWidth={2.4} markerEnd={`url(#${markerId})`} strokeLinecap="round" />
    </motion.g>
  );
}

/* layer geometry shared by both stack diagrams */
const LAYERS = {
  h2: { y: 44, xs: [118, 160, 202] },
  h1: { y: 142, xs: [100, 140, 180, 220] },
  v: { y: 240, xs: [100, 140, 180, 220] },
};
const EDGE_PAIRS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 1],
  [1, 2],
  [2, 2],
  [2, 3],
];

function StackDiagram({ mode }: { mode: "dbn" | "dbm" }) {
  const isDbm = mode === "dbm";
  const idp = `zoo-${mode}`;
  const { h2, h1, v } = LAYERS;

  return (
    <svg viewBox="0 0 320 278" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label={isDbm ? "Deep Boltzmann Machine: all layers undirected" : "Deep Belief Network: top layers undirected, lower layers directed"}>
      <defs>
        <marker id={`${idp}-ah-down`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill={C.down} />
        </marker>
        <marker id={`${idp}-ah-up`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill={C.up} />
        </marker>
        <marker id={`${idp}-ah-dir`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5.5" markerHeight="5.5" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill={C.h1} />
        </marker>
      </defs>

      {/* layer captions */}
      {[
        { y: h2.y, label: "hidden 2" },
        { y: h1.y, label: "hidden 1" },
        { y: v.y, label: "visible" },
      ].map((l) => (
        <text key={l.label} x={30} y={l.y + 3} textAnchor="middle" fontSize={7.5} className="fill-muted-foreground font-mono">
          {l.label}
        </text>
      ))}

      {/* top edges: h2 - h1 (undirected in both models) */}
      {EDGE_PAIRS.map(([a, b], i) => {
        const x1 = h2.xs[a];
        const y1 = h2.y;
        const x2 = h1.xs[b];
        const y2 = h1.y;
        return (
          <g key={`top-${i}`}>
            <DoubleLine x1={x1} y1={y1} x2={x2} y2={y2} color={C.h2} />
            {isDbm ? (
              /* DBM: both directions, alternating */
              <>
                <FlowArrow x1={x2} y1={y2} x2={x1} y2={y1} color={C.up} markerId={`${idp}-ah-up`} delay={i * 0.3} />
                <FlowArrow x1={x1} y1={y1} x2={x2} y2={y2} color={C.down} markerId={`${idp}-ah-down`} delay={0.9 + i * 0.3} />
              </>
            ) : (
              /* DBN: only top-down */
              <FlowArrow x1={x1} y1={y1} x2={x2} y2={y2} color={C.down} markerId={`${idp}-ah-down`} delay={i * 0.3} />
            )}
          </g>
        );
      })}

      {/* bottom edges: h1 - v */}
      {EDGE_PAIRS.map(([a, b], i) => {
        const x1 = h1.xs[a];
        const y1 = h1.y;
        const x2 = v.xs[b];
        const y2 = v.y;
        if (isDbm) {
          return (
            <g key={`bot-${i}`}>
              <DoubleLine x1={x1} y1={y1} x2={x2} y2={y2} color={C.h1} />
              <FlowArrow x1={x2} y1={y2} x2={x1} y2={y1} color={C.up} markerId={`${idp}-ah-up`} delay={0.45 + i * 0.3} />
              <FlowArrow x1={x1} y1={y1} x2={x2} y2={y2} color={C.down} markerId={`${idp}-ah-down`} delay={1.35 + i * 0.3} />
            </g>
          );
        }
        /* DBN: directed arrow pointing DOWN (top-down generative direction) */
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        return (
          <g key={`bot-${i}`}>
            <line
              x1={x1 + ux * 14}
              y1={y1 + uy * 14}
              x2={x2 - ux * 17}
              y2={y2 - uy * 17}
              stroke={C.h1}
              strokeOpacity={0.75}
              strokeWidth={1.6}
              markerEnd={`url(#${idp}-ah-dir)`}
            />
            <FlowArrow x1={x1} y1={y1} x2={x2} y2={y2} color={C.down} markerId={`${idp}-ah-down`} delay={0.45 + i * 0.3} />
          </g>
        );
      })}

      {/* nodes */}
      {[
        { layer: h2, color: C.h2, label: "h²" },
        { layer: h1, color: C.h1, label: "h¹" },
        { layer: v, color: C.v, label: "v" },
      ].map(({ layer, color, label }) =>
        layer.xs.map((x, i) => (
          <g key={`${label}-${i}`}>
            <circle cx={x} cy={layer.y} r={11} strokeWidth={1.8} className="fill-card" stroke={color} />
            {i === 1 && (
              <text x={x} y={layer.y + 3.5} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-foreground font-mono">
                {label}
              </text>
            )}
          </g>
        ))
      )}

      {/* direction labels */}
      <text x={284} y={104} fontSize={8.5} fontWeight={700} fill={C.up} className="font-mono">
        {isDbm ? "↑ bottom-up" : ""}
      </text>
      <text x={284} y={116} fontSize={8.5} fontWeight={700} fill={C.down} className="font-mono">
        ↓ top-down
      </text>
    </svg>
  );
}

/* ================================================================== */
/* TAB 1 — DBN vs DBM                                                  */
/* ================================================================== */

const DBN_DBM_ROWS: { aspect: string; dbn: string; dbm: string }[] = [
  {
    aspect: "Connection type",
    dbn: "Top 2 layers undirected; lower layers directed (top-down)",
    dbm: "All layers undirected",
  },
  {
    aspect: "Inference",
    dbn: "Fast, single top-down pass (approximate)",
    dbm: "Iterative mean-field (both directions), slower",
  },
  {
    aspect: "Training",
    dbn: "Greedy layer-wise CD, layer-by-layer",
    dbm: "Greedy pretraining, then joint fine-tuning of all layers together",
  },
  {
    aspect: "Information flow",
    dbn: "One-directional (generative, top-down)",
    dbm: "Bidirectional — top layers can revise lower-layer beliefs",
  },
  {
    aspect: "Robustness",
    dbn: "More sensitive to ambiguous / noisy input",
    dbm: "More robust — top-down feedback helps disambiguate input",
  },
];

function DbnDbmTab() {
  /* Worked Example 7.1 — extending the RBM energy of Example 6.1 */
  const E_RBM = -1.6;
  const [h2on, setH2on] = useState(true);
  const [w2, setW2] = useState(0.5);
  const [b2, setB2] = useState(0.1);
  const h2v = h2on ? 1 : 0;
  const eInt = -(1 * w2 * h2v);
  const eBias = -(b2 * h2v);
  const E = E_RBM + eInt + eBias;
  const energyW = (e: number) => (Math.min(3, Math.abs(e)) / 3) * 100;

  return (
    <div className="space-y-4">
      {/* side-by-side diagrams */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Network className="h-3.5 w-3.5 text-u4" /> DBN — stacked RBMs (hybrid)
          </p>
          <div className="mt-1.5">
            <StackDiagram mode="dbn" />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <svg viewBox="0 0 22 6" className="h-1.5 w-6">
                <line x1={1} y1={2} x2={21} y2={2} stroke={C.h2} strokeWidth={1.3} />
                <line x1={1} y1={5} x2={21} y2={5} stroke={C.h2} strokeWidth={1.3} />
              </svg>
              undirected (top pair)
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <svg viewBox="0 0 22 10" className="h-2.5 w-6">
                <line x1={3} y1={1} x2={17} y2={9} stroke={C.h1} strokeWidth={1.6} markerEnd="url(#dbn-leg)" />
                <defs>
                  <marker id="dbn-leg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 Z" fill={C.h1} />
                  </marker>
                </defs>
              </svg>
              directed (lower layers)
            </span>
          </div>
          <p className="mt-1.5 rounded-lg bg-muted/50 px-2.5 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
            top 2 layers undirected; lower layers directed (top-down)
          </p>
        </div>

        <div className="rounded-xl border border-u4/40 bg-u4/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Network className="h-3.5 w-3.5 text-u4" /> DBM — fully undirected
          </p>
          <div className="mt-1.5">
            <StackDiagram mode="dbm" />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
              <svg viewBox="0 0 22 6" className="h-1.5 w-6">
                <line x1={1} y1={2} x2={21} y2={2} stroke={C.h1} strokeWidth={1.3} />
                <line x1={1} y1={5} x2={21} y2={5} stroke={C.h1} strokeWidth={1.3} />
              </svg>
              all connections undirected
            </span>
            <span className="font-mono text-[10px]" style={{ color: C.up }}>
              ↑ bottom-up
            </span>
            <span className="font-mono text-[10px]" style={{ color: C.down }}>
              ↓ top-down
            </span>
          </div>
          <p className="mt-1.5 rounded-lg bg-u4/10 px-2.5 py-1.5 text-[11px] leading-relaxed text-muted-foreground">
            bidirectional: top layers refine what lower layers think they saw
          </p>
        </div>
      </div>

      {/* mean-field update */}
      <div className="rounded-xl border bg-muted/20 p-3.5">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Sigma className="h-3.5 w-3.5 text-u4" /> Mean-field inference in a DBM
        </p>
        <p className="mt-2 break-words font-mono text-sm text-foreground">
          μ¹<sub>j</sub> ← σ( <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-semibold text-emerald-700 dark:text-emerald-400">Σᵢ vᵢ W¹ᵢⱼ</span> +{" "}
          <span className="rounded bg-violet-500/15 px-1.5 py-0.5 font-semibold text-violet-700 dark:text-violet-400">Σₖ μ²ₖ W²ⱼₖ</span> )
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5">
            <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">input term (bottom-up)</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              Evidence from the layer below — the same sigmoid rule a single RBM uses for P(h=1|v).
            </p>
          </div>
          <div className="rounded-lg border border-violet-500/30 bg-violet-500/5 p-2.5">
            <p className="text-[11px] font-semibold text-violet-700 dark:text-violet-400">
              top-down term — the signature a DBN does NOT have
            </p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              What the layer above currently believes, flowing back down through the undirected W².
            </p>
          </div>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          In a DBM, h¹ is sandwiched between v and h²: once v is observed, h¹ and h² become statistically dependent
          (&ldquo;explaining away&rdquo;), so the exact posterior would need summing over exponentially many hidden
          configurations. Mean-field variational inference approximates it with a factorised Q(h¹,h²) = ∏ᵢ q(h¹ᵢ)·∏ₖ
          q(h²ₖ) and iterates these fixed-point updates until convergence — each unit combining evidence from{" "}
          <span className="font-semibold text-foreground">both</span> neighbouring layers.
        </p>
      </div>

      {/* comparison table + energy example */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full min-w-[520px] border-collapse text-left">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Aspect</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-u4">Deep Belief Network (DBN)</th>
                <th className="px-3 py-2.5 text-xs font-semibold text-u4">Deep Boltzmann Machine (DBM)</th>
              </tr>
            </thead>
            <tbody>
              {DBN_DBM_ROWS.map((r) => (
                <tr key={r.aspect} className="group/row border-b transition-colors last:border-b-0 hover:bg-muted/30">
                  <td className="px-3 py-2.5 align-top text-xs font-semibold text-muted-foreground group-hover/row:text-foreground">
                    {r.aspect}
                  </td>
                  <td className="border-l px-3 py-2.5 align-top text-xs leading-relaxed text-foreground/90">{r.dbn}</td>
                  <td className="border-l px-3 py-2.5 align-top text-xs leading-relaxed text-foreground/90">{r.dbm}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Worked Example 7.1 */}
        <div className="rounded-xl border bg-muted/20 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Zap className="h-3.5 w-3.5 text-u4" /> Worked Example 7.1 — adding a layer lowers the energy
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Extend Example 6.1 (v=[1,1], h¹=[1], W¹=[0.4,0.6]ᵀ, a=[0.1,0.2], b¹=0.3 → E = −1.6) with a second hidden
            unit on top.
          </p>
          <div className="mt-2.5 space-y-1 font-mono text-[11px] leading-relaxed text-muted-foreground">
            <p>
              1. v–h¹ part unchanged: <span className="text-foreground">{f2(E_RBM)}</span>
            </p>
            <p>
              2. −h¹ᵀW²h² = −(1×{f2(w2)}×{h2v}) = <span className="text-foreground">{f4(eInt)}</span>
            </p>
            <p>
              3. −b²ᵀh² = −({f2(b2)}×{h2v}) = <span className="text-foreground">{f4(eBias)}</span>
            </p>
            <p>
              4. E<sub>DBM</sub> = {f2(E_RBM)} + ({f4(eInt)}) + ({f4(eBias)}) ={" "}
              <span className="font-semibold text-foreground">{f4(E)}</span>
            </p>
          </div>
          <div className="mt-2.5 space-y-1">
            <SliderRow label="W²" value={w2} min={-1} max={1} step={0.05} onChange={setW2} />
            <SliderRow label="b²" value={b2} min={-0.5} max={0.5} step={0.05} onChange={setB2} />
            <div className="flex min-h-11 items-center justify-between gap-3">
              <span className="font-mono text-xs text-muted-foreground">h² = 1 (second layer on)</span>
              <Switch checked={h2on} onCheckedChange={setH2on} aria-label="toggle second hidden unit" />
            </div>
          </div>
          {/* energy comparison bars */}
          <div className="mt-1 space-y-1.5">
            {[
              { label: "RBM (1 layer)", e: E_RBM },
              { label: "DBM (2 layers)", e: E },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <span className="w-24 shrink-0 font-mono text-[10px] text-muted-foreground">{row.label}</span>
                <div className="h-4 flex-1 overflow-hidden rounded bg-muted/70">
                  <motion.div
                    className={cn("h-full rounded", row.e < E_RBM - 0.001 ? "bg-emerald-500" : "bg-amber-500")}
                    initial={false}
                    animate={{ width: `${energyW(row.e)}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 20 }}
                  />
                </div>
                <span className="w-14 shrink-0 text-right font-mono text-[11px] font-semibold">{f4(row.e)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <Stat label="E (RBM part)" value={f2(E_RBM)} />
            <Stat label="E (DBM total)" value={f4(E)} tone={E < E_RBM ? "good" : "bad"} />
          </div>
          <div className="mt-2 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5">
            <Lightbulb className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              a compatible second layer further LOWERS the energy → deepens the model&rsquo;s belief (raises the
              probability of this joint configuration). This is exactly how deeper layers refine and reinforce the
              model&rsquo;s belief about the input.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* Small slider row (shared by tabs)                                   */
/* ================================================================== */

function SliderRow({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} className="h-11 flex-1" aria-label={label} />
      <span className="w-14 shrink-0 text-right font-mono text-xs font-semibold text-foreground">{f2(value)}</span>
    </div>
  );
}

/* ================================================================== */
/* TAB 2 — Convolutional BM                                            */
/* ================================================================== */

const DEF_V = [
  [1, 0, 1],
  [1, 1, 0],
  [0, 1, 1],
];
const DEF_K = [
  [1, 0],
  [0, 1],
];
const POS: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

function ConvTab() {
  const [v, setV] = useState<number[][]>(DEF_V.map((r) => [...r]));
  const [K, setK] = useState<number[][]>(DEF_K.map((r) => [...r]));
  const [b, setB] = useState(-1.5);
  const [step, setStep] = useState(0); // number of swept positions (0..4)
  const [playing, setPlaying] = useState(false);

  /* detection layer (K * v), stride 1, no padding — computed live */
  const conv = useMemo(() => {
    const out: number[][] = [
      [0, 0],
      [0, 0],
    ];
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        let s = 0;
        for (let m = 0; m < 2; m++) for (let n = 0; n < 2; n++) s += K[m][n] * v[i + m][j + n];
        out[i][j] = s;
      }
    return out;
  }, [v, K]);

  const probs = useMemo(() => conv.map((row) => row.map((x) => sig(x + b))), [conv, b]);
  const poolP = useMemo(() => 1 - probs.flat().reduce((p, c) => p * (1 - c), 1), [probs]);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= 4) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [playing]);

  const sweepDone = step >= 4;
  const patchIdx = Math.min(step, 3); // patch the filter is currently on
  const compIdx = step === 0 ? 0 : step - 1; // position whose computation is shown
  const isPreview = compIdx >= step; // step 0: showing the upcoming computation
  const [pi, pj] = POS[patchIdx];

  /* per-position computation string, e.g. "v(0,0) + v(1,1) = 1 + 1 = 2" */
  const ci = POS[compIdx][0];
  const cj = POS[compIdx][1];
  const compParts: string[] = [];
  const compVals: string[] = [];
  for (let m = 0; m < 2; m++)
    for (let n = 0; n < 2; n++)
      if (K[m][n] === 1) {
        compParts.push(`v(${ci + m},${cj + n})`);
        compVals.push(`${v[ci + m][cj + n]}`);
      }
  const compText =
    compParts.length === 0
      ? `out(${ci},${cj}) = 0  (filter is all zeros)`
      : `out(${ci},${cj}) = ${compParts.join(" + ")} = ${compVals.join(" + ")} = ${conv[ci][cj]}`;

  const toggleV = (i: number, j: number) => setV((old) => old.map((row, r) => (r === i ? row.map((x, c) => (c === j ? 1 - x : x)) : row)));
  const toggleK = (i: number, j: number) => setK((old) => old.map((row, r) => (r === i ? row.map((x, c) => (c === j ? 1 - x : x)) : row)));

  /* parameter comparison (Example 8.2) */
  const FC_PARAMS = 784 * 100;
  const CONV_PARAMS = 10 * (5 * 5);
  const RATIO = FC_PARAMS / CONV_PARAMS;
  const logW = (x: number) => (Math.log10(x) / Math.log10(FC_PARAMS)) * 100;

  return (
    <div className="space-y-4">
      <WidgetControls>
        <PlayButton onClick={() => setPlaying((p) => !p)} playing={playing} label="Play" />
        <button
          onClick={() => setStep((s) => Math.min(4, s + 1))}
          disabled={step >= 4}
          className="min-h-11 rounded-lg border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          Step
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="min-h-11 px-3 text-xs text-muted-foreground"
          onClick={() => {
            setV(DEF_V.map((r) => [...r]));
            setK(DEF_K.map((r) => [...r]));
            setB(-1.5);
            setStep(0);
            setPlaying(false);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset to notes values
        </Button>
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          sweep {step} / 4 · stride 1 · no padding → (3−2+1)×(3−2+1) = 2×2
        </span>
      </WidgetControls>

      {/* grids */}
      <div className="flex flex-wrap items-start justify-center gap-4 lg:gap-6">
        {/* input */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Input v (3×3, click to toggle)
          </p>
          <div className="relative mx-auto mt-2 aspect-square w-full max-w-[216px]">
            <div className="grid h-full grid-cols-3 grid-rows-3 gap-1.5">
              {v.map((row, i) =>
                row.map((x, j) => (
                  <button
                    key={`${i}-${j}`}
                    onClick={() => toggleV(i, j)}
                    aria-label={`toggle v(${i},${j})`}
                    className={cn(
                      "flex items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors",
                      x === 1 ? "border-sky-500/60 bg-sky-500/25 text-foreground" : "border-border bg-muted/40 text-muted-foreground"
                    )}
                  >
                    {x}
                  </button>
                ))
              )}
            </div>
            {/* sliding 2×2 patch highlight */}
            <motion.div
              className="pointer-events-none absolute rounded-lg border-2 border-u4 shadow-sm"
              style={{ width: "64.5%", height: "64.5%" }}
              initial={false}
              animate={{ left: `${(pj * 100) / 3 + 1.2}%`, top: `${(pi * 100) / 3 + 1.2}%` }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <span className="absolute -top-5 left-0 rounded bg-u4 px-1 font-mono text-[9px] font-bold text-white">
                K at ({pi},{pj})
              </span>
            </motion.div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 self-center pt-6 text-muted-foreground">
          <span className="font-mono text-[10px]">shared K, b</span>
          <ChevronRight className="h-5 w-5" />
        </div>

        {/* filter + bias */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Shared filter K (2×2, click to toggle)
          </p>
          <div className="mx-auto mt-2 grid w-full max-w-[128px] grid-cols-2 gap-1.5">
            {K.map((row, i) =>
              row.map((x, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => toggleK(i, j)}
                  aria-label={`toggle K(${i},${j})`}
                  className={cn(
                    "flex aspect-square items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors",
                    x === 1 ? "border-violet-500/60 bg-violet-500/25 text-foreground" : "border-border bg-muted/40 text-muted-foreground"
                  )}
                >
                  {x}
                </button>
              ))
            )}
          </div>
          <div className="mt-3 w-full max-w-[176px]">
            <SliderRow label="bias b" value={b} min={-3} max={3} step={0.1} onChange={setB} />
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
            ONE shared bias — not one per position: P(hᵢⱼ=1|v) = σ((K∗v)ᵢⱼ + b)
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 self-center pt-6 text-muted-foreground">
          <span className="font-mono text-[10px]">slide</span>
          <ChevronRight className="h-5 w-5" />
        </div>

        {/* detection + probability */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Detection layer (K∗v)</p>
          <div className="mx-auto mt-2 grid w-full max-w-[128px] grid-cols-2 gap-1.5">
            {POS.map(([i, j], idx) => (
              <div
                key={`${i}-${j}`}
                className={cn(
                  "flex aspect-square items-center justify-center rounded-lg border font-mono text-sm font-semibold transition-colors",
                  idx < step ? "border-primary/50 bg-primary/10 text-foreground" : "border-dashed border-border bg-muted/30 text-muted-foreground/50"
                )}
              >
                {idx < step ? conv[i][j] : "·"}
              </div>
            ))}
          </div>
          <p className={cn("mt-2 font-mono text-[10px] leading-relaxed", isPreview ? "text-muted-foreground/70" : "text-muted-foreground")}>
            {isPreview ? "next: " : ""}
            {compText}
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-1 self-center pt-6 text-muted-foreground">
          <span className="font-mono text-[10px]">σ(·+b)</span>
          <ChevronRight className="h-5 w-5" />
        </div>

        {/* firing probabilities */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Firing probabilities P = σ((K∗v)+b)
          </p>
          <div className="mx-auto mt-2 grid w-full max-w-[128px] grid-cols-2 gap-1.5">
            {POS.map(([i, j]) => (
              <div
                key={`${i}-${j}`}
                className="flex aspect-square items-center justify-center rounded-lg border border-border font-mono text-xs font-semibold text-foreground"
                style={{ backgroundColor: sweepDone ? `rgba(16, 185, 129, ${0.07 + 0.6 * probs[i][j]})` : undefined }}
              >
                {sweepDone ? f4(probs[i][j]) : "·"}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">
            {sweepDone ? "heat = probability of firing" : "finish the sweep (Play) to reveal probabilities"}
          </p>
        </div>
      </div>

      {/* interpretation */}
      <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3">
        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          positions (0,0), (1,0), (1,1) all scored 2 — the SAME diagonal pattern [1,·;·,1] detected at every location ={" "}
          <span className="font-semibold text-foreground">translation invariance</span>. Position (0,1) had a mismatched
          patch and scored 0, giving a low firing probability. Because K and b do not depend on (i,j), the same small
          parameter set is reused everywhere — which is also what gives the huge parameter reduction below.
        </p>
      </div>

      {/* probabilistic max-pooling */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-muted/20 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Grid3x3 className="h-3.5 w-3.5 text-u4" /> Probabilistic max-pooling — why deterministic max breaks the model
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Ordinary CNN max-pooling just takes max(·) deterministically — it has no probabilistic interpretation and
            cannot be plugged into an energy function. Probabilistic max-pooling instead groups a small block (2×2) of
            detection units {"{h₁, h₂, h₃, h₄}"} with one pooling unit p, and defines a <span className="font-semibold text-foreground">softmax-style
            joint over exactly 5 states</span> — one of the four h&rsquo;s ON with p=1, or all OFF with p=0:
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["h₁=1, p=1", "h₂=1, p=1", "h₃=1, p=1", "h₄=1, p=1", "all h=0, p=0"].map((s) => (
              <span key={s} className="rounded-full border bg-background px-2 py-0.5 font-mono text-[10px] text-foreground/90">
                {s}
              </span>
            ))}
          </div>
          <p className="mt-2 font-mono text-xs text-foreground">P(p=1 | v) = 1 − P(all hᵢ = 0 | v)</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">
            (p fires if ANY unit in its block fires)
          </p>
          {sweepDone && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 space-y-2">
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                with the current firing probabilities: 1 − (1−{f4(probs[0][0])})(1−{f4(probs[0][1])})(1−{f4(probs[1][0])})(1−
                {f4(probs[1][1])}) = <span className="font-semibold text-foreground">{f4(poolP)}</span>
              </p>
              <Stat label="P(p=1 | v) — pooling unit fires" value={f4(poolP)} tone="accent" />
            </motion.div>
          )}
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            This keeps the whole architecture a proper probabilistic (Boltzmann) model with a well-defined energy
            function, while still achieving the same practical effect as CNN pooling: a smaller, spatially-invariant
            summary of each region.
          </p>
        </div>

        {/* parameter comparison */}
        <div className="rounded-xl border bg-muted/20 p-3.5">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Info className="h-3.5 w-3.5 text-u4" /> Parameter efficiency — weight sharing vs fully-connected (Example 8.2)
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            A fully-connected RBM with 100 hidden units on a 28×28 image connects every visible unit to every hidden
            unit. A convolutional RBM uses 10 filters of size 5×5, shared across all positions.
          </p>
          <div className="mt-3 space-y-3">
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Fully-connected RBM</span>
                <span className="font-mono text-xs">
                  784 × 100 = <span className="font-semibold">{FC_PARAMS.toLocaleString("en-US")}</span>{" "}
                  <span className="text-muted-foreground">weights</span>
                </span>
              </div>
              <div className="mt-1 h-6 w-full overflow-hidden rounded-lg bg-muted/70">
                <motion.div className="h-full rounded-lg bg-rose-500/80" initial={{ width: 0 }} animate={{ width: `${logW(FC_PARAMS)}%` }} transition={{ duration: 0.9, ease: "easeOut" }} />
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Convolutional RBM</span>
                <span className="font-mono text-xs">
                  10 × (5×5) = <span className="font-semibold">{CONV_PARAMS}</span>{" "}
                  <span className="text-muted-foreground">weights (+10 shared biases)</span>
                </span>
              </div>
              <div className="mt-1 h-6 w-full overflow-hidden rounded-lg bg-muted/70">
                <motion.div className="h-full rounded-lg bg-emerald-500/80" initial={{ width: 0 }} animate={{ width: `${logW(CONV_PARAMS)}%` }} transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }} />
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              ≈{f1(RATIO)}× fewer parameters
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] text-muted-foreground">log₁₀-scaled bars</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Over 300× fewer parameters for a comparable — indeed typically richer, since the convolution applies at every
            position — feature-detection capacity. This is the core practical reason convolutional variants scale to
            real images while fully-connected RBM / DBM / DBN do not.
          </p>
        </div>
      </div>

      {/* pipeline note */}
      <div className="flex items-start gap-2 rounded-xl border bg-muted/20 p-3">
        <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-u4" />
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Full pipeline: shared filter K slides over v (detection layer, this animation) → sigmoid with one shared bias
          gives firing probabilities → probabilistic max-pooling shrinks each feature map while keeping the model a
          valid Boltzmann machine. Stack detection + pooling layers to build a convolutional deep belief network —
          unsupervised hierarchical feature learning (edges → motifs → object parts), exactly like a CNN but without
          labels.
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */

export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "Energy-model zoo — DBN vs DBM vs Convolutional BM"}
      description={
        description ??
        "Three ways to go deep with energy-based models: stack RBMs with directed lower layers (DBN), make every layer undirected so top-down feedback flows (DBM), and share weights locally for images (Convolutional BM)."
      }
      accent="u4"
    >
      <Tabs defaultValue="dbm">
        <TabsList className="h-11 w-full sm:w-auto">
          <TabsTrigger value="dbm" className="px-4">
            <Network className="h-3.5 w-3.5" /> DBN vs DBM
          </TabsTrigger>
          <TabsTrigger value="conv" className="px-4">
            <Grid3x3 className="h-3.5 w-3.5" /> Convolutional BM
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dbm" className="mt-3">
          <DbnDbmTab />
        </TabsContent>
        <TabsContent value="conv" className="mt-3">
          <ConvTab />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}
