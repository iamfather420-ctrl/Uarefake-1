import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { LogoLink } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { WorldLayer } from "@/components/world";
import { formalClosure } from "@/lib/solvex/closure";
import { ENGINE_EXPANSION, ENGINE_NAME } from "@/lib/solvex/identity";
import { useAppStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const links = [
  { to: "/", label: "Airlock", sector: "00" },
  { to: "/store", label: "Bazaar", sector: "01" },
  { to: "/registry", label: "Census", sector: "02" },
  { to: "/space", label: "Bridge", sector: "03" },
  { to: "/manifesto", label: "Contract", sector: "04" },
] as const;

export function SiteNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const count = useAppStore((s) => s.cart.reduce((n, l) => n + l.qty, 0));
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const cartCount = ready ? count : 0;
  const domain = pathname.startsWith("/space")
    ? "space"
    : pathname.startsWith("/registry")
      ? "registry"
      : "com";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/55 backdrop-blur-md">
      <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4">
        <LogoLink domain={domain} />
        <nav className="hidden items-center gap-0.5 md:flex">
          {links.map((l) => {
            const active =
              l.to === "/"
                ? pathname === "/"
                : pathname === l.to || pathname.startsWith(`${l.to}/`);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "rounded-sm px-2.5 py-2 text-xs font-medium uppercase tracking-kicker transition-colors duration-150",
                  active ? "bg-fg text-bg" : "text-muted hover:text-fg",
                )}
              >
                <span className="mr-1.5 font-mono text-2xs opacity-55">{l.sector}</span>
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1">
          <p className="mr-1 hidden items-center gap-1.5 font-mono text-3xs uppercase tracking-kicker text-muted xl:flex">
            <span className="size-1.5 rounded-full bg-ok live-dot" />
            Hull live
          </p>
          <Link
            to="/cart"
            className="relative grid size-11 place-items-center rounded-sm text-fg hover:bg-elevated"
            aria-label="Hold cart"
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 grid min-w-4 place-items-center rounded-full bg-stamp px-1 font-mono text-2xs text-stamp-fg">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>
      {open ? (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <div className="flex flex-col">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-fg"
              >
                <span className="mr-2 font-mono text-2xs text-muted">{l.sector}</span>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export function SectorRail() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav
      aria-label="Sectors"
      className="pointer-events-auto fixed top-20 left-2 z-30 hidden w-10 flex-col gap-1 xl:flex"
    >
      {links.map((l) => {
        const active =
          l.to === "/"
            ? pathname === "/"
            : pathname === l.to || pathname.startsWith(`${l.to}/`);
        return (
          <Link
            key={l.to}
            to={l.to}
            title={l.label}
            className={cn(
              "grid size-10 place-items-center rounded-sm font-mono text-2xs tracking-mark",
              active ? "bg-fg text-bg" : "text-muted hairline hover:text-fg",
            )}
          >
            {l.sector}
          </Link>
        );
      })}
    </nav>
  );
}

export function InstrumentRail() {
  return (
    <aside
      aria-hidden
      className="pointer-events-none fixed top-24 right-3 z-20 hidden w-24 flex-col gap-2 2xl:flex"
    >
      {[
        { k: "Z3", v: `${formalClosure.z3.total}` },
        { k: "DFRL", v: `${formalClosure.dfrl.unsat}` },
        { k: "DH", v: `${formalClosure.dh.total}` },
        { k: "DAISY", v: `${formalClosure.daisy.executed}` },
        { k: "PBP", v: "8" },
      ].map((row) => (
        <div key={row.k} className="text-right">
          <p className="font-mono text-3xs uppercase tracking-mark text-subtle">{row.k}</p>
          <p className="font-display text-lg font-bold tabular-nums leading-none text-fg/80">
            {row.v}
          </p>
        </div>
      ))}
    </aside>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative z-10 mt-auto border-t border-line bg-bg/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-xs text-muted md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-display text-sm font-semibold tracking-tight text-fg">
            {ENGINE_NAME}
          </p>
          <p className="mt-1 max-w-sm font-mono text-2xs uppercase tracking-kicker">
            {ENGINE_EXPANSION}
          </p>
        </div>
        <p className="max-w-xl">
          You are inside the engine. Evidence before claims. Authorization
          before execution. Reversibility throughout.
        </p>
        <p className="font-mono text-2xs uppercase tracking-kicker">
          Hull · Daisy Haminja · Human root of trust
        </p>
      </div>
    </footer>
  );
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col bg-bg text-fg">
      <WorldLayer />
      <SiteNav />
      <SectorRail />
      <InstrumentRail />
      <div className="relative z-10 flex-1">{children}</div>
      <SiteFooter />
    </div>
  );
}
