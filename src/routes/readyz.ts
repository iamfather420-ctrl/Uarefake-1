import { createFileRoute } from "@tanstack/react-router";

type RuntimeIdentityProbe = {
  current_role: string;
  login_role: string;
  current_role_elevated: boolean;
  login_role_elevated: boolean;
  login_inherits_neon_superuser: boolean;
};

type TenantRlsProbe = { unsafe_public_table_count: number };
type MigrationMetadataProbe = { migration_metadata_exposed: boolean };
type SignedContextProbe = { auth_context_ready: boolean };

function safeSqlStateCode(error: unknown): string {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
  }
  return "unknown";
}

/**
 * Production readiness fails closed on auth, runtime identity, tenant RLS,
 * migration metadata exposure, or signed tenant-context failures. Keep blocker
 * logs to static codes only; never expose connection strings or raw exceptions.
 */
export const Route = createFileRoute("/readyz")({
  server: {
    handlers: {
      GET: async () => {
        const production = process.env.VERCEL_ENV === "production";
        const blockers: string[] = [];
        const probeDiagnostics: string[] = [];
        let failureCode = "dependency_check_failed";

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

          failureCode = "database_client_import_failed";
          const { getSql } = await import("@/lib/db");
          failureCode = "runtime_database_connection_failed";
          const sql = await getSql();

          if (production) {
            let identity: RuntimeIdentityProbe | undefined;
            try {
              const rows = await sql.query<RuntimeIdentityProbe>(`
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
                    AS login_inherits_neon_superuser
              `);
              identity = rows[0];
            } catch (error) {
              blockers.push("runtime_identity_probe_failed");
              probeDiagnostics.push(`runtime_identity_probe_sqlstate_${safeSqlStateCode(error)}`);
            }

            if (!identity) {
              blockers.push("runtime_identity_probe_empty");
            } else {
              if (identity.current_role !== "solvex_app_runtime") blockers.push("runtime_role_not_forced");
              if (identity.login_role !== "solvex_runtime_login_v2") blockers.push("unexpected_runtime_login_role");
              if (identity.current_role_elevated) blockers.push("effective_runtime_role_elevated");
              if (identity.login_role_elevated) blockers.push("runtime_login_role_elevated");
              if (identity.login_inherits_neon_superuser) blockers.push("runtime_login_inherits_neon_superuser");
            }

            try {
              const rows = await sql.query<TenantRlsProbe>(`
                SELECT count(*)::int AS unsafe_public_table_count
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
              `);
              if (!rows[0]) blockers.push("tenant_rls_probe_empty");
              else if (rows[0].unsafe_public_table_count !== 0) blockers.push("tenant_rls_incomplete");
            } catch (error) {
              blockers.push("tenant_rls_probe_failed");
              probeDiagnostics.push(`tenant_rls_probe_sqlstate_${safeSqlStateCode(error)}`);
            }

            try {
              const rows = await sql.query<MigrationMetadataProbe>(`
                SELECT (
                  has_table_privilege(session_user, 'public._migrations', 'SELECT')
                  OR has_table_privilege(session_user, 'public._migrations', 'INSERT')
                  OR has_table_privilege(session_user, 'public._migrations', 'UPDATE')
                  OR has_table_privilege(session_user, 'public._migrations', 'DELETE')
                ) AS migration_metadata_exposed
              `);
              if (!rows[0]) blockers.push("migration_metadata_probe_empty");
              else if (rows[0].migration_metadata_exposed) blockers.push("migration_metadata_exposed");
            } catch (error) {
              blockers.push("migration_metadata_probe_failed");
              probeDiagnostics.push(`migration_metadata_probe_sqlstate_${safeSqlStateCode(error)}`);
            }

            try {
              const rows = await sql.query<SignedContextProbe>(
                "SELECT solvex_private.auth_context_ready() AS auth_context_ready",
              );
              if (!rows[0]) blockers.push("signed_tenant_context_probe_empty");
              else if (!rows[0].auth_context_ready) blockers.push("signed_tenant_context_not_ready");
            } catch (error) {
              blockers.push("signed_tenant_context_probe_failed");
              probeDiagnostics.push(`signed_tenant_context_probe_sqlstate_${safeSqlStateCode(error)}`);
            }
          } else {
            failureCode = "database_probe_failed";
            await sql.query("SELECT 1 AS ready");
          }

          if (blockers.length > 0) {
            console.error("[readyz] blocked:", [...new Set([...blockers, ...probeDiagnostics])].join(","));
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
          blockers.push(failureCode);
          console.error("[readyz] blocked:", [...new Set(blockers)].join(","));
          return Response.json(
            { status: "not_ready" },
            { status: 503, headers: { "cache-control": "no-store" } },
          );
        }
      },
    },
  },
});
