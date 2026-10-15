import { type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { MachineSky } from "@/components/machine-sky";
import { ENGINE_LETTERS } from "@/lib/solvex/identity";
import { cn } from "@/lib/utils";

export function WorldLayer() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 machine-wash" />
      <MachineSky />
      <div className="absolute inset-0 scan-grid opacity-40" />
      <div className="absolute inset-0 ruin-hatch" />
      <div className="absolute inset-0 hologram-veil" />
      <div className="absolute inset-0 dust opacity-50" />
      <div className="absolute inset-x-0 top-0 h-px bg-stamp/80 scan-sweep" />
      <span className="absolute top-3 left-3 size-3 border-t border-l border-fg/35" />
      <span className="absolute top-3 right-3 size-3 border-t border-r border-fg/35" />
      <span className="absolute bottom-3 left-3 size-3 border-b border-l border-fg/35" />
      <span className="absolute bottom-3 right-3 size-3 border-b border-r border-fg/35" />
    </div>
  );
}

export function GlyphRail({ className }: { className?: string }) {
  return (
    <ol
      className={cn(
        "hidden select-none flex-col gap-3 font-display text-lg font-extrabold tracking-tight text-subtle lg:flex",
        className,
      )}
      aria-hidden
    >
      {ENGINE_LETTERS.map((item) => (
        <li key={`${item.letter}-${item.word}`} className="leading-none">
          <span className="text-stamp">{item.letter}</span>
        </li>
      ))}
    </ol>
  );
}

export function SectorMark({
  sector,
  name,
  className,
}: {
  sector: string;
  name: string;
  className?: string;
}) {
  return (
    <p className={cn("font-mono text-2xs uppercase tracking-mark text-muted", className)}>
      {sector} · {name}
    </p>
  );
}

export function Chamber({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("chamber rounded-lg bg-surface/80 p-5 hairline", className)}>{children}</div>;
}

export function HudTicker({ items }: { items: string[] }) {
  const line = [...items, ...items];
  return (
    <div className="relative z-10 overflow-hidden border-y border-line bg-bg/70">
      <div className="ticker-track flex w-max gap-8 py-2 font-mono text-2xs uppercase tracking-kicker text-muted">
        {line.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-8">
            <span className="inline-block size-1 bg-stamp" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Hatch({
  to,
  sector,
  kicker,
  title,
  body,
}: {
  to: "/store" | "/registry" | "/space" | "/space/kernel" | "/space/power";
  sector: string;
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="hatch portal chamber group flex min-h-44 flex-col justify-between overflow-hidden bg-bg/75 p-6 hover:bg-surface md:min-h-56 md:p-8"
    >
      <div className="pointer-events-none absolute inset-0 ruin-hatch opacity-50" />
      <div className="relative">
        <p className="font-mono text-2xs uppercase tracking-mark text-muted">
          SEC-{sector} · {kicker}
        </p>
        <h2 className="mt-3 font-display text-3xl font-bold tracking-tight holo">{title}</h2>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{body}</p>
      </div>
      <p className="relative mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-kicker text-fg">
        Cycle hatch
        <ArrowRight className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
      </p>
    </Link>
  );
}

export function Instrument({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="chamber rounded-lg bg-surface/70 px-3 py-3 hairline">
      <p className="font-mono text-3xs uppercase tracking-mark text-muted">{label}</p>
      <p className="mt-1 font-display text-lg font-bold tabular-nums leading-none">{value}</p>
      <p className="mt-1 font-mono text-3xs text-subtle">{hint}</p>
    </div>
  );
}
