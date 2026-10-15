/**
 * In-process pipeline kernel for this hull.
 *
 * The kernel zip supervises 54 OS child processes on ports 41001–41054 and an
 * HTTP bus on 40999. This sandbox cannot host that topology, so this runtime
 * is honest: generation ids replace PIDs, the bus is in-memory, and ports are
 * labels. Recorded Full-Build evidence remains the authority for historical
 * execution. No OS children are spawned.
 */
import { solvexNodes, type SolvexNode } from "@/lib/solvex/nodes-data";
import { PAYPAL_HOSTED } from "@/lib/solvex/identity";
import { formalClosure } from "@/lib/solvex/closure";

export const KERNEL_KIND = "in-process-pipeline-kernel" as const;
export const KERNEL_VERSION = "1.0.0";
export const CLAIMED_BUS_PORT = 40999;
export const CLAIMED_PORT_FIRST = 41001;

export type KernelPhase = "halted" | "booting" | "running" | "halting";

export type NodeLiveState =
  | "offline"
  | "booting"
  | "online"
  | "rebooting"
  | "external"
  | "configured"
  | "prohibited";

export type KernelNode = {
  id: string;
  name: string;
  category: string;
  purpose: string;
  executionMode: string;
  recordedStatus: string;
  evidenceHash: string;
  durationMs: number;
  claimScope: string;
  state: NodeLiveState;
  generation: number;
  port: number;
  restarts: number;
  lastDiagnostic: { at: number; ok: boolean; detail: string } | null;
};

export type BusEvent = {
  ts: number;
  topic: string;
  from: string;
  detail: string;
};

export type KernelSnapshot = {
  phase: KernelPhase;
  kind: typeof KERNEL_KIND;
  version: string;
  bootedAt: number | null;
  uptimeMs: number;
  bus: { claimedPort: number; bound: boolean; kind: "in-memory" };
  nodes: {
    total: number;
    online: number;
    offline: number;
    external: number;
    configured: number;
    prohibited: number;
    rebooting: number;
    booting: number;
  };
  honesty: {
    spawnsOsChildren: false;
    bindsClaimedPorts: false;
    generationIdsReplacePids: true;
    recordedEvidenceIsAuthority: true;
  };
  production: {
    neon: "EXTERNAL_PROVIDER_REQUIRED";
    paypal: "CONFIGURED";
    stripe: "PROHIBITED_BLOCKED";
    verdict: typeof formalClosure.productionVerdict;
  };
};

export type DaisyActivation = {
  status: "INACTIVE" | "ACTIVE" | "BLOCKED";
  reason: string;
  kernelPhase: KernelPhase;
  inProcessOnline: number;
  inProcessCapable: number;
};

function nodeIndex(id: string) {
  const n = Number(id.replace("DN-", ""));
  return Number.isFinite(n) ? n : 0;
}

function liveStateFor(node: SolvexNode, phase: KernelPhase): NodeLiveState {
  if (phase === "halted" || phase === "halting") return "offline";
  if (node.id === "DN-34") return "external";
  if (node.id === "DN-35") return "configured";
  if (node.id === "DN-36") return "prohibited";
  if (phase === "booting") return "booting";
  return "online";
}

export function seedNodes(phase: KernelPhase = "halted"): KernelNode[] {
  return solvexNodes.map((n, i) => ({
    id: n.id,
    name: n.name,
    category: n.category,
    purpose: n.purpose,
    executionMode: n.execution_mode,
    recordedStatus: n.status,
    evidenceHash: n.evidence_hash,
    durationMs: n.duration_ms,
    claimScope: n.claim_scope,
    state: liveStateFor(n, phase),
    generation: 1000 + i,
    port: CLAIMED_PORT_FIRST + i,
    restarts: 0,
    lastDiagnostic: null,
  }));
}

export function summarize(nodes: KernelNode[]): KernelSnapshot["nodes"] {
  const count = (s: NodeLiveState) => nodes.filter((n) => n.state === s).length;
  return {
    total: nodes.length,
    online: count("online"),
    offline: count("offline"),
    external: count("external"),
    configured: count("configured"),
    prohibited: count("prohibited"),
    rebooting: count("rebooting"),
    booting: count("booting"),
  };
}

export function snapshot(phase: KernelPhase, bootedAt: number | null, nodes: KernelNode[]): KernelSnapshot {
  return {
    phase,
    kind: KERNEL_KIND,
    version: KERNEL_VERSION,
    bootedAt,
    uptimeMs: bootedAt ? Date.now() - bootedAt : 0,
    bus: { claimedPort: CLAIMED_BUS_PORT, bound: false, kind: "in-memory" },
    nodes: summarize(nodes),
    honesty: {
      spawnsOsChildren: false,
      bindsClaimedPorts: false,
      generationIdsReplacePids: true,
      recordedEvidenceIsAuthority: true,
    },
    production: {
      neon: "EXTERNAL_PROVIDER_REQUIRED",
      paypal: "CONFIGURED",
      stripe: "PROHIBITED_BLOCKED",
      verdict: formalClosure.productionVerdict,
    },
  };
}

export function activationOf(phase: KernelPhase, nodes: KernelNode[]): DaisyActivation {
  const capable = nodes.filter(
    (n) => n.id !== "DN-34" && n.id !== "DN-35" && n.id !== "DN-36",
  );
  const online = capable.filter((n) => n.state === "online").length;
  if (phase === "halted") {
    return {
      status: "INACTIVE",
      reason: "Pipeline kernel is halted. Boot required.",
      kernelPhase: phase,
      inProcessOnline: online,
      inProcessCapable: capable.length,
    };
  }
  if (phase === "booting" || phase === "halting") {
    return {
      status: "INACTIVE",
      reason: `Kernel ${phase}. Fail closed until running.`,
      kernelPhase: phase,
      inProcessOnline: online,
      inProcessCapable: capable.length,
    };
  }
  if (online === capable.length && capable.length > 0) {
    return {
      status: "ACTIVE",
      reason: `Kernel running. ${online}/${capable.length} in-process nodes online. DN-34 Neon remains external. DN-35 PayPal hosted is configured. DN-36 Stripe stays prohibited.`,
      kernelPhase: phase,
      inProcessOnline: online,
      inProcessCapable: capable.length,
    };
  }
  return {
    status: "BLOCKED",
    reason: `Kernel running but ${online}/${capable.length} in-process nodes online.`,
    kernelPhase: phase,
    inProcessOnline: online,
    inProcessCapable: capable.length,
  };
}

export function diagnosticDetail(node: KernelNode): string {
  const paypal = node.id === "DN-35" ? ` hostedButton=${PAYPAL_HOSTED.hostedButtonId}` : "";
  return [
    `In-process probe of ${node.id}.`,
    `Recorded evidence ${node.evidenceHash.slice(0, 16)}…`,
    `generation=${node.generation}`,
    `port-label=${node.port} (not bound)`,
    `recorded=${node.recordedStatus}`,
    `live=${node.state}`,
    paypal.trim(),
  ]
    .filter(Boolean)
    .join(" ");
}

export function nextGeneration(current: number) {
  return current + 1000 + nodeIndex(String(current));
}

export const KERNEL_HONESTY =
  "In-process pipeline kernel. This hull does not spawn 54 OS children or bind ports 41001–41054. Generation ids replace PIDs. Recorded Full-Build evidence remains the authority for historical execution.";
