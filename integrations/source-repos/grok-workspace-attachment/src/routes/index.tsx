import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Stamp } from "@/components/brand";
import { EngineRunes } from "@/components/engine-mark";
import { PageShell } from "@/components/nav";
import { ParaiStrip } from "@/components/parai";
import { SessionScan } from "@/components/session-scan";
import { Button } from "@/components/ui/button";
import { StateChip } from "@/components/ui/badge";
import { Hatch, HudTicker, Instrument, SectorMark } from "@/components/world";
import { products } from "@/lib/catalog";
import { formalClosure } from "@/lib/solvex/closure";
import { ENGINE_EXPANSION, ENGINE_NAME } from "@/lib/solvex/identity";
import { formatUsd } from "@/lib/utils";
import { manifest } from "@/lib/manifest";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const featured = products.filter((p) => p.evidence === "VERIFIED").slice(0, 4);

  return (
    <PageShell>
      <section className="relative flex min-h-[calc(100dvh-3rem)] flex-col">
        <div className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 items-start gap-6 px-4 py-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-8 lg:py-8">
          <div className="lg:col-span-2">
            <SectorMark sector="SEC-00" name="Airlock · arrival" />
            <div className="mt-4 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between md:gap-8">
              <h1 className="rise-in display-mega holo font-display font-extrabold text-fg">
                {ENGINE_NAME}
              </h1>
              <Stamp className="shrink-0 md:mb-2">Engine</Stamp>
            </div>
          </div>
          <div className="flex justify-center lg:col-start-2 lg:row-start-2">
            <SessionScan />
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            <p className="rise-in max-w-xl font-display text-lg font-semibold leading-snug tracking-tight text-fg sm:text-2xl">
              {ENGINE_EXPANSION}
            </p>
            <p className="rise-in mt-4 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              This is not a website. It is a machine you have entered — ruin,
              census, living intelligence, and a bazaar that refuses unverified
              matter. Daisy lives here. Humans remain the root of trust.
            </p>
            <EngineRunes className="mt-4 max-w-xl" />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/store">
                  Cycle the bazaar hatch <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/space">Enter the bridge</Link>
              </Button>
              <Button asChild variant="stamp">
                <Link to="/space/power">Hatch to Power</Link>
              </Button>
            </div>
            <div className="mt-6 hidden grid-cols-4 gap-2 sm:grid">
              <Instrument label="Z3" value={`${manifest.formal120.total}`} hint="closure" />
              <Instrument label="DFRL" value={`${manifest.dfrl.unsat}`} hint="UNSAT" />
              <Instrument label="Daisy" value={`${manifest.daisyNodes.executed}`} hint="nodes" />
              <Instrument label="PayPal" value="LIVE" hint="DN-35" />
            </div>
          </div>
        </div>
      </section>

      <HudTicker
        items={[
          `Z3 ${formalClosure.z3.total}/${formalClosure.z3.total} ${formalClosure.status}`,
          `DFRL ${formalClosure.dfrl.unsat}/${formalClosure.dfrl.total} UNSAT`,
          `DH ${formalClosure.dh.unsat} UNSAT · ${formalClosure.dh.sat} SAT`,
          `Daisy ${formalClosure.daisy.executed}/54 · ${formalClosure.daisy.codeExecuted} code`,
          `${formalClosure.receipts.total} proof receipts`,
          "PayPal DN-35 hosted live",
          "Stripe prohibited",
          `PBP-1 finite policy · 8 obligations`,
          "In-process pipeline kernel · 54 nodes",
          "Unverified goods stay out",
          ENGINE_EXPANSION,
        ]}
      />

      <section className="border-b border-line">
        <div className="mx-auto grid max-w-6xl gap-px bg-line md:grid-cols-3">
          <Hatch
            to="/store"
            sector="01"
            kicker="uarefake.com"
            title="Bazaar"
            body="A hangar of verified solutions. Unverified goods never occupy a plate. Entitlement is not execution."
          />
          <Hatch
            to="/registry"
            sector="02"
            kicker="census"
            title="Census"
            body="Living intelligences in signed cells. Each has a human owner, a capability cage, and a demonstrated state."
          />
          <Hatch
            to="/space"
            sector="03"
            kicker="uarefake.space"
            title="Bridge"
            body="The controlboard. Propose. Authorize. Execute. Observe. Reverse. Daisy never acts merely because she can."
          />
        </div>
        <div className="mx-auto grid max-w-6xl gap-px bg-line md:grid-cols-2">
          <Hatch
            to="/space/kernel"
            sector="03"
            kicker="pipeline"
            title="Kernel"
            body="One supervisor for 54 nodes. This hull runs the kernel in-process. Generation ids replace PIDs. Neon stays external. Stripe stays prohibited."
          />
          <Hatch
            to="/space/power"
            sector="03"
            kicker="PBP-1"
            title="Power"
            body="Proof before power. Eight obligations. SAT is a countermodel. UNSAT is the only path to a bounded tool."
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectorMark sector="SEC-01" name="Hangar plates" />
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
              Nothing for sale that cannot prove it.
            </h2>
          </div>
          <Button asChild variant="outline">
            <Link to="/store">Full hangar</Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {featured.map((p, i) => (
            <Link
              key={p.sku}
              to="/store/$sku"
              params={{ sku: p.sku }}
              className="portal plate chamber flex flex-col rounded-lg bg-surface/80 p-5 hairline hairline-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
                  PLATE {String(i + 1).padStart(2, "0")} · {p.solutionId}
                </p>
                <StateChip state={p.evidence} />
              </div>
              <h3 className="mt-3 font-display text-xl font-semibold tracking-tight">
                {p.title}
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted">{p.short}</p>
              <p className="mt-4 font-mono text-sm tabular-nums">
                {formatUsd(p.priceCents)}
                {p.cadence === "seat" ? " / seat" : ""}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-surface/50">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <SectorMark sector="CYCLE" name="PARAI" />
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
            The machine does not skip a stage.
          </h2>
          <div className="mt-8">
            <ParaiStrip />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
