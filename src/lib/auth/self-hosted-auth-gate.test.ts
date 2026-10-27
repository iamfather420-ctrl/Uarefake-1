import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSelfHostedAuthProductionReady } from "./self-hosted-auth-gate.ts";

const COMPLETE = {
  passwordAuthEnabled: true,
  productionApproved: true,
  recoveryVerified: true,
  tenantIsolationVerified: true,
  backupRestoreVerified: true,
  runtimeDatabaseConfigured: true,
  signingSecretConfigured: true,
  canonicalBaseUrlConfigured: true,
};

describe("self-hosted authentication production gate", () => {
  it("allows production only when every independent gate is true", () => {
    assert.equal(isSelfHostedAuthProductionReady(COMPLETE), true);
  });

  it("fails closed when any one requirement is missing", () => {
    for (const key of Object.keys(COMPLETE) as Array<keyof typeof COMPLETE>) {
      assert.equal(isSelfHostedAuthProductionReady({ ...COMPLETE, [key]: false }), false, key);
    }
  });

  it("does not treat configured credentials as approval to activate production auth", () => {
    assert.equal(
      isSelfHostedAuthProductionReady({
        ...COMPLETE,
        productionApproved: false,
        recoveryVerified: false,
        tenantIsolationVerified: false,
        backupRestoreVerified: false,
      }),
      false,
    );
  });
});
