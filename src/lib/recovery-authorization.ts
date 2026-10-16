export type RecoveryAuthorizationConfig = {
  production: boolean;
  operatorUserIds?: string;
  recoveryTenantId?: string;
};

export type RecoveryAuthorization =
  | { allowed: true; tenantId?: string }
  | { allowed: false; reason: string };

/**
 * Production recovery drills require an explicit per-user operator allowlist
 * and a pre-existing tenant selected by deployment configuration. Preview
 * environments can continue exercising synthetic recovery against demo data.
 */
export function authorizeRecoveryDrill(
  userId: string,
  config: RecoveryAuthorizationConfig,
): RecoveryAuthorization {
  if (!userId.trim()) {
    return { allowed: false, reason: "Recovery drill blocked: verified user identity is missing." };
  }
  if (!config.production) {
    return { allowed: true, tenantId: config.recoveryTenantId?.trim() || undefined };
  }
  const allowedUsers = new Set(
    (config.operatorUserIds ?? "").split(",").map((value) => value.trim()).filter(Boolean),
  );
  if (!allowedUsers.has(userId)) {
    return {
      allowed: false,
      reason: "Recovery drill blocked: user is not in the configured production operator allowlist.",
    };
  }
  const tenantId = config.recoveryTenantId?.trim();
  if (!tenantId) {
    return {
      allowed: false,
      reason: "Recovery drill blocked: SOLVEX_RECOVERY_TENANT_ID is not configured.",
    };
  }
  return { allowed: true, tenantId };
}
