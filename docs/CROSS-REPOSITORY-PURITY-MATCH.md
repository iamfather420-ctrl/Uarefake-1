# Cross-repository purity match — Uarefake-1

Audit date: 2026-10-15  
Canonical integration candidate: `iamfather420-ctrl/Uarefake-1`  
Audit branch: `integration/cross-repo-purity-match-20261015`  
Target baseline: `main` at `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab`

## Executive result

**The target is not the complete unified build yet.** Its reported 53,570,823 bytes are dominated by `attachments/grok-workspace.zip` (50,054,239 bytes). That is an attached archive, not proof its contents are integrated into the application source tree. The target has 241 tracked files; the ZIP accounts for about 93.4% of listed bytes.

## Repository-level match

| Repository | Ref inspected | Files | Git-tree bytes | Finding |
|---|---|---:|---:|---|
| `Uarefake-1` | `main` | 241 | 53,570,823 | Canonical candidate; contains 50,054,239-byte workspace ZIP |
| `Full-Build` | `main` | 1,384 | 31,954,388 | Major source; 1,372 paths absent at same path in target; 12 same-path files differ |
| `agate-unified-monorepo` | `master` | 30,082 | 792,425,950 | Huge tree dominated by caches/toolchains |
| `agate-master-build` | `master` | 30,082 | 792,426,485 | Near-duplicate of agate-unified-monorepo |
| `agate-core-build` | `main` | 29,810 | 760,509,685 | Huge `.cargo`, `.local`, and `.cache` trees; do not copy wholesale |
| `solvex-react-build` | `main` | 445 | 36,378,389 | 320 files under `node_modules`; rebuild dependencies from lockfile |
| `SOLVEX-PARADOX-BOX` | `main` | 110 | 1,701,109 | Compliance/proof and Android source not fully integrated into target |
| `bloom-clear-tiger-meadow` | `main` | 278 | 6,150,935 | Contains generated `.vercel/output` and a source ZIP attachment |
| `FREEDOM-SIM-AI-OS` | `main` | 36 | 545,843 | Distinct MMTAI/SwarmOS UI/OS source |
| `SolveXRepoUnify` | `master` | 35 | 1,402,006 | Daisy Haminja assistant, workspace, sovereign engine modules |
| `Solvex-Hub` | `main` | 51 | 1,180,499 | Separate Android idea-vault app; keep as distinct module until reconciled |
| `SolveX` | `main` | 1 | 925 | README only; no implementation on this ref |

Git-tree bytes are not the release archive size.

## Exact duplicate / collision findings

1. `agate-unified-monorepo` and `agate-master-build` each have 30,082 tracked files. At identical paths, 30,079 file blobs are identical; only three same-path blobs differ. Choose one canonical snapshot after reviewing those three files and commit history. Do not merge both wholesale.
2. `agate-core-build` has 27,835 files under `.cargo`, 1,529 under `.local`, and 294 under `.cache`. These are predominantly toolchains, caches, and generated environments, not unique product source.
3. `solvex-react-build` contains 320 `node_modules` files, including multi-megabyte platform binaries. Rebuild dependencies from lockfiles.
4. `Full-Build` and `Uarefake-1` share 12 paths, and all 12 have different Git blob SHAs: `.github/workflows/ci.yml`, `AGENTS.md`, `package-lock.json`, `package.json`, `src/components/ui/button.tsx`, `src/lib/utils.ts`, `src/routeTree.gen.ts`, `src/router.tsx`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `tsconfig.json`, and `vite.config.ts`. Resolve these intentionally, not by blind overwrite.
5. `Full-Build` contains 523 paths under `artifacts`, 257 under `attached_assets`, 212 under `src`, 152 under `lib`, and 9 under `daisy-ai-os`. Daisy Haminja assets and code are important candidates; generated artifacts need classification.
6. The target's 50 MB workspace ZIP and other ZIP attachments must be extracted in a disposable build job and content-matched against tracked source before claiming they are integrated.

## Cross-account visibility

The connected `Solvex-Paradox-Box` account returned an empty accessible-repository listing in this pass. This does **not** prove its repositories do not exist. Its repository trees could not be included through the currently exposed connection; do not treat that as a negative match.

## Merge disposition

### Integrate selected real source into Uarefake-1 after compatibility work
- `Full-Build`: app modules, Daisy Haminja code/assets, proofs and scripts; resolve the 12 collisions.
- `SOLVEX-PARADOX-BOX`: compatible compliance, proof, MMTAI/DFRL, tests and migrations; keep separate build roots when needed.
- `SolveXRepoUnify`: Daisy assistant, sovereign orchestration and brain manifest after dependency/API reconciliation.
- `FREEDOM-SIM-AI-OS`: selected MMTAI/SwarmOS modules after verifying dependencies and product boundary.
- `solvex-react-build`: unique source/native code, excluding committed dependencies.
- `bloom-clear-tiger-meadow`: unique source only, excluding generated deployment output and duplicate archives.

### Do not wholesale merge
- Both Agate snapshots together; compare the three changed blobs and choose one.
- `agate-core-build` caches, Python environments, Cargo registry/cache, toolchains and generated binaries.
- Duplicate `node_modules`, generated build output, temporary MCP query results, local histories, secrets, credentials, and local databases unless explicitly classified as safe source fixtures.
- Do not overlay unrelated Android and web app roots merely because both use a directory named `src`.

## Verification gates
- Resolve collisions and record provenance for every copied module.
- Extract and inspect workspace ZIPs; do not treat archive size as completeness evidence.
- Exclude credentials, local histories, caches, generated output, and private user data.
- Rebuild retained app/modules from their own lockfiles and run their tests.
- Run target-wide typecheck/lint/tests, tenant-isolation checks, migration checks, and packaging checks.
- Verify deployment commit and runtime readiness separately from package CI.
- Repeat this match after integration and report counts, duplicate blobs, conflicts, exclusions, archive size, and tests.

## Current status

**Inventory and duplicate detection: partial pass. Full code merge/build: not complete.** No production branch, database, or deployment was changed by this audit. The second connected GitHub account's source tree remains unavailable in this run.
