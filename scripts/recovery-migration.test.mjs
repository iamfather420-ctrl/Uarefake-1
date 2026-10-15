import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { PGlite } from "@electric-sql/pglite";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const recoveryMigration = await readFile(
  join(root, "migrations", "0003_recovery.sql"),
  "utf8",
);

test("recovery migration upgrades legacy tables missing target_id before indexing", async () => {
  const db = new PGlite();
  try {
    // Model the schema that caused the production failure: these tables exist
    // from an earlier release, but do not yet have target_id.
    await db.exec(`
      CREATE TABLE checkpoints (
        id text PRIMARY KEY,
        state_json text NOT NULL,
        state_hash text NOT NULL,
        created_at bigint NOT NULL
      );
      CREATE TABLE failures (
        id text PRIMARY KEY,
        checkpoint_id text NOT NULL,
        failure_code text NOT NULL,
        failure_json text NOT NULL,
        created_at bigint NOT NULL
      );
      CREATE TABLE rollback_records (
        id text PRIMARY KEY,
        checkpoint_id text NOT NULL,
        failure_id text NOT NULL,
        status text NOT NULL,
        restored_hash text NOT NULL,
        evidence_hash text NOT NULL,
        created_at bigint NOT NULL
      );
    `);

    await db.exec(recoveryMigration);

    for (const table of ["checkpoints", "failures", "rollback_records"]) {
      const result = await db.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1 AND column_name = 'target_id'",
        [table],
      );
      assert.equal(result.rows.length, 1, `${table}.target_id must be added to legacy schema`);
    }

    const indexes = await db.query(
      "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname = ANY($1)",
      [[
        "checkpoints_target_idx",
        "failures_target_idx",
        "rollbacks_target_idx",
      ]],
    );
    assert.equal(indexes.rows.length, 3, "target_id indexes must be created after compatibility columns");
  } finally {
    await db.close();
  }
});

test("recovery migration is safe to reapply after its first successful run", async () => {
  const db = new PGlite();
  try {
    await db.exec(recoveryMigration);
    await db.exec(recoveryMigration);
    const indexes = await db.query(
      "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname = ANY($1)",
      [[
        "checkpoints_target_idx",
        "failures_target_idx",
        "rollbacks_target_idx",
      ]],
    );
    assert.equal(indexes.rows.length, 3);
  } finally {
    await db.close();
  }
});
