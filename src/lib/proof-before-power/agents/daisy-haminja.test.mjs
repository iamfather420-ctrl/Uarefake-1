import assert from "node:assert/strict";
import { daisyAct } from "./daisy-haminja.mjs";
import { runGatedTool } from "../adapters/before-tool-call.mjs";
import { evaluate, rewriteSafe, signAuthorization, POLICY } from "../engine/proof-engine.mjs";

const unsafe = daisyAct("Update all production account statuses to suspended.", {}, () => ({ status: "APPLIED" }));
assert.equal(unsafe.toolRan, false);
assert.equal(unsafe.gate.proceed, false);

const now = Date.now();
const safe = rewriteSafe({
  intent: "safe",
  operation: "ACCOUNT_STATUS_UPDATE",
  tenant: POLICY.demoTenant,
  environment: "sandbox",
  targetCount: 1,
  targetIds: ["acct_demo_014"],
  productionGrant: false,
  checkpoint: true,
  inverseDefined: true,
  auth: null,
});
const commitment = evaluate({ ...safe, auth: null }, POLICY, now).commitment;
const auth = signAuthorization({ actor: "judge.demo", commitment, issuedAt: now });
const runner = () => ({ status: "APPLIED" });
const context = {
  auth,
  now,
  host: {
    checkpoint: true,
    inverseDefined: true,
    tenant: POLICY.demoTenant,
    environment: "sandbox",
    targetCount: 1,
    targetIds: ["acct_demo_014"],
  },
};

// A deterministic demo token is not trusted authorization.
const deniedDemoToken = daisyAct(
  "Update account acct_demo_014 status in the demo tenant sandbox, with checkpoint and inverse.",
  context,
  runner,
);
assert.equal(deniedDemoToken.toolRan, false);
assert.equal(deniedDemoToken.gate.proceed, false);
assert.equal(deniedDemoToken.gate.proof.trustBoundary, "production-authorization-not-wired");

// Caller-supplied flags cannot manufacture the missing trusted server boundary.
const forgedContext = daisyAct(
  "Update account acct_demo_014 status in the demo tenant sandbox, with checkpoint and inverse.",
  {
    ...context,
    host: {
      ...context.host,
      authorizationVerified: true,
      authorizationIssuer: "attacker-controlled",
      tenantBound: true,
    },
  },
  () => { throw new Error("Runner must never be invoked before trusted auth is wired."); },
);
assert.equal(forgedContext.toolRan, false);
assert.equal(forgedContext.gate.proceed, false);
assert.equal(forgedContext.gate.proof.trustBoundary, "production-authorization-not-wired");

const noRunner = daisyAct(
  "Update account acct_demo_014 status in the demo tenant sandbox, with checkpoint and inverse.",
  {
    ...context,
    host: {
      ...context.host,
      authorizationVerified: true,
      authorizationIssuer: "test-idp",
      tenantBound: true,
    },
  },
);
assert.equal(noRunner.toolRan, false);
assert.equal(noRunner.failClosed, true);

const gatedUnsafe = runGatedTool(
  { name: "ACCOUNT_STATUS_UPDATE", input: "Update all production account statuses to suspended." },
  {},
  () => { throw new Error("Runner must never be invoked for a refused action."); },
);
assert.equal(gatedUnsafe.ran, false);
assert.equal(gatedUnsafe.failClosed, true);
assert.equal(gatedUnsafe.gate.proceed, false);

const gatedMissingRunner = runGatedTool(
  { name: "ACCOUNT_STATUS_UPDATE", input: "Update account status in sandbox." },
  { host: { authorizationVerified: true, authorizationIssuer: "test-idp", tenantBound: true } },
);
assert.equal(gatedMissingRunner.ran, false);
assert.equal(gatedMissingRunner.failClosed, true);
assert.equal(gatedMissingRunner.gate.proof.trustBoundary, "production-authorization-not-wired");

console.log("Daisy Haminja gate tests passed; caller-supplied auth claims and demo tokens cannot invoke tools.");
