import { createHmac } from "node:crypto";

export type TenantContextRole = "OWNER" | "ADMIN" | "VERIFIER" | "CUSTOMER";

export type TenantContextClaims = {
  user_id: string;
  tenant_id: string;
  email: string;
  role: TenantContextRole;
  issued_at: number;
  expires_at: number;
};

const ALLOWED_ROLES = new Set<TenantContextRole>([
  "OWNER",
  "ADMIN",
  "VERIFIER",
  "CUSTOMER",
]);

/**
 * Issue the exact wire format consumed by solvex_private.current_claims():
 * base64(JSON claims) + "." + lowercase hex HMAC-SHA-256(base64 claims).
 *
 * Call only after the server has authenticated the user and resolved their
 * tenant membership and role from trusted database state. Never pass client-
 * supplied tenant IDs or roles directly into this function.
 */
export function issueTenantContextToken(
  claims: TenantContextClaims,
  secret: string,
): string {
  if (secret.length < 32) {
    throw new Error("Tenant-context signing secret must contain at least 32 characters.");
  }
  if (
    !claims.user_id.trim() ||
    !claims.tenant_id.trim() ||
    !claims.email.trim() ||
    !ALLOWED_ROLES.has(claims.role) ||
    !Number.isFinite(claims.issued_at) ||
    !Number.isFinite(claims.expires_at)
  ) {
    throw new Error("Tenant-context claims are invalid.");
  }
  const now = Date.now();
  if (
    claims.issued_at > now + 30_000 ||
    claims.expires_at <= now ||
    claims.expires_at <= claims.issued_at ||
    claims.expires_at - claims.issued_at > 900_000
  ) {
    throw new Error("Tenant-context token lifetime is invalid.");
  }

  const encodedClaims = Buffer.from(JSON.stringify(claims), "utf8").toString("base64");
  const signature = createHmac("sha256", secret).update(encodedClaims, "utf8").digest("hex");
  const token = encodedClaims + "." + signature;
  if (token.length > 8192) throw new Error("Tenant-context token exceeds the maximum size.");
  return token;
}
