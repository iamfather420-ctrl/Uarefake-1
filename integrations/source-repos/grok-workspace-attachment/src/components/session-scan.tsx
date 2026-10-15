import { useState } from "react";
import { Stamp } from "@/components/brand";
import { StateChip } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Verdict = "idle" | "scanning" | "done";

export function SessionScan({ className }: { className?: string }) {
  const [phase, setPhase] = useState<Verdict>("idle");

  function scan() {
    setPhase("scanning");
    window.setTimeout(() => setPhase("done"), 1600);
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative aspect-square w-full max-w-64 sm:max-w-72">
        <div className="iris-ring pointer-events-none absolute inset-0 rounded-full" />
        <div className="iris-ring pointer-events-none absolute inset-[9%] rounded-full" />
        <div className="pointer-events-none absolute inset-[18%] rounded-full border border-stamp/35 breath-ring" />
        <div className="iris-ring iris-spin pointer-events-none absolute inset-[28%] rounded-full border-dashed border-fg/15" />
        {phase === "scanning" ? (
          <div className="pointer-events-none absolute inset-[18%] overflow-hidden rounded-full">
            <div className="absolute inset-x-0 top-0 h-px bg-stamp scan-sweep" />
          </div>
        ) : null}
        <button
          type="button"
          onClick={phase === "idle" ? scan : undefined}
          disabled={phase === "scanning"}
          className="absolute inset-[38%] grid place-items-center rounded-full bg-fg px-2 text-center font-mono text-2xs uppercase tracking-kicker text-bg transition-opacity duration-150 hover:opacity-90 disabled:opacity-70"
        >
          {phase === "idle" ? "Open iris" : phase === "scanning" ? "Reading" : "Held"}
        </button>
      </div>
      <div className="mt-4 min-h-16 w-full max-w-sm text-center">
        {phase === "idle" ? (
          <p className="text-sm text-muted">
            The machine reads a session, not a person. No identity is minted.
          </p>
        ) : null}
        {phase === "scanning" ? (
          <p className="font-mono text-xs uppercase tracking-kicker text-stamp">
            Pointer · viewport · clock · no PII
          </p>
        ) : null}
        {phase === "done" ? (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <StateChip state="CLAIM" />
              <Stamp className="text-2xs">Unverified</Stamp>
            </div>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
              Human session · NOPOT not registered
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
