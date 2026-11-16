"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { WidgetFrame, WidgetControls, PlayButton, Stat } from "./frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, RotateCcw, StepForward } from "lucide-react";

/* ------- perceptron learning algorithm (η = 1, init 0, order (0,0),(0,1),(1,0),(1,1)) ------- */
type Row = {
  epoch: number;
  idx: number;
  x1: number;
  x2: number;
  t: number;
  w1u: number;
  w2u: number;
  bu: number;
  z: number;
  y: number;
  e: number;
  w1n: number;
  w2n: number;
  bn: number;
};

const SAMPLES: [number, number, number][] = [
  [0, 0, 0],
  [0, 1, 0],
  [1, 0, 0],
  [1, 1, 1],
];

function buildTrace(): Row[] {
  const rows: Row[] = [];
  let w1 = 0;
  let w2 = 0;
  let b = 0;
  for (let epoch = 1; epoch <= 30; epoch++) {
    let errors = 0;
    for (let idx = 0; idx < SAMPLES.length; idx++) {
      const [x1, x2, t] = SAMPLES[idx];
      const z = w1 * x1 + w2 * x2 + b;
      const y = z >= 0 ? 1 : 0;
      const e = t - y;
      const w1n = w1 + e * x1;
      const w2n = w2 + e * x2;
      const bn = b + e;
      rows.push({ epoch, idx, x1, x2, t, w1u: w1, w2u: w2, bu: b, z, y, e, w1n, w2n, bn });
      if (e !== 0) errors++;
      w1 = w1n;
      w2 = w2n;
      b = bn;
    }
    if (errors === 0) return rows; // whole epoch with zero errors -> converged
  }
  return rows;
}

/* ------- plot helpers (same framing as the perceptron playground) ------- */
const DOM = { xmin: -0.75, xmax: 1.75, ymin: -0.75, ymax: 1.75 };
const PAD = { l: 34, r: 14, t: 14, b: 30 };
const W = 300;
const H = 300;
const sx = (x: number) => PAD.l + ((x - DOM.xmin) / (DOM.xmax - DOM.xmin)) * (W - PAD.l - PAD.r);
const sy = (y: number) => PAD.t + ((DOM.ymax - y) / (DOM.ymax - DOM.ymin)) * (H - PAD.t - PAD.b);

type Pt = { x: number; y: number };
function clipHalfPlane(poly: Pt[], a: number, b: number, c: number): Pt[] {
  const inside = (p: Pt) => a * p.x + b * p.y + c >= 0;
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const cur = poly[i];
    const nxt = poly[(i + 1) % poly.length];
    const ci = inside(cur);
    const ni = inside(nxt);
    if (ci) out.push(cur);
    if (ci !== ni) {
      const d1 = a * cur.x + b * cur.y + c;
      const d2 = a * nxt.x + b * nxt.y + c;
      const t = d1 / (d1 - d2);
      out.push({ x: cur.x + t * (nxt.x - cur.x), y: cur.y + t * (nxt.y - cur.y) });
    }
  }
  return out;
}
function lineInRect(a: number, b: number, c: number): Pt[] {
  const rect: Pt[] = [
    { x: DOM.xmin, y: DOM.ymin },
    { x: DOM.xmax, y: DOM.ymin },
    { x: DOM.xmax, y: DOM.ymax },
    { x: DOM.xmin, y: DOM.ymax },
  ];
  const edges: [Pt, Pt][] = [
    [rect[0], rect[1]],
    [rect[1], rect[2]],
    [rect[2], rect[3]],
    [rect[3], rect[0]],
  ];
  const found: Pt[] = [];
  for (const [p1, p2] of edges) {
    const d1 = a * p1.x + b * p1.y + c;
    const d2 = a * p2.x + b * p2.y + c;
    if ((d1 >= 0) === (d2 >= 0)) continue;
    const t = d1 / (d1 - d2);
    found.push({ x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) });
  }
  return found.filter(
    (p, i) => !found.slice(0, i).some((q) => Math.abs(q.x - p.x) < 1e-9 && Math.abs(q.y - p.y) < 1e-9)
  );
}

const SPEEDS = [
  { label: "0.5x", ms: 1400 },
  { label: "1x", ms: 700 },
  { label: "2x", ms: 320 },
];

const fmtW = (v: number) => (v >= 0 ? `+${v}` : `−${Math.abs(v)}`);

export default function Component({ title, description }: { title?: string; description?: string }) {
  const rows = useMemo(buildTrace, []);
  const [i, setI] = useState(0); // samples processed
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const done = i >= rows.length;
  const lastRow = i > 0 ? rows[i - 1] : null;
  const cur = lastRow ?? rows[0]; // row to display as "current"
  const weights = lastRow ? { w1: lastRow.w1n, w2: lastRow.w2n, b: lastRow.bn } : { w1: 0, w2: 0, b: 0 };
  const epoch = cur.epoch;
  const epochRows = rows.filter((r) => r.epoch === epoch);
  const errorsThisEpoch = epochRows.filter((r) => r.idx <= cur.idx && r.e !== 0).length;

  const finalRow = rows[rows.length - 1];
  const convergedEq = `${finalRow.w1n === 1 ? "" : finalRow.w1n}x₁ + ${finalRow.w2n === 1 ? "" : finalRow.w2n}x₂ − ${Math.abs(finalRow.bn)} = 0`;

  // history of completed epochs
  const epochHistory = useMemo(() => {
    const hist: { epoch: number; w: [number, number, number] }[] = [];
    for (let e = 1; e < epoch; e++) {
      const er = rows.filter((r) => r.epoch === e);
      const last = er[er.length - 1];
      hist.push({ epoch: e, w: [last.w1n, last.w2n, last.bn] });
    }
    return hist;
  }, [rows, epoch]);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setI((v) => {
        if (v >= rows.length) {
          setPlaying(false);
          return v;
        }
        return v + 1;
      });
    }, SPEEDS[speed].ms);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, speed, rows.length]);

  const linePts = lineInRect(weights.w1, weights.w2, weights.b);
  const posPoly = clipHalfPlane(
    [
      { x: DOM.xmin, y: DOM.ymin },
      { x: DOM.xmax, y: DOM.ymin },
      { x: DOM.xmax, y: DOM.ymax },
      { x: DOM.xmin, y: DOM.ymax },
    ],
    weights.w1,
    weights.w2,
    weights.b
  );

  return (
    <WidgetFrame
      title={title ?? "Training a Perceptron on the AND Gate"}
      description={
        description ??
        "The perceptron learning rule w ← w + η(t−y)x, b ← b + η(t−y) with η = 1, starting from all-zero weights. Step through the exact trace from the notes — it converges at epoch 6 with w = (2, 1, −3)."
      }
      accent="u1"
    >
      <div className="flex flex-col gap-4">
        <WidgetControls>
          <PlayButton
            onClick={() => {
              if (done) return;
              setPlaying((p) => !p);
            }}
            playing={playing}
            label="Train"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPlaying(false);
              setI((v) => Math.min(v + 1, rows.length));
            }}
            disabled={done}
          >
            <StepForward className="h-4 w-4" /> Step
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setPlaying(false);
              setI(0);
            }}
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <span className="mr-1 text-[11px] text-muted-foreground">speed</span>
            {SPEEDS.map((s, k) => (
              <Button
                key={s.label}
                size="sm"
                variant={speed === k ? "default" : "ghost"}
                className="h-7 px-2 text-[11px]"
                onClick={() => setSpeed(k)}
              >
                {s.label}
              </Button>
            ))}
          </div>
        </WidgetControls>

        <div className="grid gap-4 md:grid-cols-[minmax(0,300px)_1fr]">
          {/* ---------------- live plot ---------------- */}
          <div className="mx-auto w-full max-w-[300px]">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
              <rect
                x={PAD.l}
                y={PAD.t}
                width={W - PAD.l - PAD.r}
                height={H - PAD.t - PAD.b}
                fill="currentColor"
                className="text-muted/30"
              />
              <rect
                x={PAD.l}
                y={PAD.t}
                width={W - PAD.l - PAD.r}
                height={H - PAD.t - PAD.b}
                fill="#ef4444"
                opacity={0.1}
              />
              {posPoly.length > 0 && (
                <polygon
                  points={posPoly.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ")}
                  fill="#10b981"
                  opacity={0.18}
                />
              )}
              {/* grid */}
              {[-0.5, 0, 0.5, 1, 1.5].map((v) => (
                <g key={v}>
                  <line x1={sx(v)} y1={sy(DOM.ymin)} x2={sx(v)} y2={sy(DOM.ymax)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
                  <line x1={sx(DOM.xmin)} y1={sy(v)} x2={sx(DOM.xmax)} y2={sy(v)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
                </g>
              ))}
              <text x={W / 2} y={H - 6} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium">
                x₁
              </text>
              <text x={10} y={H / 2} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium" transform={`rotate(-90 10 ${H / 2})`}>
                x₂
              </text>

              {/* decision line (animated) */}
              {linePts.length === 2 && (
                <motion.line
                  x1={sx(linePts[0].x)}
                  y1={sy(linePts[0].y)}
                  x2={sx(linePts[1].x)}
                  y2={sy(linePts[1].y)}
                  animate={{
                    x1: sx(linePts[0].x),
                    y1: sy(linePts[0].y),
                    x2: sx(linePts[1].x),
                    y2: sy(linePts[1].y),
                  }}
                  transition={{ type: "spring", stiffness: 120, damping: 18 }}
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth={2.5}
                />
              )}

              {/* points */}
              {SAMPLES.map(([x1, x2, t], k) => {
                const isCur = i > 0 && lastRow !== null && lastRow.idx === k && lastRow.epoch === epoch;
                return (
                  <g key={`${x1},${x2}`}>
                    <motion.circle
                      animate={{ r: isCur ? 13 : 10 }}
                      cx={sx(x1)}
                      cy={sy(x2)}
                      fill={t === 1 ? "#10b981" : "currentColor"}
                      className={t === 1 ? "" : "text-background"}
                      stroke={isCur ? "#f97316" : "#6b7280"}
                      strokeWidth={isCur ? 3.5 : 2.5}
                    />
                    {t === 0 && <circle cx={sx(x1)} cy={sy(x2)} r={5.5} fill="#6b7280" opacity={0.55} />}
                    <text x={sx(x1) - 14} y={sy(x2) - 12} fontSize={9.5} className="fill-muted-foreground font-mono">
                      ({x1},{x2})
                    </text>
                  </g>
                );
              })}
            </svg>
            <p className="mt-1 text-center font-mono text-[11px] text-muted-foreground">
              boundary: {weights.w1}x₁ {fmtW(weights.w2)}x₂ {fmtW(weights.b)} = 0
            </p>
          </div>

          {/* ---------------- trace table + stats ---------------- */}
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="epoch" value={`${epoch} / ${finalRow.epoch}`} />
              <Stat label="sample" value={`(${cur.x1}, ${cur.x2})`} />
              <Stat label="current w" value={`(${weights.w1}, ${weights.w2}, ${weights.b})`} />
              <Stat
                label="epoch errors"
                value={errorsThisEpoch === 0 ? "0 so far" : `${errorsThisEpoch} so far`}
                tone={errorsThisEpoch === 0 ? "good" : "bad"}
              />
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[430px] text-xs">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-2.5 py-1.5 font-medium">(x₁,x₂)</th>
                    <th className="px-2.5 py-1.5 font-medium">t</th>
                    <th className="px-2.5 py-1.5 font-medium">w used</th>
                    <th className="px-2.5 py-1.5 font-medium">z</th>
                    <th className="px-2.5 py-1.5 font-medium">y</th>
                    <th className="px-2.5 py-1.5 font-medium">t−y</th>
                    <th className="px-2.5 py-1.5 font-medium">new w</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {epochRows.map((r) => {
                    const processed = rows.indexOf(r) < i;
                    const isCurrent = processed && rows.indexOf(r) === i - 1;
                    return (
                      <tr
                        key={r.idx}
                        className={cn(
                          "border-b last:border-0 transition-colors",
                          isCurrent && "bg-primary/10 font-semibold",
                          !processed && "opacity-45",
                          processed && !isCurrent && "opacity-80"
                        )}
                      >
                        <td className="px-2.5 py-1.5">({r.x1},{r.x2})</td>
                        <td className="px-2.5 py-1.5">{r.t}</td>
                        <td className="px-2.5 py-1.5">({r.w1u},{r.w2u},{r.bu})</td>
                        <td className="px-2.5 py-1.5">{r.z}</td>
                        <td className="px-2.5 py-1.5">{r.y}</td>
                        <td className={cn("px-2.5 py-1.5", r.e !== 0 && "font-bold text-red-500")}>
                          {r.e > 0 ? `+${r.e}` : r.e}
                        </td>
                        <td className="px-2.5 py-1.5">
                          {r.e === 0 ? "unchanged" : `(${r.w1n},${r.w2n},${r.bn})`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* epoch history */}
            {epochHistory.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">end of epoch:</span>
                {epochHistory.map((h) => (
                  <span key={h.epoch} className="rounded-md bg-muted/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                    E{h.epoch} → ({h.w.join(",")})
                  </span>
                ))}
              </div>
            )}

            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2.5 rounded-xl border border-emerald-300/60 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span>
                  Converged! {convergedEq} — epoch 6 completed with zero errors on all four patterns.
                  Final weights w = (2, 1, −3).
                </span>
              </motion.div>
            ) : (
              <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                Update rule (η = 1): <span className="font-mono">wᵢ ← wᵢ + (t−y)·xᵢ</span>,{" "}
                <span className="font-mono">b ← b + (t−y)</span>. When e = 0 nothing changes; when the
                prediction is wrong the weights move along the active inputs. Note how sample (0,0)
                can only move the bias — its inputs are 0.
              </p>
            )}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
