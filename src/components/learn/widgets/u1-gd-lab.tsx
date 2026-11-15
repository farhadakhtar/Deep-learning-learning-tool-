"use client";

import { useEffect, useRef, useState } from "react";
import { WidgetFrame, WidgetControls, PlayButton, Stat } from "./frame";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { AlertTriangle, StepForward, RotateCcw } from "lucide-react";

/* ================= (a) learning rate on a 1-D bowl ================= */
/* f(w) = 0.6(w-4)^2 + 0.5, f'(w) = 1.2(w-4). eta = 1.9 makes |1 - eta*f''| = 1.28 > 1 -> divergence. */
const FW = (w: number) => 0.6 * (w - 4) ** 2 + 0.5;
const DFW = (w: number) => 1.2 * (w - 4);

const LR_W = 380;
const LR_H = 260;
const LR_PAD = { l: 40, r: 14, t: 16, b: 34 };
const LR_DOM = { wmin: -6, wmax: 10, ymin: 0, ymax: 12 };
const lpx = (w: number) => LR_PAD.l + ((w - LR_DOM.wmin) / (LR_DOM.wmax - LR_DOM.wmin)) * (LR_W - LR_PAD.l - LR_PAD.r);
const lpy = (v: number) => LR_PAD.t + ((LR_DOM.ymax - v) / (LR_DOM.ymax - LR_DOM.ymin)) * (LR_H - LR_PAD.t - LR_PAD.b);

const LR_PRESETS = [
  { eta: 0.1, label: "0.1 · slow" },
  { eta: 0.9, label: "0.9 · good" },
  { eta: 1.9, label: "1.9 · diverges" },
];

function LearningRateTab() {
  const [eta, setEta] = useState(0.9);
  const [w, setW] = useState(0);
  const [trail, setTrail] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [diverged, setDiverged] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = () => {
    if (diverged) return;
    const wn = w - eta * DFW(w);
    setTrail((t) => [...t, w]);
    setW(wn);
    if (Math.abs(wn) > 12) {
      setDiverged(true);
      setPlaying(false);
    }
  };

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(step, 600);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, w, eta, diverged]);

  const reset = () => {
    setPlaying(false);
    setW(0);
    setTrail([]);
    setDiverged(false);
  };

  const setEtaAndReset = (e: number) => {
    setPlaying(false);
    setEta(e);
    setW(0);
    setTrail([]);
    setDiverged(false);
  };

  // visual clamps
  const bx = Math.max(LR_DOM.wmin, Math.min(LR_DOM.wmax, w));
  const by = Math.max(LR_DOM.ymin + 0.15, Math.min(LR_DOM.ymax, FW(w)));
  const offChart = w < LR_DOM.wmin || w > LR_DOM.wmax;

  // curve path
  const curve: string[] = [];
  for (let i = 0; i <= 160; i++) {
    const ww = LR_DOM.wmin + (i / 160) * (LR_DOM.wmax - LR_DOM.wmin);
    curve.push(`${i === 0 ? "M" : "L"}${lpx(ww).toFixed(1)},${lpy(FW(ww)).toFixed(1)}`);
  }

  return (
    <div className="grid gap-4 pt-1 md:grid-cols-[minmax(0,380px)_1fr]">
      <div className="mx-auto w-full max-w-[380px]">
        <svg viewBox={`0 0 ${LR_W} ${LR_H}`} className="w-full" role="img">
          <defs>
            <clipPath id="lrClip">
              <rect x={LR_PAD.l} y={LR_PAD.t} width={LR_W - LR_PAD.l - LR_PAD.r} height={LR_H - LR_PAD.t - LR_PAD.b} />
            </clipPath>
          </defs>
          <rect x={LR_PAD.l} y={LR_PAD.t} width={LR_W - LR_PAD.l - LR_PAD.r} height={LR_H - LR_PAD.t - LR_PAD.b} fill="currentColor" className="text-muted/30" />
          {/* grid */}
          {[-6, -4, -2, 0, 2, 4, 6, 8, 10].map((v) => (
            <g key={`gx${v}`}>
              <line x1={lpx(v)} y1={lpy(LR_DOM.ymin)} x2={lpx(v)} y2={lpy(LR_DOM.ymax)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
              <text x={lpx(v)} y={LR_H - LR_PAD.b + 14} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground">
                {v}
              </text>
            </g>
          ))}
          {[0, 4, 8, 12].map((v) => (
            <g key={`gy${v}`}>
              <line x1={lpx(LR_DOM.wmin)} y1={lpy(v)} x2={lpx(LR_DOM.wmax)} y2={lpy(v)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
              <text x={LR_PAD.l - 5} y={lpy(v) + 3} textAnchor="end" fontSize={9.5} className="fill-muted-foreground">
                {v}
              </text>
            </g>
          ))}
          <text x={LR_W / 2} y={LR_H - 4} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium">
            w
          </text>
          <text x={11} y={LR_H / 2} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium" transform={`rotate(-90 11 ${LR_H / 2})`}>
            f(w)
          </text>

          {/* loss curve */}
          <path d={curve.join(" ")} fill="none" stroke="currentColor" className="text-primary" strokeWidth={2.5} clipPath="url(#lrClip)" />

          {/* minimum marker */}
          <g>
            <line x1={lpx(4)} y1={lpy(0.5)} x2={lpx(4)} y2={lpy(LR_DOM.ymax)} stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={lpx(4)} cy={lpy(0.5)} r={4} fill="#10b981" />
            <text x={lpx(4) + 8} y={lpy(0.5) + 3} fontSize={9.5} className="fill-emerald-600 dark:fill-emerald-400" fontWeight={600}>
              minimum w* = 4
            </text>
          </g>

          {/* trail */}
          {trail.map((tw, i) => {
            const tx = Math.max(LR_DOM.wmin, Math.min(LR_DOM.wmax, tw));
            const ty = Math.max(LR_DOM.ymin + 0.15, Math.min(LR_DOM.ymax, FW(tw)));
            return <circle key={i} cx={lpx(tx)} cy={lpy(ty)} r={3} fill="#f97316" opacity={0.25 + (0.55 * (i + 1)) / Math.max(trail.length, 1)} />;
          })}

          {/* tangent at current w */}
          {!diverged && (
            <line
              x1={lpx(bx - 1.1)}
              y1={lpy(FW(bx) - DFW(bx) * -1.1)}
              x2={lpx(bx + 1.1)}
              y2={lpy(FW(bx) + DFW(bx) * 1.1)}
              stroke="#f59e0b"
              strokeWidth={2}
              clipPath="url(#lrClip)"
            />
          )}

          {/* ball */}
          <motion.g animate={{ x: 0, y: 0 }}>
            <motion.circle
              animate={{ cx: lpx(bx), cy: lpy(by) }}
              transition={{ type: "spring", stiffness: 130, damping: 17 }}
              cx={lpx(bx)}
              cy={lpy(by)}
              r={8}
              fill={diverged ? "#ef4444" : "#f97316"}
              stroke="currentColor"
              className="stroke-background"
              strokeWidth={2}
            />
          </motion.g>
          {offChart && (
            <text x={LR_W / 2} y={LR_PAD.t + 14} textAnchor="middle" fontSize={10.5} fontWeight={700} className="fill-red-500">
              w = {w.toFixed(2)} — off the chart!
            </text>
          )}
        </svg>
        <p className="mt-1 text-center font-mono text-[11px] text-muted-foreground">
          f(w) = 0.6(w − 4)² + 0.5 · update: w ← w − η·f′(w)
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <WidgetControls>
          {LR_PRESETS.map((p) => (
            <Button
              key={p.eta}
              size="sm"
              variant={eta === p.eta ? "default" : "outline"}
              onClick={() => setEtaAndReset(p.eta)}
            >
              η = {p.label}
            </Button>
          ))}
        </WidgetControls>

        <div className="rounded-lg bg-muted/50 px-3 py-2.5">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium">learning rate η</span>
            <span className="font-mono text-xs font-semibold text-primary">{eta.toFixed(2)}</span>
          </div>
          <Slider
            value={[eta]}
            min={0.05}
            max={2.5}
            step={0.05}
            onValueChange={(v) => setEtaAndReset(v[0])}
            aria-label="learning rate"
          />
        </div>

        <WidgetControls>
          <PlayButton onClick={() => !diverged && setPlaying((p) => !p)} playing={playing} label="Run" />
          <Button variant="outline" size="sm" onClick={step} disabled={diverged}>
            <StepForward className="h-4 w-4" /> Step
          </Button>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </WidgetControls>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="w" value={w.toFixed(3)} />
          <Stat label="f(w)" value={FW(w).toFixed(3)} />
          <Stat label="f′(w)" value={DFW(w).toFixed(3)} />
          <Stat label="steps" value={trail.length} />
        </div>

        {diverged ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-start gap-2 rounded-lg border border-red-300/60 bg-red-500/10 p-2.5 text-[11px] font-semibold leading-relaxed text-red-600 dark:text-red-400"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Diverged! |w| &gt; 12 — with η = {eta.toFixed(2)} each step overshoots the minimum by more
            than the last step undershot, so the iterate oscillates outward instead of settling.
            Reset and try η = 0.9.
          </motion.div>
        ) : (
          <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            The gradient (orange tangent) always points uphill; the update steps the opposite way.
            Too small an η crawls toward the minimum; around η ≈ 0.9 it lands almost instantly; too
            large and it overshoots, oscillates, and diverges.
          </p>
        )}
      </div>
    </div>
  );
}

/* ================= (b) batch vs SGD on linear regression ================= */
const REG_PTS = [
  { x: 1, y: 3 },
  { x: 2, y: 5 },
  { x: 3, y: 7 },
];

const RG_W = 380;
const RG_H = 280;
const RG_PAD = { l: 38, r: 14, t: 14, b: 32 };
const RG_DOM = { xmin: 0, xmax: 4, ymin: 0, ymax: 8 };
const rpx = (x: number) => RG_PAD.l + ((x - RG_DOM.xmin) / (RG_DOM.xmax - RG_DOM.xmin)) * (RG_W - RG_PAD.l - RG_PAD.r);
const rpy = (y: number) => RG_PAD.t + ((RG_DOM.ymax - y) / (RG_DOM.ymax - RG_DOM.ymin)) * (RG_H - RG_PAD.t - RG_PAD.b);

function BatchSgdTab() {
  const [mode, setMode] = useState<"batch" | "sgd">("batch");
  const [w, setW] = useState(1);
  const [b, setB] = useState(0.5);
  const [sgdIdx, setSgdIdx] = useState(0); // next SGD point index
  const [updates, setUpdates] = useState(0);
  const [whist, setWhist] = useState<number[]>([1]);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const epoch = mode === "batch" ? updates : Math.floor(updates / 3);
  const preds = REG_PTS.map((p) => w * p.x + b);
  const errs = preds.map((yh, i) => yh - REG_PTS[i].y);
  const loss = (errs.reduce((s, e) => s + e * e, 0)) / 3;

  const doStep = () => {
    if (mode === "batch") {
      const gw = (2 / 3) * errs.reduce((s, e, i) => s + e * REG_PTS[i].x, 0);
      const gb = (2 / 3) * errs.reduce((s, e) => s + e, 0);
      setW((v) => v - 0.1 * gw);
      setB((v) => v - 0.1 * gb);
      setUpdates((u) => u + 1);
      setWhist((h) => [...h, w - 0.1 * gw]);
    } else {
      const i = sgdIdx;
      const gw = 2 * errs[i] * REG_PTS[i].x;
      const gb = 2 * errs[i];
      const nw = w - 0.1 * gw;
      const nb = b - 0.1 * gb;
      setW(nw);
      setB(nb);
      setSgdIdx((v) => (v + 1) % 3);
      setUpdates((u) => u + 1);
      setWhist((h) => [...h.slice(-5), nw]);
    }
  };

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(doStep, 750);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, w, b, sgdIdx, mode]);

  const reset = (m: "batch" | "sgd") => {
    setPlaying(false);
    setMode(m);
    setW(1);
    setB(0.5);
    setSgdIdx(0);
    setUpdates(0);
    setWhist([1]);
  };

  const yAt = (x: number) => w * x + b;

  return (
    <div className="grid gap-4 pt-1 md:grid-cols-[minmax(0,380px)_1fr]">
      <div className="mx-auto w-full max-w-[380px]">
        <svg viewBox={`0 0 ${RG_W} ${RG_H}`} className="w-full" role="img">
          <defs>
            <clipPath id="rgClip">
              <rect x={RG_PAD.l} y={RG_PAD.t} width={RG_W - RG_PAD.l - RG_PAD.r} height={RG_H - RG_PAD.t - RG_PAD.b} />
            </clipPath>
          </defs>
          <rect x={RG_PAD.l} y={RG_PAD.t} width={RG_W - RG_PAD.l - RG_PAD.r} height={RG_H - RG_PAD.t - RG_PAD.b} fill="currentColor" className="text-muted/30" />
          {[0, 1, 2, 3, 4].map((v) => (
            <g key={`gx${v}`}>
              <line x1={rpx(v)} y1={rpy(RG_DOM.ymin)} x2={rpx(v)} y2={rpy(RG_DOM.ymax)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
              <text x={rpx(v)} y={RG_H - RG_PAD.b + 14} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
                {v}
              </text>
            </g>
          ))}
          {[0, 2, 4, 6, 8].map((v) => (
            <g key={`gy${v}`}>
              <line x1={rpx(RG_DOM.xmin)} y1={rpy(v)} x2={rpx(RG_DOM.xmax)} y2={rpy(v)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
              <text x={RG_PAD.l - 5} y={rpy(v) + 3} textAnchor="end" fontSize={10} className="fill-muted-foreground">
                {v}
              </text>
            </g>
          ))}
          <text x={RG_W / 2} y={RG_H - 4} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium">
            x
          </text>
          <text x={11} y={RG_H / 2} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium" transform={`rotate(-90 11 ${RG_H / 2})`}>
            y
          </text>

          {/* fitted line (clipped + animated) */}
          <motion.line
            x1={rpx(RG_DOM.xmin)}
            y1={rpy(yAt(RG_DOM.xmin))}
            x2={rpx(RG_DOM.xmax)}
            y2={rpy(yAt(RG_DOM.xmax))}
            animate={{
              y1: rpy(yAt(RG_DOM.xmin)),
              y2: rpy(yAt(RG_DOM.xmax)),
            }}
            transition={{ type: "spring", stiffness: 110, damping: 18 }}
            stroke="currentColor"
            className="text-primary"
            strokeWidth={2.5}
            clipPath="url(#rgClip)"
          />
          {/* true relationship y = 2x + 1 (dashed) */}
          <line
            x1={rpx(0)}
            y1={rpy(1)}
            x2={rpx(4)}
            y2={rpy(9)}
            stroke="#10b981"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            opacity={0.7}
            clipPath="url(#rgClip)"
          />

          {/* data points */}
          {REG_PTS.map((p, i) => {
            const active = mode === "sgd" && i === sgdIdx;
            return (
              <g key={i}>
                {active && <circle cx={rpx(p.x)} cy={rpy(p.y)} r={13} fill="#f97316" opacity={0.25} />}
                <circle cx={rpx(p.x)} cy={rpy(p.y)} r={7} fill={active ? "#f97316" : "#0ea5e9"} stroke="currentColor" className="stroke-background" strokeWidth={1.5} />
                <text x={rpx(p.x) + 10} y={rpy(p.y) - 8} fontSize={9.5} className="fill-muted-foreground font-mono">
                  ({p.x},{p.y})
                </text>
              </g>
            );
          })}
        </svg>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> data point
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-primary" /> current fit ŷ = wx + b
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-emerald-500" /> true line y = 2x + 1
          </span>
          {mode === "sgd" && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> current sample
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <WidgetControls>
          <Button size="sm" variant={mode === "batch" ? "default" : "outline"} onClick={() => reset("batch")}>
            Batch GD
          </Button>
          <Button size="sm" variant={mode === "sgd" ? "default" : "outline"} onClick={() => reset("sgd")}>
            SGD (one point at a time)
          </Button>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">η = 0.1</span>
        </WidgetControls>

        <WidgetControls>
          <PlayButton onClick={() => setPlaying((p) => !p)} playing={playing} label="Run" />
          <Button variant="outline" size="sm" onClick={doStep}>
            <StepForward className="h-4 w-4" /> Step
          </Button>
          <Button variant="outline" size="sm" onClick={() => reset(mode)}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </WidgetControls>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Stat label="w" value={w.toFixed(4)} />
          <Stat label="b" value={b.toFixed(4)} />
          <Stat label="epoch" value={epoch} />
          <Stat label="loss (1/3)Σ(ŷ−y)²" value={loss.toFixed(4)} tone={loss < 0.01 ? "good" : "default"} />
        </div>

        {/* per-point table */}
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-2.5 py-1.5 font-medium">x</th>
                <th className="px-2.5 py-1.5 font-medium">y</th>
                <th className="px-2.5 py-1.5 font-medium">ŷ = wx + b</th>
                <th className="px-2.5 py-1.5 font-medium">error ŷ−y</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {REG_PTS.map((p, i) => {
                const active = mode === "sgd" && i === sgdIdx;
                return (
                  <tr key={i} className={cn("border-b last:border-0", active && "bg-orange-500/10 font-semibold")}>
                    <td className="px-2.5 py-1.5">{p.x}</td>
                    <td className="px-2.5 py-1.5">{p.y}</td>
                    <td className="px-2.5 py-1.5">{w.toFixed(2)}({p.x}) + {b.toFixed(2)} = {preds[i].toFixed(2)}</td>
                    <td className="px-2.5 py-1.5">{errs[i].toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* gradient formulas */}
        <div className="rounded-xl border bg-muted/30 p-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
          {mode === "batch" ? (
            <>
              <p className="mb-1 font-semibold text-foreground">Batch — one update per epoch, using all 3 points:</p>
              <p>∂L/∂w = (2/n)Σ(ŷᵢ−yᵢ)·xᵢ = (2/3)({errs.map((e, i) => `(${e.toFixed(2)})(${REG_PTS[i].x})`).join("+")})</p>
              <p>∂L/∂b = (2/n)Σ(ŷᵢ−yᵢ) = (2/3)({errs.map((e) => `(${e.toFixed(2)})`).join("+")})</p>
              <p className="mt-1 text-foreground">first step: w 1.0 → 2.1333, b 0.5 → 1.0 (the notes&apos; numbers)</p>
            </>
          ) : (
            <>
              <p className="mb-1 font-semibold text-foreground">SGD — 3 updates per epoch, one point each (highlighted):</p>
              <p>∂L/∂w = 2(ŷ−y)·x on the chosen point · ∂L/∂b = 2(ŷ−y)</p>
              <p className="mt-1 text-foreground">
                w path: {whist.map((v) => v.toFixed(2)).join(" → ")}
              </p>
              <p className="mt-1 text-muted-foreground">
                first step (point (1,3)): w 1.0 → 1.3, b 0.5 → 0.8 — smaller steps, but 3x cheaper
                per epoch.
              </p>
            </>
          )}
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground">
          {mode === "batch"
            ? "Batch GD uses the combined signal of all points, so each update is exact and the path is smooth — but one epoch costs a full pass over the data."
            : "SGD zig-zags: each update is computed from a single point, so it is noisy but very cheap. Despite the noise it usually reaches a good solution faster in wall-clock time, and the noise can even help escape shallow local minima."}
        </p>
      </div>
    </div>
  );
}

/* ================= main ================= */
export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "Gradient Descent Playground"}
      description={
        description ??
        "w ← w − η·∂L/∂w. Part 1: feel how the learning rate decides between crawling, converging, and exploding. Part 2: compare Batch GD (all points per update) with SGD (one point per update) on the notes' linear regression example."
      }
      accent="u1"
    >
      <Tabs defaultValue="lr">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="lr">Learning rate</TabsTrigger>
          <TabsTrigger value="sgd">Batch vs SGD</TabsTrigger>
        </TabsList>
        <TabsContent value="lr">
          <LearningRateTab />
        </TabsContent>
        <TabsContent value="sgd">
          <BatchSgdTab />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}
