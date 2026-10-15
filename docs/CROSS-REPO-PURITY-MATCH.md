# SOLVEX + Daisy Haminja — Cross-Repository Purity Match

**Target repository:** `iamfather420-ctrl/Uarefake-1`  
**Audit branch:** `integration/cross-repo-purity-audit`  
**Target baseline commit:** `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab`  
**Purpose:** document verified source-tree overlap, likely duplicate repositories, excluded build/cache material, and integration gaps before the canonical merge.

## Executive result

The current `Uarefake-1` tree is not the whole system. Its 241 tracked files total **53,570,823 bytes** according to Git tree metadata, but **50,054,239 bytes are a single bundled workspace archive** at `attachments/grok-workspace.zip`. The rest of the tracked tree is about 3.5 MB. This means repository size overstates the amount of first-class application source represented by ordinary tracked files.

This audit is a tree-metadata comparison, not a full semantic/code-equivalence proof. Files with matching paths but different sizes are not automatically duplicates; matching sizes do not prove identical contents.

## Repository inventory observed

| Repository | Ref inspected | Tracked files | Sum of tracked blob sizes | Assessment |
|---|---|---:|---:|---|
| `iamfather420-ctrl/Uarefake-1` | `main` | 241 | 53,570,823 B | Canonical deployment candidate; includes large workspace ZIP attachment |
| `iamfather420-ctrl/Full-Build` | `main` | 1,384 | 31,954,388 B | High-priority implementation source; Daisy assets, `daisy-ai-os/`, `Solvex-core/`, `src/`, `lib/`, `app/`, `artifacts/`, and `attached_assets/` |
| `iamfather420-ctrl/agate-unified-monorepo` | `master` | 30,082 | 792,425,950 B | Broad monorepo, but contains dependency caches/vendor trees and duplicated app/package content |
| `iamfather420-ctrl/agate-core-build` | `main` | 29,810 | 760,509,685 B | Strong overlap with monorepo; includes `.cargo/`, `.cache/`, `.local/`, compiled Python bytecode, logs, and Android project |
| `iamfather420-ctrl/solvex-react-build` | `main` | 445 | 36,378,389 B | Contains a React/Android implementation, but tracked `node_modules/` accounts for most large blobs |
| `iamfather420-ctrl/SOLVEX-PARADOX-BOX` | commit `8984f96466543669946c8a25e4351f67c0587718` | 168 | 2,194,419 B | Integration, compliance, evidence, Kotlin UI, runtime, and database/migration source |

Repository metadata previously reported approximately 172.5 MB for the Agate repositories and 50.8 MB for `Uarefake-1`; recursive Git-tree blob totals differ because GitHub's repository-size metric and tracked blob totals are different measurements. Neither is the final distributable size.

## Path-overlap comparison against Uarefake-1

Comparison used recursive Git tree paths. It excludes directory entries and compares tracked blob paths.

| Source | Shared paths with Uarefake-1 | Shared paths with same byte size | Source paths absent from Uarefake-1 |
|---|---:|---:|---:|
| `Full-Build` | 12 | 0 | 1,372 |
| `agate-unified-monorepo` | 1 | 0 | 30,081 |
| `agate-core-build` | 4 | 0 | 29,806 |
| `solvex-react-build` | 4 | 0 | 441 |

The path comparison shows that **the bulk of these repositories is not merged into Uarefake-1 under matching paths**. This does not imply that all unique paths should be copied directly into the application's root: several repositories contain separate apps, dependency trees, generated files, archives, runtime caches, or overlapping versions.

## Purity and deduplication findings

### Keep as source candidates, then integrate intentionally
- `Full-Build`: inspect and integrate real source from `src/`, `lib/`, `app/`, `Solvex-core/`, `daisy-ai-os/`, proof-before-power components, Daisy assets, migrations, and test/evidence source. Keep provenance and license/ownership notices.
- `SOLVEX-PARADOX-BOX`: reconcile its actual runtime, test suites, migration history, verification artifacts, Kotlin UI, and SQLite evidence against Uarefake-1 before selecting canonical implementations.
- `solvex-react-build`: inspect `src/`, `os-core/`, `payload/`, `security-pipeline/`, Android configuration, and its tarball contents. Do not import `node_modules/` as source.
- `agate-unified-monorepo` / `agate-core-build`: select canonical app/package source and native components; preserve needed build manifests and lockfiles, but do not recursively vendor caches.

### Likely duplicate/derived material that must be compared before inclusion
- `agate-unified-monorepo/apps/agate-core-build/` appears to embed an Agate core build inside the monorepo, so do not merge the monorepo and standalone core tree blindly.
- The two Agate trees have closely matching scale and substantial dependency-cache structures. Exact object/content comparison is still required to determine the canonical revision.
- `solvex-react-build` and `agate-core-build` share Android paths such as `android/app/build.gradle` and resource/config files; identical path and size has not been established by this report.
- `Uarefake-1/attachments/grok-workspace.zip` is a bundled workspace archive and may overlap with checked-in files or other archives. It must be inventoried and content-hashed before its contents are merged.
- `Full-Build` includes many `artifacts/` and `attached_assets/` paths. Classify each as source, required runtime asset, evidence, or generated output instead of flattening everything into production source.

### Do not copy blindly
- `node_modules/`, `.cargo/`, `.cache/`, `.local/`, `__pycache__/`, logs, shell histories, nested Git metadata, temporary MCP/tool artifacts, and compiled build outputs.
- Any `.env`, credentials, keys, or production database dumps. Include only safe templates such as `.env.example`; never expose secrets.
- Large archives or binaries until their contents, provenance, license, and duplicate status have been inspected.

## Cross-account visibility limitation

The connected GitHub integration returned no repositories for the linked `Solvex-Paradox-Box` account in this audit run, while it returned the `iamfather420-ctrl` inventory. This is an access/visibility limitation, **not evidence that the second account has no repositories**. The Daisy-specific repositories under that account therefore remain unverified and cannot truthfully be marked merged or absent. Reconnect/authorize the second account with repository-read access before declaring the cross-account audit complete.

## Required completion gates

1. Enumerate every repository in both accounts and record owner, repository, default branch, commit SHA, tree size, and access outcome.
2. Inventory nested archives in `Uarefake-1` and `Full-Build`; hash each file and identify exact duplicates across sources.
3. Identify canonical implementations for shared functionality by tests, imports, migrations, and current deployment wiring—not by repository size.
4. Integrate separate apps/packages under explicit workspace paths; preserve provenance in a source manifest.
5. Exclude secrets and generated caches while retaining required assets, lockfiles, migrations, and tests.
6. Run typecheck, lint, unit/integration tests, tenant-isolation verification, migration checks, and production-build checks on the assembled branch.
7. Publish a reproducible artifact with an inventory, SHA-256 manifest, test evidence, and an explicit list of unresolved production gates.

## Status

**Audit partial; full merge not yet performed.** This report records verified tree metadata and known omissions. It does not claim production readiness, semantic duplicate detection, complete second-account coverage, or successful end-to-end integration.
