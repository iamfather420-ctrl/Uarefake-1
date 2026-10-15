import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { productBySku } from "@/lib/catalog";
import type { Sql } from "@/lib/db";

async function sha256(text: string) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * A verified account must map to exactly one active tenant membership before
 * tenant data can be read or written. No default/shared tenant is ever assumed.
 */
async function requireTenantId(sql: Sql, userId: string): Promise<string> {
  const rows = await sql<{ tenant_id: string }>`
    select distinct tm.tenant_id
    from "user" as auth_user
    join public.users as app_user
      on lower(app_user.email) = lower(auth_user.email)
     and app_user.status = 'ACTIVE'
    join public.tenant_memberships as tm
      on tm.user_id = app_user.id
     and tm.tenant_id = app_user.tenant_id
     and tm.status = 'ACTIVE'
    join public.tenants as tenant
      on tenant.id = tm.tenant_id
     and tenant.status = 'ACTIVE'
    where auth_user.id = ${userId}
    limit 2
  `;
  if (rows.length !== 1 || !rows[0]?.tenant_id) {
    throw new Error(
      "No unique active tenant membership is bound to this authenticated account; refusing cross-tenant access.",
    );
  }
  return rows[0].tenant_id;
}

async function appendAudit(
  sql: Sql,
  input: { tenantId: string; actor: string; action: string; target: string; targetId: string; payload: string },
) {
  const previousRows = await sql<{ index_num: number; record_hash: string }>`
    select index_num, record_hash from audit_records
    where tenant_id = ${input.tenantId}
    order by index_num desc limit 1
  `;
  const index = (previousRows[0]?.index_num ?? 0) + 1;
  const previous = previousRows[0]?.record_hash ?? "GENESIS";
  const payloadHash = await sha256(input.payload);
  const recordHash = await sha256(`${input.tenantId}|${index}|${input.actor}|${input.action}|${input.targetId}|${payloadHash}|${previous}`);
  const id = `aud_${Date.now().toString(36)}_${index}`;
  await sql`
    insert into audit_records (
      id, tenant_id, index_num, actor, action, target_entity, target_id,
      payload_json, payload_hash, previous_hash, record_hash, created_at
    ) values (
      ${id}, ${input.tenantId}, ${index}, ${input.actor}, ${input.action}, ${input.target},
      ${input.targetId}, ${input.payload}, ${payloadHash}, ${previous}, ${recordHash}, ${Date.now()}
    )
  `;
  return { id, index, recordHash, previous };
}

export type LedgerSnapshot = {
  paradoxes: number; nodes: number; offers: number; published: number;
  auditHeight: number; lastHash: string; db: "neon" | "pglite";
};

export const getLedgerSnapshot = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql, dbSource } = await import("@/lib/db");
    const sql = await getSql();
    const tenantId = await requireTenantId(sql, context.userId);
    const [paradoxes, nodes, offers, published, audit] = await Promise.all([
      sql<{ n: number }>`select count(*)::int as n from paradoxes where tenant_id = ${tenantId}`,
      sql<{ n: number }>`select count(*)::int as n from node_registry where tenant_id = ${tenantId}`,
      sql<{ n: number }>`select count(*)::int as n from offers where tenant_id = ${tenantId}`,
      sql<{ n: number }>`select count(*)::int as n from offers where tenant_id = ${tenantId} and published = true`,
      sql<{ n: number; h: string | null }>`
        select count(*)::int as n,
          (select record_hash from audit_records where tenant_id = ${tenantId} order by index_num desc limit 1) as h
        from audit_records where tenant_id = ${tenantId}
      `,
    ]);
    return {
      paradoxes: paradoxes[0]?.n ?? 0, nodes: nodes[0]?.n ?? 0, offers: offers[0]?.n ?? 0,
      published: published[0]?.n ?? 0, auditHeight: audit[0]?.n ?? 0,
      lastHash: audit[0]?.h ?? "GENESIS", db: dbSource,
    } satisfies LedgerSnapshot;
  });

export const getProductionHealth = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { dbSource, getSql } = await import("@/lib/db");
    try {
      const sql = await getSql();
      const tenantId = await requireTenantId(sql, context.userId);
      const rows = await sql<{
        paradoxes: number; nodes: number; checkpoints: number; failures: number; rollbacks: number; audits: number;
      }>`
        select
          (select count(*)::int from paradoxes where tenant_id = ${tenantId}) as paradoxes,
          (select count(*)::int from node_registry where tenant_id = ${tenantId}) as nodes,
          (select count(*)::int from checkpoints where tenant_id = ${tenantId}) as checkpoints,
          (select count(*)::int from failures where tenant_id = ${tenantId}) as failures,
          (select count(*)::int from rollback_records where tenant_id = ${tenantId}) as rollbacks,
          (select count(*)::int from audit_records where tenant_id = ${tenantId}) as audits
      `;
      return { ok: true as const, db: dbSource, counts: rows[0] };
    } catch (error) {
      return { ok: false as const, db: dbSource, error: error instanceof Error ? error.message : String(error) };
    }
  });

export const runRecoveryDrill = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { dbSource, getSql } = await import("@/lib/db");
    const sql = await getSql();
    const targetId = `recovery-drill-${Date.now().toString(36)}`;
    const checkpointId = `chk_${targetId}`;
    const failureId = `fail_${targetId}`;
    const rollbackId = `rb_${targetId}`;
    const state = JSON.stringify({ status: "HEALTHY", value: 0, synthetic: true });
    const stateHash = await sha256(state);
    const now = Date.now();
    const result = await sql.transaction(async (tx) => {
      const tenantId = await requireTenantId(tx, context.userId);
      await tx`
        insert into checkpoints (id, tenant_id, checkpoint_id, target_mutation, classification, snapshot_state_json, target_id, created_at)
        values (${checkpointId}, ${tenantId}, ${checkpointId}, ${targetId}, 'SYNTHETIC_DRILL', ${state}, ${targetId}, ${now})
      `;
      await tx`
        insert into failures (id, tenant_id, failure_type, severity, message, quarantined, target_id, status, payload_json, created_at)
        values (${failureId}, ${tenantId}, 'SYNTHETIC_INVARIANT_BREACH', 'LOW', 'Synthetic recovery drill event', true, ${targetId}, 'RESOLVED', ${JSON.stringify({ checkpointId, recovered: true, stateHash })}, ${now + 1})
      `;
      const rollbackPayload = JSON.stringify({ checkpointId, failureId, restoredHash: stateHash });
      await tx`
        insert into rollback_records (id, tenant_id, checkpoint_id, reason, status, restored_hash, target_id, payload_json, created_at)
        values (${rollbackId}, ${tenantId}, ${checkpointId}, 'Synthetic drill recovery', 'RESTORED', ${stateHash}, ${targetId}, ${rollbackPayload}, ${now + 2})
      `;
      const audit = await appendAudit(tx, {
        tenantId, actor: context.userId, action: "RECOVERY_DRILL_ROLLBACK",
        target: "synthetic_recovery_target", targetId,
        payload: JSON.stringify({ checkpointId, failureId, rollbackId, restoredHash: stateHash }),
      });
      return { tenantId, audit };
    });
    return { ok: true as const, db: dbSource, tenantId: result.tenantId, targetId, checkpointId, failureId, rollbackId, auditId: result.audit.id, restoredHash: stateHash };
  });

export const persistOrder = createServerFn({ method: "POST" })
  .validator((input: {
    id: string;
    items: { sku: string; proof: string; qty: number }[];
  }) => input)
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if (!/^ord_[a-z0-9_:-]{4,120}$/i.test(data.id)) {
      throw new Error("Order rejected: invalid order identifier.");
    }
    if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 30) {
      throw new Error("Order rejected: invalid number of order lines.");
    }
    const catalogItems = data.items.map((item) => {
      const product = productBySku(item.sku);
      if (!product || product.evidence !== "VERIFIED") {
        throw new Error("Order rejected: SKU is unknown or lacks verified evidence.");
      }
      if (item.proof !== product.proofBundle) {
        throw new Error("Order rejected: proof bundle does not match the canonical catalog.");
      }
      if (!Number.isSafeInteger(item.qty) || item.qty < 1 || item.qty > 50) {
        throw new Error("Order rejected: quantity must be between 1 and 50.");
      }
      return { ...item, product, lineTotal: product.priceCents * item.qty };
    });
    if (new Set(catalogItems.map((item) => item.sku)).size !== catalogItems.length) {
      throw new Error("Order rejected: duplicate SKUs must be consolidated into one line.");
    }

    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const now = Date.now();
    const persisted = await sql.transaction(async (tx) => {
      const tenantId = await requireTenantId(tx, context.userId);
      for (const item of catalogItems) {
        const rowId = `${data.id}:${item.sku}`;
        await tx`
          insert into orders (
            id, tenant_id, offer_id, solution_id, proof_bundle_id, price_cents,
            status, payment_id, deployment_id, created_at, updated_at
          ) values (
            ${rowId}, ${tenantId}, ${"off-" + item.sku}, ${item.sku}, ${item.proof},
            ${item.lineTotal}, 'ORDER_CREATED', null, null, ${now}, ${now}
          )
        `;
      }
      const audit = await appendAudit(tx, {
        tenantId, actor: context.userId, action: "ORDER_CREATED", target: "orders",
        targetId: data.id,
        payload: JSON.stringify({
          items: catalogItems.map((item) => ({ sku: item.sku, qty: item.qty, priceCents: item.lineTotal })),
          totalCents: catalogItems.reduce((sum, item) => sum + item.lineTotal, 0),
          payment: "NOT_COLLECTED",
        }),
      });
      return { tenantId, audit };
    });
    return { ok: true as const, persisted: true as const, tenantId: persisted.tenantId, auditId: persisted.audit.id };
  });
