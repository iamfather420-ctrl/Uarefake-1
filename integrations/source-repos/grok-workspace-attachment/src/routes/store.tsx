import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/nav";
import { StateChip } from "@/components/ui/badge";
import { SectorMark } from "@/components/world";
import { categories, products, type Product } from "@/lib/catalog";
import { formatUsd } from "@/lib/utils";

export const Route = createFileRoute("/store")({ component: Store });

function Store() {
  const [cat, setCat] = useState<(typeof categories)[number]["id"]>("all");
  const list =
    cat === "all" ? products : products.filter((p) => p.category === cat);

  return (
    <PageShell>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <SectorMark sector="SEC-01" name="Bazaar · hangar of proven goods" />
        <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight holo md:text-5xl">
          Plates that can prove themselves.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          This is not a catalog page. It is a marketplace that refuses to host
          unverified matter. Entitlement is not execution. Checkout is PayPal
          DN-35 — capture happens at PayPal, never as a simulated receipt.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={
                cat === c.id
                  ? "min-h-11 rounded-sm bg-fg px-3 py-2 text-xs uppercase tracking-kicker text-bg"
                  : "min-h-11 rounded-sm px-3 py-2 text-xs uppercase tracking-kicker text-muted hairline"
              }
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p, i) => (
            <ProductCard key={p.sku} product={p} index={i} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  return (
    <Link
      to="/store/$sku"
      params={{ sku: product.sku }}
      className="portal plate chamber flex flex-col rounded-lg bg-surface/80 p-5 hairline hairline-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
          PLATE {String(index + 1).padStart(2, "0")} · {product.solutionId}
        </p>
        <StateChip state={product.evidence} />
      </div>
      <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">
        {product.title}
      </h2>
      <p className="mt-2 flex-1 text-sm text-muted">{product.short}</p>
      <p className="mt-4 font-mono text-sm tabular-nums">
        {product.evidence === "INTENDED"
          ? "Not for sale"
          : `${formatUsd(product.priceCents)}${product.cadence === "seat" ? " / seat" : ""}`}
      </p>
    </Link>
  );
}
