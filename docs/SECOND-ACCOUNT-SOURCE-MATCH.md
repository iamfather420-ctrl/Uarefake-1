# Second-account source match — Uarefake-1

Audit date: 2026-10-15  
Target: `iamfather420-ctrl/Uarefake-1` at `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab`  
Source account: `Solvex-Paradox-Box`

## Key finding

The two Uarefake repositories are near-identical but not identical:

| Metric | `Solvex-Paradox-Box/Uarefake` | `iamfather420-ctrl/Uarefake-1` |
|---|---:|---:|
| Commit | `9e5970c90def3c37e51170d995e04f1128eaefe8` | `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab` |
| Tracked files | 236 | 241 |
| Git-tree bytes | 53,562,857 | 53,570,823 |
| Same paths | 236 | 236 |
| Identical blobs at same path | 231 | 231 |
| Changed blobs at same path | 5 | 5 |
| Paths only in source Uarefake | 0 | 5 target-only paths |

### Five changed same-path files

These files differ by blob SHA and need a deliberate compare, not an overwrite:

- `migrations/0003_recovery.sql`
- `src/lib/app-data/client.server.ts`
- `src/lib/auth/server.ts`
- `src/lib/db.ts`
- `vercel.json`

The target has five paths absent from the source-account Uarefake repository:

- `.github/workflows/ci.yml`
- `migrations/0004_recovery_target_id_reconcile.sql`
- `scripts/recovery-migration.test.mjs`
- `src/routes/healthz.ts`
- `src/routes/readyz.ts`

**Disposition:** keep Uarefake-1 as the target because it has additional recovery migration and readiness work. Review the five differing files against the source-account version before changing them. The source-account Uarefake tree does not add any unique paths over the target.

## Daisy Haminja AI/UI/OS source

`Solvex-Paradox-Box/Daisy-Himinja-AI-UI-OS-v3` at `60702d6b708227972daf98c10b7846e065488ad2` contains 58 files totaling 3,026,608 bytes. None of its file paths currently exist in Uarefake-1. This is genuine missing source, not a duplicate path overlay. It contains Android/Kotlin app code, an `app.js` UI/logic layer, and Daisy-specific image assets (including consensus-grid, hero-banner, and core-icon imagery). It should be integrated as a distinct Android/Daisy module with its own Gradle build, not copied over the web app's root `src/`.

## 120-case and 46-gate evidence

`Solvex-Paradox-Box/daisy-haminja-120-evidence` at `0fcecfbb095ed3371ceb7992b47650060d44a2d3` contains five files (66,574 bytes), all absent from Uarefake-1:

- `SOLVEX_DAISY_BUILD_COMPLETENESS_REPORT.md`
- `SOLVEX_DAISY_FORMAL_120_EVIDENCE_REPORT.md`
- `artifacts/formal-aggregation.json`
- `artifacts/system-46-gates.json`
- `artifacts/z3-120-case-results.json`

These should be imported as versioned evidence with source commit and SHA-256/blob provenance. Their presence alone does not establish that the results are reproducible or that the current production build passes them; rerun the referenced corpus against the integrated code.

## AI Studio / consolidated B2B archives and duplicates

`Solvex-Paradox-Box/Ai-studio-marketplace-build` at `f69a85814b781e21c7b487ea2d6a7b474c7122ca` contains only two archives totaling 40,450,903 bytes:

- `bdc-project (1).zip` — 20,244,516 bytes
- `uarefake.zip` — 20,206,387 bytes

The same two archives also occur in `Solvex-Paradox-Box/Autonomous-consolidated-B2B-solutions` and `Solvex-Paradox-Box/CLEAN-WEB-CONSOLIDATED`. Do not count these repeated archives as three separate implementations. Extract each archive once in an isolated workspace, hash and compare their contents, then merge only unique verified source.

`Autonomous-consolidated-B2B-solutions` contains 10,078 files / 277,256,333 bytes, including 9,016 files under `node_modules`. `CLEAN-WEB-CONSOLIDATED` contains 10,366 files / 272,063,826 bytes, including 9,436 under `node_modules`. Their raw size is inflated by dependencies and embedded ZIPs. Rebuild dependencies from lockfiles; do not merge committed `node_modules`.

## Other source account repositories to inspect

The account search also surfaced these owned repositories that need tree/hash checks and selective integration:

- `Daisy-Haminja-App-Forge`
- `Daisy-Haminja-AI---UAREFAKE-Registry-Problem-Solving-Engine`
- `Solvex-Crystal-Clear-Black-Box`
- `Uarefake.com-storefront`
- `Storefront`
- `Solvex-B2B-Autonomy`
- `Solvex-Paradox-Marketplace-B2B-Solutions`
- `Autonomous-B2B-Solutions-Marketplace-`
- `Paradox-verification`
- `Monorepo`
- `SolveX-U-ARE-FAKE-B2B--Solutions-Marketplace`
- `Solvex-core`
- `Marketplace-p`
- `Autonomous-consolidated-B2B-solutions`
- `CLEAN-WEB-CONSOLIDATED`

Repository search is now working for the second account even though its basic list-repositories endpoint returned an empty result. The repositories above are not yet all tree-compared.

## Current status

This pass expands the inventory and proves concrete missing source/evidence. It does **not** yet perform the code copy, ZIP extraction, dependency reconciliation, or build/test run. No production code or deployment was changed.
