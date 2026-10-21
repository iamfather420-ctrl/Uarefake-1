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

The requested target is automated daily snapshots retained for 30 days, subject to provider support and cost. The owner has explicitly authorized upgrading to a paid Neon plan if needed. The project still reports the Free plan, and the available Neon integration exposes no subscription-upgrade operation. Neon rejected schedule creation because backup scheduling is not enabled for this project. The documented plan matrix distinguishes snapshot retention from the point-in-time history window: Launch supports a history window up to 7 days, while Scale supports up to 30 days; this project only needs the 30-day scheduled-snapshot target unless a separate 30-day history window is explicitly required. Scheduled snapshots can retain up to 35 days.

On 2026-10-21, the existing manual snapshot expiration was extended from `2026-11-13T00:00:00Z` to `2026-11-14T00:00:00Z`; the snapshot list was re-read and confirmed the new expiration. No plan upgrade or automatic schedule change has been made because the connected Neon API has no billing/plan-upgrade operation. The remaining manual step is to select a paid plan in the Neon Console; after that, set and re-read a daily schedule with 2,592,000-second retention (30 days). Do not claim automated backups are active until the schedule is accepted and verified. The existing snapshot must be preserved; do not delete it without explicit approval. A new snapshot request after the security migration was rejected with `snapshots limit exceeded`; no existing snapshot was deleted. The available snapshot predates the 2026-10-21 RLS/grant hardening, though that migration did not change business rows. Capturing the post-hardening state requires either more snapshot capacity or explicit authorization to replace the old snapshot.

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

## Next action — plan change is authorized but requires the Neon Console

The owner has authorized a paid Neon plan if required. The current blocker is execution capability: the connected Neon interface can inspect project settings and configure schedules, but cannot change the organization's billing plan, and Neon currently rejects schedule creation on this Free project. In the Neon Console, upgrade to a paid plan that enables scheduled snapshots, then configure a daily snapshot with 30-day retention and verify the schedule by re-reading it through Neon. Preserve `snap-late-heart-b4fthcpn`. Keep production login disabled until security, tenant-isolation, and recovery gates pass.
