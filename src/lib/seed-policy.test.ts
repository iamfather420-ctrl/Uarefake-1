import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldSeedDemoData } from "./seed-policy.ts";

describe("shouldSeedDemoData", () => {
  it("allows local PGlite fixtures outside production", () => {
    assert.equal(shouldSeedDemoData("pglite", "development"), true);
  });

  it("does not seed Neon even in development", () => {
    assert.equal(shouldSeedDemoData("neon", "development"), false);
  });

  it("does not seed any backend in production", () => {
    assert.equal(shouldSeedDemoData("neon", "production"), false);
    assert.equal(shouldSeedDemoData("pglite", "production"), false);
  });
});
