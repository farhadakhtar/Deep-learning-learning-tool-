"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Info } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WidgetFrame, Stat, WidgetControls } from "./frame";
import { cn } from "@/lib/utils";

const PRESETS: { label: string; N: number; F: number; P: number; S: number; note?: string }[] = [
  { label: "N=5 F=3 S=1 P=0", N: 5, F: 3, P: 0, S: 1, note: "notes Ex 3.1 setup" },
  { label: "N=5 F=3 S=1 P=1", N: 5, F: 3, P: 1, S: 1, note: "same (Figure 3.1)" },
  { label: "N=7 F=3 S=2 P=0", N: 7, F: 3, P: 0, S: 2, note: "notes Ex 3.2a" },
  { label: "N=9 F=3 S=2 P=1", N: 9, F: 3, P: 1, S: 2, note: "notes Ex 3.2b" },
];

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [n, setN] = useState(5);
  const [f, setF] = useState(3);
  const [p, setP] = useState(0);
  const [s, setS] = useState(1);

  const raw = n + 2 * p - f;
  const O = Math.floor(raw / s) + 1;
  const valid = raw >= 0 && O >= 1;
  const samePad = Math.floor((f - 1) / 2);

  const padded = n + 2 * p;
  const cell = Math.min(200 / padded, 200 / Math.max(O, 1), 26);

  // SVG geometry
  const W = 680;
  const H = 300;
  const inputX = 40;
  const outX = W - 60 - O * cell;
  const gridY = (H - Math.max(padded, O) * cell) / 2;

  const cells: { x: number; y: number; isPad: boolean }[] = [];
  for (let r = 0; r < padded; r++) {
    for (let c = 0; c < padded; c++) {
      cells.push({ x: inputX + c * cell, y: gridY + r * cell, isPad: r < p || r >= p + n || c < p || c >= p + n });
    }
  }

  return (
    <WidgetFrame
      title={title ?? "Output size calculator"}
      description={description ?? "Live version of O = floor((N + 2P − F)/S) + 1 — see how padding, stride and filter size shape the feature map."}
    >
      <WidgetControls className="mb-4">
        <div className="flex min-w-[150px] flex-1 flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Input size N</span>
            <span className="font-mono text-xs text-primary">{n}</span>
          </label>
          <Slider value={[n]} onValueChange={(v) => setN(v[0])} min={4} max={32} step={1} aria-label="Input size N" />
        </div>
        <div className="flex min-w-[150px] flex-1 flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Padding P</span>
            <span className="font-mono text-xs text-primary">{p}</span>
          </label>
          <Slider value={[p]} onValueChange={(v) => setP(v[0])} min={0} max={3} step={1} aria-label="Padding P" />
        </div>
        <div className="flex min-w-[150px] flex-1 flex-col gap-1">
          <label className="flex items-center justify-between text-xs font-medium">
            <span>Stride S</span>
            <span className="font-mono text-xs text-primary">{s}</span>
          </label>
          <Slider value={[s]} onValueChange={(v) => setS(v[0])} min={1} max={3} step={1} aria-label="Stride S" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium">Filter size F</span>
          <div className="flex gap-1">
            {[3, 5, 7].map((size) => (
              <Button
                key={size}
                size="sm"
                variant={f === size ? "default" : "outline"}
                onClick={() => setF(size)}
                className="h-9 min-w-11"
                aria-label={`Filter size ${size}`}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      </WidgetControls>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-muted-foreground">Presets:</span>
        {PRESETS.map((preset) => (
          <Button
            key={preset.label}
            size="sm"
            variant="outline"
            className="h-8 px-2 text-[11px]"
            onClick={() => {
              setN(preset.N);
              setF(preset.F);
              setP(preset.P);
              setS(preset.S);
            }}
          >
            {preset.label}
            {preset.note ? ` (${preset.note})` : ""}
          </Button>
        ))}
      </div>

      {/* Formula with substituted values */}
      <div className="mb-4 rounded-xl border bg-muted/40 p-3 text-center">
        <p className="font-mono text-xs leading-relaxed sm:text-sm">
          O = ⌊(N + 2P − F) / S⌋ + 1 = ⌊({n} + 2×{p} − {f}) / {s}⌋ + 1 = ⌊{raw} / {s}⌋ + 1 ={" "}
          <span className={cn("font-bold", valid ? "text-primary" : "text-destructive")}>{valid ? O : "—"}</span>
        </p>
        <div className="mt-2 flex justify-center">
          {valid && O === n && <Badge className="bg-emerald-600 hover:bg-emerald-600">SAME (O = N)</Badge>}
          {valid && O < n && <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">shrinks by {n - O}</Badge>}
          {valid && O > n && <Badge variant="outline" className="border-sky-500/50 text-sky-600 dark:text-sky-400">grows by {O - n}</Badge>}
          {!valid && <Badge variant="destructive">filter does not fit — no valid positions</Badge>}
        </div>
      </div>

      {/* SVG diagram */}
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Input grid with padding next to output grid">
        {/* input cells */}
        {cells.map((c, i) => (
          <rect
            key={i}
            x={c.x}
            y={c.y}
            width={cell}
            height={cell}
            rx={2}
            className={c.isPad ? "fill-muted/60 stroke-muted-foreground/40" : "fill-primary/15 stroke-primary/50"}
            strokeWidth={1}
            strokeDasharray={c.isPad ? "3 2" : undefined}
          />
        ))}
        <text x={inputX + (padded * cell) / 2} y={gridY + padded * cell + 18} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
          input N={n} (+{p} pad) — {padded}×{padded}
        </text>

        {/* arrow */}
        <g>
          <motion.line
            x1={inputX + padded * cell + 24}
            y1={H / 2}
            x2={outX - 24}
            y2={H / 2}
            stroke="currentColor"
            strokeWidth={2}
            className="text-primary"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" className="fill-primary" />
            </marker>
          </defs>
          <text x={(inputX + padded * cell + outX) / 2} y={H / 2 - 12} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
            stride S = {s}
          </text>
          <text x={(inputX + padded * cell + outX) / 2} y={H / 2 + 20} textAnchor="middle" className="fill-muted-foreground font-mono text-[10px]">
            filter {f}×{f} slides by {s}
          </text>
        </g>

        {/* output cells */}
        {valid &&
          Array.from({ length: O * O }, (_, i) => {
            const r = Math.floor(i / O);
            const c = i % O;
            return (
              <motion.rect
                key={i}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                x={outX + c * cell}
                y={gridY + r * cell}
                width={cell}
                height={cell}
                rx={2}
                className="fill-u2/25 stroke-u2/70"
                strokeWidth={1}
                style={{ transformOrigin: `${outX + c * cell + cell / 2}px ${gridY + r * cell + cell / 2}px` }}
              />
            );
          })}
        {valid && (
          <text x={outX + (O * cell) / 2} y={gridY + O * cell + 18} textAnchor="middle" className="fill-foreground font-mono text-[11px]">
            output O = {O} — {O}×{O}
          </text>
        )}
      </svg>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label="N (input)" value={n} />
        <Stat label="F (filter)" value={`${f} x ${f}`} />
        <Stat label="P / S" value={`P = ${p}, S = ${s}`} />
        <Stat label="O (output)" value={valid ? O : "invalid"} tone="accent" />
      </div>

      {/* Same-padding derivation */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-xs leading-relaxed">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <div>
          <p className="font-semibold">Where does same padding come from?</p>
          <p className="mt-1 font-mono text-[11px] leading-relaxed">
            O = N ⟹ N = (N + 2P − F)/1 + 1 ⟹ N − 1 = N + 2P − F ⟹ 2P = F − 1 ⟹ P = (F − 1)/2
          </p>
          <p className="mt-1 text-muted-foreground">
            For the current F = {f}: P = ({f} − 1)/2 = {samePad}
            {f % 2 === 1 ? " — a whole number, which is why CNN filters almost always use odd sizes." : " — not a whole number, so same padding is impossible with even filter sizes."}
          </p>
        </div>
      </div>
    </WidgetFrame>
  );
}
