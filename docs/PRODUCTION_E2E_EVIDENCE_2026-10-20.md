# Production End-to-End Evidence Register — 2026-10-20

## Scope and status

Target repository: `iamfather420-ctrl/Uarefake-1`

Readiness hardening candidate:
- PR: https://github.com/iamfather420-ctrl/Uarefake-1/pull/33
- Candidate branch: `fix/readyz-enforce-neon-rls-20261020`
- Latest candidate commit before this evidence update: `2f8baa7cdc1314e8d84ddbf4ba3e85db94bd8349`
- Latest candidate CI run reported by the previous check: `39376832663`, passed production build, TypeScript, tests, and lint.
- Production deployment last identified: `dpl_5wMuLFf8h4EJwnf5ssUJTPMYSwdM`, URL `uarefake-1k8cgw710-solvexb-2-b.vercel.app`, source commit `fdbb5519b18af3660221e418af4aced5195f839b`.

**Conclusion: BLOCKED — NOT PRODUCTION READY.** CI and Vercel candidate success do not prove production identity, database isolation, or recovery. No production data, roles, credentials, environment variables, backup settings, domain redirects, login, or payment configuration were changed. PayPal remains disabled.

## Fresh direct read-only production observations (2026-10-20)

All queries below ran against Neon project `flat-unit-34950816`, production branch `br-soft-dawn-b4wkrjox`. No secret values were selected.

### Runtime login role is confirmed unsafe

Connected through Neon using the configured role `solvex_runtime_login`. Query returned:
- `current_user = solvex_runtime_login`
- `session_user = solvex_runtime_login`
- `inherits_neon_superuser = true`
- `login_elevated = true` (at least one of SUPERUSER, CREATEDB, CREATEROLE, REPLICATION, or BYPASSRLS is present)

This is a hard security failure, not merely missing evidence. Do not use this role for the deployed runtime until it is replaced or corrected and its effective privileges are re-verified. No role or password was modified.

### Payment tables permit direct CRUD for the unsafe login role

For each of `payment_events`, `payment_fulfillments`, `payment_orders`, and `payment_refunds`, the same role check returned:
- RLS enabled: true
- FORCE ROW LEVEL SECURITY: false
- policy exists: false
- direct SELECT/INSERT/UPDATE/DELETE table privileges: true for all four operations

This violates the recorded decision that application roles must not directly access payment tables and that service operations must be explicitly authorized. Payment functionality remains disabled. Do not enable payments. Corrective migration must be reviewed and tested on an isolated branch before any production application.

### Public-table RLS aggregate

Fresh catalog aggregate returned:
- public base/partitioned tables: 37
- RLS disabled: 1
- RLS not forced: 5
- tables without a policy (excluding `_migrations`): 4

This broader live aggregate supersedes the earlier count of four unsafe payment tables as a complete RLS inventory. The four named payment tables are confirmed unsafe; the identity of every additional table contributing to the aggregate must be enumerated and reconciled before promotion. Readiness should remain 503.

### Signed tenant context

`solvex_private.auth_context_ready()` returned `false`. The secret value was not read. This gate is not satisfied.

### Backup schedule and recovery

Automatic snapshot schedule returned an empty array (`[]`). Snapshot listing contains only the known manual snapshot:
- ID: `snap-late-heart-b4fthcpn`
- Name: `solvex-production-rls-hardening-2026-10-14`
- Created: `2026-10-14T21:51:03Z`
- Expires: `2026-11-13T00:00:00Z`
- Size: `34,119,680` bytes

No automated schedule is configured. The historical branch `br-bitter-brook-b4i77i2t` (recorded elsewhere as `br-bitter-brook-b4i77i2t`; recovery drill branch) reports restore metadata, but no application-level integrity rehearsal is proven. No production schedule was changed because its retention semantics and cost have not been confirmed.

## Candidate code/CI status

The candidate route `src/routes/readyz.ts` checks that the current role is `solvex_app_runtime`, login is not elevated or a member of `neon_superuser`, public application tables have RLS enabled/forced and policies, migration metadata is not exposed, and signed tenant context is ready. It returns 503 on blockers. The production auth server fails closed when `DATABASE_RUNTIME_URL` is missing rather than silently using migration credentials or PGLite.

The current static readiness tests inspect source patterns; they are not end-to-end behavioral proofs. Candidate CI success is useful but does not clear live database failures.

## Gate register

| Gate | Status | Evidence / next action |
|---|---|---|
| Candidate build, TypeScript, tests, lint | PASS (candidate only) | Latest candidate CI passed; not production readiness. |
| Production least-privilege login | BLOCKED / FAIL | `solvex_runtime_login` inherits `neon_superuser` and is elevated. Replace/correct only through reviewed isolated migration and authorized credential provisioning. |
| Application role effective identity | BLOCKED | Need deployed connection evidence that `current_user=solvex_app_runtime` under the intended runtime connection. |
| Tenant RLS completeness | FAIL | 37 public tables; 1 RLS-disabled, 5 not forced, 4 without policy. Enumerate every offender and test fixes on isolated branch. |
| Payment table deny-by-default | FAIL | Four payment tables grant direct CRUD to unsafe login role; no policy and not FORCE RLS. Keep payments disabled. |
| Signed tenant context | FAIL | `auth_context_ready() = false`; provision secret only via approved secure process, never by querying its value. |
| Trusted production login/session | NOT VERIFIED | Verify provider credentials, issuer, callback, trusted origins, and real login/session only after database gates pass. Keep login disabled. |
| Two-tenant end-to-end isolation | NOT VERIFIED | Execute SELECT/INSERT/UPDATE/DELETE negative tests with synthetic tenants and missing/invalid/expired/tampered token cases on isolated test branch. |
| Backup schedule / 30-day retention | FAIL / UNVERIFIED | Schedule empty; verify Neon retention semantics and costs before changing production. |
| Restore integrity and app behavior | NOT VERIFIED | Perform isolated full restore; validate schema, row counts/checksums, migrations, app startup, and tenant isolation. |
| Live `/healthz` and `/readyz` | NOT VERIFIED | Available HTTP inspection path could not retrieve endpoints; capture via a permitted authenticated/ordinary HTTP client and record commit provenance. |
| PayPal/payment processing | INTENTIONALLY DISABLED | Keep disabled; no payment enablement or checkout changes. |
| Production promotion | BLOCKED | Do not merge/promote until every required security, tenant isolation, recovery, and readiness gate passes. |

## Remaining proof requirements

1. Enumerate all seven RLS aggregate exceptions (and verify the exact set) with a permitted read-only catalog query; reconcile the result with readiness checks.
2. Build and run a least-privilege runtime role and payment privilege remediation on an isolated Neon branch. Verify effective memberships/grants and direct table access denial.
3. Implement and execute behavioral integration tests proving tenant context is transaction-local and bound to the same connection/transaction as tenant SQL; exercise two-tenant CRUD denials and invalid context.
4. Establish the signed tenant-context secret through a secure provisioning path without printing it, then verify readiness sees only a boolean true/false.
5. Verify OAuth callback and trusted-origin settings before any redirect or login change.
6. Confirm supported automated backup schedule and 30-day retention/cost, then obtain approval before changing production.
7. Restore a snapshot into an isolated target and record schema/data/application/tenant-isolation results.
8. Capture production `/healthz` and `/readyz` from the actual deployed commit. Liveness HTTP 200 alone is not readiness.
9. Keep PR #33 unmerged and login/payments disabled until the full gate register is green.

**Disposition remains BLOCKED.** No production changes were made during this follow-up.
