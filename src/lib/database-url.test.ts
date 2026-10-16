import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { secureDatabaseUrl, secureRuntimeDatabaseUrl } from "./db.ts";

describe("secureRuntimeDatabaseUrl", () => {
  it("keeps preview connections out of the production role override", () => {
    const url = secureRuntimeDatabaseUrl(
      "postgresql://user:pass@example.neon.tech/neondb?sslmode=require",
      "preview",
    );
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("sslmode"), "verify-full");
    assert.equal(parsed.searchParams.has("options"), false);
  });

  it("pins production application connections to the non-login runtime role", () => {
    const url = secureRuntimeDatabaseUrl(
      "postgresql://user:pass@example.neon.tech/neondb?sslmode=require",
      "production",
    );
    const parsed = new URL(url);
    assert.equal(parsed.searchParams.get("sslmode"), "verify-full");
    assert.match(parsed.searchParams.get("options") ?? "", /-c role=solvex_app_runtime/);
  });

  it("preserves existing PostgreSQL startup options", () => {
    const url = secureRuntimeDatabaseUrl(
      "postgresql://user:pass@example.neon.tech/neondb?options=-c%20search_path%3Dpublic",
      "production",
    );
    const parsed = new URL(url);
    assert.match(parsed.searchParams.get("options") ?? "", /search_path=public/);
    assert.match(parsed.searchParams.get("options") ?? "", /role=solvex_app_runtime/);
  });

  it("normalizes legacy TLS mode without changing other URL parameters", () => {
    assert.equal(
      secureDatabaseUrl("postgresql://user:pass@example.neon.tech/neondb?sslmode=verify-ca&application_name=uarefake"),
      "postgresql://user:pass@example.neon.tech/neondb?sslmode=verify-full&application_name=uarefake",
    );
  });
});
