/**
 * Fail-closed release preflight for any future PayPal Live implementation.
 * This module deliberately does not switch the current Sandbox adapter to Live.
 */
export type PaymentEnvironment = "sandbox" | "live";
export type PaymentGateResult =
  | { enabled: false; environment: PaymentEnvironment | null; reason: "payments_disabled" }
  | { enabled: true; environment: "sandbox" | "live"; ready: true }
  | { enabled: false; environment: "sandbox" | "live" | null; reason: string };
type Env = Record<string, string | undefined>;
const present = (env: Env, key: string): boolean => Boolean(env[key]?.trim());

export function evaluatePaymentReleaseGate(env: Env): PaymentGateResult {
  // Environment values are intentionally case-sensitive: "Live" and "SANDBOX"
  // are configuration errors, not aliases for the approved literal values.
  const rawEnvironment = env.PAYPAL_ENVIRONMENT?.trim();
  const environment = rawEnvironment === "sandbox" || rawEnvironment === "live" ? rawEnvironment : null;
  if (env.PAYMENTS_ENABLED?.trim() !== "true") {
    return { enabled: false, environment, reason: "payments_disabled" };
  }
  if (!environment) return { enabled: false, environment: null, reason: "invalid_environment" };
  if (environment === "sandbox") {
    if (!present(env, "PAYPAL_CLIENT_ID") || !present(env, "PAYPAL_CLIENT_SECRET")) {
      return { enabled: false, environment, reason: "sandbox_credentials_missing" };
    }
    return { enabled: true, environment, ready: true };
  }
  const missing = [
    "PAYPAL_LIVE_CLIENT_ID", "PAYPAL_LIVE_CLIENT_SECRET", "PAYPAL_LIVE_WEBHOOK_ID",
    "BETTER_AUTH_URL", "DATABASE_RUNTIME_URL", "PAYMENT_RELEASE_APPROVED_BY", "PAYMENT_RELEASE_APPROVAL_ID",
  ].filter((key) => !present(env, key));
  if (missing.length) return { enabled: false, environment, reason: "live_release_configuration_incomplete" };
  if (env.VERCEL_ENV !== "production") return { enabled: false, environment, reason: "live_requires_production" };
  if (env.BETTER_AUTH_URL?.trim() !== env.CANONICAL_PRODUCTION_ORIGIN?.trim()) {
    return { enabled: false, environment, reason: "canonical_origin_mismatch" };
  }
  if (!env.BETTER_AUTH_URL?.startsWith("https://")) return { enabled: false, environment, reason: "https_origin_required" };
  // Configuration presence is not proof the ledger, webhook, reconciliation,
  // refunds, or tenant isolation are ready. Keep Live blocked until explicitly tested.
  if (env.PAYMENT_LIVE_IMPLEMENTATION_VERIFIED !== "true") {
    return { enabled: false, environment, reason: "live_acceptance_suite_not_verified" };
  }
  return { enabled: true, environment, ready: true };
}
