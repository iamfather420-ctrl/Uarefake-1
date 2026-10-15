export type ViewMode = 'dashboard' | 'daisy' | 'daisy_chat' | 'paradox' | 'marketplace' | 'mmtai' | 'jit_build' | 'agent_brain' | 'procurement' | 'inventory' | 'vendors' | 'finance' | 'workflows';
export type DeviceView = 'mobile' | 'desktop';
export type EnvironmentMode = 'sandbox' | 'live';

export interface LineItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  matched?: boolean;
  variancePct?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorName: string;
  vendorId: string;
  orderDate: string;
  expectedDelivery: string;
  status: 'draft' | 'pending_approval' | 'submitted' | 'fulfilled' | 'cancelled';
  totalAmount: number;
  items: LineItem[];
  autonomousCreated: boolean;
  approvalRuleTriggered?: string;
  matchedInvoiceId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  vendorName: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'received' | 'matched' | 'discrepancy' | 'paid' | 'overdue';
  items: LineItem[];
  earlyDiscountDate?: string;
  earlyDiscountAmount?: number;
  notes?: string;
  ocrConfidence?: number;
}

export interface WarehouseItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  currentStock: number;
  safetyStock: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  location: string;
  warehouse: 'West Coast Hub' | 'EU Logistics Depot' | 'APAC Central Hub';
  supplierId: string;
  status: 'optimal' | 'low_stock' | 'critical' | 'overstocked';
  autoReplenishEnabled: boolean;
  lastReorderDate?: string;
}

export interface Vendor {
  id: string;
  name: string;
  code: string;
  category: string;
  contactEmail: string;
  phone: string;
  riskScore: number; // 0-100 (higher = riskier)
  riskLevel: 'low' | 'medium' | 'high';
  slaPerformance: number; // percentage e.g. 98.5
  defectRate: number; // percentage e.g. 0.4
  tier: 'Strategic' | 'Preferred' | 'Secondary' | 'Under Review';
  paymentTerms: string; // e.g., "2/10 Net 30"
  activeContracts: number;
  summary?: string;
  complianceCertifications: string[];
}

export interface WorkflowRule {
  id: string;
  name: string;
  triggerEvent: 'INVOICE_RECEIVED' | 'STOCK_BELOW_SAFETY' | 'PO_CREATED' | 'VENDOR_RISK_HIGH' | 'PRICE_VARIANCE_DETECTED';
  conditions: string; // e.g., "Invoice > $5,000 AND PO Variance > 2%"
  action: 'AUTO_APPROVE' | 'REQUIRE_APPROVAL' | 'GENERATE_RFQ' | 'FLAG_VENDOR' | 'SEND_PAYMENT_REMINDER';
  isEnabled: boolean;
  lastTriggered?: string;
  executionCount: number;
}

export interface ExecutionLog {
  id: string;
  timestamp: string;
  agentName: string;
  actionType: string;
  details: string;
  status: 'success' | 'warning' | 'error' | 'in_progress';
  entityId?: string;
  entityType?: 'PO' | 'Invoice' | 'Inventory' | 'Vendor' | 'Workflow' | 'DaisyChain' | 'ParadoxBox' | 'Marketplace' | 'MMTAI';
}

export interface FinancialMetric {
  category: string;
  currentMonth: number;
  lastMonth: number;
  trendPct: number;
}

export interface DocumentParseResult {
  docType: 'Purchase Order' | 'Invoice' | 'RFQ' | 'Vendor Contract';
  vendorName: string;
  docNumber: string;
  date: string;
  totalAmount: number;
  lineItems: LineItem[];
  confidence: number;
  detectedFlags: string[];
  aiAnalysis: string;
}

export interface RfqDraft {
  rfqNumber: string;
  targetVendors: string[];
  productRequirements: string;
  quantityNeeded: number;
  targetPricePerUnit: number;
  requiredDeliveryDate: string;
  generatedNegotiationStrategy: string;
}

// 54-Node Daisy Automation Engine Types
export type DaisyNodeTypeCategory = 
  | 'Ingestion & OCR' 
  | 'Reconciliation & Match' 
  | 'Paradox & Audit' 
  | 'Risk & Compliance' 
  | 'ERP & Ledger' 
  | 'Payment & Treasury' 
  | 'Logistics & IoT' 
  | 'MMTAI & Security'
  | 'Marketplace Exchange'
  | 'AI Intelligence';

export interface DaisyNode {
  id: string;
  nodeIndex: number;
  name: string;
  category: DaisyNodeTypeCategory;
  type: string;
  config: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  latencyMs: number;
  dependencies: string[];
  inputs: Record<string, any>;
  outputs: Record<string, any>;
}

export interface DaisyChain {
  id: string;
  chainName: string;
  description: string;
  trigger: string;
  status: 'active' | 'paused' | 'executing';
  nodes: DaisyNode[];
  executionsToday: number;
  lastSuccess: string;
  errorRatePct: number;
}

// 88 Paradox Box Solver Engine Types
export type ParadoxCategory = 
  | 'Pricing Paradox' 
  | 'Phantom Inventory Paradox' 
  | 'Double Billing Loop' 
  | 'Currency FX Paradox' 
  | 'Contract Inversion' 
  | 'Tether Synaptic Discrepancy' 
  | 'Rebate Tax Paradox' 
  | 'MMTAI Transport Protocol Discrepancy';

export interface ParadoxRule {
  ruleCode: string;
  title: string;
  category: ParadoxCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  clauseReference: string;
  auditLogic: string;
  actionStrategy: string;
}

export interface ParadoxAnomaly {
  id: string;
  ruleCode: string;
  paradoxTitle: string;
  type: ParadoxCategory;
  severity: 'critical' | 'high' | 'medium' | 'low';
  entityId: string;
  discrepancyValue: number;
  explanation: string;
  status: 'open' | 'resolving' | 'resolved';
  solverStrategy: string;
  aiConfidence: number;
  detectedTimestamp: string;
  clauseReference: string;
}

export interface ParadoxSolverReport {
  paradoxId: string;
  rootCause: string;
  resolutionSteps: string[];
  financialImpactPrevented: number;
  suggestedVendorNotice: string;
}

// B2B Marketplace Exchange Types
export interface MarketplaceListing {
  id: string;
  title: string;
  sku: string;
  category: string;
  supplierName: string;
  supplierId: string;
  quantityAvailable: number;
  minOrderQty: number;
  unitPrice: number;
  bulkDiscountPrice: number;
  leadTimeDays: number;
  location: string;
  complianceRating: number;
  status: 'active' | 'sold_out' | 'bidding_open';
}

export interface MarketplaceBid {
  id: string;
  listingId: string;
  buyerName: string;
  quantity: number;
  offeredUnitPrice: number;
  totalOffer: number;
  bidTimestamp: string;
  status: 'pending' | 'accepted' | 'countered' | 'rejected';
}

// MMTAI Protocol & Security Engine Types
export interface MMTAIPeer {
  peerId: string;
  nodeName: string;
  endpoint: string;
  protocolVersion: string;
  securityTier: 'Level 4 Cryptographic' | 'Level 3 Zero-Trust' | 'Level 2 Standard';
  status: 'online' | 'syncing' | 'offline';
  latencyMs: number;
}

export interface MMTAISecurityAudit {
  auditId: string;
  timestamp: string;
  eventType: 'PAYLOAD_SIGNATURE_CHECK' | 'ZERO_TRUST_TOKEN_VALIDATION' | 'OFAC_SANCTIONS_SWEEP' | 'RBAC_ACCESS_ATTEMPT' | 'ENCRYPTION_KEY_ROTATION';
  actor: string;
  ipAddress: string;
  payloadHash: string;
  status: 'PASSED' | 'FAILED' | 'FLAGGED';
  details: string;
}

// 105 Paradox Solutions Marketplace Types
export interface ParadoxSolution {
  id: string;
  title: string;
  type: 'historical' | 'proprietary' | 'contract_security';
  category: string;
  description: string;
  b2bApplication: string;
  solverAlgorithm: string;
  status: 'active' | 'deployable' | 'running';
  successRate: number;
  solvedCount: number;
}

// 105 Autonomous Business Templates Marketplace Types
export interface BusinessTemplate {
  id: string;
  templateName: string;
  category: 'Procurement' | 'Supply Chain' | 'Finance & AP' | 'Vendor Risk' | 'ESG & Compliance' | 'AI & JIT Engine' | 'Operations' | 'Security';
  description: string;
  nodeCount: number;
  estimatedRoiMultiplier: string;
  deploymentsCount: number;
  difficulty: 'Turnkey' | 'Advanced' | 'Enterprise Custom';
  status: 'featured' | 'popular' | 'standard';
  tags: string[];
}

export interface JitBuildTask {
  id: string;
  targetModule: string;
  sourceCode: string;
  compiledAst: string;
  status: 'queued' | 'synthesizing' | 'compiling' | 'deployed' | 'error';
  buildTimeMs: number;
  dependencies: string[];
  outputBundleHash: string;
  generatedTimestamp: string;
}

// Agentic Brain & Recursive Reasoning Engine Types
export interface AgenticGoalNode {
  id: string;
  goalTitle: string;
  subGoals: string[];
  currentThought: string;
  recursionDepth: number;
  maxDepth: number;
  confidenceScore: number;
  executionStatus: 'planning' | 'evaluating' | 'executing' | 'solved';
  decisionPath: string[];
}

export interface AgentBrainState {
  brainId: string;
  cognitiveLoadPct: number;
  activeAgentsCount: number;
  activeGoals: AgenticGoalNode[];
  memoryBufferLength: number;
  lastReflection: string;
}

// 13 Daisy Sovereign Sandbox Categories
export type DaisySandboxCategory =
  | 'Infrastructure Growth'
  | 'Knowledge Expansion'
  | 'Technological and Coding Development'
  | 'Application and Software Hyper Acceleration'
  | 'Logic Stress Testing'
  | 'Compliance Immutability'
  | 'Concept Ideating'
  | 'Concept Development'
  | 'Development Production'
  | 'Production Refinement'
  | 'Architecture Hierarchy and Dominance Assessment'
  | 'Skills'
  | 'Achieving the Impossible the Proprietary Way';

// Market Pricing Research Structure
export interface SolutionPricingResearch {
  estimatedMarketValuation: number; // e.g. 24,500 ($)
  suggestedMonthlySaaSPrice: number; // e.g. 499 ($/mo)
  suggestedPerTxnFee: number; // e.g. 0.25 ($/txn)
  devHoursSavedPerYear: number; // e.g. 540 hrs
  estimatedRoiMultiplier: string; // e.g. "14.2x ROI"
  competitiveBenchmark: string; // e.g. "Legacy manual audit consulting costs $120k/yr"
  pricingRationale: string;
}

// Staged Solution pending Sovereign Owner Approval before leaving Sandbox to Marketplace
export interface StagedMarketplaceSolution {
  solutionId: string;
  problemStatement: string;
  sandboxCategory: DaisySandboxCategory;
  groundingCategory: string;
  generatedAstPatchCode: string;
  actionableSteps: string[];
  pricingResearch: SolutionPricingResearch;
  approvalStatus: 'staged_pending_owner_approval' | 'approved_public_marketplace' | 'rejected_sandbox_retained';
  stagedTimestamp: string;
  approvedTimestamp?: string;
  proofHash: string;
}

// True Thought Logic Bubble generated by recursive Tether Synaptic firing
export interface TrueThoughtLogicBubble {
  bubbleId: string;
  discoverySource: string; // e.g. "Paradox #42 + Node #27 (Invoice Voucher Matching)"
  paradoxRuleId: number; // 1 - 88
  proprietaryParadoxId: number; // 1 - 48
  connectedDaisyNodeId: number; // 1 - 54
  synapticTetherCoherence: number; // e.g. 0.9998
  coreInsight: string; // The "True Thought" synthesized
  astLogicSnippet: string; // Actionable AST code synthesized
  category: DaisySandboxCategory;
  proofHash: string;
  timestamp: string;
  isRetainedInBrain: boolean;
}

// Daisy Autonomous Synaptic Recursive Loop Telemetry
export interface TetherSynapticLoopCycle {
  cycleIndex: number;
  firingTimestamp: string;
  activeParadoxRule: number;
  activeProprietaryParadox: number;
  activeDaisyNode: number;
  tetherResonanceFrequency: string; // e.g. "432.88 Hz"
  coherenceScore: number;
  generatedLogicBubble?: TrueThoughtLogicBubble;
}

// Daisy Chat Assistant Message Interface
export interface DaisyChatMessage {
  id: string;
  sender: 'user' | 'daisy_ai';
  text: string;
  timestamp: string;
  problemSolution?: any;
  synapticTruthResult?: any;
  stagedSolution?: StagedMarketplaceSolution;
  actionType?: 'problem_solved' | 'already_exists' | 'sandbox_experiment' | 'marketplace_approval' | 'truth_check' | 'chat';
}

// MMTAI Grounding & Factuality Verification Gate
export interface MMTAIGroundingVerificationResult {
  isFactualAndVerified: boolean;
  direction: 'INBOUND_INFRASTRUCTURE' | 'OUTBOUND_WORLD_CHAT';
  factualityScore: number;
  checkedAgainst88ParadoxRules: boolean;
  solvexBlackBoxShielded: boolean;
  verificationHash: string;
  auditTrail: string[];
  timestamp: string;
}

// Solvex Crystal Clear Black Box Container
export interface SolvexBlackBoxContainer {
  blackBoxId: string;
  originalComponentTitle: string;
  obfuscatedZkpBytecode: string;
  crystalClearVerificationProof: string;
  isProprietaryProtected: true;
  mmtaiComplianceStamp: string;
}

// 380-Character MMTAI Sovereign Sale & Expansion Node Header Record
export interface SovereignSale380HeaderRecord {
  saleId: string;
  itemTitle: string;
  buyerIdentity: string;
  exact380CharacterHeader: string;
  nodeSuffix?: string;
  finalNodeBoundHeader: string;
  timestamp: string;
  amountUsd: number;
  solvexProofHash: string;
}



