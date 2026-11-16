"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Dices } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { WidgetFrame, Stat, WidgetControls } from "./frame";
import { cn } from "@/lib/utils";

type Method = "zero" | "random" | "xavier" | "he";
type Activation = "tanh" | "relu";

const SIM_WIDTH = 128; // simulation layer width (fixed)
const METHODS: { id: Method; label: string; formula: string }[] = [
  { id: "zero", label: "Zero", formula: "std = 0" },
  { id: "random", label: "Random (std = 1)", formula: "std = 1 (fixed)" },
  { id: "xavier", label: "Xavier", formula: "std = √(1/n_in)" },
  { id: "he", label: "He", formula: "std = √(2/n_in)" },
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function randn(rng: () => number) {
  const u = Math.max(1e-12, rng());
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const std = (arr: number[]) => {
  const m = arr.reduce((a, b) => a + b, 0) / arr.length;
  return Math.sqrt(arr.reduce((a, b) => a + (b - m) * (b - m), 0) / arr.length);
};

function simulate(method: Method, activation: Activation, L: number, seed: number) {
  const rng = mulberry32(seed);
  const width = SIM_WIDTH;
  const initStd =
    method === "zero" ? 0 : method === "random" ? 1 : method === "xavier" ? Math.sqrt(1 / width) : Math.sqrt(2 / width);
  const act = (z: number) => (activation === "tanh" ? Math.tanh(z) : Math.max(0, z));
  const actPrime = (z: number) => (activation === "tanh" ? 1 - Math.tanh(z) * Math.tanh(z) : z > 0 ? 1 : 0);

  // forward
  let h = Array.from({ length: width }, () => randn(rng));
  const actStd = [std(h)];
  const weights: number[][][] = [];
  const zs: number[][] = [];
  for (let l = 0; l < L; l++) {
    const w: number[][] = [];
    for (let i = 0; i < width; i++) {
      const row: number[] = [];
      for (let j = 0; j < width; j++) row.push(method === "zero" ? 0 : initStd * randn(rng));
      w.push(row);
    }
    weights.push(w);
    const z = new Array<number>(width);
    for (let i = 0; i < width; i++) {
      let s = 0;
      for (let j = 0; j < width; j++) s += w[i][j] * h[j];
      z[i] = s;
    }
    zs.push(z);
    h = z.map(act);
    actStd.push(std(h));
  }

  // backward (gradient of a random scalar loss direction)
  let g = Array.from({ length: width }, () => randn(rng));
  const gradStd = new Array<number>(L + 1).fill(0);
  gradStd[L] = std(g);
  for (let l = L - 1; l >= 0; l--) {
    const gz = g.map((gv, i) => gv * actPrime(zs[l][i]));
    const gNew = new Array<number>(width).fill(0);
    for (let i = 0; i < width; i++) {
      const gzi = gz[i];
      if (gzi === 0) continue;
      const wRow = weights[l][i];
      for (let j = 0; j < width; j++) gNew[j] += wRow[j] * gzi;
    }
    g = gNew;
    gradStd[l] = std(g);
  }

  const data = actStd.map((v, i) => ({
    layer: i,
    act: Math.max(v, 1e-9),
    grad: Math.max(gradStd[i], 1e-9),
  }));
  return { data, finalAct: actStd[L], finalGrad: gradStd[0] };
}

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [method, setMethod] = useState<Method>("xavier");
  const [activation, setActivation] = useState<Activation>("tanh");
  const [L, setL] = useState(10);
  const [nin, setNin] = useState(256);
  const [seed, setSeed] = useState(42);

  const { data, finalAct, finalGrad } = useMemo(() => simulate(method, activation, L, seed), [method, activation, L, seed]);

  const xavierStd = Math.sqrt(1 / nin);
  const heStd = Math.sqrt(2 / nin);

  const verdict =
    method === "zero"
      ? { text: "symmetry problem — the layer behaves like a single neuron", tone: "bad" as const }
      : finalAct > 100
        ? { text: "activations explode with depth", tone: "bad" as const }
        : finalGrad > 100
          ? { text: "gradients explode with depth", tone: "bad" as const }
          : finalAct < 0.1
            ? { text: "activations shrink toward zero (slowly vanishing)", tone: "bad" as const }
            : finalGrad < 1e-3
              ? { text: "gradients vanish (units saturate)", tone: "bad" as const }
              : { text: "signal stays stable across layers", tone: "good" as const };

  const fmtSci = (v: number) =>
    v >= 1000 || (v < 0.01 && v > 0) ? v.toExponential(1) : v.toFixed(3);

  return (
    <WidgetFrame
      title={title ?? "Weight initialization explorer"}
      description={description ?? "Feed a signal through L layers and watch activation / gradient statistics survive, explode or vanish depending on the init."}
    >
      <WidgetControls className="mb-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium">Initialization</span>
          <div className="flex flex-wrap gap-1">
            {METHODS.map((m) => (
              <Button
                key={m.id}
                size="sm"
                variant={method === m.id ? "default" : "outline"}
                onClick={() => setMethod(m.id)}
                className="h-9"
              >
                {m.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium">Activation</span>
          <div className="flex gap-1">
            {(["tanh", "relu"] as Activation[]).map((a) => (
              <Button
                key={a}
                size="sm"
                variant={activation === a ? "default" : "outline"}
                onClick={() => setActivation(a)}
                className="h-9"
              >
                {a === "tanh" ? "tanh" : "ReLU"}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex min-w-[140px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Layers L</span>
            <span className="font-mono text-xs text-primary">{L}</span>
          </label>
          <Slider value={[L]} onValueChange={(v) => setL(v[0])} min={5} max={20} step={1} aria-label="Number of layers" />
        </div>
        <div className="flex min-w-[160px] flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>n_in (fan-in, for the std formula)</span>
            <span className="font-mono text-xs text-primary">{nin}</span>
          </label>
          <Slider value={[nin]} onValueChange={(v) => setNin(v[0])} min={64} max={512} step={32} aria-label="n_in" />
        </div>
        <Button size="sm" variant="secondary" className="h-9" onClick={() => setSeed((s) => s + 1)}>
          <Dices className="mr-1 h-3.5 w-3.5" /> Resample
        </Button>
      </WidgetControls>

      {/* Formula / worked example */}
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border bg-muted/40 p-3">
          <p className="mb-1.5 text-xs font-semibold">Example 6.1 — std for n_in = {nin}</p>
          <p className="font-mono text-[11px] leading-relaxed">
            Xavier: std = √(1/{nin}) = √{(1 / nin).toFixed(6)} = <span className="font-bold text-primary">{xavierStd.toFixed(4)}</span>
          </p>
          <p className="font-mono text-[11px] leading-relaxed">
            He: std = √(2/{nin}) = √{(2 / nin).toFixed(6)} ≈ <span className="font-bold text-primary">{heStd.toFixed(4)}</span>
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            He is √2 ≈ 1.41x larger, compensating for ReLU zeroing about half the units. Xavier pairs with tanh/sigmoid;
            He pairs with ReLU.
          </p>
        </div>
        <div className="flex flex-col justify-between gap-2 rounded-xl border p-3">
          <p className="text-xs font-semibold">
            Current method: <span className="text-primary">{METHODS.find((m) => m.id === method)?.label}</span> —{" "}
            <span className="font-mono text-[11px]">{METHODS.find((m) => m.id === method)?.formula}</span>
          </p>
          <p
            className={cn(
              "rounded-lg px-2.5 py-1.5 text-xs font-semibold",
              verdict.tone === "good"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-destructive/10 text-destructive"
            )}
          >
            verdict: {verdict.text}
          </p>
          <p className="text-[10px] text-muted-foreground">
            simulation: {L} layers of width {SIM_WIDTH}, standard-normal input; gradient = backpropagated random
            direction. Log-scale chart (floor 1e-9).
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="layer"
              tick={{ fontSize: 11 }}
              label={{ value: "layer", position: "insideBottomRight", offset: -2, fontSize: 11 }}
            />
            <YAxis
              scale="log"
              domain={[1e-9, "auto"]}
              allowDataOverflow
              tickFormatter={(v: number) => v.toExponential(0)}
              tick={{ fontSize: 10 }}
              width={54}
              label={{ value: "std (log)", angle: -90, position: "insideLeft", fontSize: 11 }}
            />
            <Tooltip
              formatter={(value: number | string) => (typeof value === "number" ? fmtSci(value) : value)}
              labelFormatter={(l) => `layer ${l}`}
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="act" name="activation std" stroke="hsl(160 84% 39%)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="grad" name="gradient std" stroke="hsl(350 89% 60%)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Zero-init warning */}
      {method === "zero" && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs leading-relaxed">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>
            <span className="font-semibold">Symmetry problem:</span> every neuron in a layer starts identical, computes
            the same output, receives the same gradient during backprop, and updates identically forever — the layer can
            never break symmetry, so it behaves like a single neuron no matter how many it actually has.
          </p>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="Layers L" value={L} />
        <Stat label="Sim layer width" value={SIM_WIDTH} />
        <Stat label="Final activation std" value={fmtSci(finalAct)} tone={finalAct > 100 || finalAct < 1e-2 ? "bad" : "good"} />
        <Stat label="Final gradient std" value={fmtSci(finalGrad)} tone={finalGrad < 1e-3 ? "bad" : "good"} />
      </div>
    </WidgetFrame>
  );
}
