import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(
  new URL("../migrations/0007_hmac_signed_tenant_context.sql", import.meta.url),
  "utf8",
);
const issuer = await readFile(
  new URL("../src/lib/auth/signed-tenant-context.server.ts", import.meta.url),
  "utf8",
);

test("SQL tenant-context verifier uses HMAC-SHA-256 over the encoded claims", () => {
  assert.match(migration, /public\.hmac\(convert_to\(encoded_claims, 'UTF8'\), convert_to\(signing_secret, 'UTF8'\), 'sha256'\)/);
  assert.doesNotMatch(migration, /public\.digest\(/);
  assert.match(migration, /supplied_signature !~ '\^\[0-9a-f\]\{64\}\$'/);
  assert.match(migration, /REPLACE FUNCTION solvex_private\.current_claims\(\)/);
});

test("server issuer and SQL verifier agree on the wire format and algorithm", () => {
  assert.match(issuer, /createHmac\("sha256", signingSecret\)/);
  assert.match(issuer, /\.update\(encodedClaims, "utf8"\)/);
  assert.match(issuer, /\.digest\("hex"\)/);
  assert.match(issuer, /toString\(\s*"base64"/);
  assert.match(issuer, /tenant_id/);
});
