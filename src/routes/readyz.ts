import { createFileRoute } from "@tanstack/react-router";

/**
 * Readiness is stricter than liveness. Production is ready only when the
 * privileged migration/auth connection and separate least-privilege runtime
 * connection are configured, trusted auth is enabled, and the DB answers using
 * the exact expected runtime login/effective-role pair.
 */
export const Route = createFileRoute("/readyz")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const isProduction = process.env.VERCEL_ENV === "production";
          if (isProduction) {
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

          if (isProduction) {
            const { isLeastPrivilegeRuntimeRole } = await import("@/lib/db-runtime-security");
            const roles = await sql.query(
              `SELECT
                session_user::text AS "session_user",
                current_user::text AS "current_user",
                session_role.rolcanlogin AS session_can_login,
                session_role.rolsuper AS session_is_superuser,
                session_role.rolbypassrls AS session_bypasses_rls,
                session_role.rolcreatedb AS session_can_create_database,
                session_role.rolcreaterole AS session_can_create_roles,
                pg_has_role(session_user, 'neon_superuser', 'MEMBER') AS session_is_neon_superuser_member,
                current_role.rolcanlogin AS current_can_login,
                current_role.rolsuper AS current_is_superuser,
                current_role.rolbypassrls AS current_bypasses_rls,
                current_role.rolcreatedb AS current_can_create_database,
                current_role.rolcreaterole AS current_can_create_roles,
                pg_has_role(current_user, 'neon_superuser', 'MEMBER') AS current_is_neon_superuser_member,
                pg_has_role(session_user, current_user, 'MEMBER') AS session_can_use_current_role
              FROM pg_roles AS session_role
              JOIN pg_roles AS current_role ON current_role.rolname = current_user
              WHERE session_role.rolname = session_user`,
            );
            if (!isLeastPrivilegeRuntimeRole(roles[0])) {
              throw new Error("Database runtime identity failed least-privilege verification");
            }
          } else {
            await sql.query("SELECT 1 AS ready");
          }

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
