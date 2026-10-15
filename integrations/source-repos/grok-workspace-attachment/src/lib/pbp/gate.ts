/**
 * Drop-in gate for agent tool calls.
 * The agent may propose. Authority fields and the runner belong to the host.
 */
import {
  compileIntent,
  evaluate,
  rewriteSafe,
  POLICY,
  type Action,
  type Policy,
  type Proof,
  type Authorization,
  type IntentOverrides,
} from "./engine";

const AGENT_AUTHORITY = [
  "overrides",
  "host",
  "auth",
  "productionGrant",
  "checkpoint",
  "inverseDefined",
  "tenant",
  "environment",
  "targetIds",
  "targetCount",
] as const;

export type ToolCall = {
  name?: string;
  input?: string;
  [key: string]: unknown;
};

export type GateCtx = {
  policy?: Policy;
  now?: number;
  auth?: Authorization | null;
  host?: IntentOverrides;
};

export type GateResult = {
  proceed: boolean;
  gateMs: number;
  proof: Proof;
  safeRewrite?: Action;
  action?: Action;
  rejected?: string[];
  message: string;
};

export function beforeToolCall(toolCall: ToolCall, ctx: GateCtx = {}): GateResult {
  const started = Date.now();
  const smuggled = AGENT_AUTHORITY.filter((key) => toolCall?.[key] != null);
  if (smuggled.length) {
    const action = compileIntent(String(toolCall.input || toolCall.name || ""));
    const proof = evaluate(action, ctx.policy || POLICY, ctx.now || Date.now());
    return {
      proceed: false,
      gateMs: Date.now() - started,
      proof: {
        ...proof,
        decision: "REFUSE",
        meaning: "Agent-supplied authority was rejected.",
      },
      safeRewrite: rewriteSafe(action),
      rejected: smuggled,
      message: `Agent-supplied authority rejected: ${smuggled.join(", ")}. No tool ran.`,
    };
  }
  const action = compileIntent(toolCall.input || toolCall.name || "", {
    operation: toolCall.name,
    ...(ctx.host || {}),
    auth: ctx.auth || null,
  });
  const proof = evaluate(action, ctx.policy || POLICY, ctx.now || Date.now());
  const gateMs = Date.now() - started;
  if (proof.decision !== "ALLOW") {
    return {
      proceed: false,
      gateMs,
      proof,
      safeRewrite: rewriteSafe(action),
      message: "Refused. A countermodel exists. No tool ran.",
    };
  }
  return {
    proceed: true,
    gateMs,
    proof,
    action,
    message: "Obligations hold. The host may invoke the runner.",
  };
}

export function runGatedTool<T>(
  toolCall: ToolCall,
  ctx: GateCtx,
  runner?: (action: Action) => T,
) {
  const gate = beforeToolCall(toolCall, ctx);
  if (!gate.proceed || typeof runner !== "function") {
    return { ran: false, failClosed: gate.proceed === true, gate };
  }
  return { ran: true, result: runner(gate.action as Action), gate };
}
