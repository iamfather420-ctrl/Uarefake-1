import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const migration = await readFile(new URL("../migrations/0005_payments.sql", import.meta.url), "utf8");
const gate = await readFile(new URL("../src/lib/paypal-live-gate.server.ts", import.meta.url), "utf8");
const adapter = await readFile(new URL("../src/lib/paypal.server.ts", import.meta.url), "utf8");
const config = await readFile(new URL("../src/lib/paypal-config.ts", import.meta.url), "utf8");

test("payment ledger is tenant/user scoped and idempotent", () => {
  assert.match(migration, /tenant_id text not null/);
  assert.match(migration, /user_id text not null/);
  assert.match(migration, /amount_cents integer not null check \(amount_cents > 0\)/i);
  assert.match(migration, /unique \(tenant_id, user_id, idempotency_key\)/i);
  assert.match(migration, /payment_events/);
  assert.match(migration, /payment_refunds/);
  assert.match(migration, /payment_fulfillments/);
});

test("Live release gate requires explicit production approval and acceptance verification", () => {
  assert.match(gate, /PAYMENTS_ENABLED\?\.trim\(\) !== "true"/);
  assert.match(gate, /rawEnvironment === "sandbox" \|\| rawEnvironment === "live"/);
  assert.match(gate, /PAYPAL_LIVE_CLIENT_SECRET/);
  assert.match(gate, /PAYPAL_WEBHOOK_ID/);
  assert.match(gate, /DATABASE_RUNTIME_URL/);
  assert.match(gate, /PAYMENT_LIVE_IMPLEMENTATION_VERIFIED/);
  assert.match(gate, /live_acceptance_suite_not_verified/);
});

test("adapter supports both API hosts but binds Live to Live credentials and release gates", () => {
  assert.match(config, /https:\/\/api-m\.sandbox\.paypal\.com/);
  assert.match(config, /https:\/\/api-m\.paypal\.com/);
  assert.match(config, /PAYPAL_LIVE_CLIENT_ID/);
  assert.match(config, /evaluatePaymentReleaseGate/);
  assert.match(adapter, /PayPal-Request-Id/);
});
