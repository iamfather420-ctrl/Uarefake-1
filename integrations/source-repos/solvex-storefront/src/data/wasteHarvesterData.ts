// ==============================================================================
// SOLVEX CRYSTAL CLEAR BOX COMPLIANCE & BASE WASTE HARVESTER DATA
// DERIVED FROM: SolveX-Crystal-Clear-Box-Compliance-Immutibility & solvex-react-build
// AUTHOR / TRUSTEE: TODD JEFFREY ITES JR. (TJ)
// HARDWARE ROOT: MAESTRO_AGE_2026
// ==============================================================================

export interface ComplianceFrameworkRecord {
  id: string;
  code: string;
  name: string;
  authority: string;
  standardLevel: string;
  status: 'COMPLIANT' | 'VERIFIED' | 'MONITORING' | 'AUDITED';
  score: number; // 0 - 100
  glassBoxExplanation: string;
  immutabilityProof: string;
  lastScannedAt: string;
  rulesCount: number;
}

export interface WasteHarvesterMetric {
  id: string;
  category: 'GPU_STANDBY' | 'UNUSED_GAS' | 'ORPHANED_MEMORY' | 'DORMANT_API' | 'CONTAINER_LEAK';
  resourceName: string;
  clusterNode: string;
  wasteVolume: string;
  estimatedWasteUsdMonth: number;
  reclamationStatus: 'HARVESTABLE' | 'RECLAIMING' | 'RECLAIMED' | 'STANDBY';
  merkleProof: string;
  recoveredKwH: number;
  timestamp: string;
}

export interface ConsensusMemoryRecord {
  id: string;
  timestamp: string;
  event: string;
  node: string;
  fingerprintSha256: string;
  merkleRoot: string;
  status: 'COMMITTED' | 'WAL_SAFE' | 'ZERO_DRIFT';
}

export const INITIAL_COMPLIANCE_FRAMEWORKS: ComplianceFrameworkRecord[] = [
  {
    id: 'comp-01',
    code: 'FINRA-4511',
    name: 'FINRA Rule 4511 Books and Records Immutability',
    authority: 'Financial Industry Regulatory Authority',
    standardLevel: 'Tier 1 Critical Financial Archive',
    status: 'COMPLIANT',
    score: 100,
    glassBoxExplanation: 'Every transaction payload, PO issuance, and license settlement is hashed using SHA-256 with dual-node timestamp verification, preventing any post-write modification or truncation.',
    immutabilityProof: '0x8f73b198c21a44e99f1092ab5c90823901de47bb3109a87cd92938472910ba12',
    lastScannedAt: new Date().toISOString(),
    rulesCount: 14
  },
  {
    id: 'comp-02',
    code: 'SOC2-TYPE-II',
    name: 'SOC 2 Type II Security, Availability & Confidentiality',
    authority: 'AICPA Trust Services Criteria',
    standardLevel: 'Continuous Real-Time Enclave Attestation',
    status: 'COMPLIANT',
    score: 100,
    glassBoxExplanation: 'All client profile records, payment credentials, and source bundles are encrypted with AES-256-GCM and stored in air-gapped enclaves with hardware root signatures.',
    immutabilityProof: '0x22a0918cf1b98402938472910ba12091de47bb3109a87cd98f73b198c21a44e9',
    lastScannedAt: new Date().toISOString(),
    rulesCount: 28
  },
  {
    id: 'comp-03',
    code: 'ISO-27001',
    name: 'ISO/IEC 27001 Information Security Management',
    authority: 'International Organization for Standardization',
    standardLevel: 'Annex A.12 Cryptographic Controls',
    status: 'COMPLIANT',
    score: 99.8,
    glassBoxExplanation: 'Strict 380-byte header format validation ensures only cryptographically signed packets from verified node peers (NODE-01..03) are routed into core databases.',
    immutabilityProof: '0xda1578b901cd98f73b198c21a44e922a0918cf1b98402938472910ba12091de4',
    lastScannedAt: new Date().toISOString(),
    rulesCount: 32
  },
  {
    id: 'comp-04',
    code: 'FEDRAMP-HIGH',
    name: 'FedRAMP High Baseline Security Controls',
    authority: 'Federal Risk and Authorization Management Program',
    standardLevel: 'Government & Defense Level Air-Gap',
    status: 'COMPLIANT',
    score: 100,
    glassBoxExplanation: 'Local client-side execution option isolates user financial workflows from public internet relays with zero telemetry exfiltration.',
    immutabilityProof: '0x5c72a1b94e09f831ab9102c91823746a5c1029384756c9d81726354019283746',
    lastScannedAt: new Date().toISOString(),
    rulesCount: 421
  },
  {
    id: 'comp-05',
    code: 'HIPAA-SECURITY',
    name: 'HIPAA Security Rule (45 CFR Part 160/164)',
    authority: 'U.S. Department of Health and Human Services',
    standardLevel: 'PHI Zero-Knowledge Data Masking',
    status: 'COMPLIANT',
    score: 100,
    glassBoxExplanation: 'Zero PHI transmission over unencrypted channels. Complete cryptographic audit logging of any record access or schema modifications.',
    immutabilityProof: '0x32e9f1a04d88e210772c10b984102938475a6b1029384756c9d8172635401928',
    lastScannedAt: new Date().toISOString(),
    rulesCount: 19
  },
  {
    id: 'comp-06',
    code: 'EAL6-PLUS',
    name: 'Common Criteria EAL6+ Formal Verification',
    authority: 'National Information Assurance Partnership (NIAP)',
    standardLevel: 'High Robustness Hardware Enclave',
    status: 'COMPLIANT',
    score: 100,
    glassBoxExplanation: 'Formal mathematical verification of the 88 Paradox Axiom space and MMTAI routing traversal state machine with zero deadlocks.',
    immutabilityProof: '0x10b984102938475aa8f9c2104e7b83d1059f3211e038294a772c10b984102938',
    lastScannedAt: new Date().toISOString(),
    rulesCount: 88
  }
];

export const INITIAL_WASTE_METRICS: WasteHarvesterMetric[] = [
  {
    id: 'waste-01',
    category: 'GPU_STANDBY',
    resourceName: 'NVIDIA H100 SXM5 Standby Node (Cluster-US-East)',
    clusterNode: '::NODE-01',
    wasteVolume: '14.2 GPU Compute Hours',
    estimatedWasteUsdMonth: 1240.00,
    reclamationStatus: 'HARVESTABLE',
    merkleProof: '0xaa1892c91823746a5c1029384756c9d817263540192837465c72a1b94e09f831',
    recoveredKwH: 82.4,
    timestamp: '2026-08-23T16:00:00Z'
  },
  {
    id: 'waste-02',
    category: 'ORPHANED_MEMORY',
    resourceName: 'Unallocated Redis Cache Tables & IPC Buffers',
    clusterNode: '::NODE-02',
    wasteVolume: '128.5 GB Fragmented Memory',
    estimatedWasteUsdMonth: 480.00,
    reclamationStatus: 'RECLAIMED',
    merkleProof: '0xbb2903d02934857b6d2130495867d0e928374651203948576d83b2c05f10a942',
    recoveredKwH: 34.1,
    timestamp: '2026-08-23T17:15:00Z'
  },
  {
    id: 'waste-03',
    category: 'UNUSED_GAS',
    resourceName: 'Residual Micro-Gas Balances in Settlement Relayers',
    clusterNode: '::NODE-03',
    wasteVolume: '0.842 ETH / $2,840 Gas Dust',
    estimatedWasteUsdMonth: 2840.00,
    reclamationStatus: 'HARVESTABLE',
    merkleProof: '0xcc3014e13045968c7e3241506978e1fa39485762314059687e94c3d16a21ba53',
    recoveredKwH: 12.0,
    timestamp: '2026-08-23T18:00:00Z'
  },
  {
    id: 'waste-04',
    category: 'DORMANT_API',
    resourceName: 'Orphaned Webhook Listener Allocation (SAP/Oracle Bridges)',
    clusterNode: '::NODE-01',
    wasteVolume: '450K Unpolled Micro-Containers',
    estimatedWasteUsdMonth: 620.00,
    reclamationStatus: 'RECLAIMED',
    merkleProof: '0xdd4125f24156079d8f4352617089f2ab40596873425160798fa5d4e27b32cb64',
    recoveredKwH: 18.7,
    timestamp: '2026-08-23T18:25:00Z'
  }
];

export const INITIAL_CONSENSUS_MEMORY: ConsensusMemoryRecord[] = [
  {
    id: 'cm-01',
    timestamp: '2026-08-23T18:06:14.808Z',
    event: 'POST /api/v1/jobs::MATCH_SOLVEX_SUITE',
    node: 'CORE-PRIMARY (::NODE-01)',
    fingerprintSha256: 'b28462bc11215a7f2532210060b9746cb13e0701d3ce0fcda1ea800a96bb9889',
    merkleRoot: '0x8f73b198c21a44e99f1092ab5c90823901de47bb',
    status: 'COMMITTED'
  },
  {
    id: 'cm-02',
    timestamp: '2026-08-23T18:22:30.112Z',
    event: 'CRYSTAL_CLEAR_BOX::RECLAIM_GPU_STANDBY',
    node: 'EDGE-NORTH (::NODE-02)',
    fingerprintSha256: '4f8109d72c10b984102938475a6b1029384756c9d81726354019283746501928',
    merkleRoot: '0x22a0918cf1b98402938472910ba12091de47bb31',
    status: 'WAL_SAFE'
  },
  {
    id: 'cm-03',
    timestamp: '2026-08-23T18:40:02.450Z',
    event: 'MMTAI_TRAVERSAL::5_HOP_PERIMETER_VERIFIED',
    node: 'LOCAL-VLAN (::NODE-03)',
    fingerprintSha256: 'a8f9c2104e7b83d1059f3211e038294a772c10b984102938475a6b1029384756',
    merkleRoot: '0xda1578b901cd98f73b198c21a44e922a0918cf1b9',
    status: 'ZERO_DRIFT'
  }
];
