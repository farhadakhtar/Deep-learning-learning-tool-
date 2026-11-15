"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCcw, Sparkles } from "lucide-react";

/* ---------------- shared helpers ---------------- */

const sig = (x: number) => 1 / (1 + Math.exp(-x));
const f2 = (x: number) => {
  const s = x.toFixed(2);
  return s === "-0.00" ? "0.00" : s;
};
const f4 = (x: number) => {
  const s = x.toFixed(4);
  return s === "-0.0000" ? "0.0000" : s;
};
const paren = (v: number) => (v < 0 ? `(${f2(v)})` : f2(v));

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randn(rng: () => number) {
  const u = Math.max(1e-9, rng());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <span className="w-28 shrink-0 font-mono text-xs text-muted-foreground" title={hint}>
        {label}
      </span>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
        className="h-11 flex-1"
        aria-label={label}
      />
      <span className="w-14 shrink-0 text-right font-mono text-xs font-semibold text-foreground">{f2(value)}</span>
    </div>
  );
}

/* ================================================================== */
/* TAB A — Worked example (notes Example 2.1)                         */
/* ================================================================== */

const DEF = { x1: 0.8, x2: 0.3, w1: 0.5, w2: -0.3, b: 0.1, d1: 0.6, d2: 0.4 };

function WorkedExample() {
  const [v, setV] = useState({ ...DEF });
  const [step, setStep] = useState(5);

  const zPre = v.w1 * v.x1 + v.w2 * v.x2 + v.b;
  const z = sig(zPre);
  const p1 = v.d1 * z;
  const p2 = v.d2 * z;
  const xh1 = sig(p1);
  const xh2 = sig(p2);
  const e1 = (v.x1 - xh1) ** 2;
  const e2 = (v.x2 - xh2) ** 2;
  const loss = 0.5 * (e1 + e2);

  const steps = [
    {
      title: "Encoder pre-activation",
      body: `z_pre = ${f2(v.w1)}·${f2(v.x1)} + ${paren(v.w2)}·${f2(v.x2)} + ${f2(v.b)} = ${f4(zPre)}`,
      note: "Weighted sum of the inputs — how much each input contributes to the compressed code.",
    },
    {
      title: "Apply activation (the code)",
      body: `z = σ(${f4(zPre)}) = ${f4(z)}`,
      note: "The sigmoid squashes the code into (0,1) and adds the non-linearity that lets the network beat a linear projection (PCA).",
    },
    {
      title: "Decoder pre-activations",
      body: `x̂₁,pre = ${f2(v.d1)}·${f4(z)} = ${f4(p1)},\u2003x̂₂,pre = ${f2(v.d2)}·${f4(z)} = ${f4(p2)}`,
      note: "The single code value is expanded back out to 2 numbers, one per output unit.",
    },
    {
      title: "Reconstruction",
      body: `x̂ = [σ(${f4(p1)}), σ(${f4(p2)})] = [${f4(xh1)}, ${f4(xh2)}]`,
      note: "The decoder's best attempt at regenerating the input from the 1-number summary.",
    },
    {
      title: "Reconstruction loss (MSE)",
      body: `L = ½[(${f2(v.x1)}−${f4(xh1)})² + (${f2(v.x2)}−${f4(xh2)})²] = ½[${f4(e1)} + ${f4(e2)}] = ${f4(loss)}`,
      note: "This single number is the training signal — backprop adjusts W, b, W′, b′ to reduce it.",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      {/* controls */}
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Edit the example</p>
        <SliderRow label="x₁" value={v.x1} min={0} max={1} onChange={(n) => setV({ ...v, x1: n })} hint="input, dimension 1" />
        <SliderRow label="x₂" value={v.x2} min={0} max={1} onChange={(n) => setV({ ...v, x2: n })} hint="input, dimension 2" />
        <SliderRow label="W₁" value={v.w1} min={-1} max={1} onChange={(n) => setV({ ...v, w1: n })} hint="encoder weight for x₁" />
        <SliderRow label="W₂" value={v.w2} min={-1} max={1} onChange={(n) => setV({ ...v, w2: n })} hint="encoder weight for x₂" />
        <SliderRow label="b" value={v.b} min={-1} max={1} onChange={(n) => setV({ ...v, b: n })} hint="encoder bias" />
        <SliderRow label="W′₁" value={v.d1} min={-1} max={1} onChange={(n) => setV({ ...v, d1: n })} hint="decoder weight for output 1" />
        <SliderRow label="W′₂" value={v.d2} min={-1} max={1} onChange={(n) => setV({ ...v, d2: n })} hint="decoder weight for output 2" />
        <p className="pt-1 font-mono text-[10px] text-muted-foreground">b′ = [0, 0] (fixed, as in the notes)</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 h-11 w-full"
          onClick={() => {
            setV({ ...DEF });
            setStep(5);
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset to notes values
        </Button>
      </div>

      {/* steps + viz */}
      <div className="min-w-0 space-y-4">
        {/* architecture */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <svg viewBox="0 0 360 170" className="mx-auto h-auto w-full max-w-md" role="img" aria-label="Autoencoder architecture">
            <line x1={56} y1={52} x2={158} y2={80} className="stroke-border" strokeWidth={1.6} />
            <line x1={56} y1={122} x2={158} y2={104} className="stroke-border" strokeWidth={1.6} />
            <line x1={206} y1={80} x2={308} y2={52} className="stroke-border" strokeWidth={1.6} />
            <line x1={206} y1={104} x2={308} y2={122} className="stroke-border" strokeWidth={1.6} />
            <text x={100} y={54} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize={10}>
              W₁={f2(v.w1)}
            </text>
            <text x={100} y={132} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize={10}>
              W₂={f2(v.w2)}
            </text>
            <text x={262} y={54} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize={10}>
              W′₁={f2(v.d1)}
            </text>
            <text x={262} y={132} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize={10}>
              W′₂={f2(v.d2)}
            </text>
            <circle cx={40} cy={52} r={18} className="fill-card" stroke="#0ea5e9" strokeWidth={2} />
            <text x={40} y={49} textAnchor="middle" className="fill-foreground font-mono" fontSize={9}>
              x₁
            </text>
            <text x={40} y={60} textAnchor="middle" className="fill-foreground font-mono" fontSize={9} fontWeight={700}>
              {f2(v.x1)}
            </text>
            <circle cx={40} cy={122} r={18} className="fill-card" stroke="#0ea5e9" strokeWidth={2} />
            <text x={40} y={119} textAnchor="middle" className="fill-foreground font-mono" fontSize={9}>
              x₂
            </text>
            <text x={40} y={130} textAnchor="middle" className="fill-foreground font-mono" fontSize={9} fontWeight={700}>
              {f2(v.x2)}
            </text>
            <circle cx={182} cy={92} r={26} className="fill-card" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="4 3" />
            <circle cx={182} cy={92} r={18} className="fill-card" stroke="#8b5cf6" strokeWidth={2} />
            <text x={182} y={89} textAnchor="middle" className="fill-foreground font-mono" fontSize={9}>
              z
            </text>
            <text x={182} y={100} textAnchor="middle" className="fill-foreground font-mono" fontSize={9} fontWeight={700}>
              {f4(z)}
            </text>
            <text x={182} y={138} textAnchor="middle" className="fill-muted-foreground" fontSize={8.5}>
              1-unit bottleneck
            </text>
            <circle cx={322} cy={52} r={18} className="fill-card" stroke="#10b981" strokeWidth={2} />
            <text x={322} y={49} textAnchor="middle" className="fill-foreground font-mono" fontSize={9}>
              x̂₁
            </text>
            <text x={322} y={60} textAnchor="middle" className="fill-foreground font-mono" fontSize={9} fontWeight={700}>
              {f4(xh1)}
            </text>
            <circle cx={322} cy={122} r={18} className="fill-card" stroke="#10b981" strokeWidth={2} />
            <text x={322} y={119} textAnchor="middle" className="fill-foreground font-mono" fontSize={9}>
              x̂₂
            </text>
            <text x={322} y={130} textAnchor="middle" className="fill-foreground font-mono" fontSize={9} fontWeight={700}>
              {f4(xh2)}
            </text>
          </svg>
        </div>

        {/* stepper */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-11 w-11 p-0" onClick={() => setStep((s) => Math.max(1, s - 1))} aria-label="Previous step">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-9 w-9 rounded-full font-mono text-xs font-semibold transition-colors ${
                  i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-11 w-11 p-0" onClick={() => setStep((s) => Math.min(5, s + 1))} aria-label="Next step">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-11" onClick={() => setStep(5)}>
            Show all
          </Button>
        </div>

        <ol className="space-y-2">
          {steps.slice(0, step).map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`rounded-xl border p-3 ${i === step - 1 ? "border-primary/50 bg-primary/5" : "bg-muted/30"}`}
            >
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-xs font-bold text-primary">{i + 1}.</span>
                <span className="text-xs font-semibold text-foreground">{s.title}</span>
              </div>
              <p className="mt-1 break-words pl-5 font-mono text-xs text-foreground">{s.body}</p>
              {i === step - 1 && <p className="mt-1.5 pl-5 text-[11px] leading-relaxed text-muted-foreground">{s.note}</p>}
            </motion.li>
          ))}
        </ol>

        {/* bars + loss */}
        <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
          <div className="rounded-xl border bg-muted/20 p-3">
            <div className="mb-2 flex items-center justify-center gap-4 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-sky-500" /> input x
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-500" /> reconstruction x̂
              </span>
            </div>
            <svg viewBox="0 0 320 150" className="h-auto w-full" role="img" aria-label="Input versus reconstruction bars">
              <line x1={20} y1={120} x2={300} y2={120} className="stroke-border" strokeWidth={1.5} />
              <rect x={52} y={120 - v.x1 * 100} width={44} height={Math.max(1, v.x1 * 100)} rx={4} className="fill-sky-500" fillOpacity={0.85} />
              <rect x={102} y={120 - xh1 * 100} width={44} height={Math.max(1, xh1 * 100)} rx={4} className="fill-emerald-500" fillOpacity={0.85} />
              <text x={74} y={114 - v.x1 * 100} textAnchor="middle" className="fill-foreground font-mono" fontSize={10}>
                {f2(v.x1)}
              </text>
              <text x={124} y={114 - xh1 * 100} textAnchor="middle" className="fill-foreground font-mono" fontSize={10}>
                {f4(xh1)}
              </text>
              <text x={99} y={137} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize={10}>
                dim 1
              </text>
              <rect x={192} y={120 - v.x2 * 100} width={44} height={Math.max(1, v.x2 * 100)} rx={4} className="fill-sky-500" fillOpacity={0.85} />
              <rect x={242} y={120 - xh2 * 100} width={44} height={Math.max(1, xh2 * 100)} rx={4} className="fill-emerald-500" fillOpacity={0.85} />
              <text x={214} y={114 - v.x2 * 100} textAnchor="middle" className="fill-foreground font-mono" fontSize={10}>
                {f2(v.x2)}
              </text>
              <text x={264} y={114 - xh2 * 100} textAnchor="middle" className="fill-foreground font-mono" fontSize={10}>
                {f4(xh2)}
              </text>
              <text x={239} y={137} textAnchor="middle" className="fill-muted-foreground font-mono" fontSize={10}>
                dim 2
              </text>
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <Stat label="Code z" value={f4(z)} tone="accent" />
            <Stat label="Loss L = ½‖x−x̂‖²" value={f4(loss)} tone={loss > 0.05 ? "bad" : "good"} />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              With only 1 bottleneck unit for 2 inputs, some information is always lost — the loss measures exactly how
              much.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* TAB B — Train a 2->1->2 tanh autoencoder live                      */
/* ================================================================== */

type Pt = { x1: number; x2: number };
type AEModel = { w1: [number, number]; b1: number; w2: [number, number]; b2: [number, number] };
type TrainState = { model: AEModel; epoch: number; history: { epoch: number; mse: number }[] };

function makeData(): Pt[] {
  const rng = mulberry32(42);
  return Array.from({ length: 40 }, (_, i) => {
    const t = Math.PI * (i / 39);
    return { x1: Math.cos(t) + 0.02 * randn(rng), x2: Math.sin(t) + 0.02 * randn(rng) };
  });
}

function initModel(seed: number): AEModel {
  const rng = mulberry32(seed);
  const r = () => randn(rng) * 0.5;
  return { w1: [r(), r()], b1: 0, w2: [r(), r()], b2: [r(), r()] };
}

function forwardAE(m: AEModel, p: Pt) {
  const z = Math.tanh(m.w1[0] * p.x1 + m.w1[1] * p.x2 + m.b1);
  const r1 = Math.tanh(m.w2[0] * z + m.b2[0]);
  const r2 = Math.tanh(m.w2[1] * z + m.b2[1]);
  return { z, r1, r2 };
}

function trainEpochs(m: AEModel, data: Pt[], epochs: number, lr = 0.08): { model: AEModel; losses: number[] } {
  const model: AEModel = { w1: [m.w1[0], m.w1[1]], b1: m.b1, w2: [m.w2[0], m.w2[1]], b2: [m.b2[0], m.b2[1]] };
  const losses: number[] = [];
  for (let e = 0; e < epochs; e++) {
    const gw1 = [0, 0];
    const gw2 = [0, 0];
    const gb2 = [0, 0];
    let gb1 = 0;
    let loss = 0;
    for (const p of data) {
      const { z, r1, r2 } = forwardAE(model, p);
      loss += 0.5 * ((p.x1 - r1) ** 2 + (p.x2 - r2) ** 2);
      const d1 = (r1 - p.x1) * (1 - r1 * r1);
      const d2 = (r2 - p.x2) * (1 - r2 * r2);
      gw2[0] += d1 * z;
      gw2[1] += d2 * z;
      gb2[0] += d1;
      gb2[1] += d2;
      const dz = (d1 * model.w2[0] + d2 * model.w2[1]) * (1 - z * z);
      gw1[0] += dz * p.x1;
      gw1[1] += dz * p.x2;
      gb1 += dz;
    }
    const n = data.length;
    model.w1[0] -= (lr * gw1[0]) / n;
    model.w1[1] -= (lr * gw1[1]) / n;
    model.b1 -= (lr * gb1) / n;
    model.w2[0] -= (lr * gw2[0]) / n;
    model.w2[1] -= (lr * gw2[1]) / n;
    model.b2[0] -= (lr * gb2[0]) / n;
    model.b2[1] -= (lr * gb2[1]) / n;
    losses.push(loss / n);
  }
  return { model, losses };
}

const zColor = (z: number) => `hsl(${210 - ((Math.max(-1, Math.min(1, z)) + 1) / 2) * 190} 72% 52%)`;

function LiveTraining() {
  const data = useMemo(() => makeData(), []);
  const [seed, setSeed] = useState(7);
  const [train, setTrain] = useState<TrainState>(() => ({ model: initModel(7), epoch: 0, history: [{ epoch: 0, mse: NaN }] }));
  const [playing, setPlaying] = useState(false);
  const [budget, setBudget] = useState(0);

  const tick = useCallback(
    (s: TrainState): TrainState => {
      const { model, losses } = trainEpochs(s.model, data, 1);
      return {
        model,
        epoch: s.epoch + 1,
        history: [...s.history, { epoch: s.epoch + 1, mse: losses[0] }].slice(-400),
      };
    },
    [data]
  );

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setBudget((b) => Math.max(0, b - 1));
      setTrain(tick);
    }, 25);
    return () => window.clearInterval(id);
  }, [playing, tick]);

  useEffect(() => {
    if (playing && budget <= 0) {
      const id = requestAnimationFrame(() => setPlaying(false));
      return () => cancelAnimationFrame(id);
    }
  }, [budget, playing]);

  const reset = (newSeed: number) => {
    setPlaying(false);
    setBudget(0);
    setSeed(newSeed);
    setTrain({ model: initModel(newSeed), epoch: 0, history: [{ epoch: 0, mse: NaN }] });
  };

  const currentMse = train.history[train.history.length - 1]?.mse ?? NaN;
  const chartData = train.history.filter((h) => Number.isFinite(h.mse));

  /* geometry helpers for the scatter */
  const R = 1.35;
  const toX = (x: number) => 20 + ((x + R) / (2 * R)) * 260;
  const toY = (y: number) => 280 - ((y + R) / (2 * R)) * 260;

  const pts = data.map((p) => ({ ...p, ...forwardAE(train.model, p) }));

  return (
    <div className="space-y-4">
      <WidgetControls>
        <div className="flex min-h-11 items-center">
          <PlayButton
            playing={playing}
            label="Train 50 epochs"
            onClick={() => {
              if (playing) {
                setPlaying(false);
              } else {
                setBudget(50);
                setPlaying(true);
              }
            }}
          />
        </div>
        <Button variant="outline" size="sm" className="h-11" onClick={() => setTrain(tick)} disabled={playing}>
          +1 epoch
        </Button>
        <Button variant="outline" size="sm" className="h-11" onClick={() => reset(seed + 1)}>
          <RotateCcw className="h-3.5 w-3.5" /> Re-init weights
        </Button>
        <div className="ml-auto flex gap-2">
          <Stat label="Epoch" value={train.epoch} />
          <Stat
            label="MSE loss"
            value={Number.isFinite(currentMse) ? f4(currentMse) : "—"}
            tone={currentMse < 0.02 ? "good" : "default"}
          />
        </div>
      </WidgetControls>

      <div className="grid gap-4 md:grid-cols-2">
        {/* scatter with reconstruction arrows */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Data (40 pts on a semicircle), arrows to reconstructions
          </p>
          <svg viewBox="0 0 300 300" className="h-auto w-full" role="img" aria-label="Data scatter and reconstructions">
            <defs>
              <marker id="ae-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
                <path d="M0,0 L7,3.5 L0,7 z" className="fill-rose-500" fillOpacity={0.75} />
              </marker>
            </defs>
            <rect x={20} y={20} width={260} height={260} className="fill-background" stroke="currentColor" strokeOpacity={0.15} rx={6} />
            <line x1={150} y1={20} x2={150} y2={280} className="stroke-border" strokeDasharray="3 4" />
            <line x1={20} y1={150} x2={280} y2={150} className="stroke-border" strokeDasharray="3 4" />
            {pts.map((p, i) => (
              <line
                key={`a${i}`}
                x1={toX(p.x1)}
                y1={toY(p.x2)}
                x2={toX(p.r1)}
                y2={toY(p.r2)}
                className="stroke-rose-500"
                strokeWidth={1}
                strokeOpacity={0.55}
                markerEnd="url(#ae-arrow)"
              />
            ))}
            {pts.map((p, i) => (
              <circle key={`r${i}`} cx={toX(p.r1)} cy={toY(p.r2)} r={3} className="fill-card" stroke="#10b981" strokeWidth={1.4} />
            ))}
            {pts.map((p, i) => (
              <circle
                key={`p${i}`}
                cx={toX(p.x1)}
                cy={toY(p.x2)}
                r={4.4}
                fill={zColor(p.z)}
                stroke="currentColor"
                strokeOpacity={0.25}
              />
            ))}
          </svg>
          <div className="mt-2 flex items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground">z = −1</span>
            <div
              className="h-2.5 flex-1 rounded-full"
              style={{ background: "linear-gradient(to right, hsl(210 72% 52%), hsl(115 72% 52%), hsl(20 72% 52%))" }}
            />
            <span className="font-mono text-[10px] text-muted-foreground">z = +1</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Point colour = its 1-D bottleneck value z = tanh(W₁x₁ + W₂x₂ + b). The network must fold the semicircle onto a
            line, then unfold it back — arrows show the remaining reconstruction error.
          </p>
        </div>

        {/* loss curve */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Live MSE loss (gradient descent, lr = 0.08)
          </p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis
                  dataKey="epoch"
                  tick={{ fontSize: 10 }}
                  strokeOpacity={0.4}
                  label={{ value: "epoch", position: "insideBottomRight", fontSize: 10, offset: -2 }}
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  strokeOpacity={0.4}
                  width={54}
                  tickFormatter={(t: number) => t.toFixed(3)}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  formatter={(value: number | string) => [Number(value).toFixed(4), "MSE"]}
                  labelFormatter={(l) => `epoch ${l}`}
                  contentStyle={{ fontSize: 11, borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="mse" stroke="#8b5cf6" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Backprop is implemented by hand: the error at the outputs flows through the decoder into the single bottleneck
            unit and back into the encoder weights. Re-init and re-train to see different initialisations converge.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */

export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "Autoencoder Lab"}
      description={description ?? "Compress x through a 1-unit bottleneck and measure the price: the reconstruction loss."}
      accent="u4"
    >
      <Tabs defaultValue="worked">
        <TabsList className="h-11 w-full sm:w-auto">
          <TabsTrigger value="worked" className="px-4">
            <Sparkles className="h-3.5 w-3.5" /> Worked example
          </TabsTrigger>
          <TabsTrigger value="live" className="px-4">
            Train one live
          </TabsTrigger>
        </TabsList>
        <TabsContent value="worked" className="mt-3">
          <WorkedExample />
        </TabsContent>
        <TabsContent value="live" className="mt-3">
          <LiveTraining />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}
