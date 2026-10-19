import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { productBySku } from "@/lib/catalog";
import { useAppStore } from "@/lib/store";
import { formatUsd } from "@/lib/utils";
import {
  capturePayPalOrder,
  createPayPalOrder,
} from "@/lib/paypal";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const cart = useAppStore((s) => s.cart);
  const setQty = useAppStore((s) => s.setQty);
  const clearCart = useAppStore((s) => s.clearCart);
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const lines = cart
    .map((l) => {
      const p = productBySku(l.sku);
      return p ? { ...l, product: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const total = lines.reduce((n, l) => n + l.product.priceCents * l.qty, 0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paypal = params.get("paypal");
    if (paypal === "cancel") {
      window.history.replaceState({}, "", window.location.pathname);
      setPaymentMessage("PayPal checkout was cancelled. No payment was captured.");
      return;
    }
    if (paypal !== "return") return;
    const orderId = params.get("token");
    window.history.replaceState({}, "", window.location.pathname);
    if (!orderId) {
      setPaymentError("PayPal returned without an order ID. No access was granted.");
      return;
    }
    let active = true;
    setCheckoutBusy(true);
    setPaymentMessage("Verifying the PayPal order and capture…");
    void capturePayPalOrder({ data: { orderId } })
      .then((result) => {
        if (!active) return;
        if (result.status !== "COMPLETED") {
          setPaymentError("PayPal did not confirm a completed capture. No access was granted.");
          return;
        }
        clearCart();
        setPaymentMessage(
          `PAYMENT CAPTURE VERIFIED · ${result.currency} ${result.amount} · capture ${result.captureId ?? "ID unavailable"}. Fulfillment remains separately authorized.`,
        );
      })
      .catch((error: unknown) => {
        if (!active) return;
        setPaymentError(
          error instanceof Error
            ? error.message
            : "PayPal capture verification failed. No access was granted.",
        );
      })
      .finally(() => {
        if (active) setCheckoutBusy(false);
      });
    return () => {
      active = false;
    };
  }, [clearCart]);

  async function beginCheckout() {
    setCheckoutBusy(true);
    setPaymentError(null);
    setPaymentMessage("Creating a PayPal order…");
    try {
      const idempotencyKey = `checkout-${globalThis.crypto.randomUUID()}`;
      const order = await createPayPalOrder({
        data: { items: cart, idempotencyKey },
      });
      if (!order.approvalUrl.startsWith("https://")) {
        throw new Error("Checkout blocked: PayPal did not return a trusted approval URL.");
      }
      window.location.assign(order.approvalUrl);
    } catch (error) {
      setPaymentError(
        error instanceof Error
          ? error.message
          : "PayPal checkout could not be started.",
      );
      setPaymentMessage(null);
      setCheckoutBusy(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1fr_1fr]">
        <section>
          <p className="font-mono text-2xs uppercase tracking-mark text-muted">
            Entitlement cart
          </p>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight">
            Verified access only.
          </h1>
          {lines.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Cart is empty.{" "}
              <Link to="/store" className="text-fg underline-offset-4 hover:underline">
                Browse verified catalog
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-6 space-y-3">
              {lines.map((l) => (
                <li
                  key={l.sku}
                  className="flex items-start justify-between gap-3 rounded-xl bg-surface p-4 hairline"
                >
                  <div>
                    <p className="font-display font-semibold">{l.product.title}</p>
                    <p className="font-mono text-3xs text-muted">
                      {formatUsd(l.product.priceCents)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Decrease ${l.product.title} quantity`}
                      className="grid size-10 place-items-center rounded-md hairline"
                      onClick={() => setQty(l.sku, l.qty - 1)}
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-mono text-sm tabular-nums">
                      {l.qty}
                    </span>
                    <button
                      type="button"
                      aria-label={`Increase ${l.product.title} quantity`}
                      className="grid size-10 place-items-center rounded-md hairline"
                      onClick={() => setQty(l.sku, l.qty + 1)}
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {lines.length > 0 ? (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <p className="font-mono text-lg tabular-nums">{formatUsd(total)}</p>
                <Button onClick={beginCheckout} disabled={checkoutBusy}>
                  {checkoutBusy ? "Working…" : "Pay with PayPal"}
                </Button>
              </div>
              <p className="text-xs text-muted">
                The server recomputes prices from the verified catalog and confirms capture
                directly with PayPal. Payment availability is controlled server-side.
              </p>
            </div>
          ) : null}
          {paymentMessage ? (
            <p role="status" className="mt-4 rounded-lg bg-surface p-3 text-sm text-muted hairline">
              {paymentMessage}
            </p>
          ) : null}
          {paymentError ? (
            <p role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-950/20 p-3 text-sm text-red-200">
              PayPal: {paymentError}
            </p>
          ) : null}
        </section>
        <section>
          <p className="font-mono text-2xs uppercase tracking-mark text-muted">
            SOLVEX access requests
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
            Human authorization required.
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-muted">
            A successful capture does not automatically create an entitlement or authorize
            execution. Durable, tenant-scoped fulfillment remains a separate server decision.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Browsing is available. Payment approval, entitlement approval, and execution remain
            distinct states.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
