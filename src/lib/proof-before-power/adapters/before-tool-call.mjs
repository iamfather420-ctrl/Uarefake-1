import { compileIntent, evaluate, rewriteSafe, POLICY } from "../engine/proof-engine.mjs";

const RESERVED = ["auth", "host", "tenant", "environment", "productionGrant", "checkpoint", "inverseDefined", "targetIds", "targetCount"];

/**
 * Advisory policy preflight only. This integration intentionally refuses every
 * tool invocation until a trusted server-only identity/tenant authorization
 * adapter is wired and independently verified. Values supplied through ctx
 * are caller-controlled and MUST NOT be treated as proof of authorization.
 *
 * @param {Record<string, any>} call
 * @param {Record<string, any>} [ctx]
 * @returns {Record<string, any>}
 */
export function beforeToolCall(call, ctx = {}) {
  const rejected = RESERVED.filter((key) => call?.[key] != null);
  const host = ctx.host || {};
  const action = compileIntent(call?.input || call?.name || "", {
    operation: call?.name,
    ...host,
    auth: ctx.auth || null,
  });
  const proof = evaluate(action, ctx.policy || POLICY, ctx.now || Date.now());

  // No caller-supplied field can establish the trusted server authorization
  // boundary. Keep the adapter non-executing until production auth is wired.
  return {
    proceed: false,
    action: null,
    proof: {
      ...proof,
      decision: "REFUSE",
      trustBoundary: "production-authorization-not-wired",
    },
    rejected,
    safeRewrite: rewriteSafe(action),
  };
}

/**
 * @param {object} call
 * @param {Record<string, any>} ctx
 * @param {((action: Record<string, any>) => unknown)} [runner]
 * @returns {Record<string, any>}
 */
export function runGatedTool(call, ctx, runner) {
  const gate = beforeToolCall(call, ctx);
  if (!gate.proceed || typeof runner !== "function") {
    return { ran: false, failClosed: true, gate };
  }
  return { ran: true, result: runner(gate.action), gate };
}
