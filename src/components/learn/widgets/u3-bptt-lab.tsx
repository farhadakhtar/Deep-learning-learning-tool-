"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { WidgetFrame, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";
import { Info } from "lucide-react";

/* ---------- math ---------- */
const fmt = (x: number, dp = 4) => (Math.abs(x) < 0.5 * 10 ** -dp ? 0 : x).toFixed(dp);
const mv = (M: number[][], v: number[]) => M.map((row) => row.reduce((s, x, i) => s + x * v[i], 0));
const T = (M: number[][]) => M[0].map((_, j) => M.map((row) => row[j]));
const add = (a: number[], b: number[]) => a.map((x, i) => x + b[i]);
const sub = (a: number[], b: number[]) => a.map((x, i) => x - b[i]);
const had = (a: number[], b: number[]) => a.map((x, i) => x * b[i]);
const outer = (a: number[], b: number[]) => a.map((x) => b.map((y) => x * y));
const oneMinusH2 = (h: number[]) => h.map((x) => 1 - x * x);
const madd = (A: number[][], B: number[][]) => A.map((r, i) => r.map((x, j) => x + B[i][j]));
const vs = (v: number[]) => `[${fmt(v[0])}, ${fmt(v[1])}]`;

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
const XS = [
  [1, 0.5],
  [0.5, -1],
  [-0.5, 1],
];
const TARGET = [1, 0];

/* ---------- display helpers ---------- */
function VecChip({
  label,
  v,
  tone = "default",
  className,
}: {
  label?: string;
  v: number[];
  tone?: "default" | "muted" | "accent" | "grad" | "good";
  className?: string;
}) {
  const tones = {
    default: "border-border bg-muted/50 text-foreground",
    muted: "border-border/60 bg-muted/30 text-muted-foreground",
    accent: "border-u3/40 bg-u3/10 text-u3",
    grad: "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
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

function HeatMat({ label, m }: { label?: string; m: number[][] }) {
  const maxAbs = Math.max(...m.flat().map(Math.abs));
  return (
    <div className="rounded-lg border bg-muted/30 p-2">
      {label && <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>}
      <div className="inline-grid grid-cols-2 gap-1">
        {m.flat().map((x, i) => {
          const a = Math.min(0.85, (Math.abs(x) / maxAbs) * 0.75 + 0.08);
          return (
            <span
              key={i}
              className="min-w-16 rounded px-2 py-1 text-center font-mono text-xs text-foreground"
              style={{ backgroundColor: x < 0 ? `rgba(239,68,68,${a})` : `rgba(56,189,248,${a})` }}
            >
              {fmt(x)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function SvgVec({
  cx,
  top,
  label,
  v,
  tone,
}: {
  cx: number;
  top: number;
  label: string;
  v: number[];
  tone: "muted" | "out" | "grad";
}) {
  const colors = { muted: "fill-muted-foreground", out: "fill-primary", grad: "fill-orange-600 dark:fill-orange-400" };
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
const N_STEPS = 8;

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const g = useMemo(() => {
    // forward pass (Worked Example 1 numbers)
    const hs: number[][] = [[0, 0]];
    const as: number[][] = [];
    for (let t = 0; t < 3; t++) {
      const a = add(add(mv(Wxh, XS[t]), mv(Whh, hs[t])), bh);
      as.push(a);
      hs.push(a.map(Math.tanh));
    }
    const [h0, h1, h2, h3] = hs;
    const y3 = add(mv(Why, h3), by);
    // loss + backward pass
    const L = 0.5 * sub(y3, TARGET).reduce((s, x) => s + x * x, 0);
    const dLdy = sub(y3, TARGET);
    const dLdh3 = mv(T(Why), dLdy);
    const dLda3 = had(dLdh3, oneMinusH2(h3));
    const gWhh3 = outer(dLda3, h2);
    const dLdh2 = mv(T(Whh), dLda3);
    const dLda2 = had(dLdh2, oneMinusH2(h2));
    const gWhh2 = outer(dLda2, h1);
    const dLdh1 = mv(T(Whh), dLda2);
    const dLda1 = had(dLdh1, oneMinusH2(h1));
    const gWhh1 = outer(dLda1, h0);
    const gWhh = madd(madd(gWhh1, gWhh2), gWhh3);
    const gWhy = outer(dLdy, h3);
    const n3 = Math.hypot(...dLda3);
    const n2 = Math.hypot(...dLda2);
    const n1 = Math.hypot(...dLda1);
    return { h1, h2, h3, y3, L, dLdy, dLdh3, dLda3, gWhh3, dLdh2, dLda2, gWhh2, dLdh1, dLda1, gWhh1, gWhh, gWhy, n3, n2, n1 };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setStep((s) => {
        if (s >= N_STEPS - 1) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1400);
    return () => clearInterval(id);
  }, [playing]);

  const X = [150, 350, 550];
  const CY = 120;
  const show = {
    loss: step >= 0,
    dy: step >= 1,
    dh3: step >= 2,
    da3: step >= 3,
    back2: step >= 5,
    da2: step >= 5,
    back1: step >= 6,
    da1: step >= 6,
    total: step >= 7,
  };

  return (
    <WidgetFrame title={title ?? "BPTT: backpropagation through time"} description={description} accent="u3">
      <WidgetControls>
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="min-h-11 rounded-lg border bg-background px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted disabled:opacity-40"
        >
          Back
        </button>
        <button
          onClick={() => setStep((s) => Math.min(N_STEPS - 1, s + 1))}
          disabled={step === N_STEPS - 1}
          className="min-h-11 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-40"
        >
          Next
        </button>
        <PlayButton onClick={() => setPlaying((v) => !v)} playing={playing} label="Run" />
        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {step + 1} / {N_STEPS}
        </span>
      </WidgetControls>

      {/* diagram: forward (muted, left->right) + backward (orange, right->left) */}
      <div className="mt-2.5 overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 to-transparent">
        <svg viewBox="0 0 760 340" className="h-auto w-full" role="img" aria-label="BPTT gradient flow diagram">
          <defs>
            <marker id="u3bp-ah" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-muted-foreground/50" />
            </marker>
            <marker id="u3bp-ah-out" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-primary" />
            </marker>
            <marker id="u3bp-ah-g" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-orange-500" />
            </marker>
          </defs>

          {/* loss chip */}
          <rect x={16} y={12} width={228} height={24} rx={12} className="fill-card stroke-u3/50" strokeWidth={1.2} />
          <text x={130} y={28} textAnchor="middle" className="fill-u3 font-mono text-[10px]">
            L = ½‖y₃ − target₃‖² = {fmt(g.L)}
          </text>

          {/* forward arrows */}
          {[0, 1].map((t) => (
            <line
              key={`f-${t}`}
              x1={X[t] + 27}
              y1={CY}
              x2={X[t + 1] - 28}
              y2={CY}
              strokeWidth={1.4}
              markerEnd="url(#u3bp-ah)"
              className="stroke-muted-foreground/50"
            />
          ))}
          <line x1={X[2] + 27} y1={CY} x2={622} y2={CY} strokeWidth={1.4} markerEnd="url(#u3bp-ah-out)" className="stroke-muted-foreground/50" />

          {/* cells */}
          {X.map((x, t) => (
            <g key={`cell-${t}`}>
              <circle cx={x} cy={CY} r={25} strokeWidth={1.5} className="fill-card stroke-foreground/60" />
              <text x={x} y={CY + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
                h{["₁", "₂", "₃"][t]}
              </text>
              <text x={x} y={CY + 42} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                {vs(t === 0 ? g.h1 : t === 1 ? g.h2 : g.h3)}
              </text>
            </g>
          ))}

          {/* y3 + dL/dy3 */}
          <SvgVec cx={676} top={102} label="y₃" v={g.y3} tone="out" />
          {show.dy && (
            <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <SvgVec cx={676} top={144} label="∂L/∂y₃" v={g.dLdy} tone="grad" />
              <path d="M 654 166 C 620 176, 590 158, 576 142" fill="none" strokeWidth={1.6} strokeDasharray="5 4" markerEnd="url(#u3bp-ah-g)" className="stroke-orange-500" />
            </motion.g>
          )}

          {/* dL/dh3 */}
          {show.dh3 && (
            <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <SvgVec cx={550} top={50} label="∂L/∂h₃" v={g.dLdh3} tone="grad" />
              <path d="M 550 76 L 550 93" fill="none" strokeWidth={1.6} strokeDasharray="5 4" markerEnd="url(#u3bp-ah-g)" className="stroke-orange-500" />
            </motion.g>
          )}

          {/* backward lanes */}
          {show.back2 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <path d="M 550 147 L 550 164 L 350 164 L 350 151" fill="none" strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#u3bp-ah-g)" className="stroke-orange-500" />
              <text x={450} y={159} textAnchor="middle" className="fill-orange-600 dark:fill-orange-400 font-mono text-[8.5px]">
                × Whhᵀ, × (1−h²)
              </text>
            </motion.g>
          )}
          {show.back1 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <path d="M 350 147 L 350 186 L 150 186 L 150 151" fill="none" strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#u3bp-ah-g)" className="stroke-orange-500" />
              <text x={250} y={181} textAnchor="middle" className="fill-orange-600 dark:fill-orange-400 font-mono text-[8.5px]">
                × Whhᵀ, × (1−h²)
              </text>
            </motion.g>
          )}

          {/* inputs */}
          {X.map((x, t) => (
            <g key={`in-${t}`}>
              <rect x={x - 20} y={212} width={40} height={40} rx={7} strokeWidth={1.3} className="fill-card stroke-foreground/50" />
              <text x={x} y={237} textAnchor="middle" className="fill-muted-foreground font-mono text-[11px]">
                x{["₁", "₂", "₃"][t]}
              </text>
              <text x={x} y={268} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                {vs(XS[t])}
              </text>
            </g>
          ))}

          {/* gradient chips under each step */}
          {show.da3 && (
            <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <SvgVec cx={550} top={284} label="∂L/∂a₃" v={g.dLda3} tone="grad" />
            </motion.g>
          )}
          {show.da2 && (
            <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <SvgVec cx={350} top={284} label="∂L/∂a₂" v={g.dLda2} tone="grad" />
            </motion.g>
          )}
          {show.da1 && (
            <motion.g initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <SvgVec cx={150} top={284} label="∂L/∂a₁" v={g.dLda1} tone="grad" />
            </motion.g>
          )}

          <text x={16} y={332} className="fill-muted-foreground text-[10px]">
            muted = forward pass (already computed) orange dashed = gradient flowing backward through time
          </text>
        </svg>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* step panel */}
        <div className="rounded-xl border bg-muted/20 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">
            Step {step + 1} of {N_STEPS}
          </p>
          <div className="mt-2 min-h-24 space-y-2 text-sm">
            {step === 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">The loss (squared error at the final step only)</p>
                <div className="flex flex-wrap items-center gap-1.5">
                  <VecChip label="y₃" v={g.y3} tone="muted" />
                  <span className="font-mono text-xs">−</span>
                  <VecChip label="target₃" v={TARGET} tone="muted" />
                  <span className="font-mono text-xs">⇒ L =</span>
                  <span className="rounded-lg border border-u3/40 bg-u3/10 px-2.5 py-1 font-mono text-sm font-bold text-u3">{fmt(g.L)}</span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  target₃ = [1, 0] is a one-hot encoding for class 0 (many-to-one setup). The loss measures how far the
                  prediction is from the target.
                </p>
              </div>
            )}
            {step === 1 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Gradient at the output</p>
                <p className="font-mono text-xs">∂L/∂y₃ = y₃ − target₃ = {vs(g.dLdy)}</p>
                <VecChip label="∂L/∂y₃" v={g.dLdy} tone="grad" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  For squared error, ∂L/∂y = predicted − target — the gradient simply points from the prediction toward
                  the target, scaled by the error.
                </p>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Backprop into h₃ through the output layer</p>
                <p className="font-mono text-xs">∂L/∂h₃ = Whyᵀ · ∂L/∂y₃ = {vs(g.dLdh3)}</p>
                <VecChip label="∂L/∂h₃" v={g.dLdh3} tone="grad" />
              </div>
            )}
            {step === 3 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Backprop through tanh at t = 3</p>
                <p className="font-mono text-xs">
                  ∂L/∂a₃ = ∂L/∂h₃ ⊙ (1 − h₃²) = {vs(g.dLdh3)} ⊙ (1 − [{fmt(g.h3[0] ** 2)}, {fmt(g.h3[1] ** 2)}]) = {vs(g.dLda3)}
                </p>
                <VecChip label="∂L/∂a₃" v={g.dLda3} tone="grad" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  The derivative of tanh is 1 − tanh²(a) = 1 − h², evaluated using the already-computed forward-pass
                  value — this is why we saved every hₜ during the forward pass.
                </p>
              </div>
            )}
            {step === 4 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Gradient contribution to Whh from t = 3</p>
                <p className="font-mono text-xs">∂L/∂Whh|₃ = ∂L/∂a₃ ⊗ h₂ = {vs(g.dLda3)} ⊗ {vs(g.h2)}</p>
                <HeatMat label="∂L/∂Whh|₃" m={g.gWhh3} />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  &ldquo;⊗&rdquo; is an outer product: the gradient vector combined with the hidden state that was
                  multiplied by Whh on the forward pass — the standard rule for the gradient of a matrix multiply.
                </p>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Propagate the gradient back one step, to h₂</p>
                <p className="font-mono text-xs">∂L/∂h₂ = Whhᵀ · ∂L/∂a₃ = {vs(g.dLdh2)}</p>
                <p className="font-mono text-xs">∂L/∂a₂ = ∂L/∂h₂ ⊙ (1 − h₂²) = {vs(g.dLda2)}</p>
                <p className="font-mono text-xs">∂L/∂Whh|₂ = ∂L/∂a₂ ⊗ h₁ = {vs(g.dLda2)} ⊗ {vs(g.h1)}</p>
                <HeatMat label="∂L/∂Whh|₂" m={g.gWhh2} />
              </div>
            )}
            {step === 6 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Propagate back to h₁, then to h₀</p>
                <p className="font-mono text-xs">∂L/∂h₁ = Whhᵀ · ∂L/∂a₂ = {vs(g.dLdh1)}</p>
                <p className="font-mono text-xs">∂L/∂a₁ = ∂L/∂h₁ ⊙ (1 − h₁²) = {vs(g.dLda1)}</p>
                <p className="font-mono text-xs">∂L/∂Whh|₁ = ∂L/∂a₁ ⊗ h₀ = [[0.0000, 0.0000], [0.0000, 0.0000]]</p>
                <div className="flex items-start gap-2 rounded-lg border border-u3/30 bg-u3/10 p-2.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-u3" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    The t = 1 term is zero because it is multiplied by h₀ = (0, 0), the initial hidden state. This is a
                    special case of a zero initial state, not a general property of BPTT: the signal ∂L/∂h₁ itself is
                    still non-zero, so it correctly continues to update Wxh and bh through this step.
                  </p>
                </div>
              </div>
            )}
            {step === 7 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold">Total gradient — sum over all time steps</p>
                <p className="font-mono text-xs">∂L/∂Whh = ∂L/∂Whh|₁ + ∂L/∂Whh|₂ + ∂L/∂Whh|₃</p>
                <HeatMat label="∂L/∂Whh (total)" m={g.gWhh} />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Because the same Whh is reused at every step, its total gradient is the sum of per-step
                  contributions. The same mechanism also gives ∂L/∂Wxh = [[0.2342, −0.4506], [−0.2844, 0.4478]] and
                  ∂L/∂Why = [[0.5759, 0.0554], [−0.0385, −0.0037]] (Practice Question 32).
                </p>
              </div>
            )}
          </div>
        </div>

        {/* gradient magnitude bars */}
        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">Gradient signal reaching each step</p>
            <div className="mt-3 space-y-3">
              {[
                { label: "‖∂L/∂a₃‖ — 0 steps back", v: g.n3, on: show.da3, comp: g.dLda3[0] },
                { label: "‖∂L/∂a₂‖ — 1 step back", v: g.n2, on: show.da2, comp: g.dLda2[0] },
                { label: "‖∂L/∂a₁‖ — 2 steps back", v: g.n1, on: show.da1, comp: g.dLda1[0] },
              ].map((row, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-xs text-muted-foreground">{row.label}</p>
                    <p className={cn("font-mono text-xs font-semibold", row.on ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground/40")}>
                      {row.on ? fmt(row.v) : "—"}
                    </p>
                  </div>
                  <div className="mt-1 h-3 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn("h-full rounded-full", row.on ? "bg-orange-500" : "bg-transparent")}
                      initial={false}
                      animate={{ width: row.on ? `${Math.max(2, (row.v / g.n3) * 100)}%` : "0%" }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              First components shrink {fmt(g.dLda3[0])} → {fmt(g.dLda2[0])} → {fmt(g.dLda1[0])}: each step back multiplies
              the gradient by Whhᵀ and a tanh-derivative factor ≤ 1. Over many steps this repeated multiplication is the
              root cause of the vanishing gradient problem.
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">Forward pass used (from Worked Example 1)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <VecChip label="h₁" v={g.h1} tone="muted" />
              <VecChip label="h₂" v={g.h2} tone="muted" />
              <VecChip label="h₃" v={g.h3} tone="muted" />
              <VecChip label="y₃" v={g.y3} tone="muted" />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              x₁ = [1.0000, 0.5000], x₂ = [0.5000, −1.0000], x₃ = [−0.5000, 1.0000], h₀ = [0, 0]; weights exactly as in
              the RNN forward-pass lab.
            </p>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
