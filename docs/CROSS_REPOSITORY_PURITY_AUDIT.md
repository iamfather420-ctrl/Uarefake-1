# SOLVEX + Daisy Haminja cross-repository purity audit

**Destination under review:** `iamfather420-ctrl/Uarefake-1`  
**Audit branch:** `integration/cross-account-purity-audit`  
**Audit date:** 2026-10-15  
**Scope:** Git tree metadata for repositories accessible through the connected `iamfather420-ctrl` GitHub connection. This is a source-inventory and path/blob comparison, not a complete semantic code review.

## Destination baseline

- Repository: `iamfather420-ctrl/Uarefake-1`
- Default branch: `main`
- Tree commit: `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab`
- Files: 241
- Sum of tracked file sizes: 53,570,823 bytes (about 53.6 MB decimal)
- Largest tracked file: `attachments/grok-workspace.zip` (50,054,239 bytes)
- Other bundled source archives include `attachments/SOLVEX-hardened-source..zip` (329,773 bytes) and `attachments/solvex-website-production..zip` (269,971 bytes).

**Important:** Uarefake-1's roughly 50.8 MB GitHub size is dominated by the single Grok workspace ZIP. The outer repository's file count/size is not proof that the full source in that archive is extracted, compiled, or integrated into the application.

## Cross-repository inventory

| Source repository | Tree files | Sum of tracked file sizes | Same paths as Uarefake-1 | Identical Git blobs at same path |
|---|---:|---:|---:|---:|
| `iamfather420-ctrl/Full-Build` (`main`) | 1,384 | 31,954,388 bytes | 12 | 0 |
| `iamfather420-ctrl/SOLVEX-PARADOX-BOX` (`integration/unified-system-foundation`) | 168 | 2,194,419 bytes | 3 | 0 |
| `iamfather420-ctrl/solvex-react-build` (`main`) | 445 | 36,378,389 bytes | 4 | 0 |
| `iamfather420-ctrl/agate-unified-monorepo` (`master`) | 30,082 | 792,425,950 bytes | 1 | 0 |
| `iamfather420-ctrl/agate-core-build` (`main`) | 29,810 | 760,509,685 bytes | Not included in same-path comparison in this pass | Not included |

The tree totals are the sum of GitHub-reported tracked file sizes. They are not the resulting deployable application size and include checked-in dependency caches and build artifacts where present.

## Purity / duplication findings

1. **No exact same-path, same-Git-blob duplicates were found** between the Uarefake-1 tree and the compared Full-Build, SOLVEX-PARADOX-BOX, solvex-react-build, or agate-unified-monorepo trees.
2. **Different paths do not mean unique implementations.** The same source may have been renamed, copied into an archive, or rewritten; Git blob comparison alone cannot establish semantic uniqueness.
3. **Uarefake-1 is an archive-heavy baseline.** The 50 MB `attachments/grok-workspace.zip` must be inspected and inventoried internally before it can be counted as integrated source.
4. **Agate repositories are heavily cache/artifact-weighted.** The `agate-core-build` tree includes 27,835 `.cargo` entries and `.local` / `.cache` files; the unified monorepo includes 30,082 files and large vendored Rust/Python cache artifacts. Do not copy these wholesale into the production app or final source ZIP. Extract relevant source modules, manifests, tests, required assets, and license notices only.
5. **solvex-react-build contains `node_modules` (320 tracked files)** plus tarballs. Rebuild dependencies from lockfiles instead of treating committed dependencies as application source unless a documented offline-build requirement needs them.
6. **Full-Build contains substantial real source/assets** across `src/`, `lib/`, `app/`, `Solvex-core/`, `proof-before-power/`, `daisy-ai-os/`, `artifacts/`, and `attached_assets/`. These should be mapped by function and dependency before integration; do not overwrite Uarefake-1 paths blindly.
7. **SOLVEX-PARADOX-BOX has distinct runtime/compliance implementation** including `unified-runtime/`, `src/`, Android `app/`, migrations, tests, audit documents, and a tracked SQLite artifact. Determine which of these are deployable source, test fixtures, evidence, or local state before importing.

## Current decision

**Canonical integration target: `iamfather420-ctrl/Uarefake-1`.** Use a review branch and PR; do not replace `main` directly.

### What is not complete yet

This audit does **not** claim the repositories have been merged. No source files from Full-Build, Agate, solvex-react-build, or SOLVEX-PARADOX-BOX were copied by this report-only commit. A full merge requires obtaining and unpacking the binary workspace archives, doing content/hash comparisons inside them, choosing canonical modules, resolving package/runtime/schema conflicts, and running tests on the assembled tree.

The connected `Solvex-Paradox-Box` account's repository listing returned no repositories in this session, although the public parent repository `Solvex-Paradox-Box/Uarefake` is identifiable from Uarefake-1's fork metadata. Therefore, this audit must not be described as exhaustive across every private repository or upload in both accounts. Daisy Haminja sources not represented in the accessible trees remain unverified.

## Reproducible source references

- `iamfather420-ctrl/Uarefake-1` @ `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab`
- `iamfather420-ctrl/Full-Build` @ `a67017fbfe2ac795dfdc635a434ef50b19852ec8`
- `iamfather420-ctrl/SOLVEX-PARADOX-BOX` @ `8984f96466543669946c8a25e4351f67c0587718`
- `iamfather420-ctrl/solvex-react-build` @ `1f2608dee2f04de8d0f1cb10a27933092a324fb7`
- `iamfather420-ctrl/agate-unified-monorepo` @ `61af90d51f46de4567cc525d922550a7f36e4a5b`
- `iamfather420-ctrl/agate-core-build` @ `c97ab5ea590156cca9ef705c9cc580016ddd2b7e`
