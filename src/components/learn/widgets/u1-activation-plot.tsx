"use client";

import { useState } from "react";
import { WidgetFrame, WidgetControls } from "./frame";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type FnKey = "sigmoid" | "tanh" | "relu";

const FNS: Record<FnKey, { label: string; formula: string; dFormula: string; color: string; f: (z: number) => number; df: (z: number) => number }> = {
  sigmoid: {
    label: "Sigmoid",
    formula: "σ(z) = 1/(1+e⁻ᶻ)",
    dFormula: "σ′ = σ(1−σ)",
    color: "#0ea5e9",
    f: (z) => 1 / (1 + Math.exp(-z)),
    df: (z) => {
      const s = 1 / (1 + Math.exp(-z));
      return s * (1 - s);
    },
  },
  tanh: {
    label: "Tanh",
    formula: "tanh(z) = (eᶻ−e⁻ᶻ)/(eᶻ+e⁻ᶻ)",
    dFormula: "tanh′ = 1−tanh²",
    color: "#8b5cf6",
    f: (z) => Math.tanh(z),
    df: (z) => 1 - Math.tanh(z) ** 2,
  },
  relu: {
    label: "ReLU",
    formula: "ReLU(z) = max(0, z)",
    dFormula: "ReLU′ = 1 if z>0 else 0",
    color: "#f59e0b",
    f: (z) => Math.max(0, z),
    df: (z) => (z > 0 ? 1 : 0),
  },
};

const W = 400;
const H = 290;
const PAD = { l: 42, r: 14, t: 16, b: 34 };
const ZMIN = -6;
const ZMAX = 6;
const YMIN = -1.5;
const YMAX = 2;

const px = (z: number) => PAD.l + ((z - ZMIN) / (ZMAX - ZMIN)) * (W - PAD.l - PAD.r);
const py = (y: number) => PAD.t + ((YMAX - y) / (YMAX - YMIN)) * (H - PAD.t - PAD.b);

function pathFor(fn: (z: number) => number) {
  const pts: string[] = [];
  for (let i = 0; i <= 240; i++) {
    const z = ZMIN + (i / 240) * (ZMAX - ZMIN);
    let v = fn(z);
    v = Math.max(YMIN - 0.2, Math.min(YMAX + 0.2, v));
    pts.push(`${i === 0 ? "M" : "L"}${px(z).toFixed(1)},${py(v).toFixed(1)}`);
  }
  return pts.join(" ");
}

const f3 = (v: number) => v.toFixed(3);

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [visible, setVisible] = useState<Record<FnKey, boolean>>({ sigmoid: true, tanh: true, relu: true });
  const [showDeriv, setShowDeriv] = useState(true);
  const [hoverZ, setHoverZ] = useState<number | null>(null);

  const activeFns = (Object.keys(FNS) as FnKey[]).filter((k) => visible[k]);

  return (
    <WidgetFrame
      title={title ?? "Activation Function Explorer"}
      description={
        description ??
        "Sigmoid, tanh and ReLU over z ∈ [−6, 6]. Hover or drag on the plot for exact values, and toggle derivatives to see why sigmoid networks suffer vanishing gradients while ReLU provides a gradient highway."
      }
      accent="u1"
    >
      <div className="flex flex-col gap-3">
        <WidgetControls>
          {(Object.keys(FNS) as FnKey[]).map((k) => (
            <Button
              key={k}
              size="sm"
              variant={visible[k] ? "default" : "outline"}
              onClick={() => setVisible((v) => ({ ...v, [k]: !v[k] }))}
              className={cn(visible[k] && "pointer-events-none")}
              style={visible[k] ? { background: FNS[k].color, color: "#fff" } : { color: FNS[k].color, borderColor: FNS[k].color }}
            >
              {FNS[k].label}
            </Button>
          ))}
          <span className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <Switch id="deriv" checked={showDeriv} onCheckedChange={setShowDeriv} />
            <label htmlFor="deriv" className="select-none">
              show derivatives
            </label>
          </span>
        </WidgetControls>

        <div className="mx-auto w-full max-w-2xl">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full touch-none"
            role="img"
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const sxp = ((e.clientX - rect.left) / rect.width) * W;
              const z = ZMIN + ((sxp - PAD.l) / (W - PAD.l - PAD.r)) * (ZMAX - ZMIN);
              setHoverZ(Math.max(ZMIN, Math.min(ZMAX, z)));
            }}
            onPointerLeave={() => setHoverZ(null)}
          >
            <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} fill="currentColor" className="text-muted/30" />

            {/* grid + ticks */}
            {[-6, -4, -2, 0, 2, 4, 6].map((z) => (
              <g key={`x${z}`}>
                <line x1={px(z)} y1={py(YMIN)} x2={px(z)} y2={py(YMAX)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={z === 0 ? 1.5 : 1} />
                <text x={px(z)} y={H - PAD.b + 14} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
                  {z}
                </text>
              </g>
            ))}
            {[-1, 0, 1, 2].map((y) => (
              <g key={`y${y}`}>
                <line x1={px(ZMIN)} y1={py(y)} x2={px(ZMAX)} y2={py(y)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={y === 0 ? 1.5 : 1} />
                <text x={PAD.l - 6} y={py(y) + 3} textAnchor="end" fontSize={10} className="fill-muted-foreground">
                  {y}
                </text>
              </g>
            ))}
            <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium">
              z (net input)
            </text>
            <text x={11} y={H / 2} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium" transform={`rotate(-90 11 ${H / 2})`}>
              f(z)
            </text>

            {/* derivative curves */}
            {showDeriv &&
              activeFns.map((k) => (
                <path key={`d${k}`} d={pathFor(FNS[k].df)} fill="none" stroke={FNS[k].color} strokeWidth={1.8} strokeDasharray="6 4" opacity={0.75} />
              ))}

            {/* function curves */}
            {activeFns.map((k) => (
              <path key={`f${k}`} d={pathFor(FNS[k].f)} fill="none" stroke={FNS[k].color} strokeWidth={3} strokeLinecap="round" />
            ))}

            {/* annotation: sigmoid derivative ceiling */}
            {visible.sigmoid && (
              <g>
                <line x1={px(-4.6)} y1={py(0.25)} x2={px(-0.35)} y2={py(0.25)} stroke="#0ea5e9" strokeWidth={1} strokeDasharray="3 3" opacity={0.7} />
                <circle cx={px(0)} cy={py(0.25)} r={3.5} fill="#0ea5e9" />
                <text x={px(-5.9)} y={py(0.25) - 26} fontSize={10} fontWeight={600} className="fill-sky-600 dark:fill-sky-400">
                  σ′ never exceeds 0.25
                </text>
                <text x={px(-5.9)} y={py(0.25) - 14} fontSize={9.5} className="fill-muted-foreground">
                  → vanishing gradients in deep sigmoid stacks
                </text>
              </g>
            )}

            {/* annotation: relu gradient highway */}
            {visible.relu && (
              <g>
                <text x={px(1.1)} y={py(1.55)} fontSize={10} fontWeight={600} className="fill-amber-600 dark:fill-amber-400">
                  ReLU′ = 1 for z &gt; 0
                </text>
                <text x={px(1.1)} y={py(1.55) + 12} fontSize={9.5} className="fill-muted-foreground">
                  → gradient highway: gradients pass through undamped
                </text>
              </g>
            )}

            {/* crosshair */}
            {hoverZ !== null && (
              <g>
                <line x1={px(hoverZ)} y1={py(YMIN)} x2={px(hoverZ)} y2={py(YMAX)} stroke="currentColor" className="text-foreground/50" strokeWidth={1} />
                {showDeriv &&
                  activeFns.map((k) => (
                    <circle key={`hd${k}`} cx={px(hoverZ)} cy={py(FNS[k].df(hoverZ))} r={3.5} fill={FNS[k].color} stroke="currentColor" className="stroke-background" strokeWidth={1.2} />
                  ))}
                {activeFns.map((k) => (
                  <circle key={`hf${k}`} cx={px(hoverZ)} cy={py(FNS[k].f(hoverZ))} r={4.5} fill={FNS[k].color} stroke="currentColor" className="stroke-background" strokeWidth={1.5} />
                ))}
                {/* readout panel */}
                <g>
                  <rect x={W - PAD.r - 138} y={PAD.t + 4} width={132} height={26 + activeFns.length * 15} rx={7} fill="currentColor" className="fill-background stroke-border" stroke="currentColor" strokeWidth={1} />
                  <text x={W - PAD.r - 130} y={PAD.t + 21} fontSize={10.5} fontWeight={700} className="fill-foreground font-mono">
                    z = {f3(hoverZ)}
                  </text>
                  {activeFns.map((k, i) => (
                    <text key={`hr${k}`} x={W - PAD.r - 130} y={PAD.t + 36 + i * 15} fontSize={9.5} className="font-mono" fill={FNS[k].color}>
                      {FNS[k].label}: f={f3(FNS[k].f(hoverZ))}
                      {showDeriv ? ` f′=${f3(FNS[k].df(hoverZ))}` : ""}
                    </text>
                  ))}
                </g>
              </g>
            )}
          </svg>
        </div>

        {/* legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
          {(Object.keys(FNS) as FnKey[]).map((k) => (
            <span key={k} className={cn("flex items-center gap-1.5", !visible[k] && "opacity-40")}>
              <span className="h-0.5 w-4 rounded" style={{ background: FNS[k].color }} />
              {FNS[k].formula}
              {showDeriv && (
                <span className="flex items-center gap-1">
                  <span className="h-0.5 w-3 rounded" style={{ backgroundImage: `repeating-linear-gradient(90deg, ${FNS[k].color} 0 4px, transparent 4px 7px)` }} />
                  {FNS[k].dFormula}
                </span>
              )}
            </span>
          ))}
        </div>

        <div className="grid gap-2 text-[11px] leading-relaxed text-muted-foreground sm:grid-cols-3">
          <p className="rounded-lg bg-muted/50 p-2.5">
            <span className="font-semibold text-sky-600 dark:text-sky-400">Sigmoid</span> — range (0, 1);
            output layer for binary classification. Its derivative peaks at 0.25, so multiplying many
            such factors across layers shrinks gradients toward zero.
          </p>
          <p className="rounded-lg bg-muted/50 p-2.5">
            <span className="font-semibold text-violet-600 dark:text-violet-400">Tanh</span> — range
            (−1, 1); zero-centred output helps optimisation in hidden layers. Derivative still ≤ 1.
          </p>
          <p className="rounded-lg bg-muted/50 p-2.5">
            <span className="font-semibold text-amber-600 dark:text-amber-400">ReLU</span> — range
            [0, ∞); fast and largely avoids the vanishing gradient problem, the default for deep
            hidden layers.
          </p>
        </div>
      </div>
    </WidgetFrame>
  );
}
