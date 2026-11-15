"use client";

import { cn } from "@/lib/utils";
import { FlaskConical } from "lucide-react";

/** Consistent chrome for every interactive widget */
export function WidgetFrame({
  title,
  description,
  children,
  className,
  accent = "primary",
  compact,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  accent?: "primary" | "u1" | "u2" | "u3" | "u4";
  compact?: boolean;
}) {
  const accents: Record<string, string> = {
    primary: "text-primary",
    u1: "text-u1",
    u2: "text-u2",
    u3: "text-u3",
    u4: "text-u4",
  };
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      {(title || description) && (
        <header className={cn("border-b bg-gradient-to-b from-muted/60 to-transparent", compact ? "px-4 py-2.5" : "px-5 py-3.5")}>
          {title && (
            <h3 className={cn("flex items-center gap-2 text-sm font-semibold tracking-tight", accents[accent])}>
              <FlaskConical className="h-4 w-4" />
              {title}
            </h3>
          )}
          {description && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>}
        </header>
      )}
      <div className={cn(compact ? "p-4" : "p-5")}>{children}</div>
    </section>
  );
}

/** Small stat chip used across widgets */
export function Stat({
  label,
  value,
  mono = true,
  tone = "default",
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  tone?: "default" | "good" | "bad" | "accent";
}) {
  const tones = {
    default: "text-foreground",
    good: "text-emerald-600 dark:text-emerald-400",
    bad: "text-destructive",
    accent: "text-primary",
  };
  return (
    <div className="rounded-lg bg-muted/60 px-3 py-2">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-semibold", mono && "font-mono", tones[tone])}>{value}</p>
    </div>
  );
}

export function WidgetControls({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2 rounded-xl bg-muted/50 p-2.5", className)}>{children}</div>
  );
}

export function PlayButton({
  onClick,
  playing,
  label = "Play",
}: {
  onClick: () => void;
  playing?: boolean;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
    >
      {playing ? "❚❚" : "▶"} {playing ? "Pause" : label}
    </button>
  );
}
