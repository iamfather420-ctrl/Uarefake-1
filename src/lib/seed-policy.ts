/**
 * Demo fixtures are allowed only in a non-production PGlite preview.
 * A connected Neon database is always treated as authoritative application data.
 */
export function shouldSeedDemoData(
  dbSource: "neon" | "pglite",
  nodeEnv: string | undefined,
): boolean {
  return dbSource === "pglite" && nodeEnv !== "production";
}
