# Full-Build source integration

The canonical repository is `iamfather420-ctrl/Uarefake-1`. The source repository is `iamfather420-ctrl/Full-Build`, pinned to commit `a67017fbfe2ac795dfdc635a434ef50b19852ec8`.

The import workflow copies source into `integrated-sources/Full-Build/` while excluding Git metadata, dependency directories, environment files, credentials/certificates, local databases, generated builds, caches, and toolchains. It preserves the source package manifest and lockfile so the source can be installed and verified independently.

The workflow runs the canonical UAREFAKE build/typecheck/tests/lint and then executes the source repository's original `npm run verify:120` from the imported source root. That command also runs the original 46-gate suite and writes run-specific artifacts. CI artifacts are uploaded even when verification fails.

Important boundary: importing the code and passing CI do not establish production authentication, Neon tenant isolation, payment readiness, deployed health/readiness, or external business acceptance. The root app must not treat recorded evidence as authorization unless the fresh run passes its own closure criteria.
