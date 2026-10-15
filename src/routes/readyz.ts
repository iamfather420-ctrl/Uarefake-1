import { createFileRoute } from "@tanstack/react-router";

/**
 * Readiness is stricter than liveness. Production traffic is not ready until
 * the real database and explicit per-deployment auth configuration are present
 * and the database can answer a query.
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
            const { authConfigured } = await import("@/lib/auth/server");
            if (!authConfigured) {
              throw new Error("production authentication is not configured");
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
