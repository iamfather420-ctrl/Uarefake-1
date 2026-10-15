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

// A valid-looking deterministic demo token must not authorize an actual tool.
const deniedDemoToken = daisyAct(
  "Update account acct_demo_014 status in the demo tenant sandbox, with checkpoint and inverse.",
  context,
  runner,
);
assert.equal(deniedDemoToken.toolRan, false);
assert.equal(deniedDemoToken.gate.proceed, false);
assert.equal(deniedDemoToken.gate.proof.trustBoundary, "missing-host-verified-authorization");

// The trusted authorization context is host-owned and must not be sourced from
// user-controlled request fields. This unit test verifies the adapter boundary.
const hostVerified = daisyAct(
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
  runner,
);
assert.equal(hostVerified.toolRan, true);

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

console.log("Daisy Haminja gate tests passed; demo tokens denied, unsafe actions refused, missing runners fail closed.");
