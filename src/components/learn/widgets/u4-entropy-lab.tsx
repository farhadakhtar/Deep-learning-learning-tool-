"use client";

import { useState } from "react";
import { WidgetFrame, Stat, WidgetControls } from "./frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { BarChart3, Waves, CheckCircle2 } from "lucide-react";

/* ---------------- helpers ---------------- */

const f2 = (x: number) => {
  const s = x.toFixed(2);
  return s === "-0.00" ? "0.00" : s;
};
const f4 = (x: number) => {
  const s = x.toFixed(4);
  return s === "-0.0000" ? "0.0000" : s;
};

const LOG2_3 = Math.log2(3); // 1.5850

function numEntropy(pdfF: (x: number) => number, lo: number, hi: number, n = 2400): number {
  const dx = (hi - lo) / n;
  let h = 0;
  for (let i = 0; i <= n; i++) {
    const w = i === 0 || i === n ? 0.5 : 1;
    const p = pdfF(lo + i * dx);
    if (p > 1e-12) h += w * p * Math.log(p) * dx;
  }
  return -h;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  accent,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  accent?: string;
}) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} className="h-11 flex-1" aria-label={label} />
      <span className="w-14 shrink-0 text-right font-mono text-xs font-semibold" style={{ color: accent }}>
        {f2(value)}
      </span>
    </div>
  );
}

/* ================================================================== */
/* TAB A — Discrete maximum entropy (notes Example 5.1)               */
/* ================================================================== */

function DiscreteTab() {
  const [p1, setP1] = useState(0.5);
  const [p2, setP2] = useState(0.3);
  const p3 = Math.max(0, 1 - p1 - p2);
  const ps = [p1, p2, p3];
  const terms = ps.map((p) => (p <= 1e-12 ? 0 : -p * Math.log2(p)));
  const H = terms.reduce((a, b) => a + b, 0);
  const isUniform = Math.abs(p1 - 1 / 3) < 0.005 && Math.abs(p2 - 1 / 3) < 0.005;
  const gap = LOG2_3 - H;

  const setP1c = (v: number) => {
    setP1(v);
    if (v + p2 > 1) setP2(Math.max(0, 1 - v));
  };
  const setP2c = (v: number) => {
    setP2(v);
    if (v + p1 > 1) setP1(Math.max(0, 1 - v));
  };

  const PW = 340;
  const BH = 150;
  const barX = [60, 170, 280];
  const scale = 110; // px per unit probability
  const uniY = BH - 20 - (1 / 3) * scale;

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      {/* controls */}
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          3-outcome distribution (p₃ is automatic)
        </p>
        <SliderRow label="p₁" value={p1} min={0} max={1} onChange={setP1c} accent="#8b5cf6" />
        <SliderRow label="p₂" value={p2} min={0} max={1} onChange={setP2c} accent="#8b5cf6" />
        <div className="flex min-h-11 items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">p₃ = 1−p₁−p₂</span>
          <div className="h-1.5 flex-1 rounded-full bg-muted" />
          <span className="w-14 shrink-0 text-right font-mono text-xs font-semibold text-foreground">{f4(p3)}</span>
        </div>
        <WidgetControls className="mt-2 justify-center bg-transparent p-0">
          <Button variant="outline" size="sm" className="h-11" onClick={() => { setP1(0.5); setP2(0.3); }}>
            Notes preset [0.5, 0.3, 0.2]
          </Button>
          <Button variant="outline" size="sm" className="h-11" onClick={() => { setP1(1 / 3); setP2(1 / 3); }}>
            Uniform [1/3, 1/3, 1/3]
          </Button>
        </WidgetControls>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Stat label="H(p) — current" value={`${f4(H)} bits`} tone={isUniform ? "good" : "default"} />
          <Stat label="H(uniform) = log₂3" value={`${f4(LOG2_3)} bits`} tone="accent" />
        </div>
        <div className="rounded-lg bg-background p-2.5">
          <p className="break-words font-mono text-[11px] leading-relaxed text-muted-foreground">
            H = −( {f4(p1)}·log₂{f4(p1)} + {f4(p2)}·log₂{f4(p2)} + {f4(p3)}·log₂{f4(p3)} )
          </p>
          <p className="mt-1 break-words font-mono text-[11px] text-foreground">
            = {f4(terms[0])} + {f4(terms[1])} + {f4(terms[2])} = {f4(H)} bits
          </p>
        </div>
      </div>

      {/* chart */}
      <div className="min-w-0 space-y-3">
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              The distribution p = [p₁, p₂, p₃]
            </p>
            {isUniform ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" /> at maximum entropy
              </span>
            ) : (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                uniform is always max entropy
              </span>
            )}
          </div>
          <svg viewBox={`0 0 ${PW} ${BH}`} className="h-auto w-full" role="img" aria-label="Probability bars">
            <line x1={40} y1={BH - 20} x2={PW - 10} y2={BH - 20} className="stroke-border" strokeWidth={1.5} />
            {/* uniform reference */}
            <line x1={40} y1={uniY} x2={PW - 10} y2={uniY} className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="5 4" strokeOpacity={0.7} />
            <text x={PW - 12} y={uniY - 4} textAnchor="end" fontSize={9.5} className="fill-muted-foreground font-mono">
              uniform 1/3
            </text>
            {ps.map((p, i) => (
              <g key={i}>
                <rect
                  x={barX[i]}
                  y={BH - 20 - p * scale}
                  width={50}
                  height={Math.max(1, p * scale)}
                  rx={5}
                  className="fill-primary"
                  fillOpacity={0.8}
                />
                <text x={barX[i] + 25} y={BH - 26 - p * scale} textAnchor="middle" fontSize={10.5} className="fill-foreground font-mono">
                  {f4(p)}
                </text>
                <text x={barX[i] + 25} y={BH - 6} textAnchor="middle" fontSize={10.5} className="fill-muted-foreground font-mono">
                  p{i + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>

        {/* entropy meter */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Entropy meter</span>
            <span className="font-mono normal-case">gap to max: {f4(Math.max(0, gap))} bits</span>
          </div>
          <div className="relative h-6 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${(H / LOG2_3) * 100}%` }} />
          </div>
          <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
            <span>0</span>
            <span>H(p) = {f4(H)}</span>
            <span>max = log₂3 = {f4(LOG2_3)}</span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            H(p) = 1.4855 &lt; H(uniform) = 1.5850 for the notes&rsquo; example [0.5, 0.3, 0.2]: any deviation from
            uniform — like favouring one outcome — reduces entropy. With no information beyond normalisation, spreading
            probability equally (pᵢ = 1/n) is the least-biased choice, provable with a single Lagrange multiplier.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* TAB B — Continuous: fixed mean & variance => Gaussian              */
/* ================================================================== */

const SQ3 = Math.sqrt(3);
const SQ2 = Math.sqrt(2);

function ContinuousTab() {
  const [mu, setMu] = useState(0);
  const [sg, setSg] = useState(1);

  const gauss = (x: number) => Math.exp(-((x - mu) ** 2) / (2 * sg * sg)) / (sg * Math.sqrt(2 * Math.PI));
  const unif = (x: number) => {
    const half = SQ3 * sg;
    return x >= mu - half && x <= mu + half ? 1 / (2 * half) : 0;
  };
  const b = sg / SQ2;
  const laplace = (x: number) => Math.exp(-Math.abs(x - mu) / b) / (2 * b);

  const hGaussAnalytic = 0.5 * Math.log(2 * Math.PI * Math.E * sg * sg);
  const hGaussNum = numEntropy(gauss, mu - 10 * sg, mu + 10 * sg);
  const hUnif = numEntropy(unif, mu - SQ3 * sg - 1e-9, mu + SQ3 * sg + 1e-9);
  const hLap = numEntropy(laplace, mu - 12 * b, mu + 12 * b);

  /* density plot */
  const PW = 460;
  const PH = 150;
  const lo = mu - 4.2 * sg - 0.8;
  const hi = mu + 4.2 * sg + 0.8;
  const ymax = Math.max(gauss(mu), unif(mu), laplace(mu)) * 1.12;
  const sx = (x: number) => ((x - lo) / (hi - lo)) * PW;
  const sy = (y: number) => PH - (Math.min(y, ymax) / ymax) * (PH - 8) - 4;
  const pathOf = (f: (x: number) => number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 200; i++) {
      const x = lo + ((hi - lo) * i) / 200;
      pts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(f(x)).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  /* entropy vs sigma mini plot */
  const SW = 460;
  const SH = 110;
  const sgLo = 0.2;
  const sgHi = 2.5;
  const hMax = 0.5 * Math.log(2 * Math.PI * Math.E * sgHi * sgHi); // largest value on axis
  const hx = (s: number) => ((s - sgLo) / (sgHi - sgLo)) * SW;
  const hy = (h: number) => SH - (h / hMax) * (SH - 10) - 5;
  const hPath = (f: (s: number) => number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const s = sgLo + ((sgHi - sgLo) * i) / 120;
      pts.push(`${i === 0 ? "M" : "L"}${hx(s).toFixed(1)},${hy(f(s)).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  const rows = [
    { name: "Gaussian N(μ, σ²)", color: "#8b5cf6", h: hGaussNum, formula: "h = ½·ln(2πeσ²)", max: true },
    { name: "Laplace(μ, σ/√2)", color: "#f59e0b", h: hLap, formula: "same variance 2b² = σ²", max: false },
    { name: `Uniform[μ−√3σ, μ+√3σ]`, color: "#38bdf8", h: hUnif, formula: "same variance (2√3σ)²/12 = σ²", max: false },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      {/* controls */}
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Fixed constraints: mean μ and variance σ²
        </p>
        <SliderRow label="μ" value={mu} min={-2} max={2} onChange={setMu} accent="#8b5cf6" />
        <SliderRow label="σ" value={sg} min={0.3} max={2} onChange={setSg} accent="#8b5cf6" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Stat label="Gaussian h (analytic)" value={`${f4(hGaussAnalytic)} nats`} tone="accent" />
          <Stat label="Gaussian h (numeric)" value={`${f4(hGaussNum)} nats`} tone="good" />
        </div>
        <p className="pt-2 text-[11px] leading-relaxed text-muted-foreground">
          Entropies of the alternatives are computed by numeric integration, h = −∫ p ln p dx — they always come out
          below the Gaussian with the same mean and variance.
        </p>
      </div>

      <div className="min-w-0 space-y-3">
        {/* density plot */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Three distributions, identical mean μ = {f2(mu)} and variance σ² = {f4(sg * sg)}
            </p>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "#8b5cf6" }} /> Gaussian
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "#f59e0b" }} /> Laplace
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "#38bdf8" }} /> Uniform
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${PW} ${PH + 16}`} className="h-auto w-full" role="img" aria-label="Densities with same mean and variance">
            <line x1={0} y1={PH - 4} x2={PW} y2={PH - 4} className="stroke-border" strokeWidth={1.2} />
            <path d={pathOf(unif)} fill="none" stroke="#38bdf8" strokeWidth={2} />
            <path d={pathOf(laplace)} fill="none" stroke="#f59e0b" strokeWidth={2} />
            <path d={pathOf(gauss)} fill="none" stroke="#8b5cf6" strokeWidth={2.4} />
            <line x1={sx(mu)} y1={6} x2={sx(mu)} y2={PH - 4} stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} strokeDasharray="2 3" />
            <text x={sx(mu)} y={PH + 11} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground font-mono">
              μ
            </text>
          </svg>
        </div>

        {/* entropy bars */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Differential entropy h (nats) — Gaussian wins every time
          </p>
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <span className="w-44 shrink-0 truncate font-mono text-[11px] text-muted-foreground" title={r.formula}>
                  {r.name}
                </span>
                <div className="h-5 flex-1 overflow-hidden rounded-md bg-muted">
                  <div
                    className="flex h-full items-center justify-end rounded-md pr-1.5 transition-all"
                    style={{ width: `${(r.h / hMax) * 100}%`, backgroundColor: r.color, opacity: r.max ? 1 : 0.55 }}
                  >
                    <span className="font-mono text-[10px] font-bold text-white">{f4(r.h)}</span>
                  </div>
                </div>
                {r.max && (
                  <span className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    max
                  </span>
                )}
              </div>
            ))}
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            The Gaussian has maximum entropy among <em>all</em> distributions with fixed mean &amp; variance — that is why
            it is everywhere (including the VAE prior p(z) = N(0, I)). Maximising −∫p ln p dx under the three constraints
            (normalisation, mean, variance) with Lagrange multipliers yields exactly the exponential-family form
            p(x) ∝ exp(λ₁x + λ₂(x−μ)²) — the Normal distribution.
          </p>
        </div>

        {/* entropy vs sigma */}
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Entropy grows with σ (h in nats) — current σ = {f2(sg)} marked
          </p>
          <svg viewBox={`0 0 ${SW} ${SH + 16}`} className="h-auto w-full" role="img" aria-label="Entropy versus sigma">
            <line x1={0} y1={SH - 5} x2={SW} y2={SH - 5} className="stroke-border" strokeWidth={1.2} />
            <path d={hPath((s) => 0.5 * Math.log(2 * Math.PI * Math.E * s * s))} fill="none" stroke="#8b5cf6" strokeWidth={2.2} />
            <path d={hPath((s) => 1 + Math.log(SQ2 * s))} fill="none" stroke="#f59e0b" strokeWidth={1.8} />
            <path d={hPath((s) => Math.log(2 * SQ3 * s))} fill="none" stroke="#38bdf8" strokeWidth={1.8} />
            <line x1={hx(sg)} y1={4} x2={hx(sg)} y2={SH - 5} stroke="currentColor" strokeOpacity={0.4} strokeWidth={1.5} strokeDasharray="3 3" />
            <circle cx={hx(sg)} cy={hy(hGaussAnalytic)} r={4} fill="#8b5cf6" stroke="currentColor" strokeOpacity={0.3} />
            <text x={hx(sg) + 5} y={hy(hGaussAnalytic) - 6} fontSize={9.5} className="fill-foreground font-mono">
              {f4(hGaussAnalytic)}
            </text>
            <text x={2} y={SH + 11} fontSize={9.5} className="fill-muted-foreground font-mono">
              σ = 0.2
            </text>
            <text x={SW - 2} y={SH + 11} textAnchor="end" fontSize={9.5} className="fill-muted-foreground font-mono">
              σ = 2.5
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */

export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "Maximum Entropy Lab"}
      description={description ?? "Jaynes' principle: given only partial information, choose the least-biased distribution consistent with it."}
      accent="u4"
    >
      <Tabs defaultValue="discrete">
        <TabsList className="h-11 w-full sm:w-auto">
          <TabsTrigger value="discrete" className="px-4">
            <BarChart3 className="h-3.5 w-3.5" /> Discrete
          </TabsTrigger>
          <TabsTrigger value="continuous" className="px-4">
            <Waves className="h-3.5 w-3.5" /> Continuous → Gaussian
          </TabsTrigger>
        </TabsList>
        <TabsContent value="discrete" className="mt-3">
          <DiscreteTab />
        </TabsContent>
        <TabsContent value="continuous" className="mt-3">
          <ContinuousTab />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}
