import { afterEach, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migration = async (name) => readFile(join(root, "migrations", name), "utf8");
const databases = new Set();

async function setup() {
  const db = new PGlite();
  databases.add(db);
  await db.waitReady;
  await db.exec(await migration("0004_fulfillment.sql"));
  await db.exec(await migration("0005_fulfillment_idempotency.sql"));
  await db.query(
    `insert into entitlements
      (id, user_id, order_id, sku, status, provider_payment_id, evidence_hash, created_at, updated_at)
     values ($1, $2, $3, $4, 'ACTIVE', null, $5, 1, 1)`,
    ["ent-1", "user-1", "order-1", "daisy-parai", "evidence-1"],
  );
  return db;
}

afterEach(async () => {
  for (const db of databases) {
    await db.close();
    databases.delete(db);
  }
});

test("concurrent JIT requests cannot create two active jobs for one entitlement", async () => {
  const db = await setup();
  const insert = (jobId) => db.query(
    `insert into fulfillment_jobs
      (id, entitlement_id, user_id, sku, status, authorization_id, artifact_sha256, artifact_uri, failure_code, created_at, updated_at)
     values ($1, 'ent-1', 'user-1', 'daisy-parai', 'WAITING_AUTH', null, null, null, null, 2, 2)
     on conflict (entitlement_id) where status not in ('FAILED','REVOKED') do nothing
     returning id, status`,
    [jobId],
  );

  await Promise.all([insert("jit-a"), insert("jit-b")]);
  const rows = await db.query(
    "select id, status from fulfillment_jobs where entitlement_id = 'ent-1' and status not in ('FAILED','REVOKED')",
  );
  assert.equal(rows.rows.length, 1);
  assert.equal(rows.rows[0].status, "WAITING_AUTH");
});

test("concurrent human authorizations produce one authorization and one state transition", async () => {
  const db = await setup();
  await db.query(
    `insert into fulfillment_jobs
      (id, entitlement_id, user_id, sku, status, authorization_id, artifact_sha256, artifact_uri, failure_code, created_at, updated_at)
     values ('jit-1', 'ent-1', 'user-1', 'daisy-parai', 'WAITING_AUTH', null, null, null, null, 2, 2)`,
  );

  const authorize = (authorizationId) => db.query(
    `with candidate as (
       select j.id
       from fulfillment_jobs j
       join entitlements e on e.id = j.entitlement_id
       where j.id = 'jit-1' and j.status = 'WAITING_AUTH' and e.status = 'ACTIVE'
       for update of j
     ),
     auth as (
       insert into fulfillment_authorizations
         (id, job_id, authorized_by, scope, expires_at, revoked_at, created_at)
       select $1, candidate.id, 'root-user', 'jit:build', 10000, null, 3
       from candidate
       returning id, job_id, expires_at
     ),
     updated as (
       update fulfillment_jobs j
       set status = 'READY_TO_BUILD', authorization_id = auth.id, updated_at = 3
       from auth
       where j.id = auth.job_id and j.status = 'WAITING_AUTH'
       returning j.id, j.status
     )
     select updated.id as job_id, auth.id as authorization_id, updated.status, auth.expires_at
     from updated join auth on auth.job_id = updated.id`,
    [authorizationId],
  );

  const results = await Promise.all([authorize("authz-a"), authorize("authz-b")]);
  assert.equal(results.reduce((sum, result) => sum + result.rows.length, 0), 1);
  const authRows = await db.query("select id from fulfillment_authorizations where job_id = 'jit-1'");
  assert.equal(authRows.rows.length, 1);
  const jobRows = await db.query("select status, authorization_id from fulfillment_jobs where id = 'jit-1'");
  assert.equal(jobRows.rows[0].status, "READY_TO_BUILD");
  assert.equal(jobRows.rows[0].authorization_id, authRows.rows[0].id);
});

test("failed or revoked jobs do not block a fresh retry", async () => {
  const db = await setup();
  await db.query(
    `insert into fulfillment_jobs
      (id, entitlement_id, user_id, sku, status, authorization_id, artifact_sha256, artifact_uri, failure_code, created_at, updated_at)
     values ('jit-failed', 'ent-1', 'user-1', 'daisy-parai', 'FAILED', null, null, null, 'BUILDER_ERROR', 2, 2)`,
  );
  const retry = await db.query(
    `insert into fulfillment_jobs
      (id, entitlement_id, user_id, sku, status, authorization_id, artifact_sha256, artifact_uri, failure_code, created_at, updated_at)
     values ('jit-retry', 'ent-1', 'user-1', 'daisy-parai', 'WAITING_AUTH', null, null, null, null, 3, 3)
     returning id`,
  );
  assert.equal(retry.rows[0].id, "jit-retry");
});
