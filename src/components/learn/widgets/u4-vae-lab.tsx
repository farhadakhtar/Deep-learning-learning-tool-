"use client";

import { useState } from "react";
import { WidgetFrame, Stat } from "./frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dices, MoveHorizontal, Sparkles } from "lucide-react";

/* ---------------- helpers ---------------- */

const f2 = (x: number) => {
  const s = x.toFixed(2);
  return s === "-0.00" ? "0.00" : s;
};
const f4 = (x: number) => {
  const s = x.toFixed(4);
  return s === "-0.0000" ? "0.0000" : s;
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randn(rng: () => number) {
  const u = Math.max(1e-9, rng());
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rng());
}

const pdf = (x: number, m: number, s: number) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));

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
/* TAB A — Reparameterization & KL (notes Example 3.1)                */
/* ================================================================== */

const LO = -4.5;
const HI = 4.5;
const PW = 460; // plot width
const PH = 160; // plot height
const N = 180;

function ReparamTab() {
  const [mu, setMu] = useState(0.3);
  const [sg, setSg] = useState(0.5);
  const [eps, setEps] = useState(1.0);

  const z = mu + sg * eps;
  const s2 = sg * sg;
  const lnS2 = Math.log(s2);
  const lnR = Number(f4(lnS2)); // notes round ln(sigma^2) to 4dp before substituting
  const inner = mu * mu + s2 - lnR - 1;
  const kl = 0.5 * inner;

  const ymax = Math.min(1.05, Math.max(0.42, 1 / (sg * Math.sqrt(2 * Math.PI))));
  const sx = (x: number) => ((x - LO) / (HI - LO)) * PW;
  const sy = (y: number) => PH - Math.min(1, y / ymax) * (PH - 6) - 3;

  const priorPts: string[] = [];
  const qPts: string[] = [];
  const slices: { x: number; yTop: number; yBot: number; pos: boolean }[] = [];
  for (let i = 0; i <= N; i++) {
    const x = LO + ((HI - LO) * i) / N;
    const p0 = pdf(x, 0, 1);
    const q0 = pdf(x, mu, sg);
    priorPts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(p0).toFixed(1)}`);
    qPts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(q0).toFixed(1)}`);
    if (i > 0) {
      const xPrev = LO + ((HI - LO) * (i - 1)) / N;
      const pPrev = pdf(xPrev, 0, 1);
      const qPrev = pdf(xPrev, mu, sg);
      const yq = sy(qPrev);
      const yp = sy(pPrev);
      slices.push({
        x: sx(xPrev),
        yTop: Math.min(yq, yp),
        yBot: Math.max(yq, yp),
        pos: qPrev > pPrev,
      });
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      {/* controls */}
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Encoder outputs q(z|x) = N(μ, σ²)
        </p>
        <SliderRow label="μ" value={mu} min={-2} max={2} onChange={setMu} accent="#8b5cf6" />
        <SliderRow label="σ" value={sg} min={0.05} max={2} onChange={setSg} accent="#8b5cf6" />
        <div className="flex min-h-11 items-center justify-between gap-3">
          <span className="font-mono text-xs text-muted-foreground">ε (noise)</span>
          <Button variant="outline" size="sm" className="h-11" onClick={() => setEps(randn(mulberry32(Date.now() % 100000)))}>
            <Dices className="h-3.5 w-3.5" /> Resample ε
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Stat label="ε ~ N(0,1)" value={f4(eps)} />
          <Stat label="z = μ + σ·ε" value={f4(z)} tone="accent" />
          <Stat label="σ²" value={f4(s2)} />
          <Stat label="ln σ²" value={f4(lnS2)} />
        </div>
        <Button variant="ghost" size="sm" className="mt-1 h-9 w-full text-xs" onClick={() => { setMu(0.3); setSg(0.5); setEps(1.0); }}>
          Reset to notes values (μ=0.3, σ=0.5, ε=1.0)
        </Button>
      </div>

      {/* plot + formulas */}
      <div className="min-w-0 space-y-3">
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Prior N(0,1) vs encoder q(z|x) — shaded mismatch = the KL cost
            </p>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "#38bdf8" }} /> prior p(z)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "#8b5cf6" }} /> encoder q(z|x)
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${PW} ${PH + 22}`} className="h-auto w-full" role="img" aria-label="Prior versus encoder Gaussians">
            {/* baseline */}
            <line x1={0} y1={PH - 3} x2={PW} y2={PH - 3} className="stroke-border" strokeWidth={1.2} />
            {/* mismatch shading */}
            {slices.map((s, i) =>
              s.yBot - s.yTop < 0.5 ? null : (
                <rect
                  key={i}
                  x={s.x}
                  y={s.yTop}
                  width={PW / N + 0.6}
                  height={s.yBot - s.yTop}
                  fill={s.pos ? "#8b5cf6" : "#38bdf8"}
                  fillOpacity={0.28}
                />
              )
            )}
            {/* curves */}
            <path d={qPts.join(" ")} fill="none" stroke="#8b5cf6" strokeWidth={2.4} />
            <path d={priorPts.join(" ")} fill="none" stroke="#38bdf8" strokeWidth={2} strokeDasharray="6 3" />
            {/* mu marker */}
            <line x1={sx(mu)} y1={8} x2={sx(mu)} y2={PH - 3} stroke="#8b5cf6" strokeWidth={1} strokeDasharray="2 3" strokeOpacity={0.7} />
            <text x={sx(mu)} y={6} textAnchor="middle" fontSize={9} className="fill-foreground font-mono">
              μ
            </text>
            {/* z marker */}
            <circle cx={sx(z)} cy={PH - 3} r={4.5} fill="#8b5cf6" stroke="currentColor" strokeOpacity={0.3} />
            <text x={sx(z)} y={PH + 14} textAnchor="middle" fontSize={9.5} className="fill-foreground font-mono">
              z = {f4(z)}
            </text>
            <text x={sx(0)} y={PH + 14} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground font-mono">
              0
            </text>
            <text x={2} y={PH + 14} fontSize={9.5} className="fill-muted-foreground font-mono">
              {LO}
            </text>
            <text x={PW - 2} y={PH + 14} textAnchor="end" fontSize={9.5} className="fill-muted-foreground font-mono">
              {HI}
            </text>
          </svg>
        </div>

        {/* substituted KL computation */}
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="font-mono text-xs leading-relaxed text-foreground">
            KL( N(μ,σ²) ‖ N(0,1) ) = ½( μ² + σ² − ln σ² − 1 )
          </p>
          <p className="mt-1 break-words font-mono text-xs leading-relaxed text-muted-foreground">
            = ½( {f4(mu * mu)} + {f4(s2)} − ({f4(lnR)}) − 1 ) = ½( {f4(inner)} )
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Stat label="KL cost" value={`${f4(kl)} nats`} tone={kl > 0.5 ? "bad" : "accent"} />
            <div className="min-w-[180px] flex-1">
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                z = {f4(z)} is the actual latent value passed to the decoder this iteration. KL = {f4(kl)} nats is the
                &ldquo;cost&rdquo; charged for this encoder distribution N({f2(mu)}, {f4(s2)}) being different from the
                prior N(0,1) — training pushes μ toward 0 and σ toward 1 unless the reconstruction term needs otherwise.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="text-xs font-semibold text-foreground">Why the trick?</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Sampling z ~ N(μ, σ²) is random and non-differentiable — gradients cannot flow through it. Writing z = μ + σ⊙ε
            moves the randomness into an external ε, so z becomes a deterministic, differentiable function of μ and σ, and
            the ELBO = E
            <sub>q</sub>[log p(x|z)] − KL(q‖p) can be optimised end-to-end by backprop.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* TAB B — Decode the latent space (toy decoder)                      */
/* ================================================================== */

function decodeGrid(z1: number, z2: number): number[][] {
  const u = Math.max(-3, Math.min(3, z1)) / 3;
  const w = Math.max(-3, Math.min(3, z2)) / 3;
  const grid: number[][] = [];
  for (let r = 0; r < 8; r++) {
    const row: number[] = [];
    for (let c = 0; c < 8; c++) {
      const x = c + 0.5;
      const y = r + 0.5;
      const cx = 4.7 + 1.2 * u;
      const cy = 4.9 - 0.9 * w;
      const rx = 1.15 + 0.35 * w;
      const ry = 1.55 - 0.3 * u;
      const loop = Math.exp(-(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2));
      const sx = 1.7 + 0.9 * u;
      const stem = Math.exp(-(((x - sx) / 0.5) ** 2)) * Math.exp(-(((y - 3.5) / 2.3) ** 2));
      const by = 1.3 + 0.9 * w;
      const bar = 0.85 * Math.exp(-(((y - by) / 0.45) ** 2)) * Math.exp(-(((x - 4.2) / 3.4) ** 2));
      row.push(Math.min(1, 0.95 * loop + 0.8 * stem + 0.7 * bar));
    }
    grid.push(row);
  }
  return grid;
}

function DecodeTab() {
  const [z1, setZ1] = useState(1.2);
  const [z2, setZ2] = useState(-0.8);
  const [zA, setZA] = useState<[number, number]>([-1.8, -1.8]);
  const [zB, setZB] = useState<[number, number]>([1.8, 1.8]);
  const [alpha, setAlpha] = useState(0.5);
  const [interp, setInterp] = useState(false);

  const effZ: [number, number] = interp
    ? [zA[0] + (zB[0] - zA[0]) * alpha, zA[1] + (zB[1] - zA[1]) * alpha]
    : [z1, z2];
  const grid = decodeGrid(effZ[0], effZ[1]);

  const sample = () => {
    const rng = mulberry32(Math.floor(Math.random() * 1e9));
    setInterp(false);
    setZ1(Math.max(-3, Math.min(3, randn(rng))));
    setZ2(Math.max(-3, Math.min(3, randn(rng))));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      {/* controls */}
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Latent coordinates (toy decoder)
        </p>
        <SliderRow label="z₁" value={z1} min={-3} max={3} onChange={setZ1} accent="#8b5cf6" />
        <SliderRow label="z₂" value={z2} min={-3} max={3} onChange={setZ2} accent="#8b5cf6" />
        <Button size="sm" className="h-11 w-full" onClick={sample}>
          <Dices className="h-3.5 w-3.5" /> Sample z ~ N(0, I)
        </Button>

        <div className="mt-3 space-y-2 rounded-lg bg-background p-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground">
              <MoveHorizontal className="h-3.5 w-3.5" /> Interpolate A → B
            </span>
            <Switch checked={interp} onCheckedChange={setInterp} aria-label="Toggle latent interpolation" />
          </div>
          <div className={interp ? "" : "pointer-events-none opacity-40"}>
            <div className="flex min-h-11 items-center gap-3">
              <span className="w-10 shrink-0 font-mono text-xs text-muted-foreground">α</span>
              <Slider value={[alpha]} min={0} max={1} step={0.01} onValueChange={(v) => setAlpha(v[0])} className="h-11 flex-1" aria-label="Interpolation amount" />
              <span className="w-10 shrink-0 text-right font-mono text-xs font-semibold text-foreground">{f2(alpha)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-11"
                onClick={() => setZA([effZ[0], effZ[1]])}
                title="Store the current z as endpoint A"
              >
                Capture A
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-11"
                onClick={() => setZB([effZ[0], effZ[1]])}
                title="Store the current z as endpoint B"
              >
                Capture B
              </Button>
            </div>
          </div>
          <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
            A = ({f2(zA[0])}, {f2(zA[1])}) → B = ({f2(zB[0])}, {f2(zB[1])})
          </p>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <Stat label="z₁ (effective)" value={f2(effZ[0])} tone="accent" />
          <Stat label="z₂ (effective)" value={f2(effZ[1])} tone="accent" />
        </div>
      </div>

      {/* generated pattern */}
      <div className="min-w-0 space-y-3">
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            x̂ = decoder(z) — an 8×8 &ldquo;digit-like&rdquo; pattern (bowl, stem and crossbar move smoothly with z)
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <svg viewBox="0 0 216 216" className="h-auto w-full max-w-[240px]" role="img" aria-label="Decoded pattern">
              <rect x={0} y={0} width={216} height={216} rx={10} className="fill-background" stroke="currentColor" strokeOpacity={0.15} />
              {grid.map((row, r) =>
                row.map((v, c) => (
                  <rect
                    key={`${r}-${c}`}
                    x={6 + c * 25.5}
                    y={6 + r * 25.5}
                    width={24}
                    height={24}
                    rx={3}
                    fill="#8b5cf6"
                    fillOpacity={0.06 + 0.92 * v}
                  />
                ))
              )}
            </svg>
            <div className="flex-1 space-y-2 text-[11px] leading-relaxed text-muted-foreground">
              <p>
                <span className="font-semibold text-foreground">Why this works:</span> the VAE prior p(z) = N(0, I)
                assigns density to <em>every</em> corner of the latent space, and the KL term pulls the encoder&rsquo;s
                q(z|x) to cover it — so the decoder is trained on a dense, smooth set of z values.
              </p>
              <p>
                <span className="font-semibold text-foreground">Try it:</span> sample a few random z, then switch on
                interpolation and sweep α from 0 to 1 — every intermediate pattern is plausible. A plain autoencoder has
                no such guarantee: its latent space can contain untrained &ldquo;holes&rdquo; that decode to garbage.
              </p>
              <p>
                This is exactly what &ldquo;generation with smooth latent space&rdquo; means in the model comparison
                table: brand-new z values and interpolations between data points all decode to realistic samples.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */

export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "Variational Autoencoder Lab"}
      description={description ?? "z = μ + σ⊙ε makes sampling differentiable; the KL term charges for straying from the prior N(0,1)."}
      accent="u4"
    >
      <Tabs defaultValue="reparam">
        <TabsList className="h-11 w-full sm:w-auto">
          <TabsTrigger value="reparam" className="px-4">
            <Sparkles className="h-3.5 w-3.5" /> Reparameterization &amp; KL
          </TabsTrigger>
          <TabsTrigger value="decode" className="px-4">
            Decode the latent space
          </TabsTrigger>
        </TabsList>
        <TabsContent value="reparam" className="mt-3">
          <ReparamTab />
        </TabsContent>
        <TabsContent value="decode" className="mt-3">
          <DecodeTab />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}
