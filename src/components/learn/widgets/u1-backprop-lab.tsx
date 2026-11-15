"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WidgetFrame, WidgetControls } from "./frame";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowRight, Play, RotateCcw, TrendingDown } from "lucide-react";

/* ===================== math ===================== */
const sig = (z: number) => 1 / (1 + Math.exp(-z));

type Params = {
  x1: number;
  x2: number;
  target: number;
  eta: number;
  w: number[]; // w1..w6
  b: number[]; // b_h1, b_h2, b_o
};

const DEFAULTS: Params = {
  x1: 0.5,
  x2: 0.3,
  target: 1.0,
  eta: 0.5,
  w: [0.2, 0.4, 0.3, 0.1, 0.5, 0.6],
  b: [0.25, 0.2, 0.4],
};

function forward(p: Params) {
  const h1in = p.x1 * p.w[0] + p.x2 * p.w[1] + p.b[0];
  const h1out = sig(h1in);
  const h2in = p.x1 * p.w[2] + p.x2 * p.w[3] + p.b[1];
  const h2out = sig(h2in);
  const oin = h1out * p.w[4] + h2out * p.w[5] + p.b[2];
  const oout = sig(oin);
  const L = 0.5 * (p.target - oout) ** 2;
  return { h1in, h1out, h2in, h2out, oin, oout, L };
}

function backward(p: Params, f: ReturnType<typeof forward>) {
  const dL_doout = -(p.target - f.oout);
  const sigpO = f.oout * (1 - f.oout);
  const deltaO = dL_doout * sigpO;
  const gw = [0, 0, 0, 0, 0, 0];
  gw[4] = deltaO * f.h1out;
  gw[5] = deltaO * f.h2out;
  const gbo = deltaO;
  const dL_dh1out = deltaO * p.w[4];
  const sigpH1 = f.h1out * (1 - f.h1out);
  const deltaH1 = dL_dh1out * sigpH1;
  gw[0] = deltaH1 * p.x1;
  gw[1] = deltaH1 * p.x2;
  const dL_dh2out = deltaO * p.w[5];
  const sigpH2 = f.h2out * (1 - f.h2out);
  const deltaH2 = dL_dh2out * sigpH2;
  gw[2] = deltaH2 * p.x1;
  gw[3] = deltaH2 * p.x2;
  return { dL_doout, sigpO, deltaO, gw, gbo, dL_dh1out, sigpH1, deltaH1, dL_dh2out, sigpH2, deltaH2 };
}

function updatedParams(p: Params, g: ReturnType<typeof backward>): Params {
  // notes update w1..w6 and b_o; hidden biases are left fixed
  return {
    ...p,
    w: p.w.map((v, i) => v - p.eta * g.gw[i]),
    b: [p.b[0], p.b[1], p.b[2] - p.eta * g.gbo],
  };
}

/* number formatting (guards against -0.0000) */
const fmt = (v: number, d = 4) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v).toFixed(d);
const f2 = (v: number) => fmt(v, 2);
const f4 = (v: number) => fmt(v, 4);
const sgn = (v: number, d = 4) => (v >= 0 ? `+${fmt(v, d)}` : `−${fmt(-v, d)}`);

/* ===================== network diagram ===================== */
const NODES = {
  x1: { x: 58, y: 100 },
  x2: { x: 58, y: 208 },
  h1: { x: 218, y: 74 },
  h2: { x: 218, y: 218 },
  o: { x: 368, y: 146 },
  L: { x: 474, y: 146 },
};
const EDGES: { from: keyof typeof NODES; to: keyof typeof NODES; label: string; lx: number; ly: number; idx: number }[] = [
  { from: "x1", to: "h1", label: "w₁", lx: 132, ly: 78, idx: 0 },
  { from: "x2", to: "h1", label: "w₂", lx: 126, ly: 138, idx: 1 },
  { from: "x1", to: "h2", label: "w₃", lx: 126, ly: 174, idx: 2 },
  { from: "x2", to: "h2", label: "w₄", lx: 132, ly: 232, idx: 3 },
  { from: "h1", to: "o", label: "w₅", lx: 293, ly: 98, idx: 4 },
  { from: "h2", to: "o", label: "w₆", lx: 293, ly: 198, idx: 5 },
];

function NetworkDiagram({ step, p, f, g }: { step: number; p: Params; f: ReturnType<typeof forward>; g: ReturnType<typeof backward> }) {
  const flow = step === 1 ? "forward" : step === 2 || step === 3 ? "backward" : "updated";
  const isHighlighted = (idx: number) =>
    flow === "backward" ? (step === 2 ? idx >= 4 : idx <= 3) : true;

  return (
    <svg viewBox="0 0 520 320" className="mx-auto w-full max-w-xl" role="img">
      {/* edges */}
      {EDGES.map((e) => {
        const a = NODES[e.from];
        const b = NODES[e.to];
        const highlighted = isHighlighted(e.idx);
        const stroke =
          flow === "updated"
            ? "#10b981"
            : flow === "forward"
              ? "var(--primary)"
              : highlighted
                ? "#f97316"
                : undefined;
        const animated = flow === "forward" || (flow === "backward" && highlighted);
        return (
          <motion.line
            key={e.idx}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke={stroke ?? "currentColor"}
            className={stroke ? undefined : "text-muted-foreground/50"}
            strokeWidth={highlighted || flow !== "backward" ? 3 : 2}
            strokeDasharray={animated ? "8 6" : undefined}
            initial={false}
            animate={animated ? { strokeDashoffset: flow === "forward" ? [0, -14] : [0, 14] } : { strokeDashoffset: 0 }}
            transition={animated ? { repeat: Infinity, duration: 0.7, ease: "linear" } : { duration: 0.2 }}
          />
        );
      })}
      {/* o -> L edge */}
      <motion.line
        x1={NODES.o.x + 26}
        y1={NODES.o.y}
        x2={NODES.L.x - 24}
        y2={NODES.L.y}
        stroke={flow === "backward" ? "#f97316" : "currentColor"}
        className={flow === "backward" ? undefined : "text-muted-foreground/50"}
        strokeWidth={2.5}
        strokeDasharray={flow === "backward" ? "8 6" : undefined}
        initial={false}
        animate={flow === "backward" ? { strokeDashoffset: [0, 14] } : { strokeDashoffset: 0 }}
        transition={flow === "backward" ? { repeat: Infinity, duration: 0.7, ease: "linear" } : { duration: 0.2 }}
      />

      {/* weight labels */}
      {EDGES.map((e) => (
        <text
          key={`wl${e.idx}`}
          x={e.lx}
          y={e.ly}
          textAnchor="middle"
          fontSize={12.5}
          fontWeight={700}
          className="fill-foreground stroke-background"
          strokeWidth={4}
          paintOrder="stroke"
        >
          {e.label}={f2(p.w[e.idx])}
        </text>
      ))}

      {/* bias labels */}
      <text x={NODES.h1.x} y={NODES.h1.y + 44} textAnchor="middle" fontSize={11} className="fill-muted-foreground" fontWeight={600}>
        bₕ₁={f2(p.b[0])}
      </text>
      <text x={NODES.h2.x} y={NODES.h2.y + 44} textAnchor="middle" fontSize={11} className="fill-muted-foreground" fontWeight={600}>
        bₕ₂={f2(p.b[1])}
      </text>
      <text x={NODES.o.x} y={NODES.o.y + 46} textAnchor="middle" fontSize={11} className="fill-muted-foreground" fontWeight={600}>
        b_o={f2(p.b[2])}
      </text>

      {/* nodes */}
      {(["x1", "x2"] as const).map((k, i) => (
        <g key={k}>
          <circle cx={NODES[k].x} cy={NODES[k].y} r={26} className="fill-background stroke-foreground/70" strokeWidth={2} />
          <text x={NODES[k].x} y={NODES[k].y - 2} textAnchor="middle" fontSize={14} fontWeight={700} className="fill-foreground">
            {k === "x1" ? "x₁" : "x₂"}
          </text>
          <text x={NODES[k].x} y={NODES[k].y + 13} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground font-mono">
            {f2(i === 0 ? p.x1 : p.x2)}
          </text>
        </g>
      ))}
      {(["h1", "h2"] as const).map((k) => {
        const isH1 = k === "h1";
        const active = step >= 1;
        const deltaActive = step >= 3;
        return (
          <g key={k}>
            <circle
              cx={NODES[k].x}
              cy={NODES[k].y}
              r={26}
              className={cn("fill-background", step === 3 ? "stroke-orange-500" : "stroke-foreground/70")}
              strokeWidth={step === 3 ? 3 : 2}
            />
            <text x={NODES[k].x} y={NODES[k].y - 2} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-foreground">
              {isH1 ? "h₁" : "h₂"}
            </text>
            <text x={NODES[k].x} y={NODES[k].y + 12} textAnchor="middle" fontSize={9} className="fill-primary font-mono">
              {active ? (isH1 ? f4(f.h1out) : f4(f.h2out)) : "σ"}
            </text>
            <AnimatePresence>
              {deltaActive && (
                <motion.text
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  x={NODES[k].x}
                  y={isH1 ? NODES[k].y - 36 : NODES[k].y - 36}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  className="fill-orange-500 font-mono"
                >
                  δ = {f4(isH1 ? g.deltaH1 : g.deltaH2)}
                </motion.text>
              )}
            </AnimatePresence>
          </g>
        );
      })}
      <g>
        <circle
          cx={NODES.o.x}
          cy={NODES.o.y}
          r={26}
          className={cn("fill-background", step === 2 ? "stroke-orange-500" : "stroke-foreground/70")}
          strokeWidth={step === 2 ? 3 : 2}
        />
        <text x={NODES.o.x} y={NODES.o.y - 2} textAnchor="middle" fontSize={14} fontWeight={700} className="fill-foreground">
          o
        </text>
        <text x={NODES.o.x} y={NODES.o.y + 12} textAnchor="middle" fontSize={9} className="fill-primary font-mono">
          {step >= 1 ? f4(f.oout) : "σ"}
        </text>
        <AnimatePresence>
          {step >= 2 && (
            <motion.text
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              x={NODES.o.x}
              y={NODES.o.y - 36}
              textAnchor="middle"
              fontSize={10}
              fontWeight={700}
              className="fill-orange-500 font-mono"
            >
              δ_o = {f4(g.deltaO)}
            </motion.text>
          )}
        </AnimatePresence>
      </g>
      <g>
        <rect x={NODES.L.x - 24} y={NODES.L.y - 17} width={48} height={34} rx={9} className="fill-background stroke-foreground/70" strokeWidth={2} />
        <text x={NODES.L.x} y={NODES.L.y - 2} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-foreground">
          L
        </text>
        <text x={NODES.L.x} y={NODES.L.y + 11} textAnchor="middle" fontSize={9} className={cn("font-mono", step >= 1 ? "fill-destructive" : "fill-muted-foreground")}>
          {step >= 1 ? f4(f.L) : "loss"}
        </text>
      </g>

      {/* title chip */}
      <text x={260} y={20} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-muted-foreground">
        2 - 2 - 1 network · all neurons sigmoid · L = ½(target − o)²
      </text>
    </svg>
  );
}

/* ===================== small building blocks ===================== */
function CalcLine({ formula, expr, result, tone }: { formula: string; expr: string; result: string; tone?: "strong" | "muted" }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 py-1.5 last:border-0 sm:flex-row sm:items-baseline sm:gap-3">
      <span className="font-mono text-[11px] text-muted-foreground sm:min-w-[210px]">{formula}</span>
      <span className="flex-1 font-mono text-[11px] text-foreground/90">{expr}</span>
      <span className={cn("font-mono text-xs font-bold", tone === "strong" ? "text-primary" : tone === "muted" ? "text-muted-foreground" : "text-foreground")}>
        {result}
      </span>
    </div>
  );
}

function ParamSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="rounded-lg bg-muted/50 px-2.5 py-1.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[11px] font-semibold">{label}</span>
        <span className="font-mono text-[11px] text-primary">{f2(value)}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={(v) => onChange(v[0])}
        aria-label={label}
      />
    </div>
  );
}

/* ===================== main ===================== */
export default function Component({ title, description }: { title?: string; description?: string }) {
  const [params, setParams] = useState<Params>(DEFAULTS);
  const [step, setStep] = useState(1);
  const [history, setHistory] = useState<number[]>([]);
  const [training, setTraining] = useState(false);
  const isAuto = useRef(false);
  const trainTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const f = useMemo(() => forward(params), [params]);
  const g = useMemo(() => backward(params, f), [params, f]);
  const pNew = useMemo(() => updatedParams(params, g), [params, g]);
  const fNew = useMemo(() => forward(pNew), [pNew]);

  const setManual = (patch: Partial<Params>) => {
    if (training) return;
    isAuto.current = false;
    setHistory([]);
    setParams((p) => ({ ...p, ...patch }));
  };
  const setW = (i: number, v: number) => setManual({ w: params.w.map((x, k) => (k === i ? v : x)) });
  const setB = (i: number, v: number) => setManual({ b: params.b.map((x, k) => (k === i ? v : x)) });

  const resetAll = () => {
    if (trainTimer.current) clearInterval(trainTimer.current);
    setTraining(false);
    isAuto.current = false;
    setParams(DEFAULTS);
    setHistory([]);
    setStep(1);
  };

  const train30 = () => {
    if (training) return;
    setTraining(true);
    isAuto.current = true;
    let p = params;
    let h = [forward(p).L];
    let epoch = 0;
    setHistory(h);
    trainTimer.current = setInterval(() => {
      epoch += 1;
      const grad = backward(p, forward(p));
      p = updatedParams(p, grad);
      h = [...h, forward(p).L];
      setParams(p);
      setHistory(h);
      if (epoch >= 30) {
        if (trainTimer.current) clearInterval(trainTimer.current);
        setTraining(false);
        isAuto.current = false;
      }
    }, 110);
  };

  useEffect(() => () => {
    if (trainTimer.current) clearInterval(trainTimer.current);
  }, []);

  const chartData = history.map((l, i) => ({ epoch: i, loss: l }));
  const steps = [
    { n: 1, label: "Forward pass" },
    { n: 2, label: "Output delta" },
    { n: 3, label: "Hidden deltas" },
    { n: 4, label: "Update & verify" },
  ];

  return (
    <WidgetFrame
      title={title ?? "Backpropagation Walkthrough — 2-2-1 Network"}
      description={
        description ??
        "The complete worked example: x₁ = 0.5, x₂ = 0.3, target = 1, η = 0.5. Walk through the forward pass, the backward chain rule, and the weight update — every number matches the notes. Change any parameter and everything recomputes live."
      }
      accent="u1"
    >
      <div className="flex flex-col gap-4">
        {/* diagram + params */}
        <div className="grid gap-4 lg:grid-cols-[1fr_290px]">
          <div className="flex flex-col gap-2">
            <NetworkDiagram step={step} p={params} f={f} g={g} />
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10.5px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-primary" /> forward (step 1)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-orange-500" /> backward gradients (steps 2-3)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 rounded bg-emerald-500" /> after update (step 4)
              </span>
            </div>
          </div>

          {/* parameter panel */}
          <div className="flex flex-col gap-2 rounded-xl border bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold">Parameters</p>
              <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]" onClick={resetAll}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">inputs &amp; training</p>
            <ParamSlider label="x₁" value={params.x1} min={0} max={1} step={0.05} onChange={(v) => setManual({ x1: v })} disabled={training} />
            <ParamSlider label="x₂" value={params.x2} min={0} max={1} step={0.05} onChange={(v) => setManual({ x2: v })} disabled={training} />
            <ParamSlider label="target" value={params.target} min={0} max={1} step={0.05} onChange={(v) => setManual({ target: v })} disabled={training} />
            <ParamSlider label="η (learning rate)" value={params.eta} min={0.05} max={1.5} step={0.05} onChange={(v) => setManual({ eta: v })} disabled={training} />
            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">hidden layer</p>
            <div className="grid grid-cols-2 gap-1.5">
              <ParamSlider label="w₁" value={params.w[0]} min={-1} max={1} step={0.01} onChange={(v) => setW(0, v)} disabled={training} />
              <ParamSlider label="w₂" value={params.w[1]} min={-1} max={1} step={0.01} onChange={(v) => setW(1, v)} disabled={training} />
              <ParamSlider label="w₃" value={params.w[2]} min={-1} max={1} step={0.01} onChange={(v) => setW(2, v)} disabled={training} />
              <ParamSlider label="w₄" value={params.w[3]} min={-1} max={1} step={0.01} onChange={(v) => setW(3, v)} disabled={training} />
              <ParamSlider label="bₕ₁" value={params.b[0]} min={-1} max={1} step={0.01} onChange={(v) => setB(0, v)} disabled={training} />
              <ParamSlider label="bₕ₂" value={params.b[1]} min={-1} max={1} step={0.01} onChange={(v) => setB(1, v)} disabled={training} />
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">output layer</p>
            <div className="grid grid-cols-2 gap-1.5">
              <ParamSlider label="w₅" value={params.w[4]} min={-1} max={1} step={0.01} onChange={(v) => setW(4, v)} disabled={training} />
              <ParamSlider label="w₆" value={params.w[5]} min={-1} max={1} step={0.01} onChange={(v) => setW(5, v)} disabled={training} />
              <ParamSlider label="b_o" value={params.b[2]} min={-1} max={1} step={0.01} onChange={(v) => setB(2, v)} disabled={training} />
            </div>
          </div>
        </div>

        {/* step controller */}
        <WidgetControls>
          {steps.map((s) => (
            <Button key={s.n} size="sm" variant={step === s.n ? "default" : "outline"} onClick={() => setStep(s.n)}>
              <span className="font-mono">{s.n}</span> {s.label}
            </Button>
          ))}
          <Button size="sm" className="ml-auto" onClick={train30} disabled={training}>
            {training ? <TrendingDown className="h-4 w-4 animate-pulse" /> : <Play className="h-4 w-4" />}
            {training ? `training… ${history.length - 1}/30` : "Train 30 epochs"}
          </Button>
        </WidgetControls>

        {/* step panels */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl border bg-muted/20 p-3.5"
          >
            {step === 1 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold">
                  Step 1 — Forward pass <span className="font-normal text-muted-foreground">(values flow left to right; every activation is stored for the backward pass)</span>
                </p>
                <CalcLine formula="h₁_in = x₁w₁ + x₂w₂ + bₕ₁" expr={`(${f2(params.x1)})(${f2(params.w[0])}) + (${f2(params.x2)})(${f2(params.w[1])}) + ${f2(params.b[0])}`} result={f4(f.h1in)} />
                <CalcLine formula="h₁_out = σ(h₁_in)" expr={`σ(${f4(f.h1in)})`} result={f4(f.h1out)} tone="strong" />
                <CalcLine formula="h₂_in = x₁w₃ + x₂w₄ + bₕ₂" expr={`(${f2(params.x1)})(${f2(params.w[2])}) + (${f2(params.x2)})(${f2(params.w[3])}) + ${f2(params.b[1])}`} result={f4(f.h2in)} />
                <CalcLine formula="h₂_out = σ(h₂_in)" expr={`σ(${f4(f.h2in)})`} result={f4(f.h2out)} tone="strong" />
                <CalcLine formula="o_in = h₁_out·w₅ + h₂_out·w₆ + b_o" expr={`(${f4(f.h1out)})(${f2(params.w[4])}) + (${f4(f.h2out)})(${f2(params.w[5])}) + ${f2(params.b[2])}`} result={f4(f.oin)} />
                <CalcLine formula="o_out = σ(o_in)" expr={`σ(${f4(f.oin)})`} result={f4(f.oout)} tone="strong" />
                <CalcLine formula="L = ½(target − o_out)²" expr={`½(${f4(params.target)} − ${f4(f.oout)})²`} result={f4(f.L)} tone="strong" />
              </div>
            )}

            {step === 2 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold">
                  Step 2 — Backward pass: output layer <span className="font-normal text-muted-foreground">(chain rule: ∂L/∂w = ∂L/∂o_out · ∂o_out/∂o_in · ∂o_in/∂w)</span>
                </p>
                <CalcLine formula="∂L/∂o_out = −(target − o_out)" expr={`−(${f4(params.target)} − ${f4(f.oout)})`} result={f4(g.dL_doout)} />
                <CalcLine formula="∂o_out/∂o_in = o_out(1 − o_out)" expr={`${f4(f.oout)} × ${f4(1 - f.oout)}`} result={f4(g.sigpO)} />
                <CalcLine formula="δ_o = ∂L/∂o_in" expr={`(${f4(g.dL_doout)})(${f4(g.sigpO)})`} result={f4(g.deltaO)} tone="strong" />
                <CalcLine formula="∂L/∂w₅ = δ_o × h₁_out" expr={`(${f4(g.deltaO)})(${f4(f.h1out)})`} result={f4(g.gw[4])} />
                <CalcLine formula="∂L/∂w₆ = δ_o × h₂_out" expr={`(${f4(g.deltaO)})(${f4(f.h2out)})`} result={f4(g.gw[5])} />
                <CalcLine formula="∂L/∂b_o = δ_o × 1" expr={`(${f4(g.deltaO)})(1)`} result={f4(g.gbo)} />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  δ_o summarises how much the loss changes per unit change of the output neuron&apos;s
                  net input. It is computed once and reused for every weight feeding that neuron.
                </p>
              </div>
            )}

            {step === 3 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold">
                  Step 3 — Backward pass: hidden layer <span className="font-normal text-muted-foreground">(the chain extends one link further: ∂L/∂h_out = δ_o × w)</span>
                </p>
                <CalcLine formula="∂L/∂h₁_out = δ_o × w₅" expr={`(${f4(g.deltaO)})(${f2(params.w[4])})`} result={f4(g.dL_dh1out)} />
                <CalcLine formula="h₁_out(1 − h₁_out)" expr={`${f4(f.h1out)} × ${f4(1 - f.h1out)}`} result={f4(g.sigpH1)} />
                <CalcLine formula="δ_h₁" expr={`(${f4(g.dL_dh1out)})(${f4(g.sigpH1)})`} result={f4(g.deltaH1)} tone="strong" />
                <CalcLine formula="∂L/∂w₁ = δ_h₁ × x₁" expr={`(${f4(g.deltaH1)})(${f2(params.x1)})`} result={f4(g.gw[0])} />
                <CalcLine formula="∂L/∂w₂ = δ_h₁ × x₂" expr={`(${f4(g.deltaH1)})(${f2(params.x2)})`} result={f4(g.gw[1])} />
                <CalcLine formula="∂L/∂h₂_out = δ_o × w₆" expr={`(${f4(g.deltaO)})(${f2(params.w[5])})`} result={f4(g.dL_dh2out)} />
                <CalcLine formula="h₂_out(1 − h₂_out)" expr={`${f4(f.h2out)} × ${f4(1 - f.h2out)}`} result={f4(g.sigpH2)} />
                <CalcLine formula="δ_h₂" expr={`(${f4(g.dL_dh2out)})(${f4(g.sigpH2)})`} result={f4(g.deltaH2)} tone="strong" />
                <CalcLine formula="∂L/∂w₃ = δ_h₂ × x₁" expr={`(${f4(g.deltaH2)})(${f2(params.x1)})`} result={f4(g.gw[2])} />
                <CalcLine formula="∂L/∂w₄ = δ_h₂ × x₂" expr={`(${f4(g.deltaH2)})(${f2(params.x2)})`} result={f4(g.gw[3])} />
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                  Notice δ_o is reused (multiplied by w₅ or w₆), not recomputed — this layer-by-layer
                  reuse of deltas is exactly what makes backpropagation efficient.
                </p>
              </div>
            )}

            {step === 4 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold">
                  Step 4 — Weight update <span className="font-mono font-normal text-muted-foreground">w ← w − η·∂L/∂w, η = {f2(params.eta)}</span>
                </p>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full min-w-[430px] text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                        <th className="px-2.5 py-1.5 font-medium">parameter</th>
                        <th className="px-2.5 py-1.5 font-medium">old</th>
                        <th className="px-2.5 py-1.5 font-medium">gradient</th>
                        <th className="px-2.5 py-1.5 font-medium">update</th>
                        <th className="px-2.5 py-1.5 font-medium">new</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {[
                        { name: "w₁", old: params.w[0], gr: g.gw[0], nw: pNew.w[0] },
                        { name: "w₂", old: params.w[1], gr: g.gw[1], nw: pNew.w[1] },
                        { name: "w₃", old: params.w[2], gr: g.gw[2], nw: pNew.w[2] },
                        { name: "w₄", old: params.w[3], gr: g.gw[3], nw: pNew.w[3] },
                        { name: "w₅", old: params.w[4], gr: g.gw[4], nw: pNew.w[4] },
                        { name: "w₆", old: params.w[5], gr: g.gw[5], nw: pNew.w[5] },
                        { name: "b_o", old: params.b[2], gr: g.gbo, nw: pNew.b[2] },
                      ].map((r) => (
                        <tr key={r.name} className="border-b last:border-0">
                          <td className="px-2.5 py-1.5 font-semibold">{r.name}</td>
                          <td className="px-2.5 py-1.5">{f4(r.old)}</td>
                          <td className="px-2.5 py-1.5">{f4(r.gr)}</td>
                          <td className="px-2.5 py-1.5 text-muted-foreground">
                            {f4(r.old)} {sgn(-params.eta * r.gr)}
                          </td>
                          <td className="px-2.5 py-1.5 font-bold text-primary">{f4(r.nw)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* verification */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CalcLine formula="verify: new o_out" expr={`forward pass with updated weights`} result={f4(fNew.oout)} />
                </div>
                <div className="mt-1">
                  <CalcLine formula="verify: new loss" expr={`½(${f4(params.target)} − ${f4(fNew.oout)})²`} result={f4(fNew.L)} tone="strong" />
                </div>
                {fNew.L < f.L ? (
                  <motion.p
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-2.5 flex items-center gap-2 rounded-lg border border-emerald-300/60 bg-emerald-500/10 p-2.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400"
                  >
                    <TrendingDown className="h-4 w-4 shrink-0" />
                    Loss decreased: {f4(f.L)} → {f4(fNew.L)} after one step — the gradients pointed
                    downhill. (Hidden biases bₕ₁, bₕ₂ stay fixed, as in the notes&apos; example.)
                  </motion.p>
                ) : (
                  <p className="mt-2.5 rounded-lg border border-amber-300/60 bg-amber-500/10 p-2.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
                    With these settings the loss did not decrease ({f4(f.L)} → {f4(fNew.L)}) — try a
                    smaller η.
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* training chart */}
        {chartData.length > 1 && (
          <div className="rounded-xl border bg-muted/20 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <ArrowRight className="h-3.5 w-3.5" /> Training loss over {history.length - 1} epoch
                {history.length - 1 === 1 ? "" : "s"} (repeated forward + backward + update)
              </p>
              <span className="font-mono text-[11px] text-muted-foreground">
                {f4(history[0])} → {f4(history[history.length - 1])}
              </span>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted-foreground/20" />
                  <XAxis dataKey="epoch" tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} stroke="currentColor" className="text-muted-foreground" tickLine={false} domain={["auto", "auto"]} width={54} tickFormatter={(v: number) => v.toFixed(4)} />
                  <Tooltip
                    formatter={(v: number | string) => [Number(v).toFixed(5), "loss"]}
                    labelFormatter={(l) => `epoch ${l}`}
                    contentStyle={{ fontSize: 11, borderRadius: 8 }}
                  />
                  <Line type="monotone" dataKey="loss" stroke="var(--primary)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </WidgetFrame>
  );
}
