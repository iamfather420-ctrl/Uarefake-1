# PayPal checkout and Live-payment release gates

The application supports PayPal Orders v2 in Sandbox and Live modes through a server-only adapter. Live money movement is **disabled by default** and requires every release gate below.

## Environment variables

For Sandbox testing, configure Production or Preview as appropriate:

- `PAYPAL_ENVIRONMENT=sandbox`
- `PAYPAL_SANDBOX_CLIENT_ID` and `PAYPAL_SANDBOX_CLIENT_SECRET` (legacy `PAYPAL_CLIENT_ID`/`PAYPAL_CLIENT_SECRET` are accepted only for Sandbox compatibility)
- `BETTER_AUTH_URL`
- `DATABASE_URL` or `DATABASE_RUNTIME_URL` when durable payment records are required

For Live processing, configure all of these in the Vercel **Production** environment:

- `PAYPAL_ENVIRONMENT=live`
- `PAYPAL_LIVE_CLIENT_ID`
- `PAYPAL_LIVE_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID` for the registered Live webhook
- `PAYMENTS_ENABLED=true`
- `PAYPAL_LIVE_RELEASE_APPROVED=true`
- `SOLVEX_TENANT_ID`
- `BETTER_AUTH_URL` as the canonical HTTPS production origin
- `DATABASE_RUNTIME_URL` or `DATABASE_URL` pointing to the durable Neon database

The Live adapter refuses to run when any required gate is missing, when the deployment is not Production, or when generic/Sandbox credentials are supplied in Live mode. Do not put PayPal secrets in the client bundle, repository, logs, or chat.

After changing Vercel variables, redeploy. Vercel does not inject changed environment variables into an already-built deployment.

## Durable payment behavior

Checkout creates a tenant- and user-scoped `payment_orders` record before calling PayPal. The cart is priced again from the verified server catalog. The internal payment ID is used as the PayPal request id, and the client supplies a validated idempotency key so retries do not create a second application payment intent.

Capture verifies the persisted payment, PayPal order ownership, invoice ID, amount, currency, and intent. Repeated capture requests are safe and do not grant fulfillment. Payment state is persisted in Neon and browser redirects are not treated as durable proof by themselves.

## Webhook endpoint

Register the PayPal webhook against:

```text
https://uarefake.vercel.app/api/paypal/webhook
```

The route reads the raw body, validates PayPal transmission headers, verifies the signature with PayPal's verification API using the configured environment and webhook ID, deduplicates provider event IDs, and updates the durable payment state. Invalid signatures are rejected. Events that arrive before the payment row is persisted return a retryable response.

The handler currently recognizes completed captures and marks refund, reversal, and dispute events for review. Fulfillment remains a separate server-side authorization decision and is not created by the browser return page.

## Release procedure

1. Apply migration `0005_payments.sql` to the connected Neon database.
2. Run the full Sandbox checkout, capture, webhook replay, mismatch, timeout, and retry tests.
3. Register and verify the Live PayPal webhook without performing a purchase.
4. Deploy with Live credentials present but `PAYMENTS_ENABLED=false` and verify readiness/configuration logs.
5. Obtain explicit operational approval, set `PAYPAL_LIVE_RELEASE_APPROVED=true`, then set `PAYMENTS_ENABLED=true`.
6. Monitor captures, webhook verification, duplicate events, review-required payments, and reconciliation before enabling any downstream fulfillment.

A successful PayPal capture does not automatically create an entitlement or authorize execution. Refunded, reversed, disputed, mismatched, or review-required payments must remain blocked from fulfillment.
