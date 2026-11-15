"use client";

import { useMemo, useState } from "react";
import { WidgetFrame, WidgetControls } from "./frame";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { CheckCircle2, Crosshair, Dices, Eraser, RefreshCw } from "lucide-react";

/* ---------------- shared plotting helpers ---------------- */
type Pt = { x: number; y: number; name?: string };
const DOM = { xmin: 0, xmax: 8, ymin: 0, ymax: 6 };
const PAD = { l: 38, r: 14, t: 14, b: 32 };
const W = 360;
const H = 280;
const sx = (x: number) => PAD.l + ((x - DOM.xmin) / (DOM.xmax - DOM.xmin)) * (W - PAD.l - PAD.r);
const sy = (y: number) => PAD.t + ((DOM.ymax - y) / (DOM.ymax - DOM.ymin)) * (H - PAD.t - PAD.b);

const CLUSTER_COLORS = ["#0ea5e9", "#f43f5e", "#f59e0b", "#8b5cf6"];
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);
const f2 = (v: number) => v.toFixed(2);

function nearest(p: Pt, centroids: Pt[]) {
  let best = 0;
  let bd = Infinity;
  centroids.forEach((c, i) => {
    const d = dist(p, c);
    if (d < bd - 1e-12) {
      bd = d;
      best = i;
    }
  });
  return best;
}

function means(pts: Pt[], assign: number[], k: number, old: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (let c = 0; c < k; c++) {
    const mine = pts.filter((_, i) => assign[i] === c);
    if (mine.length === 0) {
      out.push(old[c] ?? { x: NaN, y: NaN }); // empty cluster keeps its position
    } else {
      out.push({
        x: mine.reduce((s, p) => s + p.x, 0) / mine.length,
        y: mine.reduce((s, p) => s + p.y, 0) / mine.length,
      });
    }
  }
  return out;
}

/* ---------------- the shared plot ---------------- */
function KMeansPlot({
  points,
  centroids,
  assign,
  onAdd,
}: {
  points: Pt[];
  centroids: Pt[];
  assign: (number | null)[];
  onAdd?: (p: Pt) => void;
}) {
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={cn("w-full", onAdd && "cursor-crosshair")}
      role="img"
      onClick={
        onAdd
          ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const px = ((e.clientX - rect.left) / rect.width) * W;
              const py = ((e.clientY - rect.top) / rect.height) * H;
              const x = DOM.xmin + ((px - PAD.l) / (W - PAD.l - PAD.r)) * (DOM.xmax - DOM.xmin);
              const y = DOM.ymax - ((py - PAD.t) / (H - PAD.t - PAD.b)) * (DOM.ymax - DOM.ymin);
              if (x >= DOM.xmin && x <= DOM.xmax && y >= DOM.ymin && y <= DOM.ymax) onAdd({ x, y });
            }
          : undefined
      }
    >
      <rect x={PAD.l} y={PAD.t} width={W - PAD.l - PAD.r} height={H - PAD.t - PAD.b} fill="currentColor" className="text-muted/30" />
      {/* grid + ticks */}
      {Array.from({ length: 9 }, (_, i) => i).map((v) => (
        <g key={`gx${v}`}>
          <line x1={sx(v)} y1={sy(DOM.ymin)} x2={sx(v)} y2={sy(DOM.ymax)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
          {v % 2 === 0 && (
            <text x={sx(v)} y={H - PAD.b + 14} textAnchor="middle" fontSize={10} className="fill-muted-foreground">
              {v}
            </text>
          )}
        </g>
      ))}
      {Array.from({ length: 7 }, (_, i) => i).map((v) => (
        <g key={`gy${v}`}>
          <line x1={sx(DOM.xmin)} y1={sy(v)} x2={sx(DOM.xmax)} y2={sy(v)} stroke="currentColor" className="text-muted-foreground/25" strokeWidth={1} />
          {v % 2 === 0 && (
            <text x={PAD.l - 6} y={sy(v) + 3} textAnchor="end" fontSize={10} className="fill-muted-foreground">
              {v}
            </text>
          )}
        </g>
      ))}
      <text x={W / 2} y={H - 4} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium">x</text>
      <text x={11} y={H / 2} textAnchor="middle" fontSize={11} className="fill-muted-foreground font-medium" transform={`rotate(-90 11 ${H / 2})`}>y</text>

      {/* lines from assigned points to their centroid */}
      {assign.map((a, i) =>
        a !== null && centroids[a] && !isNaN(centroids[a].x) ? (
          <line
            key={`ln${i}`}
            x1={sx(points[i].x)}
            y1={sy(points[i].y)}
            x2={sx(centroids[a].x)}
            y2={sy(centroids[a].y)}
            stroke={CLUSTER_COLORS[a]}
            strokeWidth={1.2}
            opacity={0.45}
            strokeDasharray="4 3"
          />
        ) : null
      )}

      {/* points */}
      {points.map((p, i) => {
        const a = assign[i];
        const col = a === null ? "#9ca3af" : CLUSTER_COLORS[a];
        return (
          <g key={`pt${i}`}>
            <circle cx={sx(p.x)} cy={sy(p.y)} r={7} fill={col} opacity={a === null ? 0.55 : 0.9} stroke="currentColor" className="text-background" strokeWidth={1.5} />
            {p.name && (
              <text x={sx(p.x) + 10} y={sy(p.y) - 8} fontSize={10.5} fontWeight={600} className="fill-foreground">
                {p.name}
              </text>
            )}
          </g>
        );
      })}

      {/* centroids (animated with a CSS transform transition) */}
      {centroids.map((c, i) =>
        isNaN(c.x) ? null : (
          <g
            key={`ce${i}`}
            style={{
              transform: `translate(${sx(c.x)}px, ${sy(c.y)}px)`,
              transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <line x1={-8} y1={-8} x2={8} y2={8} stroke={CLUSTER_COLORS[i]} strokeWidth={3.5} strokeLinecap="round" />
            <line x1={-8} y1={8} x2={8} y2={-8} stroke={CLUSTER_COLORS[i]} strokeWidth={3.5} strokeLinecap="round" />
            <circle r={11} fill="none" stroke={CLUSTER_COLORS[i]} strokeWidth={1} opacity={0.4} />
          </g>
        )
      )}
    </svg>
  );
}

function CentroidLegend({ k }: { k: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
      {Array.from({ length: k }, (_, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: CLUSTER_COLORS[i] }} />
          cluster {i + 1}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 14 14" className="h-3.5 w-3.5">
          <line x1={2} y1={2} x2={12} y2={12} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
          <line x1={2} y1={12} x2={12} y2={2} stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" />
        </svg>
        centroid
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-gray-400" /> unassigned
      </span>
    </div>
  );
}

/* ---------------- K-Means engine hook (shared by both modes) ---------------- */
function useKMeans(initialPoints: Pt[], initialCentroids: Pt[]) {
  const [points, setPoints] = useState<Pt[]>(initialPoints);
  const [centroids, setCentroids] = useState<Pt[]>(initialCentroids);
  const [assign, setAssign] = useState<(number | null)[]>(initialPoints.map(() => null));
  const [step, setStep] = useState<"start" | "assigned" | "updated">("start");
  const [iteration, setIteration] = useState(0);
  const [converged, setConverged] = useState(false);
  const [lastAssign, setLastAssign] = useState<(number | null)[] | null>(null);

  const canAssign = !converged && step !== "assigned";
  const canUpdate = !converged && step === "assigned";

  const doAssign = () => {
    const a = points.map((p) => nearest(p, centroids));
    setAssign(a);
    if (lastAssign && a.length === lastAssign.length && a.every((v, i) => v === lastAssign[i])) {
      setConverged(true);
      return;
    }
    setLastAssign(a);
    setStep("assigned");
  };

  const doUpdate = () => {
    const m = means(points, assign as number[], centroids.length, centroids);
    setCentroids(m);
    setIteration((v) => v + 1);
    setStep("updated");
  };

  const reset = (pts: Pt[], cents: Pt[]) => {
    setPoints(pts);
    setCentroids(cents);
    setAssign(pts.map(() => null));
    setIteration(0);
    setConverged(false);
    setLastAssign(null);
    setStep("start");
  };

  const reseed = (cents: Pt[]) => {
    setCentroids(cents);
    setAssign(points.map(() => null));
    setIteration(0);
    setConverged(false);
    setLastAssign(null);
    setStep("start");
  };

  return {
    points, centroids, assign, iteration, converged, canAssign, canUpdate,
    doAssign, doUpdate, reset, reseed,
    setPoints: (pts: Pt[]) => {
      setPoints(pts);
      setAssign((a) => pts.map((_, i) => a[i] ?? null));
      setConverged(false);
      setStep("start");
    },
  };
}

/* ---------------- main component ---------------- */
export default function Component({ title, description }: { title?: string; description?: string }) {
  return (
    <WidgetFrame
      title={title ?? "K-Means Clustering Lab"}
      description={
        description ??
        "K-Means groups unlabelled points by repeating two steps: assign every point to its nearest centroid, then move each centroid to the mean of its assigned points. Step through the notes' example, or play freely."
      }
      accent="u1"
    >
      <Tabs defaultValue="notes">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="notes">Notes example</TabsTrigger>
          <TabsTrigger value="free">Free play</TabsTrigger>
        </TabsList>

        {/* ================= (a) notes example ================= */}
        <TabsContent value="notes">
          <NotesMode />
        </TabsContent>

        {/* ================= (b) free play ================= */}
        <TabsContent value="free">
          <FreeMode />
        </TabsContent>
      </Tabs>
    </WidgetFrame>
  );
}

function NotesMode() {
  const NOTES_POINTS: Pt[] = [
    { x: 1, y: 1, name: "A" },
    { x: 2, y: 1, name: "B" },
    { x: 4, y: 3, name: "C" },
    { x: 5, y: 4, name: "D" },
  ];
  const NOTES_CENTS: Pt[] = [
    { x: 1, y: 1 },
    { x: 5, y: 4 },
  ];
  const km = useKMeans(NOTES_POINTS, NOTES_CENTS);
  const showAssignHint = km.assign.every((a) => a === null);

  return (
    <div className="grid gap-4 pt-1 md:grid-cols-[minmax(0,360px)_1fr]">
      <div className="mx-auto w-full max-w-[360px]">
        <KMeansPlot points={km.points} centroids={km.centroids} assign={km.assign} />
        <CentroidLegend k={km.centroids.length} />
      </div>

      <div className="flex flex-col gap-3">
        <WidgetControls>
          <Button size="sm" onClick={km.doAssign} disabled={!km.canAssign}>
            1. Assign step
          </Button>
          <Button size="sm" onClick={km.doUpdate} disabled={!km.canUpdate}>
            2. Update step
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => km.reset(NOTES_POINTS, NOTES_CENTS)}
            className="ml-auto"
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </Button>
        </WidgetControls>

        <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-mono font-semibold text-foreground">iteration {km.iteration}</span>
          <span className="mx-2">·</span>
          initial centroids C₁ = (1, 1), C₂ = (5, 4) — chosen as the first / last point
        </div>

        {km.converged ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-300/60 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Converged — assignments no longer change, so the centroids stop moving. Final centroids:
            C₁ = (1.50, 1.00), C₂ = (4.50, 3.50). No labels were used at any point.
          </motion.div>
        ) : showAssignHint ? (
          <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            Step 1 — compute the Euclidean distance of every point to both centroids and assign it to
            the nearer one.
          </p>
        ) : (
          <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            Step 2 — recompute each centroid as the mean of its assigned points. The centroids will
            move toward the centre of mass of their clusters.
          </p>
        )}

        {/* distance table */}
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/50 text-left text-[10px] uppercase tracking-wider text-muted-foreground">
                <th className="px-2.5 py-1.5 font-medium">point</th>
                <th className="px-2.5 py-1.5 font-medium">d(C₁)</th>
                <th className="px-2.5 py-1.5 font-medium">d(C₂)</th>
                <th className="px-2.5 py-1.5 font-medium">cluster</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {km.points.map((p, i) => {
                const a = km.assign[i];
                return (
                  <tr key={p.name} className="border-b last:border-0">
                    <td className="px-2.5 py-1.5">
                      {p.name} ({p.x}, {p.y})
                    </td>
                    <td className="px-2.5 py-1.5">{f2(dist(p, km.centroids[0]))}</td>
                    <td className="px-2.5 py-1.5">{f2(dist(p, km.centroids[1]))}</td>
                    <td className="px-2.5 py-1.5">
                      {a === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="font-semibold" style={{ color: CLUSTER_COLORS[a] }}>
                          cluster {a + 1}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="font-mono text-[11px] text-muted-foreground">
          C₁ = ({km.centroids[0].x.toFixed(2)}, {km.centroids[0].y.toFixed(2)}) · C₂ = (
          {km.centroids[1].x.toFixed(2)}, {km.centroids[1].y.toFixed(2)})
        </p>
      </div>
    </div>
  );
}

function FreeMode() {
  const START_POINTS: Pt[] = [
    { x: 1.2, y: 4.6 },
    { x: 1.8, y: 4.0 },
    { x: 2.6, y: 4.9 },
    { x: 5.2, y: 1.4 },
    { x: 5.9, y: 2.0 },
    { x: 4.6, y: 2.4 },
    { x: 3.9, y: 4.4 },
  ];
  const km = useKMeans(START_POINTS, START_POINTS.slice(0, 2));
  const [k, setK] = useState(2);

  const applyK = (newK: number) => {
    setK(newK);
    if (km.points.length >= newK) {
      const cents = km.points.slice(0, newK).map((p) => ({ x: p.x, y: p.y }));
      km.reset(km.points, cents);
    }
  };

  const randomInit = () => {
    if (km.points.length < k) return;
    const shuffled = [...km.points].sort(() => Math.random() - 0.5);
    km.reset(
      km.points,
      shuffled.slice(0, k).map((p) => ({ x: p.x, y: p.y }))
    );
  };

  const clusterCounts = useMemo(() => {
    const counts = new Array(k).fill(0);
    km.assign.forEach((a) => {
      if (a !== null) counts[a]++;
    });
    return counts;
  }, [km.assign, k]);

  return (
    <div className="grid gap-4 pt-1 md:grid-cols-[minmax(0,360px)_1fr]">
      <div className="mx-auto w-full max-w-[360px]">
        <KMeansPlot
          points={km.points}
          centroids={km.centroids}
          assign={km.assign}
          onAdd={(p) => {
            const pts = [...km.points, p];
            km.setPoints(pts);
          }}
        />
        <CentroidLegend k={k} />
        <p className="mt-1 flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
          <Crosshair className="h-3 w-3" /> click the plot to add a point
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <WidgetControls>
          <Button size="sm" onClick={km.doAssign} disabled={!km.canAssign || km.points.length < k || km.centroids.length < k}>
            1. Assign step
          </Button>
          <Button size="sm" onClick={km.doUpdate} disabled={!km.canUpdate}>
            2. Update step
          </Button>
        </WidgetControls>

        <WidgetControls>
          <span className="text-[11px] font-medium text-muted-foreground">k =</span>
          {[1, 2, 3, 4].map((v) => (
            <Button
              key={v}
              size="sm"
              variant={k === v ? "default" : "outline"}
              className="h-8 w-8 p-0"
              onClick={() => applyK(v)}
              disabled={km.points.length < v}
            >
              {v}
            </Button>
          ))}
          <Button size="sm" variant="outline" onClick={randomInit} disabled={km.points.length < k}>
            <Dices className="h-4 w-4" /> Random init
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              km.reset(START_POINTS, START_POINTS.slice(0, k));
            }}
          >
            <RefreshCw className="h-4 w-4" /> Reset
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setK(2);
              km.reset([], []);
            }}
          >
            <Eraser className="h-4 w-4" /> Clear
          </Button>
        </WidgetControls>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">points</p>
            <p className="font-mono text-sm font-semibold">{km.points.length}</p>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">iteration</p>
            <p className="font-mono text-sm font-semibold">{km.iteration}</p>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">centroids</p>
            <p className="font-mono text-sm font-semibold">{km.centroids.length}</p>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">cluster sizes</p>
            <p className="font-mono text-sm font-semibold">
              {clusterCounts.every((c) => c === 0) ? "—" : clusterCounts.join(" / ")}
            </p>
          </div>
        </div>

        {km.converged ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2.5 rounded-xl border border-emerald-300/60 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Converged after {km.iteration} full iteration{km.iteration === 1 ? "" : "s"} — try
            Random init to see how the starting centroids change the final clusters.
          </motion.div>
        ) : (
          <p className="rounded-lg bg-muted/50 p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            Alternate the two steps: <strong>assign</strong> colours each point by its nearest
            centroid (Euclidean distance), <strong>update</strong> moves each centroid to the mean of
            its cluster. K-Means repeats until nothing changes — all without any target labels
            (unsupervised learning).
          </p>
        )}

        <p className="font-mono text-[11px] text-muted-foreground">
          centroids: {km.centroids.map((c) => `(${c.x.toFixed(2)}, ${c.y.toFixed(2)})`).join("  ·  ") || "—"}
        </p>
      </div>
    </div>
  );
}
