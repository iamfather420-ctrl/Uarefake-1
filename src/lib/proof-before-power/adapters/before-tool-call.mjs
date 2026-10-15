import { compileIntent, evaluate, rewriteSafe, POLICY } from "../engine/proof-engine.mjs";

const RESERVED = ["auth", "host", "tenant", "environment", "productionGrant", "checkpoint", "inverseDefined", "targetIds", "targetCount"];

/**
 * The host must supply authorization verified by a trusted server-side identity
 * provider. The demo engine's deterministic token is never sufficient to invoke
 * a tool. Callers must not construct this context from request/body fields.
 *
 * @param {object} call
 * @param {object} [ctx]
 * @returns {object}
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

  // The upstream PBP token is hash-based demo authorization, not a signature.
  // Require a host-verified identity/authorization envelope before any action.
  const trustedAuthorization =
    host.authorizationVerified === true &&
    typeof host.authorizationIssuer === "string" &&
    host.authorizationIssuer.length > 0 &&
    host.tenantBound === true;

  if (rejected.length || !trustedAuthorization || proof.decision !== "ALLOW") {
    return {
      proceed: false,
      action: null,
      proof: {
        ...proof,
        decision: "REFUSE",
        trustBoundary: trustedAuthorization ? "host-verified" : "missing-host-verified-authorization",
      },
      rejected,
      safeRewrite: rewriteSafe(action),
    };
  }

  return { proceed: true, action, proof, rejected: [] };
}

/**
 * @param {object} call
 * @param {object} ctx
 * @param {((action: object) => unknown) | undefined} runner
 * @returns {object}
 */
export function runGatedTool(call, ctx, runner) {
  const gate = beforeToolCall(call, ctx);
  if (!gate.proceed || typeof runner !== "function") {
    return { ran: false, failClosed: gate.proceed || !gate.proceed, gate };
  }
  return { ran: true, result: runner(gate.action), gate };
}
