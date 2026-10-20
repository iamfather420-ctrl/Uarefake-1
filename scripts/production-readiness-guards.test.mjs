import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("production readiness fails closed on runtime identity, tenant RLS, and auth", async () => {
  const [readyz, db, auth] = await Promise.all([
    read("../src/routes/readyz.ts"),
    read("../src/lib/db.ts"),
    read("../src/lib/auth/server.ts"),
  ]);

  assert.match(readyz, /DATABASE_RUNTIME_URL/);
  assert.match(readyz, /trusted_auth_not_configured/);
  assert.match(readyz, /runtime_role_not_forced/);
  assert.match(readyz, /effective_runtime_role_elevated/);
  assert.match(readyz, /runtime_login_role_elevated/);
  assert.match(readyz, /runtime_login_inherits_neon_superuser/);
  assert.match(readyz, /tenant_rls_incomplete/);
  assert.match(readyz, /migration_metadata_exposed/);
  assert.match(readyz, /signed_tenant_context_not_ready/);
  assert.match(readyz, /status: "not_ready"/);
  assert.match(readyz, /status: 503/);

  // The runtime credential must select the non-login app role at connection
  // startup; mere membership does not change current_user.
  assert.match(db, /options:\s*"[-]c role=solvex_app_runtime"/);
  assert.match(db, /DATABASE_RUNTIME_URL is required for production application queries/);
  assert.match(db, /process\.env\.VERCEL_ENV === "production"/);

  // Production auth must not silently fall back to preview OAuth credentials.
  assert.match(auth, /const productionDeployment = env\("VERCEL_ENV"\) === "production"/);
  assert.match(auth, /productionDeployment \? undefined : PREVIEW_CLIENT_ID/);
  assert.match(auth, /productionDeployment \? undefined : PREVIEW_CLIENT_SECRET/);
  assert.match(auth, /configuredGrokIssuer && env\("BETTER_AUTH_SECRET"\) && env\("BETTER_AUTH_URL"\)/);
  // Auth/session persistence must not use the elevated migration URL.
  assert.match(auth, /const runtimeDatabaseUrl = env\("DATABASE_RUNTIME_URL"\)/);
  assert.match(auth, /productionDeployment && !runtimeDatabaseUrl/);
  assert.match(auth, /DATABASE_RUNTIME_URL is required for production auth/);
  assert.match(auth, /const databaseUrl = productionDeployment\s+\? runtimeDatabaseUrl\s+: runtimeDatabaseUrl \?\? env\("DATABASE_URL"\)/);
  assert.match(auth, /runtimeDatabaseUrl \? \{ options: "-c role=solvex_app_runtime" \} : \{\}/);
});
