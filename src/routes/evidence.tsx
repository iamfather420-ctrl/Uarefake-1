import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, AlertTriangle, CheckCircle2, FileCheck2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import evidence from "../../integrated-sources/daisy-haminja-120-evidence/artifacts/z3-120-case-results.json";

type CaseRecord = {
  id: string;
  family: string;
  name: string;
  expected: string;
  actual: string;
  match: boolean;
  replay_match: boolean;
  assertion_hash: string;
};

type EvidenceArtifact = {
  commit_sha: string;
  repository: string;
  branch: string;
  case_count: number;
  unique_ids: number;
  matches: number;
  replay_matches: number;
  combined_root_sha256: string;
  hash_stable_across_runs: boolean;
  cases: CaseRecord[];
};

const artifact = evidence as EvidenceArtifact;

export const Route = createFileRoute("/evidence")({ component: EvidencePage });

function EvidencePage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "mismatch" | "replay">("all");
  const cases = useMemo(() => artifact.cases.filter((item) => {
    const matchesQuery = [item.id, item.family, item.name].some((value) =>
      value.toLowerCase().includes(query.toLowerCase()),
    );
    const matchesFilter =
      filter === "all" ||
      (filter === "mismatch" && !item.match) ||
      (filter === "replay" && !item.replay_match);
    return matchesQuery && matchesFilter;
  }), [query, filter]);

  const mismatchCount = artifact.cases.filter((item) => !item.match).length;
  const replayMismatchCount = artifact.cases.filter((item) => !item.replay_match).length;

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> Back to UAREFAKE
        </Link>
        <header className="mt-8 border-b border-line pb-6">
          <p className="font-mono text-xs uppercase tracking-widest text-muted">Daisy Haminja · Evidence record</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Formal 120-case corpus</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            This view displays the imported source artifact as recorded. It does not rerun Z3 or independently certify the original results.
          </p>
        </header>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Recorded cases" value={artifact.case_count} />
          <Metric label="Unique IDs recorded" value={artifact.unique_ids} />
          <Metric label="Recorded result matches" value={artifact.matches} />
          <Metric label="Recorded replay matches" value={artifact.replay_matches} />
        </section>

        <section className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-400" />
            <div>
              <h2 className="font-semibold">Independent verification still required</h2>
              <p className="mt-1 text-sm leading-6 text-muted">
                The source artifact explicitly records <code>hash_stable_across_runs: false</code>. Matching flags and replay flags are claims inside the imported report, not a fresh execution receipt. Treat this corpus as evidence to revalidate, not as a production authorization.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-line p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold">Case-level records</h2>
              <p className="mt-1 text-xs text-muted">{cases.length} of {artifact.cases.length} records shown · {mismatchCount} recorded result mismatches · {replayMismatchCount} recorded replay mismatches</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex items-center gap-2 rounded-md border border-line px-3 py-2">
                <Search className="size-4 text-muted" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search ID or case" className="min-w-0 bg-transparent text-sm outline-none" />
              </label>
              <select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="rounded-md border border-line bg-bg px-3 py-2 text-sm">
                <option value="all">All recorded cases</option>
                <option value="mismatch">Recorded mismatches</option>
                <option value="replay">Replay mismatches</option>
              </select>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                  <th className="py-3 pr-3">ID / Family</th>
                  <th className="py-3 pr-3">Case</th>
                  <th className="py-3 pr-3">Expected</th>
                  <th className="py-3 pr-3">Recorded</th>
                  <th className="py-3 pr-3">Match flags</th>
                  <th className="py-3">Assertion hash</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.id} className="border-b border-line/70 align-top">
                    <td className="py-3 pr-3 font-mono text-xs">
                      <div>{item.id}</div><div className="mt-1 text-muted">{item.family}</div>
                    </td>
                    <td className="py-3 pr-3">{item.name}</td>
                    <td className="py-3 pr-3 font-mono">{item.expected}</td>
                    <td className="py-3 pr-3 font-mono">{item.actual}</td>
                    <td className="py-3 pr-3">
                      <span className={item.match ? "inline-flex items-center gap-1 text-emerald-400" : "inline-flex items-center gap-1 text-rose-400"}>
                        <CheckCircle2 className="size-3.5" /> result {String(item.match)}
                      </span>
                      <div className={item.replay_match ? "mt-1 text-xs text-muted" : "mt-1 text-xs text-rose-400"}>replay {String(item.replay_match)}</div>
                    </td>
                    <td className="max-w-48 break-all py-3 font-mono text-[10px] text-muted">{item.assertion_hash}</td>
                  </tr>
                ))}
                {cases.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted">No matching records.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <SourceCard title="Source repository" value={artifact.repository} detail={artifact.branch + " · " + artifact.commit_sha} />
          <SourceCard title="Recorded combined root" value={artifact.combined_root_sha256} detail={"Stable across runs: " + String(artifact.hash_stable_across_runs)} />
        </section>
        <p className="mt-6 flex items-center gap-2 text-xs text-muted"><FileCheck2 className="size-4" /> Source artifact imported without altering its recorded case values.</p>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg border border-line p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p></div>;
}

function SourceCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="rounded-lg border border-line p-4"><p className="text-xs uppercase tracking-wide text-muted">{title}</p><p className="mt-2 break-all font-mono text-xs">{value}</p><p className="mt-2 text-xs text-muted">{detail}</p></div>;
}
