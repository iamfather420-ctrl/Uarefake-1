/**
 * 20-POINT PARADOX CERTIFICATE SCHEMA & EVIDENCE CONTRACTS
 * 
 * Strict compliance with SolveX Architecture & Formal Audit Directives:
 * 1. PX Identifier & Exact Problem Statement
 * 2. Threat / Failure Model
 * 3. Formal Assumptions
 * 4. Mathematical Model & Definitions
 * 5. Solution Anchor
 * 6. Formal Theorem
 * 7. Formal Proof
 * 8. Proof Obligations
 * 9. Reference Implementation
 * 10. Independent Executable Test
 * 11. Adversarial / Failure Testing
 * 12. Cryptographic Test Vectors
 * 13. Performance Measurements
 * 14. Safety & Security Evidence (Scoped Claims)
 * 15. Applicable External Standards (Standard Mapped)
 * 16. External-Source References
 * 17. Evidence Hashes (Real SHA-256)
 * 18. Independent Reviewer Attestation (Template)
 * 19. Limitations & Unresolved Assumptions
 * 20. Final Controlled Status
 */

import { ControlledStatus } from './statusEngine.ts';
export type { ControlledStatus };
import { ArtifactEvidenceMetadata } from './cryptoSha256.ts';
export type { ArtifactEvidenceMetadata };
import { ChainOfCustodyRecord } from './chainOfCustody.ts';
export type { ChainOfCustodyRecord };

export interface ThreatFailureModel {
  threatActor: string;
  attackVector: string;
  failureMode: string;
  severityImpact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  exploitPrerequisites: string[];
}

export interface MathematicalModelDefinitions {
  stateSpace: string;
  algebraicPrimitives: string[];
  formalNotation: string;
}

export interface SolutionAnchorRef {
  code: string;
  title: string;
  architecturalRole: string;
}

export interface ProofStep {
  stepNumber: number;
  assertion: string;
  justification: string;
  invariant: string;
}

export interface FormalProof {
  structure: 'Direct Deduction' | 'Induction' | 'Contradiction' | 'Reductive Constructive';
  steps: ProofStep[];
  conclusion: string;
}

export interface ProofObligation {
  obligationId: string;
  subsystem: string;
  requirementStatement: string;
  verificationMethod: string;
  currentVerificationStatus: 'SATISFIED' | 'CONDITIONAL_ON_HARDWARE' | 'UNTESTED' | 'PARTIAL';
}

export interface ReferenceImplementation {
  language: string;
  moduleName: string;
  codeSnippet: string;
}

export interface IndependentExecutableTest {
  testHarness: string;
  testCommand: string;
  assertionCode: string;
  runnableTestCode?: string;
  expectedOutcome: 'PASS' | 'FAIL' | 'INCONCLUSIVE';
}

export interface AdversarialTestResult {
  testName: string;
  vectorDescription: string;
  expectedBehavior: string;
  actualResult: 'PASS' | 'FAIL' | 'CONDITIONAL';
  reproductionTraceHash: string;
}

export interface CryptographicTestVector {
  vectorId: string;
  seed: string;
  inputData: string;
  expectedOutput: string;
  computedHash: string;
  status: 'VERIFIED_MATCH' | 'MISMATCH';
}

export interface PerformanceMeasurements {
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  throughputOpsPerSec: number;
  cpuOverheadPercent: number;
  memoryOverheadKb: number;
  measuredEnvironment: string;
}

export interface FormalVerificationToolRecord {
  tool: 'TLA+' | 'Coq' | 'Lean' | 'Isabelle' | 'EasyCrypt' | 'Ivy' | 'Alloy' | 'Spin' | 'Z3 SMT' | 'Automated Model Checker';
  toolVersion: string;
  command: string;
  sourceProofArtifact: string;
  result: 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'NOT EXECUTED';
  executionTimestamp: string;
  environment: string;
  artifactHash: string;
}

export interface ScopedSecurityEvidence {
  threatModel: string;
  assumptions: string[];
  securityProperty: string;
  attackModel: string;
  testMethodology: string;
  result: string;
  limitations: string;
  formalModelChecker: FormalVerificationToolRecord;
  stateSpaceExploration: string;
  counterexamplesFound: number;
  leakageBoundMetric: string;
}

export interface ApplicableExternalStandard {
  standard: string;
  version: string;
  controlOrRequirement: string;
  solveXImplementation: string;
  evidence: string;
  verificationStatus: 'STANDARD MAPPED' | 'PARTIALLY SATISFIED' | 'GAP_IDENTIFIED';
  gap: string;
  externalCertificationStatus: 'NOT CERTIFIED' | 'AUDIT PENDING' | 'CERTIFIED (EVIDENCE ATTACHED)';
}

export interface ExternalSourceReference {
  citationKey: string;
  authors: string;
  title: string;
  publicationVenue: string;
  year: number;
  authoritativeUrl: string;
}

export interface EvidenceHashesCollection {
  sourceCodeCommit: ArtifactEvidenceMetadata;
  sourceArchive: ArtifactEvidenceMetadata;
  compiledBinary: ArtifactEvidenceMetadata;
  testHarness: ArtifactEvidenceMetadata;
  testDataset: ArtifactEvidenceMetadata;
  testResults: ArtifactEvidenceMetadata;
  formalProofArtifact: ArtifactEvidenceMetadata;
  certificateJson: ArtifactEvidenceMetadata;
}

export interface IndependentReviewerAttestation {
  reviewer: string;
  organization: string;
  role: string;
  scope: string;
  evidenceReviewed: string[];
  methodsUsed: string[];
  findings: string;
  exceptions: string[];
  reviewDate: string;
  attestation: string;
  signature: string;
  signatureVerificationMethod: string;
  reviewStatus: 'TEMPLATE' | 'PENDING' | 'COMPLETED' | 'VERIFIED';
  displayStatus: 'INDEPENDENT REVIEW PENDING' | 'INDEPENDENTLY REVIEWED';
}

export interface ConfidentialEnclaveTier {
  proprietaryWeightsDigest: string;
  proprietaryAlgorithms: string;
  internalSeedConstants: string;
  enclaveHardwareGate: string;
}

export interface ParadoxCertificate {
  // 1. PX Identifier & Exact Problem Statement
  pxIdentifier: string;
  paradoxCode: string;
  paradoxName: string;
  exactProblemStatement: string;
  domain: string;
  category: 'shared' | 'proprietary';
  complexity: 'low' | 'medium' | 'high';

  // 2. Threat / Failure Model
  threatFailureModel: ThreatFailureModel;

  // 3. Formal Assumptions
  formalAssumptions: string[];

  // 4. Mathematical Model & Definitions
  mathematicalModelDefinitions: MathematicalModelDefinitions;

  // 5. Solution Anchor
  solutionAnchor: SolutionAnchorRef;

  // 6. Formal Theorem
  formalTheorem: string;

  // 7. Formal Proof
  proof: FormalProof;

  // 8. Proof Obligations
  proofObligations: ProofObligation[];

  // 9. Reference Implementation
  referenceImplementation: ReferenceImplementation;

  // 10. Independent Executable Test
  independentExecutableTest: IndependentExecutableTest;

  // 11. Adversarial / Failure Testing
  adversarialFailureTesting: AdversarialTestResult[];

  // 12. Cryptographic Test Vectors
  cryptographicTestVectors: CryptographicTestVector[];

  // 13. Performance Measurements
  performanceMeasurements: PerformanceMeasurements;

  // 14. Safety & Security Evidence
  safetySecurityEvidence: ScopedSecurityEvidence;

  // 15. Applicable External Standards
  applicableExternalStandards: ApplicableExternalStandard[];

  // 16. External-Source References
  externalSourceReferences: ExternalSourceReference[];

  // 17. Evidence Hashes
  evidenceHashes: EvidenceHashesCollection;

  // 18. Independent Reviewer Attestation
  independentReviewerAttestation: IndependentReviewerAttestation;

  // 19. Limitations & Unresolved Assumptions
  limitationsUnresolvedAssumptions: string[];

  // 20. Final Controlled Status
  finalStatus: ControlledStatus;
  statusRationale: string;

  // Phase 5 Field Classification
  fieldClassification?: Record<string, 'VERIFIED' | 'PRESENT BUT UNVERIFIED' | 'MISSING' | 'NOT APPLICABLE'>;

  // Chain of Custody Record
  chainOfCustody: ChainOfCustodyRecord;

  // Proprietary Confidential Tier (Available only in Confidential View with PIN)
  confidentialTier?: ConfidentialEnclaveTier;
}
