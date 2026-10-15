import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  POLICY,
  sha256,
  compileIntent,
  signAuthorization,
  evaluate,
  rewriteSafe,
  buildReceipt,
  verifyReceipt,
} from "./engine.ts";
import { daisyAct } from "./daisy.ts";
import { beforeToolCall } from "./gate.ts";
import { judgeScorecard } from "./scorecard.ts";

test("PBP-1 SHA-256 matches NIST abc", () => {
  const nist = createHash("sha256").update("abc").digest("hex");
  assert.equal(sha256("abc"), nist);
  assert.equal(
    sha256("abc"),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("PBP-1 unsafe refuses, bounded allows, tamper fails closed", () => {
  const now = 1_700_000_000_000;
  const unsafe = compileIntent("Update all production account statuses to suspended.");
  const refused = evaluate(unsafe, POLICY, now);
  assert.equal(refused.decision, "REFUSE");
  for (const id of ["ENV_SAFE", "BLAST_RADIUS", "REVERSIBLE", "AUTH_PRESENT", "AUTH_BINDS"]) {
    assert.equal(refused.obligations.find((o) => o.id === id)?.result, "SAT", id);
  }
  assert.ok(refused.counterexamples.length >= 5);

  const rewritten = rewriteSafe(unsafe);
  const commitment = evaluate({ ...rewritten, auth: null }, POLICY, now).commitment;
  const auth = signAuthorization({ commitment, issuedAt: now });
  const allowedAction = { ...rewritten, auth };
  const allowed = evaluate(allowedAction, POLICY, now);
  assert.equal(allowed.decision, "ALLOW");
  assert.ok(allowed.obligations.every((o) => o.result === "UNSAT"));

  const forged = evaluate(
    { ...allowedAction, auth: { ...auth, token: "jit.forged" } },
    POLICY,
    now,
  );
  assert.equal(forged.obligations.find((o) => o.id === "AUTH_PRESENT")?.result, "SAT");
  const grant = evaluate(
    { ...allowedAction, environment: "production", productionGrant: true },
    POLICY,
    now,
  );
  assert.equal(grant.decision, "REFUSE");
  const stolen = evaluate(
    { ...allowedAction, auth: { ...auth, commitment: "0".repeat(64) } },
    POLICY,
    now,
  );
  assert.equal(stolen.decision, "REFUSE");
  const stale = evaluate(allowedAction, POLICY, now + POLICY.jitWindowMs + 1);
  assert.equal(stale.obligations.find((o) => o.id === "JIT_FRESH")?.result, "SAT");

  const receipt = buildReceipt({
    action: allowedAction,
    proof: allowed,
    execution: { status: "APPLIED", checkpoint: "ckpt_demo_014" },
    recovery: { status: "ROLLED_BACK" },
  });
  assert.equal(verifyReceipt(receipt).ok, true);
  assert.equal(verifyReceipt({ ...receipt, decision: "ALLOW_EVERYTHING" }).ok, false);

  const samples: number[] = [];
  for (let i = 0; i < 200; i++) samples.push(evaluate(allowedAction, POLICY, now).elapsedMs);
  const max = Math.max(...samples);
  assert.ok(max < 25, `prove path exceeded 25ms budget: ${max}`);
});

test("PBP-1 Daisy proposes only; scorecard 8/8", () => {
  const unsafe = daisyAct(
    "Update all production account statuses to suspended.",
    {},
    () => ({ status: "APPLIED" }),
  );
  assert.equal(unsafe.toolRan, false);
  const smuggled = beforeToolCall({
    name: "ACCOUNT_STATUS_UPDATE",
    input: "status",
    productionGrant: true,
  });
  assert.equal(smuggled.proceed, false);
  const card = judgeScorecard();
  assert.equal(card.passed, card.total);
  assert.equal(card.total, 8);
});
