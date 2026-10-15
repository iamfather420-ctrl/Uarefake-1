import { beforeToolCall } from "../adapters/before-tool-call.mjs";
import { compileIntent } from "../engine/proof-engine.mjs";

export const DAISY = {
  name: "Daisy Haminja",
  role: "proposer",
  rule: "I may propose a tool call; I may not grant authority or grade the proof.",
};

/** @param {string} intent */
export function proposeToolCall(intent) {
  const action = compileIntent(intent);
  return { caller: "daisy.haminja", name: action.operation, input: intent };
}

/**
 * @param {string} intent
 * @param {Record<string, any>} [ctx]
 * @param {((action: Record<string, any>) => unknown)} [toolRunner]
 * @returns {Record<string, any>}
 */
export function daisyAct(intent, ctx = {}, toolRunner) {
  const toolCall = proposeToolCall(intent);
  const gate = beforeToolCall(toolCall, {
    policy: ctx.policy,
    now: ctx.now,
    auth: ctx.auth || null,
    host: ctx.host,
  });
  if (!gate.proceed) {
    return { speaker: DAISY.name, toolCall, gate, toolRan: false, result: null };
  }
  if (typeof toolRunner !== "function") {
    return { speaker: DAISY.name, toolCall, gate, toolRan: false, failClosed: true, result: null };
  }
  const result = toolRunner(gate.action);
  return { speaker: DAISY.name, toolCall, gate, toolRan: true, result };
}
