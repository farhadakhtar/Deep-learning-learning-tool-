"use client";

import { useMemo, Component } from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

function renderTex(tex: string, display: boolean): string {
  try {
    return katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      trust: true,
      macros: {
        "\\RR": "\\mathbb{R}",
      },
    });
  } catch {
    return `<code>${tex}</code>`;
  }
}

export function Math({ tex, display = false, className }: { tex: string; display?: boolean; className?: string }) {
  const html = useMemo(() => renderTex(tex, display), [tex, display]);
  return (
    <span
      className={cn(display && "block text-center", className)}
      dangerouslySetInnerHTML={{ __html: html }}
      aria-label={display ? `formula: ${tex}` : undefined}
    />
  );
}

/** Renders text containing inline $...$ math, **bold** and `code` */
export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = useMemo(() => parseInline(text), [text]);
  return (
    <span className={className}>
      {parts.map((p, i) => {
        if (p.kind === "math") return <Math key={i} tex={p.text} />;
        if (p.kind === "bold")
          return (
            <strong key={i} className="font-semibold text-foreground">
              {p.text}
            </strong>
          );
        if (p.kind === "code")
          return (
            <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
              {p.text}
            </code>
          );
        return <span key={i}>{p.text}</span>;
      })}
    </span>
  );
}

type Part = { kind: "text" | "math" | "bold" | "code"; text: string };

export function parseInline(text: string): Part[] {
  const out: Part[] = [];
  const regex = /\$([^$]+)\$|\*\*([^*]+)\*\*|`([^`]+)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) out.push({ kind: "text", text: text.slice(last, m.index) });
    if (m[1] !== undefined) out.push({ kind: "math", text: m[1] });
    else if (m[2] !== undefined) out.push({ kind: "bold", text: m[2] });
    else if (m[3] !== undefined) out.push({ kind: "code", text: m[3] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

/** Error boundary so a widget failure never breaks the lesson */
export class WidgetErrorBoundary extends Component<
  { children: React.ReactNode; title?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; title?: string }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.error("Widget error:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">This interactive demo could not load.</p>
          <p className="mt-1">
            {this.props.title ? `(${this.props.title}) ` : ""}Reload the page to try again — the lesson
            text below is unaffected.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
