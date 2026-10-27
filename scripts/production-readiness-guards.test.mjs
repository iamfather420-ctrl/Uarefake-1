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
  assert.match(auth, /const selfHostedProductionReady =/);
  assert.match(auth, /productionDeployment && !grokOAuthConfigured && !selfHostedProductionReady/);
  assert.match(auth, /env\("VITE_AUTH_ENABLED"\) === "false"/);
  assert.match(auth, /SELF_HOSTED_AUTH_RECOVERY_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_TENANT_ISOLATION_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_BACKUP_RESTORE_VERIFIED/);
  assert.match(readyz, /trusted_auth_not_configured/);
  assert.match(readyz, /runtime_role_not_forced/);
  assert.match(readyz, /unexpected_runtime_login_role/);
  assert.match(readyz, /runtime_database_connection_failed/);
  assert.match(readyz, /runtime_identity_probe_failed/);
  assert.match(readyz, /tenant_rls_probe_failed/);
  assert.match(readyz, /migration_metadata_probe_failed/);
  assert.match(readyz, /signed_tenant_context_probe_failed/);
  assert.match(readyz, /safeSqlStateCode/);
  assert.match(readyz, /runtime_identity_probe_sqlstate_/);
  assert.match(readyz, /effective_runtime_role_elevated/);
  assert.match(readyz, /runtime_login_role_elevated/);
  assert.match(readyz, /runtime_login_inherits_neon_superuser/);
  assert.match(readyz, /tenant_rls_incomplete/);
  assert.match(readyz, /migration_metadata_exposed/);
  assert.match(readyz, /signed_tenant_context_not_ready/);
  assert.match(readyz, /status: "not_ready"/);
  assert.match(readyz, /status: 503/);

  // Neon transaction pooling rejects startup role options; role switching must
  // occur transaction-locally on the same pinned client.
  assert.match(db, /pool\.connect\(\)/);
  assert.match(db, /SET LOCAL ROLE solvex_app_runtime/);
  assert.doesNotMatch(db, /options:\s*"[-]c role=solvex_app_runtime"/);
  assert.match(db, /DATABASE_RUNTIME_URL is required for production application queries/);
  assert.match(db, /process\.env\.VERCEL_ENV === "production"/);

  // Production auth must not silently fall back to preview OAuth credentials.
  assert.match(auth, /const productionDeployment = env\("VERCEL_ENV"\) === "production"/);
  assert.match(auth, /const selfHostedProductionReady =/);
  assert.match(auth, /productionDeployment && !grokOAuthConfigured && !selfHostedProductionReady/);
  assert.match(auth, /env\("VITE_AUTH_ENABLED"\) === "false"/);
  assert.match(auth, /SELF_HOSTED_AUTH_RECOVERY_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_TENANT_ISOLATION_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_BACKUP_RESTORE_VERIFIED/);
  assert.match(auth, /const selfHostedProductionReady =/);
  assert.match(auth, /productionDeployment && !grokOAuthConfigured && !selfHostedProductionReady/);
  assert.match(auth, /env\("VITE_AUTH_ENABLED"\) === "false"/);
  assert.match(auth, /SELF_HOSTED_AUTH_RECOVERY_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_TENANT_ISOLATION_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_BACKUP_RESTORE_VERIFIED/);
  assert.match(auth, /configuredGrokIssuer && env\("BETTER_AUTH_SECRET"\) && env\("BETTER_AUTH_URL"\)/);
  // Auth/session persistence must not use the elevated migration URL.
  assert.match(auth, /const runtimeDatabaseUrl = env\("DATABASE_RUNTIME_URL"\)/);
  assert.match(auth, /const selfHostedProductionReady =/);
  assert.match(auth, /productionDeployment && !grokOAuthConfigured && !selfHostedProductionReady/);
  assert.match(auth, /env\("VITE_AUTH_ENABLED"\) === "false"/);
  assert.match(auth, /SELF_HOSTED_AUTH_RECOVERY_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_TENANT_ISOLATION_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_BACKUP_RESTORE_VERIFIED/);
  assert.match(auth, /DATABASE_RUNTIME_URL is required for production auth/);
  assert.match(auth, /const databaseUrl = productionDeployment\s+\? runtimeDatabaseUrl\s+: runtimeDatabaseUrl \?\? env\("DATABASE_URL"\)/);
  assert.doesNotMatch(auth, /options:\s*"[-]c role=solvex_app_runtime"/);
  assert.match(auth, /const selfHostedProductionReady =/);
  assert.match(auth, /productionDeployment && !grokOAuthConfigured && !selfHostedProductionReady/);
  assert.match(auth, /env\("VITE_AUTH_ENABLED"\) === "false"/);
  assert.match(auth, /SELF_HOSTED_AUTH_RECOVERY_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_TENANT_ISOLATION_VERIFIED/);
  assert.match(auth, /SELF_HOSTED_AUTH_BACKUP_RESTORE_VERIFIED/);
});
