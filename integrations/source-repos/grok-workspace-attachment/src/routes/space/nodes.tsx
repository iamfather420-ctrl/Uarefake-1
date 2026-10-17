import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StateChip } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { solvexNodes } from "@/lib/solvex/nodes-data";
import { manifest } from "@/lib/manifest";
import { KERNEL_HONESTY, useKernelStore } from "@/lib/kernel";

export const Route = createFileRoute("/space/nodes")({ component: NodesPage });

export function NodesPage() {
  const cats = useMemo(
    () => ["ALL", ...Array.from(new Set(solvexNodes.map((n) => n.category)))],
    [],
  );
  const [cat, setCat] = useState("ALL");
  const list = cat === "ALL" ? solvexNodes : solvexNodes.filter((n) => n.category === cat);
  const live = useKernelStore((s) => s.nodes);
  const phase = useKernelStore((s) => s.phase);
  const boot = useKernelStore((s) => s.boot);
  const diagnosticNode = useKernelStore((s) => s.diagnosticNode);
  const rebootNode = useKernelStore((s) => s.rebootNode);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        Node registry
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        {manifest.daisyNodes.total} Daisy nodes registered, instantiated,
        reachable, executed, output asserted, evidence generated. Recorded from
        Full-Build daisy-54-node-execution.
      </p>
      <p className="mt-3 max-w-2xl text-xs leading-relaxed text-muted">{KERNEL_HONESTY}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StateChip state={phase} />
        {phase !== "running" ? (
          <Button size="sm" onClick={() => void boot()}>
            Boot kernel
          </Button>
        ) : (
          <Link to="/space/kernel" className="text-xs uppercase tracking-kicker text-muted hover:text-fg">
            Open kernel chamber
          </Link>
        )}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={
              cat === c
                ? "rounded-md bg-fg px-3 py-2 text-xs uppercase tracking-kicker text-bg"
                : "rounded-md px-3 py-2 text-xs uppercase tracking-kicker text-muted hairline"
            }
          >
            {c.replaceAll("_", " ")}
          </button>
        ))}
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((n) => {
          const k = live.find((x) => x.id === n.id);
          return (
            <article key={n.id} className="rounded-xl bg-surface p-4 hairline">
              <div className="flex items-center justify-between">
                <p className="font-mono text-3xs text-muted">{n.id}</p>
                <div className="flex gap-1">
                  {k ? <StateChip state={k.state} /> : null}
                  <StateChip state={n.status} />
                </div>
              </div>
              <h2 className="mt-2 font-display text-lg font-semibold tracking-tight">
                {n.name}
              </h2>
              <p className="mt-1 text-xs uppercase tracking-kicker text-muted">
                {n.category.replaceAll("_", " ")}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{n.purpose}</p>
              <div className="mt-4 flex flex-wrap gap-2 font-mono text-2xs text-muted">
                <span>{n.execution_mode.replaceAll("_", " ")}</span>
                <span>{n.duration_ms.toFixed(2)} ms</span>
                {k ? <span>gen {k.generation}</span> : null}
                {n.evidence_hash ? (
                  <span>{n.evidence_hash.slice(0, 10)}…</span>
                ) : null}
              </div>
              {phase === "running" ? (
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => diagnosticNode(n.id)}>
                    Probe
                  </Button>
                  <Button size="sm" variant="subtle" onClick={() => void rebootNode(n.id)}>
                    Recycle
                  </Button>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
