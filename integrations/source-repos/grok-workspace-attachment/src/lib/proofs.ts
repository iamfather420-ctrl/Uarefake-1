import { dfrlOperators } from "@/lib/solvex/dfrl-data";
import { solvexNodes } from "@/lib/solvex/nodes-data";

export type ProofStatus =
  | "VERIFIED"
  | "PARTIAL"
  | "CLAIM_ONLY"
  | "FAMILY_VARIANT"
  | "FAIL"
  | "HOLD";

export type ProofRow = {
  code: string;
  name: string;
  domain: string;
  status: ProofStatus;
  result: "UNSAT" | "SAT" | "HOLD" | "N/A";
  bundle: string;
  classification?: string;
};

const governanceProofs: ProofRow[] = [
  { code: "DH-B-014", name: "Capability ≠ Authority", domain: "GOVERNANCE", status: "VERIFIED", result: "UNSAT", bundle: "PB-DH-B-014" },
  { code: "DH-B-018", name: "Authorization ≠ Execution", domain: "GOVERNANCE", status: "VERIFIED", result: "UNSAT", bundle: "PB-DH-B-018" },
  { code: "DH-B-022", name: "Reversibility Obligation", domain: "EXECUTION", status: "VERIFIED", result: "UNSAT", bundle: "PB-DH-B-022" },
];

function asResult(value: string): ProofRow["result"] {
  const v = value.toUpperCase();
  if (v === "UNSAT" || v === "SAT" || v === "HOLD") return v;
  return "N/A";
}

export const proofs: ProofRow[] = [
  ...governanceProofs,
  ...dfrlOperators.map((op) => ({
    code: op.code,
    name: op.name,
    domain: op.domain,
    status: (op.proved ? "VERIFIED" : "FAIL") as ProofStatus,
    result: asResult(op.result),
    bundle: op.bundle,
    classification: op.model_classification,
  })),
];

export const paraiStages = [
  { id: "INPUT", label: "Input", hint: "Ingest. Not yet evidence." },
  { id: "CONTEXT", label: "Context", hint: "Tenant, role, state, constraints." },
  { id: "REASON", label: "Reason", hint: "Probabilistic. Hypothesis only." },
  { id: "FORMALIZE", label: "Formalize", hint: "Turn belief into an obligation." },
  { id: "VERIFY", label: "Verify", hint: "Machine-check or fail closed." },
  { id: "GOVERN", label: "Govern", hint: "Policy, capability, authority." },
  { id: "AUTHORIZE", label: "Authorize", hint: "This circumstance. This op." },
  { id: "EXECUTE", label: "Execute", hint: "Deterministic state change." },
  { id: "OBSERVE", label: "Observe", hint: "Telemetry. Crystal Clear Box." },
  { id: "PROVE", label: "Prove", hint: "Receipt, audit, proof bundle." },
  { id: "RECOVER", label: "Recover", hint: "Reverse, compensate, restore." },
  { id: "LEARN", label: "Learn", hint: "Verified experience only." },
] as const;

export type ParaiId = (typeof paraiStages)[number]["id"];

export const nodes = solvexNodes;

export { manifest } from "@/lib/manifest";
