# Cross-repository purity audit — Uarefake-1 integration

Audit date: 2026-10-15  
Canonical candidate: `iamfather420-ctrl/Uarefake-1`  
Scope: read-only repository tree comparison across the connected GitHub accounts. This report records evidence; it does not claim that source code has been merged.

## Findings

### Uarefake-1
- Default branch: `main`
- Tree commit: `1ebcc6ba7de2f1dbcbc7f9dbe7493371acebb6ab`
- 241 tracked files; GitHub tree blob-size sum: 53,570,823 bytes.
- Largest tracked file: `attachments/grok-workspace.zip` (50,054,239 bytes).
- Other bundled archives include `attachments/SOLVEX-hardened-source..zip` (329,773 bytes), `attachments/solvex-website-production..zip` (269,971 bytes), and a Neon schema archive.
- The reported ~50.8 MB repository size is therefore dominated by a single workspace ZIP attachment; it is not evidence that all project code is integrated.

### Full-Build
- Default branch: `main`
- Tree commit: `a67017fbfe2ac795dfdc635a434ef50b19852ec8`
- 1,384 tracked files; blob-size sum: 31,954,388 bytes.
- Contains Daisy Haminja assets, `daisy-ai-os/`, `src/brain/DaisyBrain.ts`, Daisy activation/runtime components, proof-before-power code, platform/marketplace/enterprise extracted projects, and multiple Drizzle migrations.
- This is a high-priority source. Merge selectively by subsystem and retain migration provenance; do not flatten every extracted project into the app root.

### Agate source family
- `agate-unified-monorepo`, branch `master`, commit `61af90d51f46de4567cc525d922550a7f36e4a5b`: 30,082 tracked blobs, reported blob-size sum 792,425,950 bytes.
- `agate-core-build`, branch `main`, commit `c97ab5ea590156cca9ef705c9cc580016ddd2b7e`: 29,810 tracked blobs, reported blob-size sum 760,509,685 bytes.
- The trees contain extensive vendored dependency/build caches such as `.cargo/registry`, pip wheels and cached binaries. Those should not be blindly copied into a production source merge.
- The monorepo tree has apps/packages including SolveX and Crystal Clear modules; compare canonical source files and commit histories before importing. The size is inflated by cache/vendor content and cannot be treated as unique product code.

### solvex-react-build
- Branch `main`, commit `1f2608dee2f04de8d0f1cb10a27933092a324fb7`
- 445 tracked files; blob-size sum 36,378,389 bytes.
- Includes `node_modules/` tracked in Git and two small tarballs. Do not copy `node_modules`; use lockfiles and reproducible install/build instead. Inspect `os-core/` and actual source/config files for unique implementation.

### SOLVEX-PARADOX-BOX
- Integration build previously packaged from commit `8984f96466543669946c8a25e4351f67c0587718`.
- Its generated artifact is a curated 239-file bundle, not a mirror of all source repositories. Keep its test/verification/migration improvements as integration candidates; do not treat the packaged artifact as the entire product.

### Cross-account Daisy repositories
The connected `Solvex-Paradox-Box` account's general repository listing returned empty, but repository search successfully exposed these repositories and their default-branch trees:

- `Solvex-Paradox-Box/Daisy-Haminja-App-Forge`, commit `43a184385480b1b357fc0831abe7d65c2c4d3103`: 11 files / 75,218 bytes; includes `src/App.tsx`, `server.ts`, ledger and tether data.
- `Solvex-Paradox-Box/daisy-haminja-120-evidence`, commit `0fcecfbb095ed3371ceb7992b47650060d44a2d3`: 5 files / 66,574 bytes; includes `artifacts/z3-120-case-results.json`, `artifacts/system-46-gates.json`, and formal evidence reports.
- `Solvex-Paradox-Box/Daisy-Haminja-AI---UAREFAKE-Registry-Problem-Solving-Engine`, commit `92ff0149769d2c8c044262bf59501e7374d24311`: 34 files / 232,293 bytes; includes registry, solver and economic dashboard components.
- `Solvex-Paradox-Box/Solvex-Crystal-Clear-Black-Box`, commit `7be16c1db8d25b2d71d6c0f95f8f07aa30997cff`: 41 files / 86,289 bytes; Android project with tests and resources.

## Merge classification

### Integrate after compatibility checks
1. Full-Build's unique Daisy AI/OS runtime, brain, UI assets and server modules.
2. Daisy-Haminja-App-Forge's app/server functionality where not already implemented in Uarefake-1 or Full-Build.
3. Registry/solver engine modules from the Daisy UAREFAKE Registry repository.
4. Formal verification artifacts from `daisy-haminja-120-evidence` as evidence inputs, keeping the original files and hashes intact.
5. SOLVEX-PARADOX-BOX's migrations, tenant-isolation tests, auth and verification improvements after resolving schema and API conflicts.
6. Unique, production-relevant Agate/SolveX modules, preserving package boundaries where possible.

### Do not blindly merge
- `node_modules/`, `.cargo/registry/`, `.cache/`, generated build outputs, tool caches, duplicated lockfiles, and vendored dependency trees.
- The full 50 MB `attachments/grok-workspace.zip` as a nested archive without inventorying its contents. It may contain valuable source, but must be unpacked and deduplicated before final packaging.
- Multiple parallel Agate snapshots wholesale. Their trees overlap heavily; use source hashes and package/module boundaries to determine canonical versions.

## Purity rules for the merge
- Preserve each source repository, commit SHA, and source path in a provenance manifest.
- Exact duplicate: keep one canonical copy and record all origins/hashes.
- Same path, different hash: compare behavior and tests; do not overwrite silently.
- Same symbol/API with incompatible contracts: reconcile deliberately and add integration tests.
- Keep migrations ordered and validate against the actual production schema before deployment.
- Do not commit secrets, private credentials, local databases containing user data, dependency caches, or unreviewed binaries.
- Do not claim 120/120 proof verification from a report alone; rerun the corpus and preserve machine-readable output plus hashes.

## Important limitation
This is a cross-repository tree and size audit, not proof that the source merge or production deployment is complete. The GitHub connector returns text/API content and does not provide arbitrary binary archive download through its generic fetch operation. The workspace ZIP must be fetched/extracted using a supported artifact/archive route before its contents can be purity-matched. No production branch, database, or deployment was changed by this audit.
