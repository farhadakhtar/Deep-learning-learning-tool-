"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, StepForward } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";

type Grid = number[][];

const NOTES_INPUT: Grid = [
  [1, 1, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 1, 1],
  [0, 0, 1, 1, 0],
  [0, 1, 1, 0, 0],
];
const NOTES_OUTPUT = [
  [4, 3, 4],
  [2, 4, 3],
  [2, 3, 4],
];

const FILTER_PRESETS: { name: string; filter: Grid }[] = [
  { name: "X-pattern", filter: [[1, 0, 1], [0, 1, 0], [1, 0, 1]] },
  { name: "Vertical edge", filter: [[1, 0, -1], [1, 0, -1], [1, 0, -1]] },
  { name: "Horizontal edge", filter: [[1, 1, 1], [0, 0, 0], [-1, -1, -1]] },
  { name: "Blur", filter: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]] },
];

const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(2));

function computeConv(input: Grid, filter: Grid, S: number, P: number) {
  const N = input.length;
  const F = filter.length;
  const O = Math.floor((N + 2 * P - F) / S) + 1;
  const positions: { oi: number; oj: number; products: { r: number; c: number; v: number; w: number; p: number }[]; sum: number }[] = [];
  for (let oi = 0; oi < O; oi++) {
    for (let oj = 0; oj < O; oj++) {
      const products: { r: number; c: number; v: number; w: number; p: number }[] = [];
      let sum = 0;
      for (let di = 0; di < F; di++) {
        for (let dj = 0; dj < F; dj++) {
          const r = oi * S - P + di;
          const c = oj * S - P + dj;
          const v = r >= 0 && r < N && c >= 0 && c < N ? input[r][c] : 0; // padding = 0
          const w = filter[di][dj];
          products.push({ r, c, v, w, p: v * w });
          sum += v * w;
        }
      }
      positions.push({ oi, oj, products, sum });
    }
  }
  return { O, positions };
}

function cellBg(v: number, maxAbs: number) {
  if (maxAbs === 0 || v === 0) return undefined;
  const t = Math.min(1, Math.abs(v) / maxAbs);
  return v > 0
    ? `rgba(16, 185, 129, ${0.12 + 0.7 * t})`
    : `rgba(244, 63, 94, ${0.12 + 0.7 * t})`;
}

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [input, setInput] = useState<Grid>(NOTES_INPUT.map((r) => [...r]));
  const [filter, setFilter] = useState<Grid>(FILTER_PRESETS[0].filter.map((r) => [...r]));
  const [stride, setStride] = useState(1);
  const [pad, setPad] = useState(0);
  const [posIndex, setPosIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { O, positions } = useMemo(() => computeConv(input, filter, stride, pad), [input, filter, stride, pad]);
  const total = positions.length;
  const current = posIndex < total ? positions[posIndex] : null;
  const maxAbs = useMemo(() => Math.max(1, ...positions.map((p) => Math.abs(p.sum))), [positions]);

  const isNotesConfig =
    JSON.stringify(input) === JSON.stringify(NOTES_INPUT) &&
    JSON.stringify(filter) === JSON.stringify(FILTER_PRESETS[0].filter) &&
    stride === 1 &&
    pad === 0;
  const allRevealed = posIndex >= total;
  const flatOutput = positions.map((p) => p.sum);
  const matchesNotes =
    isNotesConfig &&
    allRevealed &&
    O === 3 &&
    JSON.stringify(flatOutput) === JSON.stringify([4, 3, 4, 2, 4, 3, 2, 3, 4]);

  // reset animation whenever the configuration changes
  const configKey = JSON.stringify({ input, filter, stride, pad });
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setPosIndex(0);
      setPlaying(false);
    });
    return () => cancelAnimationFrame(id);
  }, [configKey]);

  // playback
  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => {
      setPosIndex((p) => {
        if (p >= total) {
          setPlaying(false);
          return p;
        }
        return p + 1;
      });
    }, 750);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, total]);

  const step = () => {
    setPlaying(false);
    setPosIndex((p) => Math.min(total, p + 1));
  };
  const reset = () => {
    setPlaying(false);
    setPosIndex(0);
  };

  const cycleInput = (r: number, c: number) => {
    setInput((g) => g.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? (v + 1) % 3 : v))));
  };
  const cycleFilter = (r: number, c: number) => {
    setFilter((g) =>
      g.map((row, ri) =>
        row.map((v, ci) => {
          if (ri !== r || ci !== c) return v;
          if (v === 1) return -1;
          if (v === 0) return 1;
          if (v === -1) return 0;
          return 0; // fractional (blur) resets to 0
        })
      )
    );
  };
  const applyPreset = (preset: (typeof FILTER_PRESETS)[number]) => {
    setFilter(preset.filter.map((r) => [...r]));
  };
  const applyNotesExample = () => {
    setInput(NOTES_INPUT.map((r) => [...r]));
    setFilter(FILTER_PRESETS[0].filter.map((r) => [...r]));
    setStride(1);
    setPad(0);
  };

  const padded = 5 + 2 * pad;
  // highlight geometry (percentages of the padded input grid)
  const hl = current
    ? {
        left: (current.oj * stride) / padded,
        top: (current.oi * stride) / padded,
        size: 3 / padded,
      }
    : null;

  const revealed = new Set(positions.slice(0, posIndex).map((p) => `${p.oi},${p.oj}`));

  return (
    <WidgetFrame
      title={title ?? "Convolution explorer"}
      description={description ?? "Slide a 3x3 filter over a 5x5 input, one position at a time, and watch each output value appear."}
    >
      <WidgetControls className="mb-4">
        <div className="flex min-w-[140px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Stride S</span>
            <span className="font-mono text-xs text-primary">{stride}</span>
          </label>
          <Slider value={[stride]} onValueChange={(v) => setStride(v[0])} min={1} max={2} step={1} aria-label="Stride" />
        </div>
        <div className="flex min-w-[140px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Padding P</span>
            <span className="font-mono text-xs text-primary">{pad}</span>
          </label>
          <Slider value={[pad]} onValueChange={(v) => setPad(v[0])} min={0} max={1} step={1} aria-label="Padding" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <PlayButton
            onClick={() => {
              if (posIndex >= total) setPosIndex(0);
              setPlaying((p) => !p);
            }}
            playing={playing}
            label="Play"
          />
          <Button size="sm" variant="outline" onClick={step} className="h-9" aria-label="Step one position">
            <StepForward className="mr-1 h-3.5 w-3.5" /> Step
          </Button>
          <Button size="sm" variant="outline" onClick={reset} className="h-9" aria-label="Reset animation">
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
          <Button size="sm" variant="secondary" onClick={applyNotesExample} className="h-9">
            Notes example
          </Button>
        </div>
      </WidgetControls>

      <div className="grid gap-6 sm:grid-cols-[auto_auto] lg:grid-cols-[auto_auto_auto] lg:items-start lg:justify-center">
        {/* Input grid with sliding filter */}
        <div>
          <p className="mb-2 text-center text-xs font-semibold">Input 5 x 5 (click a cell: 0 to 1 to 2)</p>
          <div className="relative mx-auto" style={{ width: "min(100%, 268px)" }}>
            <div
              className="grid gap-[3px]"
              style={{ gridTemplateColumns: `repeat(${padded}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: padded * padded }, (_, i) => {
                const r = Math.floor(i / padded) - pad;
                const c = (i % padded) - pad;
                const isPad = r < 0 || r > 4 || c < 0 || c > 4;
                const inPatch =
                  hl !== null &&
                  r >= current!.oi * stride - pad &&
                  r < current!.oi * stride - pad + 3 &&
                  c >= current!.oj * stride - pad &&
                  c < current!.oj * stride - pad + 3 &&
                  !isPad;
                return (
                  <button
                    key={i}
                    disabled={isPad}
                    onClick={() => cycleInput(r, c)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-md border font-mono text-sm font-semibold transition-colors",
                      isPad
                        ? "border-dashed border-muted-foreground/40 text-muted-foreground/50"
                        : "border-border bg-card hover:bg-muted/70",
                      inPatch && "border-primary ring-2 ring-primary/50"
                    )}
                    aria-label={isPad ? "padding zero" : `input cell row ${r + 1} column ${c + 1}`}
                  >
                    {isPad ? "0" : input[r][c]}
                  </button>
                );
              })}
            </div>
            {hl && (
              <motion.div
                className="pointer-events-none absolute rounded-lg border-2 border-primary bg-primary/10"
                initial={false}
                animate={{ left: `${hl.left * 100}%`, top: `${hl.top * 100}%`, width: `${hl.size * 100}%`, height: `${hl.size * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
          </div>
        </div>

        {/* Filter editor */}
        <div>
          <p className="mb-2 text-center text-xs font-semibold">Filter 3 x 3 (click: −1 / 0 / 1)</p>
          <div className="mx-auto grid w-fit grid-cols-3 gap-[3px]">
            {filter.map((row, r) =>
              row.map((v, c) => (
                <button
                  key={`${r}-${c}`}
                  onClick={() => cycleFilter(r, c)}
                  className="flex size-11 items-center justify-center rounded-md border border-primary/40 bg-primary/5 font-mono text-sm font-semibold hover:bg-primary/15"
                  aria-label={`filter weight row ${r + 1} column ${c + 1}`}
                >
                  {fmt(v)}
                </button>
              ))
            )}
          </div>
          <div className="mt-3 flex max-w-[220px] flex-wrap justify-center gap-1.5">
            {FILTER_PRESETS.map((p) => (
              <Button
                key={p.name}
                size="sm"
                variant={JSON.stringify(filter) === JSON.stringify(p.filter) ? "default" : "outline"}
                onClick={() => applyPreset(p)}
                className="h-8 px-2 text-[11px]"
              >
                {p.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Output grid */}
        <div>
          <p className="mb-2 text-center text-xs font-semibold">
            Output {O} x {O}
          </p>
          <div className="mx-auto grid w-fit gap-[3px]" style={{ gridTemplateColumns: `repeat(${O}, minmax(0, 1fr))` }}>
            {Array.from({ length: O * O }, (_, i) => {
              const oi = Math.floor(i / O);
              const oj = i % O;
              const pos = positions.find((p) => p.oi === oi && p.oj === oj);
              const isRevealed = revealed.has(`${oi},${oj}`);
              const isCurrent = current?.oi === oi && current?.oj === oj;
              return (
                <motion.div
                  key={`${oi}-${oj}`}
                  animate={{ scale: isCurrent ? [1, 1.12, 1] : 1 }}
                  transition={{ duration: 0.45 }}
                  className={cn(
                    "flex size-11 items-center justify-center rounded-md border font-mono text-sm font-bold",
                    isRevealed ? "border-transparent" : "border-dashed border-muted-foreground/40 text-transparent"
                  )}
                  style={isRevealed && pos ? { backgroundColor: cellBg(pos.sum, maxAbs) } : undefined}
                >
                  {isRevealed && pos ? fmt(pos.sum) : "0"}
                </motion.div>
              );
            })}
          </div>
          {isNotesConfig && (
            <p className="mt-2 max-w-[220px] text-center text-[10px] leading-relaxed text-muted-foreground">
              Notes reference output: [[4, 3, 4], [2, 4, 3], [2, 3, 4]] — this input and X-filter reproduce Figure 2.1.
            </p>
          )}
          {matchesNotes && (
            <motion.p
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-1 text-center font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400"
            >
              matches the documented output
            </motion.p>
          )}
        </div>
      </div>

      {/* Computation detail */}
      <div className="mt-4 min-h-[92px] rounded-xl border bg-muted/40 p-3">
        {current ? (
          <motion.div key={posIndex} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-1.5 text-xs font-semibold">
              Position (row {current.oi + 1}, col {current.oj + 1}) — filter covers input rows{" "}
              {current.oi * stride - pad + 1}–{current.oi * stride - pad + 3}, cols {current.oj * stride - pad + 1}–
              {current.oj * stride - pad + 3} (1-based)
            </p>
            <p className="font-mono text-xs leading-relaxed break-words">
              {current.products.map((p, i) => (
                <span key={i}>
                  <span className={cn(p.v === 0 && "text-muted-foreground")}>{fmt(p.v)}×{fmt(p.w)}</span>
                  {i < 8 && <span className="text-muted-foreground"> + </span>}
                </span>
              ))}
              <span className="text-muted-foreground"> = </span>
              <span className="font-bold text-primary">{fmt(current.sum)}</span>
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              element-wise products, summed row by row (padding cells contribute 0)
            </p>
          </motion.div>
        ) : (
          <div>
            <p className="text-xs font-semibold">
              {allRevealed ? "All positions computed." : "Press Play or Step to slide the filter."}
            </p>
            {allRevealed && O === 3 && (
              <p className="mt-1 font-mono text-xs">
                output map = [{flatOutput.slice(0, 3).join(", ")}], [{flatOutput.slice(3, 6).join(", ")}], [
                {flatOutput.slice(6, 9).join(", ")}]
              </p>
            )}
            {allRevealed && O !== 3 && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                output map has {O} x {O} = {total} values — size given by O = floor((5 + 2P − F)/S) + 1
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Input N" value="5 x 5" />
        <Stat label="Filter F" value="3 x 3" />
        <Stat label="Stride / Padding" value={`S = ${stride}, P = ${pad}`} />
        <Stat
          label="Output size"
          value={`floor((5+2×${pad}−3)/${stride})+1 = ${O}`}
          tone="accent"
        />
      </div>
    </WidgetFrame>
  );
}
