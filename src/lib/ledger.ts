import { createServerFn } from "@tanstack/react-start";
import { products } from "@/lib/catalog";
import { corpus120, dhContracts, dfrlResults, dfrlRun } from "@/lib/dfrl";
import { daisyNodes } from "@/lib/nodes";
import { adapters } from "@/lib/infra";
import type { Sql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { shouldSeedDemoData } from "@/lib/seed-policy";
import { authorizeRecoveryDrill } from "@/lib/recovery-authorization";

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

let seeded = false;

async function ensureSeeded() {
  if (seeded) return;
  const { getSql, dbSource } = await import("@/lib/db");
  // Production Neon data is authoritative. Never backfill it from local catalogs
  // or bundled formal-corpus fixtures during a read request.
  if (!shouldSeedDemoData(dbSource, process.env.NODE_ENV)) {
    seeded = true;
    return;
  }
  const sql = await getSql();
  const existing = await sql<{ n: number }>`select count(*)::int as n from paradoxes`;
  const already = existing[0]?.n ?? 0;
  if (already < 120) {
    const now = Date.now();
    for (const p of [...dfrlResults, ...dhContracts]) {
      await sql`
        insert into paradoxes (
          id, code, name, domain, category, classification, scope,
          formal_invariant, z3_smt_assertion, verification_status, created_at
        ) values (
          ${p.code}, ${p.code}, ${p.name}, ${p.domain}, ${p.category},
          ${p.classification}, ${p.scope}, ${p.invariant ?? ""}, ${""}, ${p.result}, ${now}
        ) on conflict (id) do nothing
      `;
    }
    for (const n of daisyNodes) {
      await sql`
        insert into node_registry (
          id, node_code, node_name, subsystem, status, capabilities_json, created_at
        ) values (
          ${n.id}, ${n.id}, ${n.name}, ${n.category},
          ${n.mode === "EXTERNAL_PROVIDER_REQUIRED" ? "EXTERNAL_PROVIDER_REQUIRED" : "ACTIVE"},
          ${JSON.stringify({ mode: n.mode, purpose: n.purpose })}, ${now}
        ) on conflict (id) do nothing
      `;
    }
    for (const p of products) {
      await sql`
        insert into solutions (
          id, code, title, domain, implementation_source, implementation_hash,
          verification_status, proof_bundle_id, performance_boost_percent,
          reversibility_guaranteed, status, created_at
        ) values (
          ${p.sku}, ${p.solutionId}, ${p.title}, ${p.category}, ${p.blurb}, ${p.proofBundle},
          ${p.evidence}, ${p.proofBundle}, ${p.evidence === "VERIFIED" ? 12.5 : 0},
          ${p.reversible ? 1 : 0}, ${p.evidence === "VERIFIED" ? "PUBLISHABLE" : "BLOCKED"}, ${now}
        ) on conflict (id) do nothing
      `;
      await sql`
        insert into offers (
          id, solution_id, proof_bundle_id, title, description, cost_basis_cents,
          verification_complexity_factor, risk_class, price_cents, sla_tier,
          published, verification_status, publication_blocked_reason, created_at
        ) values (
          ${"off-" + p.sku}, ${p.sku}, ${p.proofBundle}, ${p.title}, ${p.short},
          ${Math.round(p.priceCents * 0.42)}, ${1.4}, ${p.evidence === "VERIFIED" ? "BOUNDED" : "OPEN"},
          ${p.priceCents}, ${p.sla}, ${p.evidence === "VERIFIED" ? 1 : 0}, ${p.evidence},
          ${p.evidence === "VERIFIED" ? null : "Fail-closed: unverified goods cannot publish."}, ${now}
        ) on conflict (id) do nothing
      `;
    }
    for (const a of adapters) {
      await sql`
        insert into adapter_status (
          id, adapter_name, provider, environment, status, last_error, checked_at
        ) values (
          ${a.node + "-" + a.provider}, ${a.name}, ${a.provider}, ${"production"},
          ${a.status}, ${null}, ${now}
        ) on conflict (id) do update set environment = ${"production"}, checked_at = ${now}
      `;
    }
    await sql`
      insert into verification_runs (
        id, scope, environment, commit_sha, status, gates_passed, gates_total,
        root_hash, started_at, completed_at
      ) values (
        ${dfrlRun.executionId}, ${"DFRL-88"}, ${"local"}, ${null}, ${dfrlRun.overall},
        ${dfrlRun.unsat}, ${88}, ${dfrlRun.root}, ${now - 1280}, ${now}
      ) on conflict (id) do nothing
    `;
    await sql`
      insert into verification_runs (
        id, scope, environment, commit_sha, status, gates_passed, gates_total,
        root_hash, started_at, completed_at
      ) values (
        ${corpus120.gate}, ${"CORPUS-120"}, ${"local"}, ${corpus120.commit}, ${corpus120.status},
        ${corpus120.unsat}, ${120}, ${corpus120.root}, ${now - 2000}, ${now}
      ) on conflict (id) do nothing
    `;
  }
  seeded = true;
}

async function appendAudit(sql: Sql, data: { tenantId?: string; actor?: string; action: string; target: string; targetId: string; payload: string }) {
  const { dbSource } = await import("@/lib/db");
  if (dbSource === "neon") {
    if (!data.tenantId) throw new Error("tenant context is required for a production audit record");
    const prev = await sql<{ n: number; h: string }>`
      select count(*)::int as n, coalesce(max(record_hash), ${"GENESIS"}) as h from audit_records where tenant_id = ${data.tenantId}
    `;
    const index = (prev[0]?.n ?? 0) + 1;
    const previous = prev[0]?.h ?? "GENESIS";
    const payloadHash = await sha256(data.payload);
    const recordHash = await sha256(`${index}|${data.action}|${data.targetId}|${payloadHash}|${previous}`);
    const id = `aud_${Date.now().toString(36)}_${index}`;
    await sql`
      insert into audit_records (
        id, tenant_id, index_num, actor, action, target_entity, target_id,
        payload_json, payload_hash, previous_hash, record_hash, created_at
      ) values (
        ${id}, ${data.tenantId}, ${index}, ${data.actor ?? "SYSTEM_RECOVERY_DRILL"}, ${data.action}, ${data.target},
        ${data.targetId}, ${data.payload}, ${payloadHash}, ${previous}, ${recordHash}, ${Date.now()}
      )
    `;
    return { id, index, recordHash, previous };
  }

  const prev = await sql<{ n: number; h: string }>`
    select count(*)::int as n, coalesce(max(record_hash), ${"GENESIS"}) as h from audit_records
  `;
  const index = (prev[0]?.n ?? 0) + 1;
  const previous = prev[0]?.h ?? "GENESIS";
  const payloadHash = await sha256(data.payload);
  const recordHash = await sha256(`${index}|${data.action}|${data.targetId}|${payloadHash}|${previous}`);
  const id = `aud_${Date.now().toString(36)}_${index}`;
  await sql`
    insert into audit_records (
      id, index_num, actor, action, target_entity, target_id,
      payload_json, payload_hash, previous_hash, record_hash, created_at
    ) values (
      ${id}, ${index}, ${data.actor ?? "SYSTEM_RECOVERY_DRILL"}, ${data.action}, ${data.target},
      ${data.targetId}, ${data.payload}, ${payloadHash}, ${previous}, ${recordHash}, ${Date.now()}
    )
  `;
  return { id, index, recordHash, previous };
}

export type LedgerSnapshot = {
  paradoxes: number; nodes: number; offers: number; published: number;
  auditHeight: number; lastHash: string; db: "neon" | "pglite";
};

export const getLedgerSnapshot = createServerFn({ method: "GET" }).handler(async () => {
  await ensureSeeded();
  const { getSql, dbSource } = await import("@/lib/db");
  const sql = await getSql();
  const rows = await sql<{
    paradoxes: number;
    nodes: number;
    offers: number;
    published: number;
    audit_height: number;
    last_hash: string | null;
    checkpoints: number;
    failures: number;
    rollbacks: number;
  }>`select * from solvex_private.public_ledger_snapshot()`;
  const row = rows[0];
  return {
    paradoxes: row?.paradoxes ?? 0,
    nodes: row?.nodes ?? 0,
    offers: row?.offers ?? 0,
    published: row?.published ?? 0,
    auditHeight: row?.audit_height ?? 0,
    lastHash: row?.last_hash ?? (shouldSeedDemoData(dbSource, process.env.NODE_ENV) ? dfrlRun.root : "NONE"),
    db: dbSource,
  } satisfies LedgerSnapshot;
});

export const getProductionHealth = createServerFn({ method: "GET" }).handler(async () => {
  const { dbSource, getSql } = await import("@/lib/db");
  try {
    await ensureSeeded();
    const sql = await getSql();
    const rows = await sql<{
      paradoxes: number;
      nodes: number;
      offers: number;
      published: number;
      audit_height: number;
      last_hash: string | null;
      checkpoints: number;
      failures: number;
      rollbacks: number;
    }>`select * from solvex_private.public_ledger_snapshot()`;
    const row = rows[0];
    if (!row) throw new Error("Public ledger snapshot returned no row.");
    return {
      ok: true as const,
      db: dbSource,
      counts: {
        paradoxes: row.paradoxes,
        nodes: row.nodes,
        checkpoints: row.checkpoints,
        failures: row.failures,
        rollbacks: row.rollbacks,
        audits: row.audit_height,
      },
    };
  } catch (error) {
    return { ok: false as const, db: dbSource, error: error instanceof Error ? error.message : String(error) };
  }
});

export const runRecoveryDrill = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
  const { dbSource, getSql } = await import("@/lib/db");
  const authorization = authorizeRecoveryDrill(context.userId, {
    production: process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production",
    operatorUserIds: process.env.SOLVEX_OPERATOR_USER_IDS,
    recoveryTenantId: process.env.SOLVEX_RECOVERY_TENANT_ID,
    runtimeDatabaseConfigured: Boolean(process.env.DATABASE_RUNTIME_URL?.trim()),
  });
  if (!authorization.allowed) throw new Error(authorization.reason);
  await ensureSeeded();
  const sql = await getSql();
  const targetId = `recovery-drill-${Date.now().toString(36)}`;
  const checkpointId = `chk_${targetId}`;
  const failureId = `fail_${targetId}`;
  const rollbackId = `rb_${targetId}`;
  const state = JSON.stringify({ status: "HEALTHY", value: 0, synthetic: true });
  const stateHash = await sha256(state);
  const now = Date.now();
  const tenants = authorization.tenantId
    ? await sql<{ id: string }>`select id from tenants where id = ${authorization.tenantId} limit 1`
    : await sql<{ id: string }>`select id from tenants limit 1`;
  const tenantId = tenants[0]?.id ?? `tenant_recovery_drill`;
  if (!tenants[0]) {
    if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
      throw new Error("Recovery drill blocked: configured production tenant does not exist.");
    }
    await sql`insert into tenants (id, name, tier, isolated_storage_key, status, created_at, updated_at)
      values (${tenantId}, ${"Recovery Drill Tenant"}, ${"STANDARD"}, ${"recovery-drill"}, ${"ACTIVE"}, ${now}, ${now})
      on conflict (id) do nothing`;
  }
  await sql`insert into checkpoints (id, tenant_id, checkpoint_id, target_mutation, classification, snapshot_state_json, created_at, updated_at, status, payload_json)
    values (${checkpointId}, ${tenantId}, ${checkpointId}, ${targetId}, ${"SYNTHETIC_RECOVERY_DRILL"}, ${state}, ${now}, ${now}, ${"CAPTURED"}, ${JSON.stringify({ stateHash })})`;
  await sql`insert into failures (id, tenant_id, failure_type, severity, message, quarantined, resolved_at, created_at, updated_at, status, payload_json)
    values (${failureId}, ${tenantId}, ${"SYNTHETIC_INVARIANT_BREACH"}, ${"LOW"}, ${"Synthetic recovery drill failure"}, ${true}, ${now + 2}, ${now + 1}, ${now + 2}, ${"RECOVERED"}, ${JSON.stringify({ checkpointId, recovered: true })})`;
  const evidenceHash = await sha256(`${checkpointId}|${failureId}|${stateHash}`);
  await sql`insert into rollback_records (id, tenant_id, checkpoint_id, reason, status, restored_hash, created_at, updated_at, payload_json)
    values (${rollbackId}, ${tenantId}, ${checkpointId}, ${"SYNTHETIC_INVARIANT_BREACH"}, ${"RESTORED"}, ${stateHash}, ${now + 2}, ${now + 2}, ${JSON.stringify({ failureId, evidenceHash, targetId })})`;
  const audit = await appendAudit(sql, {
    tenantId, actor: context.userId,
    action: "RECOVERY_DRILL_ROLLBACK", target: "synthetic_recovery_target", targetId,
    payload: JSON.stringify({ checkpointId, failureId, rollbackId, restoredHash: stateHash }),
  });
  return { ok: true as const, db: dbSource, targetId, checkpointId, failureId, rollbackId, auditId: audit.id, restoredHash: stateHash };
});
