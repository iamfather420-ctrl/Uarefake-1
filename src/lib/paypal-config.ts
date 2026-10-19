export type PayPalEnvironment = "sandbox" | "live";

export type PayPalConfig = {
  environment: PayPalEnvironment;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  webhookId?: string;
  paymentsEnabled: boolean;
};

import { evaluatePaymentReleaseGate } from "./paypal-live-gate.server.ts";

function environment(): PayPalEnvironment {
  const value = (process.env.PAYPAL_ENVIRONMENT ?? "").trim().toLowerCase();
  if (value !== "sandbox" && value !== "live") {
    throw new Error("PayPal is disabled: PAYPAL_ENVIRONMENT must be sandbox or live.");
  }
  return value;
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`PayPal is not configured: missing ${name}.`);
  return value;
}

export function getPayPalConfig(): PayPalConfig {
  const selected = environment();
  const clientId = selected === "live"
    ? process.env.PAYPAL_LIVE_CLIENT_ID?.trim()
    : process.env.PAYPAL_SANDBOX_CLIENT_ID?.trim() ?? process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = selected === "live"
    ? process.env.PAYPAL_LIVE_CLIENT_SECRET?.trim()
    : process.env.PAYPAL_SANDBOX_CLIENT_SECRET?.trim() ?? process.env.PAYPAL_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) throw new Error(`PayPal ${selected} credentials are missing.`);

  const paymentsEnabled = process.env.PAYMENTS_ENABLED?.trim().toLowerCase() === "true";
  const config: PayPalConfig = {
    environment: selected,
    baseUrl: selected === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com",
    clientId,
    clientSecret,
    webhookId: process.env.PAYPAL_WEBHOOK_ID?.trim() || undefined,
    paymentsEnabled,
  };

  if (selected === "live") {
    if (!paymentsEnabled) throw new Error("PayPal Live payments are disabled: set PAYMENTS_ENABLED=true.");
    if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") throw new Error("PayPal Live payments are disabled outside the production deployment.");
    if (process.env.PAYPAL_LIVE_RELEASE_APPROVED?.trim().toLowerCase() !== "true") throw new Error("PayPal Live payments require PAYPAL_LIVE_RELEASE_APPROVED=true.");
    if (!config.webhookId) throw new Error("PayPal Live payments require PAYPAL_WEBHOOK_ID.");
    if (!(process.env.DATABASE_RUNTIME_URL?.trim() || process.env.DATABASE_URL?.trim())) throw new Error("PayPal Live payments require a durable Neon database.");
    required("BETTER_AUTH_URL");
    const gate = evaluatePaymentReleaseGate(process.env);
    if ("reason" in gate) throw new Error(`PayPal Live release gate blocked: ${gate.reason}.`);
    if (gate.environment !== "live") throw new Error("PayPal Live release gate blocked: environment mismatch.");
  }
  return config;
}
