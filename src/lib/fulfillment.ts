import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { productBySku } from "@/lib/catalog";

const id = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
const now = () => Date.now();

function authorizerIds(): Set<string> {
  return new Set((process.env.SOLVEX_AUTHORIZER_USER_IDS ?? "")
    .split(",").map((value) => value.trim()).filter(Boolean));
}

export const listMyEntitlements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { getSql } = await import("@/lib/db");
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
    const { getSql } = await import("@/lib/db");
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
    const { getSql } = await import("@/lib/db");
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
    // The partial unique index plus ON CONFLICT makes retries safe when two
    // requests race. The INSERT rechecks ACTIVE status in the same statement.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const jobId = id("jit");
      const timestamp = now();
      const created = await sql<{ id: string; status: string }>`
        insert into fulfillment_jobs
          (id, entitlement_id, user_id, sku, status, authorization_id, artifact_sha256, artifact_uri, failure_code, created_at, updated_at)
        select ${jobId}, e.id, ${context.userId}, e.sku, 'WAITING_AUTH', null, null, null, null, ${timestamp}, ${timestamp}
        from entitlements e
        where e.id = ${entitlement.id}
          and e.user_id = ${context.userId}
          and e.status = 'ACTIVE'
        on conflict (entitlement_id) where status not in ('FAILED','REVOKED') do nothing
        returning id, status`;
      if (created[0]) {
        return { ok: true as const, jobId: created[0].id, status: created[0].status, reused: false };
      }

      const prior = await sql<{ id: string; status: string }>`
        select id, status from fulfillment_jobs
        where entitlement_id = ${entitlement.id}
          and user_id = ${context.userId}
          and status not in ('FAILED','REVOKED')
        order by created_at desc limit 1`;
      if (prior[0]) {
        return { ok: true as const, jobId: prior[0].id, status: prior[0].status, reused: true };
      }
    }
    throw new Error("Fulfillment state changed concurrently. Refresh and retry.");
  });

/** Human-root authorization is an explicit server-side allowlist, never a client boolean. */
export const authorizeJitFulfillment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { jobId: string; scope: string; ttlSeconds?: number }) => {
    if (!input || typeof input.jobId !== "string" || input.jobId.length < 3 || input.jobId.length > 160) throw new Error("Invalid job identifier.");
    if (typeof input.scope !== "string" || !/^[a-z0-9:*._-]{1,160}$/i.test(input.scope)) throw new Error("Invalid authorization scope.");
    if (input.scope !== "jit:build") throw new Error("JIT fulfillment authorization scope must be jit:build.");
    const ttlSeconds = input.ttlSeconds ?? 900;
    if (!Number.isInteger(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > 3600) throw new Error("Authorization TTL must be 60–3600 seconds.");
    return { ...input, ttlSeconds };
  })
  .handler(async ({ data, context }) => {
    if (!authorizerIds().has(context.userId)) throw new Error("Human-root authorization denied. Caller is not in SOLVEX_AUTHORIZER_USER_IDS.");
    const { getSql } = await import("@/lib/db");
    const sql = await getSql();
    const authorizationId = id("authz");
    const timestamp = now();
    const expiresAt = timestamp + data.ttlSeconds * 1000;

    // One statement makes authorization insertion and state transition atomic.
    // The row lock ensures concurrent authorizers cannot both authorize one job.
    const authorized = await sql<{
      job_id: string; authorization_id: string; status: string; expires_at: number;
    }>`
      with candidate as (
        select j.id
        from fulfillment_jobs j
        join entitlements e on e.id = j.entitlement_id
        where j.id = ${data.jobId}
          and j.status = 'WAITING_AUTH'
          and e.status = 'ACTIVE'
          and e.user_id = j.user_id
        for update of j
      ),
      auth as (
        insert into fulfillment_authorizations
          (id, job_id, authorized_by, scope, expires_at, revoked_at, created_at)
        select ${authorizationId}, candidate.id, ${context.userId}, ${data.scope}, ${expiresAt}, null, ${timestamp}
        from candidate
        returning id, job_id, expires_at
      ),
      updated as (
        update fulfillment_jobs j
        set status = 'READY_TO_BUILD', authorization_id = auth.id, updated_at = ${timestamp}
        from auth
        where j.id = auth.job_id and j.status = 'WAITING_AUTH'
        returning j.id, j.status
      )
      select updated.id as job_id, auth.id as authorization_id, updated.status, auth.expires_at
      from updated
      join auth on auth.job_id = updated.id`;
    const result = authorized[0];
    if (!result) throw new Error("Job is not awaiting authorization or its entitlement is inactive.");
    return {
      ok: true as const,
      jobId: result.job_id,
      authorizationId: result.authorization_id,
      status: "READY_TO_BUILD" as const,
      expiresAt: result.expires_at,
    };
  });

/** No artifact is claimed as distributed until a real, configured builder exists. */
export const inspectJitBuilderReadiness = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => ({
    // Configuration is not runtime verification; no builder adapter is wired yet.
    ready: false,
    status: process.env.SOLVEX_JIT_BUILDER_URL && process.env.SOLVEX_JIT_BUILDER_TOKEN
      ? "BUILDER_CONFIGURED_NOT_RUNTIME_VERIFIED"
      : "EXTERNAL_BUILDER_REQUIRED",
    note: "No builder adapter is wired in this repository. Configuration alone is not readiness, and no artifact is claimed as built, integrity-checked, or distributed.",
  }));
