import { createFileRoute } from "@tanstack/react-router";

/**
 * Readiness is stricter than liveness. Production is ready only when the
 * privileged migration/auth connection and separate least-privilege runtime
 * connection are configured, trusted auth is enabled, and the DB answers.
 */
export const Route = createFileRoute("/readyz")({
  server: {
    handlers: {
      GET: async () => {
        try {
          if (process.env.VERCEL_ENV === "production") {
            if (!process.env.DATABASE_URL?.trim()) {
              throw new Error("DATABASE_URL is not configured");
            }
            if (!process.env.DATABASE_RUNTIME_URL?.trim()) {
              throw new Error("DATABASE_RUNTIME_URL least-privilege runtime role is not configured");
            }
            const { authConfigured, authDisabled } = await import("@/lib/auth/server");
            if (authDisabled || !authConfigured) {
              throw new Error("trusted production authentication is not configured");
            }
          }

          const { getSql } = await import("@/lib/db");
          const sql = await getSql();
          await sql.query("SELECT 1 AS ready");
          return Response.json(
            { status: "ready" },
            { status: 200, headers: { "cache-control": "no-store" } },
          );
        } catch {
          // Do not expose secrets, connection strings, or provider internals.
          return Response.json(
            { status: "not_ready" },
            { status: 503, headers: { "cache-control": "no-store" } },
          );
        }
      },
    },
  },
});
