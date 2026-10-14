import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { productBySku } from "@/lib/catalog";
import { getSql } from "@/lib/db";

const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const now = () => Date.now();

function authorizerIds(): Set<string> {
  return new Set((process.env.SOLVEX_AUTHORIZER_USER_IDS ?? "")
    .split(",").map((value) => value.trim()).filter(Boolean));
}

export const listMyEntitlements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: string; order_id: string; sku: string; status: string;
      evidence_hash: string; created_at: number;
    }>`select id, order_id, sku, status, evidence_hash, created_at
      from entitlements where user_id = ${context.userId}
      order by created_at desc`;
  });

export const listMyFulfillmentJobs = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{
      id: string; entitlement_id: string; sku: string; status: string;
      artifact_sha256: string | null; failure_code: string | null;
      created_at: number; updated_at: number;
    }>`select id, entitlement_id, sku, status, artifact_sha256, failure_code, created_at, updated_at
      from fulfillment_jobs where user_id = ${context.userId}
      order by created_at desc limit 100`;
  });

export const requestJitFulfillment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { entitlementId: string }) => {
    if (!input || typeof input.entitlementId !== "string" || input.entitlementId.length < 3 || input.entitlementId.length > 160) {
      throw new Error("Invalid entitlement identifier.");
    }
    return input;
  })
  .handler(async ({ data, context }) => {
    const sql = await getSql();
    const entitlements = await sql<{ id: string; sku: string; status: string }>`
      select id, sku, status from entitlements
      where id = ${data.entitlementId} and user_id = ${context.userId}
      limit 1`;
    const entitlement = entitlements[0];
    if (!entitlement || entitlement.status !== "ACTIVE") {
      throw new Error("Active entitlement required. No distribution request was created.");
    }
    const product = productBySku(entitlement.sku);
    if (!product || product.evidence !== "VERIFIED") {
      throw new Error("Product evidence is not eligible for JIT distribution.");
    }
    const prior = await sql<{ id: string; status: string }>`
      select id, status from fulfillment_jobs
      where entitlement_id = ${entitlement.id}
        and status not in ('FAILED','REVOKED')
      order by created_at desc limit 1`;
    if (prior[0]) return { ok: true as const, jobId: prior[0].id, status: prior[0].status, reused: true };
    const jobId = id("jit");
    const timestamp = now();
    await sql`insert into fulfillment_jobs
      (id, entitlement_id, user_id, sku, status, authorization_id, artifact_sha256, artifact_uri, failure_code, created_at, updated_at)
      values (${jobId}, ${entitlement.id}, ${context.userId}, ${entitlement.sku}, 'WAITING_AUTH', null, null, null, null, ${timestamp}, ${timestamp})`;
    return { ok: true as const, jobId, status: "WAITING_AUTH" as const, reused: false };
  });

/** Human-root authorization is an explicit server-side allowlist, never a client boolean. */
export const authorizeJitFulfillment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { jobId: string; scope: string; ttlSeconds?: number }) => {
    if (!input || typeof input.jobId !== "string" || input.jobId.length < 3 || input.jobId.length > 160) throw new Error("Invalid job identifier.");
    if (typeof input.scope !== "string" || !/^[a-z0-9:*._-]{1,160}$/i.test(input.scope)) throw new Error("Invalid authorization scope.");
    const ttlSeconds = input.ttlSeconds ?? 900;
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > 3600) throw new Error("Authorization TTL must be 60–3600 seconds.");
    return { ...input, ttlSeconds };
  })
  .handler(async ({ data, context }) => {
    if (!authorizerIds().has(context.userId)) throw new Error("Human-root authorization denied. Caller is not in SOLVEX_AUTHORIZER_USER_IDS.");
    const sql = await getSql();
    const rows = await sql<{ id: string; entitlement_id: string; user_id: string; sku: string; status: string }>`
      select j.id, j.entitlement_id, j.user_id, j.sku, j.status
      from fulfillment_jobs j
      join entitlements e on e.id = j.entitlement_id
      where j.id = ${data.jobId} and j.status = 'WAITING_AUTH' and e.status = 'ACTIVE'
      limit 1`;
    const job = rows[0];
    if (!job) throw new Error("Job is not awaiting authorization or its entitlement is inactive.");
    const authorizationId = id("authz");
    const timestamp = now();
    const expiresAt = timestamp + data.ttlSeconds * 1000;
    await sql`insert into fulfillment_authorizations (id, job_id, authorized_by, scope, expires_at, revoked_at, created_at)
      values (${authorizationId}, ${job.id}, ${context.userId}, ${data.scope}, ${expiresAt}, null, ${timestamp})`;
    await sql`update fulfillment_jobs set status = 'READY_TO_BUILD', authorization_id = ${authorizationId}, updated_at = ${timestamp}
      where id = ${job.id} and status = 'WAITING_AUTH'`;
    return { ok: true as const, jobId: job.id, authorizationId, status: "READY_TO_BUILD" as const, expiresAt };
  });

/** No artifact is claimed as distributed until a real, configured builder exists. */
export const inspectJitBuilderReadiness = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => ({
    ready: Boolean(process.env.SOLVEX_JIT_BUILDER_URL && process.env.SOLVEX_JIT_BUILDER_TOKEN),
    status: process.env.SOLVEX_JIT_BUILDER_URL && process.env.SOLVEX_JIT_BUILDER_TOKEN
      ? "BUILDER_CONFIGURED_NOT_RUNTIME_VERIFIED"
      : "EXTERNAL_BUILDER_REQUIRED",
    note: "A request or authorization is not proof of a built, integrity-checked, or distributed artifact.",
  }));
