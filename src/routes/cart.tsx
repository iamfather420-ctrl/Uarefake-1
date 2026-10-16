import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/nav";
import { Button } from "@/components/ui/button";
import { productBySku } from "@/lib/catalog";
import { useAppStore } from "@/lib/store";
import { formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/cart")({ component: CartPage });

function CartPage() {
  const cart = useAppStore((s) => s.cart);
  const setQty = useAppStore((s) => s.setQty);

  const lines = cart
    .map((l) => {
      const p = productBySku(l.sku);
      return p ? { ...l, product: p } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);
  const total = lines.reduce((n, l) => n + l.product.priceCents * l.qty, 0);

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
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg tabular-nums">{formatUsd(total)}</p>
                <Button disabled>Access request blocked</Button>
              </div>
              <p className="text-sm text-stamp">
                Production sign-in and tenant-scoped request persistence have not been verified.
                No order or payment will be created from this browser-only cart.
              </p>
            </div>
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
            This build does not yet have verified operator sign-in and tenant-scoped request persistence.
            Access requests are therefore blocked instead of being recorded in local browser storage.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Browsing is available. Entitlement approval and execution remain separate, explicitly authorized steps.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
