/**
 * Daisy native system tools.
 * These tool adapters are intentionally blocked until real implementations
 * and independently verifiable results are connected. Never synthesize state.
 */
import { PermissionKernel } from '../permissions/PermissionKernel.ts';

export type ToolId = 'fs_list' | 'proc_status' | 'mem_summary' | 'audit_tail' | 'node_ping';

export class SystemTools {
  private permissions: PermissionKernel;
  constructor(permissions: PermissionKernel) {
    this.permissions = permissions;
  }

  invoke(subject: string, tool: ToolId, _args: Record<string, unknown> = {}): {
    ok: boolean;
    tool: ToolId;
    result: unknown;
    message: string;
  } {
    const grant = this.permissions.request(subject, `tool:${tool}`, 'execute');
    if (!grant.granted) {
      return { ok: false, tool, result: null, message: grant.reason };
    }
    return {
      ok: false,
      tool,
      result: null,
      message: 'BLOCKED: no real implementation is registered for this tool',
    };
  }
}
