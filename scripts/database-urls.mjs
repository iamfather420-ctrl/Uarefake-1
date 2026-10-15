/**
 * Resolve separate credentials for deploy-time migrations, app queries, and
 * Better Auth storage. Vercel runtime must not fall back to the privileged
 * DATABASE_URL used by migrations.
 */
function firstConfigured(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

export function resolveRuntimeDatabaseUrl(env = process.env) {
  if (env.VERCEL) return firstConfigured(env.APP_DATABASE_URL);
  return firstConfigured(env.APP_DATABASE_URL, env.DATABASE_URL);
}

export function resolveAuthDatabaseUrl(env = process.env) {
  if (env.VERCEL) return firstConfigured(env.AUTH_DATABASE_URL);
  return firstConfigured(env.AUTH_DATABASE_URL, env.APP_DATABASE_URL, env.DATABASE_URL);
}

export function resolveMigrationDatabaseUrl(env = process.env) {
  return firstConfigured(env.MIGRATION_DATABASE_URL, env.DATABASE_URL);
}
