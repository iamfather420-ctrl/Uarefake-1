import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const migration = await readFile(new URL("../migrations/0005_payments.sql", import.meta.url), "utf8");
const gate = await readFile(new URL("../src/lib/paypal-live-gate.server.ts", import.meta.url), "utf8");
const adapter = await readFile(new URL("../src/lib/paypal.server.ts", import.meta.url), "utf8");
test("payment ledger is tenant/user scoped, idempotent, and uses minor-unit amounts", () => {
  assert.match(migration, /tenant_id text NOT NULL/);
  assert.match(migration, /user_id text NOT NULL/);
  assert.match(migration, /amount_minor bigint NOT NULL CHECK \(amount_minor > 0\)/);
  assert.match(migration, /UNIQUE \(tenant_id, user_id, idempotency_key\)/);
  assert.match(migration, /provider_event_id text NOT NULL UNIQUE/);
  assert.match(migration, /ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /ALTER TABLE payment_fulfillments ENABLE ROW LEVEL SECURITY/);
});
test("Live release gate is explicit, production-only, and fail-closed until acceptance verification", () => {
  assert.match(gate, /PAYMENTS_ENABLED/);
  assert.match(gate, /PAYPAL_LIVE_CLIENT_SECRET/);
  assert.match(gate, /PAYPAL_LIVE_WEBHOOK_ID/);
  assert.match(gate, /DATABASE_RUNTIME_URL/);
  assert.match(gate, /PAYMENT_LIVE_IMPLEMENTATION_VERIFIED !== "true"/);
  assert.match(gate, /live_acceptance_suite_not_verified/);
});
test("existing adapter remains Sandbox-only; a configuration change cannot enable Live", () => {
  assert.match(adapter, /function sandboxBaseUrl\(\)/);
  assert.match(adapter, /environment !== "sandbox"/);
  assert.match(adapter, /api-m\.sandbox\.paypal\.com/);
  assert.doesNotMatch(adapter, /api-m\.paypal\.com/);
});
