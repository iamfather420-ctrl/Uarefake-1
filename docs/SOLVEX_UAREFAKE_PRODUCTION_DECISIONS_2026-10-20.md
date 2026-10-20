# SOLVEX / Uarefake Production Decisions — 2026-10-20

These are the owner's accepted operating decisions. They define intended policy; they do not imply that production configuration or controls have already been changed or verified.

1. **Canonical domain:** `https://uarefake.space`.
2. **Backup retention:** target 30 days, subject to Neon plan capabilities and cost. Do not claim a schedule is active until verified.
3. **Recovery rehearsal:** full rehearsal on an isolated restore target covering schema/migrations, data integrity, application behavior, and tenant isolation.
4. **Payment-table policy:** deny direct application access to payment tables. Permit only explicitly authorized service operations with least privilege and tenant isolation. Keep PayPal and all payment processing disabled.
5. **Production login:** keep disabled until all required tests pass. Enabling login requires verified end-to-end identity/session tests and explicit final approval.
6. **Promotion gate:** all security, tenant-isolation, recovery, and readiness gates must pass before production promotion.
7. **Redirect timing:** configure canonical redirects only after authentication callbacks and trusted origins have been verified against `uarefake.space`. Until then, leave redirects unchanged.

## Implementation order

- Keep work on candidate branches and isolated Neon recovery/test branches.
- Fix production auth so it cannot fall back to the migration credential or ephemeral PGLite.
- Add behavioral tests for missing runtime credentials, runtime role identity, signed tenant context, cross-tenant denial, and payment-table access.
- Reconcile production roles and RLS only with a reviewed, reversible migration and explicit authorization; do not change live database security speculatively.
- Configure and verify the 30-day backup target only after confirming Neon support, cost, and schedule semantics.
- Complete an isolated full restore rehearsal and preserve logs/results.
- Capture deployment-commit-bound `/healthz` and `/readyz` responses.
- Verify OAuth callback and trusted-origin settings before any redirect change.

## Current safety state

- PayPal/payment processing remains disabled.
- Production login remains disabled until acceptance tests pass.
- No production database, production secrets, domain redirects, or production deployment are changed by this decision record.
- CI success and a Vercel READY status are candidate-build evidence, not production-readiness evidence.
