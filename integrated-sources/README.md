# Cross-account source staging manifest

Canonical target under review: `iamfather420-ctrl/Uarefake-1`
Staging branch: `integration/cross-repo-purity-audit`

This directory preserves namespaced source snapshots from the second connected GitHub account. It intentionally does not overlay the live app's `src/`, `package.json`, or deployment configuration. Each snapshot keeps its repository-relative paths to prevent silent collisions while the source compatibility review is in progress.

## Sources and provenance

- `Daisy-Haminja-App-Forge/` — `Solvex-Paradox-Box/Daisy-Haminja-App-Forge` @ `43a184385480b1b357fc0831abe7d65c2c4d3103`
- `Daisy-Registry-Problem-Solving-Engine/` — `Solvex-Paradox-Box/Daisy-Haminja-AI---UAREFAKE-Registry-Problem-Solving-Engine` @ `92ff0149769d2c8c044262bf59501e7374d24311`
- `daisy-haminja-120-evidence/` — `Solvex-Paradox-Box/daisy-haminja-120-evidence` @ `0fcecfbb095ed3371ceb7992b47650060d44a2d3`
- `Solvex-Crystal-Clear-Black-Box/` — `Solvex-Paradox-Box/Solvex-Crystal-Clear-Black-Box` @ `7be16c1db8d25b2d71d6c0f95f8f07aa30997cff`

## Integrity and limitations

- Files staged here are source snapshots, not proof of successful runtime integration.
- The original source repository and commit are authoritative; this folder is a preserved integration copy.
- The registry engine's `server.ts`, `src/modules/SemanticFilter.ts`, and some other files were not staged in this pass because the content-write tool blocked them. They must be retrieved by a normal reviewed repository checkout before the source is considered complete.
- The full second-account repository inventory is not yet exhaustive. The connected account's repository listing endpoint returned no rows; repositories above were independently discovered by repository search.
- No secrets or live database state should be copied. Do not copy `node_modules`, build caches, or generated outputs.
- Next gate: compare staged files with Uarefake-1 and Full-Build by content hash, wire compatible components behind explicit adapters, then run typecheck, lint, unit tests, tenant-isolation tests, and build.
