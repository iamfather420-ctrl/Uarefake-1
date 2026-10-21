import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(
  new URL("../migrations/0006_tenant_rls_lockdown.sql", import.meta.url),
  "utf8",
);

test("tenant policies bind OWNER and other roles to their own tenant", () => {
  assert.match(migration, /ALTER POLICY %I ON %I\.%I USING \(tenant_id = \(solvex_private\.current_claims\(\) ->> ''tenant_id''::text\)\) WITH CHECK/);
  assert.doesNotMatch(migration, /current_claims\(\) ->> ''role''::text\)\s*=\s*''OWNER''/);
});

test("payment tables are forced through RLS and denied to direct app roles", () => {
  assert.match(migration, /ALTER TABLE public\.%I FORCE ROW LEVEL SECURITY/);
  assert.match(migration, /REVOKE ALL PRIVILEGES ON TABLE public\.%I FROM solvex_app_runtime/);
  assert.match(migration, /REVOKE ALL PRIVILEGES ON TABLE public\.%I FROM solvex_runtime_login_v2/);
  assert.match(migration, /CREATE POLICY solvex_payment_default_deny/);
  assert.match(migration, /REVOKE ALL ON FUNCTION solvex_private\.current_claims\(\) FROM PUBLIC/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION solvex_private\.current_claims\(\) TO solvex_app_runtime/);
  assert.doesNotMatch(migration, /PAYPAL_ENVIRONMENT|PAYMENTS_ENABLED/);
});
