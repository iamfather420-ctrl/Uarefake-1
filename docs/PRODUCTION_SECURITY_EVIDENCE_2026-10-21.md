# SOLVEX / Uarefake Production Security Evidence — 2026-10-21

## Runtime database identity

- Repository: `iamfather420-ctrl/Uarefake-1`.
- Security migration commit: `abf186d3b89e3a0d66d4f41e03619d0c2f0ba6db`; GitHub Actions passed and Vercel deployment `dpl_HQrewjW97Lvegt7jHV2zK7LPB2yu` is READY. Follow-up commit `530b5ff639837b57c46471cadf6818dc9888c596` also passed GitHub Actions and deployed READY as `dpl_HgkSDQjza8d1HdPgAYiUD18ZCQZQ`.
- Production `DATABASE_RUNTIME_URL` was updated to the Neon production branch using login `solvex_runtime_login_v2`; the credential itself is not stored in the repository.
- `src/lib/db.ts` now strips unsupported PostgreSQL startup options and uses `BEGIN` / `SET LOCAL ROLE solvex_app_runtime` / application query / `COMMIT` on one pinned client transaction. This avoids the Neon pooled-endpoint SQLSTATE `08P01` failure. The production build now invokes `scripts/migrate.mjs` before Vite; the migration runner sanitizes the privileged migration URL and the latest deployment completed READY.
- The production readiness log no longer reports runtime-role elevation, legacy-login identity, migration-metadata access, or incomplete RLS. The old `solvex_runtime_login` role still exists separately and remains privileged; see “Remaining blocker” below.

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
