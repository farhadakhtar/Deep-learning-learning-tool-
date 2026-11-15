"use client";

import { useState } from "react";
import { WidgetFrame } from "./frame";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { MousePointerClick } from "lucide-react";

type Part = "dendrites" | "soma" | "axon" | "synapse" | null;

const MAPPING: Record<
  Exclude<Part, null>,
  { bio: string; art: string; text: string; bioColor: string }
> = {
  dendrites: {
    bio: "Dendrites",
    art: "Inputs x₁, x₂, x₃",
    text: "Dendrites receive electrical / chemical signals from other neurons. Artificial analogue: the inputs xᵢ — the numeric features fed into the neuron.",
    bioColor: "#0ea5e9",
  },
  soma: {
    bio: "Soma (cell body)",
    art: "Weighted summation Σ + bias b",
    text: "The soma accumulates all incoming signals in one place. Artificial analogue: the weighted summation z = Σ wᵢxᵢ + b computed by the neuron body.",
    bioColor: "#8b5cf6",
  },
  axon: {
    bio: "Axon",
    art: "Activation f(z) → output y",
    text: "If the accumulated signal crosses a threshold, the neuron fires a spike that travels down the axon. Artificial analogue: the activation function f(z) producing the output y.",
    bioColor: "#f97316",
  },
  synapse: {
    bio: "Synapse strength",
    art: "Weights w₁, w₂, w₃",
    text: "A synapse gates how strongly one neuron's signal influences the next — weak or strong connection. Artificial analogue: the weight wᵢ. Learning = adjusting these weights.",
    bioColor: "#10b981",
  },
};

const PARTS: Exclude<Part, null>[] = ["dendrites", "soma", "axon", "synapse"];

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [part, setPart] = useState<Part>(null);
  const active = part ? MAPPING[part] : null;

  const glow = (p: Exclude<Part, null>) => part === p;

  return (
    <WidgetFrame
      title={title ?? "Biological Neuron vs Artificial Neuron"}
      description={
        description ??
        "Artificial neurons are loosely inspired by biological neurons. Click a part of the biological neuron (left) to see which component of the perceptron (right) it corresponds to."
      }
      accent="u1"
    >
      <div className="grid gap-5 lg:grid-cols-2">
        {/* ---------------- Left: biological neuron ---------------- */}
        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" />
            Biological neuron — click a labelled part
          </p>
          <svg viewBox="0 0 400 230" className="w-full" role="img">
            {/* ---------- dendrites ---------- */}
            <g
              className="cursor-pointer"
              onClick={() => setPart("dendrites")}
              onMouseEnter={() => setPart("dendrites")}
            >
              {/* generous invisible hit area */}
              <rect x={0} y={30} width={120} height={170} fill="transparent" />
              <g
                stroke={glow("dendrites") ? "#0ea5e9" : "currentColor"}
                className={glow("dendrites") ? "text-sky-500" : "text-muted-foreground"}
                strokeWidth={glow("dendrites") ? 4 : 2.5}
                strokeLinecap="round"
                fill="none"
                style={glow("dendrites") ? { filter: "drop-shadow(0 0 6px #0ea5e9aa)" } : undefined}
              >
                <path d="M120 115 C95 100 80 85 60 75" />
                <path d="M60 75 C45 68 35 60 25 52" />
                <path d="M60 75 C50 70 38 70 28 68" />
                <path d="M120 115 C95 115 75 110 55 112" />
                <path d="M55 112 C40 113 30 110 20 112" />
                <path d="M120 115 C95 130 80 145 62 155" />
                <path d="M62 155 C50 161 40 168 32 176" />
                <path d="M62 155 C52 152 42 154 34 152" />
                <path d="M120 115 C105 95 100 80 98 62" />
                <path d="M120 115 C105 135 100 152 98 168" />
              </g>
              <text
                x={16} y={40}
                fontSize={12}
                fontWeight={glow("dendrites") ? 700 : 500}
                className={glow("dendrites") ? "fill-sky-600 dark:fill-sky-400" : "fill-muted-foreground"}
              >
                Dendrites
              </text>
            </g>

            {/* ---------- soma ---------- */}
            <g
              className="cursor-pointer"
              onClick={() => setPart("soma")}
              onMouseEnter={() => setPart("soma")}
            >
              <rect x={112} y={72} width={92} height={92} fill="transparent" />
              <circle
                cx={158} cy={118} r={44}
                fill={glow("soma") ? "#8b5cf622" : "currentColor"}
                className={glow("soma") ? "" : "text-muted-foreground/20"}
                stroke={glow("soma") ? "#8b5cf6" : "currentColor"}
                strokeWidth={glow("soma") ? 4 : 2.5}
                style={glow("soma") ? { filter: "drop-shadow(0 0 8px #8b5cf6aa)" } : undefined}
              />
              <circle
                cx={158} cy={118} r={16}
                fill="currentColor"
                className={glow("soma") ? "text-violet-400" : "text-muted-foreground/40"}
              />
              <text x={152} y={122} fontSize={9} className="fill-background" fontWeight={700}>
                n.
              </text>
              <text
                x={128} y={196}
                fontSize={12}
                fontWeight={glow("soma") ? 700 : 500}
                className={glow("soma") ? "fill-violet-600 dark:fill-violet-400" : "fill-muted-foreground"}
              >
                Soma (cell body)
              </text>
            </g>

            {/* ---------- axon ---------- */}
            <g
              className="cursor-pointer"
              onClick={() => setPart("axon")}
              onMouseEnter={() => setPart("axon")}
            >
              <rect x={200} y={78} width={130} height={80} fill="transparent" />
              <line
                x1={202} y1={118} x2={330} y2={118}
                stroke={glow("axon") ? "#f97316" : "currentColor"}
                className={glow("axon") ? "" : "text-muted-foreground"}
                strokeWidth={glow("axon") ? 5 : 3}
                style={glow("axon") ? { filter: "drop-shadow(0 0 6px #f97316aa)" } : undefined}
              />
              {/* myelin sheath segments */}
              {[212, 238, 264, 290].map((x) => (
                <rect
                  key={x}
                  x={x} y={106} width={18} height={24} rx={9}
                  fill={glow("axon") ? "#f9731633" : "currentColor"}
                  className={glow("axon") ? "" : "text-muted-foreground/25"}
                  stroke={glow("axon") ? "#f97316" : "currentColor"}
                  strokeWidth={1.5}
                />
              ))}
              <text
                x={216} y={92}
                fontSize={12}
                fontWeight={glow("axon") ? 700 : 500}
                className={glow("axon") ? "fill-orange-600 dark:fill-orange-400" : "fill-muted-foreground"}
              >
                Axon
              </text>
            </g>

            {/* ---------- synapses ---------- */}
            <g
              className="cursor-pointer"
              onClick={() => setPart("synapse")}
              onMouseEnter={() => setPart("synapse")}
            >
              <rect x={318} y={40} width={80} height={160} fill="transparent" />
              <g
                stroke={glow("synapse") ? "#10b981" : "currentColor"}
                className={glow("synapse") ? "" : "text-muted-foreground"}
                strokeWidth={glow("synapse") ? 3 : 2}
                fill="none"
                strokeLinecap="round"
              >
                <path d="M330 118 C345 100 350 88 358 76" />
                <path d="M330 118 C345 118 352 116 362 114" />
                <path d="M330 118 C345 136 350 150 358 160" />
              </g>
              {[358, 362, 358].map((cx, i) => (
                <circle
                  key={i}
                  cx={cx + (i === 1 ? 4 : 0)}
                  cy={[76, 114, 160][i]}
                  r={7}
                  fill={glow("synapse") ? "#10b981" : "currentColor"}
                  className={glow("synapse") ? "" : "text-muted-foreground/50"}
                  style={glow("synapse") ? { filter: "drop-shadow(0 0 6px #10b981aa)" } : undefined}
                />
              ))}
              <text
                x={344} y={52}
                fontSize={12}
                fontWeight={glow("synapse") ? 700 : 500}
                className={glow("synapse") ? "fill-emerald-600 dark:fill-emerald-400" : "fill-muted-foreground"}
              >
                Synapses
              </text>
              {/* signal direction arrow */}
              <g stroke="currentColor" className="text-muted-foreground/40" strokeWidth={1.2} fill="none">
                <path d="M14 214 H386" markerEnd="url(#arrowU1n)" markerStart="url(#arrowU1ns)" />
              </g>
              <text x={14} y={228} fontSize={10} className="fill-muted-foreground/70">
                information flow
              </text>
            </g>

            <defs>
              <marker id="arrowU1n" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6 Z" className="fill-muted-foreground/60" />
              </marker>
              <marker id="arrowU1ns" markerWidth="8" markerHeight="8" refX="0" refY="3" orient="auto">
                <path d="M6 0 L0 3 L6 6 Z" className="fill-muted-foreground/60" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* ---------------- Right: artificial neuron (perceptron) ---------------- */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">
            Artificial neuron (perceptron) — highlights follow your selection
          </p>
          <svg viewBox="0 0 400 230" className="w-full" role="img">
            {/* input nodes */}
            {[
              { y: 55, label: "x₁", w: "w₁", key: "dendrites" as const, wk: "synapse" as const },
              { y: 118, label: "x₂", w: "w₂", key: "dendrites" as const, wk: "synapse" as const },
              { y: 181, label: "x₃", w: "w₃", key: "dendrites" as const, wk: "synapse" as const },
            ].map((n) => (
              <g key={n.label}>
                <circle
                  cx={70} cy={n.y} r={22}
                  fill={glow(n.key) ? "#0ea5e922" : "currentColor"}
                  className={glow(n.key) ? "" : "text-muted-foreground/15"}
                  stroke={glow(n.key) ? "#0ea5e9" : "currentColor"}
                  strokeWidth={glow(n.key) ? 3.5 : 2}
                  style={glow(n.key) ? { filter: "drop-shadow(0 0 7px #0ea5e9aa)" } : undefined}
                />
                <text
                  x={70} y={n.y + 5}
                  textAnchor="middle"
                  fontSize={14}
                  fontWeight={700}
                  className={glow(n.key) ? "fill-sky-600 dark:fill-sky-400" : "fill-foreground"}
                >
                  {n.label}
                </text>
                {/* weighted edge */}
                <line
                  x1={94} y1={n.y} x2={188} y2={118}
                  stroke={glow(n.wk) ? "#10b981" : "currentColor"}
                  className={glow(n.wk) ? "" : "text-muted-foreground/60"}
                  strokeWidth={glow(n.wk) ? 4 : 2}
                  style={glow(n.wk) ? { filter: "drop-shadow(0 0 6px #10b981aa)" } : undefined}
                />
                <text
                  x={140 + (n.y === 118 ? 0 : n.y < 118 ? -2 : 2)}
                  y={n.y === 118 ? 108 : n.y < 118 ? 74 : 166}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={glow(n.wk) ? 800 : 600}
                  className={glow(n.wk) ? "fill-emerald-600 dark:fill-emerald-400" : "fill-muted-foreground"}
                >
                  {n.w}
                </text>
              </g>
            ))}

            {/* soma -> sigma node */}
            <g>
              <circle
                cx={214} cy={118} r={30}
                fill={glow("soma") ? "#8b5cf622" : "currentColor"}
                className={glow("soma") ? "" : "text-muted-foreground/15"}
                stroke={glow("soma") ? "#8b5cf6" : "currentColor"}
                strokeWidth={glow("soma") ? 3.5 : 2}
                style={glow("soma") ? { filter: "drop-shadow(0 0 8px #8b5cf6aa)" } : undefined}
              />
              <text
                x={214} y={124}
                textAnchor="middle"
                fontSize={18}
                fontWeight={700}
                className={glow("soma") ? "fill-violet-600 dark:fill-violet-400" : "fill-foreground"}
              >
                Σ
              </text>
              <text
                x={214} y={166}
                textAnchor="middle"
                fontSize={11}
                className={glow("soma") ? "fill-violet-600 dark:fill-violet-400 font-semibold" : "fill-muted-foreground"}
              >
                z = Σ wᵢxᵢ + b
              </text>
              {/* bias */}
              <g opacity={glow("soma") ? 1 : 0.75}>
                <line x1={214} y1={158} x2={214} y2={148} stroke="currentColor" className="text-muted-foreground" strokeWidth={1.5} />
                <text x={238} y={156} fontSize={11} className="fill-muted-foreground">
                  + b
                </text>
              </g>
            </g>

            {/* axon -> activation */}
            <g>
              <line
                x1={246} y1={118} x2={288} y2={118}
                stroke={glow("axon") ? "#f97316" : "currentColor"}
                className={glow("axon") ? "" : "text-muted-foreground/60"}
                strokeWidth={glow("axon") ? 4 : 2}
                style={glow("axon") ? { filter: "drop-shadow(0 0 6px #f97316aa)" } : undefined}
              />
              <rect
                x={290} y={92} width={64} height={52} rx={10}
                fill={glow("axon") ? "#f9731622" : "currentColor"}
                className={glow("axon") ? "" : "text-muted-foreground/15"}
                stroke={glow("axon") ? "#f97316" : "currentColor"}
                strokeWidth={glow("axon") ? 3.5 : 2}
                style={glow("axon") ? { filter: "drop-shadow(0 0 7px #f97316aa)" } : undefined}
              />
              <text
                x={322} y={114}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                className={glow("axon") ? "fill-orange-600 dark:fill-orange-400" : "fill-foreground"}
              >
                f(z)
              </text>
              <text x={322} y={132} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
                activation
              </text>
            </g>

            {/* output */}
            <g>
              <line x1={356} y1={118} x2={384} y2={118} stroke="currentColor" className="text-muted-foreground/60" strokeWidth={2} />
              <circle
                cx={384} cy={118} r={12}
                fill={glow("axon") ? "#f97316" : "currentColor"}
                className={glow("axon") ? "" : "text-muted-foreground/40"}
                style={glow("axon") ? { filter: "drop-shadow(0 0 6px #f97316aa)" } : undefined}
              />
              <text x={384} y={122} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-background">
                y
              </text>
              <text x={384} y={148} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
                output
              </text>
            </g>
          </svg>

          {/* mapping card */}
          <div className="min-h-[5.2rem]">
            <AnimatePresence mode="wait">
              {active ? (
                <motion.div
                  key={part}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="rounded-xl border bg-muted/40 p-3"
                >
                  <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                    <span style={{ color: active.bioColor }}>{active.bio}</span>
                    <span className="text-muted-foreground">maps to</span>
                    <span className="text-primary">{active.art}</span>
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{active.text}</p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-dashed bg-card p-3 text-xs text-muted-foreground"
                >
                  Select a biological part to reveal the correspondence. The matching artificial
                  component glows on the right.
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 rounded-lg bg-muted/50 px-3 py-2">
            {PARTS.map((p) => (
              <button
                key={p}
                onClick={() => setPart(part === p ? null : p)}
                className={cn(
                  "flex items-center gap-1.5 text-[11px] font-medium transition-opacity",
                  part && part !== p ? "opacity-45" : "opacity-100"
                )}
              >
                <span className="h-2.5 w-2.5 rounded-sm" style={{ background: MAPPING[p].bioColor }} />
                <span className="text-muted-foreground">{MAPPING[p].bio}</span>
                <span className="text-muted-foreground/50">→</span>
                <span className="text-foreground">{MAPPING[p].art}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
