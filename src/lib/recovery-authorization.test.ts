import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { authorizeRecoveryDrill } from "./recovery-authorization.ts";

describe("authorizeRecoveryDrill", () => {
  it("fails closed in production when no operator allowlist is configured", () => {
    const result = authorizeRecoveryDrill("user-1", { production: true, recoveryTenantId: "tenant-1" });
    assert.equal(result.allowed, false);
  });

  it("rejects a signed-in user who is not an explicitly authorized operator", () => {
    const result = authorizeRecoveryDrill("user-2", {
      production: true,
      operatorUserIds: "user-1",
      recoveryTenantId: "tenant-1",
    });
    assert.equal(result.allowed, false);
  });

  it("requires a fixed existing tenant id in production", () => {
    const result = authorizeRecoveryDrill("user-1", {
      production: true,
      operatorUserIds: " user-1 , user-3 ",
    });
    assert.equal(result.allowed, false);
  });

  it("authorizes an allowlisted operator only with a configured tenant", () => {
    assert.deepEqual(
      authorizeRecoveryDrill("user-1", {
        production: true,
        operatorUserIds: " user-1 , user-3 ",
        recoveryTenantId: " tenant-ops ",
      }),
      { allowed: true, tenantId: "tenant-ops" },
    );
  });

  it("rejects missing user identity even outside production", () => {
    assert.equal(authorizeRecoveryDrill(" ", { production: false }).allowed, false);
  });
});
