# PayPal Live Payments Enablement Review

**Repository:** `iamfather420-ctrl/Uarefake-1`
**Reviewed:** 2026-10-17
**Current integration:** Sandbox-only PayPal Orders v2 checkout

> **Implementation update (2026-10-19):** The reviewed blockers were implemented in commit `0ead70e9b4ee52886a9265e6311a1b9d5f3ae232`. The repository now contains a gated Sandbox/Live adapter, durable payment schema, idempotent create/capture flow, webhook verification route, and release tests. Live money movement remains fail-closed until the documented production markers and provider-backed acceptance suite are complete.

## Executive conclusion

The current PayPal integration must not be enabled for Live payments by changing only `PAYPAL_ENVIRONMENT`. The server implementation explicitly rejects every environment other than Sandbox, and the surrounding application lacks the durable payment, webhook, reconciliation, and fulfillment controls required for real-money processing.

The current code has several good foundations: credentials remain server-side, catalog prices are recomputed on the server, the checkout requires authenticated context, the approval URL is constrained to HTTPS, order ownership and USD amount are checked before capture, and the implementation does not grant an entitlement from a browser redirect. Those controls should be retained.

Live enablement should be treated as a new payment rail with a separate release gate, not as a configuration toggle.

## Current blockers

### 1. The PayPal adapter is hard-coded to Sandbox

`src/lib/paypal.server.ts` has `sandboxBaseUrl()` and rejects any value other than `sandbox`. The OAuth endpoint, Orders v2 API, error messages, return payload, and exported functions are all Sandbox-specific.

Required change:

- Replace the hard-coded Sandbox resolver with a strict environment configuration object supporting `sandbox` and `live`.
- Map `sandbox` only to `https://api-m.sandbox.paypal.com` and `live` only to `https://api-m.paypal.com`.
- Reject unknown, empty, or mixed-case values after normalization.
- Prefer separate credential names such as `PAYPAL_SANDBOX_CLIENT_ID`, `PAYPAL_SANDBOX_CLIENT_SECRET`, `PAYPAL_LIVE_CLIENT_ID`, and `PAYPAL_LIVE_CLIENT_SECRET`, or enforce an equally strong environment-to-credential binding. Do not allow Live mode to fall back to Sandbox credentials or vice versa.
- Add a second, explicit production gate such as `PAYMENTS_ENABLED=true`; `PAYPAL_ENVIRONMENT=live` alone must never activate real payments.
- In production, require `PAYMENTS_ENABLED=true`, `PAYPAL_ENVIRONMENT=live`, the Live credentials, a webhook ID, a fixed canonical origin, a real Neon runtime database, and an operator-approved payment release marker. Otherwise fail closed.

### 2. No durable payment intent or order record exists

The current `orders` table is an older generic schema with no authenticated owner, tenant, currency, PayPal order ID, capture ID, provider status, idempotency key, or reconciliation timestamps. The current PayPal flow only creates an order at PayPal and returns its ID to the browser.

Add a migration with a dedicated payment model, rather than overloading browser Zustand state. At minimum, add a table equivalent to:

- `payment_orders`: internal ID, tenant ID, authenticated user ID, cart snapshot, catalog version/hash, amount in minor units, currency, environment, PayPal order ID, PayPal capture ID, status, invoice ID, create/capture timestamps, and provider response metadata with sensitive fields excluded.
- `payment_events`: unique PayPal event ID, event type, resource ID, verified transmission metadata, received/processed timestamps, processing result, and retry/error state.
- `payment_refunds` or a provider-operation table for refund IDs, amount, status, reason, and timestamps.

Add unique constraints on PayPal order ID, capture ID, invoice ID, provider event ID, and any application idempotency key. Add indexes for tenant/user, status, and provider IDs. Store money as integer minor units and enforce USD explicitly if USD is the only supported currency.

Every payment row must be tenant-scoped and tied to the verified server identity. Do not use a client-supplied user ID or cart as the source of truth.

### 3. Order creation is not idempotent

`createSandboxOrder()` generates a random invoice ID and calls PayPal directly. A double-click, retry, Vercel retry, or client reconnect can create multiple provider orders for one intended checkout.

Implement the following sequence:

1. Authenticate the request and resolve the tenant from the server-side identity.
2. Normalize the cart against the current verified catalog and create a canonical cart/amount hash.
3. Accept a server-generated or validated idempotency key and insert a `CREATING` payment row under a unique constraint.
4. If the same idempotency key already has a provider order, return that existing order rather than creating another.
5. Call PayPal with a deterministic internal reference, unique invoice ID, exact amount, currency, and line-item snapshot.
6. Persist the returned PayPal order ID and transition the row to `APPROVAL_PENDING` in a transaction.
7. If persistence fails after PayPal creation, record a recoverable reconciliation task; do not silently retry creation.

Use PayPal's supported request-id/idempotency mechanism for create and capture operations where applicable, and retain the application-level idempotency key as the durable authority.

### 4. Capture is redirect-driven and not durably reconciled

`captureSandboxOrder()` fetches and captures from the return-page server function, then the browser clears the cart. This is acceptable as a Sandbox smoke test but is not sufficient for Live payment proof. A user can close the browser after approval, a return request can be replayed, and a capture can complete while the return request fails.

Change capture to:

- Load the internal payment row by provider order ID and verified tenant/user, not only by a PayPal `custom_id` comparison.
- Lock the internal row or use an atomic state transition so concurrent capture requests cannot both initiate a capture.
- Treat an already-completed capture as a successful idempotent replay only after verifying the capture ID, status, currency, amount, seller account, and associated order metadata.
- Use a provider request ID derived from the internal payment ID for retries.
- Persist the complete sanitized capture result and transition the payment through explicit states such as `APPROVED`, `CAPTURE_REQUESTED`, `CAPTURED`, `CAPTURE_PENDING`, `CAPTURE_FAILED`, or `REVIEW_REQUIRED`.
- Never grant access or clear the client cart solely because the browser received a successful response. The client should refresh the durable server payment status.

### 5. There is no PayPal webhook endpoint

No `/api/paypal/webhook` route exists in the active application. Live processing requires asynchronous provider events for completed captures, refunds, reversals, disputes, and other payment state changes.

Add a public server route, for example:

```text
POST /api/paypal/webhook
```

The route must:

- Read the raw request body before JSON parsing changes it.
- Capture PayPal transmission headers, including transmission ID, transmission time, signature, certificate URL, auth algorithm, and webhook ID.
- Verify the signature with PayPal's webhook verification API using the correct environment and a configured Live webhook ID. Do not accept a locally supplied or browser supplied signature.
- Validate the certificate URL and expected PayPal host before using it.
- Reject missing, malformed, stale, or unverifiable transmissions.
- Insert the provider event under a unique event ID before processing it. A duplicate event must return a safe success response without applying business effects twice.
- Process events transactionally and return a retryable non-2xx response for transient database/provider failures.
- Never log raw request bodies, authorization headers, access tokens, client secrets, or full provider payloads when they may contain personal data.

The webhook must be the durable source for eventual payment state. The browser return flow can accelerate status display, but it cannot replace webhook processing.

### 6. No reconciliation or recovery worker exists

Add a reconciliation path for cases where PayPal succeeds but the application times out, Vercel is interrupted, or the webhook arrives before the capture response is persisted. It should:

- Find payment rows stuck in `CREATING`, `CAPTURE_REQUESTED`, or `UNKNOWN` beyond a bounded timeout.
- Query PayPal by order/capture ID and reconcile only after checking amount, currency, merchant account, environment, and internal association.
- Retry webhook/event processing safely using the unique event ID.
- Surface unresolved payments for operator review instead of granting fulfillment automatically.
- Record audit events for every state transition and manual intervention.

A Vercel-compatible scheduled task or externally triggered reconciliation job is required; do not rely on local filesystem state or an in-memory queue.

### 7. Fulfillment and entitlement remain intentionally disconnected

The current UI explicitly says a successful Sandbox capture is test evidence only, and the app clears the browser cart without creating a durable entitlement. Live payments must not be wired directly to a UI success message.

Implement a separate, tenant-scoped fulfillment state machine. Only a server-side transition from a verified, reconciled, non-refunded `CAPTURED` payment may create a pending entitlement/fulfillment record. The transition must be idempotent and auditable. Disputed, refunded, reversed, partially captured, mismatched, or manually held payments must not create or retain active access.

Keep payment acceptance, entitlement approval, and execution authorization as distinct states, consistent with the current application design.

### 8. Refund, reversal, dispute, and partial-capture handling is absent

Add provider operations and webhook handlers for:

- Full and partial refunds with unique refund IDs and amount checks.
- Capture reversals and pending capture outcomes.
- Chargebacks/disputes and dispute status changes.
- Partial captures and remaining-amount rules, if the product will allow them.
- Negative or delayed outcomes that revoke or suspend fulfillment according to a documented policy.

No refund or reversal should be considered complete based only on a client request. Each operation needs authenticated authorization, an internal idempotency key, provider verification, durable status, and an audit record.

### 9. Configuration and release checks are insufficient

Add a server-only preflight/readiness check that validates configuration without exposing secret values:

- `PAYMENTS_ENABLED` is explicit and false by default.
- Environment is exactly `sandbox` or `live`.
- Environment-specific credentials exist and are non-empty.
- `BETTER_AUTH_URL` is the fixed HTTPS production origin.
- `DATABASE_RUNTIME_URL` is configured and uses the least-privilege Neon runtime role.
- Live webhook ID and webhook configuration are present for Live mode.
- Live mode is refused on preview/development deployments.
- Credential environment matches the selected PayPal API host through a non-destructive OAuth check before release.
- The deployment has passed sandbox end-to-end, webhook replay, mismatch, retry, refund, and reconciliation tests.

The readiness endpoint should report a generic not-ready response externally and log only a sanitized internal reason.

## Files and surfaces that need modification

| Area | Required change |
|---|---|
| `src/lib/paypal.server.ts` | Replace Sandbox-only URL/credentials with strict environment adapter; add timeouts, safe retries, idempotent create/capture, provider verification, durable state transitions, and sanitized errors. |
| `src/lib/paypal.ts` | Rename generic server functions, validate idempotency input, return durable payment status, and prevent client-driven fulfillment. Replace deprecated `inputValidator()` with `validator()` while changing the API. |
| `src/routes/cart.tsx` | Remove Sandbox-only copy, stop treating redirect/capture response as final fulfillment, poll or load durable payment status, handle pending/review/refund states, and only clear the cart after server confirmation. |
| `src/routes/api/paypal/webhook.ts` or equivalent | Add raw-body webhook ingress, signature verification, event dedupe, transactional processing, and safe retry responses. |
| `migrations/0003_payments.sql` | Add tenant/user-scoped payment orders, provider events, captures/refunds, unique constraints, indexes, and audit linkage. |
| `src/lib/db.ts` / payment repository | Add transaction/locking helpers and a repository that keeps all payment writes server-side and parameterized. |
| `src/lib/fulfillment.server.ts` | Add idempotent entitlement/fulfillment transitions gated on reconciled captures. |
| `scripts/` tests | Add provider contract tests, webhook signature/replay tests, amount/currency/user tampering tests, concurrent capture tests, retry/reconciliation tests, and refund/dispute tests. |
| `docs/` and deployment config | Document Live release procedure, webhook registration, secret names, rollback, refund policy, and operator review. |

## Minimum acceptance tests before Live enablement

1. Sandbox create → buyer approval → capture → verified webhook → durable payment row.
2. Repeated create request returns one PayPal order.
3. Repeated capture request produces one capture and one fulfillment transition.
4. Amount, currency, line-item, tenant, and user mismatches fail closed.
5. Browser return is lost but webhook still finalizes the payment.
6. Webhook is replayed and has no duplicate business effect.
7. Invalid signature, stale transmission, wrong webhook ID, and wrong environment are rejected.
8. PayPal timeout after provider success is reconciled without duplicate order/capture creation.
9. Full and partial refund paths update payment and fulfillment state correctly.
10. Dispute/reversal events suspend or hold fulfillment according to policy.
11. Live credentials authenticate against the Live API in a non-transactional preflight; no Live purchase is used as a test.
12. Secrets never appear in client bundles, logs, error responses, evidence files, or Git history.
13. Production deployment refuses to start payment processing when any required gate is missing.
14. Rollback leaves existing payment records and webhook dedupe state intact.

## Recommended rollout

1. Keep `PAYMENTS_ENABLED=false` and the current Sandbox-only behavior.
2. Implement the durable schema, repository, webhook endpoint, and state machine.
3. Run the complete Sandbox end-to-end and failure-injection suite using Sandbox credentials.
4. Register a separate PayPal Live webhook and verify its signature path without moving money.
5. Deploy with Live credentials present but `PAYMENTS_ENABLED=false`; run non-destructive configuration checks.
6. Obtain explicit production release approval, enable Live processing, and monitor webhook, reconciliation, capture, refund, and dispute metrics.
7. Keep fulfillment behind a separate operator-approved gate until the first Live transactions have been reconciled successfully.

## Bottom line

The exact code change is not simply changing `sandboxBaseUrl()` to a conditional Live URL. The required Live implementation is a provider adapter plus a durable payment ledger, verified webhook state machine, idempotent capture/refund operations, reconciliation, and fulfillment controls. Until those pieces exist and pass the acceptance matrix, the safe behavior is to reject `PAYPAL_ENVIRONMENT=live`, which is what the current code does.
