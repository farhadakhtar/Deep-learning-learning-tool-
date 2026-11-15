"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, StepForward, FlaskConical } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";

const EPS = 1e-8;
const HUES = ["#f43f5e", "#f59e0b", "#3b82f6", "#10b981"];
const STAGE_TITLES = [
  "Raw batch activations",
  "Step 1 — mini-batch mean",
  "Step 2 — mini-batch variance",
  "Step 3 — normalize",
  "Step 4 — scale and shift",
];

const f2 = (v: number) => (Math.abs(v) < 0.005 && v !== 0 ? v.toExponential(1) : v.toFixed(2));
const f4 = (v: number) => v.toFixed(4);

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [xs, setXs] = useState<number[]>([2, 4, 6, 8]);
  const [gamma, setGamma] = useState(2);
  const [beta, setBeta] = useState(1);
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [testTime, setTestTime] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const m = xs.length;
  const mu = xs.reduce((a, b) => a + b, 0) / m;
  const variance = xs.reduce((a, b) => a + Math.pow(b - mu, 2), 0) / m;
  const sigma = Math.sqrt(variance + EPS);
  const zs = xs.map((x) => (x - mu) / sigma);
  const ys = zs.map((z) => gamma * z + beta);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setStage((s) => {
        if (s >= 4) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 1100);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const stepOnce = () => {
    setPlaying(false);
    setStage((s) => Math.min(4, s + 1));
  };

  const displayed = stage >= 4 ? ys : stage === 3 ? zs : xs;
  const lo = Math.min(...displayed, mu) - 0.8;
  const hi = Math.max(...displayed, mu) + 0.8;
  const X = (v: number) => 34 + ((v - lo) / (hi - lo)) * 332;

  const runningMeans = [5.0, 4.96, 4.984, 4.9756];
  const batchMeans = [5.0, 4.6, 5.2, 4.9];

  return (
    <WidgetFrame
      title={title ?? "Batch normalization lab"}
      description={description ?? "The four BN steps on the notes' batch [2, 4, 6, 8] with γ = 2, β = 1 (Example 7.1). Edit everything and step through."}
    >
      <WidgetControls className="mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {xs.map((x, i) => (
            <label key={i} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-medium text-muted-foreground">x{i + 1}</span>
              <Input
                type="number"
                value={x}
                step="0.5"
                className="h-9 w-16 font-mono text-xs"
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setXs((arr) => arr.map((old, j) => (j === i ? (Number.isFinite(v) ? Math.max(-10, Math.min(10, v)) : 0) : old)));
                }}
                aria-label={`batch value x ${i + 1}`}
              />
            </label>
          ))}
        </div>
        <div className="flex min-w-[130px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>γ (scale)</span>
            <span className="font-mono text-xs text-primary">{gamma.toFixed(1)}</span>
          </label>
          <Slider value={[gamma]} onValueChange={(v) => setGamma(v[0])} min={0.1} max={4} step={0.1} aria-label="gamma" />
        </div>
        <div className="flex min-w-[130px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>β (shift)</span>
            <span className="font-mono text-xs text-primary">{beta.toFixed(1)}</span>
          </label>
          <Slider value={[beta]} onValueChange={(v) => setBeta(v[0])} min={-2} max={4} step={0.1} aria-label="beta" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PlayButton
            onClick={() => {
              if (stage >= 4) setStage(0);
              setPlaying((p) => !p);
            }}
            playing={playing}
            label="Play"
          />
          <Button size="sm" variant="outline" className="h-9" onClick={stepOnce} aria-label="Next step">
            <StepForward className="mr-1 h-3.5 w-3.5" /> Step
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-9"
            onClick={() => {
              setPlaying(false);
              setStage(0);
            }}
            aria-label="Reset"
          >
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </WidgetControls>

      {/* Stage tabs */}
      <div className="mb-3 flex flex-wrap gap-1">
        {STAGE_TITLES.map((t, i) => (
          <button
            key={t}
            onClick={() => {
              setPlaying(false);
              setStage(i);
            }}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              stage === i ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:bg-muted/60"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Number line */}
      <div className="rounded-xl border bg-muted/30 p-2">
        <svg viewBox="0 0 400 132" className="h-auto w-full" role="img" aria-label="number line of batch values">
          {/* axis */}
          <line x1={24} y1={74} x2={376} y2={74} className="stroke-border" strokeWidth={2} />
          {[lo, (lo + hi) / 2, hi].map((v, i) => (
            <g key={i}>
              <line x1={X(v)} y1={70} x2={X(v)} y2={78} className="stroke-muted-foreground" strokeWidth={1} />
              <text x={X(v)} y={92} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
                {v.toFixed(1)}
              </text>
            </g>
          ))}
          {/* mean indicator */}
          {stage >= 1 && stage < 3 && (
            <g>
              <line x1={X(mu)} y1={26} x2={X(mu)} y2={74} className="stroke-primary" strokeWidth={2} strokeDasharray="4 3" />
              <text x={X(mu)} y={20} textAnchor="middle" className="fill-primary font-mono text-[11px] font-bold">
                μ = {f2(mu)}
              </text>
            </g>
          )}
          {/* ±1 references after normalize */}
          {stage === 3 && (
            <>
              <line x1={X(0)} y1={30} x2={X(0)} y2={74} className="stroke-primary" strokeWidth={2} strokeDasharray="4 3" />
              <text x={X(0)} y={22} textAnchor="middle" className="fill-primary font-mono text-[10px] font-bold">0</text>
              {[1, -1].map((v) => (
                <g key={v}>
                  <line x1={X(v)} y1={44} x2={X(v)} y2={74} className="stroke-muted-foreground/60" strokeWidth={1} strokeDasharray="2 3" />
                  <text x={X(v)} y={40} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">{v > 0 ? "+1" : "−1"}</text>
                </g>
              ))}
            </>
          )}
          {/* deviation bars (stage 2) */}
          {stage === 2 &&
            xs.map((x, i) => {
              const dev = Math.pow(x - mu, 2);
              const h = (dev / Math.max(...xs.map((v) => Math.pow(v - mu, 2)), 1e-9)) * 26;
              return (
                <g key={i}>
                  <motion.rect
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    x={X(x) - 7}
                    width={14}
                    y={110 - h}
                    fill={HUES[i]}
                    opacity={0.55}
                    rx={2}
                  />
                  <text x={X(x)} y={122} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">
                    ({x.toFixed(0)}−μ)²={dev.toFixed(0)}
                  </text>
                </g>
              );
            })}
          {/* markers */}
          {displayed.map((v, i) => (
            <motion.g key={`${stage}-${i}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <motion.circle
                animate={{ cx: X(v) }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
                cy={74}
                r={9}
                fill={HUES[i]}
                stroke="white"
                strokeWidth={2}
              />
              <motion.text
                animate={{ x: X(v) }}
                transition={{ type: "spring", stiffness: 160, damping: 22 }}
                y={58}
                textAnchor="middle"
                className="fill-foreground font-mono text-[11px] font-bold"
                style={{ fill: HUES[i] }}
              >
                {stage === 0 ? v.toFixed(0) : stage === 3 ? f4(v) : f2(v)}
              </motion.text>
            </motion.g>
          ))}
        </svg>
      </div>

      {/* Live formulas */}
      <div className="mt-4 space-y-1.5 rounded-xl border bg-muted/40 p-3 font-mono text-xs leading-relaxed">
        {stage === 0 && <p>raw batch: x = [{xs.map((v) => v.toFixed(0)).join(", ")}] — arbitrary spread, shifting distribution</p>}
        {stage === 1 && (
          <p>
            μ = ({xs.map((v) => v.toFixed(0)).join(" + ")})/{m} = {(xs.reduce((a, b) => a + b, 0)).toFixed(0)}/{m} ={" "}
            <span className="font-bold text-primary">{f2(mu)}</span>
          </p>
        )}
        {stage === 2 && (
          <p>
            σ² = [{xs.map((v) => `(${v.toFixed(0)}−${f2(mu)})²`).join(" + ")}]/{m} = [{xs.map((v) => Math.pow(v - mu, 2).toFixed(0)).join("+")}]/{m} ={" "}
            <span className="font-bold text-primary">{f2(variance)}</span>
          </p>
        )}
        {stage === 3 && (
          <p>
            z_i = (x_i − μ)/√(σ² + ε) = (x_i − {f2(mu)})/{sigma.toFixed(4)} → [{zs.map((z) => f4(z)).join(", ")}]{" "}
            <span className="font-bold text-primary">(mean 0, variance 1)</span>
          </p>
        )}
        {stage === 4 && (
          <p>
            y_i = γ·z_i + β = {gamma.toFixed(1)}·z_i + {beta.toFixed(1)} → [{ys.map((y) => f2(y)).join(", ")}] — the
            network can learn to undo the normalization if that is optimal
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="μ (mean)" value={f2(mu)} />
        <Stat label="σ² (variance)" value={f2(variance)} />
        <Stat label="γ / β" value={`${gamma.toFixed(1)} / ${beta.toFixed(1)}`} />
        <Stat label="learnable params" value="γ and β only" tone="accent" />
      </div>

      {/* Test-time toggle */}
      <div className="mt-4 rounded-xl border p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold">Test-time mode</p>
          <Switch checked={testTime} onCheckedChange={setTestTime} aria-label="toggle test time explanation" />
        </div>
        {testTime && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
            <p className="mt-2 text-xs leading-relaxed">
              At inference there is no batch to compute statistics from. During training BN keeps a{" "}
              <span className="font-semibold">running average</span> of the mean and variance seen across mini-batches;
              at test time this fixed average is used instead — so inference is deterministic and works on a single
              example.
            </p>
            <div className="mt-2 overflow-x-auto">
              <table className="w-full font-mono text-[11px]">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="py-1 pr-3 text-left font-medium">batch #</th>
                    <th className="py-1 pr-3 text-right font-medium">batch mean μ</th>
                    <th className="py-1 text-right font-medium">running mean (momentum 0.9)</th>
                  </tr>
                </thead>
                <tbody>
                  {batchMeans.map((bm, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-1 pr-3">{i + 1}</td>
                      <td className="py-1 pr-3 text-right">{bm.toFixed(1)}</td>
                      <td className="py-1 text-right text-primary">{runningMeans[i].toFixed(4)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              r ← 0.9·r + 0.1·μ per batch; the final running mean (≈ 4.976) is what gets used at test time.
            </p>
          </motion.div>
        )}
      </div>

      <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted-foreground">
        <FlaskConical className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        Standard placement is Conv → BatchNorm → ReLU: normalize the raw linear output before the non-linearity. Because
        BN re-centres the output, the conv bias becomes redundant and is usually dropped.
      </p>
    </WidgetFrame>
  );
}
