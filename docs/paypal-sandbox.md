# PayPal Sandbox checkout

This repository supports **Sandbox-only** checkout for manual end-to-end testing. It does not enable live-money payments or automatically grant a SOLVEX entitlement.

## Required Vercel Production environment variables

Set these exact names under **Project → Settings → Environment Variables**, scoped to **Production**:

- `PAYPAL_CLIENT_ID` — Client ID from the **Sandbox** tab of PayPal Developer Dashboard.
- `PAYPAL_CLIENT_SECRET` — matching Sandbox secret. Never commit or paste it into chat.
- `PAYPAL_ENVIRONMENT` — exactly `sandbox`.
- `BETTER_AUTH_URL` — the canonical HTTPS application origin, such as `https://uarefake.vercel.app`. Checkout requires a trusted return URL and authenticated user.

Redeploy after changing variables. Vercel does not inject changed environment variables into an already-built deployment.

## Smoke-test flow

1. Sign in through the configured production identity provider.
2. Add a catalog item marked `VERIFIED` to the cart.
3. Choose **Pay with PayPal Sandbox**.
4. Approve using a PayPal Sandbox personal/buyer account (not a live PayPal account).
5. Return to the storefront. The server fetches the order from the Sandbox API, checks the signed-in user's order association and USD amount, and captures/validates the payment with PayPal.
6. Confirm the cart shows `SANDBOX CAPTURE VERIFIED` and a capture ID. The app does not treat a browser redirect alone as payment proof.

## Safety boundary

The integration refuses to use the live PayPal API. A verified Sandbox capture is test evidence only; it does not grant entitlement, authorize fulfillment, or establish production payment readiness. Before live payments are enabled, add durable tenant-scoped order persistence, verified/idempotent webhook handling, refund/reversal handling, reconciliation, and end-to-end fulfillment authorization. Keep those steps blocked until separately reviewed and tested.
