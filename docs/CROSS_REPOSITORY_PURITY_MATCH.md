# Uarefake-1 Cross-Repository Purity Match
**Status:** inventory-only evidence; not yet a source merge or build certification  
**Target:** `iamfather420-ctrl/Uarefake-1`  
**Target ref audited:** `main` @ `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab`  
**Audit branch:** `integration/cross-repo-purity-match`

## Summary
The target tree has 241 tracked files totalling 53,570,823 bytes. However, `attachments/grok-workspace.zip` alone is 50,054,239 bytes (about 93.4% of that total). This explains the repository's size; it does **not** prove that the application itself contains the whole system.

The recursive Git trees for the repositories below were fetched without truncation. File-level matching compares exact path and Git blob SHA. An identical path with a different blob is a collision/conflict to review, not an automatic overwrite.

| Source repository | Ref audited | Files | Tracked bytes | Same paths as target | Identical blobs at same path | Same path, different blob |
|---|---|---:|---:|---:|---:|---:|
| `Full-Build` | `main` | 1,384 | 31,954,388 | 12 | 0 | 12 |
| `agate-unified-monorepo` | `master` | 30,082 | 792,425,950 | 1 | 0 | 1 |
| `agate-core-build` | `main` | 29,810 | 760,509,685 | 4 | 0 | 4 |
| `agate-master-build` | `master` | 30,082 | 792,426,485 | 1 | 0 | 1 |
| `solvex-react-build` | `main` | 445 | 36,378,389 | 4 | 0 | 4 |
| `SOLVEX-PARADOX-BOX` | `8984f96466543669946c8a25e4351f67c0587718` | 168 | 2,194,419 | 3 | 0 | 3 |
| `FREEDOM-SIM-AI-OS` | `main` | 36 | 545,843 | 2 | 0 | 2 |
| `bloom-clear-tiger-meadow` | `main` | 278 | 6,150,935 | 209 | 170 | 39 |
| `SolveXRepoUnify` | `master` | 35 | 1,402,006 | 3 | 0 | 3 |
| `SolveX` | `main` | 1 | 925 | 0 | 0 | 0 |
| `web-build` | `main` | 526 | 15,403,947 | 209 | 168 | 41 |

## Findings and disposition

### Exact duplicates / likely shared scaffold
- `bloom-clear-tiger-meadow`: 170 of 209 overlapping paths are byte-identical by Git blob SHA. Preserve the target version for identical blobs; inspect the remaining 39 path conflicts before choosing either version.
- `web-build`: 168 of 209 overlapping paths are byte-identical. Inspect the remaining 41 conflicts. The shared paths include `.grok/references/*` and `.grok/skills/auth/*`, indicating common scaffolding, not necessarily duplicate application runtime.
- The Agate repositories have near-identical headline sizes/file counts but include large checked-in build/dependency caches. Their tracked byte counts are not estimates of useful production code. Do not merge the three wholesale; select canonical source modules and exclude generated caches, vendored toolchains, credentials, and machine-local state.

### Important missing/merge candidates
- `Full-Build` contains 1,384 files / ~32.0 MB and directories including `daisy-ai-os`, `Solvex-core`, `proof-before-power`, `artifacts`, `attached_assets`, and `src`. It is a high-priority implementation source, especially for Daisy Haminja and verification artifacts. Only 12 target paths overlap, all with different blob contents; this means a path-only overlay would be unsafe.
- `SOLVEX-PARADOX-BOX` contains 168 files / ~2.19 MB including runtime code, Kotlin app source, compliance reports, a SQLite file, and a Daisy source registry. It needs selective integration, not wholesale overwrite.
- `solvex-react-build` contains 445 files / ~36.4 MB, including `node_modules` (320 files). Reuse source/config/assets; regenerate dependencies from lockfiles rather than importing its checked-in `node_modules`.
- `FREEDOM-SIM-AI-OS` and `SolveXRepoUnify` have little path overlap with the target and need module-level relevance review before inclusion.

### Target contains large bundled source artifact
- `attachments/grok-workspace.zip` (50,054,239 bytes) must be inventoried and checked for overlap against `Full-Build`, Daisy, and other source packages before deciding whether to unpack, integrate, or retain as a provenance attachment.
- Other target attachments include `SOLVEX-hardened-source..zip` (329,773 bytes) and `solvex-website-production..zip` (269,971 bytes); inventory their contents before merging.

## Scope limitations — do not interpret as a clean cross-account pass
- The connected GitHub integration for the second account (`Solvex-Paradox-Box`) returned **zero repositories**. That is an access/listing result, not proof the account has no repositories. Its Daisy AI/UI/OS repositories have therefore **not** been file-matched.
- This audit compares path and blob identity against `Uarefake-1`; it does not prove semantic equivalence, runtime compatibility, test coverage, or that all repositories in the account were enumerated.
- Repository sizes are GitHub-reported repository metadata and recursive tree byte totals; neither is the final compiled release size.
- No source code was merged by this report. No production deployment, database, secret, or payment configuration was changed.

## Safe integration sequence
1. Recover the second account's actual repository list and identify the authoritative Daisy Haminja AI/UI/OS repository paths.
2. Inventory the ZIP attachments and classify every repository path into runtime source, tests, migrations, assets, documentation/evidence, generated output, dependency cache, and machine-local state.
3. Compare semantic duplicates and resolve all conflicting same-path files with provenance retained.
4. Integrate real modules into `Uarefake-1` on a dedicated branch, adapting imports/configuration rather than blindly overlaying files.
5. Run install, lint, typecheck, unit/integration tests, tenant-isolation checks, migration checks, and production build; preserve logs and source SHAs.
6. Package the complete source plus reproducible build instructions and evidence. Production readiness remains separate from CI success.

## Source refs
- `Uarefake-1`: `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab`
- `Full-Build`: `a67017fbfe2ac795dfdc635a434ef50b19852ec8`
- `agate-unified-monorepo`: `61af90d51f46de4567cc525d922550a7f36e4a5b`
- `agate-core-build`: `c97ab5ea590156cca9ef705c9cc580016ddd2b7e`
- `solvex-react-build`: `1f2608dee2f04de8d0f1cb10a27933092a324fb7`
- `SOLVEX-PARADOX-BOX`: `8984f96466543669946c8a25e4351f67c0587718`
