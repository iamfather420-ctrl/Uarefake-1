import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/nav";
import { Button } from "@/components/ui/button";
import {
  listMyEntitlements,
  listMyFulfillmentJobs,
  requestJitFulfillment,
} from "@/lib/fulfillment";
import { productBySku } from "@/lib/catalog";

export const Route = createFileRoute("/fulfillment")({ component: FulfillmentPage });

type Entitlement = Awaited<ReturnType<typeof listMyEntitlements>>[number];
type Job = Awaited<ReturnType<typeof listMyFulfillmentJobs>>[number];

function FulfillmentPage() {
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const [nextEntitlements, nextJobs] = await Promise.all([
        listMyEntitlements(),
        listMyFulfillmentJobs(),
      ]);
      setEntitlements(nextEntitlements);
      setJobs(nextJobs);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not load fulfillment records.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function request(entitlementId: string) {
    setBusy(true);
    try {
      const result = await requestJitFulfillment({ data: { entitlementId } });
      toast.success(`JIT request ${result.jobId}: ${result.status}`);
      await refresh();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "JIT request refused.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <p className="font-mono text-2xs uppercase tracking-mark text-muted">SOLVEX · governed distribution</p>
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">Entitlements & JIT fulfillment</h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          Entitlement permits a request; it does not authorize execution. Each request is tenant-scoped,
          must pass the human-root authorization gate, and remains undistributed until a real builder
          creates and verifies an artifact.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <Button variant="outline" onClick={() => void refresh()} disabled={busy}>
            {busy ? "Refreshing…" : "Refresh records"}
          </Button>
          <span className="text-xs text-muted">Payment provider connection is separate.</span>
        </div>
        {error ? <p role="alert" className="mt-4 text-sm text-stamp">{error}</p> : null}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Active entitlements</h2>
          {entitlements.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No server-confirmed entitlements are available for this account.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {entitlements.map((item) => (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4 hairline">
                  <div>
                    <p className="font-semibold">{productBySku(item.sku)?.title ?? item.sku}</p>
                    <p className="mt-1 font-mono text-3xs text-muted">{item.id} · {item.status}</p>
                    <p className="mt-1 font-mono text-3xs text-muted">Order {item.order_id}</p>
                  </div>
                  <Button disabled={busy || item.status !== "ACTIVE"} onClick={() => void request(item.id)}>
                    Request JIT distribution
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold">Distribution requests</h2>
          {jobs.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No JIT fulfillment requests recorded.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {jobs.map((job) => (
                <li key={job.id} className="rounded-xl bg-surface p-4 hairline">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{productBySku(job.sku)?.title ?? job.sku}</p>
                      <p className="mt-1 font-mono text-3xs text-muted">{job.id}</p>
                    </div>
                    <span className="font-mono text-xs">{job.status}</span>
                  </div>
                  {job.artifact_sha256 ? <p className="mt-2 break-all font-mono text-3xs text-muted">SHA-256: {job.artifact_sha256}</p> : null}
                  {job.failure_code ? <p className="mt-2 text-xs text-stamp">Failure: {job.failure_code}</p> : null}
                  {job.status === "WAITING_AUTH" ? <p className="mt-2 text-xs text-muted">Waiting for a configured human-root authorizer.</p> : null}
                  {job.status === "READY_TO_BUILD" ? <p className="mt-2 text-xs text-muted">Authorization recorded. Artifact build/distribution still requires the real builder adapter.</p> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </PageShell>
  );
}
