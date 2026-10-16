export function resolveApplicationDatabaseUrl(config: { production: boolean; runtimeDatabaseUrl?: string; databaseUrl?: string }): string | undefined {
  const runtime = config.runtimeDatabaseUrl?.trim();
  const privileged = config.databaseUrl?.trim();
  return config.production ? runtime || undefined : runtime || privileged || undefined;
}
