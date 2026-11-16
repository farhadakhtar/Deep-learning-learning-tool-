"use client";

import { useState } from "react";
import { WidgetFrame, Stat } from "./frame";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const f = (v: number, d = 2) => v.toFixed(d);

/* ================= (a) Regression: MSE / MAE ================= */
function RegressionTab() {
  const [rows, setRows] = useState([
    { y: "50", yhat: "48" },
    { y: "60", yhat: "65" },
    { y: "70", yhat: "68" },
  ]);

  const parsed = rows.map((r) => ({
    y: parseFloat(r.y) || 0,
    yhat: parseFloat(r.yhat) || 0,
  }));
  const errs = parsed.map((p) => p.y - p.yhat);
  const sq = errs.map((e) => e * e);
  const ab = errs.map((e) => Math.abs(e));
  const mse = sq.reduce((a, b) => a + b, 0) / sq.length;
  const mae = ab.reduce((a, b) => a + b, 0) / ab.length;
  const maxSq = Math.max(...sq, 1);

  const setRow = (i: number, key: "y" | "yhat", v: string) =>
    setRows((rs) => rs.map((r, k) => (k === i ? { ...r, [key]: v } : r)));

  return (
    <div className="grid gap-4 pt-1 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          House prices (₹ lakh). Edit the actual <span className="font-mono">y</span> and predicted{" "}
          <span className="font-mono">ŷ</span> values — every statistic updates live.
        </p>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-2.5 py-1.5 font-medium">actual y</th>
                <th className="px-2.5 py-1.5 font-medium">predicted ŷ</th>
                <th className="px-2.5 py-1.5 font-medium">error y−ŷ</th>
                <th className="px-2.5 py-1.5 font-medium">(y−ŷ)²</th>
                <th className="px-2.5 py-1.5 font-medium">|y−ŷ|</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      value={r.y}
                      onChange={(e) => setRow(i, "y", e.target.value)}
                      className="h-8 w-20 font-mono text-xs"
                      aria-label={`actual y row ${i + 1}`}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <Input
                      type="number"
                      value={r.yhat}
                      onChange={(e) => setRow(i, "yhat", e.target.value)}
                      className="h-8 w-20 font-mono text-xs"
                      aria-label={`predicted y-hat row ${i + 1}`}
                    />
                  </td>
                  <td className="px-2.5 py-1.5 font-mono">{f(errs[i])}</td>
                  <td className="px-2.5 py-1.5 font-mono">{f(sq[i])}</td>
                  <td className="px-2.5 py-1.5 font-mono">{f(ab[i])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="MSE = (1/n)Σ(y−ŷ)²" value={f(mse)} tone="accent" />
          <Stat label="MAE = (1/n)Σ|y−ŷ|" value={f(mae)} tone="accent" />
        </div>

        <p className="rounded-lg bg-muted/50 p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
          MSE = (1/3)({sq.map((s) => f(s, 0)).join(" + ")}) = {f(mse)}
          <br />
          MAE = (1/3)({ab.map((a) => f(a, 0)).join("+")}) = {f(mae)}
        </p>
        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Squaring removes the sign so errors cannot cancel, and it penalises the −5 miss much more
          heavily (25 vs 4) — which is why MSE ({f(mse)}) sits far above MAE ({f(mae)}).
        </p>
      </div>

      {/* bar chart of squared errors */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium text-muted-foreground">Squared error per sample</p>
        <svg viewBox="0 0 320 220" className="w-full max-w-sm" role="img">
          {/* axes */}
          <line x1={40} y1={10} x2={40} y2={180} stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1.5} />
          <line x1={40} y1={180} x2={300} y2={180} stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1.5} />
          {/* y ticks */}
          {[0, 5, 10, 15, 20, 25].map((v) => {
            const max = Math.max(25, Math.ceil(maxSq / 5) * 5);
            const py = 180 - (v / max) * 165;
            return (
              <g key={v}>
                <line x1={36} y1={py} x2={300} y2={py} stroke="currentColor" className="text-muted-foreground/15" strokeWidth={1} />
                <text x={32} y={py + 3} textAnchor="end" fontSize={9} className="fill-muted-foreground">
                  {v}
                </text>
              </g>
            );
          })}
          {/* bars */}
          {sq.map((s, i) => {
            const max = Math.max(25, Math.ceil(maxSq / 5) * 5);
            const h = (s / max) * 165;
            const x = 70 + i * 85;
            const isBig = s === maxSq && s > 0;
            return (
              <g key={i}>
                <motion.rect
                  x={x}
                  y={180 - h}
                  width={50}
                  height={h}
                  rx={4}
                  animate={{ y: 180 - h, height: Math.max(h, 1) }}
                  transition={{ type: "spring", stiffness: 160, damping: 20 }}
                  fill={isBig ? "#f59e0b" : "#0ea5e9"}
                  opacity={0.85}
                />
                <text x={x + 25} y={180 - h - 6} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-foreground">
                  {f(s, 0)}
                </text>
                <text x={x + 25} y={196} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
                  sample {i + 1}
                </text>
                <text x={x + 25} y={209} textAnchor="middle" fontSize={9} className="fill-muted-foreground/70">
                  err {f(errs[i], 0)}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="text-[11px] text-muted-foreground">
          The single −5 error dominates the squared errors — MSE is pulled upward by big mistakes.
        </p>
      </div>
    </div>
  );
}

/* ================= (b) Binary cross-entropy ================= */
const BCE_W = 360;
const BCE_H = 250;
const BCE_PAD = { l: 38, r: 14, t: 14, b: 34 };
const bpx = (p: number) => BCE_PAD.l + p * (BCE_W - BCE_PAD.l - BCE_PAD.r);
const bpy = (loss: number) => BCE_PAD.t + ((3.2 - Math.min(loss, 3.2)) / 3.2) * (BCE_H - BCE_PAD.t - BCE_PAD.b);

function curvePath(fn: (p: number) => number) {
  const pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const p = 0.005 + (i / 200) * 0.99;
    pts.push(`${i === 0 ? "M" : "L"}${bpx(p).toFixed(1)},${bpy(fn(p)).toFixed(1)}`);
  }
  return pts.join(" ");
}

const NOTE_MARKERS = [
  { p: 0.9, y: 1, loss: 0.1054 },
  { p: 0.2, y: 0, loss: 0.2231 },
  { p: 0.6, y: 1, loss: 0.5108 },
];

function BCETab() {
  const [p, setP] = useState(0.9);
  const [y, setY] = useState(1);

  const bce = y === 1 ? -Math.log(p) : -Math.log(1 - p);
  const mseCurve = (pp: number) => (pp - y) * (pp - y);
  const mseNow = (p - y) * (p - y);

  return (
    <div className="grid gap-4 pt-1 md:grid-cols-[minmax(0,380px)_1fr]">
      <div className="mx-auto w-full max-w-[380px]">
        <svg viewBox={`0 0 ${BCE_W} ${BCE_H}`} className="w-full" role="img">
          <rect x={BCE_PAD.l} y={BCE_PAD.t} width={BCE_W - BCE_PAD.l - BCE_PAD.r} height={BCE_H - BCE_PAD.t - BCE_PAD.b} fill="currentColor" className="text-muted/30" />
          {/* grid */}
          {[0, 1, 2, 3].map((v) => (
            <g key={v}>
              <line x1={bpx(0)} y1={bpy(v)} x2={bpx(1)} y2={bpy(v)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
              <text x={BCE_PAD.l - 5} y={bpy(v) + 3} textAnchor="end" fontSize={9.5} className="fill-muted-foreground">
                {v}
              </text>
            </g>
          ))}
          {[0, 0.25, 0.5, 0.75, 1].map((v) => (
            <text key={v} x={bpx(v)} y={BCE_H - BCE_PAD.b + 14} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground">
              {v}
            </text>
          ))}
          <text x={BCE_W / 2} y={BCE_H - 4} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium">
            predicted probability p
          </text>

          {/* MSE curve */}
          <path d={curvePath(mseCurve)} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6 4" />
          {/* BCE curves */}
          <path d={curvePath((pp) => -Math.log(pp))} fill="none" stroke="#0ea5e9" strokeWidth={2.5} />
          <path d={curvePath((pp) => -Math.log(1 - pp))} fill="none" stroke="#f43f5e" strokeWidth={2.5} opacity={y === 0 ? 1 : 0.45} />

          {/* note markers from the worked example */}
          {NOTE_MARKERS.map((m, i) => (
            <g key={i}>
              <circle cx={bpx(m.p)} cy={bpy(m.loss)} r={4} fill={m.y === 1 ? "#0ea5e9" : "#f43f5e"} stroke="currentColor" className="stroke-background" strokeWidth={1.5} />
              <text x={bpx(m.p)} y={bpy(m.loss) - 9} textAnchor="middle" fontSize={9} fontWeight={600} className="fill-muted-foreground">
                {m.loss.toFixed(4)}
              </text>
            </g>
          ))}

          {/* current marker */}
          <line x1={bpx(p)} y1={BCE_PAD.t} x2={bpx(p)} y2={BCE_H - BCE_PAD.b} stroke="currentColor" className="text-foreground/40" strokeWidth={1} strokeDasharray="3 3" />
          <circle cx={bpx(p)} cy={bpy(bce)} r={6} fill={y === 1 ? "#0ea5e9" : "#f43f5e"} stroke="currentColor" className="stroke-background" strokeWidth={2} />

          {/* annotations */}
          <text x={bpx(0.02)} y={bpy(2.6)} fontSize={9.5} className="fill-sky-600 dark:fill-sky-400" fontWeight={600}>
            BCE → ∞ as p → 0 (y = 1)
          </text>
          <text x={bpx(0.45)} y={bpy(0.28)} fontSize={9.5} className="fill-muted-foreground" fontWeight={600}>
            MSE (p−y)² stays ≤ 1 and flat — weak learning signal
          </text>
        </svg>

        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-sky-500" /> −log(p), y = 1
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-rose-500" /> −log(1−p), y = 0
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-slate-400" style={{ backgroundImage: "linear-gradient(90deg, #94a3b8 60%, transparent 40%)", backgroundSize: "6px 2px" }} /> MSE (p−y)²
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">true label y =</span>
          {[1, 0].map((v) => (
            <Button key={v} size="sm" variant={y === v ? "default" : "outline"} onClick={() => setY(v)}>
              {v}
            </Button>
          ))}
        </div>

        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium">predicted probability p</span>
            <span className="font-mono text-xs font-semibold text-primary">{f(p)}</span>
          </div>
          <Slider value={[p]} min={0.01} max={0.99} step={0.01} onValueChange={(v) => setP(v[0])} aria-label="predicted probability" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Stat label="BCE loss" value={bce.toFixed(4)} tone="accent" />
          <Stat label="MSE on probability" value={mseNow.toFixed(4)} />
        </div>

        <p className="rounded-lg bg-muted/50 p-2.5 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {y === 1
            ? `BCE = −[1·log(${f(p)}) + 0] = −log(${f(p)}) = ${bce.toFixed(4)}`
            : `BCE = −[0 + 1·log(1−${f(p)})] = −log(${f(1 - p)}) = ${bce.toFixed(4)}`}
        </p>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          Dots mark the notes&apos; examples: y=1, p=0.9 → 0.1054 (confident &amp; correct, cheap); y=0,
          p=0.2 → 0.2231; y=1, p=0.6 → 0.5108 (correct but unsure, the most expensive of the three).
          Cross-entropy punishes confident-and-wrong predictions without bound, while the MSE curve
          saturates — through a sigmoid output its gradient nearly vanishes and learning stalls
          (Section 4.5 of the notes).
        </p>
      </div>
    </div>
  );
}

/* ================= (c) Categorical cross-entropy ================= */
function CCETab() {
  const [raw, setRaw] = useState([0.2, 0.7, 0.1]);
  const [target, setTarget] = useState(1); // class 2 (0-indexed 1)

  const sum = raw.reduce((a, b) => a + b, 0) || 1;
  const probs = raw.map((r) => r / sum);
  const loss = -Math.log(Math.max(probs[target], 1e-10));

  const CLASS_COLORS = ["#0ea5e9", "#8b5cf6", "#f59e0b"];

  return (
    <div className="grid gap-4 pt-1 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-muted-foreground">
          Three softmax-like class probabilities (auto-normalised so they sum to 1). Pick the true
          class — only the probability assigned to it matters.
        </p>
        {raw.map((r, i) => (
          <div key={i} className="rounded-lg bg-muted/50 px-3 py-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className={cn("text-xs font-semibold", target === i && "text-primary")}>
                class {i + 1} {target === i && "(target)"}
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                raw {f(r)} → p = {probs[i].toFixed(3)}
              </span>
            </div>
            <Slider
              value={[r]}
              min={0.01}
              max={1}
              step={0.01}
              onValueChange={(v) => setRaw((rs) => rs.map((x, k) => (k === i ? v[0] : x)))}
              aria-label={`class ${i + 1} raw probability`}
            />
          </div>
        ))}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">true class:</span>
          {[0, 1, 2].map((v) => (
            <Button key={v} size="sm" variant={target === v ? "default" : "outline"} onClick={() => setTarget(v)}>
              {v + 1}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* probability bars */}
        <div className="flex flex-col gap-2 rounded-xl border bg-muted/30 p-3">
          {probs.map((pr, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-12 text-[11px] font-medium text-muted-foreground">class {i + 1}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-md bg-muted">
                <motion.div
                  className="flex h-full items-center justify-end rounded-md pr-1.5"
                  style={{ background: CLASS_COLORS[i], opacity: target === i ? 1 : 0.65 }}
                  animate={{ width: `${Math.max(pr * 100, 6)}%` }}
                  transition={{ type: "spring", stiffness: 160, damping: 22 }}
                >
                  <span className="font-mono text-[10px] font-bold text-white">{pr.toFixed(3)}</span>
                </motion.div>
              </div>
            </div>
          ))}
          <p className="text-right font-mono text-[10px] text-muted-foreground">Σp = {probs.reduce((a, b) => a + b, 0).toFixed(3)}</p>
        </div>

        <Stat label={`CCE = −log(p_class ${target + 1})`} value={loss.toFixed(4)} tone="accent" />

        <p className="rounded-lg bg-muted/50 p-2.5 font-mono text-[11px] text-muted-foreground">
          CCE = −Σ tᵢ·log(pᵢ) = −log({probs[target].toFixed(3)}) = {loss.toFixed(4)}
        </p>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => { setRaw([0.2, 0.7, 0.1]); setTarget(1); }}>
            Good [0.2, 0.7, 0.1] → 0.357
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setRaw([0.6, 0.1, 0.3]); setTarget(1); }}>
            Poor [0.6, 0.1, 0.3] → 2.303
          </Button>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          A confident-and-correct prediction ([0.2, 0.7, 0.1] with true class 2) costs only 0.357,
          while a confident-but-wrong one ([0.6, 0.1, 0.3], true class 2) costs 2.303 — about 6.5x
          more. All other entries drop out of the sum because their one-hot targets are 0.
        </p>
      </div>
    </div>
  );
}

/* ================= main ================= */
export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "Loss Function Explorer"}
      description={
        description ??
        "A loss function quantifies how far predictions are from targets. Explore the three workhorses: MSE / MAE for regression, binary cross-entropy and categorical cross-entropy for classification."
      }
      accent="u1"
    >
      <Tabs defaultValue="mse">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="mse">Regression (MSE / MAE)</TabsTrigger>
          <TabsTrigger value="bce">Binary cross-entropy</TabsTrigger>
          <TabsTrigger value="cce">Categorical CE</TabsTrigger>
        </TabsList>
        <TabsContent value="mse">
          <RegressionTab />
        </TabsContent>
        <TabsContent value="bce">
          <BCETab />
        </TabsContent>
        <TabsContent value="cce">
          <CCETab />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}
