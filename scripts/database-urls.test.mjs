import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveMigrationDatabaseUrl,
  resolveRuntimeDatabaseUrl,
} from "./database-urls.mjs";

test("runtime database prefers the least-privilege app URL", () => {
  assert.equal(
    resolveRuntimeDatabaseUrl({
      APP_DATABASE_URL: " postgres://runtime ",
      DATABASE_URL: "postgres://owner",
    }),
    "postgres://runtime",
  );
});

test("runtime database falls back to DATABASE_URL during credential rollout", () => {
  assert.equal(
    resolveRuntimeDatabaseUrl({ APP_DATABASE_URL: "  ", DATABASE_URL: "postgres://legacy" }),
    "postgres://legacy",
  );
});

test("runtime database is unset when no non-empty URL exists", () => {
  assert.equal(resolveRuntimeDatabaseUrl({ APP_DATABASE_URL: " ", DATABASE_URL: "" }), undefined);
});

test("migration database prefers the separate migration credential", () => {
  assert.equal(
    resolveMigrationDatabaseUrl({
      MIGRATION_DATABASE_URL: "postgres://migrator",
      DATABASE_URL: "postgres://owner",
      APP_DATABASE_URL: "postgres://runtime",
    }),
    "postgres://migrator",
  );
});

test("migration database preserves existing deployments using DATABASE_URL", () => {
  assert.equal(
    resolveMigrationDatabaseUrl({ DATABASE_URL: "postgres://legacy" }),
    "postgres://legacy",
  );
});

test("migration database is unset when no non-empty URL exists", () => {
  assert.equal(
    resolveMigrationDatabaseUrl({ MIGRATION_DATABASE_URL: " ", DATABASE_URL: undefined }),
    undefined,
  );
});
