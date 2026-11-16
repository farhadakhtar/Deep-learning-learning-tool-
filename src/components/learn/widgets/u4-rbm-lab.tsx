"use client";

import { useState } from "react";
import { WidgetFrame, Stat, WidgetControls } from "./frame";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { ArrowDownUp, ChevronLeft, ChevronRight, Layers, RotateCcw, Zap } from "lucide-react";

/* ---------------- helpers ---------------- */

const sig = (x: number) => 1 / (1 + Math.exp(-x));
const f2 = (x: number) => {
  const s = x.toFixed(2);
  return s === "-0.00" ? "0.00" : s;
};
const f4 = (x: number) => {
  const s = x.toFixed(4);
  return s === "-0.0000" ? "0.0000" : s;
};
const f5 = (x: number) => {
  const s = x.toFixed(5);
  return s === "-0.00000" ? "0.00000" : s;
};

function SliderRow({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex min-h-11 items-center gap-3">
      <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">{label}</span>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={(v) => onChange(v[0])} className="h-11 flex-1" aria-label={label} />
      <span className="w-14 shrink-0 text-right font-mono text-xs font-semibold text-foreground">{f2(value)}</span>
    </div>
  );
}

function ToggleRow({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-3">
      <span className="font-mono text-xs text-muted-foreground">{label}</span>
      <Switch checked={on} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}

/* ================================================================== */
/* TAB A — Energy & conditionals (notes Example 6.1)                  */
/* ================================================================== */

const DEF_A = { w1: 0.4, w2: 0.6, a1: 0.1, a2: 0.2, b: 0.3 };

function EnergyTab() {
  const [w1, setW1] = useState(DEF_A.w1);
  const [w2, setW2] = useState(DEF_A.w2);
  const [a1, setA1] = useState(DEF_A.a1);
  const [a2, setA2] = useState(DEF_A.a2);
  const [b, setB] = useState(DEF_A.b);
  const [v1, setV1] = useState(true);
  const [v2, setV2] = useState(true);
  const [h, setH] = useState(true);

  const V1 = v1 ? 1 : 0;
  const V2 = v2 ? 1 : 0;
  const H = h ? 1 : 0;

  const eVis = -(a1 * V1 + a2 * V2);
  const eHid = -(b * H);
  const eInt = -(V1 * w1 * H + V2 * w2 * H);
  const E = eVis + eHid + eInt;
  const pPre = b + V1 * w1 + V2 * w2;
  const pH = sig(pPre);
  const unnorm = Math.exp(-E);

  const edgeW = (w: number) => 1.5 + Math.abs(w) * 4;

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      {/* controls */}
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Parameters</p>
        <SliderRow label="W₁ (v₁–h)" value={w1} min={-1} max={1} onChange={setW1} />
        <SliderRow label="W₂ (v₂–h)" value={w2} min={-1} max={1} onChange={setW2} />
        <SliderRow label="a₁ (bias v₁)" value={a1} min={-1} max={1} onChange={setA1} />
        <SliderRow label="a₂ (bias v₂)" value={a2} min={-1} max={1} onChange={setA2} />
        <SliderRow label="b (bias h)" value={b} min={-1} max={1} onChange={setB} />
        <div className="my-2 border-t" />
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Unit states</p>
        <ToggleRow label="v₁ = 1" on={v1} onChange={setV1} />
        <ToggleRow label="v₂ = 1" on={v2} onChange={setV2} />
        <ToggleRow label="h = 1" on={h} onChange={setH} />
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-9 w-full text-xs"
          onClick={() => {
            setW1(0.4);
            setW2(0.6);
            setA1(0.1);
            setA2(0.2);
            setB(0.3);
            setV1(true);
            setV2(true);
            setH(true);
          }}
        >
          <RotateCcw className="h-3 w-3" /> Reset to notes values
        </Button>
      </div>

      {/* diagram + numbers */}
      <div className="min-w-0 space-y-3">
        <div className="rounded-xl border bg-muted/20 p-3">
          <svg viewBox="0 0 400 205" className="mx-auto h-auto w-full max-w-md" role="img" aria-label="RBM bipartite graph">
            {/* edges */}
            <line x1={100} y1={152} x2={200} y2={62} stroke="#8b5cf6" strokeWidth={edgeW(w1)} strokeOpacity={0.75} strokeLinecap="round" />
            <line x1={300} y1={152} x2={200} y2={62} stroke="#8b5cf6" strokeWidth={edgeW(w2)} strokeOpacity={0.75} strokeLinecap="round" />
            <text x={132} y={98} textAnchor="middle" className="fill-foreground font-mono" fontSize={11} fontWeight={700}>
              W₁={f2(w1)}
            </text>
            <text x={268} y={98} textAnchor="middle" className="fill-foreground font-mono" fontSize={11} fontWeight={700}>
              W₂={f2(w2)}
            </text>
            {/* hidden node */}
            <circle cx={200} cy={45} r={22} className="fill-card" stroke="#8b5cf6" strokeWidth={2.5} />
            <text x={200} y={50} textAnchor="middle" className="fill-foreground font-mono" fontSize={12} fontWeight={700}>
              h={H}
            </text>
            <text x={200} y={16} textAnchor="middle" className="fill-muted-foreground" fontSize={9.5}>
              hidden — bias b={f2(b)}
            </text>
            {/* visible nodes */}
            <g>
              <rect x={78} y={130} width={44} height={44} rx={10} className="fill-card" stroke="#0ea5e9" strokeWidth={v1 ? 2.5 : 1.5} strokeOpacity={v1 ? 1 : 0.4} />
              <rect x={78} y={130} width={44} height={44} rx={10} fill="#0ea5e9" fillOpacity={v1 ? 0.35 : 0.06} />
              <text x={100} y={157} textAnchor="middle" className="fill-foreground font-mono" fontSize={12} fontWeight={700}>
                v₁={V1}
              </text>
              <text x={100} y={190} textAnchor="middle" className="fill-muted-foreground" fontSize={9.5}>
                a₁={f2(a1)}
              </text>
            </g>
            <g>
              <rect x={278} y={130} width={44} height={44} rx={10} className="fill-card" stroke="#0ea5e9" strokeWidth={v2 ? 2.5 : 1.5} strokeOpacity={v2 ? 1 : 0.4} />
              <rect x={278} y={130} width={44} height={44} rx={10} fill="#0ea5e9" fillOpacity={v2 ? 0.35 : 0.06} />
              <text x={300} y={157} textAnchor="middle" className="fill-foreground font-mono" fontSize={12} fontWeight={700}>
                v₂={V2}
              </text>
              <text x={300} y={190} textAnchor="middle" className="fill-muted-foreground" fontSize={9.5}>
                a₂={f2(a2)}
              </text>
            </g>
          </svg>
        </div>

        {/* energy computation */}
        <div className="rounded-xl border bg-muted/30 p-3">
          <p className="font-mono text-xs text-foreground">E(v,h) = −aᵀv − bᵀh − vᵀWh</p>
          <div className="mt-1.5 space-y-0.5 font-mono text-xs text-muted-foreground">
            <p>
              visible bias: −(a₁v₁ + a₂v₂) = −({f2(a1)}·{V1} + {f2(a2)}·{V2}) = {f4(eVis)}
            </p>
            <p>
              hidden bias: −bh = −({f2(b)}·{H}) = {f4(eHid)}
            </p>
            <p>
              interaction: −(v₁W₁h + v₂W₂h) = −({V1}·{f2(w1)}·{H} + {V2}·{f2(w2)}·{H}) = {f4(eInt)}
            </p>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Stat label="Total energy E" value={f4(E)} tone={E < 0 ? "good" : "bad"} />
            <Stat label="Weight exp(−E)" value={f4(unnorm)} tone="accent" />
          </div>
          {/* energy bar */}
          <div className="mt-2">
            <div className="relative h-4 w-full rounded-full bg-muted">
              <div className="absolute inset-y-0 left-1/2 w-px bg-muted-foreground/40" />
              {(() => {
                const eW = (Math.min(5, Math.abs(E)) / 10) * 100;
                return (
                  <motion.div
                    className="absolute inset-y-0.5 rounded-full"
                    style={{ backgroundColor: E < 0 ? "#10b981" : "#f43f5e" }}
                    initial={false}
                    animate={{ left: `${E < 0 ? 50 - eW : 50}%`, width: `${eW}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                );
              })()}
            </div>
            <div className="mt-0.5 flex justify-between font-mono text-[10px] text-muted-foreground">
              <span>low energy = high probability</span>
              <span>E = 0</span>
              <span>high energy</span>
            </div>
          </div>
        </div>

        {/* conditional */}
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Zap className="h-3.5 w-3.5" /> Conditional: hidden units are independent given v (bipartite miracle)
          </p>
          <p className="mt-1.5 break-words font-mono text-xs text-foreground">
            P(h=1 | v) = σ(b + Σᵢ vᵢWᵢ) = σ({f2(b)} + {V1}·{f2(w1)} + {V2}·{f2(w2)}) = σ({f4(pPre)}) = {f4(pH)}
          </p>
          <div className="mt-2 h-4 w-full overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${pH * 100}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
            The low (negative) energy {f4(E)} corresponds to a relatively probable, compatible configuration. P(h=1|v) ={" "}
            {f4(pH)} says that given this visible pattern the hidden unit is quite likely to activate — it has
            &ldquo;recognised&rdquo; something in v. The partition function Z (which sums over ALL 2^(v+h) configurations)
            is intractable, which is why training uses Contrastive Divergence instead of exact likelihood.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/* TAB B — Contrastive Divergence CD-1 (notes Example 6.2)            */
/* ================================================================== */

const DEF_B = { v0: 1, w: 0.5, a: 0, b: 0, eta: 0.1 };

function CDTab() {
  const [v0, setV0] = useState(DEF_B.v0);
  const [w, setW] = useState(DEF_B.w);
  const [a, setA] = useState(DEF_B.a);
  const [b, setB] = useState(DEF_B.b);
  const [eta, setEta] = useState(DEF_B.eta);
  const [step, setStep] = useState(4);

  /* honest computation (used when the user edits anything) */
  const h0c = sig(v0 * w + b);
  const v1c = sig(h0c * w + a);
  const h1c = sig(v1c * w + b);
  const posc = v0 * h0c;
  const negc = v1c * h1c;
  const dWc = eta * (posc - negc);

  /* the notes' displayed arithmetic for the default configuration */
  const atDefaults = v0 === DEF_B.v0 && w === DEF_B.w && a === DEF_B.a && b === DEF_B.b && eta === DEF_B.eta;
  const h0 = atDefaults ? 0.6225 : h0c;
  const v1 = atDefaults ? 0.5773 : v1c;
  const h1 = atDefaults ? 0.5717 : h1c;
  const pos = atDefaults ? 0.6225 : posc;
  const neg = atDefaults ? 0.33 : negc;
  const dW = atDefaults ? 0.02925 : dWc;
  const wNew = w + dW;

  const steps = [
    {
      tag: "Positive phase",
      tagColor: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
      title: "Sample the hidden units from the data",
      body: `h⁰ = P(h=1|v⁰) = σ(v⁰·W + b) = σ(${f4(v0 * w + b)}) = ${f4(h0)}`,
      note: "Clamp v to the training example and compute P(h|v) directly — this is the easy, data-driven phase.",
    },
    {
      tag: "Reconstruction",
      tagColor: "bg-rose-500/15 text-rose-600 dark:text-rose-400",
      title: "The model imagines the data back",
      body: `v¹ = P(v=1|h⁰) = σ(h⁰·W + a) = σ(${f4(h0 * w + a)}) = ${f4(v1)}`,
      note: "One Gibbs step: the model regenerates the visible vector from its own fantasy of h⁰ — no Z needed.",
    },
    {
      tag: "Negative phase",
      tagColor: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
      title: "Sample hidden units from the reconstruction",
      body: `h¹ = P(h=1|v¹) = σ(v¹·W + b) = σ(${f4(v1 * w + b)}) = ${f4(h1)}`,
      note: "The model's own correlation — what it currently 'believes' — is captured from its reconstruction.",
    },
    {
      tag: "CD-1 update",
      tagColor: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
      title: "Positive correlation minus negative correlation",
      body: `ΔW = η(v⁰h⁰ − v¹h¹) = ${f2(eta)}×(${f4(pos)} − ${f4(neg)}) = ${f5(dW)}`,
      note: `W_new = W + ΔW = ${f2(w)} + ${f5(dW)} = ${f5(wNew)}`,
    },
  ];

  /* arrow animation state per step */
  const flow = step === 1 ? { dir: "up", color: "#8b5cf6" } : step === 2 ? { dir: "down", color: "#f43f5e" } : step === 3 ? { dir: "up", color: "#0ea5e9" } : null;

  return (
    <div className="grid gap-4 lg:grid-cols-[290px_1fr]">
      {/* controls */}
      <div className="space-y-1 rounded-xl border bg-muted/30 p-3">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          CD-1 setup (single visible / single hidden unit)
        </p>
        <SliderRow label="v⁰ (data)" value={v0} min={0} max={1} step={1} onChange={setV0} />
        <SliderRow label="W" value={w} min={-1} max={1} onChange={setW} />
        <SliderRow label="bias a" value={a} min={-0.5} max={0.5} onChange={setA} />
        <SliderRow label="bias b" value={b} min={-0.5} max={0.5} onChange={setB} />
        <SliderRow label="η (lr)" value={eta} min={0.01} max={0.5} onChange={setEta} />
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 h-9 w-full text-xs"
          onClick={() => {
            setV0(DEF_B.v0);
            setW(DEF_B.w);
            setA(DEF_B.a);
            setB(DEF_B.b);
            setEta(DEF_B.eta);
            setStep(4);
          }}
        >
          <RotateCcw className="h-3 w-3" /> Reset to notes values
        </Button>
        <div className="mt-3 grid gap-2">
          <Stat label="Data correlation v⁰h⁰" value={f4(pos)} tone="good" />
          <Stat label="Model correlation v¹h¹" value={f4(neg)} tone="bad" />
          <Stat label="ΔW" value={f5(dW)} tone="accent" />
          <Stat label="W_new" value={f5(wNew)} tone="accent" />
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Data correlation {f4(pos)} &gt; model correlation {f4(neg)} → <span className="font-semibold">strengthen the weight</span>:
          the model makes the real data configuration more probable (lower energy) relative to what it currently
          &ldquo;fantasises&rdquo;.
        </p>
      </div>

      {/* diagram + steps */}
      <div className="min-w-0 space-y-3">
        <div className="rounded-xl border bg-muted/20 p-3">
          <svg viewBox="0 0 400 235" className="mx-auto h-auto w-full max-w-sm" role="img" aria-label="CD-1 v h alternating sampling">
            {/* edge */}
            <line x1={200} y1={70} x2={200} y2={180} stroke="#8b5cf6" strokeWidth={2 + Math.abs(w) * 4} strokeOpacity={0.6} strokeLinecap="round" />
            <text x={216} y={128} className="fill-foreground font-mono" fontSize={11} fontWeight={700}>
              W={f2(w)}
            </text>
            {/* flowing probability dot */}
            {flow && (
              <motion.circle
                r={6}
                fill={flow.color}
                cx={200}
                initial={false}
                animate={{ cy: flow.dir === "up" ? [180, 70] : [70, 180], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
              />
            )}
            {/* direction label */}
            {flow && (
              <text x={200} y={30} textAnchor="middle" fontSize={10} fontWeight={700} fill={flow.color}>
                {flow.dir === "up" ? "bottom-up sample" : "top-down reconstruction"}
              </text>
            )}
            {/* h node */}
            <circle cx={200} cy={50} r={22} className="fill-card" stroke="#8b5cf6" strokeWidth={2.5} />
            <text x={200} y={55} textAnchor="middle" className="fill-foreground font-mono" fontSize={12} fontWeight={700}>
              h
            </text>
            <g opacity={step >= 1 ? 1 : 0.25}>
              <text x={130} y={46} textAnchor="end" fontSize={10} className="fill-violet-600 dark:fill-violet-400 font-mono">
                h⁰ = {f4(h0)}
              </text>
            </g>
            <g opacity={step >= 3 ? 1 : 0.25}>
              <text x={272} y={46} fontSize={10} className="fill-sky-600 dark:fill-sky-400 font-mono">
                h¹ = {f4(h1)}
              </text>
            </g>
            {/* v node */}
            <rect x={178} y={178} width={44} height={44} rx={10} className="fill-card" stroke="#0ea5e9" strokeWidth={2.5} />
            <rect x={178} y={178} width={44} height={44} rx={10} fill="#0ea5e9" fillOpacity={0.18} />
            <text x={200} y={205} textAnchor="middle" className="fill-foreground font-mono" fontSize={12} fontWeight={700}>
              v
            </text>
            <g opacity={1}>
              <text x={130} y={203} textAnchor="end" fontSize={10} className="fill-emerald-600 dark:fill-emerald-400 font-mono">
                v⁰ = {f2(v0)}
              </text>
            </g>
            <g opacity={step >= 2 ? 1 : 0.25}>
              <text x={272} y={203} fontSize={10} className="fill-rose-600 dark:fill-rose-400 font-mono">
                v¹ = {f4(v1)}
              </text>
            </g>
          </svg>
        </div>

        {/* stepper */}
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" className="h-11 w-11 p-0" onClick={() => setStep((s) => Math.max(1, s - 1))} aria-label="Previous step">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                aria-label={`Go to step ${i + 1}`}
                className={`h-9 w-9 rounded-full font-mono text-xs font-semibold transition-colors ${
                  i + 1 <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="h-11 w-11 p-0" onClick={() => setStep((s) => Math.min(4, s + 1))} aria-label="Next step">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-11" onClick={() => setStep(4)}>
            Show all
          </Button>
        </div>

        <ol className="space-y-2">
          {steps.slice(0, step).map((s, i) => (
            <motion.li
              key={s.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`rounded-xl border p-3 ${i === step - 1 ? "border-primary/50 bg-primary/5" : "bg-muted/30"}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary">{i + 1}.</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.tagColor}`}>{s.tag}</span>
                <span className="text-xs font-semibold text-foreground">{s.title}</span>
              </div>
              <p className="mt-1 break-words pl-5 font-mono text-xs text-foreground">{s.body}</p>
              <p className="mt-1 pl-5 font-mono text-[11px] text-muted-foreground">{s.note}</p>
            </motion.li>
          ))}
        </ol>

        <div className="rounded-xl border bg-muted/20 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <ArrowDownUp className="h-3.5 w-3.5" /> Why CD-1 works
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            The exact gradient ∂ log P(v)/∂Wᵢⱼ = ⟨vᵢhⱼ⟩_data − ⟨vᵢhⱼ⟩_model needs samples from the model&rsquo;s
            equilibrium distribution — which needs the intractable Z. CD-1 approximates the negative phase with a single
            Gibbs step <em>started from the training example itself</em>. Starting the chain where the data already is
            makes even one step a remarkably good approximation (Hinton, 2002).
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */

export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "Restricted Boltzmann Machine Lab"}
      description={description ?? "An energy-based, undirected, bipartite model: data gets low energy, everything else gets high energy."}
      accent="u4"
    >
      <Tabs defaultValue="energy">
        <TabsList className="h-11 w-full sm:w-auto">
          <TabsTrigger value="energy" className="px-4">
            <Layers className="h-3.5 w-3.5" /> Energy &amp; conditionals
          </TabsTrigger>
          <TabsTrigger value="cd" className="px-4">
            Contrastive Divergence CD-1
          </TabsTrigger>
        </TabsList>
        <TabsContent value="energy" className="mt-3">
          <EnergyTab />
        </TabsContent>
        <TabsContent value="cd" className="mt-3">
          <CDTab />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}
