import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { issueTenantContextToken, type TenantContextClaims } from "./tenant-context-token.ts";

const secret = "test-only-secret-with-at-least-32-characters";
const now = Date.now();
const claims: TenantContextClaims = {
  user_id: "user-test-1",
  tenant_id: "tenant-test-1",
  email: "test@example.invalid",
  role: "CUSTOMER",
  issued_at: now,
  expires_at: now + 300_000,
};

test("issuer signs the exact encoded claims with HMAC-SHA-256", () => {
  const token = issueTenantContextToken(claims, secret);
  const [encoded, signature, extra] = token.split(".");
  assert.ok(encoded);
  assert.equal(extra, undefined);
  assert.equal(
    signature,
    createHmac("sha256", secret).update(encoded, "utf8").digest("hex"),
  );
  assert.deepEqual(JSON.parse(Buffer.from(encoded, "base64").toString("utf8")), claims);
});

test("issuer rejects short secrets and invalid or overlong claims", () => {
  assert.throws(() => issueTenantContextToken(claims, "too-short"));
  assert.throws(() =>
    issueTenantContextToken({ ...claims, tenant_id: " " }, secret),
  );
  assert.throws(() =>
    issueTenantContextToken({ ...claims, expires_at: now + 900_001 }, secret),
  );
  assert.throws(() =>
    issueTenantContextToken({ ...claims, issued_at: now + 60_000 }, secret),
  );
});

test("SQL verifier uses the same HMAC-SHA-256 message and key contract", async () => {
  const migration = await readFile(
    new URL("../../../migrations/0007_hmac_tenant_context.sql", import.meta.url),
    "utf8",
  );
  assert.match(
    migration,
    /public\.hmac\(convert_to\(encoded_claims, 'UTF8'\), convert_to\(signing_secret, 'UTF8'\), 'sha256'\)/,
  );
  assert.match(migration, /supplied_signature !~ '\^\[0-9a-f\]\{64\}\$'/);
  assert.doesNotMatch(migration, /digest\(convert_to\(encoded_claims \|\| ':' \|\| signing_secret/);
});
