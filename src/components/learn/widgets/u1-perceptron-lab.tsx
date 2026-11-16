"use client";

import { useMemo, useState } from "react";
import { WidgetFrame, WidgetControls, Stat } from "./frame";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AlertTriangle, Check, Layers, X } from "lucide-react";

type Gate = "AND" | "OR" | "XOR";
type Pt = { x: number; y: number };

const GATES: Record<Gate, { pts: { x1: number; x2: number; t: number }[]; hint: string }> = {
  AND: {
    pts: [
      { x1: 0, x2: 0, t: 0 },
      { x1: 0, x2: 1, t: 0 },
      { x1: 1, x2: 0, t: 0 },
      { x1: 1, x2: 1, t: 1 },
    ],
    hint: "Try w₁ = 2, w₂ = 1, b = −3 (the learned solution from the notes).",
  },
  OR: {
    pts: [
      { x1: 0, x2: 0, t: 0 },
      { x1: 0, x2: 1, t: 1 },
      { x1: 1, x2: 0, t: 1 },
      { x1: 1, x2: 1, t: 1 },
    ],
    hint: "Try w₁ = 1, w₂ = 1, b = −0.5.",
  },
  XOR: {
    pts: [
      { x1: 0, x2: 0, t: 0 },
      { x1: 0, x2: 1, t: 1 },
      { x1: 1, x2: 0, t: 1 },
      { x1: 1, x2: 1, t: 0 },
    ],
    hint: "No (w₁, w₂, b) can separate the diagonals — try the MLP solution below.",
  },
};

/* ---------- geometry helpers (data coords x1 = x, x2 = y) ---------- */
const DOM = { xmin: -0.25, xmax: 1.25, ymin: -0.25, ymax: 1.25 };
const PAD = { l: 42, r: 14, t: 14, b: 34 };
const W = 340;
const H = 316;

const sx = (x: number) => PAD.l + ((x - DOM.xmin) / (DOM.xmax - DOM.xmin)) * (W - PAD.l - PAD.r);
const sy = (y: number) => PAD.t + ((DOM.ymax - y) / (DOM.ymax - DOM.ymin)) * (H - PAD.t - PAD.b);

function clipHalfPlane(poly: Pt[], a: number, b: number, c: number): Pt[] {
  // keep the part of the polygon where a*x + b*y + c >= 0
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
  // dedupe
  const uniq = found.filter(
    (p, i) => !found.slice(0, i).some((q) => Math.abs(q.x - p.x) < 1e-9 && Math.abs(q.y - p.y) < 1e-9)
  );
  return uniq;
}

const toPolyStr = (poly: Pt[]) => poly.map((p) => `${sx(p.x)},${sy(p.y)}`).join(" ");
const f1 = (v: number) => v.toFixed(1);
const f2 = (v: number) => v.toFixed(2);

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [gate, setGate] = useState<Gate>("AND");
  const [w1, setW1] = useState(1);
  const [w2, setW2] = useState(1);
  const [b, setB] = useState(-1.5);
  const [noBias, setNoBias] = useState(false);
  const [showMLP, setShowMLP] = useState(false);

  const bb = noBias ? 0 : b;
  const data = GATES[gate];

  const geom = useMemo(() => {
    const rect: Pt[] = [
      { x: DOM.xmin, y: DOM.ymin },
      { x: DOM.xmax, y: DOM.ymin },
      { x: DOM.xmax, y: DOM.ymax },
      { x: DOM.xmin, y: DOM.ymax },
    ];
    const degenerate = Math.abs(w1) < 1e-9 && Math.abs(w2) < 1e-9;
    const posPoly = degenerate ? (bb > 0 ? rect : []) : clipHalfPlane(rect, w1, w2, bb);
    const linePts = degenerate ? [] : lineInRect(w1, w2, bb);
    // XOR band: 0.5 <= x1+x2 <= 1.5  (h1 = OR side, h2 = AND side)
    const band = clipHalfPlane(clipHalfPlane(rect, 1, 1, -0.5), -1, -1, 1.5);
    const lineH1 = lineInRect(1, 1, -0.5);
    const lineH2 = lineInRect(1, 1, -1.5);
    return { posPoly, linePts, band, lineH1, lineH2 };
  }, [w1, w2, bb]);

  const rows = data.pts.map((p) => {
    const z = w1 * p.x1 + w2 * p.x2 + bb;
    const y = z >= 0 ? 1 : 0;
    return { ...p, z, y, ok: y === p.t };
  });
  const correct = rows.filter((r) => r.ok).length;

  const eqTerms = `${f1(w1)}·x₁ ${w2 < 0 ? "−" : "+"} ${f1(Math.abs(w2))}·x₂ ${bb < 0 ? "−" : "+"} ${f1(Math.abs(bb))}`;

  return (
    <WidgetFrame
      title={title ?? "Perceptron Playground — Logic Gates"}
      description={
        description ??
        "Drag the weights and bias to move the decision boundary w₁x₁ + w₂x₂ + b = 0. Filled points are class 1, hollow points class 0. Can you separate AND and OR? What about XOR?"
      }
      accent="u1"
    >
      <div className="flex flex-col gap-4">
        <WidgetControls>
          <div className="flex items-center gap-1">
            {(Object.keys(GATES) as Gate[]).map((g) => (
              <Button
                key={g}
                size="sm"
                variant={gate === g ? "default" : "outline"}
                onClick={() => {
                  setGate(g);
                  setShowMLP(false);
                }}
              >
                {g}
              </Button>
            ))}
          </div>
          <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Switch id="nobias" checked={noBias} onCheckedChange={setNoBias} />
            <label htmlFor="nobias" className="select-none">
              b = 0 (why bias matters)
            </label>
          </span>
        </WidgetControls>

        <div className="grid gap-4 md:grid-cols-[minmax(0,340px)_1fr]">
          {/* ---------------- plot ---------------- */}
          <div className="mx-auto w-full max-w-[340px]">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
              {/* plot background */}
              <rect
                x={PAD.l}
                y={PAD.t}
                width={W - PAD.l - PAD.r}
                height={H - PAD.t - PAD.b}
                fill="currentColor"
                className="text-muted/30"
              />
              {/* negative half-plane (light red) */}
              <rect
                x={PAD.l}
                y={PAD.t}
                width={W - PAD.l - PAD.r}
                height={H - PAD.t - PAD.b}
                fill="#ef4444"
                opacity={showMLP ? 0.05 : 0.12}
              />
              {/* positive half-plane (light green) */}
              {!showMLP && geom.posPoly.length > 0 && (
                <polygon points={toPolyStr(geom.posPoly)} fill="#10b981" opacity={0.18} />
              )}

              {/* XOR MLP band */}
              {showMLP && geom.band.length > 0 && (
                <polygon points={toPolyStr(geom.band)} fill="#10b981" opacity={0.25} />
              )}

              {/* grid + ticks */}
              {[0, 0.5, 1].map((v) => (
                <g key={v}>
                  <line x1={sx(v)} y1={sy(DOM.ymin)} x2={sx(v)} y2={sy(DOM.ymax)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
                  <line x1={sx(DOM.xmin)} y1={sy(v)} x2={sx(DOM.xmax)} y2={sy(v)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
                  <text x={sx(v)} y={H - PAD.b + 14} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
                    {v}
                  </text>
                  <text x={PAD.l - 6} y={sy(v) + 3} textAnchor="end" fontSize={10} className="fill-muted-foreground">
                    {v}
                  </text>
                </g>
              ))}
              <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium">
                x₁
              </text>
              <text x={12} y={H / 2} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium" transform={`rotate(-90 12 ${H / 2})`}>
                x₂
              </text>

              {/* decision line */}
              {geom.linePts.length === 2 && (
                <line
                  x1={sx(geom.linePts[0].x)}
                  y1={sy(geom.linePts[0].y)}
                  x2={sx(geom.linePts[1].x)}
                  y2={sy(geom.linePts[1].y)}
                  stroke="currentColor"
                  className="text-primary"
                  strokeWidth={2.5}
                  opacity={showMLP ? 0.35 : 1}
                />
              )}

              {/* MLP lines */}
              {showMLP && (
                <g>
                  {geom.lineH1.length === 2 && (
                    <line
                      x1={sx(geom.lineH1[0].x)}
                      y1={sy(geom.lineH1[0].y)}
                      x2={sx(geom.lineH1[1].x)}
                      y2={sy(geom.lineH1[1].y)}
                      stroke="#0ea5e9"
                      strokeWidth={2}
                      strokeDasharray="7 5"
                    />
                  )}
                  {geom.lineH2.length === 2 && (
                    <line
                      x1={sx(geom.lineH2[0].x)}
                      y1={sy(geom.lineH2[0].y)}
                      x2={sx(geom.lineH2[1].x)}
                      y2={sy(geom.lineH2[1].y)}
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="7 5"
                    />
                  )}
                  <text x={sx(1.02)} y={sy(-0.02)} fontSize={9.5} fill="#0ea5e9" fontWeight={600}>
                    h₁: x₁+x₂−0.5 = 0
                  </text>
                  <text x={sx(0.28)} y={sy(1.06)} fontSize={9.5} fill="#8b5cf6" fontWeight={600}>
                    h₂: x₁+x₂−1.5 = 0
                  </text>
                </g>
              )}

              {/* data points */}
              {rows.map((r) => (
                <g key={`${r.x1},${r.x2}`}>
                  <circle
                    cx={sx(r.x1)}
                    cy={sy(r.x2)}
                    r={10}
                    fill={r.t === 1 ? "#10b981" : "currentColor"}
                    className={r.t === 1 ? "" : "text-background"}
                    stroke={r.ok ? "#059669" : "#ef4444"}
                    strokeWidth={2.5}
                  />
                  {r.t === 0 && (
                    <circle cx={sx(r.x1)} cy={sy(r.x2)} r={5.5} fill="#6b7280" opacity={0.55} />
                  )}
                  <text
                    x={sx(r.x1) + 13}
                    y={sy(r.x2) - 10}
                    fontSize={9.5}
                    fontWeight={700}
                    className={r.ok ? "fill-emerald-600 dark:fill-emerald-400" : "fill-red-500"}
                  >
                    {r.ok ? "✓" : "✗"} z={f2(r.z)}
                  </text>
                </g>
              ))}
            </svg>

            {/* legend */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> class 1 (target)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full border-2 border-gray-400 bg-background" /> class 0 (target)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 bg-primary" /> w₁x₁+w₂x₂+b = 0
              </span>
            </div>
          </div>

          {/* ---------------- controls & readout ---------------- */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border bg-muted/40 p-3">
              <p className="font-mono text-sm font-semibold">
                z = {eqTerms}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                prediction rule: y = 1 if z ≥ 0, else 0 · green region = positive side, red = negative side
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(
                [
                  { label: "w₁", val: w1, set: setW1 },
                  { label: "w₂", val: w2, set: setW2 },
                  { label: "b", val: bb, set: setB },
                ] as const
              ).map((s) => (
                <div key={s.label} className="rounded-lg bg-muted/50 px-3 py-2">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-xs font-semibold">{s.label}</span>
                    <span className="font-mono text-xs text-primary">{f1(s.val)}</span>
                  </div>
                  <Slider
                    value={[s.val]}
                    min={-4}
                    max={4}
                    step={0.1}
                    disabled={s.label === "b" && noBias}
                    onValueChange={(v) => s.set(v[0])}
                    aria-label={s.label}
                  />
                </div>
              ))}
            </div>

            {noBias && (
              <p className="rounded-lg border border-amber-300/60 bg-amber-500/10 p-2.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                With b = 0 the boundary must pass through the origin, so (0,0) always gets z = 0 →
                predicted class 1. Neither AND nor OR (which need (0,0) → 0) can ever be classified
                correctly — this is exactly why the bias exists: it shifts the boundary away from the
                origin.
              </p>
            )}

            {/* per-point table */}
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-2.5 py-1.5 font-medium">(x₁, x₂)</th>
                    <th className="px-2.5 py-1.5 font-medium">target t</th>
                    <th className="px-2.5 py-1.5 font-medium">z</th>
                    <th className="px-2.5 py-1.5 font-medium">ŷ</th>
                    <th className="px-2.5 py-1.5 font-medium">match</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {rows.map((r, i) => (
                    <tr key={i} className={cn("border-b last:border-0", !r.ok && "bg-red-500/5")}>
                      <td className="px-2.5 py-1.5">({r.x1}, {r.x2})</td>
                      <td className="px-2.5 py-1.5">{r.t}</td>
                      <td className="px-2.5 py-1.5">{f2(r.z)}</td>
                      <td className="px-2.5 py-1.5">{r.y}</td>
                      <td className="px-2.5 py-1.5">
                        {r.ok ? (
                          <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Stat label="correct" value={`${correct} / 4`} tone={correct === 4 ? "good" : correct === 0 ? "bad" : "default"} />
              <Stat label="separable?" value={correct === 4 ? "yes — line found" : "not yet"} tone={correct === 4 ? "good" : "default"} />
            </div>

            <p className="text-[11px] text-muted-foreground">{data.hint}</p>

            {gate === "XOR" && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-start gap-2 rounded-lg border border-amber-300/60 bg-amber-500/10 p-2.5 text-[11px] leading-relaxed text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    <strong>XOR is not linearly separable.</strong> Class 0 = &#123;(0,0),(1,1)&#125; and
                    class 1 = &#123;(0,1),(1,0)&#125; sit on opposite diagonals — no single straight
                    line can separate them (Minsky &amp; Papert, 1969).
                  </span>
                </div>
                <span className="flex items-center gap-2 text-xs">
                  <Switch id="mlp" checked={showMLP} onCheckedChange={setShowMLP} />
                  <label htmlFor="mlp" className="flex select-none items-center gap-1.5 text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" />
                    Show MLP solution (2-2-1 network)
                  </label>
                </span>
                {showMLP && (
                  <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
                    A 2-2-1 MLP uses <strong>two</strong> hidden neurons: h₁ fires above the blue line
                    (x₁+x₂ &gt; 0.5, an OR) and h₂ above the violet line (x₁+x₂ &gt; 1.5, an AND). The
                    output computes <span className="font-mono">h₁ AND NOT h₂</span> — the green band
                    between the lines is exactly the XOR-true zone containing (0,1) and (1,0). Two
                    lines carve out what one line never could.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
