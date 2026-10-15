import { useMemo, useState } from "react";
import { Cpu, HeartPulse, Power, RefreshCw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateChip } from "@/components/ui/badge";
import { Chamber, Instrument } from "@/components/world";
import { invokeToolAsync, TOOL_DOCS, type Subject, type ToolId } from "@/lib/kernel";
import { KERNEL_HONESTY, activationOf, snapshot, useKernelStore } from "@/lib/kernel";
import { cn } from "@/lib/utils";

const SUBJECTS: Subject[] = ["operator", "daisy"];
const TOOLS: ToolId[] = ["grid_status", "node_ping", "audit_tail", "node_diagnostic", "node_reboot"];

function tone(state: string) {
  if (state === "online") return "bg-ok";
  if (state === "configured") return "bg-ok/70";
  if (state === "external") return "bg-hold";
  if (state === "prohibited") return "bg-stamp";
  if (state === "booting" || state === "rebooting") return "bg-fg animate-pulse";
  return "bg-subtle";
}

export function KernelChamber() {
  const phase = useKernelStore((s) => s.phase);
  const nodes = useKernelStore((s) => s.nodes);
  const bus = useKernelStore((s) => s.bus);
  const bootedAt = useKernelStore((s) => s.bootedAt);
  const boot = useKernelStore((s) => s.boot);
  const halt = useKernelStore((s) => s.halt);
  const reboot = useKernelStore((s) => s.reboot);
  const rebootNode = useKernelStore((s) => s.rebootNode);
  const diagnosticNode = useKernelStore((s) => s.diagnosticNode);
  const snap = snapshot(phase, bootedAt, nodes);
  const activation = activationOf(phase, nodes);
  const [selected, setSelected] = useState<string | null>("DN-01");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [subject, setSubject] = useState<Subject>("operator");
  const [tool, setTool] = useState<ToolId>("grid_status");
  const [approve, setApprove] = useState(false);
  const [toolOut, setToolOut] = useState<string>("Daisy may read and probe. Reboot needs operator approval.");

  const node = useMemo(
    () => nodes.find((n) => n.id === selected) ?? nodes[0],
    [nodes, selected],
  );

  async function run(label: string, fn: () => Promise<unknown> | unknown) {
    setBusy(true);
    try {
      const r = await fn();
      if (r && typeof r === "object" && "message" in r) {
        setNotice(String((r as { message: string }).message));
      } else {
        setNotice(label);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Pipeline kernel
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {KERNEL_HONESTY}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={busy || phase === "running" || phase === "booting"} onClick={() => run("Boot", boot)}>
            <Power className="size-4" /> Boot
          </Button>
          <Button variant="outline" disabled={busy || phase === "halted"} onClick={() => run("Halt", halt)}>
            Halt
          </Button>
          <Button variant="subtle" disabled={busy} onClick={() => run("Reboot", reboot)}>
            <RefreshCw className="size-4" /> Reboot
          </Button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Instrument label="Phase" value={snap.phase.toUpperCase()} hint={snap.kind} />
        <Instrument
          label="In-process online"
          value={`${snap.nodes.online}`}
          hint={`${snap.nodes.total} registered`}
        />
        <Instrument
          label="Daisy gate"
          value={activation.status}
          hint={`${activation.inProcessOnline}/${activation.inProcessCapable}`}
        />
        <Instrument
          label="Bus"
          value="MEMORY"
          hint={`claimed ${snap.bus.claimedPort} · not bound`}
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Chamber>
          <p className="font-mono text-2xs uppercase tracking-kicker text-muted">PayPal DN-35</p>
          <p className="mt-1 font-display text-lg font-bold">CONFIGURED</p>
          <p className="mt-1 text-xs text-muted">Hosted checkout live. No OS child.</p>
        </Chamber>
        <Chamber>
          <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Neon DN-34</p>
          <p className="mt-1 font-display text-lg font-bold text-hold">EXTERNAL</p>
          <p className="mt-1 text-xs text-muted">Production remains blocked without credentials.</p>
        </Chamber>
        <Chamber>
          <p className="font-mono text-2xs uppercase tracking-kicker text-muted">Stripe DN-36</p>
          <p className="mt-1 font-display text-lg font-bold text-stamp">PROHIBITED</p>
          <p className="mt-1 text-xs text-muted">Fiat settlement routes only through PayPal.</p>
        </Chamber>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)]">
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
              <Cpu className="size-4" /> 54-node grid
            </h2>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
              {snap.nodes.online} online · {snap.nodes.configured} configured · {snap.nodes.external} external · {snap.nodes.prohibited} prohibited
            </p>
          </div>
          <div className="grid grid-cols-6 gap-1 sm:grid-cols-9">
            {nodes.map((n) => (
              <button
                key={n.id}
                type="button"
                title={`${n.id} ${n.name} · ${n.state} · gen ${n.generation}`}
                onClick={() => setSelected(n.id)}
                className={cn(
                  "flex min-h-11 flex-col items-center justify-center rounded-sm px-1 py-1 hairline",
                  selected === n.id ? "bg-fg text-bg" : "bg-surface/80",
                )}
              >
                <span className={cn("mb-1 size-1.5 rounded-full", tone(n.state))} />
                <span className="font-mono text-3xs">{n.id.replace("DN-", "")}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 font-mono text-3xs uppercase tracking-kicker text-muted">
            <span className="inline-flex items-center gap-1"><i className="size-1.5 rounded-full bg-ok" /> online</span>
            <span className="inline-flex items-center gap-1"><i className="size-1.5 rounded-full bg-ok/70" /> configured</span>
            <span className="inline-flex items-center gap-1"><i className="size-1.5 rounded-full bg-hold" /> external</span>
            <span className="inline-flex items-center gap-1"><i className="size-1.5 rounded-full bg-stamp" /> prohibited</span>
            <span className="inline-flex items-center gap-1"><i className="size-1.5 rounded-full bg-subtle" /> offline</span>
          </div>
        </section>

        <aside className="space-y-4">
          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">{node.id}</p>
            <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">{node.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{node.purpose}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StateChip state={node.state} />
              <StateChip state={node.recordedStatus} />
            </div>
            <dl className="mt-3 space-y-1 font-mono text-2xs text-muted">
              <div className="flex justify-between gap-3"><dt>generation</dt><dd className="text-fg">{node.generation}</dd></div>
              <div className="flex justify-between gap-3"><dt>port label</dt><dd className="text-fg">{node.port} · not bound</dd></div>
              <div className="flex justify-between gap-3"><dt>restarts</dt><dd className="text-fg">{node.restarts}</dd></div>
              <div className="flex justify-between gap-3"><dt>evidence</dt><dd className="truncate text-fg">{node.evidenceHash.slice(0, 12)}…</dd></div>
            </dl>
            {node.lastDiagnostic ? (
              <p className="mt-3 text-xs leading-relaxed text-muted">{node.lastDiagnostic.detail}</p>
            ) : null}
            <div className="mt-4 flex flex-col gap-2">
              <Button
                variant="outline"
                disabled={busy || phase !== "running"}
                onClick={() => run("Diagnostic", () => diagnosticNode(node.id))}
              >
                <HeartPulse className="size-4" /> Diagnostic
              </Button>
              <Button
                variant="subtle"
                disabled={busy || phase !== "running"}
                onClick={() => run("Reboot node", () => rebootNode(node.id))}
              >
                <RefreshCw className="size-4" /> Recycle generation
              </Button>
            </div>
            {notice ? <p className="mt-3 text-xs leading-relaxed text-muted">{notice}</p> : null}
          </Chamber>

          <Chamber>
            <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
              Daisy activation
            </p>
            <p className={cn("mt-2 font-display text-xl font-bold", activation.status === "ACTIVE" ? "text-ok" : "text-hold")}>
              {activation.status}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{activation.reason}</p>
          </Chamber>
        </aside>
      </div>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Chamber>
          <p className="font-mono text-2xs uppercase tracking-kicker text-muted">
            Permissioned tools · daisy-ai-os
          </p>
          <p className="mt-2 text-sm text-muted">
            Subjects are assigned here, never taken from a request body. Daisy
            cannot reboot without operator approval.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUBJECTS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSubject(s)}
                className={cn(
                  "min-h-11 rounded-md px-3 text-xs uppercase tracking-kicker",
                  subject === s ? "bg-fg text-bg" : "hairline text-muted",
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {TOOLS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTool(t)}
                className={cn(
                  "min-h-11 rounded-md px-3 text-xs uppercase tracking-kicker",
                  tool === t ? "bg-fg text-bg" : "hairline text-muted",
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted">{TOOL_DOCS[tool]}</p>
          <label className="mt-3 flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={approve}
              onChange={(e) => setApprove(e.target.checked)}
            />
            Operator approval for mutating tools
          </label>
          <Button
            className="mt-3"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const r = await invokeToolAsync(subject, tool, { id: node.id }, approve);
                setToolOut(`${r.ok ? "OK" : "REFUSED"} · ${r.message}${r.needsApproval ? " · needs approval" : ""}`);
              } finally {
                setBusy(false);
              }
            }}
          >
            Invoke as {subject}
          </Button>
          <pre className="mt-3 whitespace-pre-wrap font-mono text-2xs text-muted">{toolOut}</pre>
        </Chamber>

        <Chamber>
          <p className="inline-flex items-center gap-2 font-mono text-2xs uppercase tracking-kicker text-muted">
            <ShieldAlert className="size-3.5" /> In-memory bus
          </p>
          <ol className="mt-3 max-h-72 space-y-2 overflow-auto">
            {bus.map((e, i) => (
              <li key={`${e.ts}-${i}`} className="text-xs">
                <p className="font-mono text-2xs text-muted">
                  {new Date(e.ts).toISOString().slice(11, 19)} · {e.topic}
                </p>
                <p className="leading-relaxed text-muted">{e.detail}</p>
              </li>
            ))}
          </ol>
        </Chamber>
      </section>
    </div>
  );
}
