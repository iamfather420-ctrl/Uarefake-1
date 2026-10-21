# SOLVEX / Uarefake Production Security Evidence — 2026-10-21

## Runtime database identity

- Repository: `iamfather420-ctrl/Uarefake-1`.
- Production code commit: `abf186d3b89e3a0d66d4f41e03619d0c2f0ba6db`; GitHub Actions passed and Vercel deployment `dpl_HQrewjW97Lvegt7jHV2zK7LPB2yu` is READY.
- Production `DATABASE_RUNTIME_URL` was updated to the Neon production branch using login `solvex_runtime_login_v2`; the credential itself is not stored in the repository.
- `src/lib/db.ts` now strips unsupported PostgreSQL startup options and uses `BEGIN` / `SET LOCAL ROLE solvex_app_runtime` / application query / `COMMIT` on one pinned client transaction. This avoids the Neon pooled-endpoint SQLSTATE `08P01` failure.
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
