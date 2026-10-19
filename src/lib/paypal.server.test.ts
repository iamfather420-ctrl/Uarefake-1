import assert from "node:assert/strict";
import test from "node:test";
import { getPayPalConfig } from "./paypal-config.ts";

const names = [
  "PAYPAL_ENVIRONMENT",
  "PAYPAL_CLIENT_ID",
  "PAYPAL_CLIENT_SECRET",
  "PAYPAL_SANDBOX_CLIENT_ID",
  "PAYPAL_SANDBOX_CLIENT_SECRET",
  "PAYPAL_LIVE_CLIENT_ID",
  "PAYPAL_LIVE_CLIENT_SECRET",
  "PAYMENTS_ENABLED",
  "PAYPAL_LIVE_RELEASE_APPROVED",
  "PAYPAL_WEBHOOK_ID",
  "BETTER_AUTH_URL",
  "DATABASE_URL",
  "DATABASE_RUNTIME_URL",
  "VERCEL_ENV",
  "SOLVEX_TENANT_ID",
] as const;

test("PayPal sandbox configuration uses sandbox host and generic compatibility names", () => {
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    process.env.PAYPAL_ENVIRONMENT = "sandbox";
    process.env.PAYPAL_CLIENT_ID = "sandbox-client-id";
    process.env.PAYPAL_CLIENT_SECRET = "sandbox-client-secret";
    delete process.env.PAYPAL_SANDBOX_CLIENT_ID;
    delete process.env.PAYPAL_SANDBOX_CLIENT_SECRET;
    const config = getPayPalConfig();
    assert.equal(config.environment, "sandbox");
    assert.equal(config.baseUrl, "https://api-m.sandbox.paypal.com");
  } finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
});

test("PayPal Live never falls back to generic or Sandbox credentials", () => {
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    process.env.PAYPAL_ENVIRONMENT = "live";
    process.env.PAYPAL_CLIENT_ID = "generic-client-id";
    process.env.PAYPAL_CLIENT_SECRET = "generic-client-secret";
    process.env.PAYMENTS_ENABLED = "true";
    assert.throws(() => getPayPalConfig(), /live credentials are missing/);
  } finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
});

test("PayPal Live remains disabled until every release gate is present", () => {
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    process.env.PAYPAL_ENVIRONMENT = "live";
    process.env.PAYPAL_LIVE_CLIENT_ID = "live-client-id";
    process.env.PAYPAL_LIVE_CLIENT_SECRET = "live-client-secret";
    process.env.PAYMENTS_ENABLED = "true";
    process.env.PAYPAL_LIVE_RELEASE_APPROVED = "false";
    assert.throws(() => getPayPalConfig(), /PAYPAL_LIVE_RELEASE_APPROVED/);
  } finally {
    for (const name of names) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
});

test("unknown PayPal environments fail closed", () => {
  const saved = process.env.PAYPAL_ENVIRONMENT;
  try {
    process.env.PAYPAL_ENVIRONMENT = "production";
    assert.throws(() => getPayPalConfig(), /must be sandbox or live/);
  } finally {
    if (saved === undefined) delete process.env.PAYPAL_ENVIRONMENT;
    else process.env.PAYPAL_ENVIRONMENT = saved;
  }
});
