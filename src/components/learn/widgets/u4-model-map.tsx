"use client";

import { useState } from "react";
import { WidgetFrame, Stat, WidgetControls } from "./frame";
import { AnimatePresence, motion } from "framer-motion";
import { Network, X } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* Data: 4 families, 8 models — facts from the notes' summary table 9.1 */
/* ------------------------------------------------------------------ */

type ModelInfo = {
  id: string;
  name: string;
  cat: number;
  how: string;
  type: string;
  training: string;
  latent: string;
  use: string;
};

const CATS = [
  {
    name: "Compress & Reconstruct",
    blurb: "bottleneck + rebuild x",
    color: "#0ea5e9",
    x: 148,
    y: 74,
  },
  {
    name: "Adversarial Game",
    blurb: "two-player minimax",
    color: "#f43f5e",
    x: 590,
    y: 74,
  },
  {
    name: "Least Bias Principle",
    blurb: "least-biased choice",
    color: "#f59e0b",
    x: 590,
    y: 292,
  },
  {
    name: "Energy-Based",
    blurb: "P(v,h) \u221D exp(\u2212E)",
    color: "#8b5cf6",
    x: 196,
    y: 292,
  },
];

const MODELS: (ModelInfo & { x: number; y: number })[] = [
  {
    id: "ae",
    name: "Autoencoder",
    cat: 0,
    x: 66,
    y: 196,
    how: "Compress x through a narrow bottleneck and reconstruct it — the reconstruction error \u2016x\u2212x\u0302\u2016\u00B2 is the only training signal, so the code must keep what matters.",
    type: "Deterministic (neither directed nor undirected)",
    training: "Backprop, minimise \u2016x\u2212x\u0302\u2016\u00B2",
    latent: "Deterministic code z",
    use: "Compression, denoising, pretraining",
  },
  {
    id: "vae",
    name: "VAE",
    cat: 0,
    x: 230,
    y: 196,
    how: "Learn p(x) explicitly: a Gaussian encoder q(z|x) = N(\u03BC, \u03C3\u00B2), a sample z = \u03BC + \u03C3\u2299\u03B5 via the reparameterization trick, trained by maximising the ELBO.",
    type: "Directed, probabilistic",
    training: "Backprop on ELBO (reparameterization trick)",
    latent: "Continuous z, prior N(0, I)",
    use: "Generation with smooth latent space",
  },
  {
    id: "gan",
    name: "GAN",
    cat: 1,
    x: 590,
    y: 196,
    how: "Never writes p(x) down — the generator learns to sample from it implicitly by fooling the discriminator in a two-player minimax game.",
    type: "Implicit (adversarial)",
    training: "Minimax game, alternating gradient steps",
    latent: "Noise z (no structure imposed)",
    use: "High-fidelity sample generation",
  },
  {
    id: "maxent",
    name: "Max Entropy",
    cat: 2,
    x: 590,
    y: 412,
    how: "Not a network but a principle (Jaynes, 1957): among all distributions matching the known constraints, choose the one with maximum entropy — no hidden assumptions.",
    type: "Probabilistic principle (constrained optimisation)",
    training: "Lagrange multipliers",
    latent: "None — it selects a whole distribution",
    use: "Justifies softmax, the Gaussian and the Boltzmann distribution",
  },
  {
    id: "rbm",
    name: "RBM",
    cat: 3,
    x: 44,
    y: 418,
    how: "Define an energy E(v,h); probability follows P(v,h) \u221D exp(\u2212E). Training pushes data-like configurations toward low energy.",
    type: "Undirected, energy-based",
    training: "Contrastive Divergence (CD-k)",
    latent: "Binary stochastic h",
    use: "Feature learning, pretraining",
  },
  {
    id: "dbn",
    name: "DBN",
    cat: 3,
    x: 150,
    y: 440,
    how: "Stack RBMs greedily, one layer at a time; only the top two layers stay undirected, the rest become directed (top-down).",
    type: "Hybrid: top layer undirected, rest directed",
    training: "Greedy layer-wise CD, then fine-tune",
    latent: "Stacked h\u00B9, h\u00B2, \u2026",
    use: "Pretraining deep nets, classification",
  },
  {
    id: "dbm",
    name: "DBM",
    cat: 3,
    x: 256,
    y: 440,
    how: "One global energy over all layers with every connection undirected — inference flows bottom-up AND top-down (mean-field).",
    type: "Fully undirected",
    training: "Greedy pretrain + joint mean-field fine-tune",
    latent: "Stacked h\u00B9, h\u00B2, \u2026 (bidirectional)",
    use: "Robust joint / multi-modal modelling",
  },
  {
    id: "convbm",
    name: "ConvBM",
    cat: 3,
    x: 362,
    y: 418,
    how: "An energy-based model whose weights are shared local filters sliding over the image — CNN weight-sharing inside a Boltzmann machine.",
    type: "Undirected, weight-shared",
    training: "CD + probabilistic max-pooling",
    latent: "Spatial feature maps",
    use: "Hierarchical image feature learning",
  },
];

/* ------------------------------------------------------------------ */

export default function Component({ title, description }: { title?: string; description?: string }) {
  const [selected, setSelected] = useState<string | null>("ae");
  const [hoverCat, setHoverCat] = useState<number | null>(null);

  const model = MODELS.find((m) => m.id === selected) ?? null;
  const activeCat = hoverCat ?? (model ? model.cat : null);

  return (
    <WidgetFrame
      title={title ?? "The Deep Unsupervised Learning Model Map"}
      description={description ?? "Every model in this unit answers the same question differently: how do I learn a good model of p(x) using only unlabelled data? Click a model node."
      }
      accent="u4"
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_310px]">
        {/* ---------------- constellation ---------------- */}
        <div className="min-w-0">
          <WidgetControls className="mb-3 justify-center">
            {CATS.map((c, i) => (
              <span
                key={c.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-background px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
                onMouseEnter={() => setHoverCat(i)}
                onMouseLeave={() => setHoverCat(null)}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </WidgetControls>

          <svg viewBox="0 0 748 470" className="h-auto w-full select-none" role="img" aria-label="Model family map">
            {/* edges: hub -> model */}
            {MODELS.map((m) => {
              const c = CATS[m.cat];
              const dim = activeCat !== null && activeCat !== m.cat;
              return (
                <line
                  key={`e-${m.id}`}
                  x1={c.x}
                  y1={c.y}
                  x2={m.x}
                  y2={m.y}
                  stroke={c.color}
                  strokeWidth={selected === m.id ? 3 : 1.6}
                  strokeOpacity={dim ? 0.15 : selected === m.id ? 0.95 : 0.5}
                  strokeDasharray={selected === m.id ? undefined : "5 4"}
                />
              );
            })}

            {/* edges: center p(x) question -> hubs */}
            {CATS.map((c, i) => {
              const dim = activeCat !== null && activeCat !== i;
              return (
                <line
                  key={`c-${i}`}
                  x1={374}
                  y1={196}
                  x2={c.x}
                  y2={c.y + (c.y < 196 ? 26 : -26)}
                  stroke="currentColor"
                  className="text-muted-foreground"
                  strokeWidth={1}
                  strokeDasharray="2 5"
                  strokeOpacity={dim ? 0.15 : 0.55}
                />
              );
            })}

            {/* center node */}
            <g>
              <circle cx={374} cy={196} r={34} className="fill-muted" stroke="currentColor" strokeOpacity={0.35} />
              <text x={374} y={193} textAnchor="middle" className="fill-foreground font-mono" fontSize={17} fontWeight={700}>
                p(x)
              </text>
              <text x={374} y={209} textAnchor="middle" className="fill-muted-foreground" fontSize={8.5}>
                from unlabelled data
              </text>
            </g>

            {/* category hubs */}
            {CATS.map((c, i) => {
              const dim = activeCat !== null && activeCat !== i;
              return (
                <g
                  key={c.name}
                  opacity={dim ? 0.35 : 1}
                  onMouseEnter={() => setHoverCat(i)}
                  onMouseLeave={() => setHoverCat(null)}
                  style={{ cursor: "pointer" }}
                >
                  <rect
                    x={c.x - 84}
                    y={c.y - 22}
                    width={168}
                    height={44}
                    rx={22}
                    className="fill-card"
                    stroke={c.color}
                    strokeWidth={2}
                  />
                  <text x={c.x} y={c.y - 2} textAnchor="middle" className="fill-foreground" fontSize={12.5} fontWeight={700}>
                    {c.name}
                  </text>
                  <text x={c.x} y={c.y + 13} textAnchor="middle" className="fill-muted-foreground" fontSize={8.5}>
                    {c.blurb}
                  </text>
                </g>
              );
            })}

            {/* model nodes */}
            {MODELS.map((m) => {
              const c = CATS[m.cat];
              const dim = activeCat !== null && activeCat !== m.cat;
              const isSel = selected === m.id;
              const w = 78;
              return (
                <motion.g
                  key={m.id}
                  style={{ cursor: "pointer", transformBox: "fill-box", transformOrigin: "center" }}
                  opacity={dim ? 0.4 : 1}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isSel ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={
                    isSel
                      ? { duration: 0.9, repeat: Infinity, repeatDelay: 1.2 }
                      : { type: "spring", stiffness: 400, damping: 17 }
                  }
                  onClick={() => setSelected(isSel ? null : m.id)}
                >
                  <rect
                    x={m.x - w / 2}
                    y={m.y - 19}
                    width={w}
                    height={38}
                    rx={12}
                    className="fill-card"
                    stroke={isSel ? c.color : "currentColor"}
                    strokeOpacity={isSel ? 1 : 0.3}
                    strokeWidth={isSel ? 3 : 1.4}
                    style={{ filter: isSel ? `drop-shadow(0 0 6px ${c.color}66)` : undefined }}
                  />
                  <text x={m.x} y={m.y + 5} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-foreground font-mono">
                    {m.name === "Max Entropy" ? "Max Ent" : m.name}
                  </text>
                </motion.g>
              );
            })}
          </svg>
        </div>

        {/* ---------------- detail card ---------------- */}
        <div className="min-w-0">
          <AnimatePresence mode="wait">
            {model ? (
              <motion.div
                key={model.id}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                className="rounded-xl border bg-muted/30 p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: CATS[model.cat].color }} />
                      <h4 className="text-sm font-bold text-foreground">{model.name}</h4>
                    </div>
                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {CATS[model.cat].name}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    aria-label="Close model details"
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 rounded-lg bg-background p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    How it learns p(x)
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-foreground">{model.how}</p>
                </div>

                <div className="mt-3 grid gap-2">
                  <Stat label="Directed / Undirected" value={model.type} mono={false} />
                  <Stat label="Training" value={model.training} mono={false} />
                  <Stat label="Latent variable" value={model.latent} mono={false} />
                  <Stat label="Typical use" value={model.use} mono={false} tone="accent" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full min-h-[220px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-6 text-center"
              >
                <Network className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Click any model node on the map to inspect how it learns p(x), its type, training method, latent
                  variable and typical use.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <p className={cn("mt-3 text-[11px] leading-relaxed text-muted-foreground")}>
            Key idea: the &ldquo;supervision&rdquo; in unsupervised learning comes from the data itself — reconstruct it,
            tell real from fake, or lower its energy.
          </p>
        </div>
      </div>
    </WidgetFrame>
  );
}
