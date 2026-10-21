import assert from "node:assert/strict";
import { createHmac, timingSafeEqual } from "node:crypto";
import { describe, it } from "node:test";
import {
  signTenantContext,
  type TenantContextInput,
} from "./signed-tenant-context.server.ts";

const SECRET = "test-secret-with-at-least-32-characters";
const INPUT: TenantContextInput = {
  user_id: "user-123",
  tenant_id: "tenant-456",
  email: "owner@example.test",
  role: "OWNER",
};

describe("signTenantContext", () => {
  it("emits the SQL verifier's base64-claims.hex-HMAC-SHA-256 format", () => {
    const token = signTenantContext(INPUT, SECRET, 1_800_000_000_000);
    const [encodedClaims, signature, extra] = token.split(".");
    assert.ok(encodedClaims);
    assert.ok(signature);
    assert.equal(extra, undefined);

    const expected = createHmac("sha256", SECRET)
      .update(encodedClaims, "utf8")
      .digest("hex");
    const suppliedBytes = Buffer.from(signature, "hex");
    const expectedBytes = Buffer.from(expected, "hex");
    assert.equal(suppliedBytes.length, 32);
    assert.equal(expectedBytes.length, 32);
    assert.equal(timingSafeEqual(suppliedBytes, expectedBytes), true);

    const claims = JSON.parse(Buffer.from(encodedClaims, "base64").toString("utf8"));
    assert.deepEqual(claims, {
      ...INPUT,
      issued_at: 1_800_000_000_000,
      expires_at: 1_800_000_300_000,
    });
  });

  it("rejects a missing or undersized signing secret", () => {
    assert.throws(() => signTenantContext(INPUT, undefined), /at least 32/);
    assert.throws(() => signTenantContext(INPUT, "too-short"), /at least 32/);
  });

  it("rejects missing identity claims and unsupported roles", () => {
    assert.throws(
      () => signTenantContext({ ...INPUT, tenant_id: " " }, SECRET),
      /required/,
    );
    assert.throws(
      () =>
        signTenantContext(
          { ...INPUT, role: "SUPERUSER" as TenantContextInput["role"] },
          SECRET,
        ),
      /Unsupported tenant role/,
    );
  });

  it("does not accept non-integer or negative timestamps", () => {
    assert.throws(() => signTenantContext(INPUT, SECRET, -1), /safe integer/);
    assert.throws(() => signTenantContext(INPUT, SECRET, 1.5), /safe integer/);
  });

  it("changes the signature if the encoded claims are changed", () => {
    const [encodedClaims, signature] = signTenantContext(INPUT, SECRET).split(".");
    const changedClaims = Buffer.from(
      JSON.stringify({ ...INPUT, tenant_id: "other-tenant" }),
    ).toString("base64");
    const expectedForChangedClaims = createHmac("sha256", SECRET)
      .update(changedClaims, "utf8")
      .digest("hex");
    assert.notEqual(signature, expectedForChangedClaims);
    assert.notEqual(encodedClaims, changedClaims);
  });
});
