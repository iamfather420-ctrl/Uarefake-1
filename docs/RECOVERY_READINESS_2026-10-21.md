# SOLVEX / Uarefake Recovery Readiness — 2026-10-21

## Current state

**Status: BLOCKED — backup automation and a full restore rehearsal are not verified.** Since the initial audit, the production runtime secret was moved to the least-privilege login and migration `0006_tenant_rls_lockdown.sql` was applied. That migration changed RLS policies, grants, and function ACLs, but did not change business rows or PayPal provider settings. The existing manual snapshot's expiration was extended to meet the owner's approximately 30-day retention target.

- Neon project: `flat-unit-34950816` (`SolveX`), region `aws-us-east-2`.
- Production branch: `br-soft-dawn-b4wkrjox` (`production`).
- Current plan metadata: `free_v3`.
- Project history window: 21,600 seconds (6 hours), not 30 days.
- Production snapshot schedule: empty (`[]`); no automated schedule is configured.
- Known manual snapshot: `snap-late-heart-b4fthcpn`, `solvex-production-rls-hardening-2026-10-14`, created `2026-10-14T21:51:03Z`, expiration `2026-11-14T00:00:00Z`, reported full size 34,119,680 bytes.

## Restore-branch schema comparison

The recovery branch `br-bitter-brook-b4i77sma` (`solvex-recovery-drill-2026-10-14`) was restored from `snap-late-heart-b4fthcpn`. The first comparison found that it lacked four payment tables and `solvex_private.auth_context_ready()`. To test migration replay without touching production data, migrations `0004_recovery_target_id_reconcile.sql`, `0005_payments.sql`, and `0006_tenant_rls_lockdown.sql` were applied to that isolated branch.

After replay, the owner-exception policy count and unsafe-public-table count are both zero on the recovery branch. However, a fresh schema comparison still shows **material payment-table schema drift** between production and the migration-defined recovery schema. Examples include:

- Production `payment_events` has legacy fields such as `provider_event_id`, `environment`, `signature_verified`, and `processing_status`; the replayed schema instead has `paypal_order_id`, `status`, and `updated_at`.
- Production `payment_orders` uses `cart_snapshot` / `catalog_hash` / `amount_minor`; the replayed schema uses `cart_json` / `cart_hash` / `amount_cents`.
- Production `payment_refunds` uses `amount_minor`, while the replayed migration defines `amount_cents`; timestamp and metadata types also differ.

This branch now demonstrates that migration replay and the RLS lockdown can run in isolation, but it does **not** prove payment schema parity, row integrity, application behavior, or a complete restore. Per the owner's instruction, no payment columns or PayPal provider behavior were reconciled or enabled during this pass. Keep payment schema reconciliation blocked until payment work is explicitly authorized.

## 30-day retention and plan constraint

The requested target is 30 days, subject to provider support and cost. Current Neon documentation states that automatic snapshot schedules require a paid plan; the project metadata currently reports the Free plan. Snapshot storage is billed at $0.09/GB-month. Scheduled snapshots can retain up to 35 days, but the production schedule is currently empty.

On 2026-10-21, the existing manual snapshot expiration was extended from `2026-11-13T00:00:00Z` to `2026-11-14T00:00:00Z` to cover at least 30 days from creation; the snapshot list was re-read and confirmed the new expiration. No plan upgrade or automatic schedule change was made. Do not claim 30-day automated backups are active until the owner authorizes a plan/cost decision and the schedule is applied and re-read successfully.

## Required recovery acceptance test

Run against an isolated restore target, never by changing production in place:

1. Restore a current production snapshot into a separate branch.
2. Compare public and private schemas, migrations, functions, indexes, constraints, RLS enablement/force flags, policies, grants, and required roles.
3. Validate row counts and integrity checks for application-critical tables without exporting sensitive row contents.
4. Run application startup/build and smoke tests against the restored branch.
5. Run two-tenant negative tests for SELECT/INSERT/UPDATE/DELETE, including missing, invalid, expired, and tampered signed tenant context.
6. Confirm payment tables remain inaccessible to ordinary runtime access and keep PayPal/payment processing disabled.
7. Save the branch/snapshot IDs, source timestamp, schema diff, test output, and final pass/fail disposition.
8. Delete temporary recovery resources only after preserving evidence and confirming they are not needed; do not delete the current recovery branch without explicit authorization.

## Next owner decision

Choose whether to authorize a paid Neon plan for automated daily snapshots with 30-day retention, or remain on Free and accept that automatic schedules are unavailable under the currently documented plan terms. Keep production login disabled until security, tenant-isolation, and recovery gates pass.
