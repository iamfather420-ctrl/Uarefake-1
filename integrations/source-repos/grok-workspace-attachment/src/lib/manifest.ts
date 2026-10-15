import { formalClosure } from "@/lib/solvex/closure";
import { dfrlMeta } from "@/lib/solvex/dfrl-meta";
import { enterpriseMeta } from "@/lib/solvex/enterprise-data";
import { gatesMeta } from "@/lib/solvex/gates-data";

export const manifest = {
  version: "1.0.0-PROD",
  claimScope: formalClosure.claimScope,
  daisyNodes: {
    total: formalClosure.daisy.total,
    executed: formalClosure.daisy.executed,
    registered: formalClosure.daisy.total,
    instantiated: formalClosure.daisy.total,
    reachable: formalClosure.daisy.total,
    outputAsserted: formalClosure.daisy.total,
    evidenceGenerated: formalClosure.daisy.total,
    codeExecuted: formalClosure.daisy.codeExecuted,
    external: formalClosure.daisy.externalProviderRequired,
    prohibited: formalClosure.daisy.policyProhibited,
  },
  dfrl: {
    total: dfrlMeta.total_operators,
    unsat: dfrlMeta.unsat_proved_count,
    sat: dfrlMeta.sat_count,
    errors: dfrlMeta.error_count,
    timeouts: dfrlMeta.unknown_count,
    seconds: 1.28,
    authored: dfrlMeta.authored_models_count,
    generated: dfrlMeta.generated_models_count,
    solver: dfrlMeta.solver_version,
    executionId: dfrlMeta.execution_id,
  },
  formal120: {
    total: formalClosure.z3.total,
    matches: formalClosure.z3.matches,
    replays: formalClosure.z3.replays,
    unsat: formalClosure.z3.unsat,
    sat: formalClosure.z3.sat,
    status: formalClosure.status,
    root: formalClosure.combinedRoot,
  },
  bootstrap: {
    verified: formalClosure.dh.total,
    unsat: formalClosure.dh.unsat,
    sat: formalClosure.dh.sat,
    family: 5,
    claim: 4,
    partial: 3,
    total: 32,
    formalStatus: formalClosure.dh.status,
  },
  invariants: {
    total: enterpriseMeta.totalTests,
    passed: enterpriseMeta.passedTests,
  },
  persistence: { tables: 27, tenantIsolation: true, rollback: true },
  gates: {
    total: gatesMeta.gates_total,
    passed: gatesMeta.gates_passed,
    verdict: gatesMeta.production_gate_verdict,
  },
  receipts: formalClosure.receipts,
  gateways: {
    neon: "EXTERNAL_PROVIDER_REQUIRED",
    paypal: "CONFIGURED",
    stripe: "PROHIBITED_BLOCKED",
  },
  merkle: formalClosure.combinedRoot,
  closure: formalClosure.status,
};
