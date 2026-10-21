# SOLVEX / Uarefake — Legacy Role, Backup and HMAC Work Log

Date: 2026-10-21
Target repository: `iamfather420-ctrl/Uarefake-1`
Working branch: `security/hmac-tenant-context-2026-10-21`

## Legacy privileged-role dependency audit

Reviewed all four Vercel projects visible in the connected account:

- `uarefake`: production runtime is configured to use `solvex_runtime_login_v2`; `DATABASE_URL` is migration-only. `PAYMENTS_ENABLED=false` and `VITE_AUTH_ENABLED=false` remain set for production.
- `proof-before-power`: the only listed production environment variable is an empty sensitive `DATABASE_URL`; no usable database connection value was present in the environment listing.
- `solvex-kernel-frontend`: no environment variables were listed.
- `solvex-registry-api`: no environment variables were listed.

This audit found no active Vercel runtime configured to use the legacy login, but it does not prove there are no consumers outside this Vercel account.

Read-only catalog inspection on Neon production confirmed that `solvex_runtime_login` still has LOGIN, BYPASSRLS, CREATEDB, CREATEROLE, and REPLICATION, and is a member of both `neon_superuser` (grantor `cloud_admin`) and `solvex_app_runtime` (grantor `neondb_owner`). The `neon_superuser` grant is not revocable by the current `neondb_owner` session. An authorized attempt to revoke it failed with permission denied; a separate authorized attempt to set `NOLOGIN` also failed with permission denied. Both operations left the role unchanged. Do not report the legacy role disabled or deprivileged. Completion requires the Neon control-plane owner/support action that can change the `cloud_admin`-owned membership and role attributes, followed by a fresh catalog verification.

## Backup schedule attempt

- Current Neon plan metadata remains `free_v3`; production history retention is 21,600 seconds (six hours).
- The production snapshot schedule is still empty.
- An authorized attempt to configure a daily snapshot with 2,592,000-second (30-day) retention failed because Neon returned: `backup schedule creation is not enabled for this project`.
- The existing manual snapshot `snap-late-heart-b4fthcpn` was preserved and remains set to expire at `2026-11-14T00:00:00Z`. No snapshot was deleted.
- The connected Neon tools expose no plan-upgrade/billing action. The paid-plan change must be completed in Neon Console by an account administrator; after that, re-apply the daily schedule and read it back to verify it is active. Do not claim automated 30-day backups until this succeeds.

## HMAC-SHA-256 implementation on this branch

Added:

- `src/lib/auth/tenant-context-token.ts`: HMAC-SHA-256 issuer using `HMAC(key=SOLVEX_AUTH_SECRET, message=base64(JSON claims))`, with bounded lifetime and claim validation.
- `migrations/0007_hmac_tenant_context.sql`: matching PostgreSQL verifier using `public.hmac(..., ..., 'sha256')`.
- `src/lib/auth/tenant-context-token.test.ts`: issuer/signature-contract tests.
- Package test script inclusion for the new TypeScript test.

The migration is **not deployed** until this branch passes CI and is merged. The issuer utility is not yet wired to the authenticated request lifecycle: the current application code does not establish trusted `user_id`, `tenant_id`, and role claims for the database transaction. That wiring requires a reviewed tenant-membership lookup and request-scoped database context. Therefore production auth remains disabled and no `SOLVEX_AUTH_SECRET` has been inserted. Do not enable auth or merge the verifier migration until the complete issuer-to-request-to-SQL path is tested on an isolated Neon branch, including cross-tenant negative tests.

## Current guardrails

- Production authentication stays disabled.
- Payments and PayPal stay disabled and unchanged.
- Existing snapshot and recovery branch stay preserved.
- No production role privilege change succeeded.
- No production HMAC migration was applied by this work.
