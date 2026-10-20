# Production End-to-End Evidence Register — 2026-10-20

## Scope and status

Target repository: `iamfather420-ctrl/Uarefake-1`

Readiness hardening candidate:
- PR: https://github.com/iamfather420-ctrl/Uarefake-1/pull/33
- Candidate commit at inspection: `ddbcfc3569b7d50cadf7c5ae8c45d9b6a911145e`
- Candidate CI run: `39371903388` (run 236), completed successfully.
- Production deployment observed: `dpl_5wMuLFf8h4EJwnf5ssUJTPMYSwdM`, READY, commit `fdbb5519b18af3660221e418af4aced5195f839b`.
- Preview deployment observed: `dpl_HsoBB6MDMi1g1fLYPCda3JEpRvUo`, READY, candidate commit `ddbcfc3569b7d50cadf7c5ae8c45d9b6a911145e`.

**Conclusion: NOT PRODUCTION READY.** Deployment state READY and CI success are not evidence of authenticated end-to-end tenant isolation. No production credentials, roles, schema, snapshot schedule, or payment settings were changed during this evidence collection. PayPal remains disabled.

## Direct read-only production database observations

The following queries were executed through the Neon integration against project `flat-unit-34950816`, production branch `br-soft-dawn-b4wkrjox`. No secret values were queried.

### Runtime identity and readiness probe

Observed row:
- `current_role = neondb_owner`
- `login_role = neondb_owner`
- `current_role_elevated = true`
- `login_role_elevated = true`
- `inherits_neon_superuser = true`
- `unsafe_public_table_count = 4`
- `auth_context_ready = false`

The app's readiness candidate expects the effective role to be `solvex_app_runtime`, a non-elevated role. The observed production connection does not satisfy this requirement.

### Incomplete tenant RLS

The live catalog query identified these four public tables:
- `payment_events`: RLS enabled, not forced, no policy found.
- `payment_fulfillments`: RLS enabled, not forced, no policy found.
- `payment_orders`: RLS enabled, not forced, no policy found.
- `payment_refunds`: RLS enabled, not forced, no policy found.

These payment tables remain excluded from payment functionality, but their database security gaps must be explicitly handled before a production security claim. Do not enable payments as part of this work.

### Signed tenant context

The live function definition for `solvex_private.auth_context_ready()` checks for a `solvex_private.auth_secrets` row named `SOLVEX_AUTH_SECRET` with a value length of at least 32 characters. The function returned `false`. The earlier read-only PR audit recorded that `solvex_private.auth_secrets` contained no rows. Secret values were not retrieved.

### Database roles

A fresh role catalog query observed:
- `neondb_owner`: login allowed; CREATEDB, CREATEROLE, REPLICATION, and BYPASSRLS flags present; inherits `neon_superuser`.
- `solvex_runtime_login`: login allowed; CREATEDB, CREATEROLE, REPLICATION, and BYPASSRLS flags present; inherits `neon_superuser`.
- `solvex_app_runtime`: NOLOGIN and non-elevated flags; this alone does not establish that the deployed app connects using it.

### Recovery

Neon snapshot schedule query returned an empty schedule (`[]`). Snapshot listing showed one manual snapshot:
- ID: `snap-late-heart-b4fthcpn`
- Name: `solvex-production-rls-hardening-2026-10-14`
- Created: `2026-10-14T21:51:03Z`
- Expiry: `2026-11-13T00:00:00Z`
- Size: `34,119,680` bytes

No automated schedule was configured and no restore rehearsal was performed during this evidence collection.

## Code and CI evidence

At the inspected candidate commit:
- `src/routes/readyz.ts` fails closed with HTTP 503 if production auth is not configured, the runtime role is incorrect/elevated, the login is elevated or inherits `neon_superuser`, application-table RLS is incomplete, migration metadata is exposed, or signed tenant context is unavailable.
- `src/lib/db.ts` requires `DATABASE_RUNTIME_URL` for production application queries and requests `options: "-c role=solvex_app_runtime"` on that connection.
- `src/lib/auth/server.ts` requires explicit production OAuth client credentials, issuer, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL` for `authConfigured`; preview OAuth credentials are not used as a production fallback.
- `scripts/production-readiness-guards.test.mjs` checks these properties by matching source text. This is a static invariant test, not a real authentication/database integration test.
- CI run `39371903388` completed successfully; the validate job's production build, TypeScript, tests (including fulfillment concurrency), and lint steps passed.

References:
- PR: https://github.com/iamfather420-ctrl/Uarefake-1/pull/33
- Readiness route at candidate commit: https://github.com/iamfather420-ctrl/Uarefake-1/blob/ddbcfc3569b7d50cadf7c5ae8c45d9b6a911145e/src/routes/readyz.ts
- DB client at candidate commit: https://github.com/iamfather420-ctrl/Uarefake-1/blob/ddbcfc3569b7d50cadf7c5ae8c45d9b6a911145e/src/lib/db.ts
- Static readiness test at candidate commit: https://github.com/iamfather420-ctrl/Uarefake-1/blob/ddbcfc3569b7d50cadf7c5ae8c45d9b6a911145e/scripts/production-readiness-guards.test.mjs

## End-to-end evidence still required

These are **not yet proven**; do not mark them passed until logs/artifacts exist:

1. Production trusted identity provider completes a real login and verified session.
2. The deployed runtime connection shows `current_user = solvex_app_runtime` and a non-elevated login role, without `neon_superuser` membership.
3. A verified user/tenant request sets transaction-local `app.auth_token` on the same transaction/connection used for tenant-scoped SQL.
4. Two-tenant integration tests prove tenant A cannot read, update, or delete tenant B's records and cannot cross-tenant write through alternate application paths. Invalid, missing, expired, and tampered tenant context must fail closed.
5. Negative tests prove unauthenticated or untrusted requests cannot invoke protected operations; tests run against an isolated test branch/schema with synthetic fixtures.
6. The deployed `/healthz` and `/readyz` responses are captured with timestamps and deployment commit provenance. The prior report said health returned 200 and readiness 503; a fresh protected HTTP recheck was not completed in this evidence pass.
7. A recovery point is available, a restore rehearsal succeeds in an isolated target, and restored schema/data integrity checks are recorded.
8. Production environment variable names/configuration and trusted IdP setup are verified without disclosing secret values.

## Acceptance rule

Do not merge this PR or claim production-ready until the runtime-role, trusted-auth, signed-tenant-context, RLS, recovery, and live deployment checks above have evidence. A green CI run or Vercel READY status alone does not satisfy these criteria. Keep payment functionality disabled.
