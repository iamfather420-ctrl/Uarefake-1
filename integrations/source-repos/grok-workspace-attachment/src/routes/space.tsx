import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/nav";
import { SectorMark } from "@/components/world";
import { ENGINE_NAME } from "@/lib/solvex/identity";
import { manifest } from "@/lib/manifest";
import { cn, shortHash } from "@/lib/utils";

export const Route = createFileRoute("/space")({ component: SpaceLayout });

const tabs: {
  to:
    | "/space"
    | "/space/daisy"
    | "/space/execution"
    | "/space/proofs"
    | "/space/nodes"
    | "/space/ledger"
    | "/space/kernel"
    | "/space/power";
  label: string;
  code: string;
  exact?: boolean;
}[] = [
  { to: "/space", label: "Overview", code: "OV", exact: true },
  { to: "/space/kernel", label: "Kernel", code: "KN" },
  { to: "/space/power", label: "Power", code: "PBP" },
  { to: "/space/daisy", label: "Daisy", code: "DH" },
  { to: "/space/execution", label: "MMTAI", code: "EX" },
  { to: "/space/proofs", label: "DFRL", code: "Z3" },
  { to: "/space/nodes", label: "Nodes", code: "N54" },
  { to: "/space/ledger", label: "Ledger", code: "LG" },
];

function SpaceLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toISOString());
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, []);

  return (
    <PageShell>
      <div className="border-b border-line bg-surface/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <SectorMark sector="SEC-03" name="Bridge · uarefake.space" />
            <p className="mt-1 font-display text-lg font-semibold tracking-tight holo">
              {ENGINE_NAME} controlboard · fail closed
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-3xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-ok live-dot" />
              LIVE
            </span>
            <span className="tabular-nums">{clock || "—"}</span>
            <span>root {shortHash(manifest.merkle)}</span>
          </div>
        </div>
        <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-3">
          {tabs.map((t) => {
            const active = t.exact
              ? pathname === "/space" || pathname === "/space/"
              : pathname === t.to || pathname.startsWith(`${t.to}/`);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "rounded-md px-3 py-2 text-xs uppercase tracking-kicker whitespace-nowrap",
                  active ? "bg-fg text-bg" : "text-muted hover:text-fg",
                )}
              >
                <span className="mr-1.5 font-mono text-2xs opacity-60">{t.code}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <Outlet />
    </PageShell>
  );
}
