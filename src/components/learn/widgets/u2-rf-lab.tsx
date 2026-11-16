"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Layers, Square, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";

type Mode = "stack" | "single";

const LAYER_COLORS = ["#10b981", "#3b82f6", "#f59e0b"];
const SINGLE_COLOR = "#f43f5e";

const CELL = 26;
const GRID = 9;
const MARGIN = 22;
const VIEW = GRID * CELL + MARGIN * 2;

function rfRect(rf: number) {
  const topLeft = (GRID / 2 - (rf - 1) / 2) * CELL + MARGIN;
  return { x: topLeft, y: topLeft, size: rf * CELL };
}

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [mode, setMode] = useState<Mode>("stack");
  const [stage, setStage] = useState(3);
  const [c, setC] = useState(64);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxStage = mode === "stack" ? 3 : 1;
  const stackRfs = [3, 5, 7];

  useEffect(() => {
    const id = requestAnimationFrame(() => setStage(mode === "stack" ? 3 : 1));
    return () => cancelAnimationFrame(id);
  }, [mode]);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    const id0 = requestAnimationFrame(() => setStage(0));
    timer.current = setInterval(() => {
      setStage((s) => {
        if (s >= maxStage) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 900);
    return () => {
      cancelAnimationFrame(id0);
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, maxStage]);

  const stackedParams = 27 * c * c;
  const singleParams = 49 * c * c;
  const savedPct = (1 - 27 / 49) * 100;

  return (
    <WidgetFrame
      title={title ?? "Receptive field: stack three 3x3 vs one 7x7"}
      description={description ?? "Both designs see the same 7x7 region of the input — but the stacked version is cheaper and more expressive (Example 3.3)."}
    >
      <WidgetControls className="mb-4">
        <div className="flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={mode === "stack" ? "default" : "outline"}
            onClick={() => setMode("stack")}
            className="h-9"
          >
            <Layers className="mr-1 h-3.5 w-3.5" /> Three stacked 3x3 convs
          </Button>
          <Button
            size="sm"
            variant={mode === "single" ? "default" : "outline"}
            onClick={() => setMode("single")}
            className="h-9"
          >
            <Square className="mr-1 h-3.5 w-3.5" /> One 7x7 conv
          </Button>
        </div>
        <PlayButton onClick={() => setPlaying((p) => !p)} playing={playing} label="Animate RF" />
        <Button size="sm" variant="outline" className="h-9" onClick={() => setStage(0)}>
          Clear
        </Button>
        <Button size="sm" variant="secondary" className="h-9" onClick={() => setStage(maxStage)}>
          Show all
        </Button>
      </WidgetControls>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:items-start">
        {/* RF grid */}
        <div>
          <p className="mb-2 text-center text-xs font-semibold">
            9 x 9 input — highlighted = region influencing one output neuron
          </p>
          <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="mx-auto h-auto w-full max-w-[300px]" role="img" aria-label="Receptive field on a 9 by 9 input grid">
            {Array.from({ length: GRID * GRID }, (_, i) => {
              const r = Math.floor(i / GRID);
              const col = i % GRID;
              return (
                <rect
                  key={i}
                  x={MARGIN + col * CELL}
                  y={MARGIN + r * CELL}
                  width={CELL}
                  height={CELL}
                  className="fill-muted/60 stroke-border"
                  strokeWidth={1}
                />
              );
            })}
            {/* the output neuron we are tracking */}
            <rect
              x={MARGIN + 4 * CELL}
              y={MARGIN + 4 * CELL}
              width={CELL}
              height={CELL}
              className="fill-primary/40 stroke-primary"
              strokeWidth={1.5}
            />
            {mode === "stack"
              ? stackRfs.slice(0, stage).map((rf, i) => {
                  const rect = rfRect(rf);
                  return (
                    <motion.rect
                      key={rf}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.12 }}
                      x={rect.x}
                      y={rect.y}
                      width={rect.size}
                      height={rect.size}
                      fill="none"
                      stroke={LAYER_COLORS[i]}
                      strokeWidth={2.5}
                      rx={4}
                      style={{ transformOrigin: `${rect.x + rect.size / 2}px ${rect.y + rect.size / 2}px` }}
                    />
                  );
                })
              : stage >= 1 && (
                  <motion.rect
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    {...(() => {
                      const rect = rfRect(7);
                      return { x: rect.x, y: rect.y, width: rect.size, height: rect.size };
                    })()}
                    fill="none"
                    stroke={SINGLE_COLOR}
                    strokeWidth={2.5}
                    rx={4}
                    style={{ transformOrigin: `${VIEW / 2}px ${VIEW / 2}px` }}
                  />
                )}
          </svg>
          {/* formula per stage */}
          <div className="mt-2 space-y-1 rounded-lg border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed">
            <p className="text-muted-foreground">RF_out = RF_in + (F − 1)</p>
            {mode === "stack" ? (
              <>
                <p className={cn(stage >= 1 ? "text-foreground" : "text-muted-foreground/50")}>
                  Layer 1: RF = 1 + (3−1) = 3
                </p>
                <p className={cn(stage >= 2 ? "text-foreground" : "text-muted-foreground/50")}>
                  Layer 2: RF = 3 + (3−1) = 5
                </p>
                <p className={cn(stage >= 3 ? "text-foreground" : "text-muted-foreground/50")}>
                  Layer 3: RF = 5 + (3−1) = 7
                </p>
              </>
            ) : (
              <p className={cn(stage >= 1 ? "text-foreground" : "text-muted-foreground/50")}>
                Layer 1: RF = 1 + (7−1) = 7
              </p>
            )}
          </div>
        </div>

        {/* Parameter comparison */}
        <div>
          <div className="mb-3 flex flex-col gap-1">
            <label className="flex items-center justify-between text-xs font-medium">
              <span>
                Channels C (same at every layer)
              </span>
              <span className="font-mono text-xs text-primary">C = {c}</span>
            </label>
            <Slider value={[c]} onValueChange={(v) => setC(v[0])} min={16} max={256} step={8} aria-label="Channels C" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Three 3x3 convs (stacked)</p>
                <p className="font-mono text-xs text-muted-foreground">3 × (3·3·C·C) = 27C²</p>
              </div>
              <div className="h-7 overflow-hidden rounded-md bg-muted">
                <motion.div
                  className="flex h-full items-center justify-end rounded-md bg-emerald-500/80 pr-2"
                  animate={{ width: `${(stackedParams / singleParams) * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                >
                  <span className="font-mono text-[11px] font-bold text-white">{stackedParams.toLocaleString("en-US")}</span>
                </motion.div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">One 7x7 conv</p>
                <p className="font-mono text-xs text-muted-foreground">1 × (7·7·C·C) = 49C²</p>
              </div>
              <div className="h-7 overflow-hidden rounded-md bg-muted">
                <motion.div
                  className="flex h-full items-center justify-end rounded-md bg-rose-500/80 pr-2"
                  animate={{ width: "100%" }}
                >
                  <span className="font-mono text-[11px] font-bold text-white">{singleParams.toLocaleString("en-US")}</span>
                </motion.div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-xs leading-relaxed">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p>
              Same receptive field (7x7), but the stack uses{" "}
              <span className="font-mono font-bold">about {Math.round(savedPct)}% fewer parameters</span> (27C² vs 49C²)
              AND gains <span className="font-bold">2 extra ReLU non-linearities</span>, making it more expressive.
              This is precisely VGG&apos;s design philosophy.
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <Stat label="27C²" value={stackedParams.toLocaleString("en-US")} tone="good" />
            <Stat label="49C²" value={singleParams.toLocaleString("en-US")} tone="bad" />
            <Stat label="Stack uses only" value={`${Math.round((stackedParams / singleParams) * 100)}%`} tone="accent" />
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
