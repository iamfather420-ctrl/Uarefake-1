# SOLVEX / Uarefake Production Security Evidence — 2026-10-21

## Runtime database identity

- Repository: `iamfather420-ctrl/Uarefake-1`.
- Security migration commit: `abf186d3b89e3a0d66d4f41e03619d0c2f0ba6db`; GitHub Actions passed and Vercel deployment `dpl_HQrewjW97Lvegt7jHV2zK7LPB2yu` is READY. Follow-up commit `530b5ff639837b57c46471cadf6818dc9888c596` also passed GitHub Actions and deployed READY as `dpl_HgkSDQjza8d1HdPgAYiUD18ZCQZQ`.
- Production `DATABASE_RUNTIME_URL` was updated to the Neon production branch using login `solvex_runtime_login_v2`; the credential itself is not stored in the repository.
- `src/lib/db.ts` now strips unsupported PostgreSQL startup options and uses `BEGIN` / `SET LOCAL ROLE solvex_app_runtime` / application query / `COMMIT` on one pinned client transaction. This avoids the Neon pooled-endpoint SQLSTATE `08P01` failure. The production build now invokes `scripts/migrate.mjs` before Vite; the migration runner sanitizes the privileged migration URL and the latest deployment completed READY.
- The production readiness log no longer reports runtime-role elevation, legacy-login identity, migration-metadata access, or incomplete RLS. The old `solvex_runtime_login` role still exists separately and remains privileged; see “Remaining blocker” below. The HMAC-SHA-256 issuer/verifier change was merged as commit `4f5f707b780639a742cde1010a0eac4314b0df3a`, its GitHub Actions production-build/typecheck/tests/lint run passed, and Vercel production deployment `dpl_APNftkbJFZLv4HTNJb9Ng5CdeEKb` is READY. Production SQL confirms migration `0007_hmac_signed_tenant_context.sql` is applied, `current_claims()` calls `public.hmac`, and the legacy digest construction is absent.

## Production RLS and payment-table lockdown

Migration `0006_tenant_rls_lockdown.sql` was applied to the production Neon branch and recorded in `_migrations`.

Verified after application:

- Owner-exception policies: **0 tables / 0 policies**.
- Unsafe public application tables under the readiness rule: **0**.
- All five payment tables (`payments`, `payment_events`, `payment_orders`, `payment_refunds`, `payment_fulfillments`) have RLS enabled and forced.
- `solvex_app_runtime` has no direct SELECT, INSERT, UPDATE, or DELETE privileges on any of those five payment tables.
- The four provider-ledger tables have explicit default-deny RLS policies.
- PUBLIC execution was revoked from `solvex_private.current_claims()` and `solvex_private.auth_context_ready()`; execution and schema usage are granted to `solvex_app_runtime`, while direct access to `solvex_private.auth_secrets` is revoked from the application roles.
- No PayPal credentials, provider settings, or payment-processing flags were changed; payment processing remains disabled.

## Runtime negative tests

Read-only transaction tests used login `solvex_runtime_login_v2` with `SET LOCAL ROLE solvex_app_runtime` on the production branch:

- Missing, malformed, tampered-signature, and oversized tokens were all rejected by `solvex_private.current_claims()`.
- With those contexts, visible row counts for orders, tenants, users, and access requests were zero.
- A direct SELECT against `payments` under the application role failed with a permission-denied error, as intended.
- A valid signed tenant context was **not** tested because no `SOLVEX_AUTH_SECRET` row is configured and production authentication is intentionally disabled.

## Live readiness

- `/healthz`: HTTP 200.
- `/readyz`: HTTP 503 with blockers `trusted_auth_not_configured` and `signed_tenant_context_not_ready`.
- These blockers are intentional under the owner's decision to permit authentication testing only outside production. No production auth secret was inserted and production sign-in was not enabled.

## Remaining blocker: legacy privileged role

The old `solvex_runtime_login` role remains `LOGIN`, `BYPASSRLS`, `CREATEDB`, `CREATEROLE`, and `REPLICATION`, and it is a member of `neon_superuser`. The membership was granted by `cloud_admin` with `admin_option=false`; the normal `neondb_owner` SQL session cannot revoke that membership directly. The Uarefake-1 runtime URL no longer uses this role, but its existence remains a separate privilege risk. Do not claim it has been disabled or removed. Resolving it requires a Neon control-plane/admin action or an explicit decision to disable/delete the legacy role after checking other dependents.

## Remaining recovery decision

The current Neon plan metadata is `free_v3`, history retention is six hours, and the automatic snapshot schedule is empty. The existing manual snapshot expires `2026-11-14T00:00:00Z`. A 30-day automatic schedule is not active; paid-plan approval is still required. See `RECOVERY_READINESS_2026-10-21.md` for the restore-branch schema drift and recovery acceptance checklist.


## Signed tenant-context token algorithm — coordinated migration

- Existing SQL verification used a custom `SHA-256(claims || ':' || secret)` construction, which is not HMAC and should not be used as a MAC.
- The proposed `0007_hmac_signed_tenant_context.sql` migration changes the verifier to HMAC-SHA-256 over the exact base64-encoded claims segment. The paired server-only issuer uses Node's `createHmac('sha256', secret)` and emits the same `base64-claims.hex-signature` format.
- Issuer tests cover matching signatures, tampering, missing/short secrets, and allowed claim roles/expiry bounds. A migration invariant test ensures the SQL verifier uses `public.hmac` and no longer uses the legacy digest construction.
- This is a coordinated code change only. It does **not** add `SOLVEX_AUTH_SECRET` to production, insert a secret row, issue live tenant tokens, or enable production authentication. The issuer is a server-only primitive and is not wired to an unverified user-to-tenant mapping. Valid-token tenant isolation remains a release gate.


## Dependent-project audit for the legacy role — 2026-10-21

- The Vercel project inventory contained `uarefake`, `proof-before-power`, `solvex-kernel-frontend`, and `solvex-registry-api`.
- `uarefake` uses `solvex_runtime_login_v2` for runtime traffic and a separate migration-only `neondb_owner` connection. Its payment-processing flag remains false and production auth remains false.
- `proof-before-power` has a production `DATABASE_URL` environment entry, but its decrypted value is empty/unconfigured. `solvex-kernel-frontend` and `solvex-registry-api` have no database/Postgres/Neon environment variables in the inspected project configuration.
- A read-only production catalog audit found zero `pg_shdepend` object dependencies for `solvex_runtime_login`; its memberships are `neon_superuser` (grantor `cloud_admin`, no admin option) and `solvex_app_runtime` (grantor `neondb_owner`, no admin option).
- An authorized attempt to run `ALTER ROLE solvex_runtime_login NOLOGIN` was rejected by Neon with `permission denied to alter role`. The connected SQL role cannot remove the `cloud_admin`-granted privileged membership either. No role or membership was changed. The remaining action requires a Neon control-plane/admin capability or Neon support; do not claim the role is disabled until its LOGIN attribute and membership are independently re-queried and confirmed.
- This audit covers the Vercel projects and Neon catalog dependencies visible to the connected integrations; it cannot prove that no external/non-Vercel client has stored the old credential.

## Backup plan authorization status

The owner has now authorized a paid Neon plan if needed for daily snapshots with 30-day retention. The current Neon organization still reports Free; schedule creation is rejected as not enabled, and the connected integration has no billing-plan upgrade operation. The owner must make the plan change in the Neon Console, after which the daily schedule must be configured and verified. The existing snapshot remains preserved.
