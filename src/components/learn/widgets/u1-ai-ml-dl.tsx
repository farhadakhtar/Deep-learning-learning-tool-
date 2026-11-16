"use client";

import { useState } from "react";
import { WidgetFrame } from "./frame";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MousePointerClick } from "lucide-react";

type Region = "ai" | "ml" | "dl" | null;

const REGION_INFO: Record<
  Exclude<Region, null>,
  { title: string; color: string; body: string; examples: string }
> = {
  ai: {
    title: "Artificial Intelligence (AI)",
    color: "#0ea5e9",
    body: "The broadest field: systems that perform tasks normally requiring human intelligence — reasoning, perception, language, decision-making. Includes rule-based expert systems, search, planning, and learning.",
    examples: "Expert systems, game-playing agents, path planners",
  },
  ml: {
    title: "Machine Learning (ML)",
    color: "#8b5cf6",
    body: "A subset of AI: instead of being explicitly programmed, algorithms learn patterns from data and improve with experience. Features are still often designed by hand.",
    examples: "Linear regression, decision trees, spam filters",
  },
  dl: {
    title: "Deep Learning (DL)",
    color: "#f97316",
    body: "A subset of ML: multi-layer (\"deep\") neural networks learn hierarchical representations end-to-end from raw data — removing the need for manual feature engineering.",
    examples: "CNNs for vision, Transformers for language",
  },
};

const STEPS = [
  {
    key: "edges",
    label: "Edges",
    caption: "Early layers detect simple edges — lines, corners, gradients of intensity.",
  },
  {
    key: "shapes",
    label: "Shapes / textures",
    caption: "Middle layers group edges into shapes and texture patterns — curves, blobs, repeated motifs.",
  },
  {
    key: "parts",
    label: "Object parts",
    caption: "Deeper layers assemble shapes into object parts — an ear, an eye, a whisker region.",
  },
  {
    key: "object",
    label: "Whole object",
    caption: "Final layers recognise the whole object — a cat face — directly from raw pixels.",
  },
];

/* Small illustration for each hierarchy level (a cat face being built up) */
function StepArt({ step }: { step: number }) {
  const stroke = "currentColor";
  return (
    <svg viewBox="0 0 160 120" className="h-full w-full text-u1" aria-hidden>
      {step === 0 && (
        <g strokeWidth={2.5} strokeLinecap="round" fill="none">
          {/* raw edges only: unconnected line segments */}
          <path d="M55 62 L72 55" />
          <path d="M88 55 L105 62" />
          <path d="M70 40 L64 30" />
          <path d="M90 40 L96 30" />
          <path d="M64 76 L60 84" />
          <path d="M96 76 L100 84" />
          <path d="M78 68 L82 68" />
          <path d="M50 55 L46 62" />
          <path d="M110 55 L114 62" />
        </g>
      )}
      {step === 1 && (
        <g strokeWidth={2.5} strokeLinecap="round" fill="none">
          {/* shapes / textures: grouped circles, triangles */}
          <circle cx={72} cy={58} r={7} strokeDasharray="3 3" />
          <circle cx={88} cy={58} r={7} strokeDasharray="3 3" />
          <path d="M66 42 L60 26 L76 36 Z" />
          <path d="M94 42 L100 26 L84 36 Z" />
          <rect x={68} y={72} width={24} height={12} rx={6} strokeDasharray="4 3" />
          <path d="M46 60 q4 8 0 16" opacity={0.6} />
          <path d="M114 60 q-4 8 0 16" opacity={0.6} />
        </g>
      )}
      {step === 2 && (
        <g strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* object parts: an eye, ears, nose assembled in place */}
          <path d="M64 46 L58 28 L78 38 Z" />
          <path d="M96 46 L102 28 L82 38 Z" />
          <g>
            <ellipse cx={71} cy={60} rx={9} ry={7} />
            <circle cx={71} cy={60} r={3} fill={stroke} stroke="none" />
          </g>
          <g>
            <ellipse cx={89} cy={60} rx={9} ry={7} opacity={0.35} />
          </g>
          <path d="M75 74 L85 74 L80 80 Z" />
        </g>
      )}
      {step === 3 && (
        <g strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* whole object: cat face */}
          <path d="M62 44 L56 24 L78 36" />
          <path d="M98 44 L104 24 L82 36" />
          <circle cx={80} cy={60} r={32} />
          <ellipse cx={70} cy={57} rx={4} ry={6} fill={stroke} stroke="none" />
          <ellipse cx={90} cy={57} rx={4} ry={6} fill={stroke} stroke="none" />
          <path d="M76 70 L84 70 L80 75 Z" fill={stroke} stroke="none" />
          <path d="M62 66 q6 5 12 0" opacity={0.55} />
          <path d="M86 66 q6 5 12 0" opacity={0.55} />
          <path d="M56 60 L42 56 M56 64 L42 66" opacity={0.7} />
          <path d="M104 60 L118 56 M104 64 L118 66" opacity={0.7} />
        </g>
      )}
    </svg>
  );
}

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [region, setRegion] = useState<Region>("dl");
  const [step, setStep] = useState(0);

  const info = region ? REGION_INFO[region] : null;

  return (
    <WidgetFrame
      title={title ?? "AI, ML and Deep Learning — How They Nest"}
      description={
        description ??
        "Deep Learning is a subset of Machine Learning, which is a subset of Artificial Intelligence. Click a region to explore it, then step through how a deep network builds an image understanding layer by layer."
      }
      accent="u1"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {/* ---------------- Left: nested diagram ---------------- */}
        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MousePointerClick className="h-3.5 w-3.5" />
            Click a region in the nested diagram
          </p>
          <svg viewBox="0 0 340 270" className="mx-auto w-full max-w-sm" role="img">
            {/* AI region */}
            <g onClick={() => setRegion("ai")} className="cursor-pointer">
              <rect
                x={8} y={8} width={324} height={254} rx={18}
                fill={region === "ai" ? "#0ea5e918" : "#0ea5e90d"}
                stroke="#0ea5e9"
                strokeWidth={region === "ai" ? 3 : 1.5}
              />
              <text x={24} y={36} className="fill-sky-600 dark:fill-sky-400" fontSize={15} fontWeight={700}>
                Artificial Intelligence
              </text>
              <text x={24} y={53} fontSize={10.5} className="fill-sky-700/70 dark:fill-sky-300/60">
                any technique enabling machines to act "intelligently"
              </text>
            </g>
            {/* ML region */}
            <g onClick={() => setRegion("ml")} className="cursor-pointer">
              <rect
                x={36} y={66} width={268} height={178} rx={16}
                fill={region === "ml" ? "#8b5cf618" : "#8b5cf60d"}
                stroke="#8b5cf6"
                strokeWidth={region === "ml" ? 3 : 1.5}
              />
              <text x={52} y={92} className="fill-violet-600 dark:fill-violet-400" fontSize={14} fontWeight={700}>
                Machine Learning
              </text>
              <text x={52} y={108} fontSize={10.5} className="fill-violet-700/70 dark:fill-violet-300/60">
                learn patterns from data, not hand-written rules
              </text>
            </g>
            {/* DL region */}
            <g onClick={() => setRegion("dl")} className="cursor-pointer">
              <rect
                x={64} y={122} width={212} height={100} rx={14}
                fill={region === "dl" ? "#f9731622" : "#f9731612"}
                stroke="#f97316"
                strokeWidth={region === "dl" ? 3 : 1.5}
              />
              <text x={80} y={152} className="fill-orange-600 dark:fill-orange-400" fontSize={14} fontWeight={700}>
                Deep Learning
              </text>
              <text x={80} y={170} fontSize={10.5} className="fill-orange-700/70 dark:fill-orange-300/60">
                multi-layer neural networks,
              </text>
              <text x={80} y={184} fontSize={10.5} className="fill-orange-700/70 dark:fill-orange-300/60">
                end-to-end feature learning
              </text>
            </g>
            {/* subset arrows */}
            <g stroke="currentColor" className="text-muted-foreground/50" strokeWidth={1.2} fill="none">
              <path d="M292 30 L318 30" markerEnd="url(#arrowU1a)" />
            </g>
          </svg>

          {/* Explanation card */}
          <AnimatePresence mode="wait">
            {info && (
              <motion.div
                key={region}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="rounded-xl border bg-muted/40 p-3.5"
              >
                <p className="text-sm font-semibold" style={{ color: info.color }}>
                  {info.title}
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{info.body}</p>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                  examples: {info.examples}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------------- Right: hierarchical feature stepper ---------------- */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium text-muted-foreground">
            How a deep network recognises an image — through depth
          </p>
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStep(i)}
                className={cn(
                  "flex-1 rounded-lg border px-1 py-2 text-center text-[11px] font-medium transition-colors",
                  i === step
                    ? "border-u1 bg-u1/10 text-u1"
                    : "border-border bg-card text-muted-foreground hover:bg-muted/60"
                )}
              >
                <span className="block font-mono text-[10px] opacity-70">{i + 1}</span>
                {s.label}
              </button>
            ))}
          </div>

          <div className="relative flex h-44 items-center justify-center overflow-hidden rounded-xl border bg-gradient-to-b from-muted/40 to-card p-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.28 }}
                className="flex h-full w-full items-center justify-center"
              >
                <div className="h-36 w-48">
                  <StepArt step={step} />
                </div>
              </motion.div>
            </AnimatePresence>
            <span className="absolute left-3 top-2.5 rounded-md bg-u1/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-u1">
              layer {step + 1} / 4
            </span>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-[2.6rem] text-xs leading-relaxed text-muted-foreground"
            >
              <span className="font-semibold text-foreground">{STEPS[step].label}: </span>
              {STEPS[step].caption}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-2">
            <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              disabled={step === STEPS.length - 1}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            Unlike classical ML, deep learning removes manual feature engineering: the network learns
            this hierarchy of representations automatically, directly from raw data.
          </p>
        </div>
      </div>
    </WidgetFrame>
  );
}
