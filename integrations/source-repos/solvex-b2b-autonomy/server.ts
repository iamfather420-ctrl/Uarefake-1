import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GridNode, ParadoxOperator, SolutionAnchor, JITBuild, ProofMetric, MarketplaceTemplate, Pipeline, PipelineStep, K8sStatus } from "./src/types.js";

const app = express();
app.use(express.json());

const PORT = 3000;

// ==========================================
// 1. IN-MEMORY DATA STORAGE
// ==========================================

// Programmatically generate 54 Nodes
let gridNodes: GridNode[] = Array.from({ length: 54 }, (_, i) => {
  const nodeIndex = i + 1;
  const id = `node-${String(nodeIndex).padStart(2, '0')}`;
  
  // Assign jobs based on index ranges
  let jobType = "Synaptic Compute Task";
  let utilization = Math.floor(Math.random() * 40) + 20; // 20% to 60%
  let latency = Math.floor(Math.random() * 15) + 3; // 3ms to 18ms
  
  if (nodeIndex <= 10) {
    jobType = "Central Sovereign Sync";
    latency = Math.floor(Math.random() * 4) + 1; // ultra-low latency
  } else if (nodeIndex <= 20) {
    jobType = "Tether Synaptic RAG";
    utilization = Math.floor(Math.random() * 30) + 50; // high utilization
  } else if (nodeIndex <= 30) {
    jobType = "Paradox Resolution Anchor";
  } else if (nodeIndex <= 40) {
    jobType = "Obfuscation Vector Compiler";
  } else if (nodeIndex <= 48) {
    jobType = "Anti-Tamper Core Seal";
  } else {
    jobType = "Sandbox Efficacy Validator";
  }

  return {
    id,
    name: `SovereignNode-${String(nodeIndex).padStart(2, '0')}`,
    status: Math.random() > 0.08 ? 'active' : 'online',
    latency,
    utilization,
    jobType,
    lastPing: new Date().toISOString(),
    cryptHealth: Math.floor(Math.random() * 15) + 85 // 85% to 100%
  };
});

// Load hard-coded Synaptic Paradox Registry from local JSON manifest to ensure Black Box status
const registryPath = path.join(process.cwd(), "src", "paradox_registry.json");
const registryData = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const fullParadoxes: ParadoxOperator[] = registryData.paradoxes;
const fullSolutions: SolutionAnchor[] = registryData.solutions;

// Pre-built Autonomous Templates
const initialMarketplaceTemplates: MarketplaceTemplate[] = [
  {
    id: "tpl-liquidity",
    name: "Autonomous Liquidity Factory",
    description: "White-labeled multi-asset market maker template optimized for ultra-low latency subgrids.",
    tier: "Enterprise",
    capabilities: ["JIT Multi-chain Router", "Secured Hardware Escrow", "Dynamic Fee Arbitrage Engine"],
    version: "3.4.1",
    antiTamperReady: true
  },
  {
    id: "tpl-oracle",
    name: "Cross-Grid Oracle Synchronizer",
    description: "Secure decentralized oracle feeder integrating tethered synaptic RAG consensus layers.",
    tier: "Sovereign",
    capabilities: ["Local Synaptic Tethering", "Multi-signature Oracle Proofs", "Byzantine Fast-Recovery Core"],
    version: "1.0.2",
    antiTamperReady: true
  },
  {
    id: "tpl-vault",
    name: "dAIsy Self-Balancing Sovereign Vault",
    description: "Automated treasury asset allocator with hard-coded paradox solvers and 100% offline security.",
    tier: "Sovereign",
    capabilities: ["Anti-Entropy Shielding", "Zero-Knowledge Telemetry Audits", "Hardware-bound Key Rotation"],
    version: "2.1.0-STABLE",
    antiTamperReady: true
  },
  {
    id: "tpl-gateway",
    name: "Institutional Multi-Escrow Gateway",
    description: "Highly compliant transaction clearing system fully integrated with NIST SP 800-53 auditing parameters.",
    tier: "Standard",
    capabilities: ["NIST Audited Ledgering", "Automated AML Signatures", "Anti-entropy Consensus Resolver"],
    version: "4.0.5",
    antiTamperReady: true
  }
];

const baseTemplateCategories = [
  {
    prefix: "Autonomous Outreach Hub",
    descriptions: [
      "Targeted institutional lead generation and cold outreach optimizer running on sovereign subgrid nodes.",
      "Omni-channel marketing outreach advertiser utilizing hardened cryptographic metadata buffers.",
      "High-velocity client engagement pipeline automating localized RAG contextual outreach flows."
    ],
    capabilities: ["Local Synaptic Outreach", "Metadata Anonymizer", "Decentralized SMTP Router"],
    tier: "Enterprise" as const
  },
  {
    prefix: "Sovereign Negotiation Core",
    descriptions: [
      "Hardware-enclosed consensus negotiator evaluating financial bids with zero-leak performance metrics.",
      "Automated legal and escrow resolution engine executing under proprietary anti-tamper bounds.",
      "Multi-signature bid evaluator utilizing cryptographic proof-matrices to finalize B2B pricing."
    ],
    capabilities: ["Escrow Smart-Lock", "Consensus Contract Builder", "Multi-Sig Bid Validator"],
    tier: "Sovereign" as const
  },
  {
    prefix: "Secure Encrypted Communicator",
    descriptions: [
      "Zero-trust communication conduit for multi-party institutional communications and file sharing.",
      "Byzantine fault-tolerant communication relay isolating message histories in offline memory enclaves.",
      "Anti-entropy communication interface with perfect forward secrecy and randomized packet hops."
    ],
    capabilities: ["Perfect Forward Secrecy", "Isolated Memory Relays", "Entropy White-Noise Injector"],
    tier: "Sovereign" as const
  },
  {
    prefix: "High-Velocity Sales Closer",
    descriptions: [
      "Dynamic B2B sales pipeline closer utilizing real-time performance tracking and local vectors.",
      "Automated procurement matching engine designed to resolve sales pipeline liquidity deadlocks.",
      "Intelligent institutional order matching system with dual-market sales and communication guarantees."
    ],
    capabilities: ["Order Match Resolver", "Real-time Telemetry Ledger", "NIST-SP-800-53 Compliance"],
    tier: "Standard" as const
  }
];

const marketplaceTemplates: MarketplaceTemplate[] = [...initialMarketplaceTemplates];

for (let i = 5; i <= 105; i++) {
  const cat = baseTemplateCategories[i % baseTemplateCategories.length];
  marketplaceTemplates.push({
    id: `tpl-${String(i).padStart(3, '0')}`,
    name: `${cat.prefix} Node-${(i % 54) + 1}`,
    description: cat.descriptions[i % cat.descriptions.length],
    tier: cat.tier,
    capabilities: [...cat.capabilities, `Secure Module-A${i}`],
    version: `${Math.floor(i / 10) + 1}.${i % 10}.${i % 5}-STABLE`,
    antiTamperReady: true
  });
}

// Simulated JIT Builds list
let jitBuilds: JITBuild[] = [
  {
    id: "bld-09823",
    templateId: "tpl-vault",
    templateName: "dAIsy Self-Balancing Sovereign Vault",
    status: "completed",
    logs: [
      "[SYSTEM] Init JIT Sovereign Build Pipeline v1.0.0-STABLE",
      "[TETHER] Fetching template repository ast tree...",
      "[AXIOM] Mapping paradox operators PX-02, PX-04, PX-05 to solution anchors...",
      "[WATERMARK] Hardening binary file headers with fingerprint: SHA-256 (dAIsy_HaMINJA_Core)",
      "[OBFUSCATION] Flattening control flow, injecting randomized jumps and instructions...",
      "[FINGERPRINT] Generating build signature: 0x93FA7B3...8E901F",
      "[ANTITAMPER] Certifying layout seal with RSA-4096 anti-tamper signature...",
      "[COMPLETED] Signed binary successfully exported and deployed to Sovereign Node-12."
    ],
    watermark: "dAIsy_HaMINJA_Core_Verified_Sovereign",
    sha256Fingerprint: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    antiTamperSeal: "SIG_SOVEREIGN_77A82FB14C9E0D90EE2F8A",
    duration: 3420,
    completedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    credentialsConfig: {
      "SOVEREIGN_PASSPHRASE": "************",
      "GRID_NETWORK_ID": "SOLVEX_MAIN_NET"
    }
  }
];

// Repositories imported by the user (Simulated GitHub integrations)
interface GitHubRepo {
  id: string;
  name: string;
  owner: string;
  stars: number;
  openIssues: number;
  language: string;
  branch: string;
  lastCommit: string;
  unificationEligible: boolean;
  status: 'unconnected' | 'connected' | 'unifying';
}

let importedRepos: GitHubRepo[] = [
  {
    id: "repo-1",
    name: "solvex-sovereign-kernel",
    owner: "jessicaannmarieites1989",
    stars: 142,
    openIssues: 0,
    language: "TypeScript",
    branch: "main",
    lastCommit: "Validated signature: 54-node heartbeat core active",
    unificationEligible: true,
    status: 'unconnected'
  },
  {
    id: "repo-2",
    name: "tether-rag-synaptic-base",
    owner: "jessicaannmarieites1989",
    stars: 88,
    openIssues: 2,
    language: "Python",
    branch: "master",
    lastCommit: "Optimize local vector lookups to prevent web-API dependence",
    unificationEligible: true,
    status: 'unconnected'
  },
  {
    id: "repo-3",
    name: "paradox-solution-anchors",
    owner: "jessicaannmarieites1989",
    stars: 204,
    openIssues: 1,
    language: "C++",
    branch: "stable",
    lastCommit: "Complete integration for 58 proprietary paradox mathematical resolvers",
    unificationEligible: true,
    status: 'unconnected'
  },
  {
    id: "repo-4",
    name: "jit-apk-binary-obfuscator",
    owner: "jessicaannmarieites1989",
    stars: 95,
    openIssues: 0,
    language: "Go",
    branch: "main",
    lastCommit: "Implement hardened watermark injecting and anti-tamper seal generation",
    unificationEligible: true,
    status: 'unconnected'
  }
];

// Dynamically fetch real public or private GitHub repos for Jessica
async function loadRealGithubRepos(token?: string): Promise<boolean> {
  try {
    let url = "https://api.github.com/users/jessicaannmarieites1989/repos?per_page=100&sort=updated";
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "dAIsy-HaMINJA-Sovereign-Core"
    };

    if (token && token !== 'ghp_dAIsy_HaMINJA_SovereignCore_Token_98231FF') {
      url = "https://api.github.com/user/repos?per_page=100&sort=updated";
      headers["Authorization"] = `token ${token}`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      console.log(`[GITHUB FETCH] Failed to load real repos: ${response.status} ${response.statusText}`);
      return false;
    }

    const reposData = await response.json();
    if (!Array.isArray(reposData)) {
      return false;
    }

    if (reposData.length > 0) {
      importedRepos = reposData.map((repo: any) => {
        return {
          id: String(repo.id),
          name: repo.name,
          owner: repo.owner?.login || "jessicaannmarieites1989",
          stars: repo.stargazers_count || 0,
          openIssues: repo.open_issues_count || 0,
          language: repo.language || "TypeScript",
          branch: repo.default_branch || "main",
          lastCommit: repo.description || `Pushed at: ${new Date(repo.pushed_at).toLocaleDateString()}`,
          unificationEligible: true,
          status: token ? 'connected' : 'unconnected'
        };
      });
      console.log(`[GITHUB FETCH] Successfully loaded ${importedRepos.length} real repositories for owner: ${importedRepos[0].owner}`);
      return true;
    }
    return false;
  } catch (e) {
    console.error("[GITHUB FETCH ERROR]", e);
    return false;
  }
}

// Sandbox Performance Suite metrics history
let performanceMetricsHistory: ProofMetric[] = Array.from({ length: 30 }, (_, i) => {
  const timeOffset = (30 - i) * 10; // 10s intervals
  return {
    timestamp: new Date(Date.now() - timeOffset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    tps: Math.floor(Math.random() * 250) + 1800, // 1800 to 2050 TPS
    cpuLoad: Math.floor(Math.random() * 15) + 45, // 45% to 60%
    ramUtilization: Math.floor(Math.random() * 5) + 62, // 62% to 67%
    blockHeight: 1204890 + i,
    latency: Math.floor(Math.random() * 4) + 6 // 6ms to 10ms
  };
});

// Grid chaos variable
let chaosFactor = 0; // 0 = stable, 100 = extreme simulation

// ==========================================
// 1B. AUTOMATED CI/CD PIPELINES SEED DATA
// ==========================================
let pipelines: Pipeline[] = [
  {
    id: "sovereign-kernel",
    name: "Sovereign Kernel Control Plane",
    repository: "solvex-sovereign-kernel",
    lastBuildStatus: "success",
    lastBuildTime: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
    dockerImage: "ghcr.io/jessicaannmarieites1989/solvex-sovereign-kernel:latest",
    vulns: { critical: 0, high: 2, medium: 5 },
    k8s: { name: "sovereign-kernel", namespace: "daisy-prod", replicas: 3, availableReplicas: 3, cpuUtilization: 42, memoryUtilization: 55 },
    steps: [
      { name: "Checkout Code", status: "success", durationSeconds: 4, logs: ["Checking out github.com/jessicaannmarieites1989/solvex-sovereign-kernel...", "HEAD is now at d67a80b Merge pull request #45 from grid-sync"] },
      { name: "ESLint & Typecheck", status: "success", durationSeconds: 12, logs: ["npm ci completed in 5.2s", "npm run lint", "No syntax or style warnings detected."] },
      { name: "SAST Vulnerability Scan", status: "success", durationSeconds: 18, logs: ["Executing Snyk dependency checks...", "Checking 143 components...", "Snyk verified: 0 high, 2 medium, 5 low severity vulnerabilities detected."] },
      { name: "Unit & Integration Tests", status: "success", durationSeconds: 24, logs: ["npm run test --coverage", "PASS  src/tests/grid.test.ts", "PASS  src/tests/auth.test.ts", "All 18 tests passed. Code coverage: 99.1%"] },
      { name: "Secure Docker Build", status: "success", durationSeconds: 32, logs: ["Sending build context to Docker daemon 42.1MB", "Step 1/12 FROM node:20-alpine AS builder", "Successfully built and tagged ghcr.io/solvex/sovereign-kernel:latest"] },
      { name: "Trivy Safety Audit", status: "success", durationSeconds: 15, logs: ["Trivy scan started on ghcr.io/solvex/sovereign-kernel:latest", "0 CRITICAL vulnerabilities found.", "2 HIGH vulnerabilities found (ignored - unfixed)."] },
      { name: "Kubernetes Canary Rollout", status: "success", durationSeconds: 45, logs: ["Kubeconfig context initialized.", "Applying deployment.yaml and hpa.yaml to cluster...", "Rollout completed: 3 replicas healthy inside namespace daisy-prod."] }
    ]
  },
  {
    id: "tether-rag",
    name: "Tether Synaptic RAG Core",
    repository: "tether-rag-synaptic-base",
    lastBuildStatus: "success",
    lastBuildTime: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
    dockerImage: "ghcr.io/jessicaannmarieites1989/tether-rag-synaptic-base:latest",
    vulns: { critical: 0, high: 0, medium: 2 },
    k8s: { name: "tether-rag", namespace: "daisy-prod", replicas: 2, availableReplicas: 2, cpuUtilization: 58, memoryUtilization: 78 },
    steps: [
      { name: "Checkout Code", status: "success", durationSeconds: 5, logs: ["Checking out github.com/jessicaannmarieites1989/tether-rag-synaptic-base...", "HEAD is now at f12c82c Fix local vector index cache invalidation"] },
      { name: "Python PEP8 Lints", status: "success", durationSeconds: 8, logs: ["pip install flake8 black", "black --check src/", "No styling issues found."] },
      { name: "Bandit Security Scan", status: "success", durationSeconds: 12, logs: ["Bandit scan initialized...", "0 critical/high issues detected."] },
      { name: "Pytest Suite", status: "success", durationSeconds: 21, logs: ["pytest -v --cov", "tests/test_vector.py::test_similarity_search PASSED", "tests/test_tether.py::test_local_consensus PASSED", "All 8 tests passed successfully."] },
      { name: "Secure Docker Build", status: "success", durationSeconds: 45, logs: ["Docker daemon packaging...", "Built image ghcr.io/solvex/tether-rag:latest"] },
      { name: "Trivy Safety Audit", status: "success", durationSeconds: 10, logs: ["Trivy container security check complete. 0 vulnerabilities found."] },
      { name: "Kubernetes Rollout", status: "success", durationSeconds: 30, logs: ["Applying deploy/k8s/tether-rag manifest...", "Autoscalers mapped. 2/2 replica pods verified."] }
    ]
  },
  {
    id: "paradox-solver",
    name: "Paradox Mathematical Resolver",
    repository: "paradox-solution-anchors",
    lastBuildStatus: "success",
    lastBuildTime: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
    dockerImage: "ghcr.io/jessicaannmarieites1989/paradox-solution-anchors:latest",
    vulns: { critical: 0, high: 1, medium: 1 },
    k8s: { name: "paradox-solver", namespace: "daisy-prod", replicas: 4, availableReplicas: 4, cpuUtilization: 68, memoryUtilization: 45 },
    steps: [
      { name: "Checkout Code", status: "success", durationSeconds: 3, logs: ["Checking out github.com/jessicaannmarieites1989/paradox-solution-anchors...", "HEAD is now at 8b2910c Optimize WASM memory layout"] },
      { name: "Cargo Format & Clippy", status: "success", durationSeconds: 15, logs: ["cargo fmt --check", "cargo clippy -- -D warnings", "All Rust linting patterns succeeded."] },
      { name: "Cargo Audit Scan", status: "success", durationSeconds: 10, logs: ["Auditing dependencies for known CVEs...", "No critical vulnerabilities in crates.io ecosystem."] },
      { name: "Cargo Tests", status: "success", durationSeconds: 28, logs: ["cargo test --verbose", "test paradoxes::test_quantum_decoy ... ok", "test paradoxes::test_anti_entropy_shield ... ok", "All tests passed (38 assertions)."] },
      { name: "Secure Docker Build", status: "success", durationSeconds: 78, logs: ["Multi-stage Docker building of binary target...", "UPX compression complete. Image size: 28.4MB"] },
      { name: "Trivy Safety Audit", status: "success", durationSeconds: 12, logs: ["0 CRITICAL, 1 HIGH detected in debian-slim base (ignored)."] },
      { name: "Kubernetes Rollout", status: "success", durationSeconds: 35, logs: ["Updating gRPC Service in namespace daisy-prod...", "4 pods verified running."] }
    ]
  },
  {
    id: "jit-obfuscator",
    name: "JIT Binary & APK Obfuscator",
    repository: "jit-apk-binary-obfuscator",
    lastBuildStatus: "success",
    lastBuildTime: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    dockerImage: "ghcr.io/jessicaannmarieites1989/jit-apk-binary-obfuscator:latest",
    vulns: { critical: 1, high: 0, medium: 0 },
    k8s: { name: "jit-obfuscator", namespace: "daisy-prod", replicas: 2, availableReplicas: 2, cpuUtilization: 24, memoryUtilization: 32 },
    steps: [
      { name: "Checkout Code", status: "success", durationSeconds: 4, logs: ["Checking out github.com/jessicaannmarieites1989/jit-apk-binary-obfuscator...", "HEAD is now at a789e01 Add anti-tamper dynamic signers"] },
      { name: "Go Formatting Check", status: "success", durationSeconds: 5, logs: ["gofmt -l check", "Code formatting is correct."] },
      { name: "Govulncheck Scan", status: "success", durationSeconds: 8, logs: ["govulncheck ./...", "1 medium vulnerability found in compress/gzip library."] },
      { name: "Go Unit Tests", status: "success", durationSeconds: 14, logs: ["go test -v -race -cover", "=== RUN   TestObfuscateControlFlow", "--- PASS: TestObfuscateControlFlow (0.12s)", "All Go tests succeeded (cover: 84.1%)."] },
      { name: "Secure Docker Build", status: "success", durationSeconds: 38, logs: ["Building Go binary targets...", "Executing UPX packing...", "Artifact size: 8.9MB"] },
      { name: "Trivy Safety Audit", status: "success", durationSeconds: 8, logs: ["Trivy scan: 1 CRITICAL found in upstream alpine base (patched locally)."] },
      { name: "Kubernetes Rollout", status: "success", durationSeconds: 22, logs: ["Applying deployment.yaml to cluster daisy-prod...", "2/2 pods online."] }
    ]
  }
];

// ==========================================
// 2. DYNAMIC WORKLOAD UPDATING ENGINE (Simulation)
// ==========================================
setInterval(() => {
  // Update Node Telemetry slightly
  gridNodes = gridNodes.map(node => {
    if (node.status === 'rebooting') return node;
    
    // Nodes fluctuate based on chaosFactor
    const utilizationDelta = (Math.random() * 10 - 5) + (chaosFactor * 0.15);
    const latencyDelta = (Math.random() * 4 - 2) + (chaosFactor * 0.2);
    
    let utilization = Math.max(5, Math.min(99, Math.round(node.utilization + utilizationDelta)));
    let latency = Math.max(1, Math.min(250, Math.round(node.latency + latencyDelta)));
    let status = node.status;
    let cryptHealth = node.cryptHealth;

    // Simulate occasional random diagnostic needs
    if (Math.random() < 0.005 && node.status === 'active') {
      status = 'diagnostic';
    }

    if (status === 'diagnostic') {
      utilization = Math.round(utilization * 1.5);
      cryptHealth = Math.max(50, cryptHealth - 1);
    }

    return {
      ...node,
      utilization,
      latency,
      status,
      cryptHealth,
      lastPing: new Date().toISOString()
    };
  });

  // Inject new performance metric
  const lastMetric = performanceMetricsHistory[performanceMetricsHistory.length - 1];
  const tpsModifier = chaosFactor > 0 ? (Math.random() * 300 - 450) : (Math.random() * 100 - 50);
  const cpuModifier = chaosFactor > 0 ? (Math.random() * 15 + 10) : (Math.random() * 8 - 4);
  
  const newMetric: ProofMetric = {
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    tps: Math.max(500, Math.round(1950 + tpsModifier)),
    cpuLoad: Math.max(10, Math.min(100, Math.round(52 + cpuModifier))),
    ramUtilization: Math.max(10, Math.min(100, Math.round(64 + (Math.random() * 2 - 1)))),
    blockHeight: lastMetric.blockHeight + 1,
    latency: Math.max(1, Math.round(7.5 + (chaosFactor * 0.1) + (Math.random() * 2 - 1)))
  };

  performanceMetricsHistory.push(newMetric);
  if (performanceMetricsHistory.length > 50) {
    performanceMetricsHistory.shift();
  }
}, 3000);

// ==========================================
// 3. API ENDPOINTS
// ==========================================

// System general metrics
app.get("/api/system/status", (req, res) => {
  const activeNodesCount = gridNodes.filter(n => n.status === 'active' || n.status === 'online').length;
  const criticalParadoxesCount = fullParadoxes.filter(p => p.status === 'vulnerable').length;
  const currentAvgLatency = parseFloat((gridNodes.reduce((acc, n) => acc + n.latency, 0) / 54).toFixed(2));
  const currentAvgUtilization = parseFloat((gridNodes.reduce((acc, n) => acc + n.utilization, 0) / 54).toFixed(2));

  res.json({
    gridHealth: parseFloat(((activeNodesCount / 54) * 100).toFixed(1)),
    activeNodesCount,
    totalNodes: 54,
    criticalParadoxesCount,
    totalParadoxes: 88,
    totalSolutions: 105,
    avgLatencyMs: currentAvgLatency,
    avgUtilizationPercent: currentAvgUtilization,
    tetherStatus: "SYNAPTIC_CONSENSUS_STABLE",
    complianceVerified: true,
    chaosFactor
  });
});

// Grid nodes query
app.get("/api/grid/nodes", (req, res) => {
  res.json(gridNodes);
});

// Action: Reboot a node
app.post("/api/grid/nodes/:id/reboot", (req, res) => {
  const { id } = req.params;
  const nodeIndex = gridNodes.findIndex(n => n.id === id);
  if (nodeIndex === -1) {
    return res.status(404).json({ error: "Node not found" });
  }

  // Set to rebooting
  gridNodes[nodeIndex].status = "rebooting";
  gridNodes[nodeIndex].utilization = 0;
  gridNodes[nodeIndex].latency = 0;

  // Schedule restore
  setTimeout(() => {
    const node = gridNodes[nodeIndex];
    if (node) {
      node.status = "online";
      node.utilization = Math.floor(Math.random() * 25) + 20;
      node.latency = Math.floor(Math.random() * 10) + 5;
      node.cryptHealth = 100;
      node.lastPing = new Date().toISOString();
    }
  }, 5000);

  res.json({ success: true, message: `Node ${id} entered reboot sequence. Will return online in 5 seconds.`, node: gridNodes[nodeIndex] });
});

// Action: Node diagnostic repair
app.post("/api/grid/nodes/:id/diagnostic", (req, res) => {
  const { id } = req.params;
  const nodeIndex = gridNodes.findIndex(n => n.id === id);
  if (nodeIndex === -1) {
    return res.status(404).json({ error: "Node not found" });
  }

  gridNodes[nodeIndex].status = "active";
  gridNodes[nodeIndex].cryptHealth = 100;
  gridNodes[nodeIndex].utilization = Math.floor(Math.random() * 15) + 30;
  gridNodes[nodeIndex].lastPing = new Date().toISOString();

  res.json({ success: true, message: `Node ${id} diagnostic repair completed successfully.`, node: gridNodes[nodeIndex] });
});

// Paradox registry
app.get("/api/paradoxes", (req, res) => {
  const { category, search } = req.query;
  let list = [...fullParadoxes];

  if (category && (category === "shared" || category === "proprietary")) {
    list = list.filter(p => p.category === category);
  }

  if (search) {
    const term = String(search).toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(term) || p.code.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  }

  res.json(list);
});

// Solution registry
app.get("/api/solutions", (req, res) => {
  res.json(fullSolutions);
});

// Templates list
app.get("/api/templates", (req, res) => {
  res.json(marketplaceTemplates);
});

// GitHub Repos list
app.get("/api/github/repos", (req, res) => {
  res.json(importedRepos);
});

// Action: Import / Connect a repository
app.post("/api/github/repos/connect", async (req, res) => {
  const { token, repoIds } = req.body;
  if (!token) {
    return res.status(400).json({ error: "Access token required to connect repositories securely." });
  }

  // Handle active real token validation
  const isRealToken = token && token.startsWith("ghp_") && token !== 'ghp_dAIsy_HaMINJA_SovereignCore_Token_98231FF';
  if (isRealToken) {
    console.log(`[GITHUB CONNECT] Real PAT provided. Initializing secure handshake...`);
    const success = await loadRealGithubRepos(token);
    if (!success) {
      return res.status(400).json({ error: "Failed to authenticate with GitHub or fetch user repositories. Please verify your Personal Access Token (PAT) validity and scopes." });
    }
    return res.json({ 
      success: true, 
      message: `Successfully authenticated via OAuth/PAT handshake. ${importedRepos.length} active enterprise repositories synchronized from your real GitHub workspace into the secure dAIsy sandbox.`, 
      repos: importedRepos 
    });
  }

  if (!repoIds || !Array.isArray(repoIds)) {
    return res.status(400).json({ error: "Invalid repository selection." });
  }

  importedRepos = importedRepos.map(repo => {
    if (repoIds.includes(repo.id)) {
      return { ...repo, status: 'connected' };
    }
    return repo;
  });

  res.json({ success: true, message: `Successfully authenticated with secure token. ${repoIds.length} repositories mapped into dAIsy sandbox.`, repos: importedRepos });
});

// Action: Set chaos workload injector
app.post("/api/sandbox/chaos", (req, res) => {
  const { factor } = req.body;
  if (typeof factor !== 'number' || factor < 0 || factor > 100) {
    return res.status(400).json({ error: "Chaos factor must be a percentage between 0 and 100." });
  }

  chaosFactor = factor;
  res.json({ success: true, chaosFactor, message: `Chaos simulation set to ${factor}%. Grid workloads updating.` });
});

// Performance History query
app.get("/api/sandbox/metrics", (req, res) => {
  res.json(performanceMetricsHistory);
});

// JIT Builds list
app.get("/api/builds", (req, res) => {
  res.json(jitBuilds);
});

// Trigger a JIT Unification Build
app.post("/api/builds", (req, res) => {
  const { templateId, reposToUnify, config } = req.body;
  
  let templateName = "Custom Autonomous Bundle";
  let watermarkLabel = "Sovereign_Unification_Payload";

  if (templateId) {
    const tpl = marketplaceTemplates.find(t => t.id === templateId);
    if (!tpl) return res.status(404).json({ error: "Template not found" });
    templateName = tpl.name;
    watermarkLabel = config?.WATERMARK || (tpl.name.replace(/\s+/g, '_') + '_Release');
  } else if (reposToUnify && Array.isArray(reposToUnify)) {
    const names = importedRepos.filter(r => reposToUnify.includes(r.id)).map(r => r.name);
    templateName = `Unified Build: ${names.join(' + ')}`;
    watermarkLabel = config?.WATERMARK || "Unified_Sovereign_Payload_Release";
  } else {
    return res.status(400).json({ error: "Template ID or repositories to unify must be selected." });
  }

  const buildId = `bld-${Math.floor(Math.random() * 90000) + 10000}`;
  const newBuild: JITBuild = {
    id: buildId,
    templateId: templateId || "unified-repos",
    templateName,
    status: "queued",
    logs: [
      "[SYSTEM] Queueing unified hardware-bound JIT compilation pipeline...",
      "[SYSTEM] Resolving full workspace files to bundle...",
      `[CONFIG] Applied Sovereign Compile Parameters:`,
      `  - Obfuscation Aggression: ${config?.OBFUSCATION_LEVEL || 'High'}`,
      `  - Anti-Tamper Core Seal: ${config?.ANTI_TAMPER || 'ENABLED'} (RSA-4096 Security Core)`,
      `  - Watermark Signature: ${watermarkLabel}`,
      `  - Target Grid Network: ${config?.GRID_NETWORK_ID || 'SOLVEX_ENTERPRISE_MAINNET'}`
    ],
    watermark: "",
    sha256Fingerprint: "",
    antiTamperSeal: "",
    duration: 0,
    credentialsConfig: config || {}
  };

  jitBuilds.unshift(newBuild);

  // Asynchronous progress simulator in server memory
  let currentStep = 0;
  const steps = [
    {
      status: "watermarking" as const,
      log: `[WATERMARK] Finalizing binary export with designated watermark label: [${watermarkLabel}]`,
      watermark: `SECURE_WATERMARK_WATERMARKED_${watermarkLabel.toUpperCase()}`
    },
    {
      status: "obfuscating" as const,
      log: `[OBFUSCATION] Enforcing established obfuscation aggression level: [${config?.OBFUSCATION_LEVEL || 'High'}]. Scrambling memory register offsets & instruction blocks...`
    },
    {
      status: "fingerprinting" as const,
      log: "[FINGERPRINT] Computing secure SHA-256 binary fingerprint across compiled AST matrices...",
      sha256Fingerprint: "sha256-" + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10) + Math.random().toString(16).substring(2, 10)
    },
    {
      status: "sealing" as const,
      log: `[ANTITAMPER] Injecting RSA-4096 Anti-Tamper Core Seal envelope. Digitally signing structural partition layout...`,
      antiTamperSeal: "SOVEREIGN_RSA4096_SEAL_" + Math.random().toString(36).substring(2, 12).toUpperCase()
    },
    {
      status: "completed" as const,
      log: "[COMPLETED] Secure JIT compilation successfully finalized. Obfuscated binary is 100.00% verified & ready for node-grid distribution."
    }
  ];

  const buildTimer = setInterval(() => {
    const bld = jitBuilds.find(b => b.id === buildId);
    if (!bld) {
      clearInterval(buildTimer);
      return;
    }

    const step = steps[currentStep];
    bld.status = step.status;
    bld.logs.push(step.log);
    
    if (step.watermark) bld.watermark = step.watermark;
    if (step.sha256Fingerprint) bld.sha256Fingerprint = step.sha256Fingerprint;
    if (step.antiTamperSeal) bld.antiTamperSeal = step.antiTamperSeal;

    currentStep++;

    if (currentStep >= steps.length) {
      bld.duration = Math.floor(Math.random() * 1500) + 2000; // 2s to 3.5s
      bld.completedAt = new Date().toISOString();
      clearInterval(buildTimer);
    }
  }, 1200); // Progress every 1.2s

  res.json({ success: true, buildId, message: "JIT Sovereign Unification compile job successfully started.", build: newBuild });
});


// ==========================================
// 3B. CI/CD PIPELINE ENDPOINTS
// ==========================================

// Query all pipelines
app.get("/api/cicd/pipelines", (req, res) => {
  res.json(pipelines);
});

// Trigger microservice build and deployment pipeline
app.post("/api/cicd/pipelines/:id/trigger", (req, res) => {
  const { id } = req.params;
  const pipeline = pipelines.find(p => p.id === id);
  if (!pipeline) {
    return res.status(404).json({ error: "Sovereign pipeline not found" });
  }

  if (pipeline.lastBuildStatus === "running") {
    return res.status(400).json({ error: "Pipeline is already execution-bound. Please wait." });
  }

  // Update status to running
  pipeline.lastBuildStatus = "running";
  pipeline.lastBuildTime = new Date().toISOString();
  
  // Reset steps to pending
  pipeline.steps = pipeline.steps.map(step => ({
    ...step,
    status: "pending"
  }));

  // Create an automated sequential runner
  let currentStepIndex = 0;
  
  // Set the first step to running
  pipeline.steps[0].status = "running";

  const pipelineTimer = setInterval(() => {
    const pipe = pipelines.find(p => p.id === id);
    if (!pipe) {
      clearInterval(pipelineTimer);
      return;
    }

    // Complete current step
    const currentStep = pipe.steps[currentStepIndex];
    if (currentStep) {
      currentStep.status = "success";
    }

    // Move to next step
    currentStepIndex++;

    if (currentStepIndex < pipe.steps.length) {
      // Start next step
      pipe.steps[currentStepIndex].status = "running";
    } else {
      // All steps completed successfully
      pipe.lastBuildStatus = "success";
      clearInterval(pipelineTimer);
    }
  }, 2500); // Progress to next step every 2.5 seconds

  res.json({ success: true, message: `Autonomous CI/CD run successfully triggered for ${pipeline.name}.`, pipeline });
});

// Trigger Kubernetes rolling redeployment
app.post("/api/cicd/pipelines/:id/redeploy", (req, res) => {
  const { id } = req.params;
  const pipeline = pipelines.find(p => p.id === id);
  if (!pipeline) {
    return res.status(404).json({ error: "Sovereign pipeline not found" });
  }

  // Drain active replica pods
  pipeline.k8s.availableReplicas = 0;
  pipeline.k8s.cpuUtilization = 0;
  pipeline.k8s.memoryUtilization = 0;

  // Slowly roll pods back online
  let scaledCount = 0;
  const scaleTarget = pipeline.k8s.replicas;

  const rolloutTimer = setInterval(() => {
    const pipe = pipelines.find(p => p.id === id);
    if (!pipe) {
      clearInterval(rolloutTimer);
      return;
    }

    scaledCount++;
    pipe.k8s.availableReplicas = scaledCount;
    pipe.k8s.cpuUtilization = Math.floor(Math.random() * 20) + 30; // ~30-50% utilization
    pipe.k8s.memoryUtilization = Math.floor(Math.random() * 15) + 45; // ~45-60% utilization

    if (scaledCount >= scaleTarget) {
      pipe.k8s.availableReplicas = scaleTarget;
      clearInterval(rolloutTimer);
    }
  }, 1500); // Scale up 1 replica pod every 1.5 seconds

  res.json({ success: true, message: `Rolling deployment initiated on Kubernetes cluster for ${pipeline.k8s.name}.` });
});


// ==========================================
// 4. VITE MIDDLEWARE & STATIC ASSET DELIVERY
// ==========================================
async function startServer() {
  // Pre-load real public github repos for Jessica Ann Marie Ites if reachable
  console.log("[GITHUB FETCH] Initiating background load of public repositories for jessicaannmarieites1989...");
  loadRealGithubRepos().catch(err => {
    console.warn("[GITHUB FETCH] Background loading of repositories failed (falling back to sandbox defaults):", err);
  });

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting Sovereign Core in sandbox DEVELOPMENT mode...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting Sovereign Core in sandbox PRODUCTION mode...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`dAIsy HaMINJA Sovereign Core Server online and listening on http://localhost:${PORT}`);
    console.log("54-Node Grid heartbeat protocol active.");
  });
}

startServer();
