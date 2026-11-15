"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, RotateCcw, StepForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";

type Mode = "max" | "avg" | "gap";

// Figure 4.1 layout: each coloured 2x2 block {1,3,5,6}, {2,4,1,2}, {2,4,0,1}, {3,1,2,5}
const NOTES_GRID = [
  [1, 3, 2, 4],
  [5, 6, 1, 2],
  [2, 4, 3, 1],
  [0, 1, 2, 5],
];

const WINDOWS = [
  { top: 0, left: 0, hue: "#f43f5e" }, // rose
  { top: 0, left: 2, hue: "#f59e0b" }, // amber
  { top: 2, left: 0, hue: "#3b82f6" }, // blue
  { top: 2, left: 2, hue: "#10b981" }, // emerald
];

function fmtVal(v: number) {
  return Number.isInteger(v) ? String(v) : v.toFixed(2);
}

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [grid, setGrid] = useState<number[][]>(NOTES_GRID.map((r) => [...r]));
  const [mode, setMode] = useState<Mode>("max");
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSteps = mode === "gap" ? 1 : WINDOWS.length;

  const windowCells = (w: { top: number; left: number }) =>
    [grid[w.top][w.left], grid[w.top][w.left + 1], grid[w.top + 1][w.left], grid[w.top + 1][w.left + 1]];

  const outputs = WINDOWS.map((w) => {
    const cells = windowCells(w);
    return mode === "max" ? Math.max(...cells) : cells.reduce((a, b) => a + b, 0) / 4;
  });
  const maxOutputs = WINDOWS.map((w) => Math.max(...windowCells(w)));
  const avgOutputs = WINDOWS.map((w) => windowCells(w).reduce((a, b) => a + b, 0) / 4);

  const gapSum = grid.flat().reduce((a, b) => a + b, 0);
  const gapValue = gapSum / 16;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setStepIndex(0);
      setPlaying(false);
    });
    return () => cancelAnimationFrame(id);
  }, [mode]);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setStepIndex((s) => {
        if (s >= totalSteps) {
          setPlaying(false);
          return s;
        }
        return s + 1;
      });
    }, 950);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, totalSteps]);

  const step = () => {
    setPlaying(false);
    setStepIndex((s) => Math.min(totalSteps, s + 1));
  };
  const reset = () => {
    setPlaying(false);
    setStepIndex(0);
  };

  const cycleCell = (r: number, c: number) => {
    setGrid((g) => g.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? (v + 1) % 10 : v))));
  };

  const currentWindow = mode !== "gap" && stepIndex < WINDOWS.length ? WINDOWS[stepIndex] : null;
  const gapActive = mode === "gap" && stepIndex >= 1;

  const computation =
    mode === "gap"
      ? `(${grid.flat().join("+")}) / 16 = ${gapSum}/16 = ${gapValue.toFixed(3)}`
      : currentWindow
        ? mode === "max"
          ? `max(${windowCells(currentWindow).join(", ")}) = ${Math.max(...windowCells(currentWindow))}`
          : `(${windowCells(currentWindow).join("+")}) / 4 = ${windowCells(currentWindow).reduce((a, b) => a + b, 0)}/4 = ${(windowCells(currentWindow).reduce((a, b) => a + b, 0) / 4).toFixed(2)}`
        : null;

  return (
    <WidgetFrame
      title={title ?? "Pooling explorer"}
      description={description ?? "Max, average and global average pooling on the notes' 4x4 example — 2x2 window, stride 2."}
    >
      <WidgetControls className="mb-4">
        <div className="flex gap-1">
          {(
            [
              { id: "max", label: "Max" },
              { id: "avg", label: "Average" },
              { id: "gap", label: "Global-Average" },
            ] as { id: Mode; label: string }[]
          ).map((m) => (
            <Button
              key={m.id}
              size="sm"
              variant={mode === m.id ? "default" : "outline"}
              onClick={() => setMode(m.id)}
              className="h-9"
            >
              {m.label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PlayButton
            onClick={() => {
              if (stepIndex >= totalSteps) setStepIndex(0);
              setPlaying((p) => !p);
            }}
            playing={playing}
            label="Play"
          />
          <Button size="sm" variant="outline" onClick={step} className="h-9" aria-label="Step one window">
            <StepForward className="mr-1 h-3.5 w-3.5" /> Step
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="h-9" aria-label="Reset animation">
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setGrid(NOTES_GRID.map((r) => [...r]))} className="h-9">
            Notes values
          </Button>
        </div>
      </WidgetControls>

      <div className="flex flex-wrap items-center justify-center gap-8">
        {/* Input grid */}
        <div>
          <p className="mb-2 text-center text-xs font-semibold">Input 4 x 4 (click to edit 0–9)</p>
          <div className="grid grid-cols-4 gap-[3px]">
            {grid.map((row, r) =>
              row.map((v, c) => {
                const winIdx = WINDOWS.findIndex((w) => r >= w.top && r < w.top + 2 && c >= w.left && c < w.left + 2);
                const hue = WINDOWS[winIdx].hue;
                const isCurrent = currentWindow !== null && winIdx === stepIndex;
                const isPast = currentWindow === null && mode !== "gap" && stepIndex > winIdx;
                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => cycleCell(r, c)}
                    className={cn(
                      "flex size-12 items-center justify-center rounded-md border font-mono text-sm font-semibold transition-all sm:size-14",
                      isCurrent ? "scale-105 border-2" : "border"
                    )}
                    style={{
                      backgroundColor: isCurrent
                        ? `${hue}44`
                        : isPast
                          ? `${hue}22`
                          : gapActive
                            ? "rgba(139,92,246,0.18)"
                            : `${hue}14`,
                      borderColor: isCurrent ? hue : gapActive ? "#8b5cf6" : `${hue}66`,
                    }}
                    aria-label={`input cell row ${r + 1} column ${c + 1} value ${v}`}
                  >
                    {v}
                  </button>
                );
              })
            )}
          </div>
          {mode !== "gap" && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">each colour = one 2x2 pooling window</p>
          )}
          {mode === "gap" && (
            <p className="mt-2 text-center text-[10px] text-muted-foreground">GAP: the whole map is one window</p>
          )}
        </div>

        {/* Arrow */}
        <div className="flex flex-col items-center gap-1 text-primary">
          <span className="font-mono text-[10px] text-muted-foreground">{mode === "gap" ? "average all" : "2x2, S=2"}</span>
          <svg viewBox="0 0 60 24" className="w-14">
            <line x1="0" y1="12" x2="48" y2="12" stroke="currentColor" strokeWidth="2" />
            <path d="M46,6 L58,12 L46,18 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Output */}
        <div>
          <p className="mb-2 text-center text-xs font-semibold">
            {mode === "gap" ? "Output: 1 value" : "Output 2 x 2"}
          </p>
          {mode === "gap" ? (
            <motion.div
              animate={gapActive ? { scale: [1, 1.15, 1] } : {}}
              className={cn(
                "flex size-16 items-center justify-center rounded-md border-2 font-mono text-lg font-bold",
                gapActive ? "border-violet-500 bg-violet-500/15 text-violet-600 dark:text-violet-300" : "border-dashed border-muted-foreground/40 text-muted-foreground"
              )}
            >
              {gapActive ? gapValue.toFixed(2) : "?"}
            </motion.div>
          ) : (
            <div className="grid grid-cols-2 gap-[3px]">
              {outputs.map((v, i) => {
                const revealed = stepIndex > i;
                const isCurrent = currentWindow !== null && i === stepIndex;
                return (
                  <motion.div
                    key={i}
                    animate={isCurrent ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className={cn(
                      "flex size-14 items-center justify-center rounded-md border-2 font-mono text-base font-bold sm:size-16",
                      revealed ? "border-transparent" : "border-dashed border-muted-foreground/40 text-muted-foreground"
                    )}
                    style={revealed ? { backgroundColor: `${WINDOWS[i].hue}33`, color: WINDOWS[i].hue } : undefined}
                  >
                    {revealed ? fmtVal(v) : "?"}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Computation line */}
      <div className="mt-4 min-h-[52px] rounded-xl border bg-muted/40 p-3">
        {computation ? (
          <motion.p key={computation} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-xs leading-relaxed break-words">
            {computation}
          </motion.p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {mode === "gap"
              ? "Press Play to collapse the entire feature map into a single per-channel number."
              : "Press Play or Step — each coloured window collapses into one output cell."}
          </p>
        )}
        {mode === "gap" && stepIndex >= 1 && (
          <p className="mt-1 text-[11px] text-muted-foreground">
            One number per channel: a 7x7x512 stack becomes just 512 numbers, replacing Flatten + Dense (Example 4.2:
            513,000 params instead of 102,764,544).
          </p>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Window / stride" value="2 x 2, S = 2" />
        <Stat label="Size check" value="⌊(4−2)/2⌋+1 = 2" />
        <Stat label="Max output" value={`[${maxOutputs.join(", ")}]`} />
        <Stat label="Mean output" value={`[${avgOutputs.map((v) => v.toFixed(2)).join(", ")}]`} />
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed">
        <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <p>
          <span className="font-semibold">Exam point: pooling has ZERO learnable parameters.</span> It is a fixed
          mathematical operation (max or mean) — unlike a convolution layer, which has learnable filter weights and a
          bias. Max pooling routes the gradient only to the winning element; average pooling splits it equally.
        </p>
      </div>
    </WidgetFrame>
  );
}
