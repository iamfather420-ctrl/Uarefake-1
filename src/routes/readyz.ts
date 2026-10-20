import { createFileRoute } from "@tanstack/react-router";

type ProductionReadinessProbe = {
  current_role: string;
  login_role: string;
  current_role_elevated: boolean;
  login_role_elevated: boolean;
  login_inherits_neon_superuser: boolean;
  unsafe_public_table_count: number;
  migration_metadata_exposed: boolean;
  auth_context_ready: boolean;
};

/**
 * Readiness is stricter than liveness. Production is ready only when trusted
 * auth is configured, the runtime connection is forced into the non-privileged
 * application role, the login cannot bypass RLS/escalate to neon_superuser,
 * tenant RLS is enabled+forced across application tables, and signed tenant
 * context is available. Never return internal role or provider details.
 */
export const Route = createFileRoute("/readyz")({
  server: {
    handlers: {
      GET: async () => {
        const production = process.env.VERCEL_ENV === "production";
        const blockers: string[] = [];

        try {
          if (production) {
            if (!process.env.DATABASE_URL?.trim()) blockers.push("database_url_missing");
            if (!process.env.DATABASE_RUNTIME_URL?.trim()) blockers.push("runtime_database_url_missing");

            try {
              const { authConfigured, authDisabled } = await import("@/lib/auth/server");
              if (authDisabled || !authConfigured) blockers.push("trusted_auth_not_configured");
            } catch {
              blockers.push("trusted_auth_probe_failed");
            }
          }

          const { getSql } = await import("@/lib/db");
          const sql = await getSql();

          if (production) {
            const rows = await sql.query<ProductionReadinessProbe>(`
              SELECT
                current_user::text AS current_role,
                session_user::text AS login_role,
                COALESCE((
                  SELECT r.rolsuper OR r.rolcreatedb OR r.rolcreaterole
                    OR r.rolreplication OR r.rolbypassrls
                  FROM pg_roles r WHERE r.rolname = current_user
                ), true) AS current_role_elevated,
                COALESCE((
                  SELECT r.rolsuper OR r.rolcreatedb OR r.rolcreaterole
                    OR r.rolreplication OR r.rolbypassrls
                  FROM pg_roles r WHERE r.rolname = session_user
                ), true) AS login_role_elevated,
                pg_has_role(session_user, 'neon_superuser', 'MEMBER')
                  AS login_inherits_neon_superuser,
                (
                  SELECT count(*)::int
                  FROM pg_class c
                  JOIN pg_namespace n ON n.oid = c.relnamespace
                  WHERE n.nspname = 'public'
                    AND c.relkind IN ('r', 'p')
                    AND c.relname <> '_migrations'
                    AND (
                      NOT c.relrowsecurity
                      OR NOT c.relforcerowsecurity
                      OR NOT EXISTS (
                        SELECT 1 FROM pg_policies p
                        WHERE p.schemaname = n.nspname
                          AND p.tablename = c.relname
                      )
                    )
                ) AS unsafe_public_table_count,
                (
                  has_table_privilege(session_user, 'public._migrations', 'SELECT')
                  OR has_table_privilege(session_user, 'public._migrations', 'INSERT')
                  OR has_table_privilege(session_user, 'public._migrations', 'UPDATE')
                  OR has_table_privilege(session_user, 'public._migrations', 'DELETE')
                ) AS migration_metadata_exposed,
                solvex_private.auth_context_ready() AS auth_context_ready
            `);

            const probe = rows[0];
            if (!probe) {
              blockers.push("database_role_probe_empty");
            } else {
              if (probe.current_role !== "solvex_app_runtime") blockers.push("runtime_role_not_forced");
              if (probe.current_role_elevated) blockers.push("effective_runtime_role_elevated");
              if (probe.login_role_elevated) blockers.push("runtime_login_role_elevated");
              if (probe.login_inherits_neon_superuser) blockers.push("runtime_login_inherits_neon_superuser");
              if (probe.unsafe_public_table_count !== 0) blockers.push("tenant_rls_incomplete");
              if (probe.migration_metadata_exposed) blockers.push("migration_metadata_exposed");
              if (!probe.auth_context_ready) blockers.push("signed_tenant_context_not_ready");
            }
          } else {
            await sql.query("SELECT 1 AS ready");
          }

          if (blockers.length > 0) {
            // Only static reason codes are logged; never log env values, tokens,
            // connection strings, or raw provider exceptions.
            console.error("[readyz] blocked:", [...new Set(blockers)].join(","));
            return Response.json(
              { status: "not_ready" },
              { status: 503, headers: { "cache-control": "no-store" } },
            );
          }

          return Response.json(
            { status: "ready" },
            { status: 200, headers: { "cache-control": "no-store" } },
          );
        } catch {
          console.error("[readyz] blocked: dependency_check_failed");
          return Response.json(
            { status: "not_ready" },
            { status: 503, headers: { "cache-control": "no-store" } },
          );
        }
      },
    },
  },
});
