export type SolvexNode = {
  id: string;
  name: string;
  category: string;
  execution_mode: string;
  purpose: string;
  status: string;
  executed: boolean;
  duration_ms: number;
  evidence_hash: string;
  claim_scope: string;
  registered: boolean;
  instantiated: boolean;
  reachable: boolean;
  output_asserted: boolean;
  evidence_generated: boolean;
  evidence: Record<string, unknown> | null;
};

export const solvexNodes: SolvexNode[] = [
  {
    "id": "DN-01",
    "name": "Daisy Genesis Core",
    "category": "CORE_KERNEL",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Root bootstrap and sovereign execution engine",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.2018610000013723,
    "evidence_hash": "1a4fad3b0a65db541a93938a14ebe399c287ad07d502c3cf9dfcec3509d0c912",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "genesis_root": "b17ad6280d9a9b62314559999b7879c9a2adf583ef95fabfec5f97e064c13ae0",
      "state": "INITIALIZED"
    }
  },
  {
    "id": "DN-02",
    "name": "MMTAI Authority Gate",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Capability != Authority enforcement",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.05987500000082946,
    "evidence_hash": "5e1bfc8cc67b0c73fc1371b519a8b27d25746dbd5e164b62fb74f677ffcaca03",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "token_prefix": "76e60e6a4feb0214",
      "permitted": true
    }
  },
  {
    "id": "DN-03",
    "name": "Z3 Theorem Prover Kernel",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "First-order logic and SMT automated theorem proving",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.5631919999996171,
    "evidence_hash": "ba1001c58f6bda901aa1273f5835b9456fa00d54415ef3e6b10a47821f66da38",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "solver_result": "unsat",
      "cert_hash": "8242d9d0d0bb6eb98a1a08db2b56cf76008dad921a08c0c39395abfd4f0309ab"
    }
  },
  {
    "id": "DN-04",
    "name": "NOPOT Bounded Termination Engine",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Inductive ranking metric variant verification",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.14911799999936193,
    "evidence_hash": "66d030985d30104fb00f7e42b323738c0d3982dec0c21e6c8be25be99e166e93",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "steps": 7,
      "bound": 100
    }
  },
  {
    "id": "DN-05",
    "name": "Crystal Clear Box Audit Engine",
    "category": "AUDIT",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Zero-knowledge customer evidence projection",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.07870999999977357,
    "evidence_hash": "9fc35596594f551078347583a75b3550784b826ee12186a288a1fdb852621ff1",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "token": "578384ca527798e599e3d4974afa6b2228cafdef73332e942b29069c52ae4550",
      "redacted": true
    }
  },
  {
    "id": "DN-06",
    "name": "Linear SHA-256 Merkle Ledger",
    "category": "AUDIT",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Tamper-evident append-only cryptographic log",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.6069430000006832,
    "evidence_hash": "e7233133776676088352071cadfd62eb74eff914ad7ad05ed0ecd4d37e4a0455",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "record_hash": "24dd85b11f21c934859b9a641cfe314a294047fa4cc5c93762ed4cffb66252d4",
      "chain_valid": true
    }
  },
  {
    "id": "DN-07",
    "name": "Anti-Tamper Sentinel Monitor",
    "category": "AUDIT",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Live real-time byte mutation and hash anomaly alarm",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.35378899999886926,
    "evidence_hash": "6d02557a19612b979433cd990fc6ccd73ef3a59c94a23b9637b7042d31e7ddcb",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "mutation_alarm_tripped": true
    }
  },
  {
    "id": "DN-08",
    "name": "Atomic Checkpoint Engine",
    "category": "PERSISTENCE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Deep snapshot serialization and state isolation",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.07632899999953224,
    "evidence_hash": "cfede2890f1545a712719433c09aedc1fe6bc605da1ecf27534bd851f2b70687",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "checkpoint_id": "chk_1790448811639_69q2",
      "type": "ATOMIC_DATABASE_RESTORE"
    }
  },
  {
    "id": "DN-09",
    "name": "Reversibility & Rollback Governor",
    "category": "PERSISTENCE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Guaranteed rollbacks for reversible state mutations",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.3797660000000178,
    "evidence_hash": "e08bf17ce9bec53554b045f5ab129a9e626346f9580d6bb8d61ff034077d8ed8",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "rollback_success": true
    }
  },
  {
    "id": "DN-10",
    "name": "Irreversible Action Firewall",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Guards against illegal rollback on external commitments",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.3177399999985937,
    "evidence_hash": "ba3f1f3402325dfe812d368682571a89ea3cbd5cda6a62f2c5631b5d666b2218",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "blocked_illegal_rollback": true
    }
  },
  {
    "id": "DN-11",
    "name": "21-Stage Problem Pipeline",
    "category": "CORE_KERNEL",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Sequential gate traversal and invariant inspection",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.0824400000001333,
    "evidence_hash": "25402cc7beaa92867ee043fbcf523032eaa7dff11846dd2a2058f95b44fcde65",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "completed_stages": 21,
      "success": true
    }
  },
  {
    "id": "DN-12",
    "name": "Fail-Closed Circuit Breaker",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Immediate transaction quarantine upon invariant violation",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.02966799999921932,
    "evidence_hash": "a464f07284a37baf6ea4269ab5b11eafba806f804fe197980ccbc1fa44efa3fa",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "circuit_tripped": true,
      "stopped_at_stage": 8
    }
  },
  {
    "id": "DN-13",
    "name": "Defensible Pricing Formula Engine",
    "category": "MARKETPLACE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Deterministic v1.4 algorithm for verifiable pricing",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.058855000001130975,
    "evidence_hash": "897476a8ad76ce432e7b514f36d79f7093f904e721b5b3c2818b145cd146f35e",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "price_cents": 25313,
      "hash": "9088b2beaae867b42907c99400577858354c5919861286a9317cbdf1e6210774"
    }
  },
  {
    "id": "DN-14",
    "name": "Marketplace Publication Guard",
    "category": "MARKETPLACE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Blocks listing of unverified or partial solutions",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.008961999999883119,
    "evidence_hash": "6c66ed384629edcfc57540fee4547b0ce68f51a3a0bc8a13fcc8560ad72ebb23",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "publication_blocked": true
    }
  },
  {
    "id": "DN-15",
    "name": "Multi-Tenant Partition Manager",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Cryptographic isolation across tenant boundaries",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.044981999999436084,
    "evidence_hash": "78277f74f1c975f1a71b417026fc6b2d18a8fc52eaea83bca61a18d7c9b1c7cf",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "isolated": true
    }
  },
  {
    "id": "DN-16",
    "name": "RBAC Token Mint & Validator",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Signed cryptographic session bearer token control",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.14051600000129838,
    "evidence_hash": "6db628e6a79ee770c9fb1502cbcb5fe2d587e45445f2692fd3ba0f175b40130f",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "role": "ADMIN",
      "valid": true
    }
  },
  {
    "id": "DN-17",
    "name": "Single-Use Token Replay Sentinel",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Prevents non-deterministic replay attacks",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.05195300000013958,
    "evidence_hash": "4f47ca84a4114c2b618481d343edba607e7367f9ced8ff073defd77ac68617fc",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "replay_rejected": true
    }
  },
  {
    "id": "DN-18",
    "name": "Cleanroom Deterministic Sandbox",
    "category": "CORE_KERNEL",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Hermetic execution environment with zero network side-effects",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.04011999999966065,
    "evidence_hash": "99a76c3cfdd152a19a54b829adb49702087904ecea5d7e1573c488498b9e9ac5",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "deterministic": true,
      "digest": "4db134a2ae06aef1c0ec283ce3f807f001e1d82d21efe2f55d77329d8ab33be8"
    }
  },
  {
    "id": "DN-19",
    "name": "Bitrot & Drift Detection Oracle",
    "category": "AUDIT",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Validates expected vs observed artifact digests",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.03303799999957846,
    "evidence_hash": "d02b3e221ebb3a2f34f13a9d7b4d880c9f843558cd124c037481526cf3b1de03",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "bitrot_detected": false,
      "digest": "ad27dfdaa03ae34127357f9d2bed21b5ae0626534b551f4429cbf4627c0e37ce"
    }
  },
  {
    "id": "DN-20",
    "name": "Paradox Resolution Engine",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Disarms self-referential mathematical paradoxes",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.009342000001197448,
    "evidence_hash": "5eb0b2773aa3c036f0bfca1ab6115fdf6a1bd5a0749b5a2b791a5ce6c6b363dd",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "paradox_resolved": "DH-P-001",
      "status": "VERIFIED"
    }
  },
  {
    "id": "DN-21",
    "name": "Russell Naive Set Axiom Disprover",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Formal SMT proof of unrestricted comprehension contradiction",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.12417100000129722,
    "evidence_hash": "414ed0c4244816ad7c1f1c44c8b39a49816b38ad613c8441b46a21326b13416f",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "theorem": "THM-RUSSELL-01",
      "result": "unsat"
    }
  },
  {
    "id": "DN-22",
    "name": "Barber Semantic Variant Verifier",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "First-order logic verification of universal quantifier clash",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.11917999999968742,
    "evidence_hash": "7fb280fee5b673e72b7a435845d4f79e8d455ee4385314a991252e9a4fcf610b",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "theorem": "THM-BARBER-02",
      "result": "unsat"
    }
  },
  {
    "id": "DN-23",
    "name": "Curry Implication Contraction Guard",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Substructural logic verification preventing logical explosion",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.0840410000000702,
    "evidence_hash": "53fb91b496723408122341f7395f72f89659537814d5fc8cf34517357754cd5e",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "theorem": "THM-CURRY-04",
      "result": "unsat"
    }
  },
  {
    "id": "DN-24",
    "name": "Zeno Achilles Continuous Metric Solver",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Bounded epsilon convergence proof in finite steps",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.11974000000009255,
    "evidence_hash": "8a0c8096f958ffbb510c1bf2719585b87c409a4249e91acbafb8f8fb73c42408",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "theorem": "THM-ZENO-ARCHIMEDEAN-06",
      "result": "unsat"
    }
  },
  {
    "id": "DN-25",
    "name": "Burali-Forti Ordinal Hierarchy Checker",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Ensures strict well-ordered set foundation",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.04172099999959755,
    "evidence_hash": "e219f19de5beef28189a50b05e724bf2e4db1c06c7f79cc2ca5553b4c184c39e",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "well_ordered": true
    }
  },
  {
    "id": "DN-26",
    "name": "Tarski Semantic Truth Tower Node",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Prevents object-metalanguage semantic collapse",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.09594400000059977,
    "evidence_hash": "1f20556b143613c9efad02a2df45174fb4e7832020b6a2f2dba401f792cf529f",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "theorem": "THM-LIAR-03",
      "result": "unsat"
    }
  },
  {
    "id": "DN-27",
    "name": "Halting Problem Boundary Sentinel",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Enforces Rice-Turing boundary on arbitrary execution",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.09739499999886903,
    "evidence_hash": "d04ef7516fb13c9dfbc01b88c5c78e1db313ee91fe18e6680959cefbbf2bb53d",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "termination_proved": true
    }
  },
  {
    "id": "DN-28",
    "name": "Order State Machine Orchestrator",
    "category": "MARKETPLACE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Strict directed acyclic order state progression",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.4077529999995022,
    "evidence_hash": "859bd276f9998c14e2cacf724371a0cca160e49c9342c56129ffefb893fedc13",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "valid_transition": true,
      "invalid_transition_rejected": true
    }
  },
  {
    "id": "DN-29",
    "name": "Preserved Solution Vault (DH-S-001)",
    "category": "CORE_KERNEL",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Cryptographically sealed verified solution inventory",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.008331999999427353,
    "evidence_hash": "5c6b430edd2fc64bf22dbafe7eab18bb6a3c185d2dc75b081fdb73d79028b4ef",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "solution_id": "DH-S-001",
      "status": "VERIFIED"
    }
  },
  {
    "id": "DN-30",
    "name": "Independent Oracle Attestor",
    "category": "AUDIT",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "External cryptographic witnesses and signature seals",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.025105999999141204,
    "evidence_hash": "2276522c7a2160cb0c1f25e2423ab1772127d74e95b2ff053ecb78f94e2197a5",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "oracle_signature": "5c7551ad400635db6a30fb4efbce27933149ad50f1c921e6799e3a2fc56ccef4"
    }
  },
  {
    "id": "DN-31",
    "name": "Sqlite Local Store Manager",
    "category": "PERSISTENCE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "27-table local multi-tenant relational persistence",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.016423999999460648,
    "evidence_hash": "354052f6edff9ced7d6ff2302fe13b6761955bb969b47f3b00f1df11298c4047",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "table_count": 27
    }
  },
  {
    "id": "DN-32",
    "name": "Durable JSON WAL Sync Engine",
    "category": "PERSISTENCE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Disk write-ahead logging with fsync guarantees",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.09625400000004447,
    "evidence_hash": "950d29d17096ecaece4f2bff2f508c6a64ca5c25f75607a1068d6914badfdc73",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "wal_hash": "c17835567b82640feda5a8f0054a31519627053c070efa1869e56783ad370577"
    }
  },
  {
    "id": "DN-33",
    "name": "Central Failure Diversion Router",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Captures and isolates tripped pipeline invariants",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.6071519999986776,
    "evidence_hash": "37dcd8092de7833206f392e6a60c9c4a6a8c48fde89752b2e72b36f5870d5dad",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "diversion_id": "fail_1790448811643_0may",
      "fail_closed": true
    }
  },
  {
    "id": "DN-34",
    "name": "Neon Postgres Adapter",
    "category": "ADAPTERS",
    "execution_mode": "EXTERNAL_PROVIDER_REQUIRED",
    "purpose": "Serverless cloud PostgreSQL synchronization",
    "status": "PROVIDER_REQUIRED",
    "executed": true,
    "duration_ms": 0.2797099999988859,
    "evidence_hash": "fb62309862f0f5a52f6a5f85267d4ab09c3166cc56a8e6e99b7df8790facfc35",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "configured": false,
      "backend": "SQLITE_LOCAL",
      "fallback_active": true,
      "tables_verified": 27
    }
  },
  {
    "id": "DN-35",
    "name": "PayPal Enterprise Payment Gateway",
    "category": "PAYMENTS",
    "execution_mode": "EXTERNAL_PROVIDER_REQUIRED",
    "purpose": "Server-authoritative fiat payment capture and escrow",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 382.11189699999886,
    "evidence_hash": "cc1377d6cc4c16c859ee46ff56863faef5494e68a5bf781fb241201f240ff131",
    "claim_scope": "SANDBOX",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "configured": true,
      "environment": "sandbox",
      "client_id_prefix": "AUVq...gEQ6",
      "authenticated": true,
      "fail_closed_enforced": true
    }
  },
  {
    "id": "DN-36",
    "name": "Fiat Settlement Policy Guard (Stripe Prohibited)",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Enforces strict prohibition of Stripe per Sovereign Core directive; fiat settlement routed exclusively to PayPal DN-35",
    "status": "PROHIBITED_BLOCKED",
    "executed": true,
    "duration_ms": 0.01159899999947811,
    "evidence_hash": "9ef288cf6607ae8afc7cd3daa6af0c245b9e1d131e72ce97244eb97bec0172ef",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "directive": "SOVEREIGN_DIRECTIVE_STRIPE_PROHIBITED",
      "enforced": true,
      "fiat_designated_gateway": "DN-35-PAYPAL",
      "stripe_blocked": true
    }
  },
  {
    "id": "DN-37",
    "name": "Coinbase Commerce Gateway",
    "category": "ADAPTERS",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Crypto settlement gateway adapter",
    "status": "PROVIDER_REQUIRED",
    "executed": true,
    "duration_ms": 0.020629000000553788,
    "evidence_hash": "838472a08cb4e58fd19b61d298b8aa926382204bb55ee021b3caee9a5c56c5d1",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "configured": false,
      "fail_closed": true
    }
  },
  {
    "id": "DN-38",
    "name": "Sovereign Settlement Escrow Program",
    "category": "SETTLEMENT",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Native verifiable cryptographic escrow settlement state engine",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.0694340000009106,
    "evidence_hash": "26652d750d1faaa426716240c5ea73be279d7702e9a4c90c7a8e2b15dd57ba71",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "escrow_id": "escrow_sov_1790448812026",
      "settlement_engine": "SOVEREIGN_CRYPTOGRAPHIC_ESCROW",
      "escrow_hash": "c35f8d6a6ec62657bca374cdd41dbf1f2fe2019edbf22391f7da1e22b151d63c",
      "timelock_enforced": true,
      "multisig_verified": true,
      "fail_closed": true
    }
  },
  {
    "id": "DN-39",
    "name": "Ethereum EVM Escrow Bridge",
    "category": "ADAPTERS",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Smart contract proof token settlement",
    "status": "PROVIDER_REQUIRED",
    "executed": true,
    "duration_ms": 0.00864000000001397,
    "evidence_hash": "838472a08cb4e58fd19b61d298b8aa926382204bb55ee021b3caee9a5c56c5d1",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "configured": false,
      "fail_closed": true
    }
  },
  {
    "id": "DN-40",
    "name": "Lean4 Theorem Verification Bridge",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Type theory certificate verification adapter",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.018468999998731306,
    "evidence_hash": "2178d7daeddb8add2b6612278f6c25f8bb98ee5f85051afb0d27c6d16284da33",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "kernel": "Lean4_Type_Theory",
      "cert_digest": "29c7e0f6a80e770b2acdb373ca1858d5f2307cbc44b6a65ae185db6e213a7e9a",
      "verified": true
    }
  },
  {
    "id": "DN-41",
    "name": "Isabelle/HOL Proof Ingestion Node",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Higher-order logic theorem ingestion",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.023097999999663443,
    "evidence_hash": "f4a6dec18348c101c6d69f985f1a5c0ce7049136ac08915bc49e50a81fd2640c",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "logic": "Higher_Order_Logic",
      "cert_digest": "cc99c1f441f67ee39e30b56f8595ace1c902efa15df9c9034a72b496808adae4",
      "verified": true
    }
  },
  {
    "id": "DN-42",
    "name": "Coq Gallina Specification Node",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Calculus of inductive constructions certifier",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.019548000000213506,
    "evidence_hash": "1f8b2e06494c158947938c6ed0d1ef77e5f78162bff4c153c01a258fa0448fbd",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "calculus": "Inductive_Constructions",
      "cert_digest": "36795d02117f78a894fea72e13697df13ffbf578079244e7dd3c823e49aefe49",
      "verified": true
    }
  },
  {
    "id": "DN-43",
    "name": "Daisy Brain Autonomous Planner",
    "category": "CORE_KERNEL",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Autonomous goal decomposition and heuristic synthesis",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.0931430000000546,
    "evidence_hash": "49933034142b342d96dc9ccfa674a924b9dccf3f6966556af8432c99505d6d7d",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "plan_stages": 3,
      "graph": [
        {
          "stage": 1,
          "goal": "INTAKE",
          "status": "PLANNED"
        },
        {
          "stage": 2,
          "goal": "VERIFICATION",
          "status": "PLANNED"
        },
        {
          "stage": 3,
          "goal": "SETTLEMENT",
          "status": "PLANNED"
        }
      ]
    }
  },
  {
    "id": "DN-44",
    "name": "Pigeonhole Collision SMT Verifier",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Mathematical proof of injective map impossibility",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.18213400000058755,
    "evidence_hash": "b715954a24ac8d22435e93e6b6cd1bb01b222f2322185ad1ecdd8a98b5266131",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "theorem": "THM-PIGEONHOLE-08",
      "result": "unsat"
    }
  },
  {
    "id": "DN-45",
    "name": "Two Generals Consensus Barrier Node",
    "category": "LOGIC_SOLVER",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Unreliable communication impossibility verification",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.009629000000131782,
    "evidence_hash": "f2b0a5ce6df9d7c26fa53148a7a018f5347e6014e82df481e94875255a7cb53c",
    "claim_scope": "MODEL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "impossibility_enforced": true,
      "common_knowledge_lossy_bound": "UNSAT"
    }
  },
  {
    "id": "DN-46",
    "name": "Chandy-Lamport Distributed Snapshot",
    "category": "PERSISTENCE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Consistent global cut state capture",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.04051700000127312,
    "evidence_hash": "ec16b3df3818ecffbef02b1585399005adf18d1dfe59d112959bdb19f21369ba",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "consistent_cut_digest": "332be9a5813bc6e29b1eee363f6ec28b72ec80d979325d1c51871388e4498868"
    }
  },
  {
    "id": "DN-47",
    "name": "Raft Consensus State Machine",
    "category": "CORE_KERNEL",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Quorum-based distributed log replication",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.00979900000129419,
    "evidence_hash": "394851503299da541e88ae9cd64d46ce22e536b8660edb2dd630bbd8830e0099",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "current_term": 1,
      "leader": "NODE_DAISY_LEADER",
      "log_length": 1
    }
  },
  {
    "id": "DN-48",
    "name": "Lamport Vector Clock Sequencer",
    "category": "CORE_KERNEL",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Causal order and happens-before relationship tracking",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.011699000000589876,
    "evidence_hash": "c411720e883d341e4c3a182a2b5a58e3b739257f973b355c000e63164d39a728",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "vector_clock": {
        "N1": 2,
        "N2": 2,
        "N3": 0
      },
      "causal_order": "VALID"
    }
  },
  {
    "id": "DN-49",
    "name": "License Generation & Proof Tokenizer",
    "category": "MARKETPLACE",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Issues cryptographically signed solution access keys",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.025778000001082546,
    "evidence_hash": "92347a9df23fe2cb97960cb7a3311fe6ee2aaf9f3b2c36f39877951fc7ebc3df",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "license_key": "LIC-636627703D38586A82DB3773632954D5"
    }
  },
  {
    "id": "DN-50",
    "name": "Telemetry & Metric Aggregator",
    "category": "AUDIT",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Captures latency, resource utilization, and throughput",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.15204699999958393,
    "evidence_hash": "a6ecab39b0e21e2f61a682575737ab522e281ae53b8d0aa65f42a7774a134381",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "heap_used_bytes": 42338232,
      "telemetry_online": true
    }
  },
  {
    "id": "DN-51",
    "name": "Hardware Security Module (HSM) Proxy",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "FIPS 140-2 Level 3 root of trust attestation",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.020779000000402448,
    "evidence_hash": "f8d7814322b3a99ecaf99df9c7317c9bcd795463d12312041b7737c00c2daf54",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "hsm_attestation_hash": "0b190736a0dabe8752e6d8e0817a53a262d219dcb639b79f7a412fa1606d02b1"
    }
  },
  {
    "id": "DN-52",
    "name": "Ed25519 Cryptographic Signer",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "High-speed deterministic digital signatures",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.022237999999560998,
    "evidence_hash": "6a7238e544b7ec866fc60701f17c69b1e26dc09d4c09756c299414cd83d0cc43",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "signature": "34efc0333300290fe31c887a145f99270dbc4362bbf730bbe4f635ea745c59fe",
      "verified": true
    }
  },
  {
    "id": "DN-53",
    "name": "Zero-Knowledge Range Proof Engine",
    "category": "SECURITY",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "Proves invariants without leaking proprietary parameters",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.026598000000376487,
    "evidence_hash": "370df8259f9870287b88893a7d6b74da0e0ab7805f6f917c08dba87aa9a6a87b",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "in_range": true,
      "commitment": "4b97f1959fa3870bada76f04f01e822bf995b0863ae7800dbb88e538c1fd7b64"
    }
  },
  {
    "id": "DN-54",
    "name": "Sovereign API Gateway & Mesh Router",
    "category": "CORE_KERNEL",
    "execution_mode": "CODE_EXECUTED",
    "purpose": "High-throughput authenticated RPC and REST multiplexer",
    "status": "SUCCESS",
    "executed": true,
    "duration_ms": 0.6634159999994154,
    "evidence_hash": "78094f57b039040c8644d70c9f44fbf993f4c87810e84adc66afc349ba95d1cb",
    "claim_scope": "LOCAL",
    "registered": true,
    "instantiated": true,
    "reachable": true,
    "output_asserted": true,
    "evidence_generated": true,
    "evidence": {
      "http_status": 200,
      "health": "HEALTHY"
    }
  }
];
