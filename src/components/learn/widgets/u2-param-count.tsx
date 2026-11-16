"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Grid3X3, Lightbulb, Network } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { WidgetFrame, Stat, WidgetControls } from "./frame";
import { cn } from "@/lib/utils";

/** Animated count-up that eases toward its target whenever the target changes. */
function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (target - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

const CHANNELS = 3;
const NEURONS = 1000;
const DOT = 1000; // parameters represented by one dot

function DotGrid({ dots, accent, cap }: { dots: number; accent: string; cap: number }) {
  const shown = Math.min(dots, cap);
  const cols = 100;
  const rows = Math.max(1, Math.ceil(shown / cols));
  const items = Array.from({ length: shown }, (_, i) => i);
  return (
    <div className="relative">
      <svg viewBox={`0 0 ${cols} ${rows}`} className="h-auto w-full" role="img" aria-label={`${dots} dots, one per thousand parameters`}>
        {items.map((i) => {
          const r = Math.floor(i / cols);
          const c = i % cols;
          return <circle key={i} cx={c + 0.5} cy={r + 0.5} r={0.34} fill={accent} opacity={0.85} />;
        })}
      </svg>
      {dots > cap && (
        <p className="mt-1 text-center font-mono text-[10px] text-muted-foreground">
          showing {cap.toLocaleString("en-US")} of {dots.toLocaleString("en-US")} dots
        </p>
      )}
    </div>
  );
}

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [n, setN] = useState(32);
  const [k, setK] = useState(10);
  const [f, setF] = useState(5);
  const [showSteps, setShowSteps] = useState(false);

  const flat = n * n * CHANNELS;
  const denseParams = flat * NEURONS + NEURONS;
  const convParams = (f * f * CHANNELS + 1) * k;
  const ratio = denseParams / convParams;

  const denseDots = Math.round(denseParams / DOT);
  const convDots = convParams / DOT;

  const denseCount = useCountUp(denseParams);
  const convCount = useCountUp(convParams);
  const ratioCount = useCountUp(ratio);

  const isNotesDefault = n === 32 && k === 10 && f === 5;

  return (
    <WidgetFrame
      title={title ?? "Parameter explosion: dense vs convolution"}
      description={description ?? "Why flattening an image into a dense layer explodes the parameter count, and why convolution does not."}
    >
      <WidgetControls className="mb-4">
        <div className="flex min-w-[190px] flex-1 flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Image size N (N x N x 3)</span>
            <span className="font-mono text-xs text-primary">{n} x {n} x 3</span>
          </label>
          <Slider value={[n]} onValueChange={(v) => setN(v[0])} min={16} max={64} step={1} aria-label="Image size N" />
        </div>
        <div className="flex min-w-[190px] flex-1 flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Filters K</span>
            <span className="font-mono text-xs text-primary">{k}</span>
          </label>
          <Slider value={[k]} onValueChange={(v) => setK(v[0])} min={1} max={64} step={1} aria-label="Number of filters K" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium">Filter size F</span>
          <div className="flex gap-1">
            {[3, 5, 7].map((size) => (
              <Button
                key={size}
                size="sm"
                variant={f === size ? "default" : "outline"}
                onClick={() => setF(size)}
                className="h-9 min-w-11"
                aria-label={`Filter size ${size}`}
              >
                {size} x {size}
              </Button>
            ))}
          </div>
        </div>
      </WidgetControls>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Dense panel */}
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
              <Network className="h-3.5 w-3.5" /> Dense layer to 1000 neurons
            </p>
            <p className="font-mono text-xs text-muted-foreground">({flat.toLocaleString("en-US")} x 1000) + 1000</p>
          </div>
          <p className="mb-2 text-center font-mono text-lg font-bold tabular-nums text-destructive sm:text-xl">
            {Math.round(denseCount).toLocaleString("en-US")}
          </p>
          <DotGrid dots={denseDots} accent="rgb(244 63 94)" cap={3200} />
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">each dot = 1,000 parameters</p>
        </div>

        {/* Conv panel */}
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Grid3X3 className="h-3.5 w-3.5" /> Conv layer, {k} filters {f} x {f} x 3
            </p>
            <p className="font-mono text-xs text-muted-foreground">({f}·{f}·3 + 1) x {k}</p>
          </div>
          <p className="mb-2 text-center font-mono text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-xl">
            {Math.round(convCount).toLocaleString("en-US")}
          </p>
          <div className="flex flex-1 items-center justify-center rounded-lg bg-muted/40 px-3 py-4">
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.max(1, Math.min(10, Math.round(convDots))) }, (_, i) => (
                <motion.span
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="block size-3 rounded-full bg-emerald-500"
                />
              ))}
              {convDots < 1 && (
                <span className="font-mono text-xs text-muted-foreground">
                  = {convDots.toFixed(2)} dots ({convParams.toLocaleString("en-US")} params)
                </span>
              )}
            </div>
          </div>
          <p className="mt-1.5 text-center text-[10px] text-muted-foreground">each dot = 1,000 parameters</p>
        </div>
      </div>

      {/* Ratio + callout */}
      <div className="mt-4 flex flex-col items-center gap-2">
        <motion.p
          key={ratio}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-mono text-base font-bold text-primary sm:text-lg"
        >
          dense / conv = {denseParams.toLocaleString("en-US")} / {convParams.toLocaleString("en-US")} = about{" "}
          {Math.round(ratioCount).toLocaleString("en-US")}x fewer parameters
        </motion.p>
        <div className="flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs text-foreground sm:max-w-2xl">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>
            <span className="font-semibold">Conv parameters are independent of image size.</span> Drag the N slider: the
            dense count grows with N x N, but the conv count only depends on F, the input depth and K — the same{" "}
            {f} x {f} x 3 filter is reused at every spatial position (parameter sharing).
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Flattened inputs" value={`${flat.toLocaleString("en-US")}`} />
        <Stat label="Dense params" value={denseParams.toLocaleString("en-US")} tone="bad" />
        <Stat label="Conv params" value={convParams.toLocaleString("en-US")} tone="good" />
        <Stat label="Ratio" value={`about ${Math.round(ratio).toLocaleString("en-US")}x`} tone="accent" />
      </div>

      {/* Expandable worked example */}
      <div className="mt-4 rounded-xl border">
        <button
          onClick={() => setShowSteps((s) => !s)}
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-xs font-semibold hover:bg-muted/50"
          aria-expanded={showSteps}
        >
          <span>How it is computed — Example 1.1{isNotesDefault ? " (current settings match the notes)" : ""}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", showSteps && "rotate-180")} />
        </button>
        {showSteps && (
          <motion.ol
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-2 overflow-hidden border-t px-3 py-3 text-xs leading-relaxed"
          >
            <li>
              <span className="font-semibold text-primary">Step 1 — Flatten the image:</span>{" "}
              <span className="font-mono">32 x 32 x 3 = 3072</span> input values.
            </li>
            <li>
              <span className="font-semibold text-primary">Step 2 — Dense layer:</span> each of the 1000 neurons needs a
              weight per input plus 1 bias:{" "}
              <span className="font-mono">params = (3072 x 1000) + 1000 = 3,073,000</span>
            </li>
            <li>
              <span className="font-semibold text-primary">Step 3 — Convolution layer:</span> 10 filters of 5 x 5 x 3,
              reused across the whole image:{" "}
              <span className="font-mono">params = (5 x 5 x 3 + 1) x 10 = 76 x 10 = 760</span>
            </li>
            <li>
              <span className="font-semibold text-primary">Step 4 — Compare:</span>{" "}
              <span className="font-mono">3,073,000 / 760 = 4043</span> — about 4000x fewer parameters, which means
              faster training, less memory and less overfitting.
            </li>
          </motion.ol>
        )}
      </div>
    </WidgetFrame>
  );
}
