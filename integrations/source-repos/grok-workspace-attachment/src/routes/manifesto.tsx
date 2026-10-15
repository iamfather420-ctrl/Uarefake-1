import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/nav";
import { Stamp } from "@/components/brand";
import { EngineExpansion } from "@/components/engine-mark";
import { ParaiStrip } from "@/components/parai";
import { SectorMark } from "@/components/world";
import { ENGINE_EXPANSION, ENGINE_NAME } from "@/lib/solvex/identity";

export const Route = createFileRoute("/manifesto")({ component: Manifesto });

const principles = [
  ["Evidence before claims", "Do not promote an assertion beyond the evidence."],
  ["Verification before publication", "Verified is a process that occurred, not a mood."],
  ["Authorization before execution", "The system does not act merely because it can."],
  ["Capability ≠ authority", "Technical reach is not permission."],
  ["Authority ≠ authorization", "A role is not a blank check."],
  ["Authorization ≠ execution", "A permission record is not a receipt."],
  ["Execution must be observable", "Material work produces a Crystal Clear Box."],
  ["Failed verification fails closed", "Missing proof never becomes success."],
  ["Unverified goods stay out", "The marketplace is not a wish list."],
  ["Human sovereignty", "Autonomy does not seize ownership."],
  ["Reversibility throughout", "The system does nothing it cannot reverse."],
];

function Manifesto() {
  return (
    <PageShell>
      <div className="relative overflow-hidden border-b border-line">
        <div className="relative mx-auto max-w-6xl px-4 py-16">
          <Stamp>Contract</Stamp>
          <SectorMark sector="SEC-04" name="Hull law" className="mt-6" />
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight holo md:text-6xl">
            {ENGINE_NAME}
          </h1>
          <p className="mt-4 max-w-2xl font-display text-xl font-semibold leading-snug tracking-tight">
            {ENGINE_EXPANSION}
          </p>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">
            {ENGINE_NAME} is the public face of Solvex. Daisy Haminja is the
            intelligence. DFRL is the formal bridge. MMTAI is the execution
            protocol. NOPOT is identity with a burn path. The Crystal Clear Box
            is how you inspect any of it.
          </p>
          <EngineExpansion className="mt-10 max-w-3xl" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ol className="grid gap-3 md:grid-cols-2">
          {principles.map(([t, b], i) => (
            <li key={t} className="chamber rounded-lg bg-surface/80 p-5 hairline">
              <p className="font-mono text-2xs text-muted">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">
                {t}
              </h2>
              <p className="mt-2 text-sm text-muted">{b}</p>
            </li>
          ))}
        </ol>
        <div className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-bold tracking-tight">
            The loop
          </h2>
          <ParaiStrip />
        </div>
        <blockquote className="mt-12 max-w-3xl font-display text-2xl font-semibold leading-snug tracking-tight holo">
          Daisy thinks. DFRL verifies. MMTAI controls execution. Solvex records
          and proves. NOPOT protects identity. Humans retain authority.
        </blockquote>
      </div>
    </PageShell>
  );
}
