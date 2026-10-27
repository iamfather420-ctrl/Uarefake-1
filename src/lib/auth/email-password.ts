import { isSelfHostedAuthProductionReady } from "./self-hosted-auth-gate";

const env = (key: string): string | undefined => {
  const value = process.env[key]?.trim();
  return value || undefined;
};

const productionDeployment = env("VERCEL_ENV") === "production";
const passwordAuthEnabled = env("SELF_HOSTED_PASSWORD_AUTH_ENABLED") === "true";

const productionGate = isSelfHostedAuthProductionReady({
  passwordAuthEnabled,
  productionApproved: env("SELF_HOSTED_AUTH_PRODUCTION_APPROVED") === "true",
  recoveryVerified: env("SELF_HOSTED_AUTH_RECOVERY_VERIFIED") === "true",
  tenantIsolationVerified: env("SELF_HOSTED_AUTH_TENANT_ISOLATION_VERIFIED") === "true",
  backupRestoreVerified: env("SELF_HOSTED_AUTH_BACKUP_RESTORE_VERIFIED") === "true",
  runtimeDatabaseConfigured: Boolean(env("DATABASE_RUNTIME_URL")),
  signingSecretConfigured: Boolean(env("BETTER_AUTH_SECRET")),
  canonicalBaseUrlConfigured: Boolean(env("BETTER_AUTH_URL")),
});

/**
 * First-party email/password authentication is off unless explicitly enabled.
 * In production, all independent approval, recovery, isolation, database, secret,
 * and canonical-origin gates must pass. No external identity broker is required
 * for this local credential path.
 */
export const emailAndPasswordEnabled =
  passwordAuthEnabled &&
  env("VITE_AUTH_ENABLED") !== "false" &&
  (!productionDeployment || productionGate);
