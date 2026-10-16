import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/nav";
import { StateChip } from "@/components/ui/badge";
import { adapters, githubOrg, githubRepos, vercelAccount, vercelProjects } from "@/lib/infra";
import { getLedgerSnapshot, getProductionHealth, runRecoveryDrill, type LedgerSnapshot } from "@/lib/ledger";
import { shortHash } from "@/lib/utils";

export const Route = createFileRoute("/ops")({ component: OpsPage });
type Health = Awaited<ReturnType<typeof getProductionHealth>>;

function OpsPage() {
  const [ledger, setLedger] = useState<LedgerSnapshot | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [drill, setDrill] = useState<string | null>(null);
  const [drilling, setDrilling] = useState(false);
  const recoveryDrillsEnabled = import.meta.env.VITE_AUTH_ENABLED === "true";

  async function refresh() {
    const [snapshot, status] = await Promise.all([getLedgerSnapshot(), getProductionHealth()]);
    setLedger(snapshot);
    setHealth(status);
  }

  useEffect(() => {
    let alive = true;
    refresh().catch(() => { if (alive) { setLedger(null); setHealth(null); } });
    return () => { alive = false; };
  }, []);

  async function executeRecoveryDrill() {
    setDrilling(true);
    setDrill(null);
    try {
      const result = await runRecoveryDrill();
      setDrill(`RESTORED · ${result.rollbackId} · audit ${result.auditId}`);
      await refresh();
    } catch (error) {
      setDrill(`FAIL_CLOSED · ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setDrilling(false);
    }
  }

  return (
    <PageShell>
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <p className="font-mono text-2xs uppercase tracking-mark text-muted">Attached planes · GitHub · Vercel · Neon</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight md:text-5xl">Evidence of the stack.</h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">These records are read from the connected production stack and bound to the Solvex schema. Missing credentials fail closed.</p>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "GitHub", v: githubOrg.login, s: `${githubOrg.publicRepos} public repos` },
          { k: "Vercel", v: vercelAccount.username, s: vercelAccount.plan },
          { k: "Ledger", v: ledger ? String(ledger.paradoxes) : "—", s: ledger ? `${ledger.db} · ${ledger.nodes} nodes` : "unavailable" },
          { k: "Audit height", v: ledger ? String(ledger.auditHeight) : "0", s: ledger ? shortHash(ledger.lastHash, 8) : "GENESIS" },
        ].map((c) => <div key={c.k} className="rounded-xl bg-surface p-4 hairline"><p className="font-mono text-2xs uppercase tracking-kicker text-muted">{c.k}</p><p className="mt-2 break-all font-display text-xl font-semibold tracking-tight">{c.v}</p><p className="mt-1 font-mono text-3xs text-muted">{c.s}</p></div>)}
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-xl bg-surface p-5 hairline">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Production recovery plane</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">Recursive self-healing evidence</h2>
              <p className="mt-2 max-w-2xl text-sm text-muted">This non-destructive drill creates a synthetic checkpoint, records an invariant breach, restores the checkpoint, and seals the result in the append-only audit chain.</p>
              {!recoveryDrillsEnabled ? <p className="mt-2 text-xs text-muted">Operator sign-in is not configured, so recovery drills are fail-closed.</p> : null}
            </div>
            <button type="button" onClick={executeRecoveryDrill} disabled={drilling || !recoveryDrillsEnabled} className="rounded-lg bg-ok px-4 py-2 font-mono text-2xs font-semibold uppercase tracking-kicker text-black disabled:opacity-50">{drilling ? "Running…" : recoveryDrillsEnabled ? "Run recovery drill" : "Sign-in required"}</button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div><p className="font-mono text-3xs uppercase tracking-kicker text-muted">Binding</p><p className="mt-1 font-mono text-sm">{health?.ok ? health.db.toUpperCase() : "UNAVAILABLE"}</p></div>
            <div><p className="font-mono text-3xs uppercase tracking-kicker text-muted">Evidence</p><p className="mt-1 font-mono text-sm">{health?.ok ? `${health.counts.checkpoints} checkpoints · ${health.counts.rollbacks} rollbacks` : "NOT VERIFIED"}</p></div>
            <div><p className="font-mono text-3xs uppercase tracking-kicker text-muted">Last drill</p><p className="mt-1 break-all font-mono text-sm">{drill ?? "NOT RUN"}</p></div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8"><h2 className="font-display text-2xl font-bold tracking-tight">Adapters</h2><ul className="mt-4 grid gap-3 md:grid-cols-2">{adapters.map((a) => <li key={a.provider + a.node} className="rounded-xl bg-surface p-5 hairline"><div className="flex items-start justify-between gap-3"><div><p className="font-mono text-2xs uppercase tracking-kicker text-muted">{a.node} · {a.provider}</p><h3 className="mt-1 font-display text-lg font-semibold">{a.name}</h3></div><StateChip state={a.evidence} /></div><p className="mt-2 font-mono text-3xs uppercase tracking-kicker text-muted">{a.status.replaceAll("_", " ")}</p><p className="mt-2 text-sm text-muted">{a.note}</p></li>)}</ul></section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 pb-16 lg:grid-cols-2">
        <div><h2 className="font-display text-2xl font-bold tracking-tight">GitHub</h2><p className="mt-2 text-sm text-muted"><a className="underline-offset-4 hover:underline" href={githubOrg.href} target="_blank" rel="noreferrer">{githubOrg.login}</a>. Source of truth for Daisy, Solvex, and UAREFAKE.</p><ul className="mt-4 space-y-2">{githubRepos.map((r) => <li key={r.name}><a href={r.href} target="_blank" rel="noreferrer" className="flex items-start justify-between gap-3 rounded-lg bg-surface px-4 py-3 hairline hover:bg-elevated"><div><p className="text-sm font-medium">{r.name}</p><p className="text-xs text-muted">{r.description}</p></div><p className="shrink-0 font-mono text-3xs text-muted">{r.language}</p></a></li>)}</ul></div>
        <div><h2 className="font-display text-2xl font-bold tracking-tight">Vercel</h2><p className="mt-2 text-sm text-muted">Account {vercelAccount.username}. Observed projects only.</p><ul className="mt-4 space-y-2">{vercelProjects.map((p) => <li key={p.id} className="rounded-lg bg-surface px-4 py-3 hairline"><p className="font-display font-semibold">{p.name}</p><p className="mt-1 font-mono text-3xs text-muted">{p.id}</p><p className="mt-2 text-sm text-muted">{p.note}</p></li>)}</ul><div className="mt-6 rounded-xl bg-surface p-5 hairline"><p className="font-mono text-2xs uppercase tracking-kicker text-muted">Neon schema</p><p className="mt-2 text-sm text-muted">Production binds Neon. Recovery evidence is append-only and synthetic for drills. PayPal stays fail-closed until DN-35 credentials exist.</p></div></div>
      </section>
    </PageShell>
  );
}
