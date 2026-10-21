import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  SOLVEX_LIFECYCLE_STATES,
  SolvexLifecycleError,
  allowedLifecycleTransitions,
  canTransitionLifecycle,
  transitionLifecycle,
} from "./solvex-governance-lifecycle.ts";

const humanAuthorization = {
  actor: "authorized-operator",
  actorType: "human" as const,
  authorizationId: "auth-test-001",
  authorizedAt: "2026-10-21T00:00:00.000Z",
};
const validContext = {
  reason: "test evidence",
  authorization: humanAuthorization,
  execution: { executionId: "exec-test-001", authorizationId: "auth-test-001" },
  verification: { verified: true as const, evidenceRef: "test://verification/001" },
};

describe("SOLVEX governance lifecycle", () => {
  it("defines the 12 documented lifecycle states", () => {
    assert.equal(SOLVEX_LIFECYCLE_STATES.length, 12);
    assert.equal(new Set(SOLVEX_LIFECYCLE_STATES).size, 12);
  });

  it("has a transition table for every state and rejects every undeclared edge", () => {
    for (const from of SOLVEX_LIFECYCLE_STATES) {
      assert.ok(Array.isArray(allowedLifecycleTransitions(from)));
      for (const to of SOLVEX_LIFECYCLE_STATES) {
        assert.equal(
          canTransitionLifecycle(from, to),
          allowedLifecycleTransitions(from).includes(to),
          `transition table mismatch for ${from} -> ${to}`,
        );
        if (!canTransitionLifecycle(from, to)) {
          assert.throws(() => transitionLifecycle(from, to, validContext), SolvexLifecycleError);
        }
      }
    }
  });

  it("accepts the authorized happy path only when each boundary has evidence", () => {
    assert.equal(transitionLifecycle("PROPOSED", "REVIEWED").to, "REVIEWED");
    assert.equal(transitionLifecycle("REVIEWED", "AUTHORIZED", { authorization: humanAuthorization }).to, "AUTHORIZED");
    assert.equal(transitionLifecycle("AUTHORIZED", "RUNNING", {
      authorization: humanAuthorization,
      execution: validContext.execution,
    }).to, "RUNNING");
    assert.equal(transitionLifecycle("RUNNING", "VALIDATING").to, "VALIDATING");
    assert.equal(transitionLifecycle("VALIDATING", "COMPLETED", { verification: validContext.verification }).to, "COMPLETED");
  });

  it("fails closed when authorization is absent or not human", () => {
    assert.throws(() => transitionLifecycle("REVIEWED", "AUTHORIZED"), /AUTHORIZATION_REQUIRED/);
    assert.throws(() => transitionLifecycle("REVIEWED", "AUTHORIZED", {
      authorization: { ...humanAuthorization, actorType: "human" as const, actor: " " },
    }), /AUTHORIZATION_REQUIRED/);
  });

  it("fails closed when execution does not reference the same authorization", () => {
    assert.throws(() => transitionLifecycle("AUTHORIZED", "RUNNING", {
      authorization: humanAuthorization,
      execution: { executionId: "exec-test-001", authorizationId: "different-auth" },
    }), /EXECUTION_AUTHORIZATION_MISMATCH/);
    assert.throws(() => transitionLifecycle("AUTHORIZED", "RUNNING"), /EXECUTION_AUTHORIZATION_MISMATCH/);
  });

  it("does not mark work completed without positive verification evidence", () => {
    assert.throws(() => transitionLifecycle("VALIDATING", "COMPLETED"), /VERIFICATION_REQUIRED/);
    assert.throws(() => transitionLifecycle("VALIDATING", "COMPLETED", {
      verification: { verified: true, evidenceRef: " " },
    }), /VERIFICATION_REQUIRED/);
  });

  it("requires a reason for adverse, blocked, cancelled, review, and recovery states", () => {
    const cases = [
      ["PROPOSED", "REJECTED"],
      ["REVIEWED", "BLOCKED"],
      ["RUNNING", "FAILED"],
      ["REVIEWED", "CANCELLED"],
      ["PROPOSED", "NEEDS_REVIEW"],
      ["FAILED", "RECOVERY_REQUIRED"],
    ] as const;
    for (const [from, to] of cases) {
      assert.throws(() => transitionLifecycle(from, to), /REASON_REQUIRED/);
      assert.equal(transitionLifecycle(from, to, { reason: "recorded test reason" }).to, to);
    }
  });

  it("keeps terminal states terminal", () => {
    for (const terminal of ["COMPLETED", "REJECTED", "CANCELLED"] as const) {
      for (const next of SOLVEX_LIFECYCLE_STATES) {
        assert.equal(canTransitionLifecycle(terminal, next), false);
      }
    }
  });
});
