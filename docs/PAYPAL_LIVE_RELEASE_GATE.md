# PayPal payment ledger and Live release gate

Status: **Live-capable adapter implemented; Live processing remains fail-closed until the explicit release gate is satisfied**.

This release adds the durable payment schema, a multi-environment provider adapter, idempotent create/capture handling, raw-body webhook verification, event deduplication, and a fail-closed production preflight. It does not enable Live payments automatically.

## Added schema

- `payment_orders`: tenant/user ownership, catalog snapshot/hash, integer minor-unit USD amount, environment, provider order/capture IDs, idempotency key, lifecycle state and reconciliation timestamps.
- `payment_events`: unique provider event ID and retry/processing state for webhook deduplication.
- `payment_refunds`: durable, idempotent refund operations.
- `payment_fulfillments`: separate fulfillment state and human approval fields.

Payment rows are tenant/user scoped and fulfillment remains a separate human-approval state. Runtime queries must always use the authenticated server identity; no browser redirect grants fulfillment.

## Live gate

`src/lib/paypal-live-gate.server.ts` requires explicit `PAYMENTS_ENABLED=true`, environment-specific credentials, a Live webhook ID, canonical HTTPS origin, `DATABASE_RUNTIME_URL`, tenant identity, operator approval markers, production deployment, and an explicit acceptance-suite verification marker. Configuration presence alone is insufficient. The gate is wired into the Live adapter.

## Remaining blockers before Live

1. Apply migration `0005_payments.sql` to the connected Neon database and verify the least-privilege runtime role.
2. Register the PayPal Live webhook and run provider-backed Sandbox checkout, webhook replay, mismatch, timeout, refund, dispute, and lost-return tests.
3. Complete reconciliation and bounded retry operations for uncertain provider outcomes before the first Live transaction.
4. Verify production auth, tenant isolation, backup/restore, and health/readiness gates.
5. Obtain explicit operator approval before setting the Live release markers.

No PayPal Live credentials or payment transaction were used for this change.
