import { create } from "zustand";
import {
  activationOf,
  diagnosticDetail,
  KERNEL_HONESTY,
  seedNodes,
  snapshot,
  type BusEvent,
  type DaisyActivation,
  type KernelNode,
  type KernelPhase,
  type KernelSnapshot,
} from "./runtime";

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

type KernelStore = {
  phase: KernelPhase;
  bootedAt: number | null;
  nodes: KernelNode[];
  bus: BusEvent[];
  lastAction: string | null;
  boot: () => Promise<void>;
  halt: () => Promise<void>;
  reboot: () => Promise<void>;
  rebootNode: (id: string) => Promise<{ ok: boolean; message: string }>;
  diagnosticNode: (id: string) => { ok: boolean; message: string };
  snapshot: () => KernelSnapshot;
  activation: () => DaisyActivation;
};

function publish(bus: BusEvent[], topic: string, detail: string): BusEvent[] {
  return [{ ts: Date.now(), topic, from: "pipeline-kernel", detail }, ...bus].slice(0, 40);
}

export const useKernelStore = create<KernelStore>((set, get) => ({
  phase: "halted",
  bootedAt: null,
  nodes: seedNodes("halted"),
  bus: [
    {
      ts: Date.now(),
      topic: "kernel",
      from: "pipeline-kernel",
      detail: KERNEL_HONESTY,
    },
  ],
  lastAction: null,

  snapshot: () => snapshot(get().phase, get().bootedAt, get().nodes),
  activation: () => activationOf(get().phase, get().nodes),

  boot: async () => {
    const { phase } = get();
    if (phase === "running" || phase === "booting") return;
    set((s) => ({
      phase: "booting",
      lastAction: "boot",
      bus: publish(s.bus, "kernel", "Boot sequence started (in-process)."),
      nodes: s.nodes.map((n) => ({
        ...n,
        state: n.id === "DN-34" ? "external" : n.id === "DN-35" ? "configured" : n.id === "DN-36" ? "prohibited" : "booting",
      })),
    }));
    const ordered = [...get().nodes];
    for (let i = 0; i < ordered.length; i += 6) {
      await wait(40);
      set((s) => ({
        nodes: s.nodes.map((n, idx) => {
          if (idx > i + 5) return n;
          if (n.id === "DN-34") return { ...n, state: "external" };
          if (n.id === "DN-35") return { ...n, state: "configured" };
          if (n.id === "DN-36") return { ...n, state: "prohibited" };
          return { ...n, state: "online" };
        }),
      }));
    }
    set((s) => ({
      phase: "running",
      bootedAt: Date.now(),
      bus: publish(s.bus, "kernel", "Boot complete. 51 in-process nodes online. Neon external. PayPal configured. Stripe prohibited."),
    }));
  },

  halt: async () => {
    if (get().phase === "halted") return;
    set((s) => ({
      phase: "halting",
      lastAction: "halt",
      bus: publish(s.bus, "kernel", "Halt sequence started."),
    }));
    await wait(180);
    set((s) => ({
      phase: "halted",
      bootedAt: null,
      nodes: s.nodes.map((n) => ({ ...n, state: "offline" })),
      bus: publish(s.bus, "kernel", "Halted. Generation table retained."),
    }));
  },

  reboot: async () => {
    await get().halt();
    await get().boot();
    set((s) => ({ lastAction: "reboot", bus: publish(s.bus, "kernel", "Full pipeline reboot complete.") }));
  },

  rebootNode: async (id: string) => {
    const { phase, nodes } = get();
    if (phase !== "running") {
      return { ok: false, message: `Pipeline kernel is ${phase}; boot required.` };
    }
    const node = nodes.find((n) => n.id === id);
    if (!node) return { ok: false, message: `Unknown node ${id}.` };
    if (node.id === "DN-34") {
      return { ok: false, message: "DN-34 Neon remains EXTERNAL_PROVIDER_REQUIRED. Fail closed." };
    }
    if (node.id === "DN-35") {
      return {
        ok: false,
        message: "DN-35 PayPal is hosted-checkout CONFIGURED. No OS child to respawn.",
      };
    }
    if (node.id === "DN-36") {
      return { ok: false, message: "DN-36 Stripe is PROHIBITED_BLOCKED. The guard stays in place." };
    }
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, state: "rebooting" } : n)),
      bus: publish(s.bus, "kernel.node", `${id}: in-process generation recycle started.`),
    }));
    await wait(220);
    let message = "";
    set((s) => {
      const next = s.nodes.map((n) => {
        if (n.id !== id) return n;
        const generation = n.generation + 541;
        message = `${id}: generation ${n.generation} → ${generation}. No OS child was killed.`;
        return { ...n, state: "online" as const, generation, restarts: n.restarts + 1 };
      });
      return {
        nodes: next,
        lastAction: `reboot:${id}`,
        bus: publish(s.bus, "kernel.node", message),
      };
    });
    return { ok: true, message };
  },

  diagnosticNode: (id: string) => {
    const { phase, nodes } = get();
    if (phase !== "running") {
      return { ok: false, message: `Pipeline kernel is ${phase}; boot required.` };
    }
    const node = nodes.find((n) => n.id === id);
    if (!node) return { ok: false, message: `Unknown node ${id}.` };
    const detail = diagnosticDetail(node);
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === id
          ? { ...n, lastDiagnostic: { at: Date.now(), ok: true, detail } }
          : n,
      ),
      lastAction: `diag:${id}`,
      bus: publish(s.bus, "kernel.node", detail),
    }));
    return { ok: true, message: detail };
  },
}));
