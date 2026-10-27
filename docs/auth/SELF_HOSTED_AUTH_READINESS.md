# First-party authentication readiness

This application can use its own Better Auth email/password credential flow. It does not require the Grok identity broker for that flow.

## Development and preview

For an isolated development/preview environment, set:

- `VITE_AUTH_ENABLED=true`
- `SELF_HOSTED_PASSWORD_AUTH_ENABLED=true`

The account screen is `/login`. Sign-up enforces a 12-character minimum in the UI and the server configuration; password values are never placed in client storage by this page.

Do not use a shared development database or a shared dev user for real customer data.

## Production remains fail-closed

Production authentication stays disabled unless the first-party path is explicitly enabled and all of the following are configured and verified:

- `VITE_AUTH_ENABLED=true`
- `SELF_HOSTED_PASSWORD_AUTH_ENABLED=true`
- `SELF_HOSTED_AUTH_PRODUCTION_APPROVED=true`
- `SELF_HOSTED_AUTH_RECOVERY_VERIFIED=true`
- `SELF_HOSTED_AUTH_EMAIL_VERIFICATION_VERIFIED=true`
- `SELF_HOSTED_AUTH_TENANT_ISOLATION_VERIFIED=true`
- `SELF_HOSTED_AUTH_BACKUP_RESTORE_VERIFIED=true`
- `DATABASE_RUNTIME_URL` using the least-privilege runtime role
- `BETTER_AUTH_SECRET` set in the secret manager
- `BETTER_AUTH_URL` set to the canonical HTTPS origin

The three `*_VERIFIED` variables are operator attestations, not automatic tests. Do not set them until evidence exists for recovery, adversarial tenant isolation, and a successful backup/restore rehearsal. Account recovery and production mail delivery must be implemented and exercised before the recovery attestation is true. Email verification must also be configured and tested before the email-verification attestation is true.

No production environment values are changed by this code change. PayPal and checkout remain disabled. Authentication readiness is separate from payment readiness.
