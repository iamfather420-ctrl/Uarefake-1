# UAREFAKE — Proof Before Power (judge build)

This build closes the gap between the 8.8 demo film and a 10: the proof is no longer a black box.

## Run

```bash
npm test
npm start
```

Open http://localhost:8787

## Judge surface

- Judge tour walks refuse, inspect, bind, execute, reverse, and tamper.
- Policy studio re-proves when blast radius or JIT window changes.
- Obligation rows open their witness or countermodel.
- Safe rewrite is a field diff, not a paragraph.
- Audit trail seals each stage to the previous hash.
- Paste any receipt JSON to re-verify outside the sealed panel.
- Keys: 1 prove, 2 sign, 3 execute, 4 reverse, T tamper.

1. **Compile and prove** the unsafe shortcut. Eight obligations appear. Failing ones are SAT countermodels, not a model’s opinion.
2. **Sign authorization.** The gate rewrites to one demo account, seals a checkpoint and inverse, and binds the human token to the action commitment.
3. **Execute**, then **Reverse state**. The ledger returns to `active`.
4. **Tamper one field**, then **Re-verify offline**. The receipt fails closed. The screen is not the evidence.

Adversary buttons cover production smuggling, a stolen authorization, an expired JIT window, and a missing inverse.

## What changed from the film

| Judge deduction | This build |
| --- | --- |
| Proof generation was skipped | Deterministic compiler emits a typed action. PBP-1 is a finite decision procedure. |
| Proof might be another LLM | The model never grades the action. `notAModel: true` is structural: there is no model call on the prove path. |
| Latency unknown | 200-run local worst case is shown against a 25ms budget. |
| Hard to integrate | `adapters/before-tool-call.mjs` is the same engine in front of any tool call. |

## Truth boundary

VERIFIED means these obligations on this action. It does not mean every production system has been proved. Payment and production mutation stay blocked.
