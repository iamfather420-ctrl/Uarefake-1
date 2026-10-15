/**
 * Optional sandbox-preview OAuth client configuration (server-only).
 *
 * Credentials must be supplied through the preview environment. Never commit
 * OAuth client secrets to source control. If preview credentials are absent,
 * federated preview sign-in remains unavailable rather than falling back to a
 * hard-coded shared credential.
 */
export const PREVIEW_CLIENT_ID = process.env.GROK_PREVIEW_CLIENT_ID?.trim() || undefined;
export const PREVIEW_CLIENT_SECRET =
  process.env.GROK_PREVIEW_CLIENT_SECRET?.trim() || undefined;

/** The shared auth broker issuer (OIDC discovery lives under it). */
export const GROK_ISSUER_DEFAULT = "https://auth.grok.me";

/**
 * Host patterns whose callbacks the preview client accepts. Keep the host
 * allowlist narrow; never expand it to arbitrary user-controlled domains.
 */
export const PREVIEW_ALLOWED_HOSTS = ["*.grok-sandbox.com"] as const;
