"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dices, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";

const DEFAULT_ACTS = [0.5, 0.8, 0.3, 0.9, 0.6];

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [acts, setActs] = useState<number[]>(DEFAULT_ACTS);
  const [p, setP] = useState(0.4);
  const [mask, setMask] = useState<number[]>([1, 0, 1, 1, 0]); // notes example mask
  const [testMode, setTestMode] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [resampleCount, setResampleCount] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const keep = 1 - p;
  const scale = 1 / Math.max(keep, 1e-9);

  const resample = () => {
    setMask(acts.map(() => (Math.random() >= p ? 1 : 0)));
    setResampleCount((c) => c + 1);
  };

  useEffect(() => {
    if (!playing || testMode) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(resample, 1300);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, testMode, p, acts]);

  const masked = acts.map((a, i) => a * mask[i]);
  const scaled = masked.map((v) => v * scale);
  const sumBefore = acts.reduce((a, b) => a + b, 0);
  const sumAfter = scaled.reduce((a, b) => a + b, 0);
  const droppedCount = mask.filter((m) => m === 0).length;

  const f = (v: number) => v.toFixed(3);

  return (
    <WidgetFrame
      title={title ?? "Inverted dropout"}
      description={description ?? "Drop neurons at random during training, then scale survivors by 1/(1−p) so the expected signal is conserved (Example 8.1)."}
    >
      <WidgetControls className="mb-4">
        <div className="flex min-w-[170px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Dropout rate p</span>
            <span className="font-mono text-xs text-primary">{p.toFixed(2)} (keep {keep.toFixed(2)})</span>
          </label>
          <Slider value={[p]} onValueChange={(v) => setP(v[0])} min={0} max={0.8} step={0.05} aria-label="Dropout rate" />
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={!testMode ? "default" : "outline"}
            onClick={() => setTestMode(false)}
            className="h-9"
          >
            Train mode
          </Button>
          <Button
            size="sm"
            variant={testMode ? "default" : "outline"}
            onClick={() => {
              setTestMode(true);
              setPlaying(false);
            }}
            className="h-9"
          >
            Test mode
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" className="h-9" onClick={resample} disabled={testMode}>
            <Dices className="mr-1 h-3.5 w-3.5" /> Resample mask
          </Button>
          <PlayButton onClick={() => setPlaying((v) => !v)} playing={playing} label="Auto" />
        </div>
      </WidgetControls>

      {/* Neurons */}
      <div className="flex items-end justify-center gap-3 sm:gap-5">
        {acts.map((a, i) => {
          const dropped = !testMode && mask[i] === 0;
          const shown = testMode ? a : scaled[i];
          const size = 30 + a * 44;
          return (
            <div key={i} className="flex w-14 flex-col items-center gap-1.5 sm:w-16">
              <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <motion.div
                  key={`${testMode ? "test" : `train-${resampleCount}`}-${i}`}
                  animate={{
                    width: dropped || testMode ? size : 30 + shown * 44,
                    height: dropped || testMode ? size : 30 + shown * 44,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 font-mono text-[11px] font-bold",
                    dropped
                      ? "border-muted-foreground/50 bg-muted text-muted-foreground"
                      : "border-primary/70 bg-primary/20 text-primary"
                  )}
                >
                  {f(testMode ? a : masked[i] === 0 ? 0 : scaled[i])}
                </motion.div>
                {dropped && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -right-1 -top-1">
                    <X className="size-4 rounded-full bg-destructive text-white" />
                  </motion.span>
                )}
              </div>
              <span className="text-[10px] text-muted-foreground">n{i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Value table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[430px] border-collapse font-mono text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="border-b py-1.5 pr-2 text-left font-medium">row</th>
              {acts.map((_, i) => (
                <th key={i} className="border-b py-1.5 text-center font-medium">
                  n{i + 1}
                </th>
              ))}
              <th className="border-b py-1.5 pl-2 text-right font-medium">sum</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-1.5 pr-2 text-muted-foreground">activation a</td>
              {acts.map((a, i) => (
                <td key={i} className="py-1.5 text-center">{a.toFixed(1)}</td>
              ))}
              <td className="py-1.5 pl-2 text-right font-semibold">{sumBefore.toFixed(2)}</td>
            </tr>
            {!testMode && (
              <>
                <tr>
                  <td className="py-1.5 pr-2 text-muted-foreground">mask m</td>
                  {mask.map((mv, i) => (
                    <td key={i} className={cn("py-1.5 text-center", mv === 0 ? "font-bold text-destructive" : "text-emerald-600 dark:text-emerald-400")}>
                      {mv}
                    </td>
                  ))}
                  <td className="py-1.5 pl-2 text-right text-muted-foreground">{droppedCount} dropped</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-2 text-muted-foreground">a × m</td>
                  {masked.map((v, i) => (
                    <td key={i} className="py-1.5 text-center">{f(v)}</td>
                  ))}
                  <td className="py-1.5 pl-2 text-right">{masked.reduce((a, b) => a + b, 0).toFixed(2)}</td>
                </tr>
                <tr className="bg-primary/5">
                  <td className="py-1.5 pr-2 text-muted-foreground">× 1/(1−p) = {scale.toFixed(3)}</td>
                  {scaled.map((v, i) => (
                    <td key={i} className="py-1.5 text-center font-bold text-primary">{f(v)}</td>
                  ))}
                  <td className="py-1.5 pl-2 text-right font-bold text-primary">{sumAfter.toFixed(2)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Signal conservation */}
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <Stat label="Sum before" value={sumBefore.toFixed(2)} />
        {!testMode ? (
          <>
            <Stat label="Sum after (this mask)" value={sumAfter.toFixed(2)} />
            <Stat label="Expected sum after" value={`≈ ${sumBefore.toFixed(2)}`} tone="good" />
          </>
        ) : (
          <>
            <Stat label="Scaling applied" value="none (1.0)" />
            <Stat label="Neurons used" value="all 5" tone="good" />
          </>
        )}
      </div>

      <p className="mt-3 rounded-lg border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        {testMode ? (
          <>
            <span className="font-semibold text-foreground">At test time nothing changes</span> — the full, un-thinned
            network is used with no dropping and no scaling: the scaling was already baked in during training. A
            different random subset is dropped on every training pass, which stops neurons from co-adapting.
          </>
        ) : (
          <>
            Step 1 — apply the binary mask (multiply element-wise): survivors keep their value, dropped neurons become 0.
            Step 2 — scale survivors by 1/(1−p) = 1/{keep.toFixed(2)} ≈ {scale.toFixed(3)} so the{" "}
            <span className="font-semibold text-foreground">expected total signal matches test time</span>. This sample
            sums to {sumAfter.toFixed(2)}; in expectation it is ≈ {sumBefore.toFixed(2)}. Typical rates: p ≈ 0.5 for FC
            layers, p ≈ 0.1–0.25 for conv layers.
          </>
        )}
      </p>
    </WidgetFrame>
  );
}
