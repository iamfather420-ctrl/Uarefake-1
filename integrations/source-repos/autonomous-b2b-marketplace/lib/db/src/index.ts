import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";

const { Pool } = pg;

let db: any;
let pool: any;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema });
  } catch (err) {
    console.error("Failed to connect to DATABASE_URL:", err);
  }
}

if (!db) {
  console.warn("[AI Studio] DATABASE_URL is not set or connection failed. Activating robust in-memory database mock...");
  
  // High quality mock products matching schema
  const mockProducts = [
    {
      id: "SOLVEX-ZK-01",
      name: "ZK-KYC Dark Settlement Engine",
      category: "fundamental",
      description: "Resolves the Regulatory KYC vs Client Privacy Paradox. Allows Tier-1 banks to verify FINTRAC & AML compliance across distributed clearing nodes without exposing underlying client PII.",
      solution: "Zero-Knowledge Institutional AML Verification: Cryptographic Curve bn254 / Groth16 zk-SNARKs. Prover Latency < 14.2ms on AES-NI instructions. 100% OSFI Guideline B-13 compliant. Zero PII Leakage Guarantee across clearing shards. Allows complete regulatory verification without any raw client identity data ever touching the verification layer.",
      impact: JSON.stringify(["Zero PII exposure in compliance verification", "14.2ms prover latency — production ready", "100% OSFI B-13 compliant out of the box", "Deployed across distributed clearing nodes"]),
      priceEth: "0.05",
      priceUsdc: "150",
      priceBtc: "0.0015",
      salesCount: 5,
      createdAt: new Date()
    },
    {
      id: "SOLVEX-ZK-02",
      name: "Quantum Key Distribution Mesh Bridge",
      category: "fundamental",
      description: "Solves the Quantum Harvest vs Classical Infrastructure Paradox. Wraps legacy SWIFT MT/MX and RTGS wire transfer payloads in NIST-standardized Kyber-1024 lattice encryption.",
      solution: "Post-Quantum Cryptography Wrapper for SWIFT: NIST Standard ML-KEM (Kyber-1024) + ML-DSA. Throughput: 140,000 TPS per bare-metal enclave. Backward Compatibility: Drop-in proxy for ISO 20022. Key Rotation: Ephemeral sub-second forward secrecy. Protects all SWIFT wire payloads from quantum harvest attacks while maintaining full backward compatibility.",
      impact: JSON.stringify(["140,000 TPS per bare-metal enclave", "Drop-in ISO 20022 backward compatibility", "Ephemeral sub-second forward secrecy", "Harvest-proof against future quantum adversaries"]),
      priceEth: "0.08",
      priceUsdc: "240",
      priceBtc: "0.0024",
      salesCount: 3,
      createdAt: new Date()
    },
    {
      id: "SOLVEX-ZK-03",
      name: "Homomorphic Fraud Scoring Vault",
      category: "fundamental",
      description: "Resolves the Collaborative AML vs Anti-Competition Paradox. Enables multiple financial institutions to jointly compute gradient boosted fraud models over fully encrypted transaction tensors.",
      solution: "Encrypted Cross-Bank Inference Engine: TFHE / CKKS Fully Homomorphic Encryption. Precision: 16-bit fixed-point arithmetic over ciphertext. Data Sovereignty: Ciphertexts never decrypted during inference. SLA Guarantee: < 45ms end-to-end scoring pipeline. Multiple competing banks share fraud signals without revealing any raw transaction data to each other.",
      impact: JSON.stringify(["Ciphertext never decrypted during inference", "< 45ms end-to-end fraud scoring", "16-bit fixed-point arithmetic precision", "Multi-bank AML without data sharing liability"]),
      priceEth: "0.12",
      priceUsdc: "360",
      priceBtc: "0.0036",
      salesCount: 8,
      createdAt: new Date()
    },
    {
      id: "SOLVEX-ZK-04",
      name: "Byzantine Fault Tolerant Escrow Ledger",
      category: "fundamental",
      description: "Solves the Distributed Consensus vs High-Throughput Paradox. Implements a customized HotStuff BFT consensus protocol tuned for Canadian Payments Association clearing cycles.",
      solution: "Sub-Millisecond Inter-Bank Settlement: Deterministic single-slot finality < 2.1ms. Fault Tolerance: Resilient to 33% malicious Byzantine validator nodes. State Pruning: Constant-size cryptographic accumulator. Settlement: Instant multi-currency atomic DVP (Delivery vs Payment). Bank-grade deterministic finality with zero probabilistic risk.",
      impact: JSON.stringify(["Deterministic finality in < 2.1ms", "33% Byzantine fault tolerance", "Atomic DVP across multiple currencies", "Constant-size cryptographic state accumulator"]),
      priceEth: "0.06",
      priceUsdc: "180",
      priceBtc: "0.0018",
      salesCount: 2,
      createdAt: new Date()
    },
    {
      id: "SOLVEX-GOV-24",
      name: "Gemini Hallucination Firewall",
      category: "ai",
      description: "Resolves the Probabilistic LLM vs Deterministic Banking Output Paradox. Enforces rigorous context grammar verification on all generative AI financial summaries before they reach any end user.",
      solution: "Deterministic JSON Schema Constraint Engine: Lark context-free grammar validator. Hallucination Rate: Reduced to 0.0000% on numeric financial figures. Latency Penalty: < 8.4ms semantic parsing overlay. Drop-in interceptor for Gemini REST Option B. Every AI-generated financial figure is mathematically verified against schema constraints before output.",
      impact: JSON.stringify(["0.0000% hallucination rate on financial figures", "< 8.4ms semantic parsing overhead", "Lark context-free grammar validation", "Drop-in Gemini REST interceptor"]),
      priceEth: "0.13",
      priceUsdc: "390",
      priceBtc: "0.0039",
      salesCount: 11,
      createdAt: new Date()
    }
  ];

  const createChain = (prevResult: any = []) => {
    const chain: any = () => Promise.resolve(prevResult);
    
    chain.then = (onfulfilled?: any, onrejected?: any) => Promise.resolve(prevResult).then(onfulfilled, onrejected);
    chain.catch = (onrejected?: any) => Promise.resolve(prevResult).catch(onrejected);
    chain.finally = (onfinally?: any) => Promise.resolve(prevResult).finally(onfinally);

    return new Proxy(chain, {
      get: (target, prop) => {
        if (prop === "then" || prop === "catch" || prop === "finally") {
          return target[prop];
        }
        if (prop === "from") {
          return (table: any) => {
            const isProduct = table && (table.name === "paradox_products" || table._?.name === "paradox_products" || String(table).includes("paradox_products"));
            return createChain(isProduct ? mockProducts : []);
          };
        }
        return (...args: any[]) => {
          return createChain(prevResult);
        };
      }
    });
  };

  db = new Proxy({}, {
    get: (target, prop) => {
      if (["select", "insert", "update", "delete", "selectDistinct"].includes(prop as string)) {
        return (...args: any[]) => {
          return createChain([]);
        };
      }
      return () => createChain([]);
    }
  });
}

export { pool, db };
export * from "./schema/index";
