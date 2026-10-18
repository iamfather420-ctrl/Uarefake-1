# Production Readiness Blockers — 2026-10-17

Scope: read-only inspection of the connected `iamfather420-ctrl/Uarefake-1` Vercel project and the Neon `SolveX` production branch. No production database writes, role changes, payment transactions, or secret-value reads were performed.

## Observed status

| Check | Observed result | Meaning |
|---|---|---|
| Public homepage | HTTP 200 | Public UI responds; this is not a production-readiness signal. |
| `/healthz` | HTTP 200 | Process liveness only. |
| `/readyz` | HTTP 503, `{"status":"not_ready"}` | Production must remain blocked. |
| Vercel production auth flag | `VITE_AUTH_ENABLED=false` | Trusted production login is not provisioned; do not enable writes. |
| Neon runtime URL variable | Present as a sensitive production environment variable | Presence alone does not prove the URL authenticates as a least-privilege role. |
| Neon signed tenant context | `solvex_private.auth_context_ready() = false` | The database does not report the required `SOLVEX_AUTH_SECRET` as ready. |
| Neon tenant-table RLS | 31 tenant-bearing public tables plus `schema_migrations` have RLS enabled and forced | RLS flags are present; this alone does not prove application requests set valid signed tenant context. |
| Runtime login role attributes | The inspected `solvex_runtime_login` role has database/role creation privileges and `BYPASSRLS`, and is a member of `neon_superuser` | This is not an acceptable least-privilege login role. Do not use it without resolving the role design. |
| Restore-branch schema comparison | The existing recovery-drill branch differs from current production: it lacks `solvex_private.auth_context_ready()` and its runtime-role schema grant | The prior restore branch is not an exact current-schema rehearsal. Rehearse from a fresh production snapshot and verify schema plus application-level behavior. |
| PayPal environment | Production variable is `PAYPAL_ENVIRONMENT=LIVE`; no `PAYMENTS_ENABLED`, `PAYPAL_LIVE_CLIENT_ID`, `PAYPAL_LIVE_CLIENT_SECRET`, or `PAYPAL_LIVE_WEBHOOK_ID` entry was observed | The active adapter is Sandbox-only and rejects Live. The new release gate requires exact lowercase literals and explicit approval; no Live payment should run. |

## Required before production can be called ready

1. Choose and provision the approved production OIDC identity provider. Do not silently enable the existing placeholder/off configuration.
2. Implement request-scoped signed tenant context end-to-end: resolve the tenant from verified identity and active membership, mint short-lived signed claims, set them on each database transaction/connection, and test that tenant A cannot read or mutate tenant B data.
3. Provision a login-capable runtime role that has no superuser, create-role, create-database, or RLS-bypass capability. Verify it cannot escalate to a privileged role and cannot access rows without valid signed context. Keep migration/auth administration separate.
4. Keep production readiness at HTTP 503 until the above is complete and real authenticated database checks pass.
5. Rehearse backup restore and validate the restored schema/data. The current production branch has a manual snapshot, but the snapshot schedule query returned no scheduled snapshots.
6. For PayPal, implement durable create/capture, verified webhook ingress, reconciliation, refund/dispute handling and separately authorized fulfillment; then pass the documented Sandbox failure-injection matrix. Keep Live payments disabled until explicit release approval.

## Safety decision

Do not change live role attributes or install a database auth secret as an isolated patch. First finish and test the application tenant-context path against a rehearsal branch; otherwise a role hardening change could turn currently working queries into failures, while an incomplete secret/context implementation could leave the application unavailable. No Live PayPal transactions should be used for testing.
