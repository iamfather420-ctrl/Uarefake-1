# SOLVEX / Uarefake Recovery Readiness — 2026-10-21

## Current state

**Status: BLOCKED — backup automation and a full restore rehearsal are not verified.** The catalog/schema checks were read-only. No production schema, data, credentials, database roles, automatic backup schedule, or payment settings were changed. The existing manual snapshot's expiration was extended to meet the owner's approximately 30-day retention target.

- Neon project: `flat-unit-34950816` (`SolveX`), region `aws-us-east-2`.
- Production branch: `br-soft-dawn-b4wkrjox` (`production`).
- Current plan metadata: `free_v3`.
- Project history window: 21,600 seconds (6 hours), not 30 days.
- Production snapshot schedule: empty (`[]`); no automated schedule is configured.
- Known manual snapshot: `snap-late-heart-b4fthcpn`, `solvex-production-rls-hardening-2026-10-14`, created `2026-10-14T21:51:03Z`, expiration `2026-11-14T00:00:00Z`, reported full size 34,119,680 bytes.

## Restore-branch schema comparison

The existing recovery branch `br-bitter-brook-b4i77sma` (`solvex-recovery-drill-2026-10-14`) reports that it was restored from `snap-late-heart-b4fthcpn`. A read-only schema comparison against current production found that the restored branch does **not** match current production schema:

- The production schema contains `payment_events`, `payment_fulfillments`, `payment_orders`, and `payment_refunds`; those four tables are absent from the recovery branch.
- The production schema contains `solvex_private.auth_context_ready()`; that function is absent from the recovery branch.
- The public table-name lists otherwise matched in the catalog result; this is not proof that row contents, indexes, grants, constraints, application behavior, or tenant isolation match.

This means the existing branch proves that a historical snapshot can be restored into a branch, but it does **not** prove a full restore of the current production schema or application. This is a schema observation only; it does not authorize enabling or using payment processing.

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
