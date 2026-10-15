import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { StateChip } from "@/components/ui/badge";
import { Instrument } from "@/components/world";
import { DH_BOOTSTRAP_PARADOXES } from "@/lib/solvex/bootstrap";
import { dfrlOperators } from "@/lib/solvex/dfrl-data";
import { manifest } from "@/lib/manifest";

export const Route = createFileRoute("/space/proofs")({ component: ProofsPage });

type Filter = "all" | "authored" | "generated" | "bootstrap";

export function ProofsPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (filter === "bootstrap") {
      return DH_BOOTSTRAP_PARADOXES.filter((p) =>
        !needle ||
        `${p.code} ${p.name} ${p.domain}`.toLowerCase().includes(needle),
      ).map((p) => ({
        code: p.code,
        name: p.name,
        domain: p.domain,
        result: p.verification_status,
        status: p.verification_status,
        extra: p.canonical_family,
      }));
    }
    return dfrlOperators
      .filter((p) => {
        if (filter === "authored" && p.model_classification !== "AUTHORED_MODEL") return false;
        if (filter === "generated" && p.model_classification !== "GENERATED_GENERALIZED_MODEL") return false;
        if (!needle) return true;
        return `${p.code} ${p.name} ${p.domain}`.toLowerCase().includes(needle);
      })
      .map((p) => ({
        code: p.code,
        name: p.name,
        domain: p.domain,
        result: p.result,
        status: p.status,
        extra: p.model_classification,
      }));
  }, [filter, q]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-3xl font-extrabold tracking-tight holo">
        Formal bridge
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Recorded Z3 WASM from Full-Build. 120 theorems closed: 88 DFRL UNSAT plus
        32 DH (30 UNSAT, 2 SAT). Registered ≠ verified. Root{" "}
        <span className="font-mono text-xs">{manifest.merkle.slice(0, 16)}…</span>
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Instrument
          label="Z3 120"
          value={`${manifest.formal120.matches}/${manifest.formal120.total}`}
          hint={manifest.formal120.status}
        />
        <Instrument
          label="DFRL 88"
          value={`${manifest.dfrl.unsat} UNSAT`}
          hint={`${manifest.dfrl.authored} authored · ${manifest.dfrl.generated} generated`}
        />
        <Instrument
          label="DH formal 32"
          value={`${manifest.bootstrap.unsat} / ${manifest.bootstrap.sat}`}
          hint="UNSAT / SAT · suite verified"
        />
        <Instrument
          label="Receipts"
          value={`${manifest.receipts.total}`}
          hint={`${manifest.receipts.replayVerified} replay-verified`}
        />
      </div>
      <p className="mt-3 font-mono text-2xs text-muted">
        Paradox catalog still carries family / claim / partial labels (
        {manifest.bootstrap.family} family · {manifest.bootstrap.claim} claim ·{" "}
        {manifest.bootstrap.partial} partial). Formal SMT closure is 32/32.
      </p>
      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(["all", "authored", "generated", "bootstrap"] as Filter[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={
              filter === f
                ? "min-h-11 rounded-md bg-fg px-3 py-2 text-xs uppercase tracking-kicker text-bg"
                : "min-h-11 rounded-md px-3 py-2 text-xs uppercase tracking-kicker text-muted hairline"
            }
          >
            {f}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter operators"
          className="min-h-11 flex-1 rounded-md bg-surface/80 px-3 text-sm hairline outline-none"
        />
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg bg-surface/80 hairline">
        <table className="w-full min-w-xl text-left text-sm">
          <thead className="font-mono text-2xs uppercase tracking-kicker text-muted">
            <tr className="border-b border-line">
              <th className="px-4 py-3 font-medium">Code</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Domain</th>
              <th className="px-4 py-3 font-medium">Result</th>
              <th className="px-4 py-3 font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.code} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-muted">{p.domain}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.result}</td>
                <td className="px-4 py-3">
                  <StateChip state={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 font-mono text-2xs text-muted">
        {rows.length} records ·{" "}
        <a
          href="/solvex/z3-120-formal-verification-summary.json"
          className="underline-offset-4 hover:underline"
        >
          120-closure artifact
        </a>
      </p>
    </div>
  );
}
