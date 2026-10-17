# UAREFAKE production build validation

**Completed:** 2026-10-16 03:40 UTC
**Production URL:** https://uarefake.vercel.app
**Repository:** `iamfather420-ctrl/Uarefake-1`
**Final commit:** `452e20e09b29f7b502e2365078068b116c5cc339` — `fix: pin secure PostgreSQL TLS mode`

## Delivery summary

The canonical `Uarefake-1` repository is now the production source and the public Vercel alias points to its final deployment. The divergent external deployment was removed from the live alias.

| Area | Result |
|---|---|
| Vercel deployment | `READY` — deployment `dpl_4zAkJ2xR3DjPnzZZVBDD8znPTgvq` |
| Public alias | `uarefake.vercel.app` assigned to the final deployment |
| Production readiness | `GET /readyz` returned `200 {"status":"ready"}` |
| Evidence route | `GET /evidence` returned `200` and rendered the 120-case corpus |
| Operations dashboard | Rendered live Neon-bound ledger data: 120 nodes, 0 checkpoints, 0 rollbacks |
| Browser console | No console output/errors after production navigation |
| Runtime errors/warnings | No matching warning or error logs on the final deployment after verification requests |

## Implemented production hardening

- Merged the compatible recovery/ledger implementation and resolved the recovery migration for both legacy and enterprise schemas.
- Made the recovery migration idempotent and safe for existing databases by adding compatibility columns before indexing.
- Kept recovery drills **fail-closed** until operator authentication is explicitly provisioned.
- Configured `VITE_AUTH_ENABLED=false` in the Vercel **production** environment so the public storefront and readiness endpoint work without inventing credentials.
- Removed unauthenticated cart persistence and hardened recovery control paths.
- Explicitly normalized legacy PostgreSQL TLS modes to `sslmode=verify-full`, preserving certificate and hostname verification and eliminating the driver’s pending TLS semantics warning.

## Validation performed

| Validation | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed before final fixes |
| Focused recovery migration test | Passed |
| Full automated test suite | Passed — 197 tests plus 55 tests across 16 suites |
| `npm run build` | Passed |
| Remote production readiness/evidence checks | Passed |
| Browser visual verification of `/ops` | Passed |

## Deliberate operating boundaries

- The public website is available and Neon is connected.
- Recovery drills remain disabled until a real operator sign-in provider and credentials are configured; the UI accurately shows **SIGN-IN REQUIRED** instead of permitting an unauthenticated write.
- PayPal remains unavailable until DN-35 credentials and webhook configuration are intentionally provisioned.
- The evidence view presents the imported 120-case corpus with its source disclaimer; it does not misrepresent the artifact as a fresh independent Z3 verification.

## Source changes published

| Commit | Purpose |
|---|---|
| `8fa58154bc80ed090b83819ba2a8ca9c43af5847` | Align production recovery, readiness, and authentication behavior |
| `452e20e09b29f7b502e2365078068b116c5cc339` | Pin verified PostgreSQL TLS mode in both application and authentication pools |

## PayPal sandbox verification — 2026-10-17

The repository PayPal dual-environment forensic suite was executed from `integrated-sources/Full-Build/scripts/verify_paypal_dual_env.ts`.

| Check | Result |
|---|---|
| Sandbox credentials discovered in current runtime | **Missing** — no sandbox client ID or secret was available |
| Sandbox OAuth authentication | **Not tested** — blocked by missing credentials |
| Sandbox API connectivity | **Not tested** — blocked by missing credentials |
| Sandbox-to-live credential crossover guard | Passed |
| Live-to-sandbox credential crossover guard | Passed |
| Missing-credential fail-closed guard | Passed |
| Invalid-credential fail-closed guard | Passed |
| Unknown-environment fail-closed guard | Passed |
| Frontend/log/git secret exposure checks | Passed — none found |
| Real transaction or money movement | None |
| Evidence classification | `PARTIAL` |

The sanitized generated evidence is attached at:

- `integrated-sources/Full-Build/artifacts/paypal-dual-environment-test.json`
- `integrated-sources/Full-Build/paypal-dual-environment-test.json`

**Evidence SHA-256:** `8065d68cde2b6ea22aadec29738e9b9ff9e646ca14c07adaa1a059414be8ed28`

This result does **not** claim that PayPal Sandbox is authenticated. To complete the positive sandbox tests, populate the Vercel Production secrets `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` with sandbox credentials, then rerun the suite. No production payment enablement or webhook registration was performed.
