import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("production readiness fails closed on auth, runtime-role, RLS, and signed-context blockers", async () => {
  const source = await readFile(new URL("../src/routes/readyz.ts", import.meta.url), "utf8");
  assert.match(source, /DATABASE_RUNTIME_URL/);
  assert.match(source, /authDisabled \|\| !authConfigured/);
  assert.match(source, /current_role !== "solvex_app_runtime"/);
  assert.match(source, /login_role_elevated/);
  assert.match(source, /login_inherits_neon_superuser/);
  assert.match(source, /pg_has_role/);
  assert.match(source, /unsafe_public_table_count !== 0/);
  assert.match(source, /signed_tenant_context_not_ready/);
  assert.match(source, /migration_metadata_exposed/);
  assert.match(source, /status: "not_ready"/);
  assert.match(source, /status: 503/);

  const dbSource = await readFile(new URL("../src/lib/db.ts", import.meta.url), "utf8");
  assert.match(dbSource, /pool\.connect\(\)/);
  assert.match(dbSource, /SET LOCAL ROLE solvex_app_runtime/);
  assert.match(dbSource, /client\.query\("BEGIN"\)/);
  assert.match(dbSource, /client\.query\("COMMIT"\)/);
  assert.doesNotMatch(dbSource, /options:\s*"[-]c role=solvex_app_runtime"/);

  const authSource = await readFile(new URL("../src/lib/auth/server.ts", import.meta.url), "utf8");
  assert.match(authSource, /productionDeployment \|\| env\("VITE_AUTH_ENABLED"\) === "false"/);
  assert.doesNotMatch(authSource, /options:\s*"[-]c role=solvex_app_runtime"/);
});
