"use client";

import dynamic from "next/dynamic";
import { WidgetErrorBoundary } from "../math";
import { cn } from "@/lib/utils";
import { FlaskConical, Loader2 } from "lucide-react";

const Loading = () => (
  <div className="flex min-h-[200px] items-center justify-center gap-3 rounded-2xl border bg-muted/30 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" />
    Loading interactive demo…
  </div>
);

/** Central registry: widget id -> lazy component. Props: { title?, description? } */
const WIDGETS: Record<string, React.ComponentType<{ title?: string; description?: string }>> = {
  // Unit 1
  "u1-ai-ml-dl": dynamic(() => import("./u1-ai-ml-dl"), { ssr: false, loading: Loading }),
  "u1-neuron": dynamic(() => import("./u1-neuron"), { ssr: false, loading: Loading }),
  "u1-perceptron-lab": dynamic(() => import("./u1-perceptron-lab"), { ssr: false, loading: Loading }),
  "u1-and-training": dynamic(() => import("./u1-and-training"), { ssr: false, loading: Loading }),
  "u1-kmeans": dynamic(() => import("./u1-kmeans"), { ssr: false, loading: Loading }),
  "u1-loss-lab": dynamic(() => import("./u1-loss-lab"), { ssr: false, loading: Loading }),
  "u1-activation-plot": dynamic(() => import("./u1-activation-plot"), { ssr: false, loading: Loading }),
  "u1-backprop-lab": dynamic(() => import("./u1-backprop-lab"), { ssr: false, loading: Loading }),
  "u1-gd-lab": dynamic(() => import("./u1-gd-lab"), { ssr: false, loading: Loading }),
  // Unit 2
  "u2-param-count": dynamic(() => import("./u2-param-count"), { ssr: false, loading: Loading }),
  "u2-conv-lab": dynamic(() => import("./u2-conv-lab"), { ssr: false, loading: Loading }),
  "u2-size-calc": dynamic(() => import("./u2-size-calc"), { ssr: false, loading: Loading }),
  "u2-pooling-lab": dynamic(() => import("./u2-pooling-lab"), { ssr: false, loading: Loading }),
  "u2-rf-lab": dynamic(() => import("./u2-rf-lab"), { ssr: false, loading: Loading }),
  "u2-train-loop": dynamic(() => import("./u2-train-loop"), { ssr: false, loading: Loading }),
  "u2-init-lab": dynamic(() => import("./u2-init-lab"), { ssr: false, loading: Loading }),
  "u2-batchnorm-lab": dynamic(() => import("./u2-batchnorm-lab"), { ssr: false, loading: Loading }),
  "u2-dropout-lab": dynamic(() => import("./u2-dropout-lab"), { ssr: false, loading: Loading }),
  "u2-arch-gallery": dynamic(() => import("./u2-arch-gallery"), { ssr: false, loading: Loading }),
  // Unit 3
  "u3-seq-patterns": dynamic(() => import("./u3-seq-patterns"), { ssr: false, loading: Loading }),
  "u3-rnn-lab": dynamic(() => import("./u3-rnn-lab"), { ssr: false, loading: Loading }),
  "u3-bptt-lab": dynamic(() => import("./u3-bptt-lab"), { ssr: false, loading: Loading }),
  "u3-vanishing": dynamic(() => import("./u3-vanishing"), { ssr: false, loading: Loading }),
  "u3-lstm-lab": dynamic(() => import("./u3-lstm-lab"), { ssr: false, loading: Loading }),
  "u3-gru-lab": dynamic(() => import("./u3-gru-lab"), { ssr: false, loading: Loading }),
  "u3-lm-lab": dynamic(() => import("./u3-lm-lab"), { ssr: false, loading: Loading }),
  "u3-compare": dynamic(() => import("./u3-compare"), { ssr: false, loading: Loading }),
  // Unit 4
  "u4-model-map": dynamic(() => import("./u4-model-map"), { ssr: false, loading: Loading }),
  "u4-ae-lab": dynamic(() => import("./u4-ae-lab"), { ssr: false, loading: Loading }),
  "u4-vae-lab": dynamic(() => import("./u4-vae-lab"), { ssr: false, loading: Loading }),
  "u4-gan-lab": dynamic(() => import("./u4-gan-lab"), { ssr: false, loading: Loading }),
  "u4-entropy-lab": dynamic(() => import("./u4-entropy-lab"), { ssr: false, loading: Loading }),
  "u4-rbm-lab": dynamic(() => import("./u4-rbm-lab"), { ssr: false, loading: Loading }),
  "u4-dbn-dbm": dynamic(() => import("./u4-dbn-dbm"), { ssr: false, loading: Loading }),
};

export function WidgetRenderer({
  id,
  title,
  description,
}: {
  id: string;
  title?: string;
  description?: string;
}) {
  const Widget = WIDGETS[id];
  if (!Widget) {
    return (
      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
        <FlaskConical className="mx-auto mb-2 h-5 w-5 opacity-40" />
        Widget <code className="font-mono">{id}</code> is coming soon.
      </div>
    );
  }
  return (
    <WidgetErrorBoundary title={title}>
      <div className={cn("not-prose")}>
        <Widget title={title} description={description} />
      </div>
    </WidgetErrorBoundary>
  );
}

export const WIDGET_IDS = Object.keys(WIDGETS);
