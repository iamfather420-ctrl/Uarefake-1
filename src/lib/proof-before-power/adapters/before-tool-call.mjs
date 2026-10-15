// @ts-nocheck -- upstream plain-JS module; runtime regression tests cover this boundary.
import { compileIntent, evaluate, rewriteSafe, POLICY } from "../engine/proof-engine.mjs";
const RESERVED = ["auth", "host", "tenant", "environment", "productionGrant", "checkpoint", "inverseDefined", "targetIds", "targetCount"];
export function beforeToolCall(call, ctx = {}) {
 const rejected = RESERVED.filter((key) => call?.[key] != null);
 const action = compileIntent(call?.input || call?.name || "", { operation: call?.name, ...(ctx.host || {}), auth: ctx.auth || null });
 const proof = evaluate(action, ctx.policy || POLICY, ctx.now || Date.now());
 if (rejected.length || proof.decision !== "ALLOW") return { proceed: false, action: null, proof: { ...proof, decision: "REFUSE" }, rejected, safeRewrite: rewriteSafe(action) };
 return { proceed: true, action, proof, rejected: [] };
}
export function runGatedTool(call, ctx, runner) { const gate = beforeToolCall(call, ctx); if (!gate.proceed || typeof runner !== "function") return { ran: false, failClosed: gate.proceed, gate }; return { ran: true, result: runner(gate.action), gate }; }
