import { useState, useEffect } from "react";
import { DashboardLayout } from "../components/DashboardLayout";

// Cyber Styling Theme constants
const CYBER_GOLD = "#D4AF37";
const CYBER_CYAN = "#00E5FF";
const CYBER_PURPLE = "#BB86FC";
const CYBER_BLUE = "#3B82F6";
const CYBER_RED = "#EF4444";

interface Paradox {
  id: string;
  title: string;
  summary: string;
  paradoxStatement: string;
  secureSolution: string;
  technicalStack: string;
  difficulty: string;
  category: string;
  costUsd: number;
  cryptographicPrimitives: string;
}

const DEFAULT_PARADOXES: Paradox[] = [
  {
    id: "router_01",
    title: "Slippage-Free Multi-Protocol Router",
    summary: "Routes massive capital transfers instantly across legacy backends and DeFi liquidity pools with zero atomic slippage.",
    paradoxStatement: "High-volume capital routes across legacy structures (SWIFT, ISO 20022) and AMMs introduce high settlement latency and vulnerability to atomic front-running or front-running bots.",
    secureSolution: "Splits bulk transfers into dynamic micro-tranches over private Ring-Signature Escrow pools, using predictive PID loops to settle trades inside hardware-secured enclaves, masking path routing until execution is complete.",
    technicalStack: "Rust WASM, Ring-Signatures, Intel SGX Enclave, Pid Control Loops, ISO 20022 parsing",
    difficulty: "Extreme",
    category: "Financial",
    costUsd: 12500000.0,
    cryptographicPrimitives: "Ring Signatures, Shamir Secret Splits, ECDSA"
  },
  {
    id: "zk_code_02",
    title: "Zero-Knowledge Code Verification",
    summary: "Automate codebase and software compliance audits mathematically without exposing raw proprietary source code.",
    paradoxStatement: "Compliance teams must thoroughly audit proprietary source code to ensure safety and policy compliance, but engineering teams refuse to share the codebase to protect intellectual property.",
    secureSolution: "Compiles the codebase Abstract Syntax Tree (AST) into a flat algebraic circuit. Runs zk-SNARK interactive protocols where the prover proves logic satisfies constraints (e.g. no illegal destinations) without revealing raw code lines.",
    technicalStack: "zk-SNARKs, Groth16 Prover, AST Parser, WASM",
    difficulty: "Sovereign",
    category: "Compliance",
    costUsd: 8400000.0,
    cryptographicPrimitives: "zk-SNARKs, Groth16, Keccak-256"
  },
  {
    id: "api_bridge_03",
    title: "Incompatible API Messaging Bridge",
    summary: "Bridges legacy and modern API protocols with sub-microsecond latency and cryptographic verification.",
    paradoxStatement: "Converting real-time payloads between legacy structures (FIX, ISO 8583) and modern microservices (gRPC, JSON) creates systemic lag, translation errors, and tampering vectors.",
    secureSolution: "Performs byte-level transpilation directly in L4 sockets using WebAssembly executed inside a hardware-isolated secure enclave. Emits continuous Merkle proofs of payload state transitions to guarantee tamper-proof routing.",
    technicalStack: "WebAssembly, Merkle Trees, Intel SGX, gRPC L4 socket binding",
    difficulty: "Critical",
    category: "Infrastructure",
    costUsd: 4500000.0,
    cryptographicPrimitives: "Merkle-Patricia Trees, SHA-256, HMAC"
  },
  {
    id: "sovereign_recovery_04",
    title: "Sovereign Treasury Wallet Recovery",
    summary: "Recover high-value multi-sig corporate crypto-wallets with zero-knowledge, without storing private keys.",
    paradoxStatement: "Enterprise crypto-wallets containing billions in assets must have a recovery fallback if keys are lost, but storing backup keys anywhere introduces high risk of insider or cloud exploitation.",
    secureSolution: "Utilizes Verifiable Shamir Secret Sharing (VSSS) to split the private key into multi-officer Lagrange shares. Key reconstruction occurs only inside ephemeral, air-gapped secure enclaves triggered by multi-party consensus.",
    technicalStack: "Lagrange Interpolation, VSSS, SECP256k1, Ephemeral SGX RAM",
    difficulty: "Sovereign",
    category: "Security",
    costUsd: 15000000.0,
    cryptographicPrimitives: "Shamir Threshold (3-of-5), VSSS, Diffie-Hellman"
  },
  {
    id: "homomorphic_shield_05",
    title: "Homomorphic Threat Shield",
    summary: "Executes deep risk and threat analytics directly over encrypted real-time transactional streams.",
    paradoxStatement: "Banks want to scale fraud detection in high-performance cloud clusters, but feeding raw, unencrypted financial intelligence to cloud hosts compromises institutional secrecy and GDPR compliance.",
    secureSolution: "Applies CKKS Fully Homomorphic Encryption. Cloud nodes run deep learning inference and mathematical regression directly on the encrypted ciphertexts, returning encrypted risk scores only readable by local keys.",
    technicalStack: "CKKS FHE, LWE (Learning With Errors), SIMD Matrix Vector Operations",
    difficulty: "Extreme",
    category: "Security",
    costUsd: 18000000.0,
    cryptographicPrimitives: "CKKS FHE, R-LWE, Ring Homomorphisms"
  },
  {
    id: "supply_chain_06",
    title: "Autonomous Supply Chain Clearer",
    summary: "Enables instant border clearances and cross-border grid load transfers through verifiable spatial telemetry.",
    paradoxStatement: "Clearing bulk international cargo and shifting electric grid loads across border jurisdictions requires manual customs filings and complex settlements, leading to shipping and energy clearance delays.",
    secureSolution: "Leverages IoT-signed telemetry matched to zero-knowledge spatial grid polygons. Virtual geofences generate proof-of-transit certificates that instantly trigger border customs escrow clearances and energy load swaps.",
    technicalStack: "ZK-Snark spatial circuits, Cross-Border Escrow, IoT Elliptic Curve signing, Smart-Grid switching",
    difficulty: "Extreme",
    category: "Infrastructure",
    costUsd: 11000000.0,
    cryptographicPrimitives: "ECDSA (secp256r1), Polygon proofs, ZK-Coordinates"
  },
  {
    id: "ai_audit_07",
    title: "Incorruptible AI Audit",
    summary: "Cryptographically verifies that enterprise neural networks satisfy safety policies without revealing AI weights.",
    paradoxStatement: "Regulators require proof that financial AI models do not violate bias or risk constraints, but displaying raw neural weights exposes intellectual property worth billions.",
    secureSolution: "Uses Zero-Knowledge Machine Learning (ZKML) to convert feed-forward neural layers into arithmetic circuits. Each model inference produces a cryptographic proof certifying that it ran the specific safe weights.",
    technicalStack: "ZKML circuits, Halo2 proof system, Neural network transpiler",
    difficulty: "Sovereign",
    category: "Compliance",
    costUsd: 9500000.0,
    cryptographicPrimitives: "Halo2, KZG commitments, Pedersen Commitments"
  },
  {
    id: "execution_guard_08",
    title: "Zero-Knowledge Execution Guard",
    summary: "Enforces enterprise business policy compliance within active code loops with zero state leaks.",
    paradoxStatement: "Active systems must dynamically verify safety invariants on execution variables, but checking variables exposes unencrypted data to logs and increases clock cycles.",
    secureSolution: "Loads safety policies as static Rust-compiled verification filters directly into a CPU isolated execution ring. Checks hashes of execution states against policy invariants in Ring 0 with zero logging footprint.",
    technicalStack: "Rust Ring 0 driver, Assembly verification, eBPF isolation",
    difficulty: "Critical",
    category: "Security",
    costUsd: 7200000.0,
    cryptographicPrimitives: "eBPF isolation, SHA-256 Hashing, State commitments"
  },
  {
    id: "sandbox_broker_09",
    title: "High-Velocity Sandbox Stream",
    summary: "Provides absolute physical virtualization and air-gapping for sensitive high-frequency transaction feeds.",
    paradoxStatement: "Sensitive high-frequency feeds must be parsed instantly but isolated entirely from lateral corporate networks, a major bottleneck for standard virtualization.",
    secureSolution: "Binds network interfaces directly to core-private L1/L2 caches, establishing a physical unidirectional ring buffer. Simulates network air-gapping by strictly trapping outgoing register states.",
    technicalStack: "Kernel-level Virtualization, Direct Cache Injection (DCI), unidirectional ring-buffers",
    difficulty: "Critical",
    category: "Infrastructure",
    costUsd: 6800000.0,
    cryptographicPrimitives: "Hardware-enforced ring buffers, AES-NI"
  },
  {
    id: "node_syncher_10",
    title: "Sovereign Microsecond Syncher",
    summary: "Synchronizes atomic clock-drifts across decentralized consensus nodes without central NTP servers.",
    paradoxStatement: "Distributed ledger nodes require microsecond coordination to order transactions, but relying on central servers introduces single-point spoofing and GPS-denial risks.",
    secureSolution: "Employs peer-to-peer clock-drift estimation exchanging symmetric microsecond timestamps. Nodes run statistical Kalmann filtering to isolate network delay jitter and keep consensus drift under 100ns.",
    technicalStack: "P2P Clock-drift Estimation, Kalman Filters, UDP Socket, Atomic time references",
    difficulty: "Extreme",
    category: "Infrastructure",
    costUsd: 5500000.0,
    cryptographicPrimitives: "UDP Timestamp exchange, Kalman filtration"
  }
];

interface AuditLog {
  id: string;
  timestamp: string;
  paradoxId: string;
  paradoxTitle: string;
  inputData: string;
  outputData: string;
  verificationProof: string;
  hardwareAttestation: string;
  latencyMs: number;
}

export default function Sovereign() {
  const [currentTab, setCurrentTab] = useState<"EXPLORE" | "SANDBOX" | "ENCLAVE" | "AUDITS" | "CODE-ZK">("EXPLORE");
  
  // Wallet & Licenses State
  const [treasuryBalance, setTreasuryBalance] = useState<number>(100000000.0);
  const [licensedIds, setLicensedIds] = useState<string[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Active / Selected state
  const [selectedParadoxId, setSelectedParadoxId] = useState<string | null>(null);
  const [sandboxInput, setSandboxInput] = useState<string>("");
  const [sandboxState, setSandboxState] = useState<"IDLE" | "PROVING" | "SUCCESS" | "ERROR">("IDLE");
  const [sandboxProofs, setSandboxProofs] = useState<string[]>([]);
  const [sandboxLogs, setSandboxLogs] = useState<string>("");

  // Enclave active state
  const [enclaveInput, setEnclaveInput] = useState<string>("");
  const [enclaveState, setEnclaveState] = useState<"IDLE" | "STARTING" | "RUNNING" | "TERMINATED">("IDLE");
  const [enclaveMetrics, setEnclaveMetrics] = useState({
    throughput: 0,
    latencyMs: 0,
    cpuLoad: 0,
    signature: "",
    resultText: "",
    logs: [] as string[]
  });

  // Custom ZK Code compliance state
  const [customCode, setCustomCode] = useState<string>("");
  const [customRules, setCustomRules] = useState<string>("");

  // Initialize from LocalStorage
  useEffect(() => {
    const cachedBalance = localStorage.getItem("sovereign_balance");
    const cachedLicenses = localStorage.getItem("sovereign_licenses");
    const cachedLogs = localStorage.getItem("sovereign_audit_logs");

    if (cachedBalance) setTreasuryBalance(parseFloat(cachedBalance));
    if (cachedLicenses) setLicensedIds(JSON.parse(cachedLicenses));
    if (cachedLogs) setAuditLogs(JSON.parse(cachedLogs));
  }, []);

  // Sync to LocalStorage helpers
  const saveBalance = (val: number) => {
    setTreasuryBalance(val);
    localStorage.setItem("sovereign_balance", val.toString());
  };

  const saveLicenses = (ids: string[]) => {
    setLicensedIds(ids);
    localStorage.setItem("sovereign_licenses", JSON.stringify(ids));
  };

  const saveAuditLogs = (logs: AuditLog[]) => {
    setAuditLogs(logs);
    localStorage.setItem("sovereign_audit_logs", JSON.stringify(logs));
  };

  const generateRandomHash = () => {
    return Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  };

  // 1. Buy/License Action
  const handleBuyLicense = (id: string) => {
    const paradox = DEFAULT_PARADOXES.find(p => p.id === id);
    if (!paradox || licensedIds.includes(id)) return;

    if (treasuryBalance < paradox.costUsd) {
      alert("Insufficient Treasury Balance for Multi-Sig Clearance!");
      return;
    }

    const nextBalance = treasuryBalance - paradox.costUsd;
    const nextLicenses = [...licensedIds, id];
    saveBalance(nextBalance);
    saveLicenses(nextLicenses);

    const txId = Math.floor(100000 + Math.random() * 900000);
    const newLog: AuditLog = {
      id: generateRandomHash().slice(0, 16),
      timestamp: new Date().toISOString(),
      paradoxId: id,
      paradoxTitle: paradox.title,
      inputData: "Corporate Multi-Sig Clearance (Escrow: Secured)",
      outputData: `Enclave License Token Generated [TX_ID_${txId}]`,
      verificationProof: generateRandomHash(),
      hardwareAttestation: `Intel_SGX_IAS_Attestation_OK_${Math.floor(1000 + Math.random() * 9000)}`,
      latencyMs: Math.floor(150 + Math.random() * 300)
    };

    saveAuditLogs([newLog, ...auditLogs]);
  };

  // 2. Sandbox Proof Action
  const handleVerifySandbox = (id: string, input: string) => {
    const paradox = DEFAULT_PARADOXES.find(p => p.id === id);
    if (!paradox) return;

    setSandboxState("PROVING");

    setTimeout(() => {
      const cleanInput = input.trim() || "Default_Simulation_Vector_0x82f1";
      const hash1 = generateRandomHash();
      const hash2 = generateRandomHash();
      const hash3 = generateRandomHash();

      const proofs = [
        `Proof_G1: ${hash1.slice(0, 24)}...`,
        `Proof_G2: ${hash2.slice(0, 24)}...`,
        `Commitment: ${hash3.slice(0, 32)}...`
      ];

      const log = `[ZK_VERIFIER] Initializing interactive zero-knowledge challenge.
[ZK_VERIFIER] Input challenge vector parameter: '${cleanInput}'
[ZK_VERIFIER] Generating AST structural mapping.
[ZK_VERIFIER] Executing algebraic relation checks for '${paradox.category}'.
[ZK_VERIFIER] Verified polynomial evaluation: Q(x) * H(x) == P(x) - V(x)
[ZK_VERIFIER] Verification output matches expected challenge constraint.
[ZK_VERIFIER] Zero-knowledge proof verified in 1.8 seconds.
[ZK_VERIFIER] NO SECRET KEY MATERIAL WAS PERSISTED OR SHOWN.`;

      setSandboxProofs(proofs);
      setSandboxLogs(log);
      setSandboxState("SUCCESS");

      const newLog: AuditLog = {
        id: generateRandomHash().slice(0, 16),
        timestamp: new Date().toISOString(),
        paradoxId: id,
        paradoxTitle: paradox.title,
        inputData: `Before-Sale Sandbox Test: ${cleanInput}`,
        outputData: "ZK Proof Challenge Verification: MATCH",
        verificationProof: hash3.slice(0, 32),
        hardwareAttestation: "Sandbox_Verification_Signature_NIZKP",
        latencyMs: 1800
      };

      saveAuditLogs([newLog, ...auditLogs]);
    }, 1800);
  };

  // 3. Start Enclave Action
  const handleStartEnclave = (id: string, input: string) => {
    const paradox = DEFAULT_PARADOXES.find(p => p.id === id);
    if (!paradox) return;

    setEnclaveState("STARTING");

    setTimeout(() => {
      const cleanArgs = input.trim() || "Standard_Corporate_Payload";

      let responseText = "";
      switch (id) {
        case "router_01":
          responseText = `Cleared transaction tranches of ${Math.floor(5000 + Math.random() * 20000)} SWIFT inputs with 0 slippage. Liquidity paths balanced dynamically.`;
          break;
        case "zk_code_02":
          responseText = "AST engine processed 1.2M lines of legacy code. Verified 82 compliance rules. No violations found.";
          break;
        case "api_bridge_03":
          responseText = "Parsed FIX 4.4 streams to ISO 20022 schemas with latency of 0.8 microseconds per payload.";
          break;
        case "sovereign_recovery_04":
          responseText = "Consensus met (4-of-5). Asymmetric Shamir fragments merged inside secure enclave. Private key reconstructed temporarily, decrypted treasury multisig, cleared local RAM.";
          break;
        case "homomorphic_shield_05":
          responseText = "Executed threat matrix multipliers directly on CKKS ciphertexts. Threat score determined as 0.04 (Low risk) without decrypting records.";
          break;
        case "supply_chain_06":
          responseText = "IoT telemetry verified in spatial geofenced polygon. Smart contract executed. Customs status: Cleared.";
          break;
        case "ai_audit_07":
          responseText = "Inference verified via Halo2. Neural bias checked. Weight footprint matched certified integrity signature.";
          break;
        case "execution_guard_08":
          responseText = "Inlined policy rules parsed. Monitored sub-routines running inside isolated Ring 0. 0 violations.";
          break;
        case "sandbox_broker_09":
          responseText = "Unidirectional cache channels loaded. Processed high-frequency market feed. Isolation matrix: Secure.";
          break;
        case "node_syncher_10":
          responseText = "Symmetric peer ping exchanged. Kalman drift adjusted. Master consensus synchronization offset: 24 nanoseconds.";
          break;
        default:
          responseText = "Successful secure execution of enclave.";
      }

      const sig = "SGX_Enclave_MSR_Quote_" + generateRandomHash().slice(0, 16).toUpperCase() + "_Signed_by_Intel_Root";
      const latency = Math.floor(12 + Math.random() * 86);
      const load = Math.floor(145 + Math.random() * 737) / 10;
      const th = Math.floor(5000 + Math.random() * 100000) / 10;

      const detailsLog = [
        "[ENCLAVE_OS] Starting secure enclave runtime container.",
        "[ENCLAVE_OS] Instantiating isolated Ring-0 execution sandbox.",
        "[ENCLAVE_OS] Setting memory encryption keys (MKTME AES-128).",
        `[PRODUCT_EXEC] Loading proprietary binary: '${paradox.title}'`,
        `[PRODUCT_EXEC] Received secure payload parameter: '${cleanArgs}'`,
        `[PRODUCT_EXEC] Execution complete. Result: ${responseText}`,
        "[ENCLAVE_OS] Generating local attestation quote structure.",
        "[ENCLAVE_OS] Signed attestation verification key matches measurement.",
        "[ENCLAVE_OS] Erasing transient enclave registers."
      ];

      setEnclaveMetrics({
        throughput: th,
        latencyMs: latency,
        cpuLoad: load,
        signature: sig,
        resultText: responseText,
        logs: detailsLog
      });

      setEnclaveState("RUNNING");

      const newLog: AuditLog = {
        id: generateRandomHash().slice(0, 16),
        timestamp: new Date().toISOString(),
        paradoxId: id,
        paradoxTitle: paradox.title,
        inputData: `Live Payload: ${cleanArgs}`,
        outputData: responseText,
        verificationProof: generateRandomHash(),
        hardwareAttestation: sig,
        latencyMs: latency
      };

      saveAuditLogs([newLog, ...auditLogs]);
    }, 1200);
  };

  const handleStopEnclave = () => {
    setEnclaveState("TERMINATED");
  };

  // 4. Custom ZK Audit Action
  const handleCustomVerify = (code: string, rules: string) => {
    setSandboxState("PROVING");

    setTimeout(() => {
      const lineCount = code.split("\n").length;
      const sizeBytes = new Blob([code]).size;
      const rule = rules.trim() || "Default: No sovereign funds to blacklisted entities";

      const hash1 = generateRandomHash();
      const hash2 = generateRandomHash();

      const proofs = [
        `Custom_AST_Proof_Hash: ${hash1.slice(0, 24)}`,
        "Groth16_Parameter_Setup: Validated",
        `Compliance_Certificate: ${hash2.slice(0, 32)}`
      ];

      const log = `[ZK_VERIFIER] Custom enterprise codebase audit requested.
[ZK_VERIFIER] Analyzing codebase of ${lineCount} lines (${sizeBytes} bytes).
[ZK_VERIFIER] Target Compliance Invariant Rule: '${rule}'
[ZK_VERIFIER] Checking code branches for logic paths violating rule structure.
[ZK_VERIFIER] Codebase compiled into abstract algebraic circuits successfully.
[ZK_VERIFIER] Groth16 mathematical zero-knowledge proof generated!
[ZK_VERIFIER] Codebase is 100% COMPLIANT with the specified rules.
[ZK_VERIFIER] Proof certificate successfully recorded to audit register.`;

      setSandboxProofs(proofs);
      setSandboxLogs(log);
      setSandboxState("SUCCESS");

      const newLog: AuditLog = {
        id: generateRandomHash().slice(0, 16),
        timestamp: new Date().toISOString(),
        paradoxId: "custom_audit",
        paradoxTitle: "Custom Codebase ZK-Audit",
        inputData: `Lines: ${lineCount}, Rule: ${rule}`,
        outputData: "ZK Code Compliance: VERIFIED",
        verificationProof: hash2.slice(0, 32),
        hardwareAttestation: "Custom_ZK_Verifier_WASM_V2",
        latencyMs: 2000
      };

      saveAuditLogs([newLog, ...auditLogs]);
    }, 2000);
  };

  const handleClearLogs = () => {
    if (confirm("Are you sure you want to clear the audit logs?")) {
      saveAuditLogs([]);
    }
  };

  const handleResetSystem = () => {
    if (confirm("Reset Paradox Exchange state to defaults?")) {
      saveBalance(100000000.0);
      saveLicenses([]);
      saveAuditLogs([]);
      setSelectedParadoxId(null);
      setSandboxState("IDLE");
      setEnclaveState("IDLE");
    }
  };

  const selectedParadox = DEFAULT_PARADOXES.find(p => p.id === selectedParadoxId) || null;

  return (
    <DashboardLayout>
      <div className="flex flex-col min-h-screen bg-[#050811] text-[#E2E8F0] font-mono select-none">
        {/* Sub-header Bar (Wallet Specs) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-4 border-b border-[#1E294B] bg-[#0D1222] gap-4">
          <div>
            <div className="text-xs text-sky-400 font-bold tracking-wider">SOVEREIGN PROTOCOL CONSOLE</div>
            <div className="text-xl font-black text-white mt-1">PARADOX EXCHANGE</div>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="px-4 py-2 border border-[#1E294B] bg-[#161F38]/50">
              <div className="text-[10px] text-slate-500 font-bold">SOVEREIGN CORPORATE DEPOSIT</div>
              <div className="text-sm font-black text-amber-500 mt-0.5">Sovereign Global Capital</div>
            </div>
            <div className="px-4 py-2 border border-[#1E294B] bg-[#161F38]/50">
              <div className="text-[10px] text-slate-500 font-bold">TREASURY RESERVES</div>
              <div className="text-sm font-black text-[#D4AF37] mt-0.5">{formatCurrency(treasuryBalance)}</div>
            </div>
            <div className="px-4 py-2 border border-[#1E294B] bg-[#161F38]/50">
              <div className="text-[10px] text-slate-500 font-bold">SECURITY ENVELOPE</div>
              <div className="text-sm font-black text-[#00E5FF] mt-0.5">Quantum Shield V2</div>
            </div>
            <button
              onClick={handleResetSystem}
              className="px-3 py-2 border border-red-500/30 hover:border-red-500/70 text-red-400 text-xs hover:bg-red-500/10 transition-all font-bold"
            >
              RESET
            </button>
          </div>
        </div>

        {/* Tab Selector bar */}
        <div className="flex border-b border-[#1E294B] bg-[#0D1222] overflow-x-auto scrollbar-hide">
          {[
            { id: "EXPLORE", label: "EXPLORE PROTOCOLS" },
            { id: "SANDBOX", label: "ZK-SANDBOX" },
            { id: "ENCLAVE", label: "HARDWARE ENCLAVES" },
            { id: "AUDITS", label: "LEDGER AUDITS" },
            { id: "CODE-ZK", label: "CUSTOM ZK AUDITING" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id as any);
                setSandboxState("IDLE");
              }}
              className={`px-6 py-4 text-xs font-black tracking-wider border-r border-[#1E294B] transition-all whitespace-nowrap ${
                currentTab === tab.id
                  ? "bg-[#161F38] text-[#D4AF37] border-b-2 border-b-[#D4AF37]"
                  : "text-slate-500 hover:text-slate-300 hover:bg-[#161F38]/30"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Main Workspace Frame */}
        <div className="flex-1 p-6 relative max-w-7xl mx-auto w-full">
          {/* Cyberpunk Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(30,41,75,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(30,41,75,0.08)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <div className="relative z-10">
            {/* EXPLORE TAB */}
            {currentTab === "EXPLORE" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-[#00E5FF] font-black text-lg">SOVEREIGN HIGH-TECH PROTOCOLS</h2>
                  <p className="text-slate-400 text-xs mt-1">Select a cryptographically secure paradox package to license and run inside dedicated enclaves.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {DEFAULT_PARADOXES.map(p => {
                    const licensed = licensedIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => setSelectedParadoxId(p.id)}
                        className={`border cursor-pointer transition-all p-5 hover:bg-[#0D1222]/50 ${
                          selectedParadoxId === p.id
                            ? "border-[#D4AF37] bg-[#0D1222]"
                            : licensed
                            ? "border-[#D4AF37]/40 bg-[#0D1222]/10"
                            : "border-[#1E294B] bg-[#0D1222]/20"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-extrabold px-2 py-0.5 bg-[#161F38] text-[#00E5FF] tracking-wider rounded border border-[#1E294B]">
                            {p.category.toUpperCase()}
                          </span>
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                              licensed
                                ? "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]"
                                : "bg-purple-950/20 text-[#BB86FC] border-[#BB86FC]/50"
                            }`}
                          >
                            {licensed ? "LICENSED [ACTIVE]" : "SECURED [LOCKED]"}
                          </span>
                        </div>

                        <h3 className="text-sm font-extrabold text-white tracking-wide">{p.title}</h3>
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{p.summary}</p>

                        <div className="mt-4 pt-3 border-t border-[#1E294B]/60 flex justify-between items-center">
                          <div className="text-[10px] text-slate-500 font-extrabold">DIFFICULTY: <span className="text-slate-300">{p.difficulty.toUpperCase()}</span></div>
                          <div className="text-xs font-black text-[#D4AF37]">{formatCurrency(p.costUsd)} USD</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Detail Panel */}
                {selectedParadox && (
                  <div className="border border-[#D4AF37] bg-[#0D1222] p-6 mt-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#1E294B]">
                      <div>
                        <div className="text-[10px] text-sky-400 font-bold tracking-wider uppercase">{selectedParadox.category} PROTOCOL</div>
                        <h2 className="text-lg font-black text-white mt-1">{selectedParadox.title}</h2>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-500 font-bold">LICENSE VALUE</div>
                        <div className="text-md font-black text-[#D4AF37] mt-0.5">{formatCurrency(selectedParadox.costUsd)} USD</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-4">
                        <div>
                          <div className="text-[10px] text-[#BB86FC] font-extrabold tracking-wider uppercase">THE SYSTEMIC PARADOX STATEMENT:</div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-[#161F38]/30 p-3 border border-[#1E294B] italic">
                            "{selectedParadox.paradoxStatement}"
                          </p>
                        </div>
                        <div>
                          <div className="text-[10px] text-[#00E5FF] font-extrabold tracking-wider uppercase">ZERO-KNOWLEDGE SECURE RESOLUTION:</div>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed bg-slate-950/50 p-3 border border-[#1E294B]">
                            {selectedParadox.secureSolution}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 bg-slate-950/40 border border-[#1E294B] space-y-3">
                          <div className="text-xs font-bold text-white tracking-wide border-b border-[#1E294B] pb-2">ENCLAVE DEPLOYMENT SPECIFICATIONS</div>
                          <div className="grid grid-cols-3 text-[10px] gap-2">
                            <div className="text-slate-500">TECH STACK:</div>
                            <div className="col-span-2 text-slate-300 font-bold">{selectedParadox.technicalStack}</div>
                            <div className="text-slate-500">PRIMITIVES:</div>
                            <div className="col-span-2 text-[#00E5FF] font-bold">{selectedParadox.cryptographicPrimitives}</div>
                            <div className="text-slate-500">LICENSING:</div>
                            <div className="col-span-2 font-black text-[#D4AF37]">
                              {licensedIds.includes(selectedParadox.id) ? "APPROVED & SIGNED" : "SIGNATURE MANDATORY"}
                            </div>
                          </div>
                        </div>

                        {licensedIds.includes(selectedParadox.id) ? (
                          <div className="flex flex-col gap-2">
                            <div className="bg-[#D4AF37]/10 border border-[#D4AF37] p-3 text-center rounded">
                              <span className="text-xs font-extrabold text-[#D4AF37]">✓ CORE ENTERPRISE LICENSE UNLOCKED</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setCurrentTab("SANDBOX");
                                  setSandboxState("IDLE");
                                }}
                                className="flex-1 py-3 bg-[#0D1222] border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-xs"
                              >
                                TEST IN SANDBOX
                              </button>
                              <button
                                onClick={() => {
                                  setCurrentTab("ENCLAVE");
                                  setEnclaveState("IDLE");
                                }}
                                className="flex-1 py-3 bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#050811] font-bold text-xs"
                              >
                                LAUNCH ENCLAVE
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleBuyLicense(selectedParadox.id)}
                            className="w-full py-4 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:opacity-95 text-[#050811] font-black text-xs tracking-wider"
                          >
                            SIGN CONTRACT & ACQUIRE SECURE ENTERPRISE LICENSE
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ZK-SANDBOX TAB */}
            {currentTab === "SANDBOX" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-[#00E5FF] font-black text-lg">ZK-PROOFS BEFORE-SALE SANDBOX</h2>
                  <p className="text-slate-400 text-xs mt-1">Audit and mathematically prove that proprietary solutions operate cleanly without exposing critical source libraries.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold tracking-wider block mb-2 uppercase">CHOOSE SECURE INTERACTIVE PROVER:</label>
                    <select
                      value={selectedParadoxId || ""}
                      onChange={(e) => {
                        setSelectedParadoxId(e.target.value || null);
                        setSandboxState("IDLE");
                      }}
                      className="w-full p-4 bg-[#0D1222] border border-[#1E294B] text-[#E2E8F0] text-xs font-bold focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="">-- CHOOSE A SYSTEM INVARIANT TO VERIFY --</option>
                      {DEFAULT_PARADOXES.map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </div>

                  {selectedParadox && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold tracking-wider block mb-2">INPUT PROOF PAYLOAD PARAMETERS:</label>
                        <input
                          type="text"
                          value={sandboxInput}
                          onChange={(e) => setSandboxInput(e.target.value)}
                          placeholder="e.g. SWIFT 100k, Clock drift max, CKKS Encrypted array, or Custom parameters"
                          className="w-full p-4 bg-[#0D1222] border border-[#1E294B] text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none placeholder-slate-600"
                        />
                      </div>

                      <button
                        onClick={() => handleVerifySandbox(selectedParadox.id, sandboxInput)}
                        disabled={sandboxState === "PROVING"}
                        className="w-full py-4 bg-[#D4AF37] hover:bg-[#D4AF37]/85 text-[#050811] font-black text-xs tracking-widest flex items-center justify-center gap-2"
                      >
                        {sandboxState === "PROVING" ? (
                          <div className="animate-spin h-4 w-4 border-2 border-[#050811] border-t-transparent" />
                        ) : (
                          "▶ GENERATE ZERO-KNOWLEDGE PROOF CHALLENGE"
                        )}
                      </button>

                      {sandboxState !== "IDLE" && (
                        <div className="space-y-4 pt-4 border-t border-[#1E294B]">
                          {sandboxState === "PROVING" ? (
                            <div className="border border-[#BB86FC]/40 bg-[#0D1222] p-8 text-center">
                              <div className="animate-pulse text-[#BB86FC] text-xs font-extrabold tracking-wider">
                                RESOLVING POLYNOMIAL CONSTRAINTS & COMPILING AST BINARIES...
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-4 animate-fadeIn">
                              {/* Proof Success box */}
                              <div className="border border-[#34D399] bg-[#34D399]/5 p-4 flex items-center gap-3">
                                <span className="text-[#34D399] text-xl">✓</span>
                                <div>
                                  <div className="text-xs font-extrabold text-[#34D399] tracking-wide">ZK PROOF CHALLENGE SOLVED</div>
                                  <div className="text-[10px] text-slate-300">Verification: 100% SECURE. Executed logic matches rule specifications perfectly.</div>
                                </div>
                              </div>

                              {/* Proof Params */}
                              <div className="border border-[#1E294B] bg-[#0D1222] p-4">
                                <div className="text-[10px] font-bold text-[#D4AF37] mb-2 uppercase">ZK-PROOFS PARAMETERS</div>
                                <div className="space-y-1 font-mono text-[10px] text-slate-400">
                                  {sandboxProofs.map((p, idx) => (
                                    <div key={idx}>{p}</div>
                                  ))}
                                </div>
                              </div>

                              {/* Log terminal */}
                              <div className="bg-black border border-[#1E294B] p-4 font-mono text-[10px] text-sky-400 leading-relaxed whitespace-pre-line">
                                {sandboxLogs}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HARDWARE ENCLAVES TAB */}
            {currentTab === "ENCLAVE" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-[#D4AF37] font-black text-lg">SECURE SYSTEM ENCLAVES</h2>
                  <p className="text-slate-400 text-xs mt-1">Stream real-time high-velocity data feeds inside hardware-isolated CPU enclaves (Intel SGX / AMD SEV) and observe isolated execution logs.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold tracking-wider block mb-2 uppercase">SELECT ACTIVE SYSTEM ENCLAVE ROUTINE:</label>
                    <select
                      value={selectedParadoxId || ""}
                      onChange={(e) => {
                        setSelectedParadoxId(e.target.value || null);
                        setEnclaveState("IDLE");
                      }}
                      className="w-full p-4 bg-[#0D1222] border border-[#1E294B] text-[#E2E8F0] text-xs font-bold focus:border-[#D4AF37] focus:outline-none"
                    >
                      <option value="">-- EXPAND ACTIVE SERVICES --</option>
                      {DEFAULT_PARADOXES.filter(p => licensedIds.includes(p.id)).map(p => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                    {DEFAULT_PARADOXES.filter(p => licensedIds.includes(p.id)).length === 0 && (
                      <div className="text-[10px] text-amber-500 mt-2 font-bold uppercase">
                        ⚠ No active licenses found. License a secure protocol in the "EXPLORE PROTOCOLS" tab first.
                      </div>
                    )}
                  </div>

                  {selectedParadox && licensedIds.includes(selectedParadox.id) && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] text-slate-400 font-bold tracking-wider block mb-2">LIVE STREAM DATA PAYLOAD:</label>
                        <input
                          type="text"
                          value={enclaveInput}
                          onChange={(e) => setEnclaveInput(e.target.value)}
                          placeholder="Enter live execution stream data payload..."
                          className="w-full p-4 bg-[#0D1222] border border-[#1E294B] text-white text-xs font-mono focus:border-[#D4AF37] focus:outline-none placeholder-slate-600"
                        />
                      </div>

                      <div className="flex gap-4">
                        <button
                          onClick={() => handleStartEnclave(selectedParadox.id, enclaveInput)}
                          disabled={enclaveState === "STARTING"}
                          className="flex-1 py-4 bg-[#D4AF37] hover:bg-[#D4AF37]/85 text-[#050811] font-black text-xs tracking-widest flex items-center justify-center gap-2"
                        >
                          {enclaveState === "STARTING" ? (
                            <div className="animate-spin h-4 w-4 border-2 border-[#050811] border-t-transparent" />
                          ) : (
                            "▶ START RUNTIME"
                          )}
                        </button>

                        <button
                          onClick={handleStopEnclave}
                          className="flex-1 py-4 bg-red-950/20 hover:bg-red-900/10 border border-red-500/50 text-red-400 font-black text-xs tracking-widest"
                        >
                          TERMINATE
                        </button>
                      </div>

                      {enclaveState !== "IDLE" && (
                        <div className="space-y-4 pt-4 border-t border-[#1E294B]">
                          {enclaveState === "STARTING" && (
                            <div className="border border-sky-500/40 bg-[#0D1222] p-8 text-center">
                              <div className="animate-pulse text-sky-400 text-xs font-extrabold tracking-wider">
                                INIT SECURE RAM... SETTING ENCRYPTION ENVELOPE (Intel SGX)...
                              </div>
                            </div>
                          )}

                          {enclaveState === "RUNNING" && (
                            <div className="space-y-4 animate-fadeIn">
                              {/* Status Header */}
                              <div className="border border-sky-400 bg-sky-400/5 p-4 flex items-center gap-3">
                                <span className="text-sky-400 font-bold text-xl">🛡</span>
                                <div>
                                  <div className="text-xs font-extrabold text-sky-400 tracking-wide uppercase">HARDWARE ISOLATION ENCRYPTED</div>
                                  <div className="text-[10px] text-slate-300">Intel SGX runtime active. High-performance, side-channel immune memory isolation engaged.</div>
                                </div>
                              </div>

                              {/* Metrics bento */}
                              <div className="grid grid-cols-3 gap-4">
                                <div className="border border-[#1E294B] bg-[#0D1222] p-3">
                                  <div className="text-[9px] text-slate-500 font-bold uppercase">THROUGHPUT</div>
                                  <div className="text-sm font-black text-white mt-1 font-mono">{enclaveMetrics.throughput} Tx/s</div>
                                </div>
                                <div className="border border-[#1E294B] bg-[#0D1222] p-3">
                                  <div className="text-[9px] text-slate-500 font-bold uppercase">LATENCY</div>
                                  <div className="text-sm font-black text-[#D4AF37] mt-1 font-mono">{enclaveMetrics.latencyMs} ms</div>
                                </div>
                                <div className="border border-[#1E294B] bg-[#0D1222] p-3">
                                  <div className="text-[9px] text-slate-500 font-bold uppercase">CPU LOAD</div>
                                  <div className="text-sm font-black text-purple-400 mt-1 font-mono">{enclaveMetrics.cpuLoad} %</div>
                                </div>
                              </div>

                              {/* Computational Output */}
                              <div className="border border-[#D4AF37]/30 bg-[#0D1222] p-4">
                                <div className="text-[10px] font-bold text-[#D4AF37] mb-2 uppercase">COMPUTATIONAL ENCLAVE PIPELINE OUTPUT:</div>
                                <div className="text-xs text-white font-mono leading-relaxed bg-[#050811] p-3 border border-[#1E294B]">
                                  {enclaveMetrics.resultText}
                                </div>
                              </div>

                              {/* MSR Quote Signature */}
                              <div className="border border-[#1E294B] bg-[#0D1222] p-3 flex justify-between items-center text-[10px]">
                                <span className="text-slate-500 font-bold uppercase">SGX ATTESTATION MSR QUOTE KEY:</span>
                                <span className="text-teal-400 font-mono select-all truncate max-w-lg">{enclaveMetrics.signature}</span>
                              </div>

                              {/* Logs term */}
                              <div className="bg-black border border-[#1E294B] p-4 font-mono text-[10px] text-[#00E5FF] leading-relaxed space-y-1">
                                {enclaveMetrics.logs.map((log, idx) => (
                                  <div key={idx}>{log}</div>
                                ))}
                              </div>
                            </div>
                          )}

                          {enclaveState === "TERMINATED" && (
                            <div className="border border-red-500 bg-red-950/20 p-4 text-center rounded">
                              <span className="text-xs font-extrabold text-red-500 font-mono tracking-wider">
                                ENCLAVE TERMINATED: RAM cache safely cleared of all cryptographic material and session tokens.
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LEDGER AUDITS TAB */}
            {currentTab === "AUDITS" && (
              <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-[#BB86FC] font-black text-lg">LEDGER AUDIT TRAILS</h2>
                    <p className="text-slate-400 text-xs mt-1">Immutable record list of zero-knowledge checks, multi-sig clearances, and SGX hardware attestations.</p>
                  </div>
                  <button
                    onClick={handleClearLogs}
                    className="px-4 py-2 border border-red-500/30 text-red-400 text-xs font-bold hover:bg-red-500/10 transition-all"
                  >
                    CLEAR LOGS
                  </button>
                </div>

                <div className="border border-[#1E294B] bg-[#0D1222] overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#161F38]/80 text-[#D4AF37] border-b border-[#1E294B] font-extrabold">
                      <tr>
                        <th className="p-3">TIMESTAMP</th>
                        <th className="p-3">PROTOCOL</th>
                        <th className="p-3">INPUT/CHALLENGE</th>
                        <th className="p-3">COMPUTATION RESULT</th>
                        <th className="p-3 text-right">LATENCY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E294B]/40 text-slate-300">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-slate-500 font-extrabold uppercase">
                            No ledger entries generated yet. Execute simulations or sandbox checks.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id} className="hover:bg-[#161F38]/20 transition-all">
                            <td className="p-3 whitespace-nowrap text-slate-500 text-[10px]">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="p-3 font-bold text-white whitespace-nowrap">{log.paradoxTitle}</td>
                            <td className="p-3 font-mono text-[10px] max-w-xs truncate" title={log.inputData}>
                              {log.inputData}
                            </td>
                            <td className="p-3">
                              <div className="text-slate-300 truncate max-w-md">{log.outputData}</div>
                              <div className="text-[9px] text-[#00E5FF] mt-0.5 truncate max-w-md" title={log.hardwareAttestation}>
                                Quote: {log.hardwareAttestation}
                              </div>
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-400 whitespace-nowrap">{log.latencyMs} ms</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CUSTOM ZK AUDITING TAB */}
            {currentTab === "CODE-ZK" && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-[#BB86FC] font-black text-lg">SOVEREIGN CODE COMPLIANCE AUDITOR</h2>
                  <p className="text-slate-400 text-xs mt-1">Perform zero-knowledge codebase audits. Compile AST representations of proprietary logic to verify policy compliance without exposing raw strings.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold tracking-wider block mb-2 uppercase">PASTE TARGET CODEBASE FOR COMPILATION:</label>
                      <textarea
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        placeholder={`e.g.,\nfn clear_transfer(amt: u64) {\n  if amt < 1000000 {\n    do_wire();\n  }\n}`}
                        rows={10}
                        className="w-full p-4 bg-[#0D1222] border border-[#1E294B] text-[#00E5FF] text-xs font-mono focus:border-[#BB86FC] focus:outline-none placeholder-slate-700 leading-relaxed"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold tracking-wider block mb-2 uppercase">SPECIFY COMPLIANCE SAFETY RULE INVARIANTS:</label>
                      <input
                        type="text"
                        value={customRules}
                        onChange={(e) => setCustomRules(e.target.value)}
                        placeholder="e.g., Rule: 'No transfers above 1,000,000 can bypass validation'"
                        className="w-full p-4 bg-[#0D1222] border border-[#1E294B] text-white text-xs font-mono focus:border-[#BB86FC] focus:outline-none placeholder-slate-700"
                      />
                    </div>

                    <button
                      onClick={() => handleCustomVerify(customCode, customRules)}
                      disabled={sandboxState === "PROVING"}
                      className="w-full py-4 bg-[#BB86FC] hover:bg-[#BB86FC]/85 text-[#050811] font-black text-xs tracking-widest flex items-center justify-center gap-2"
                    >
                      {sandboxState === "PROVING" ? (
                        <div className="animate-spin h-4 w-4 border-2 border-[#050811] border-t-transparent" />
                      ) : (
                        "✓ COMPILE & VERIFY COMPLIANCE INVARIANT"
                      )}
                    </button>

                    {sandboxState !== "IDLE" && (
                      <div className="space-y-4 pt-4 border-t border-[#1E294B]">
                        {sandboxState === "PROVING" ? (
                          <div className="border border-[#BB86FC]/40 bg-[#0D1222] p-8 text-center">
                            <div className="animate-pulse text-[#BB86FC] text-xs font-extrabold tracking-wider">
                              COMPILING CODE ABSTRACT SYNTAX TREE (AST) & GENERATING GROTH16 PROVER SHARES...
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-fadeIn">
                            <div className="border border-[#34D399] bg-[#34D399]/5 p-4 flex items-center gap-3">
                              <span className="text-[#34D399] text-xl">✓</span>
                              <div>
                                <div className="text-xs font-extrabold text-[#34D399] tracking-wide">CODEBASE VERIFIED SECURE</div>
                                <div className="text-[10px] text-slate-300">Mathematical ZK-SNARK compiler confirms logic is 100% compliant with specified invariant bounds.</div>
                              </div>
                            </div>

                            {/* Log terminal */}
                            <div className="bg-black border border-[#1E294B] p-4 font-mono text-[10px] text-emerald-400 leading-relaxed whitespace-pre-line">
                              {sandboxLogs}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
