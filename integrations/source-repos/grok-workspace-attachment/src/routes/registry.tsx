import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/nav";
import { StateChip } from "@/components/ui/badge";
import { SectorMark } from "@/components/world";
import { agents, kindLabel, type AgentKind } from "@/lib/registry";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registry")({ component: Registry });

const kinds: Array<AgentKind | "ALL"> = [
  "ALL",
  "PARAI",
  "VERIFIER",
  "WORKER",
  "REGISTRAR",
  "SENTINEL",
  "GATEWAY",
];

function Registry() {
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<(typeof kinds)[number]>("ALL");
  const list = useMemo(() => {
    return agents.filter((a) => {
      if (kind !== "ALL" && a.kind !== kind) return false;
      if (!q.trim()) return true;
      const hay = `${a.name} ${a.id} ${a.summary} ${a.owner}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [q, kind]);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <SectorMark sector="SEC-02" name="Census · named intelligences" />
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight holo md:text-5xl">
          Living cells. Inspectable states.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          An intelligence is not real because it talks. It is registered when it
          has identity, a human root, a capability boundary, and a verification
          state that has actually been demonstrated.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, owner, cell"
            className="min-h-11 flex-1 rounded-md bg-surface/80 px-3 text-sm text-fg outline-none hairline placeholder:text-subtle"
          />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={
                kind === k
                  ? "min-h-11 rounded-md bg-fg px-3 py-2 text-3xs uppercase tracking-kicker text-bg"
                  : "min-h-11 rounded-md px-3 py-2 text-3xs uppercase tracking-kicker text-muted hairline"
              }
            >
              {k === "ALL" ? "All" : kindLabel[k]}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {list.map((a) => (
            <Link
              key={a.id}
              to="/registry/$id"
              params={{ id: a.id }}
              className="portal chamber flex flex-col rounded-lg bg-surface/80 p-5 hairline hairline-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-8 place-items-center rounded-full iris-ring font-mono text-2xs",
                      a.evidence === "VERIFIED" ? "text-ok" : "text-muted",
                    )}
                  >
                    {a.name.slice(0, 1)}
                  </span>
                  <div>
                    <p className="font-display text-lg font-semibold tracking-tight">
                      {a.name}
                    </p>
                    <p className="font-mono text-3xs text-muted">{a.id}</p>
                  </div>
                </div>
                <StateChip state={a.evidence} />
              </div>
              <p className="mt-3 text-sm text-muted">{a.summary}</p>
              <p className="mt-4 font-mono text-2xs uppercase tracking-kicker text-subtle">
                {a.kind} · {a.owner}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
