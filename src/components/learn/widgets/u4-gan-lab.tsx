"use client";

import { useEffect, useMemo, useState } from "react";
import { WidgetFrame, Stat, WidgetControls, PlayButton } from "./frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, Calculator, Crosshair, Gamepad2, RotateCcw, Scale } from "lucide-react";

/* ---------------- helpers ---------------- */

const ln = Math.log;
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
/* TAB A — Loss calculator (notes Example 4.1)                        */
/* ================================================================== */

function LossTab() {
  const [dx, setDx] = useState(0.7);
  const [dg, setDg] = useState(0.4);

  const lnx = ln(dx);
  const ln1mg = ln(1 - dg);
  const ld = -(lnx + ln1mg);
  const lg = -ln(dg);

  const gradOrig = 1 / (1 - 0.2);
  const gradNonSat = 1 / 0.2;

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Discriminator readouts (one real + one fake sample)
        </p>
        <SliderRow label="D(x)" value={dx} min={0.01} max={0.99} onChange={setDx} accent="#10b981" />
        <SliderRow label="D(G(z))" value={dg} min={0.01} max={0.99} onChange={setDg} accent="#f43f5e" />
        <div className="space-y-2 pt-2">
          <div>
            <p className="mb-1 font-mono text-[10px] text-muted-foreground">D on the real sample</p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${dx * 100}%` }} />
            </div>
          </div>
          <div>
            <p className="mb-1 font-mono text-[10px] text-muted-foreground">D on the fake sample</p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-rose-500 transition-all" style={{ width: `${dg * 100}%` }} />
            </div>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="mt-2 h-9 w-full text-xs" onClick={() => { setDx(0.7); setDg(0.4); }}>
          Reset to notes values (0.7, 0.4)
        </Button>
      </div>

      <div className="min-w-0 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <Scale className="h-3.5 w-3.5" /> Discriminator loss (D wants this LOW)
            </p>
            <p className="mt-2 break-words font-mono text-xs text-foreground">
              L<sub>D</sub> = −[ log D(x) + log(1−D(G(z))) ]
            </p>
            <p className="mt-1 break-words font-mono text-xs text-muted-foreground">
              = −[ ({f4(lnx)}) + ({f4(ln1mg)}) ]
            </p>
            <p className="mt-2 font-mono text-lg font-bold text-foreground">{f4(ld)}</p>
          </div>
          <div className="rounded-xl border bg-muted/30 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
              <Scale className="h-3.5 w-3.5" /> Generator loss, non-saturating (G wants this LOW)
            </p>
            <p className="mt-2 break-words font-mono text-xs text-foreground">L<sub>G</sub> = − log D(G(z))</p>
            <p className="mt-1 break-words font-mono text-xs text-muted-foreground">= −({f4(ln(dg))})</p>
            <p className="mt-2 font-mono text-lg font-bold text-foreground">{f4(lg)}</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Stat label="log D(x) — D's confidence on real" value={f4(lnx)} tone="default" />
          <Stat label="log(1−D(G(z))) — D's confidence fake is fake" value={f4(ln1mg)} tone="default" />
        </div>

        {/* vanishing gradient note */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <AlertTriangle className="h-3.5 w-3.5" /> Why the non-saturating loss? Gradient check at s = D(G(z)) = 0.2
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-background p-2.5">
              <p className="font-mono text-[11px] text-muted-foreground">Original: d/ds log(1−s) = −1/(1−s)</p>
              <p className="mt-0.5 font-mono text-xs font-semibold text-foreground">|−1/0.8| = {f2(gradOrig)}</p>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-muted-foreground/60" style={{ width: `${(gradOrig / gradNonSat) * 100}%` }} />
              </div>
            </div>
            <div className="rounded-lg bg-background p-2.5">
              <p className="font-mono text-[11px] text-muted-foreground">Non-saturating: d/ds (−log s) = −1/s</p>
              <p className="mt-0.5 font-mono text-xs font-semibold text-foreground">|−1/0.2| = {f2(gradNonSat)}</p>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: "100%" }} />
              </div>
            </div>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
            The non-saturating gradient ({f2(gradNonSat)}) is 4× larger in magnitude exactly when G is performing badly —
            it gives a much stronger learning signal precisely when G needs it most. That is why in practice G is trained
            to maximise log D(G(z)) instead of minimising log(1−D(G(z))).
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* TAB B — Optimal discriminator D*(x)                                */
/* ================================================================== */

const B_LO = -1;
const B_HI = 7;
const B_N = 200;

function OptimalTab() {
  const [muG, setMuG] = useState(1.2);
  const [sgG, setSgG] = useState(1.0);

  const pd = (x: number) => pdf(x, 3, 1);
  const pg = (x: number) => pdf(x, muG, sgG);
  const dstar = (x: number) => {
    const a = pd(x);
    const b = pg(x);
    return a + b < 1e-12 ? 0.5 : a / (a + b);
  };

  let maxDev = 0;
  for (let i = 0; i <= 100; i++) {
    const x = B_LO + ((B_HI - B_LO) * i) / 100;
    maxDev = Math.max(maxDev, Math.abs(dstar(x) - 0.5));
  }
  const atEquilibrium = maxDev < 0.05;

  const ymax = Math.max(0.45, 1 / (sgG * Math.sqrt(2 * Math.PI)), pd(3));

  const PW = 460;
  const DH = 130; // density plot height
  const SH = 78; // D* plot height
  const sx = (x: number) => ((x - B_LO) / (B_HI - B_LO)) * PW;
  const dy = (y: number) => DH - Math.min(1, y / ymax) * (DH - 8) - 4;
  const sy = (d: number) => SH - d * (SH - 10) - 5;

  const path = (f: (x: number) => number) => {
    const pts: string[] = [];
    for (let i = 0; i <= B_N; i++) {
      const x = B_LO + ((B_HI - B_LO) * i) / B_N;
      pts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${dy(f(x)).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const dPath = () => {
    const pts: string[] = [];
    for (let i = 0; i <= B_N; i++) {
      const x = B_LO + ((B_HI - B_LO) * i) / B_N;
      pts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(dstar(x)).toFixed(1)}`);
    }
    return pts.join(" ");
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Generator distribution p_g(x)
        </p>
        <SliderRow label="μ_g" value={muG} min={0} max={6} onChange={setMuG} accent="#f43f5e" />
        <SliderRow label="σ_g" value={sgG} min={0.5} max={2} onChange={setSgG} accent="#f43f5e" />
        <p className="pt-1 font-mono text-[10px] leading-relaxed text-muted-foreground">p_data(x) = N(3, 1) — fixed</p>
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Stat label="max |D* − 0.5|" value={f4(maxDev)} tone={atEquilibrium ? "good" : "default"} />
          <Stat label="D*(μ_g)" value={f4(dstar(muG))} tone="accent" />
        </div>
        <Button variant="ghost" size="sm" className="mt-2 h-9 w-full text-xs" onClick={() => { setMuG(1.2); setSgG(1.0); }}>
          Reset (μ_g = 1.2, σ_g = 1.0)
        </Button>
        <div className="mt-3 rounded-lg bg-background p-2.5">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Derivation:</span> for fixed x, V(D,G) contains
            f(y) = a·log y + b·log(1−y) with a = p_data(x), b = p_g(x). Setting df/dy = 0 gives y = a/(a+b):
          </p>
          <p className="mt-1.5 break-words font-mono text-xs text-foreground">D*(x) = p_data / (p_data + p_g)</p>
        </div>
      </div>

      <div className="min-w-0 space-y-3">
        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              The two distributions
            </p>
            <div className="flex gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" /> p_data
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-rose-500" /> p_g
              </span>
            </div>
          </div>
          <svg viewBox={`0 0 ${PW} ${DH + 18}`} className="h-auto w-full" role="img" aria-label="Data and generator distributions">
            <line x1={0} y1={DH - 4} x2={PW} y2={DH - 4} className="stroke-border" strokeWidth={1.2} />
            <path d={path(pg)} fill="none" stroke="#f43f5e" strokeWidth={2.2} />
            <path d={path(pd)} fill="none" stroke="#10b981" strokeWidth={2.2} strokeDasharray="6 3" />
            <line x1={sx(3)} y1={10} x2={sx(3)} y2={DH - 4} stroke="#10b981" strokeWidth={1} strokeDasharray="2 3" strokeOpacity={0.6} />
            <line x1={sx(muG)} y1={10} x2={sx(muG)} y2={DH - 4} stroke="#f43f5e" strokeWidth={1} strokeDasharray="2 3" strokeOpacity={0.6} />
            <text x={sx(3)} y={DH + 12} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground font-mono">
              3
            </text>
            <text x={sx(muG)} y={DH + 12} textAnchor="middle" fontSize={9.5} className="fill-muted-foreground font-mono">
              μ_g
            </text>
          </svg>
        </div>

        <div className="rounded-xl border bg-muted/20 p-3">
          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Optimal discriminator D*(x) = p_data/(p_data + p_g)
            </p>
            {atEquilibrium && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <Crosshair className="h-3 w-3" /> Nash equilibrium: D can only guess a coin flip
              </span>
            )}
          </div>
          <svg viewBox={`0 0 ${PW} ${SH + 18}`} className="h-auto w-full" role="img" aria-label="Optimal discriminator curve">
            {/* region where D* < 0.5 — where fakes get caught */}
            {Array.from({ length: B_N }, (_, i) => {
              const x0 = B_LO + ((B_HI - B_LO) * i) / B_N;
              const d = dstar(x0);
              if (d >= 0.5) return null;
              return (
                <rect
                  key={i}
                  x={sx(x0)}
                  y={sy(0.5)}
                  width={PW / B_N + 0.6}
                  height={sy(d) - sy(0.5)}
                  fill="#f43f5e"
                  fillOpacity={0.12}
                />
              );
            })}
            <line x1={0} y1={sy(1)} x2={PW} y2={sy(1)} className="stroke-border" strokeWidth={1} />
            <line x1={0} y1={sy(0.5)} x2={PW} y2={sy(0.5)} className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.6} />
            <line x1={0} y1={sy(0)} x2={PW} y2={sy(0)} className="stroke-border" strokeWidth={1.2} />
            <path d={dPath()} fill="none" stroke="#8b5cf6" strokeWidth={2.4} />
            <text x={4} y={sy(1) - 3} fontSize={9} className="fill-muted-foreground font-mono">
              1.0
            </text>
            <text x={4} y={sy(0.5) - 3} fontSize={9} className="fill-muted-foreground font-mono">
              0.5
            </text>
            <text x={4} y={sy(0) - 3} fontSize={9} className="fill-muted-foreground font-mono">
              0.0
            </text>
            {/* G's update direction */}
            <line
              x1={sx(muG)}
              y1={sy(dstar(muG)) - 8}
              x2={sx(muG + 0.85)}
              y2={sy(dstar(muG)) - 8}
              stroke="#f43f5e"
              strokeWidth={2}
              markerEnd="url(#gan-arrow-b)"
            />
            <text x={sx(muG) + 4} y={sy(dstar(muG)) - 14} fontSize={9.5} className="fill-rose-600 dark:fill-rose-400 font-mono">
              G moves this way
            </text>
            <defs>
              <marker id="gan-arrow-b" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" fill="#f43f5e" />
              </marker>
            </defs>
          </svg>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">What G sees:</span> in the rose region D*(x) &lt; 0.5, so
            generated samples there get labelled &ldquo;fake&rdquo;. G&rsquo;s gradient pushes p_g toward the data until
            the rose region vanishes — at p_g = p_data, D* = 0.5 everywhere and the best possible discriminator can do no
            better than a coin flip.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* TAB C — Training game (simulated 1-D GAN)                          */
/* ================================================================== */

type GameRound = { round: number; ld: number; lg: number };

function GameTab() {
  const [round, setRound] = useState(0);
  const [muG, setMuG] = useState(0.6);
  const [sgG, setSgG] = useState(0.9);
  const [history, setHistory] = useState<GameRound[]>([]);
  const [playing, setPlaying] = useState(false);
  const [collapse, setCollapse] = useState(false);

  const real = useMemo(() => {
    const rng = mulberry32(99);
    return Array.from({ length: 36 }, () => 3 + randn(rng));
  }, []);

  const fakes = useMemo(() => {
    const rng = mulberry32(5000 + round * 977);
    return Array.from({ length: 24 }, () => muG + sgG * randn(rng));
  }, [round, muG, sgG]);

  const pd = (x: number) => pdf(x, 3, 1);
  const pg = (x: number) => pdf(x, muG, sgG);
  const dstar = (x: number) => {
    const a = pd(x);
    const b = pg(x);
    return a + b < 1e-12 ? 0.5 : a / (a + b);
  };

  const ld = (() => {
    const d = (x: number) => {
      const a = pd(x);
      const b = pg(x);
      return a + b < 1e-12 ? 0.5 : a / (a + b);
    };
    const mReal = real.reduce((s, x) => s + ln(Math.max(1e-9, d(x))), 0) / real.length;
    const mFake = fakes.reduce((s, x) => s + ln(Math.max(1e-9, 1 - d(x))), 0) / fakes.length;
    return -(mReal + mFake);
  })();
  const lg = (() => {
    const d = (x: number) => {
      const a = pd(x);
      const b = pg(x);
      return a + b < 1e-12 ? 0.5 : a / (a + b);
    };
    return -fakes.reduce((s, x) => s + ln(Math.max(1e-9, d(x))), 0) / fakes.length;
  })();

  const stepRound = () => {
    const rng = mulberry32(7000 + round * 131);
    let nMu = muG + 0.16 * (3 - muG) + 0.05 * randn(rng);
    let nSg = sgG;
    if (collapse) {
      nSg = Math.max(0.1, sgG * 0.8);
      nMu += 0.09 * (2.35 - muG); // drift to a single point that still partly fools D
    }
    nMu = Math.max(-0.5, Math.min(6, nMu));
    setMuG(nMu);
    setSgG(nSg);
    setRound((r) => r + 1);
    setHistory((h) => [...h.slice(-59), { round: round + 1, ld, lg }]);
  };

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(stepRound, 480);
    return () => window.clearInterval(id);
  });

  const reset = () => {
    setPlaying(false);
    setRound(0);
    setMuG(0.6);
    setSgG(0.9);
    setHistory([]);
  };

  /* plot geometry */
  const PW = 460;
  const PH = 250;
  const C_LO = -1.5;
  const C_HI = 7.5;
  const sx = (x: number) => ((x - C_LO) / (C_HI - C_LO)) * PW;
  const dyOf = (d: number) => 26 + (1 - d) * 86; // D curve band: y 26..112
  const dPath = () => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i++) {
      const x = C_LO + ((C_HI - C_LO) * i) / 160;
      pts.push(`${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${dyOf(dstar(x)).toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const fakeRng = mulberry32(5000 + round * 977); // same seed as fakes → same jitter
  const fakeJit = fakes.map((_, i) => (fakeRng() - 0.5) * 30);
  const realRng = mulberry32(99 + 1);
  const realJit = real.map(() => 135 + (realRng() - 0.5) * 80);

  const sparkW = 220;
  const sparkH = 54;
  const spark = (key: "ld" | "lg") => {
    const pts = history.slice(-40);
    if (pts.length < 2) return "";
    const maxV = 3;
    return pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${((i / (pts.length - 1)) * sparkW).toFixed(1)},${(sparkH - (Math.min(maxV, p[key]) / maxV) * (sparkH - 6) - 3).toFixed(1)}`)
      .join(" ");
  };

  return (
    <div className="space-y-4">
      <WidgetControls>
        <div className="flex min-h-11 items-center">
          <PlayButton playing={playing} label="Train GAN" onClick={() => setPlaying((p) => !p)} />
        </div>
        <Button variant="outline" size="sm" className="h-11" onClick={stepRound} disabled={playing}>
          Step 1 round
        </Button>
        <Button variant="outline" size="sm" className="h-11" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
        <div className="flex min-h-11 items-center gap-2 rounded-lg bg-background px-3">
          <Switch checked={collapse} onCheckedChange={setCollapse} aria-label="Toggle mode collapse" />
          <span className="text-xs font-medium text-foreground">Mode collapse</span>
        </div>
        <div className="ml-auto flex gap-2">
          <Stat label="Round" value={round} />
          <Stat label="μ_G" value={f2(muG)} />
          <Stat label="σ_G" value={f2(sgG)} tone={collapse ? "bad" : "default"} />
          <Stat label="L_D" value={f4(ld)} />
          <Stat label="L_G" value={f4(Math.min(lg, 99))} tone="accent" />
        </div>
      </WidgetControls>

      <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Real dots vs generated dots, with D*(x) responding every round
          </p>
          <svg viewBox={`0 0 ${PW} ${PH}`} className="h-auto w-full" role="img" aria-label="GAN training game">
            {/* D curve band */}
            <line x1={0} y1={dyOf(1)} x2={PW} y2={dyOf(1)} className="stroke-border" strokeWidth={1} />
            <line x1={0} y1={dyOf(0.5)} x2={PW} y2={dyOf(0.5)} className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="4 4" strokeOpacity={0.5} />
            <path d={dPath()} fill="none" stroke="#8b5cf6" strokeWidth={2.2} />
            <text x={4} y={dyOf(1) + 11} fontSize={9} className="fill-muted-foreground font-mono">
              D*(x)
            </text>
            <text x={4} y={dyOf(0.5) - 4} fontSize={9} className="fill-muted-foreground font-mono">
              0.5
            </text>
            {/* data band divider */}
            <line x1={0} y1={122} x2={PW} y2={122} className="stroke-border" strokeWidth={1} strokeDasharray="2 4" />
            {/* real samples */}
            {real.map((x, i) => (
              <circle key={`r${i}`} cx={sx(x)} cy={realJit[i] + 55} r={2.6} fill="#10b981" fillOpacity={0.75} />
            ))}
            {/* fake samples */}
            {fakes.map((x, i) => (
              <circle key={`f${i}`} cx={sx(x)} cy={190 + fakeJit[i] * 0.9} r={3} fill="#f43f5e" fillOpacity={0.8} />
            ))}
            {/* mean markers */}
            <path d={`M${sx(3)},${240} l-5,9 l10,0 z`} fill="#10b981" />
            <path d={`M${sx(muG)},${240} l-5,9 l10,0 z`} fill="#f43f5e" />
            <text x={sx(3)} y={236} textAnchor="middle" fontSize={9} className="fill-muted-foreground font-mono">
              μ_data=3
            </text>
            <text x={sx(muG)} y={236} textAnchor="middle" fontSize={9} className="fill-muted-foreground font-mono">
              μ_G
            </text>
          </svg>
          <div className="mt-1.5 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-emerald-500" /> real x ~ N(3, 1)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm bg-rose-500" /> fakes G(z) ~ N(μ_G, σ_G)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: "#8b5cf6" }} /> D*(x)
            </span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            Each round: G takes a gradient step (μ_G drifts toward the data 3), then D&rsquo;s optimal curve updates. Watch
            L<sub>D</sub> rise toward ln 4 ≈ 1.386 and L<sub>G</sub> toward ln 2 ≈ 0.693 as the game reaches its Nash
            equilibrium — exactly where D* flattens to 0.5.
          </p>
        </div>

        <div className="space-y-3">
          <div className="rounded-xl border bg-muted/20 p-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Loss history (last 40 rounds)
            </p>
            <svg viewBox={`0 0 ${sparkW} ${sparkH}`} className="h-auto w-full" role="img" aria-label="Loss history">
              <line x1={0} y1={sparkH - 3 - (1.386 / 3) * (sparkH - 6)} x2={sparkW} y2={sparkH - 3 - (1.386 / 3) * (sparkH - 6)} className="stroke-emerald-500" strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.6} />
              <path d={spark("lg")} fill="none" stroke="#f43f5e" strokeWidth={1.8} />
              <path d={spark("ld")} fill="none" stroke="#10b981" strokeWidth={1.8} />
            </svg>
            <div className="mt-1 flex gap-3 text-[10px] text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" /> L_D
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 rounded-sm bg-rose-500" /> L_G
              </span>
            </div>
          </div>

          {collapse ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" /> Mode collapse is happening
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                G discovered a narrow band of outputs that partly fools D and collapsed onto it: σ_G → 0.1, so every
                sample is nearly identical. The samples look individually plausible but are highly repetitive — the
                diversity of p_data is lost. Remedies: mini-batch discrimination, unrolled GANs, Wasserstein GAN (WGAN)
                with gradient penalty, feature matching.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border bg-muted/20 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Gamepad2 className="h-3.5 w-3.5" /> The game so far
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                Early on, D confidently separates the two dot clouds (sharp D* curve, low L_D, high L_G). As G improves,
                D&rsquo;s edge melts away. Because this is a minimax game — not a single loss being minimised — training
                can also oscillate rather than converge (training instability).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */

export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "GAN Lab"}
      description={description ?? "Two players, one minimax game: D learns to tell real from fake, G learns to fool D — no labels required."}
      accent="u4"
    >
      <Tabs defaultValue="loss">
        <TabsList className="h-11 w-full sm:w-auto">
          <TabsTrigger value="loss" className="px-3">
            <Calculator className="h-3.5 w-3.5" /> Loss calculator
          </TabsTrigger>
          <TabsTrigger value="optimal" className="px-3">
            Optimal discriminator
          </TabsTrigger>
          <TabsTrigger value="game" className="px-3">
            <Gamepad2 className="h-3.5 w-3.5" /> Training game
          </TabsTrigger>
        </TabsList>
        <TabsContent value="loss" className="mt-3">
          <LossTab />
        </TabsContent>
        <TabsContent value="optimal" className="mt-3">
          <OptimalTab />
        </TabsContent>
        <TabsContent value="game" className="mt-3">
          <GameTab />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}
