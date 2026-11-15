"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WidgetFrame, Stat } from "./frame";
import { cn } from "@/lib/utils";

type LayerKind = "input" | "conv" | "pool" | "fc" | "gap" | "inception" | "softmax";
type Layer = { kind: LayerKind; label: string; w?: number };

const KIND_STYLES: Record<LayerKind, string> = {
  input: "fill-muted stroke-muted-foreground/50",
  conv: "fill-u2/25 stroke-u2/80",
  pool: "fill-sky-500/20 stroke-sky-500/70",
  fc: "fill-amber-500/20 stroke-amber-500/70",
  gap: "fill-violet-500/20 stroke-violet-500/70",
  inception: "fill-rose-500/15 stroke-rose-500/60",
  softmax: "fill-primary/20 stroke-primary/70",
};

function StackDiagram({ layers, maxLabel }: { layers: Layer[]; maxLabel?: string }) {
  const rowH = 26;
  const gap = 7;
  const W = 320;
  const H = layers.length * (rowH + gap) + (maxLabel ? 22 : 6);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-[340px]" role="img" aria-label="layer stack diagram">
      {layers.map((l, i) => {
        const w = 44 + (l.w ?? 0.5) * 216;
        const x = (W - w) / 2;
        const y = 4 + i * (rowH + gap);
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={rowH} rx={5} className={KIND_STYLES[l.kind]} strokeWidth={1.5} />
            <text x={W / 2} y={y + rowH / 2 + 4} textAnchor="middle" className="fill-foreground font-mono text-[10px]">
              {l.label}
            </text>
          </g>
        );
      })}
      {maxLabel && (
        <text x={W / 2} y={H - 6} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
          {maxLabel}
        </text>
      )}
    </svg>
  );
}

const ALEXNET: Layer[] = [
  { kind: "input", label: "Input 224×224×3", w: 1 },
  { kind: "conv", label: "Conv1 96 · 11×11 s4 + ReLU", w: 0.92 },
  { kind: "pool", label: "MaxPool 3×3 s2 (overlapping)", w: 0.8 },
  { kind: "conv", label: "Conv2 256 · 5×5 + ReLU", w: 0.78 },
  { kind: "conv", label: "Conv3 384 · 3×3 + ReLU", w: 0.68 },
  { kind: "conv", label: "Conv4 384 · 3×3 + ReLU", w: 0.6 },
  { kind: "conv", label: "Conv5 256 · 3×3 + ReLU", w: 0.52 },
  { kind: "pool", label: "MaxPool 3×3 s2", w: 0.46 },
  { kind: "fc", label: "FC6 4096 + dropout", w: 0.55 },
  { kind: "fc", label: "FC7 4096 + dropout", w: 0.55 },
  { kind: "softmax", label: "FC8 1000 + softmax", w: 0.55 },
];

const VGG: Layer[] = [
  { kind: "input", label: "Input 224×224×3", w: 1 },
  { kind: "conv", label: "Block 1 — 3×3 conv ×2 (64)", w: 0.95 },
  { kind: "pool", label: "2×2 maxpool s2", w: 0.86 },
  { kind: "conv", label: "Block 2 — 3×3 conv ×2 (128)", w: 0.78 },
  { kind: "pool", label: "2×2 maxpool s2", w: 0.68 },
  { kind: "conv", label: "Block 3 — 3×3 conv ×2 (256)", w: 0.6 },
  { kind: "pool", label: "2×2 maxpool s2", w: 0.52 },
  { kind: "conv", label: "Block 4 — 3×3 conv ×2 (512)", w: 0.46 },
  { kind: "pool", label: "2×2 maxpool s2", w: 0.4 },
  { kind: "conv", label: "Block 5 — 3×3 conv ×3 (512)", w: 0.36 },
  { kind: "pool", label: "2×2 maxpool s2", w: 0.32 },
  { kind: "fc", label: "FC 4096", w: 0.38 },
  { kind: "fc", label: "FC 4096", w: 0.38 },
  { kind: "softmax", label: "FC 1000 + softmax", w: 0.38 },
];

const GOOGLENET: Layer[] = [
  { kind: "input", label: "Input 224×224×3", w: 1 },
  { kind: "conv", label: "Conv 7×7 s2 + ReLU", w: 0.9 },
  { kind: "pool", label: "MaxPool 3×3 s2", w: 0.8 },
  { kind: "conv", label: "Conv 1×1 + Conv 3×3", w: 0.7 },
  { kind: "pool", label: "MaxPool 3×3 s2", w: 0.62 },
  { kind: "inception", label: "Inception ×2 (3a–3b)", w: 0.56 },
  { kind: "pool", label: "MaxPool", w: 0.5 },
  { kind: "inception", label: "Inception ×5 (4a–4e) + aux", w: 0.56 },
  { kind: "pool", label: "MaxPool", w: 0.5 },
  { kind: "inception", label: "Inception ×2 (5a–5b)", w: 0.56 },
  { kind: "gap", label: "GAP → 1024", w: 0.5 },
  { kind: "softmax", label: "Softmax 1000", w: 0.46 },
];

const RESNET: Layer[] = [
  { kind: "input", label: "Input 224×224×3", w: 1 },
  { kind: "conv", label: "Conv 7×7 s2 + BN + ReLU", w: 0.85 },
  { kind: "pool", label: "MaxPool 3×3 s2", w: 0.74 },
  { kind: "conv", label: "Stage 1 — residual blocks ×3 (64)", w: 0.64 },
  { kind: "conv", label: "Stage 2 — residual blocks ×4 (128)", w: 0.56 },
  { kind: "conv", label: "Stage 3 — residual blocks ×6 (256)", w: 0.48 },
  { kind: "conv", label: "Stage 4 — residual blocks ×3 (512)", w: 0.42 },
  { kind: "gap", label: "GAP", w: 0.38 },
  { kind: "softmax", label: "FC 1000 + softmax", w: 0.38 },
];

const MODELS = [
  {
    id: "alexnet",
    name: "AlexNet",
    year: 2012,
    depth: 8,
    depthLabel: "8 (5 conv + 3 FC)",
    params: 60,
    err: 15.3,
    innovations: [
      "ReLU activation instead of tanh/sigmoid — trains dramatically faster",
      "Trained across 2 GPUs in parallel — proved GPU compute is essential at scale",
      "Dropout in the FC layers to fight overfitting",
      "Data augmentation: random crops and horizontal flips",
      "Overlapping max pooling (pooling stride smaller than the window)",
    ],
    extra: "Won ILSVRC-2012 by a huge margin (15.3% vs about 26.2% for the next best) — credited with igniting the modern deep-learning revolution.",
  },
  {
    id: "vgg",
    name: "VGG-16",
    year: 2014,
    depth: 16,
    depthLabel: "16 (13 conv + 3 FC)",
    params: 138,
    err: 7.3,
    innovations: [
      "Only 3×3 convolutions (stride 1, pad 1) and 2×2 max pooling (stride 2)",
      "Depth built from small, uniform filters — three 3×3 match one 7×7 RF with fewer parameters",
      "VGG-16 and VGG-19 variants; simple, regular design that transfers well",
      "Downside: huge FC layers make it large and slow (138M parameters)",
    ],
    extra: "Recall Example 3.3: three stacked 3×3 convs = one 7×7 receptive field at 27C² instead of 49C², plus 2 extra ReLUs — VGG applies this idea throughout.",
  },
  {
    id: "googlenet",
    name: "GoogLeNet",
    year: 2014,
    depth: 22,
    depthLabel: "22",
    params: 5,
    err: 6.7,
    innovations: [
      "Inception modules: 1×1, 3×3, 5×5 and pooling branches run in parallel, then concatenate",
      "1×1 bottleneck convolutions shrink channel depth before the expensive convs",
      "Global Average Pooling replaces the huge FC stack (Example 4.2)",
      "Auxiliary classifiers inject extra gradient signal during training only",
    ],
    extra: "22 layers deep with only about 5M parameters — deeper than VGG yet about 27x smaller.",
  },
  {
    id: "resnet",
    name: "ResNet",
    year: 2015,
    depth: 152,
    depthLabel: "up to 152",
    params: 60,
    err: 3.57,
    innovations: [
      "Residual (skip) connections: each block learns F(x) = H(x) − x and outputs F(x) + x",
      "Identity shortcut has local gradient exactly 1 — gradients flow undiminished to early layers",
      "Solves the degradation problem: plain networks get worse as they get deeper",
      "Bottleneck blocks (1×1 → 3×3 → 1×1) in ResNet-50/101/152; ResNet-50 has about 25.6M params",
    ],
    extra: "3.57% top-5 error — surpassing the commonly cited human-level benchmark of about 5% on ILSVRC.",
  },
];

function CompareBar({ label, value, max, text, tone, logScale }: { label: string; value: number; max: number; text: string; tone: string; logScale?: boolean }) {
  const frac = logScale ? Math.log10(Math.max(value, 1.01)) / Math.log10(max) : value / max;
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-right font-mono text-[10px] text-muted-foreground">{label}</span>
      <div className="relative h-5 flex-1 overflow-hidden rounded bg-muted">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${Math.max(frac * 100, 2)}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn("h-full rounded", tone)}
        />
        <span className="absolute inset-y-0 right-2 flex items-center font-mono text-[10px] font-semibold text-foreground">{text}</span>
      </div>
    </div>
  );
}

export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "CNN architecture gallery"}
      description={description ?? "AlexNet, VGG-16, GoogLeNet and ResNet — the four milestones of modern CNN design, with the numbers from the notes."}
    >
      <Tabs defaultValue="alexnet">
        <TabsList className="mb-3 flex w-full flex-wrap justify-start gap-1 sm:flex-nowrap">
          {MODELS.map((m) => (
            <TabsTrigger key={m.id} value={m.id} className="flex-1 text-xs">
              {m.name}
              <span className="ml-1 hidden font-mono text-[10px] text-muted-foreground sm:inline">{m.year}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {MODELS.map((m) => (
          <TabsContent key={m.id} value={m.id} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label="Year" value={m.year} />
              <Stat label="Depth" value={m.depthLabel} />
              <Stat label="Parameters" value={`≈ ${m.params}M`} />
              <Stat label="Top-5 error" value={`${m.err}%`} tone={m.err < 5 ? "good" : "default"} />
            </div>

            <div className="grid gap-4 lg:grid-cols-[auto_1fr] lg:items-start">
              <div className="rounded-xl border bg-muted/20 p-3">
                {m.id === "alexnet" && <StackDiagram layers={ALEXNET} maxLabel="5 conv + 3 FC = 8 learned layers" />}
                {m.id === "vgg" && <StackDiagram layers={VGG} maxLabel="5 blocks of [3×3 convs + 2×2 maxpool] + 3 FC" />}
                {m.id === "googlenet" && <StackDiagram layers={GOOGLENET} maxLabel="9 inception modules + GAP head" />}
                {m.id === "resnet" && <StackDiagram layers={RESNET} maxLabel="ResNet-34 layout (50/101/152 use bottlenecks)" />}
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold">Key innovations</p>
                <ul className="space-y-1.5">
                  {m.innovations.map((inn) => (
                    <li key={inn} className="flex items-start gap-2 text-xs leading-relaxed">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{inn}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 rounded-lg border bg-muted/40 p-2.5 text-[11px] leading-relaxed text-muted-foreground">{m.extra}</p>
              </div>
            </div>

            {/* GoogLeNet: zoomed inception module + bottleneck math */}
            {m.id === "googlenet" && (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="mb-1 text-center text-xs font-semibold">One inception module (zoomed)</p>
                  <svg viewBox="0 0 520 250" className="h-auto w-full" role="img" aria-label="inception module with four parallel branches">
                    <rect x="14" y="100" width="76" height="50" rx="6" className="fill-muted stroke-muted-foreground/50" strokeWidth={1.5} />
                    <text x="52" y="121" textAnchor="middle" className="fill-foreground font-mono text-[10px]">input</text>
                    <text x="52" y="135" textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">28×28×192</text>
                    {/* branch boxes */}
                    <rect x="170" y="16" width="86" height="38" rx="5" className="fill-u2/25 stroke-u2/80" strokeWidth={1.5} />
                    <text x="213" y="39" textAnchor="middle" className="fill-foreground font-mono text-[10px]">1×1 conv</text>
                    <rect x="170" y="72" width="70" height="38" rx="5" className="fill-u2/25 stroke-u2/80" strokeWidth={1.5} />
                    <text x="205" y="95" textAnchor="middle" className="fill-foreground font-mono text-[10px]">1×1</text>
                    <rect x="272" y="72" width="80" height="38" rx="5" className="fill-u2/25 stroke-u2/80" strokeWidth={1.5} />
                    <text x="312" y="95" textAnchor="middle" className="fill-foreground font-mono text-[10px]">3×3 conv</text>
                    <rect x="170" y="128" width="70" height="38" rx="5" className="fill-u2/25 stroke-u2/80" strokeWidth={1.5} />
                    <text x="205" y="151" textAnchor="middle" className="fill-foreground font-mono text-[10px]">1×1</text>
                    <rect x="272" y="128" width="80" height="38" rx="5" className="fill-u2/25 stroke-u2/80" strokeWidth={1.5} />
                    <text x="312" y="151" textAnchor="middle" className="fill-foreground font-mono text-[10px]">5×5 conv</text>
                    <rect x="170" y="184" width="88" height="38" rx="5" className="fill-sky-500/20 stroke-sky-500/70" strokeWidth={1.5} />
                    <text x="214" y="207" textAnchor="middle" className="fill-foreground font-mono text-[10px]">3×3 pool</text>
                    <rect x="284" y="184" width="68" height="38" rx="5" className="fill-u2/25 stroke-u2/80" strokeWidth={1.5} />
                    <text x="318" y="207" textAnchor="middle" className="fill-foreground font-mono text-[10px]">1×1</text>
                    {/* concat */}
                    <rect x="416" y="86" width="90" height="78" rx="6" className="fill-rose-500/15 stroke-rose-500/60" strokeWidth={1.5} />
                    <text x="461" y="118" textAnchor="middle" className="fill-foreground font-mono text-[10px]">depth</text>
                    <text x="461" y="132" textAnchor="middle" className="fill-foreground font-mono text-[10px]">concat</text>
                    {/* connectors */}
                    {[
                      "M 90 112 C 130 112, 130 35, 170 35",
                      "M 90 118 C 130 118, 130 91, 170 91",
                      "M 240 91 L 272 91",
                      "M 90 124 C 130 124, 130 147, 170 147",
                      "M 240 147 L 272 147",
                      "M 90 130 C 130 130, 130 203, 170 203",
                      "M 258 203 L 284 203",
                      "M 256 35 C 380 35, 380 105, 416 105",
                      "M 352 91 C 390 91, 390 118, 416 118",
                      "M 352 147 C 390 147, 390 132, 416 132",
                      "M 352 203 C 390 203, 390 145, 416 145",
                    ].map((d, i) => (
                      <path key={i} d={d} fill="none" className="stroke-muted-foreground/60" strokeWidth={1.5} />
                    ))}
                  </svg>
                </div>
                <div className="rounded-xl border bg-muted/20 p-3">
                  <p className="mb-2 text-xs font-semibold">Example 10.1 — why the 1×1 bottleneck matters</p>
                  <p className="mb-2 font-mono text-[11px] text-muted-foreground">input 28×28×192, want a 5×5 conv with 32 outputs</p>
                  <div className="space-y-2">
                    <div>
                      <div className="mb-1 flex justify-between text-[11px]">
                        <span className="font-semibold text-rose-600 dark:text-rose-400">Direct 5×5</span>
                        <span className="font-mono text-muted-foreground">5×5×192×32 = 153,600</span>
                      </div>
                      <div className="h-5 overflow-hidden rounded bg-muted">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="h-full rounded bg-rose-500/70" />
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex justify-between text-[11px]">
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">1×1 bottleneck then 5×5</span>
                        <span className="font-mono text-muted-foreground">3,072 + 12,800 = 15,872</span>
                      </div>
                      <div className="h-5 overflow-hidden rounded bg-muted">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "10.3%" }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="h-full rounded bg-emerald-500/70" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-[11px] leading-relaxed">
                    153,600 / 15,872 ≈ 9.7 — roughly 10× fewer parameters (about 90% reduction) for essentially the same
                    convolution. This trick lets Inception be deeper and dramatically smaller than VGG.
                  </p>
                </div>
              </div>
            )}

            {/* ResNet: residual block diagram */}
            {m.id === "resnet" && (
              <div className="rounded-xl border bg-muted/20 p-3">
                <p className="mb-1 text-center text-xs font-semibold">A residual block</p>
                <svg viewBox="0 0 560 250" className="h-auto w-full" role="img" aria-label="residual block with identity shortcut">
                  {/* main path */}
                  <rect x="20" y="100" width="60" height="38" rx="6" className="fill-muted stroke-muted-foreground/50" strokeWidth={1.5} />
                  <text x="50" y="123" textAnchor="middle" className="fill-foreground font-mono text-[11px]">x</text>
                  <rect x="130" y="40" width="100" height="38" rx="6" className="fill-u2/25 stroke-u2/80" strokeWidth={1.5} />
                  <text x="180" y="63" textAnchor="middle" className="fill-foreground font-mono text-[10px]">3×3 conv</text>
                  <rect x="270" y="40" width="70" height="38" rx="6" className="fill-amber-500/20 stroke-amber-500/70" strokeWidth={1.5} />
                  <text x="305" y="63" textAnchor="middle" className="fill-foreground font-mono text-[10px]">ReLU</text>
                  <rect x="380" y="40" width="100" height="38" rx="6" className="fill-u2/25 stroke-u2/80" strokeWidth={1.5} />
                  <text x="430" y="63" textAnchor="middle" className="fill-foreground font-mono text-[10px]">3×3 conv</text>
                  <circle cx="500" cy="118" r="18" className="fill-primary/20 stroke-primary/70" strokeWidth={1.5} />
                  <text x="500" y="124" textAnchor="middle" className="fill-foreground text-[16px] font-bold">+</text>
                  <path d="M 80 119 L 105 119 L 105 59 L 130 59" fill="none" className="stroke-muted-foreground/70" strokeWidth={1.5} />
                  <path d="M 230 59 L 270 59" fill="none" className="stroke-muted-foreground/70" strokeWidth={1.5} />
                  <path d="M 340 59 L 380 59" fill="none" className="stroke-muted-foreground/70" strokeWidth={1.5} />
                  <path d="M 480 59 L 500 59 L 500 100" fill="none" className="stroke-muted-foreground/70" strokeWidth={1.5} />
                  <path d="M 518 118 L 548 118" fill="none" className="stroke-muted-foreground/70" strokeWidth={1.5} markerEnd="url(#resArrow)" />
                  <text x="536" y="106" textAnchor="middle" className="fill-foreground font-mono text-[10px]">ReLU</text>
                  <text x="540" y="138" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">out</text>
                  {/* skip connection */}
                  <path
                    d="M 50 138 C 160 225, 400 225, 500 136"
                    fill="none"
                    className="stroke-primary"
                    strokeWidth={2.5}
                    strokeDasharray="7 4"
                    markerEnd="url(#resArrowPrimary)"
                  />
                  <text x="275" y="222" textAnchor="middle" className="fill-primary font-mono text-[11px] font-bold">
                    identity shortcut — gradient = 1
                  </text>
                  <text x="275" y="240" textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
                    block learns F(x) = H(x) − x, output = F(x) + x
                  </text>
                  <defs>
                    <marker id="resArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" className="fill-muted-foreground" />
                    </marker>
                    <marker id="resArrowPrimary" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6 Z" className="fill-primary" />
                    </marker>
                  </defs>
                </svg>
                <p className="mt-1 text-center text-[11px] leading-relaxed text-muted-foreground">
                  The degradation problem: past a certain depth, <span className="text-foreground">plain</span> networks
                  get <span className="text-foreground">worse</span> with more layers — not overfitting, but harder
                  optimization. Skip connections keep even 50/101/152-layer networks trainable.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Year timeline */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold">Timeline</p>
        <div className="relative h-12">
          <div className="absolute inset-x-0 top-2 h-0.5 bg-border" />
          {[
            { year: 2012, name: "AlexNet", pct: 8 },
            { year: 2014, name: "VGG", pct: 38 },
            { year: 2014, name: "GoogLeNet", pct: 64 },
            { year: 2015, name: "ResNet", pct: 92 },
          ].map((m) => (
            <div key={m.name} className="absolute top-0 flex -translate-x-1/2 flex-col items-center" style={{ left: `${m.pct}%` }}>
              <span className="size-4 rounded-full border-2 border-primary bg-background" />
              <span className="mt-1 font-mono text-[10px] text-muted-foreground">{m.year}</span>
              <span className="text-[10px] font-semibold">{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cross-model comparison bars */}
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="rounded-xl border p-3">
          <p className="mb-2 text-xs font-semibold">Depth (layers)</p>
          <div className="space-y-2">
            <CompareBar label="AlexNet" value={8} max={152} text="8" tone="bg-sky-500/70" />
            <CompareBar label="VGG-16" value={16} max={152} text="16" tone="bg-amber-500/70" />
            <CompareBar label="GoogLeNet" value={22} max={152} text="22" tone="bg-rose-500/70" />
            <CompareBar label="ResNet" value={152} max={152} text="152" tone="bg-emerald-500/70" />
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <p className="mb-2 text-xs font-semibold">Parameters (log scale)</p>
          <div className="space-y-2">
            <CompareBar label="AlexNet" value={60} max={138} text="≈ 60M" tone="bg-sky-500/70" logScale />
            <CompareBar label="VGG-16" value={138} max={138} text="≈ 138M" tone="bg-amber-500/70" logScale />
            <CompareBar label="GoogLeNet" value={5} max={138} text="≈ 5M" tone="bg-rose-500/70" logScale />
            <CompareBar label="ResNet-152" value={60} max={138} text="≈ 60M" tone="bg-emerald-500/70" logScale />
          </div>
        </div>
        <div className="rounded-xl border p-3">
          <p className="mb-2 text-xs font-semibold">ImageNet top-5 error</p>
          <div className="relative space-y-2">
            <div
              className="pointer-events-none absolute inset-y-0 z-10 border-l-2 border-dashed border-foreground/50"
              style={{ left: "calc(4rem + (100% - 4rem) * 0.3125)" }}
            >
              <span className="absolute -top-4 left-1 whitespace-nowrap font-mono text-[9px] text-muted-foreground">human ≈ 5%</span>
            </div>
            <CompareBar label="AlexNet" value={15.3} max={16} text="15.3%" tone="bg-sky-500/70" />
            <CompareBar label="VGG-16" value={7.3} max={16} text="7.3%" tone="bg-amber-500/70" />
            <CompareBar label="GoogLeNet" value={6.7} max={16} text="6.7%" tone="bg-rose-500/70" />
            <CompareBar label="ResNet" value={3.57} max={16} text="3.57%" tone="bg-emerald-500/70" />
          </div>
        </div>
      </div>

      {/* Accessible comparison table */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-xs">
          <caption className="mb-1 text-left text-[10px] text-muted-foreground">Section 10.6 side-by-side comparison</caption>
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-2 pr-3 text-left font-medium">Architecture</th>
              <th className="py-2 pr-3 text-left font-medium">Year</th>
              <th className="py-2 pr-3 text-left font-medium">Depth</th>
              <th className="py-2 pr-3 text-left font-medium">Parameters</th>
              <th className="py-2 pr-3 text-left font-medium">Top-5 error</th>
              <th className="py-2 text-left font-medium">Key innovation</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            <tr className="border-b">
              <td className="py-2 pr-3 font-sans font-semibold">AlexNet</td>
              <td className="py-2 pr-3">2012</td>
              <td className="py-2 pr-3">8 layers</td>
              <td className="py-2 pr-3">≈ 60M</td>
              <td className="py-2 pr-3">15.3%</td>
              <td className="py-2 font-sans">ReLU, Dropout, GPU training</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-3 font-sans font-semibold">VGG-16</td>
              <td className="py-2 pr-3">2014</td>
              <td className="py-2 pr-3">16 layers</td>
              <td className="py-2 pr-3">≈ 138M</td>
              <td className="py-2 pr-3">≈ 7.3%</td>
              <td className="py-2 font-sans">Deep stack of small 3×3 filters</td>
            </tr>
            <tr className="border-b">
              <td className="py-2 pr-3 font-sans font-semibold">GoogLeNet</td>
              <td className="py-2 pr-3">2014</td>
              <td className="py-2 pr-3">22 layers</td>
              <td className="py-2 pr-3">≈ 5M</td>
              <td className="py-2 pr-3">≈ 6.7%</td>
              <td className="py-2 font-sans">Inception module + 1×1 bottlenecks</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-sans font-semibold">ResNet-152</td>
              <td className="py-2 pr-3">2015</td>
              <td className="py-2 pr-3">152 layers</td>
              <td className="py-2 pr-3">≈ 60M</td>
              <td className="py-2 pr-3">3.57%</td>
              <td className="py-2 font-sans">Residual / skip connections</td>
            </tr>
          </tbody>
        </table>
      </div>
    </WidgetFrame>
  );
}
