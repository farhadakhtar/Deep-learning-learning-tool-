"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, CornerUpLeft, RefreshCw, Target, Zap } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";

const STAGES = [
  { label: "Forward pass", detail: "batch through conv / pool / FC", icon: ArrowRight },
  { label: "Compute loss", detail: "compare prediction vs label", icon: Target },
  { label: "Backward pass", detail: "chain rule: ∂L/∂w for every weight", icon: CornerUpLeft },
  { label: "Update weights", detail: "gradient descent step", icon: RefreshCw },
];

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const f4 = (v: number) => v.toFixed(4);
const f2 = (v: number) => v.toFixed(2);

export default function Component({ title, description }: { title?: string; description?: string }) {
  // loop animation
  const [looping, setLooping] = useState(true);
  const [activeStage, setActiveStage] = useState(0);
  const loopTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!looping) {
      if (loopTimer.current) clearInterval(loopTimer.current);
      return;
    }
    loopTimer.current = setInterval(() => setActiveStage((s) => (s + 1) % 4), 1100);
    return () => {
      if (loopTimer.current) clearInterval(loopTimer.current);
    };
  }, [looping]);

  // Example 5.1 parameters
  const [x, setX] = useState(2);
  const [w, setW] = useState(0.5);
  const [b, setB] = useState(0.1);
  const [y, setY] = useState(1);
  const [eta, setEta] = useState(0.1);
  const [step, setStep] = useState(1);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const z = w * x + b;
  const a = sigmoid(z);
  const L = 0.5 * Math.pow(y - a, 2);
  const dL_da = -(y - a);
  const da_dz = a * (1 - a);
  const dL_dw = dL_da * da_dz * x;
  const dL_db = dL_da * da_dz;
  const wNew = w - eta * dL_dw;
  const bNew = b - eta * dL_db;

  const applyUpdate = () => {
    setLastUpdate(`w: ${f4(w)} to ${f4(wNew)}  |  b: ${f4(b)} to ${f4(bNew)}  |  L: ${f4(L)} to ${f4(0.5 * Math.pow(y - sigmoid(wNew * x + bNew), 2))}`);
    setW(Math.round(wNew * 10000) / 10000);
    setB(Math.round(bNew * 10000) / 10000);
  };

  const steps = [
    {
      title: "Step 1 — Forward pass: compute z",
      body: (
        <p className="font-mono text-xs leading-relaxed">
          z = w·x + b = {f2(w)}×{f2(x)} + {f2(b)} = <span className="font-bold text-primary">{f4(z)}</span>
        </p>
      ),
    },
    {
      title: "Step 2 — Apply the sigmoid",
      body: (
        <p className="font-mono text-xs leading-relaxed">
          a = σ(z) = 1/(1 + e^(−{f4(z)})) ≈ <span className="font-bold text-primary">{f4(a)}</span>
        </p>
      ),
    },
    {
      title: "Step 3 — Compute the MSE loss",
      body: (
        <p className="font-mono text-xs leading-relaxed">
          L = ½(y − a)² = 0.5 × ({f4(y)} − {f4(a)})² ≈ <span className="font-bold text-primary">{f4(L)}</span>
        </p>
      ),
    },
    {
      title: "Step 4 — Backward pass: chain rule",
      body: (
        <div className="space-y-1.5">
          <p className="font-mono text-xs leading-relaxed">
            ∂L/∂w = ∂L/∂a · ∂a/∂z · ∂z/∂w = ({f4(dL_da)})×({f4(da_dz)})×({f2(x)}) ≈{" "}
            <span className="font-bold text-primary">{f4(dL_dw)}</span>
          </p>
          <ul className="space-y-0.5 font-mono text-[11px] text-muted-foreground">
            <li>∂L/∂a = −(y − a) = −({f4(y)} − {f4(a)}) = {f4(dL_da)}</li>
            <li>∂a/∂z = a(1 − a) = {f4(a)}×({f4(1 - a)}) = {f4(da_dz)}</li>
            <li>∂z/∂w = x = {f2(x)}</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Step 5 — Update weights (gradient descent)",
      body: (
        <div className="space-y-1.5">
          <p className="font-mono text-xs leading-relaxed">
            w_new = w − η·∂L/∂w = {f2(w)} − {f2(eta)}×({f4(dL_dw)}) = <span className="font-bold text-primary">{f4(wNew)}</span>
          </p>
          <p className="font-mono text-xs leading-relaxed">
            ∂L/∂b = {f4(dL_db)} (since ∂z/∂b = 1) ⟹ b_new = {f2(b)} − {f2(eta)}×({f4(dL_db)}) ={" "}
            <span className="font-bold text-primary">{f4(bNew)}</span>
          </p>
          <p className="text-[11px] text-muted-foreground">
            The weight moved in the direction that pushes a closer to the target y. Repeating this thousands of times is
            literally what training means.
          </p>
        </div>
      ),
    },
  ];

  return (
    <WidgetFrame
      title={title ?? "Training loop and single-neuron backprop"}
      description={description ?? "The 4-stage training loop (Figure 5.1) plus the full worked Example 5.1 — every value is editable."}
    >
      {/* Loop diagram */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold">The training loop — repeated for every mini-batch</p>
        <PlayButton onClick={() => setLooping((p) => !p)} playing={looping} label="Loop" />
      </div>
      <div className="relative mx-auto mb-6 h-[300px] w-full max-w-[380px] sm:h-[320px]">
        <svg viewBox="0 0 380 320" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle
            cx="190"
            cy="160"
            r="108"
            fill="none"
            className="stroke-muted-foreground/40"
            strokeWidth={2}
            strokeDasharray="6 6"
          >
            {looping && (
              <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="1.5s" repeatCount="indefinite" />
            )}
          </circle>
          {[0, 1, 2, 3].map((i) => {
            const angle = (-90 + i * 90 + 45) * (Math.PI / 180);
            const px = 190 + 108 * Math.cos(angle);
            const py = 160 + 108 * Math.sin(angle);
            const rot = -90 + i * 90 + 45 + 90;
            return (
              <polygon
                key={i}
                points={`${px},${py - 6} ${px + 6},${py + 5} ${px - 6},${py + 5}`}
                className="fill-muted-foreground/60"
                transform={`rotate(${rot} ${px} ${py})`}
              />
            );
          })}
        </svg>
        {STAGES.map((stage, i) => {
          const Icon = stage.icon;
          const pos = [
            "left-1/2 top-0 -translate-x-1/2",
            "right-0 top-1/2 -translate-y-1/2",
            "left-1/2 bottom-0 -translate-x-1/2",
            "left-0 top-1/2 -translate-y-1/2",
          ][i];
          const active = activeStage === i;
          return (
            <motion.div
              key={stage.label}
              className={cn(
                "absolute w-[118px] rounded-xl border p-2 text-center",
                pos,
                active ? "border-primary/60 bg-primary/10" : "border-border bg-card"
              )}
              animate={{ scale: active ? 1.06 : 1 }}
            >
              <Icon className={cn("mx-auto h-4 w-4", active ? "text-primary" : "text-muted-foreground")} />
              <p className={cn("mt-1 text-[11px] font-semibold leading-tight", active && "text-primary")}>
                {i + 1}. {stage.label}
              </p>
              <p className="mt-0.5 text-[9px] leading-tight text-muted-foreground">{stage.detail}</p>
            </motion.div>
          );
        })}
        <p className="absolute left-1/2 top-1/2 w-24 -translate-x-1/2 -translate-y-1/2 text-center text-[10px] leading-tight text-muted-foreground">
          repeat every mini-batch, for many epochs
        </p>
      </div>

      {/* Neuron flow */}
      <div className="mb-4 overflow-x-auto">
        <div className="flex min-w-max items-center justify-center gap-1.5">
          {[
            { label: "x", value: f2(x), tone: "bg-muted" },
            { label: `× w + b`, value: `${f2(w)}, ${f2(b)}`, tone: "bg-primary/10" },
            { label: "z = wx+b", value: f4(z), tone: "bg-muted" },
            { label: "σ(z)", value: f4(a), tone: "bg-emerald-500/10" },
            { label: "L = ½(y−a)²", value: f4(L), tone: "bg-amber-500/10" },
            { label: "target y", value: f2(y), tone: "bg-muted" },
          ].map((box, i) => (
            <div key={box.label} className="flex items-center gap-1.5">
              <div className={cn("rounded-lg border px-2.5 py-1.5 text-center", box.tone)}>
                <p className="text-[9px] text-muted-foreground">{box.label}</p>
                <p className="font-mono text-xs font-bold">{box.value}</p>
              </div>
              {i < 5 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <WidgetControls className="mb-4">
        <div className="flex min-w-[130px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Input x</span>
            <span className="font-mono text-xs text-primary">{f2(x)}</span>
          </label>
          <Slider value={[x]} onValueChange={(v) => setX(v[0])} min={0.5} max={4} step={0.1} aria-label="Input x" />
        </div>
        <div className="flex min-w-[130px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Weight w</span>
            <span className="font-mono text-xs text-primary">{f2(w)}</span>
          </label>
          <Slider value={[w]} onValueChange={(v) => setW(v[0])} min={-2} max={2} step={0.01} aria-label="Weight w" />
        </div>
        <div className="flex min-w-[130px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Bias b</span>
            <span className="font-mono text-xs text-primary">{f2(b)}</span>
          </label>
          <Slider value={[b]} onValueChange={(v) => setB(v[0])} min={-1} max={1} step={0.01} aria-label="Bias b" />
        </div>
        <div className="flex min-w-[130px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Target y</span>
            <span className="font-mono text-xs text-primary">{f2(y)}</span>
          </label>
          <Slider value={[y]} onValueChange={(v) => setY(v[0])} min={0} max={1} step={0.05} aria-label="Target y" />
        </div>
        <div className="flex min-w-[130px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Learning rate η</span>
            <span className="font-mono text-xs text-primary">{f2(eta)}</span>
          </label>
          <Slider value={[eta]} onValueChange={(v) => setEta(v[0])} min={0.01} max={0.5} step={0.01} aria-label="Learning rate" />
        </div>
      </WidgetControls>

      {/* Stepper */}
      <div className="rounded-xl border">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-3 py-2.5">
          <p className="text-xs font-semibold">Example 5.1 — one full forward + backward pass</p>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline" className="h-9" onClick={() => setStep((s) => Math.max(1, s - 1))} aria-label="Previous step">
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={cn(
                  "size-2.5 rounded-full transition-colors",
                  step === i + 1 ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
            <Button size="sm" variant="outline" className="h-9" onClick={() => setStep((s) => Math.min(5, s + 1))} aria-label="Next step">
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <div className="p-3">
          <motion.div key={step} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
            <p className="mb-2 text-xs font-semibold text-primary">{steps[step - 1].title}</p>
            {steps[step - 1].body}
          </motion.div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={applyUpdate} className="h-9">
          <Zap className="mr-1 h-3.5 w-3.5" /> Apply one update (w, b)
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-9"
          onClick={() => {
            setX(2);
            setW(0.5);
            setB(0.1);
            setY(1);
            setEta(0.1);
            setLastUpdate(null);
          }}
        >
          Reset to notes values
        </Button>
        {lastUpdate && <p className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">{lastUpdate}</p>}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="z = wx + b" value={f4(z)} />
        <Stat label="a = σ(z)" value={f4(a)} />
        <Stat label="L = ½(y−a)²" value={f4(L)} />
        <Stat label="∂L/∂w" value={f4(dL_dw)} tone="accent" />
      </div>
    </WidgetFrame>
  );
}
