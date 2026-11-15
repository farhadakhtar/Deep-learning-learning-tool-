"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { WidgetFrame, WidgetControls, PlayButton } from "./frame";
import { cn } from "@/lib/utils";
import { ArrowRight, Heart, Image as ImageIcon, Languages, Tags } from "lucide-react";

/* ---------- geometry ---------- */
const IN_Y = 252;
const CELL_Y = 148;
const R = 26;
const HALF = 22;

type NodeDef = { x: number; label: string };
type PatternDef = {
  id: string;
  name: string;
  blurb: string;
  useCase: string;
  icon: React.ComponentType<{ className?: string }>;
  inputs: NodeDef[];
  cells: NodeDef[];
  outputs: number[];
  outputLabels: string[];
  bridge?: { from: number; to: number };
  decoderStart?: number;
  feedback?: boolean;
};

const PATTERNS: PatternDef[] = [
  {
    id: "one-one",
    name: "One-to-one",
    blurb: "A single input maps to a single output — the recurrence degenerates into a normal feedforward layer (rarely used with recurrence, shown for completeness).",
    useCase: "Normal feedforward network",
    icon: ArrowRight,
    inputs: [{ x: 400, label: "x" }],
    cells: [{ x: 400, label: "h" }],
    outputs: [0],
    outputLabels: ["y"],
  },
  {
    id: "one-many",
    name: "One-to-many",
    blurb: "One input is consumed at the first step; the cell then keeps re-applying itself to its own state to produce a whole output sequence.",
    useCase: "Image captioning (one image, a sentence of words)",
    icon: ImageIcon,
    inputs: [{ x: 300, label: "x" }],
    cells: [
      { x: 300, label: "h₁" },
      { x: 480, label: "h₂" },
      { x: 660, label: "h₃" },
    ],
    outputs: [0, 1, 2],
    outputLabels: ["y₁", "y₂", "y₃"],
  },
  {
    id: "many-one",
    name: "Many-to-one",
    blurb: "A whole input sequence is read one step at a time; a single output is produced from the final hidden state, which summarizes the sequence.",
    useCase: "Sentiment classification (this is the pattern of Worked Example 1)",
    icon: Heart,
    inputs: [
      { x: 160, label: "x₁" },
      { x: 360, label: "x₂" },
      { x: 560, label: "x₃" },
    ],
    cells: [
      { x: 160, label: "h₁" },
      { x: 360, label: "h₂" },
      { x: 560, label: "h₃" },
    ],
    outputs: [2],
    outputLabels: ["y"],
  },
  {
    id: "many-aligned",
    name: "Many-to-many (aligned)",
    blurb: "One output per input, at every time step — the input and output sequences have the same length and stay aligned.",
    useCase: "Part-of-speech tagging (a tag for every word)",
    icon: Tags,
    inputs: [
      { x: 160, label: "x₁" },
      { x: 360, label: "x₂" },
      { x: 560, label: "x₃" },
    ],
    cells: [
      { x: 160, label: "h₁" },
      { x: 360, label: "h₂" },
      { x: 560, label: "h₃" },
    ],
    outputs: [0, 1, 2],
    outputLabels: ["y₁", "y₂", "y₃"],
  },
  {
    id: "enc-dec",
    name: "Many-to-many (encoder–decoder)",
    blurb: "An encoder RNN compresses the whole input into a context vector; a separate decoder RNN generates the (possibly different-length) output sequence from it.",
    useCase: "Machine translation (different-length source and target)",
    icon: Languages,
    inputs: [
      { x: 100, label: "x₁" },
      { x: 220, label: "x₂" },
      { x: 340, label: "x₃" },
    ],
    cells: [
      { x: 100, label: "h₁" },
      { x: 220, label: "h₂" },
      { x: 340, label: "h₃" },
      { x: 480, label: "s₁" },
      { x: 600, label: "s₂" },
      { x: 720, label: "s₃" },
    ],
    outputs: [3, 4, 5],
    outputLabels: ["y₁", "y₂", "y₃"],
    bridge: { from: 2, to: 3 },
    decoderStart: 3,
    feedback: true,
  },
];

function stageLabel(p: PatternDef, s: number, maxStage: number): string {
  if (s >= maxStage) return "sequence complete";
  if (p.id === "enc-dec") {
    if (s < 3) return `encoder: x${s + 1} -> h${s + 1}`;
    if (s === 3) return "context vector";
    return `decoder: s${s - 3} -> y${s - 3}`;
  }
  if (p.id === "one-one") return "x -> h -> y";
  if (p.id === "one-many") return s === 0 ? "x -> h₁" : `h${s} -> h${s + 1}, y${s + 1}`;
  return `x${s + 1} -> h${s + 1}${p.outputs.length > 1 ? `, y${s + 1}` : ""}`;
}

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [pid, setPid] = useState("many-one");
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [folded, setFolded] = useState(false);

  const p = PATTERNS.find((q) => q.id === pid) ?? PATTERNS[2];
  const maxStage = p.cells.length + (p.bridge ? 1 : 0);
  const done = stage >= maxStage;

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStage((s) => (s + 1) % (maxStage + 1)), 900);
    return () => clearInterval(id);
  }, [playing, maxStage]);

  // animation stage of cell i (bridge takes one stage between encoder and decoder)
  const stageOf = (i: number) =>
    i + (p.bridge && p.decoderStart !== undefined && i >= p.decoderStart ? 1 : 0);
  const cellLit = (i: number) => done || stage === stageOf(i);
  const inLit = (i: number) => done || stage === stageOf(i);
  const recLit = (i: number) => done || stage === stageOf(i + 1);
  const outLit = (i: number) => done || stage === stageOf(i) + 1;
  const bridgeLit = p.bridge ? done || stage === p.decoderStart! : false;

  const arrowId = (active: boolean, tone: "flow" | "out" = "flow") =>
    active
      ? tone === "out"
        ? "url(#u3sp-ah-out)"
        : "url(#u3sp-ah-on)"
      : "url(#u3sp-ah-off)";

  return (
    <WidgetFrame title={title ?? "Five RNN wiring patterns"} description={description} accent="u3">
      <WidgetControls>
        <div className="flex flex-wrap gap-1.5">
          {PATTERNS.map((q) => (
            <button
              key={q.id}
              onClick={() => {
                setPid(q.id);
                setStage(0);
              }}
              className={cn(
                "min-h-11 rounded-lg border px-3 text-xs font-medium transition-colors",
                q.id === pid
                  ? "border-u3 bg-u3/15 text-u3"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              )}
            >
              {q.name}
            </button>
          ))}
        </div>
        <span className="ml-auto" />
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
          {stageLabel(p, stage, maxStage)}
        </span>
        <PlayButton onClick={() => setPlaying((v) => !v)} playing={playing} label="Pulse" />
      </WidgetControls>

      {pid === "many-one" && (
        <div className="mt-2.5 inline-flex overflow-hidden rounded-lg border">
          <button
            onClick={() => setFolded(false)}
            className={cn(
              "min-h-11 px-3.5 text-xs font-medium transition-colors",
              !folded ? "bg-u3/15 text-u3" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Unrolled
          </button>
          <button
            onClick={() => setFolded(true)}
            className={cn(
              "min-h-11 border-l px-3.5 text-xs font-medium transition-colors",
              folded ? "bg-u3/15 text-u3" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Folded
          </button>
        </div>
      )}

      <div className="mt-2.5 overflow-hidden rounded-xl border bg-gradient-to-b from-muted/30 to-transparent">
        <svg viewBox="0 0 800 300" className="h-auto w-full" role="img" aria-label={`${p.name} RNN wiring diagram`}>
          <defs>
            <marker id="u3sp-ah-off" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-muted-foreground/40" />
            </marker>
            <marker id="u3sp-ah-on" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-u3" />
            </marker>
            <marker id="u3sp-ah-out" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 Z" className="fill-primary" />
            </marker>
          </defs>

          {pid === "many-one" && folded ? (
            /* ---------- folded view: one cell with a feedback loop ---------- */
            <motion.g key="folded" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              {/* feedback loop */}
              <path
                d="M 429 139 C 468 96, 332 96, 371 139"
                fill="none"
                strokeWidth={2.2}
                markerEnd="url(#u3sp-ah-on)"
                className="stroke-u3 animate-pulse"
              />
              <text x={400} y={88} textAnchor="middle" className="fill-u3 font-mono text-[11px]">
                hₜ fed back
              </text>
              {/* input */}
              <rect x={378} y={IN_Y - HALF} width={HALF * 2} height={HALF * 2} rx={7} className="fill-card stroke-foreground/70 transition-all duration-300" strokeWidth={1.6} />
              <text x={400} y={IN_Y + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px]">xₜ</text>
              <line x1={400} y1={IN_Y - HALF} x2={400} y2={CELL_Y + R + 2} strokeWidth={1.6} className="stroke-u3 transition-all duration-300" markerEnd="url(#u3sp-ah-on)" />
              {/* cell */}
              <circle cx={400} cy={CELL_Y} r={R + 4} className="fill-u3/15 stroke-u3" strokeWidth={2.2} />
              <text x={400} y={CELL_Y + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px]">hₜ</text>
              {/* output */}
              <line x1={400} y1={CELL_Y - R - 4} x2={400} y2={64} strokeWidth={2} className="stroke-primary" markerEnd="url(#u3sp-ah-out)" />
              <text x={400} y={50} textAnchor="middle" className="fill-primary font-mono text-[11px]">y</text>
              <text x={400} y={286} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                folded: the same cell and weights reused at every step
              </text>
            </motion.g>
          ) : (
            <motion.g key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
              {/* inputs */}
              {p.inputs.map((n, i) => (
                <g key={`in-${i}`}>
                  <rect
                    x={n.x - HALF}
                    y={IN_Y - HALF}
                    width={HALF * 2}
                    height={HALF * 2}
                    rx={7}
                    strokeWidth={inLit(i) ? 2.2 : 1.4}
                    className={cn(
                      "transition-all duration-300",
                      inLit(i) ? "stroke-u3 fill-u3/10" : "stroke-foreground/60 fill-card"
                    )}
                  />
                  <text x={n.x} y={IN_Y + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
                    {n.label}
                  </text>
                  <line
                    x1={n.x}
                    y1={IN_Y - HALF}
                    x2={n.x}
                    y2={CELL_Y + R + 2}
                    strokeWidth={inLit(i) ? 2.2 : 1.4}
                    markerEnd={arrowId(inLit(i))}
                    className={cn("transition-all duration-300", inLit(i) ? "stroke-u3" : "stroke-muted-foreground/40")}
                  />
                </g>
              ))}

              {/* recurrent arrows */}
              {p.cells.slice(0, -1).map((c, i) => (
                <line
                  key={`rec-${i}`}
                  x1={c.x + R + 2}
                  y1={CELL_Y}
                  x2={p.cells[i + 1].x - R - 3}
                  y2={CELL_Y}
                  strokeWidth={recLit(i) ? 2.4 : 1.4}
                  markerEnd={arrowId(recLit(i))}
                  className={cn("transition-all duration-300", recLit(i) ? "stroke-u3" : "stroke-muted-foreground/40")}
                />
              ))}

              {/* context-vector bridge */}
              {p.bridge && (
                <g>
                  <line
                    x1={p.cells[p.bridge.from].x + R + 2}
                    y1={CELL_Y}
                    x2={p.cells[p.bridge.to].x - R - 3}
                    y2={CELL_Y}
                    strokeWidth={bridgeLit ? 2.6 : 1.4}
                    markerEnd={arrowId(bridgeLit)}
                    className={cn("transition-all duration-300", bridgeLit ? "stroke-primary" : "stroke-muted-foreground/40")}
                  />
                  <rect
                    x={349}
                    y={96}
                    width={122}
                    height={22}
                    rx={11}
                    strokeWidth={bridgeLit ? 1.8 : 1}
                    className={cn("transition-all duration-300", bridgeLit ? "stroke-primary fill-primary/10" : "stroke-muted-foreground/40 fill-card")}
                  />
                  <text
                    x={410}
                    y={111}
                    textAnchor="middle"
                    className={cn("font-mono text-[10px] transition-colors duration-300", bridgeLit ? "fill-primary" : "fill-muted-foreground")}
                  >
                    context vector
                  </text>
                </g>
              )}

              {/* decoder feedback arcs (own previous output becomes input) */}
              {p.feedback &&
                p.cells.slice(p.decoderStart!, -1).map((c, i) => {
                  const idx = p.decoderStart! + i;
                  const x = c.x;
                  return (
                    <path
                      key={`fb-${i}`}
                      d={`M ${x} 74 C ${x + 42} 74, ${x + 82} 98, ${x + 100} 128`}
                      fill="none"
                      strokeWidth={stage === stageOf(idx + 1) || done ? 1.8 : 1.1}
                      strokeDasharray="5 4"
                      markerEnd="url(#u3sp-ah-off)"
                      className={cn(
                        "transition-all duration-300",
                        stage === stageOf(idx + 1) || done ? "stroke-muted-foreground" : "stroke-muted-foreground/40"
                      )}
                    />
                  );
                })}
              {p.feedback && (
                <text x={536} y={70} className="fill-muted-foreground text-[9px]">prev output fed back</text>
              )}

              {/* cells */}
              {p.cells.map((c, i) => {
                const lit = cellLit(i);
                return (
                  <g key={`cell-${i}`}>
                    <motion.circle
                      cx={c.x}
                      cy={CELL_Y}
                      r={R}
                      fill="var(--u3)"
                      initial={false}
                      animate={{ opacity: lit ? 0.16 : 0 }}
                      transition={{ duration: 0.3 }}
                      pointerEvents="none"
                    />
                    <circle
                      cx={c.x}
                      cy={CELL_Y}
                      r={R}
                      strokeWidth={lit ? 2.4 : 1.5}
                      className={cn("fill-card transition-all duration-300", lit ? "stroke-u3" : "stroke-foreground/60")}
                    />
                    <text x={c.x} y={CELL_Y + 4} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
                      {c.label}
                    </text>
                  </g>
                );
              })}

              {/* outputs */}
              {p.outputs.map((ci, k) => {
                const c = p.cells[ci];
                const lit = outLit(ci);
                return (
                  <g key={`out-${k}`}>
                    <line
                      x1={c.x}
                      y1={CELL_Y - R - 2}
                      x2={c.x}
                      y2={62}
                      strokeWidth={lit ? 2.4 : 1.4}
                      markerEnd={arrowId(lit, "out")}
                      className={cn("transition-all duration-300", lit ? "stroke-primary" : "stroke-muted-foreground/40")}
                    />
                    <text
                      x={c.x}
                      y={48}
                      textAnchor="middle"
                      className={cn("font-mono text-[11px] transition-colors duration-300", lit ? "fill-primary" : "fill-muted-foreground/60")}
                    >
                      {p.outputLabels[k]}
                    </text>
                  </g>
                );
              })}

              <text x={16} y={286} className="fill-muted-foreground text-[10px]">
                square = input xₜ circle = RNN cell hₜ solid = data flow dashed = decoder re-feeds its own output
              </text>
            </motion.g>
          )}
        </svg>
      </div>

      <div className="mt-3 rounded-xl border bg-muted/30 p-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-u3/15 p-2 text-u3">
            <p.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">{p.name}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{p.blurb}</p>
            <p className="mt-1.5 text-xs">
              <span className="font-semibold text-u3">Typical use: </span>
              {p.useCase}
            </p>
          </div>
        </div>
      </div>
    </WidgetFrame>
  );
}
