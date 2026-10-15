import { createFileRoute, Link } from "@tanstack/react-router";
import { ParaiStrip } from "@/components/parai";
import { StateChip } from "@/components/ui/badge";
import { Instrument } from "@/components/world";
import { agents } from "@/lib/registry";
import { KERNEL_HONESTY, activationOf, snapshot, useKernelStore } from "@/lib/kernel";
import { executionGates } from "@/lib/solvex/gates-data";
import { solvexNodes } from "@/lib/solvex/nodes-data";
import { manifest } from "@/lib/manifest";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/space/")({ component: SpaceHome });

function SpaceHome() {
  const runs = useAppStore((s) => s.runs);
  const orders = useAppStore((s) => s.orders);
  const phase = useKernelStore((s) => s.phase);
  const nodes = useKernelStore((s) => s.nodes);
  const bootedAt = useKernelStore((s) => s.bootedAt);
  const snap = snapshot(phase, bootedAt, nodes);
  const activation = activationOf(phase, nodes);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Instrument
          label="Z3 WASM"
          value={`${manifest.formal120.matches}/${manifest.formal120.total}`}
          hint={manifest.formal120.status}
        />
        <Instrument
          label="DFRL"
          value={`${manifest.dfrl.unsat}/${manifest.dfrl.total}`}
          hint="UNSAT operators"
        />
        <Instrument
          label="Kernel"
          value={snap.phase.toUpperCase()}
          hint={`${snap.nodes.online} in-process online`}
        />
        <Instrument
          label="PayPal DN-35"
          value="LIVE"
          hint={manifest.gateways.paypal}
        />
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <Link
          to="/space/kernel"
          className="chamber rounded-lg bg-surface/80 p-5 hairline hover:bg-elevated"
        >
          <p className="font-mono text-2xs uppercase tracking-kicker text-muted">KN · pipeline</p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Kernel chamber</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{KERNEL_HONESTY}</p>
          <p className="mt-3 font-mono text-2xs uppercase tracking-kicker text-ok">
            Daisy {activation.status}
          </p>
        </Link>
        <Link
          to="/space/power"
          className="chamber rounded-lg bg-surface/80 p-5 hairline hover:bg-elevated"
        >
          <p className="font-mono text-2xs uppercase tracking-kicker text-muted">PBP-1 · finite theory</p>
          <h2 className="mt-1 font-display text-xl font-semibold tracking-tight">Proof Before Power</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Eight obligations. SAT is a countermodel. Daisy proposes. The host
            binds authorization. Tamper fails closed.
          </p>
          <p className="mt-3 font-mono text-2xs uppercase tracking-kicker text-ok">
            Open the judge cockpit
          </p>
        </Link>
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Live PARAI
          </h2>
          <Link to="/space/execution" className="text-xs uppercase tracking-kicker text-muted hover:text-fg">
            Open MMTAI
          </Link>
        </div>
        <ParaiStrip active={runs[0]?.stage} compact />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            15-gate pipeline
          </h2>
          <p className="mt-1 font-mono text-2xs text-muted">
            {manifest.gates.passed}/{manifest.gates.total} passed · {manifest.gates.verdict}
          </p>
          <ul className="mt-3 max-h-72 space-y-1 overflow-auto">
            {executionGates.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between gap-3 rounded-lg bg-surface/80 px-3 py-2 hairline"
              >
                <div>
                  <p className="text-sm">{g.name}</p>
                  <p className="font-mono text-2xs text-muted">{g.id}</p>
                </div>
                <StateChip state={g.passed ? "VERIFIED" : g.status} />
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Registered intelligences
          </h2>
          <ul className="mt-3 space-y-2">
            {agents.slice(0, 6).map((a) => (
              <li key={a.id}>
                <Link
                  to="/registry/$id"
                  params={{ id: a.id }}
                  className="flex items-center justify-between rounded-lg bg-surface/80 px-3 py-2 hairline hover:bg-elevated"
                >
                  <span className="text-sm">{a.name}</span>
                  <StateChip state={a.evidence} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="font-display text-xl font-semibold tracking-tight">
            Daisy nodes
          </h2>
          <Link to="/space/nodes" className="text-xs uppercase tracking-kicker text-muted hover:text-fg">
            All 54
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
          {solvexNodes.slice(0, 12).map((n) => (
            <div key={n.id} className="chamber rounded-lg bg-surface/80 p-3 hairline">
              <p className="font-mono text-2xs text-muted">{n.id}</p>
              <p className="mt-1 text-sm leading-snug">{n.name}</p>
              <p className="mt-2 font-mono text-2xs uppercase tracking-kicker text-ok">
                {n.status}
              </p>
            </div>
          ))}
        </div>
      </section>

      {orders[0] ? (
        <p className="mt-8 font-mono text-3xs text-muted">
          Last commerce: {orders[0].id} · {orders[0].status}
        </p>
      ) : null}
    </div>
  );
}
