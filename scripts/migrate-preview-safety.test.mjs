import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const migrateScript = fileURLToPath(new URL("./migrate.mjs", import.meta.url));

test("Vercel preview migrations skip by default even when DATABASE_URL is present", () => {
  const result = spawnSync(process.execPath, [migrateScript], {
    encoding: "utf8",
    env: {
      ...process.env,
      DATABASE_URL: "postgres://preview-guard-test.invalid/neon",
      VERCEL_ENV: "preview",
      SOLVEX_ALLOW_PREVIEW_MIGRATIONS: "",
    },
    timeout: 5000,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Vercel preview deployment.*skipping database migrations/);
});
