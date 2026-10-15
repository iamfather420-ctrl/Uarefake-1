/**
 * Keep runtime database credentials separate from schema-migration credentials.
 * Runtime connections should use a least-privilege LOGIN role. Migrations may
 * require DDL privileges and must never force the web application to run as the
 * database owner.
 */
function firstConfigured(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

/** Resolve the credentials used by application queries and Better Auth. */
export function resolveRuntimeDatabaseUrl(env = process.env) {
  return firstConfigured(env.APP_DATABASE_URL, env.DATABASE_URL);
}

/** Resolve the credentials used only by deploy-time schema migration. */
export function resolveMigrationDatabaseUrl(env = process.env) {
  return firstConfigured(env.MIGRATION_DATABASE_URL, env.DATABASE_URL);
}
