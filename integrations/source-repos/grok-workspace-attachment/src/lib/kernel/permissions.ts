/**
 * Fail-closed, table-driven policy. Daisy may read/probe.
 * Mutating tools require explicit operator approval.
 */
export type Subject = "anonymous" | "operator" | "daisy";
export type ToolId =
  | "grid_status"
  | "node_ping"
  | "audit_tail"
  | "node_diagnostic"
  | "node_reboot";

export const TOOL_RISK: Record<ToolId, "read" | "probe" | "mutate"> = {
  grid_status: "read",
  node_ping: "read",
  audit_tail: "read",
  node_diagnostic: "probe",
  node_reboot: "mutate",
};

export const TOOL_DOCS: Record<ToolId, string> = {
  grid_status: "Live status of the 54 in-process pipeline nodes.",
  node_ping: "Kernel phase and honesty banner.",
  audit_tail: "Most recent in-memory bus events.",
  node_diagnostic: "In-process health probe. args: node id.",
  node_reboot: "Replace in-process generation. Needs operator approval. args: node id.",
};

export type PermissionGrant = {
  subject: string;
  resource: string;
  action: "execute";
  granted: boolean;
  reason: string;
  ts: number;
};

const log: PermissionGrant[] = [];

export function requestPermission(
  subject: Subject,
  tool: ToolId,
  approvedByOperator = false,
): PermissionGrant {
  const risk = TOOL_RISK[tool];
  let granted = false;
  let reason = "Fail-closed: no policy matches";
  if (subject === "operator") {
    granted = true;
    reason = "operator: authenticated hull visitor, all tools allowed";
  } else if (subject === "daisy") {
    if (risk === "read" || risk === "probe") {
      granted = true;
      reason = `daisy: ${risk} tools allowed`;
    } else if (approvedByOperator) {
      granted = true;
      reason = "daisy: mutating tool allowed with explicit operator approval";
    } else {
      reason = "daisy: mutating tool requires operator approval";
    }
  } else {
    reason = "anonymous: authentication required";
  }
  const grant: PermissionGrant = {
    subject,
    resource: `tool:${tool}`,
    action: "execute",
    granted,
    reason,
    ts: Date.now(),
  };
  log.unshift(grant);
  if (log.length > 80) log.length = 80;
  return grant;
}

export function permissionLog() {
  return [...log];
}
