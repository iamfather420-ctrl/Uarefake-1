/**
 * Fail-closed release preflight for PayPal processing.
 * Configuration presence alone never authorizes Live money movement.
 */
export type PaymentEnvironment = "sandbox" | "live";
export type PaymentGateResult =
  | { enabled: false; environment: PaymentEnvironment | null; reason: string }
  | { enabled: true; environment: PaymentEnvironment; ready: true };
type Env = Record<string, string | undefined>;
const present = (env: Env, key: string): boolean => Boolean(env[key]?.trim());

export function evaluatePaymentReleaseGate(env: Env): PaymentGateResult {
  const rawEnvironment = env.PAYPAL_ENVIRONMENT?.trim();
  const environment = rawEnvironment === "sandbox" || rawEnvironment === "live" ? rawEnvironment : null;
  if (env.PAYMENTS_ENABLED?.trim() !== "true") return { enabled: false, environment, reason: "payments_disabled" };
  if (!environment) return { enabled: false, environment: null, reason: "invalid_environment" };
  if (environment === "sandbox") {
    if ((!present(env, "PAYPAL_SANDBOX_CLIENT_ID") && !present(env, "PAYPAL_CLIENT_ID")) || (!present(env, "PAYPAL_SANDBOX_CLIENT_SECRET") && !present(env, "PAYPAL_CLIENT_SECRET"))) {
      return { enabled: false, environment, reason: "sandbox_credentials_missing" };
    }
    return { enabled: true, environment, ready: true };
  }
  const requiredLive = [
    "PAYPAL_LIVE_CLIENT_ID", "PAYPAL_LIVE_CLIENT_SECRET", "PAYPAL_WEBHOOK_ID",
    "BETTER_AUTH_URL", "DATABASE_RUNTIME_URL", "SOLVEX_TENANT_ID",
    "PAYMENT_RELEASE_APPROVED_BY", "PAYMENT_RELEASE_APPROVAL_ID",
  ];
  if (requiredLive.some((key) => !present(env, key))) return { enabled: false, environment, reason: "live_release_configuration_incomplete" };
  if (env.VERCEL_ENV !== "production") return { enabled: false, environment, reason: "live_requires_production" };
  if (env.BETTER_AUTH_URL?.trim() !== env.CANONICAL_PRODUCTION_ORIGIN?.trim()) return { enabled: false, environment, reason: "canonical_origin_mismatch" };
  if (!env.BETTER_AUTH_URL?.startsWith("https://")) return { enabled: false, environment, reason: "https_origin_required" };
  if (env.PAYPAL_LIVE_RELEASE_APPROVED?.trim().toLowerCase() !== "true") return { enabled: false, environment, reason: "operator_release_switch_missing" };
  if (env.PAYMENT_LIVE_IMPLEMENTATION_VERIFIED?.trim().toLowerCase() !== "true") return { enabled: false, environment, reason: "live_acceptance_suite_not_verified" };
  return { enabled: true, environment, ready: true };
}
