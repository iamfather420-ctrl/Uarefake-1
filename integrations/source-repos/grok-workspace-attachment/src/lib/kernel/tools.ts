import { requestPermission, permissionLog, type Subject, type ToolId } from "./permissions";
import { useKernelStore } from "./store";
import { KERNEL_HONESTY } from "./runtime";

export type ToolResult = {
  ok: boolean;
  tool: ToolId;
  message: string;
  result: unknown;
  needsApproval?: boolean;
};

function refused(tool: ToolId, message: string, needsApproval?: boolean): ToolResult {
  return { ok: false, tool, message, result: null, needsApproval };
}

function execute(tool: ToolId, args: { id?: string }): ToolResult | Promise<ToolResult> {
  const store = useKernelStore.getState();
  switch (tool) {
    case "node_ping": {
      const snap = store.snapshot();
      return {
        ok: true,
        tool,
        message: snap.phase === "running" ? "ok" : `kernel ${snap.phase}`,
        result: { honesty: KERNEL_HONESTY, kernel: snap, activation: store.activation() },
      };
    }
    case "grid_status": {
      const snap = store.snapshot();
      return {
        ok: true,
        tool,
        message: "ok",
        result: {
          total: snap.nodes.total,
          online: snap.nodes.online,
          external: snap.nodes.external,
          configured: snap.nodes.configured,
          prohibited: snap.nodes.prohibited,
          nodes: store.nodes.map((n) => ({
            id: n.id,
            state: n.state,
            generation: n.generation,
            port: n.port,
          })),
        },
      };
    }
    case "audit_tail":
      return {
        ok: true,
        tool,
        message: "ok",
        result: { grants: permissionLog().slice(0, 20), bus: store.bus.slice(0, 20) },
      };
    case "node_diagnostic": {
      const id = args.id;
      if (!id) return refused(tool, "id required");
      const r = store.diagnosticNode(id);
      return { ok: r.ok, tool, message: r.message, result: { id } };
    }
    case "node_reboot": {
      const id = args.id;
      if (!id) return refused(tool, "id required");
      return store.rebootNode(id).then((r) => ({ ok: r.ok, tool, message: r.message, result: { id } }));
    }
    default:
      return refused(tool, "unknown tool");
  }
}

export async function invokeToolAsync(
  subject: Subject,
  tool: ToolId,
  args: { id?: string } = {},
  approvedByOperator = false,
): Promise<ToolResult> {
  const grant = requestPermission(subject, tool, approvedByOperator);
  if (!grant.granted) {
    return refused(tool, grant.reason, subject === "daisy" && tool === "node_reboot");
  }
  return execute(tool, args);
}
