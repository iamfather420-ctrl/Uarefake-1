import { createHmac } from "node:crypto";

export const SOLVEX_TENANT_ROLES = [
  "OWNER",
  "ADMIN",
  "VERIFIER",
  "CUSTOMER",
] as const;

export type SolvexTenantRole = (typeof SOLVEX_TENANT_ROLES)[number];

export type TenantContextInput = {
  user_id: string;
  tenant_id: string;
  email: string;
  role: SolvexTenantRole;
};

export type SignedTenantClaims = TenantContextInput & {
  issued_at: number;
  expires_at: number;
};

const DEFAULT_TTL_MS = 5 * 60 * 1000;
const MAX_TTL_MS = 15 * 60 * 1000;
const MAX_CLOCK_SKEW_MS = 30 * 1000;
const MIN_SECRET_LENGTH = 32;

/**
 * Create the exact signed-context wire format consumed by
 * solvex_private.current_claims(): base64(JSON claims) + "." + HMAC-SHA-256 hex.
 *
 * This module is server-only. The secret must match the SOLVEX_AUTH_SECRET row
 * provisioned in Neon; callers must never send the secret or signed token to
 * browser code or logs. It deliberately does not resolve a user's tenant or
 * role: those claims must come from an independently authorized server-side
 * membership lookup before this function is called.
 */
export function signTenantContext(
  input: TenantContextInput,
  secret: string | undefined = process.env.SOLVEX_AUTH_SECRET,
  now = Date.now(),
): string {
  const signingSecret = secret?.trim();
  if (!signingSecret || signingSecret.length < MIN_SECRET_LENGTH) {
    throw new Error("SOLVEX_AUTH_SECRET must contain at least 32 characters");
  }

  const userId = input.user_id.trim();
  const tenantId = input.tenant_id.trim();
  const email = input.email.trim();
  if (!userId || !tenantId || !email) {
    throw new Error("user_id, tenant_id, and email are required");
  }
  if (!SOLVEX_TENANT_ROLES.includes(input.role)) {
    throw new Error("Unsupported tenant role");
  }
  if (!Number.isSafeInteger(now) || now < 0) {
    throw new Error("now must be a non-negative safe integer");
  }

  const claims: SignedTenantClaims = {
    user_id: userId,
    tenant_id: tenantId,
    email,
    role: input.role,
    issued_at: now,
    expires_at: now + DEFAULT_TTL_MS,
  };
  if (
    claims.issued_at > now + MAX_CLOCK_SKEW_MS ||
    claims.expires_at <= claims.issued_at ||
    claims.expires_at - claims.issued_at > MAX_TTL_MS
  ) {
    throw new Error("Invalid tenant-context token lifetime");
  }

  const encodedClaims = Buffer.from(JSON.stringify(claims), "utf8").toString(
    "base64",
  );
  const signature = createHmac("sha256", signingSecret)
    .update(encodedClaims, "utf8")
    .digest("hex");
  return `${encodedClaims}.${signature}`;
}
