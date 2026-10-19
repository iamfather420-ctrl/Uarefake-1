# Production database migration procedure

Database migrations are deliberately separate from the application build. A deployment build must not mutate a live database as a side effect.

## Commands

- Build the application without changing the database: `npm run build`
- Apply migrations only in an explicitly authorized migration environment: `npm run db:migrate`

## Production safeguards

1. Review the migration files and target schema before running a migration.
2. Confirm the database URL points to the intended environment; never paste credentials into logs, pull requests, or chat.
3. Test the migration against an isolated Neon branch or disposable database first.
4. Take/verify a recoverable backup and record the migration's target commit and result.
5. Run production migrations as a separate controlled operation with the required migration privileges. Do not give those privileges to the application's runtime role.
6. After migration, run schema compatibility checks, tenant-isolation tests, and the application's readiness checks.
7. If the target environment, authorization, or recovery path is uncertain, stop and report BLOCKED rather than applying changes.

This procedure does not provision production authentication or enable privileged recovery operations. Those remain disabled until the approved identity provider, operator allowlist, and required environment configuration are verified.
