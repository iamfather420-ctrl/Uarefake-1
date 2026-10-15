// ==============================================================================
// SOLVEX IDEA VAULT & B2B FREELANCE JOBS DATA ENGINE (Derived from Solvex-Hub)
// AUTHOR / TRUSTEE: TODD JEFFREY ITES JR. (TJ)
// HARDWARE ROOT VALIDATION: MAESTRO_AGE_2026
// ==============================================================================

export interface VentureIdea {
  id: string;
  title: string;
  source: 'r/problems' | 'r/startupideas' | 'Twitter/X' | 'Enterprise RFQ' | 'User Submission' | 'SolveX Dialectic';
  originalText: string;
  author: string;
  timestamp: string;
  tamScore: number; // 0 - 100
  feasibilityScore: number; // 0 - 100
  gapScore: number; // 0 - 100
  totalScore: number; // Composite 0 - 100
  marketSize: string;
  analysisDetails: string;
  outreachMessage: string;
  status: 'Scouted' | 'Evaluating' | 'Outreach Sent' | 'Accepted' | 'Signed Contract' | 'Payout Completed' | 'Secured Vault';
  valuation: number; // In USD
  isBookmarked: boolean;
  tags: string[];
  executionTimeframe: string;
}

export interface SolveXJobOpportunity {
  id: string;
  jobId: number;
  title: string;
  description: string;
  budget: string;
  budgetNumeric: number;
  board: 'upwork' | 'toptal' | 'freelancer' | 'peopleperhour' | 'smart-contract';
  duration: string;
  clientCountry: string;
  postedAgo: string;
  matchScore: number;
  requiredSkills: string[];
  zkpVerified: boolean;
  escrowSecured: boolean;
  clientReputation: number;
  suggestedBid: string;
  generatedProposal: string;
  status: 'Open' | 'Bid Placed' | 'In Negotiation' | 'Contract Awarded' | 'Escrow Funded';
}

export const INITIAL_VENTURE_IDEAS: VentureIdea[] = [
  {
    id: 'idea-101',
    title: 'Zero-Knowledge Multi-Tenant Calendar & Spot Exchange',
    source: 'Enterprise RFQ',
    originalText: 'A platform allowing enterprise executive teams to schedule and swap meeting slots without disclosing attendee identities or calendar contents across corporate firewall boundaries.',
    author: 'Swiss Banking Consortium',
    timestamp: '2026-08-20T14:30:00Z',
    tamScore: 92,
    feasibilityScore: 88,
    gapScore: 95,
    totalScore: 91,
    marketSize: '$4.2B Global Enterprise Scheduling & Privacy',
    analysisDetails: 'Massive enterprise TAM with strict FINRA/GDPR compliance requirements. Existing tools (Calendly, Doodle) leak metadata. Groth16 ZK proof verification completely prevents schedule sniffing.',
    outreachMessage: 'Hello,\n\nWe saw your mandate regarding confidential cross-tenant executive scheduling. Solvex has deployed a deterministic zero-knowledge scheduling engine running on encrypted enclaves that verifies slot availability with zero metadata exposure. Would you be open to an automated pilot this week?',
    status: 'Accepted',
    valuation: 4500.00,
    isBookmarked: true,
    tags: ['ZK-Cryptography', 'Enterprise SaaS', 'FINRA Compliance'],
    executionTimeframe: '3 Weeks'
  },
  {
    id: 'idea-102',
    title: 'On-Device Receipt & Tax Deduction Ledger with Air-Gapped AI',
    source: 'r/problems',
    originalText: 'Small business owners and freelancers lose thousands in write-offs because uploading bank slips and receipts to cloud services violates client NDA terms or incurs heavy accountant fees.',
    author: 'u/freelance_architect',
    timestamp: '2026-08-21T09:15:00Z',
    tamScore: 96,
    feasibilityScore: 91,
    gapScore: 89,
    totalScore: 92,
    marketSize: '$12.8B SME Accounting & Tax Automation',
    analysisDetails: 'High recurring utility. Running OCR + transaction categorization on local WebAssembly/eBPF kernel layers ensures 100% data sovereignty without external server transmission.',
    outreachMessage: 'Hi there,\n\nNoticed your discussion regarding privacy-preserving tax classification. We built an on-device deterministic expense parser that runs 100% client-side with EAL6+ memory zeroization. Happy to grant you early access for testing.',
    status: 'Evaluating',
    valuation: 3200.00,
    isBookmarked: false,
    tags: ['Edge AI', 'FinTech', 'Data Sovereignty'],
    executionTimeframe: '2 Weeks'
  },
  {
    id: 'idea-103',
    title: 'Autonomous Dark Pool Smart Order Router & Arbitrage Neutralizer',
    source: 'Twitter/X',
    originalText: 'High-frequency institutional order flows are getting front-run on public mempools. We need a sub-microsecond encrypted routing protocol that obfuscates order sizes and routes across liquidity islands.',
    author: '@defi_quant_x',
    timestamp: '2026-08-21T18:40:00Z',
    tamScore: 98,
    feasibilityScore: 85,
    gapScore: 97,
    totalScore: 93,
    marketSize: '$8.9B Algorithmic Execution Infrastructure',
    analysisDetails: 'Premium institutional willingness to pay. Sub-100ns traversal using C++20/Rust with zero-knowledge order masking eliminates toxic flow extraction.',
    outreachMessage: 'Greetings,\n\nFollowing your notes on mempool sandwich prevention: Solvex deployed a 380-byte header zero-knowledge dark pool router with sub-100ns execution. We have verifiable backtest proofs ready for review.',
    status: 'Signed Contract',
    valuation: 8750.00,
    isBookmarked: true,
    tags: ['HFT', 'DeFi', 'Rust Core', 'MEV-Protection'],
    executionTimeframe: '1 Month'
  },
  {
    id: 'idea-104',
    title: 'Base Waste Harvester & GPU Cycle Reclaimer',
    source: 'User Submission',
    originalText: 'Cloud clusters spend 30-40% of their compute budget on idle GPU standby time, stranded API allocations, and orphaned memory tables.',
    author: 'Todd Jeffrey Ites Jr. (TJ)',
    timestamp: '2026-08-22T11:00:00Z',
    tamScore: 95,
    feasibilityScore: 94,
    gapScore: 96,
    totalScore: 95,
    marketSize: '$22.5B Cloud Optimization & Green Computing',
    analysisDetails: 'Proprietary Solvex invention: real-time telemetry scans idle micro-allocations, reclaim unused memory and gas tokens, and redistribute compute to pending AI compilation jobs.',
    outreachMessage: 'Dear Infrastructure Lead,\n\nSolvex Base Waste Harvester automatically detects and reclaims dormant GPU/memory cycles with zero overhead, reducing cloud spend by up to 34% with verifiable Merkle audit trails. Let us demonstrate on a single cluster.',
    status: 'Secured Vault',
    valuation: 12500.00,
    isBookmarked: true,
    tags: ['Base Waste', 'Green Cloud', 'Reclamation', 'Agate Core'],
    executionTimeframe: 'Production Ready'
  },
  {
    id: 'idea-105',
    title: 'Cryptographic Escrow Bridge for International B2B Invoicing',
    source: 'r/startupideas',
    originalText: 'Cross-border freelance agencies wait 30-90 days for net-terms wire transfers while losing 4-6% in intermediary bank fees and currency conversion spreads.',
    author: 'u/global_agency_ops',
    timestamp: '2026-08-22T16:20:00Z',
    tamScore: 89,
    feasibilityScore: 90,
    gapScore: 88,
    totalScore: 89,
    marketSize: '$31.0B B2B Cross-Border Payments',
    analysisDetails: 'Immediate cashflow unlock. Combining PayPal instant capture with multi-signature smart contract escrow releases funds instantly upon automated milestone proof verification.',
    outreachMessage: 'Hi Team,\n\nWe saw your workflow friction with 60-day international invoice cycles. Solvex automated B2B escrow bridges PayPal and crypto rails with milestone-based instant clearance. Would love to share our live sandbox.',
    status: 'Outreach Sent',
    valuation: 2800.00,
    isBookmarked: false,
    tags: ['B2B Payments', 'Escrow', 'Instant Settlement'],
    executionTimeframe: '2 Weeks'
  },
  {
    id: 'idea-106',
    title: 'Dialectic Conflict Resolution Engine for Multi-Agent LLMs',
    source: 'SolveX Dialectic',
    originalText: 'When multiple AI agents debate high-stakes trading or procurement choices, hallucinations cascade. We need a mathematical synthesis engine that measures axiom contradictions in real-time.',
    author: 'SolveX Cognitive Core',
    timestamp: '2026-08-23T04:10:00Z',
    tamScore: 94,
    feasibilityScore: 93,
    gapScore: 98,
    totalScore: 95,
    marketSize: '$7.4B Multi-Agent AI Orchestration',
    analysisDetails: 'Core 88-Paradox Axiom framework: resolves logical tensions between thesis and antithesis to output deterministic synthesis without hallucination drift.',
    outreachMessage: 'Hello,\n\nAddressing your team\'s challenge with multi-agent consensus drift: Solvex dialectic engine enforces mathematical axiom boundaries across 88 fundamental paradoxes to guarantee deterministic agent consensus.',
    status: 'Secured Vault',
    valuation: 9400.00,
    isBookmarked: true,
    tags: ['Dialectic AI', 'Agentic Mesh', 'Mathematical Truth'],
    executionTimeframe: 'Production Ready'
  }
];

export const INITIAL_SOLVEX_JOBS: SolveXJobOpportunity[] = [
  {
    id: 'job-1001',
    jobId: 1001,
    title: 'Autonomous Multi-Agent RFQ Protocol & Dynamic Liquidity Router',
    description: 'We need a full-stack developer to build an automated RFQ dispatch pipeline connecting decentralized spot desks with traditional ERP systems (SAP/NetSuite). The system must support real-time cryptographic bid matching and sub-50ms pricing telemetry.',
    budget: '$3,500',
    budgetNumeric: 3500,
    board: 'upwork',
    duration: '2-3 weeks',
    clientCountry: 'United Kingdom',
    postedAgo: '18 mins ago',
    matchScore: 99,
    requiredSkills: ['React 18', 'TypeScript', 'Zero-Knowledge Proofs', 'ERP Webhooks', 'Node.js'],
    zkpVerified: true,
    escrowSecured: true,
    clientReputation: 4.95,
    suggestedBid: '$3,450',
    generatedProposal: 'Hi there,\n\nWe have an existing production-tested RFQ pipeline with sub-50ms zero-knowledge bid validation and native ERP webhook dispatch (tested across SAP, Oracle, and NetSuite). We can deploy this turnkey solution into your infrastructure within 7 days, complete with automated settlement and Merkle audit logging.\n\nBest regards,\nSolvex Autonomous Solutions Team',
    status: 'Open'
  },
  {
    id: 'job-1002',
    jobId: 1002,
    title: 'Zero-Knowledge Scheduling & Executive Calendar Shield',
    description: 'Need a privacy-preserving calendar slot matcher for a private equity network. Executives need to find mutual open windows across companies without revealing appointment titles, attendee lists, or full schedules.',
    budget: '$1,450',
    budgetNumeric: 1450,
    board: 'toptal',
    duration: '3 weeks',
    clientCountry: 'Switzerland',
    postedAgo: '42 mins ago',
    matchScore: 97,
    requiredSkills: ['ZK Snarks', 'Web Crypto API', 'Next.js/React', 'TailwindCSS'],
    zkpVerified: true,
    escrowSecured: true,
    clientReputation: 5.0,
    suggestedBid: '$1,450',
    generatedProposal: 'Dear Client,\n\nOur team specializes in zero-knowledge confidential coordination. We already have an EAL6+-verified scheduling solver that computes calendar intersections using one-way cryptographic commitments—zero calendar metadata ever leaves the executive\'s browser.\n\nReady to demonstrate our live prototype immediately.',
    status: 'Open'
  },
  {
    id: 'job-1003',
    jobId: 1003,
    title: 'On-Device Receipt/Expense Extraction & Tax Ledger Tracking',
    description: 'Build a background service and dashboard that monitors receipts/invoices, parses business expense line items, and registers tax write-offs. Since it handles personal financial transactions, all processing MUST stay secure on-device or fully encrypted under user control.',
    budget: '$2,100',
    budgetNumeric: 2100,
    board: 'freelancer',
    duration: '1 month',
    clientCountry: 'Canada',
    postedAgo: '1 hour ago',
    matchScore: 95,
    requiredSkills: ['Client-Side OCR', 'TypeScript', 'IndexedDB/LocalStorage', 'Data Sovereignty'],
    zkpVerified: true,
    escrowSecured: true,
    clientReputation: 4.88,
    suggestedBid: '$2,000',
    generatedProposal: 'Hello,\n\nWe built an on-device deterministic expense parser utilizing local WebAssembly and encrypted storage that classifies tax categories without external cloud exposure. Full export to CSV/JSON and QuickBooks included.\n\nLet\'s connect to review the architecture.',
    status: 'Bid Placed'
  },
  {
    id: 'job-1004',
    jobId: 1004,
    title: 'Secure Escrow Freelance Wallet for Crypto/ACH Clearing',
    description: 'Need a gateway system that bridges freelance marketplaces with personal broker accounts (PayPal/ACH) to ensure zero broker freeze risk. The system must accept client royalties, verify completion metrics, and release escrow automatically based on encrypted key criteria.',
    budget: '$750',
    budgetNumeric: 750,
    board: 'peopleperhour',
    duration: '5 days',
    clientCountry: 'United States',
    postedAgo: '2 hours ago',
    matchScore: 98,
    requiredSkills: ['PayPal API', 'Smart Contracts', 'Webhooks', 'Security Hardening'],
    zkpVerified: true,
    escrowSecured: true,
    clientReputation: 4.92,
    suggestedBid: '$750',
    generatedProposal: 'Hi,\n\nOur dual-rail settlement module supports both instant PayPal webhook capture and cryptographic milestone releases. We can set up your automated payout ledger with complete anti-freeze protections within 48 hours.',
    status: 'Open'
  },
  {
    id: 'job-1005',
    jobId: 1005,
    title: 'Cloud Compute Idle Detection & Base Waste Reclamation Node',
    description: 'Looking for a devops/systems architect to implement automated detection of idle Kubernetes pods, unattached EBS/cloud volumes, and dormant GPU allocations, generating automated reclaim scripts and savings reports.',
    budget: '$4,200',
    budgetNumeric: 4200,
    board: 'smart-contract',
    duration: '2 weeks',
    clientCountry: 'Germany',
    postedAgo: '3 hours ago',
    matchScore: 100,
    requiredSkills: ['Kubernetes', 'Cloud Optimization', 'Rust/Go', 'Merkle Audit'],
    zkpVerified: true,
    escrowSecured: true,
    clientReputation: 5.0,
    suggestedBid: '$4,100',
    generatedProposal: 'Greetings,\n\nSolvex Base Waste Harvester is an autonomous daemon that continuously monitors pod metrics and memory fragmentation, auto-reclaiming standby resources with zero service disruption. We will provide full documentation and automated deployment scripts.',
    status: 'In Negotiation'
  }
];

export function evaluateCustomIdea(title: string, description: string): VentureIdea {
  // Deterministic scoring engine for user input
  const words = (title + ' ' + description).toLowerCase();
  
  let tam = 75;
  let feasibility = 80;
  let gap = 70;

  if (words.includes('crypto') || words.includes('zk') || words.includes('privacy') || words.includes('zero knowledge')) {
    tam += 12;
    gap += 18;
  }
  if (words.includes('ai') || words.includes('agent') || words.includes('autonomous') || words.includes('llm')) {
    tam += 15;
    feasibility += 5;
    gap += 12;
  }
  if (words.includes('b2b') || words.includes('enterprise') || words.includes('saas') || words.includes('compliance')) {
    tam += 10;
    feasibility += 8;
    gap += 10;
  }
  if (words.includes('waste') || words.includes('cloud') || words.includes('hardware') || words.includes('energy')) {
    tam += 8;
    feasibility += 10;
    gap += 14;
  }

  tam = Math.min(99, Math.max(50, tam));
  feasibility = Math.min(98, Math.max(50, feasibility));
  gap = Math.min(99, Math.max(50, gap));
  const total = Math.round((tam * 0.4) + (feasibility * 0.3) + (gap * 0.3));

  const valuation = Math.round((total / 100) * 8500 * (1 + (gap / 100)) / 10) * 10;

  return {
    id: `idea-custom-${Date.now()}`,
    title: title.trim() || 'Untitled Venture Concept',
    source: 'User Submission',
    originalText: description.trim(),
    author: 'Active Operator',
    timestamp: new Date().toISOString(),
    tamScore: tam,
    feasibilityScore: feasibility,
    gapScore: gap,
    totalScore: total,
    marketSize: `$${((tam * 0.12) + 1.5).toFixed(1)}B Opportunity Horizon`,
    analysisDetails: `Evaluated across Market TAM (${tam}/100), Execution Feasibility (${feasibility}/100), and Competitive Gap (${gap}/100). High monetization potential with Solvex autonomous JIT scaffolding.`,
    outreachMessage: `Hello,\n\nWe analyzed your requirement for "${title}". Solvex has engineered a high-velocity solution addressing this exact market gap with verified cryptographic integrity. Let's schedule a 10-minute architecture review.`,
    status: 'Scouted',
    valuation,
    isBookmarked: false,
    tags: ['AI Evaluated', 'Custom Concept', 'Sovereign Scaffolding'],
    executionTimeframe: total > 85 ? '1-2 Weeks' : '2-4 Weeks'
  };
}
