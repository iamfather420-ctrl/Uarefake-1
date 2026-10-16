# Full-Build source integration

The canonical repository is `iamfather420-ctrl/Uarefake-1`. The source repository is `iamfather420-ctrl/Full-Build`, pinned to commit `a67017fbfe2ac795dfdc635a434ef50b19852ec8`.

The import workflow copies source into `integrated-sources/Full-Build/` while excluding Git metadata, dependency directories, environment files, credentials/certificates, local databases, generated builds, caches, and toolchains. It preserves the source package manifest and lockfile so the source can be installed and verified independently.

The branch-scoped workflow runs the canonical UAREFAKE build/typecheck/tests/lint and then executes the source repository's original `npm run verify:120` from the imported source root. That command also runs the original 46-gate suite and writes run-specific artifacts. CI artifacts are uploaded even when verification fails.

## Required acceptance evidence

For every integration run, record the exact target commit and pinned source commit, canonical build/typecheck/test/lint outcomes, the fresh 120-case and 46-gate outcomes, and the generated evidence artifact links. A green canonical-app CI run alone is not a substitute for the formal verifier result. If the workflow is held for GitHub Actions approval, or any job is skipped/blocked, report that as BLOCKED rather than treating it as a pass.

Imported source snapshots remain provenance-preserving inputs, not automatically wired runtime modules. Each candidate module must have a documented owner/path, dependency and API compatibility review, duplicate/collision disposition, and integration tests before it is connected to live execution. Do not blindly copy generated dependencies, build caches, or parallel monorepo snapshots into the production runtime.

Important boundary: importing the code and passing CI do not establish production authentication, Neon tenant isolation, payment readiness, deployed health/readiness, or external business acceptance. The root app must not treat recorded evidence as authorization unless the fresh run passes its own closure criteria. PayPal remains out of scope for this integration pass; no payment feature is a prerequisite or authorization for merging the source corpus.
