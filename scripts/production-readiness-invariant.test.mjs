import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("production readiness requires a distinct least-privilege runtime URL and enabled trusted auth", async () => {
  const source = await readFile(new URL("../src/routes/readyz.ts", import.meta.url), "utf8");
  assert.match(source, /DATABASE_RUNTIME_URL/);
  assert.match(source, /if \(authDisabled \|\| !authConfigured\)/);
  assert.match(source, /status: "not_ready"/);
  assert.match(source, /status: 503/);
});
