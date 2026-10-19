# Build Status and Evidence Boundary for Independent Audit

**Prepared:** 2026-10-19  
**Canonical integration target:** `iamfather420-ctrl/Uarefake-1`  
**Checked main commit:** `fdbb5519b18af3660221e418af4aced5195f839b`  
**Purpose:** Give the independent auditor a grounded starting point without presenting historical claims as current proof.

## Confirmed repository/deployment evidence

- The current main commit was fetched from GitHub and is `fdbb5519b18af3660221e418af4aced5195f839b`, message: `Fail closed without a least-privilege runtime database role`.
- PR #25 was previously reported merged: [Separate production builds from database migrations](https://github.com/iamfather420-ctrl/Uarefake-1/pull/25), merge commit `93028721ece95fc094a9fe7e7afa4d9e4e8f62b1`.
- PR #30 was previously reported merged: [Fail closed without a least-privilege runtime database role](https://github.com/iamfather420-ctrl/Uarefake-1/pull/30), commit `fdbb5519b18af3660221e418af4aced5195f839b`.
- GitHub Actions run `39327237593` was previously reported successful: https://github.com/iamfather420-ctrl/Uarefake-1/actions/runs/39327237593. Recheck current status and logs; do not assume the run covers every production requirement.
- The current `.github/workflows/ci.yml` runs `npm ci`, production build, TypeScript typecheck, tests, and lint. It deliberately sets `DATABASE_URL` to an empty string in CI to avoid applying deploy-time migrations to Neon.
- Commit `fdbb5519...` adds a production fail-closed guard: when running on the Vercel production environment without `DATABASE_RUNTIME_URL`, application database queries refuse to fall back to the potentially privileged `DATABASE_URL`.
- A previous deployment check reported `/healthz` HTTP 200 and `/readyz` HTTP 503 with `{"status":"not_ready"}`. Recheck live deployment and bind observations to the exact deployed commit. Liveness is not readiness.

## Known blockers or unverified areas

- `DATABASE_RUNTIME_URL` was previously found missing/empty in the Vercel environment. Recheck variable presence only; never print or copy secret values into audit output.
- Neon production least-privilege runtime-role creation and verification were blocked by the available integration's safety checks. No successful production role change was confirmed. Do not assume the runtime role exists or is safe.
- A previously inspected Neon login role named `solvex_runtime_login` appeared overprivileged (including role/database creation, replication, RLS bypass, and `neon_superuser` membership). This is a historical observation requiring safe, read-only revalidation before relying on it.
- Production tenant isolation and RLS need end-to-end verification. Prior observations included tables with RLS disabled and `PUBLIC` execute permission on a private claims helper; recheck against the current actual schema and role grants.
- Existing snapshot capacity prevented creation of an additional manual snapshot, and automated snapshot scheduling was reported unavailable. Do not delete existing snapshots. Recovery readiness remains unproven until a restore rehearsal is completed.
- The 120-case formal corpus was previously reported as closed on commit `f3d2da33b5a32e07b5ab1cfb4bbf6b84ad7e8308` in `iamfather420-ctrl/Full-Build`, not on the current `Uarefake-1` commit. Reproduce it against the exact current code/corpus or clearly mark it historical.
- PR #27, intended to run pinned Full-Build formal verification on main, was previously reported open/stale. Recheck its state and workflow behavior.
- A webhook-hardening patch was previously described as locally tested (3 passing tests) but not committed or merged. The current audit environment cannot treat an uncommitted local working tree as GitHub evidence. Search for the patch in accessible branches, PRs, or commits; if not found, mark it unavailable and do not invent its diff.
- The cross-account repository inventory and full source merge are not complete. Prior accessible repo-size observations included `Full-Build` around 21,940 KB, `Uarefake-1` around 115,374 KB, `Solvex-Paradox-Box/Uarefake` around 50,462 KB, and Agate repositories around 172 MB each. These individual repository sizes do not prove or disprove the owner's reported approximately 2.3 GB combined compressed source set.
- Access to `Solvex-Paradox-Box` has previously returned an empty repository list through one connector, even though some public repository fetches worked. Explicitly enumerate what can actually be accessed; do not claim both GitHub accounts were fully scanned unless verified.
- PayPal/live payments are intentionally excluded and must remain disabled. Do not enable checkout/capture, payment secrets, or live payment paths as part of this audit.

## Current commit facts worth rechecking

- Inspect the full diff and surrounding code for PRs #25 and #30, not only their titles.
- Verify that migrations and application runtime use appropriately separated credentials and that deployment build steps do not accidentally mutate production data.
- Check actual Vercel project linkage, deployed SHA, environment-variable presence, and health/readiness endpoints.
- Re-run build/typecheck/tests/lint and the formal corpus when the source and environment make that safe. Preserve raw logs and link results to exact commit and corpus hashes.

## Owner-reported scope — not yet independently established

The owner describes the intended product as SOLVEX + Daisy Haminja Sovereign Enterprise OS, with Uarefake as a public marketplace/control surface and Uarefake.space as a control surface. The owner reports an approximately 2.3 GB build compressed/split for GitHub. The intended system includes just-in-time software/product distribution, AI/UI/OS components, auditability, reversible execution, human authorization, lifecycle state separation, tenant isolation, and formal evidence. These are scope statements for investigation, not assertions that each capability is implemented or complete.

## Required audit status language

Use `VERIFIED`, `PARTIALLY VERIFIED`, `IMPLEMENTED-UNVERIFIED`, `DOCUMENTED-ONLY`, `MISSING`, `BLOCKED`, or `NOT ASSESSED`. Distinguish `PROPOSED` from `APPROVED`, `EXECUTED`, and `VERIFIED`. Every major status needs current evidence and an exact reference. Never expose secret values.