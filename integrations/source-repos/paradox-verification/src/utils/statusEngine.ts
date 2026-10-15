/**
 * EVIDENCE-DRIVEN STATUS ENGINE
 * 
 * Rules:
 * Never assign certificate status using:
 * - node number
 * - modulo arithmetic
 * - random assignment
 * - placeholder logic
 * - certificate existence
 * - generated defaults
 * - hardcoded reviewer approval
 * 
 * Status is strictly calculated from actual verified evidence records.
 */

export type ControlledStatus =
  | 'CLAIMED'
  | 'SPECIFICATION COMPLETE'
  | 'TESTED'
  | 'FORMALLY SPECIFIED'
  | 'FORMALLY VERIFIED'
  | 'FORMALLY PROVEN'
  | 'IMPLEMENTATION VERIFIED'
  | 'SECURITY VERIFIED'
  | 'INDEPENDENTLY REVIEWED'
  | 'STANDARD MAPPED'
  | 'CERTIFIED'
  | 'NOT YET VERIFIED'
  | 'LEGACY / UNVERIFIED';

export interface EvidenceAuditInputs {
  pxId?: string;
  isGenericTemplate?: boolean;
  hasFormalTheorem: boolean;
  hasFormalProof: boolean;
  hasProofObligations: boolean;
  allObligationsSatisfied: boolean;
  hasExecutableTests: boolean;
  executableTestsPassed: boolean;
  hasAdversarialTests: boolean;
  adversarialTestsPassed: boolean;
  formalVerificationToolCheck: 'PASSED' | 'FAILED' | 'INCONCLUSIVE' | 'NOT_EXECUTED';
  independentReviewStatus: 'TEMPLATE' | 'PENDING' | 'COMPLETED' | 'VERIFIED';
  hasExternalAccreditedCertification: boolean;
  hasMissingEvidence: boolean;
  isHistoricalUnverified: boolean;
}

export interface StatusEvaluationResult {
  status: ControlledStatus;
  statusRationale: string;
  evidenceCompletenessPercent: number;
  unmetRequirements: string[];
}

/**
 * Pure, deterministic evaluation of ControlledStatus strictly based on actual evidence records.
 */
export function evaluateEvidenceStatus(inputs: EvidenceAuditInputs): StatusEvaluationResult {
  const unmet: string[] = [];

  if (inputs.isHistoricalUnverified) {
    return {
      status: 'LEGACY / UNVERIFIED',
      statusRationale: 'Historical claim lacks verifiable cryptographic and experimental evidence artifacts.',
      evidenceCompletenessPercent: 10,
      unmetRequirements: ['Cryptographic evidence chain missing', 'Independent tests missing']
    };
  }

  // Phase 6: Specifically detect generic/generated certificates
  if (inputs.isGenericTemplate) {
    return {
      status: 'NOT YET VERIFIED',
      statusRationale: 'Subgrid Node Induction template specification documented; bespoke model-checker proof artifacts and independent external execution traces pending.',
      evidenceCompletenessPercent: 35,
      unmetRequirements: [
        'Bespoke formal model-checker proof artifact unconfirmed',
        'Independent executable test suite execution pending in clean-room CI',
        'External independent reviewer attestation pending'
      ]
    };
  }

  if (inputs.hasMissingEvidence) {
    unmet.push('Mandatory evidence artifacts are marked as ARTIFACT NOT PRESENT');
    return {
      status: 'NOT YET VERIFIED',
      statusRationale: 'One or more mandatory evidence artifacts are missing from the audit package.',
      evidenceCompletenessPercent: 30,
      unmetRequirements: unmet
    };
  }

  if (!inputs.hasExecutableTests || !inputs.executableTestsPassed) {
    unmet.push('Executable tests have not been executed or failed validation');
  }

  if (!inputs.hasAdversarialTests || !inputs.adversarialTestsPassed) {
    unmet.push('Adversarial testing incomplete or failed');
  }

  if (inputs.formalVerificationToolCheck !== 'PASSED') {
    unmet.push(`Formal verification tool check: ${inputs.formalVerificationToolCheck}`);
  }

  if (inputs.independentReviewStatus !== 'VERIFIED' && inputs.independentReviewStatus !== 'COMPLETED') {
    unmet.push(`Independent review state: ${inputs.independentReviewStatus} (External lab evaluation pending)`);
  }

  // 1. External Accredited Certification (Requires verified third-party lab certification)
  if (
    inputs.hasExternalAccreditedCertification &&
    (inputs.independentReviewStatus === 'VERIFIED' || inputs.independentReviewStatus === 'COMPLETED') &&
    inputs.executableTestsPassed &&
    inputs.adversarialTestsPassed
  ) {
    return {
      status: 'CERTIFIED',
      statusRationale: 'External accredited third-party certification artifact verified and attached.',
      evidenceCompletenessPercent: 100,
      unmetRequirements: []
    };
  }

  // 2. Qualified Independent Security Review (Requires real third-party reviewer completion)
  if (
    (inputs.independentReviewStatus === 'VERIFIED' || inputs.independentReviewStatus === 'COMPLETED') &&
    inputs.hasAdversarialTests &&
    inputs.adversarialTestsPassed
  ) {
    return {
      status: 'INDEPENDENTLY REVIEWED',
      statusRationale: 'Qualified external review completed with verified zero-counterexample adversarial runs.',
      evidenceCompletenessPercent: 95,
      unmetRequirements: []
    };
  }

  // 3. Formally Verified (Tool check passes and proof obligations satisfied)
  if (
    inputs.formalVerificationToolCheck === 'PASSED' &&
    inputs.hasFormalProof &&
    inputs.allObligationsSatisfied &&
    inputs.executableTestsPassed
  ) {
    return {
      status: 'FORMALLY VERIFIED',
      statusRationale: 'Formal proof artifact independently verified by formal model checker (TLA+/Coq/Lean/Ivy) with passing test suite.',
      evidenceCompletenessPercent: 85,
      unmetRequirements: unmet
    };
  }

  // 4. Implementation Verified (Implementation satisfies specification under tested conditions)
  if (
    inputs.hasExecutableTests &&
    inputs.executableTestsPassed &&
    inputs.hasAdversarialTests &&
    inputs.adversarialTestsPassed &&
    inputs.allObligationsSatisfied
  ) {
    return {
      status: 'IMPLEMENTATION VERIFIED',
      statusRationale: 'Reference implementation satisfies formal specification under executable unit and adversarial chaos test suites.',
      evidenceCompletenessPercent: 75,
      unmetRequirements: unmet
    };
  }

  // 5. Tested (Tests pass, but formal verification or obligations partial)
  if (inputs.hasExecutableTests && inputs.executableTestsPassed) {
    return {
      status: 'TESTED',
      statusRationale: 'Executable unit and integration test assertions pass, but formal proof verification or adversarial chaos testing is pending.',
      evidenceCompletenessPercent: 55,
      unmetRequirements: unmet
    };
  }

  // 6. Formally Specified (Theorem and proof written, but not yet verified by automated tool or executable test)
  if (inputs.hasFormalTheorem && inputs.hasFormalProof) {
    return {
      status: 'SPECIFICATION COMPLETE',
      statusRationale: 'Formal theorem and proof steps documented; automated verifier check and executable test pending.',
      evidenceCompletenessPercent: 40,
      unmetRequirements: unmet
    };
  }

  // 7. Claimed
  if (inputs.hasFormalTheorem) {
    return {
      status: 'CLAIMED',
      statusRationale: 'Formal mathematical problem statement complete; proof and tests pending.',
      evidenceCompletenessPercent: 20,
      unmetRequirements: unmet
    };
  }

  // Fallback
  return {
    status: 'NOT YET VERIFIED',
    statusRationale: 'Required evidence artifacts are incomplete or awaiting independent execution.',
    evidenceCompletenessPercent: 15,
    unmetRequirements: unmet
  };
}
