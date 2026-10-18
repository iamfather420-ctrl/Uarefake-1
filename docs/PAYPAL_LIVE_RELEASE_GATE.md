# PayPal payment ledger and Live release gate

Status: **foundation added; Live payments remain BLOCKED**.

This release adds a durable payment schema and a fail-closed preflight helper. It does **not** implement the complete Live payment rail and does not enable payments. The current `src/lib/paypal.server.ts` adapter remains Sandbox-only.

## Added schema

- `payment_orders`: tenant/user ownership, catalog snapshot/hash, integer minor-unit USD amount, environment, provider order/capture IDs, idempotency key, lifecycle state and reconciliation timestamps.
- `payment_events`: unique provider event ID and retry/processing state for webhook deduplication.
- `payment_refunds`: durable, idempotent refund operations.
- `payment_fulfillments`: separate fulfillment state and human approval fields.

RLS is enabled with no permissive policies, so these tables fail closed until request-scoped tenant/user context and reviewed policies are implemented. Do not use an owner/BYPASSRLS role for runtime payment queries.

## Live gate

`src/lib/paypal-live-gate.server.ts` requires explicit `PAYMENTS_ENABLED=true`, environment-specific credentials, a Live webhook ID, canonical HTTPS origin, `DATABASE_RUNTIME_URL`, an operator approval marker, production deployment, and an explicit acceptance-suite verification marker. Configuration presence alone is insufficient. The gate is not yet wired to an enabled Live flow.

## Remaining blockers before Live

1. Implement tenant/user transaction context and RLS policies; test isolation against real Neon roles.
2. Implement durable create/capture repository operations with database locking and PayPal request IDs.
3. Implement raw-body webhook verification using PayPal's Live webhook verification API, event deduplication and transactional processing.
4. Implement reconciliation and bounded retries for uncertain provider outcomes.
5. Implement verified refund, reversal, dispute, and partial-capture state transitions.
6. Implement idempotent fulfillment behind separate human approval; never fulfill from browser redirects.
7. Add provider-backed Sandbox end-to-end and failure-injection tests, including replay, timeout, mismatch, refund, dispute and lost-return cases.
8. Run production auth, Neon least-privilege, tenant-isolation, backup/restore and health/readiness gates.
9. Obtain explicit operator release approval before setting any Live switch.

No PayPal Live credentials or payment transaction were used for this change.
