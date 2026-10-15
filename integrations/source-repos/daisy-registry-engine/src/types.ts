/**
 * Daisy Haminja AI - UAREFAKE System Architecture Types
 */

export type ParadoxCategory = 
  | 'Quantum & Physics' 
  | 'Epistemological' 
  | 'Economic & Market' 
  | 'Geopolitical & Sovereignty' 
  | 'Legal & Ethical' 
  | 'Cybernetic & Logical' 
  | 'Cognitive & Behavioral' 
  | 'Socio-Technical';

export interface ParadoxDefinition {
  id: number;
  code: string; // e.g. "PRX-001"
  name: string;
  category: ParadoxCategory;
  description: string;
  crossFirePairId: number; // Paired paradox for dual-track dialectic cross-fire
  crossFireConcept: string;
  dialecticWeight: number; // 0.0 - 1.0
  resolutionFormula: string;
  verifiedSourceDomain: string;
}

export type NodeRole = 
  | 'Alpha Core Node' 
  | 'Tether Bubble Relay' 
  | 'ZK Lockbox Vault' 
  | 'Verified Crawler' 
  | 'Cross-Fire Processor' 
  | 'Edge Telemetry Gateway';

export interface MeshNode {
  id: string; // e.g. "NODE-01"
  name: string;
  role: NodeRole;
  cluster: 'Alpha Core' | 'Beta Relay' | 'Gamma Lockbox' | 'Delta Crawler' | 'Epsilon Edge';
  ipAddress: string;
  status: 'OPTIMAL' | 'ACTIVE' | 'SYNCING' | 'FAILOVER_STANDBY' | 'DEGRADED';
  latencyMs: number;
  tetherBubbleRadiusKm: number;
  routingLoadPct: number;
  memoryUsagePct: number;
  uptimeSeconds: number;
  zkKeyHash: string;
}

export type SourceDomain = 'edu' | 'gov' | 'wikipedia' | 'law' | 'human_rights' | 'academic_journal';

export interface VerifiedKnowledgeSource {
  id: string;
  title: string;
  domain: SourceDomain;
  url: string;
  authorityScore: number; // 0 - 100
  lastCrawledISO: string;
  recordCount: number;
  zkHashProof: string;
  status: 'VERIFIED' | 'CRAWLING' | 'VALIDATING';
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  domain: string;
  sourceType: SourceDomain;
  confidenceScore: number;
  connectionsCount: number;
}

export interface KnowledgeGraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: string;
  weight: number; // strength 0 - 1
}

export interface SynthesizedSolution {
  id: string;
  title: string;
  problemStatement: string;
  paradoxesCrossFired: number[];
  dualTrackSynthesis: {
    trackA_Analytic: string;
    trackB_Dialectic: string;
    synthesizedResolution: string;
  };
  zkLockboxHash: string;
  version: string;
  timestampISO: string;
  confidenceScore: number;
  verifiedCitations: string[];
  ipStatus: 'LOCKED' | 'EXPORTED' | 'VERIFIED_ON_MESH';
}

export interface B2BProblemRequest {
  id: string;
  category: 'Supply Chain Paradox' | 'Resource Allocation' | 'Market Entry Strategy' | 'Macroeconomic Hedging' | 'Regulatory Arbitrage' | 'Capital Deployment';
  title: string;
  description: string;
  financialImpactEstimate: string;
  constraints: string[];
}

export interface B2BSolutionResult {
  requestId: string;
  strategicFramework: string;
  economicModel: {
    roiProjection: string;
    riskMitigationPct: number;
    capitalEfficiencyGain: string;
  };
  actionPlan: string[];
  paradoxResolutionMapping: string;
  verifiedSourcesUsed: string[];
}

export interface ConflictCase {
  id: string;
  region: string;
  title: string;
  actors: string[];
  escalationLevel: 1 | 2 | 3 | 4 | 5; // 1 = Low tension, 5 = Active Crisis
  rootCauses: string[];
  gameTheoryMatrix: {
    zeroSumOutcome: string;
    winWinSynthesis: string;
  };
  deEscalationSteps: string[];
  humanRightsStandardsApplied: string[];
}

export type CommunicatorMode = 'INTERNAL_POLITICAL' | 'EXTERNAL_PROFESSIONAL';

export interface SemanticFilterMetrics {
  originalText: string;
  sanitizedText: string;
  profanityDetected: boolean;
  slursDetected: boolean;
  hostileToneScore: number; // 0 - 100
  filterActionTaken: 'PASS_CLEAN' | 'NEUTRALIZED' | 'SILENT_SUPPRESSION' | 'SANITIZED';
  detectedTriggers: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'daisy_ai';
  mode: CommunicatorMode;
  content: string;
  rawInternalReasoning?: string;
  semanticMetrics?: SemanticFilterMetrics;
  verifiedCitations?: string[];
  timestampISO: string;
}

export interface ComplianceControl {
  id: string;
  standard: 'EAL6+' | 'NIST SP 800-53' | 'ISO 27001' | 'SOC2 Type II' | 'ZK Cryptography';
  code: string;
  name: string;
  status: 'COMPLIANT' | 'AUDITED' | 'ENFORCED';
  lastVerifiedISO: string;
  proofHash: string;
}

export interface AuditLogEntry {
  id: string;
  timestampISO: string;
  action: string;
  actor: string;
  module: string;
  zkProof: string;
  severity: 'INFO' | 'SECURITY' | 'SYNTHESIS' | 'FAILOVER';
}

export interface RegistryVerificationStatus {
  paradoxRegistry88Loaded: boolean;
  mesh54NodeTopologyReady: boolean;
  solutionFrameworkActive: boolean;
  verifiedCorpusGroundingReady: boolean;
  communicationProtocolsSecured: boolean;
  b2bEconomicSolverMounted: boolean;
  conflictEngineCalibrated: boolean;
  autonomousSynthesisTriggersOnline: boolean;
  overallScore: number;
}
