# Daisy Haminja formal 120 evidence

## Provenance

- Repository: `iamfather420-ctrl/Full-Build`
- Branch: `main`
- Full commit: `f3d2da33b5a32e07b5ab1cfb4bbf6b84ad7e8308`
- Commit message: `Add protocol, Agatel, and Remix draft as Daisy functions`
- `iamfather420-ctrl/SOLVEX-PARADOX-BOX` returned 404 from the connected GitHub account. This commit is not confirmed in that repository.

## What was executed

The original script was run twice. It was not replaced.

```bash
cd Full-Build
npm install --legacy-peer-deps --ignore-scripts
npx tsx scripts/verify_120_aggregation.ts
```

Environment: Node with `tsx`, `z3-solver` loaded. No WASM load-failure warning was printed. Duration: 8263 ms, then 4644 ms.

## Results

| Check | Run 1 | Run 2 |
|---|---:|---:|
| DFRL executed / UNSAT | 88 / 88 | 88 / 88 |
| DH executed | 32 / 32 | 32 / 32 |
| DH expected SAT | 2 | 2 |
| Total executions | 120 / 120 | 120 / 120 |
| Expected matches | 120 / 120 | 120 / 120 |
| Replay matches | 120 / 120 | 120 / 120 |
| Unknown / errors | 0 / 0 | 0 / 0 |
| Verdict | PROVEN_120_FORMAL_CLOSURE | PROVEN_120_FORMAL_CLOSURE |

The two expected SAT cases are `DH-P-019` and `DH-P-031`. All 88 DFRL cases are UNSAT. Case IDs are unique: 88 DFRL and 32 DH.

## Hash

The script builds the combined root as:

`sha256(dfrl_root + ":" + dh_root + ":" + commit_sha)`

That formula was recomputed from the second-run roots and matched:

`c458189112a93288eabbd1a29c90c0481949e23f8b88dcceed7e1b1d3f3c053a`

The earlier reported hash `1186817fdb3cbdd1395e956cbb1af24d5aed3794bd141074ed0a6df81afa22c4` was the first run in this session. It does not match the second run. The DFRL root includes `certificate_sha256`, and that certificate seed includes a random `executionId`. The combined hash is therefore not stable across runs. The DH root stayed `6fb82611da6cd07087484e8b0290ef8eca66bf2ebb6061eea2beea6866b8bc25`.

## Cleanroom replay

Replay uses a separate Z3 context, parses the same SMT assertion again, and compares the new solver result with the first result. It does not copy the first result string. Both contexts are in the same process. This is an in-process replay, not a separate machine.

## Limitations

- Formal closure is not production readiness.
- The combined root hash is run-specific because DFRL certificates include execution IDs.
- The root `DFRLFormalVerifier.ts` is an empty file. The script uses `src/proofs/DFRLFormalVerifier.ts`.
- Neon was not connected, so production database state was not inspected.
- Payment remains unconfigured.

## Reproduce

```bash
git clone https://github.com/iamfather420-ctrl/Full-Build.git
cd Full-Build
git checkout f3d2da33b5a32e07b5ab1cfb4bbf6b84ad7e8308
npm install --legacy-peer-deps --ignore-scripts
npx tsx scripts/verify_120_aggregation.ts
```

Per-case results are in `artifacts/z3-120-case-results.json`.
