import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveAuthDatabaseUrl,
  resolveMigrationDatabaseUrl,
  resolveRuntimeDatabaseUrl,
} from "./database-urls.mjs";

test("Vercel runtime requires its dedicated least-privilege URL", () => {
  assert.equal(resolveRuntimeDatabaseUrl({ VERCEL: "1", DATABASE_URL: "postgres://owner" }), undefined);
});

test("runtime prefers APP_DATABASE_URL and trims whitespace", () => {
  assert.equal(resolveRuntimeDatabaseUrl({ APP_DATABASE_URL: " postgres://runtime ", DATABASE_URL: "postgres://owner" }), "postgres://runtime");
});

test("local runtime remains compatible with DATABASE_URL", () => {
  assert.equal(resolveRuntimeDatabaseUrl({ DATABASE_URL: "postgres://legacy" }), "postgres://legacy");
});

test("runtime URL is undefined when no non-empty connection exists", () => {
  assert.equal(resolveRuntimeDatabaseUrl({ APP_DATABASE_URL: " ", DATABASE_URL: "" }), undefined);
});

test("Vercel auth storage requires a dedicated auth URL", () => {
  assert.equal(resolveAuthDatabaseUrl({ VERCEL: "1", DATABASE_URL: "postgres://owner" }), undefined);
});

test("local auth storage can reuse the local database URL", () => {
  assert.equal(resolveAuthDatabaseUrl({ DATABASE_URL: "postgres://legacy" }), "postgres://legacy");
});

test("auth URL prefers a dedicated credential", () => {
  assert.equal(resolveAuthDatabaseUrl({ VERCEL: "1", AUTH_DATABASE_URL: "postgres://auth", DATABASE_URL: "postgres://owner" }), "postgres://auth");
});

test("migration URL prefers a dedicated migration credential", () => {
  assert.equal(resolveMigrationDatabaseUrl({ MIGRATION_DATABASE_URL: "postgres://migrator", DATABASE_URL: "postgres://owner", APP_DATABASE_URL: "postgres://runtime" }), "postgres://migrator");
});

test("migration URL remains compatible with legacy build environment", () => {
  assert.equal(resolveMigrationDatabaseUrl({ DATABASE_URL: "postgres://legacy" }), "postgres://legacy");
});

test("migration URL is undefined when no connection is configured", () => {
  assert.equal(resolveMigrationDatabaseUrl({ MIGRATION_DATABASE_URL: " ", DATABASE_URL: undefined }), undefined);
});
