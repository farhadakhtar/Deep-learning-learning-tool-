"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { WidgetFrame, WidgetControls } from "./frame";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";
import { Compass, Scissors, ShieldCheck, Slice } from "lucide-react";

/* ---------- helpers ---------- */
const SUP: Record<string, string> = {
  "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹",
};
const sup = (d: number) => String(d).split("").map((c) => SUP[c] ?? c).join("");

const fmtSmart = (x: number) => {
  if (x === 0) return "0";
  if (x >= 100000) return x.toExponential(2);
  if (x >= 1) return Number(x.toPrecision(5)).toString();
  return Number(x.toPrecision(3)).toString();
};

/* Notes Table 2 — exact strings */
const TABLE_KS = [1, 2, 3, 5, 10];
const TABLE: Record<string, string> = {
  "0.5-1": "0.5000", "0.5-2": "0.2500", "0.5-3": "0.1250", "0.5-5": "0.03125", "0.5-10": "0.000977",
  "1-1": "1.00", "1-2": "1.00", "1-3": "1.00", "1-5": "1.00", "1-10": "1.00",
  "1.5-1": "1.5000", "1.5-2": "2.2500", "1.5-3": "3.3750", "1.5-5": "7.5938", "1.5-10": "57.665",
};
const PRESETS = [0.5, 1.0, 1.5];
const K_MAX = 15;

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [lambda, setLambda] = useState(0.5);
  const [k, setK] = useState(10);
  const [logMode, setLogMode] = useState(false);

  const status = Math.abs(lambda - 1) < 0.026 ? "stable" : lambda < 1 ? "vanishing" : "exploding";

  const vals = useMemo(() => Array.from({ length: K_MAX }, (_, i) => Math.pow(lambda, i + 1)), [lambda]);
  const vmax = Math.max(...vals);
  const vmin = Math.min(...vals);
  const logLo = Math.min(-4, Math.log10(vmin));
  const logHi = Math.max(0.5, Math.log10(vmax));

  const yFrac = (v: number) =>
    logMode ? Math.max(0.015, (Math.log10(v) - logLo) / (logHi - logLo)) : vmax > 0 ? v / vmax : 0;

  const curVal = Math.pow(lambda, k);
  const presetKey = PRESETS.find((p) => Math.abs(lambda - p) < 0.026);
  const curStr = presetKey && TABLE_KS.includes(k) ? TABLE[`${presetKey}-${k}`] : fmtSmart(curVal);

  const statusColor =
    status === "vanishing" ? "fill-orange-500" : status === "exploding" ? "fill-red-500" : "fill-emerald-500";

  // chart geometry
  const X0 = 64;
  const X1 = 706;
  const BASE = 262;
  const TOP = 26;
  const H = BASE - TOP;
  const slot = (X1 - X0) / K_MAX;
  const bw = slot * 0.62;

  const decades: number[] = [];
  if (logMode) for (let d = Math.ceil(logLo); d <= Math.floor(logHi); d++) decades.push(d);
  const linTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <WidgetFrame title={title ?? "Vanishing and exploding gradients"} description={description} accent="u3">
      <WidgetControls>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p}
              onClick={() => setLambda(p)}
              className={cn(
                "min-h-11 rounded-lg border px-3 font-mono text-xs font-semibold transition-colors",
                Math.abs(lambda - p) < 0.026
                  ? "border-u3 bg-u3/15 text-u3"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              λ = {p.toFixed(1)}
            </button>
          ))}
        </div>
        <button
          onClick={() => setLogMode((v) => !v)}
          className={cn(
            "min-h-11 rounded-lg border px-3 text-xs font-semibold transition-colors",
            logMode ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-muted-foreground hover:text-foreground"
          )}
        >
          Log scale: {logMode ? "on" : "off"}
        </button>
        <span
          className={cn(
            "ml-auto inline-flex min-h-11 items-center rounded-full border px-3 text-xs font-semibold",
            status === "vanishing" && "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
            status === "stable" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
            status === "exploding" && "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
          )}
        >
          {status === "vanishing" && "vanishing — early steps learn nothing"}
          {status === "stable" && "stable"}
          {status === "exploding" && "exploding — training diverges"}
        </span>
      </WidgetControls>

      {/* sliders */}
      <div className="mt-2.5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold">Per-step gradient factor λ</p>
            <p className="font-mono text-xs text-u3">{lambda.toFixed(2)}</p>
          </div>
          <div className="py-2">
            <Slider value={[lambda]} min={0.3} max={1.7} step={0.05} onValueChange={(v) => setLambda(v[0])} aria-label="lambda" />
          </div>
          <p className="text-[11px] text-muted-foreground">typical size of Whhᵀ × tanh&prime; per backward step</p>
        </div>
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-semibold">Backward steps k</p>
            <p className="font-mono text-xs text-u3">k = {k}</p>
          </div>
          <div className="py-2">
            <Slider value={[k]} min={1} max={K_MAX} step={1} onValueChange={(v) => setK(v[0])} aria-label="k steps back" />
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            |λ^k| = <span className={cn("font-semibold", status === "vanishing" ? "text-orange-600 dark:text-orange-400" : status === "exploding" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>{curStr}</span>
          </p>
        </div>
      </div>

      {/* chart */}
      <div className="mt-2.5 overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 to-transparent">
        <svg viewBox="0 0 720 300" className="h-auto w-full" role="img" aria-label="Bar chart of lambda to the k">
          {/* gridlines */}
          {(logMode ? decades : []).map((d) => {
            const y = BASE - ((d - logLo) / (logHi - logLo)) * H;
            return (
              <g key={`d-${d}`}>
                <line x1={X0} y1={y} x2={X1} y2={y} className="stroke-border" strokeWidth={1} />
                <text x={X0 - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[9px]">
                  10{sup(d)}
                </text>
              </g>
            );
          })}
          {(!logMode ? linTicks : []).map((f) => {
            const y = BASE - f * H;
            return (
              <g key={`t-${f}`}>
                <line x1={X0} y1={y} x2={X1} y2={y} className="stroke-border" strokeWidth={1} />
                <text x={X0 - 8} y={y + 3} textAnchor="end" className="fill-muted-foreground font-mono text-[9px]">
                  {f === 0 ? "0" : fmtSmart(vmax * f)}
                </text>
              </g>
            );
          })}
          <line x1={X0} y1={BASE} x2={X1} y2={BASE} className="stroke-foreground/40" strokeWidth={1.2} />

          {/* bars */}
          {vals.map((v, i) => {
            const kk = i + 1;
            const cx = X0 + (i + 0.5) * slot;
            const isCur = kk === k;
            const h = Math.max(2, yFrac(v) * H);
            return (
              <g key={kk}>
                <motion.rect
                  x={cx - bw / 2}
                  width={bw}
                  rx={2}
                  className={kk === k ? "fill-u3" : statusColor}
                  initial={false}
                  animate={{ y: BASE - h, height: h }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
                <rect
                  x={cx - bw / 2 - 2}
                  y={BASE - h - 2}
                  width={bw + 4}
                  height={h + 2}
                  rx={3}
                  className={cn(isCur ? "stroke-u3" : "stroke-transparent")}
                  strokeWidth={1.5}
                  fill="none"
                />
                <text x={cx} y={BASE + 14} textAnchor="middle" className={cn("font-mono text-[9px]", isCur ? "fill-u3 font-bold" : "fill-muted-foreground")}>
                  {kk}
                </text>
              </g>
            );
          })}

          {/* current-k annotation */}
          <g>
            <rect x={X0 + (k - 0.5) * slot - 44} y={2} width={88} height={18} rx={9} className="fill-card stroke-u3/50" strokeWidth={1} />
            <text x={X0 + (k - 0.5) * slot} y={15} textAnchor="middle" className="fill-u3 font-mono text-[10px]">
              λ^{k} = {curStr}
            </text>
          </g>
          <text x={X1} y={292} textAnchor="end" className="fill-muted-foreground text-[10px]">
            k (steps back) {logMode ? "— log scale" : "— linear scale"}
          </text>
        </svg>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        {/* notes table */}
        <div className="overflow-x-auto rounded-xl border bg-muted/20 p-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">
            Decay / growth of |λ^k| (notes Table 2)
          </p>
          <table className="mt-2 w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="py-1.5 pr-3 font-medium">k</th>
                <th className={cn("py-1.5 pr-3 font-medium", Math.abs(lambda - 0.5) < 0.026 && "text-u3")}>λ = 0.5</th>
                <th className={cn("py-1.5 pr-3 font-medium", Math.abs(lambda - 1) < 0.026 && "text-u3")}>λ = 1.0</th>
                <th className={cn("py-1.5 font-medium", Math.abs(lambda - 1.5) < 0.026 && "text-u3")}>λ = 1.5</th>
              </tr>
            </thead>
            <tbody>
              {TABLE_KS.map((kk) => (
                <tr key={kk} className={cn("border-b border-border/50", kk === k && "bg-u3/5")}>
                  <td className="py-1.5 pr-3">{kk}</td>
                  <td className={cn("py-1.5 pr-3", Math.abs(lambda - 0.5) < 0.026 && "font-semibold text-u3")}>{TABLE[`0.5-${kk}`]}</td>
                  <td className={cn("py-1.5 pr-3", Math.abs(lambda - 1) < 0.026 && "font-semibold text-u3")}>{TABLE[`1-${kk}`]}</td>
                  <td className={cn("py-1.5", Math.abs(lambda - 1.5) < 0.026 && "font-semibold text-u3")}>{TABLE[`1.5-${kk}`]}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            Even a modest λ = 0.5 leaves almost nothing after 10 steps; λ = 1.5 grows past 50×.
          </p>
        </div>

        {/* interpretation + mitigations */}
        <div className="space-y-3">
          <div
            className={cn(
              "rounded-xl border p-3.5",
              status === "vanishing" && "border-orange-500/30 bg-orange-500/5",
              status === "stable" && "border-emerald-500/30 bg-emerald-500/5",
              status === "exploding" && "border-red-500/30 bg-red-500/5"
            )}
          >
            <p className="text-xs font-semibold">What this means for training</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {status === "vanishing" &&
                "λ < 1: the gradient product shrinks exponentially with the number of steps T (gradient ∝ λᵀ). Early time steps receive a near-zero learning signal, so the network effectively cannot learn long-range dependencies."}
              {status === "stable" &&
                "λ ≈ 1: the gradient neither shrinks nor grows — the borderline ideal. In practice exact stability is hard to maintain, which is why gated architectures are preferred."}
              {status === "exploding" &&
                "λ > 1: the product grows exponentially — weight updates become huge and training diverges (loss becomes NaN / oscillates wildly)."}
            </p>
          </div>

          <div className="rounded-xl border bg-muted/20 p-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-u3">Standard mitigations</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {[
                { icon: Scissors, t: "Gradient clipping", d: "Rescale the gradient if its norm exceeds a threshold — a simple, effective fix for exploding gradients." },
                { icon: Compass, t: "Orthogonal init of Whh", d: "Careful weight initialisation keeps λ close to 1 for longer." },
                { icon: Slice, t: "Truncated BPTT", d: "Limit how many steps gradients propagate back, trading long-range learning for stability and speed." },
                { icon: ShieldCheck, t: "Gated architectures", d: "LSTM and GRU redesign the recurrence so gradients flow across many steps largely unimpeded — the main solution used in practice." },
              ].map((m) => (
                <div key={m.t} className="flex items-start gap-2 rounded-lg border bg-background/60 p-2.5">
                  <m.icon className="mt-0.5 h-4 w-4 shrink-0 text-u3" />
                  <div>
                    <p className="text-xs font-semibold">{m.t}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{m.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
