export const gatesMeta = {
  "pipeline_name": "Project AGATE Sovereign Core Authoritative 15-Gate Verification",
  "version": "1.0.0-PROD",
  "execution_id": "exec_pipeline_1790448801898",
  "commit_sha": "PROVENANCE_UNVERIFIED",
  "environment": "local",
  "started_at": "2026-09-26T18:53:21.898Z",
  "completed_at": "2026-09-26T18:53:32.194Z",
  "total_duration_ms": 10295.69,
  "gates_total": 15,
  "gates_passed": 13,
  "production_gate_verdict": "BLOCKED_MISSING_EXTERNAL_CREDENTIALS",
  "claim_scope_verdict": "LOCAL_VERIFIED / MODEL_VERIFIED",
  "artifacts_directory": "/app/applet/artifacts"
} as const;
export const executionGates = [
  {
    "id": "GATE-00",
    "name": "Repository Integrity",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 7.03,
    "claim_scope": "LOCAL",
    "details": {
      "execution_id": "exec_pipeline_1790448801898",
      "commit_sha": "PROVENANCE_UNVERIFIED",
      "note": "Static snapshot without git working copy"
    }
  },
  {
    "id": "GATE-01",
    "name": "Dependency Preflight Layer",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 0.02,
    "claim_scope": "LOCAL",
    "details": {
      "total_dependencies": 8,
      "present": 7,
      "missing": 0
    }
  },
  {
    "id": "GATE-02",
    "name": "Secret & Configuration Preflight",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 0.01,
    "claim_scope": "LOCAL",
    "details": {
      "environment": "local",
      "present_vars": [
        "PAYPAL_SANDBOX_CLIENT_ID",
        "PAYPAL_SANDBOX_CLIENT_SECRET",
        "PAYPAL_LIVE_CLIENT_ID",
        "PAYPAL_LIVE_CLIENT_SECRET",
        "GEMINI_API_KEY"
      ],
      "absent_vars": []
    }
  },
  {
    "id": "GATE-03",
    "name": "Execution Environment Selection",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 0,
    "claim_scope": "LOCAL",
    "details": {
      "selected_environment": "local",
      "production_explicit_opt_in": false,
      "policy": "Production claims require explicit opt-in (SOLVEX_ENV=production) and live provider verification"
    }
  },
  {
    "id": "GATE-04",
    "name": "Build & TypeScript Static Verification",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 2250.4,
    "claim_scope": "LOCAL",
    "details": {
      "typecheck": "CLEAN"
    }
  },
  {
    "id": "GATE-05",
    "name": "Unit & Enterprise Invariant Test Suite",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 1160.91,
    "claim_scope": "LOCAL",
    "details": {
      "total_tests": 30,
      "passed_tests": 30,
      "pass_rate": "100%"
    }
  },
  {
    "id": "GATE-06",
    "name": "DFRL 88-Operator Z3 SMT Formal Verification",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 6058.52,
    "claim_scope": "MODEL",
    "details": {
      "total_propositions": 88,
      "attempted": 88,
      "executed": 88,
      "unsat_proved_count": 88,
      "authored_models_count": 20,
      "generated_models_count": 68,
      "solver_engine": "Microsoft Research Z3 WASM (z3-solver)",
      "solver_version": "Microsoft Research Z3 WASM 5.2.0",
      "root_sha256": "bcc63e033f2a315d1ac65a647c493d81e4d8870b2f92191fce94985995ab48ec"
    }
  },
  {
    "id": "GATE-07",
    "name": "Cleanroom Deterministic Replay Verification",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 0,
    "claim_scope": "MODEL",
    "details": {
      "total_operators_replayed": 88,
      "replays_matched": 88,
      "independent_contexts_reconstructed": 88,
      "bitrot_divergence": 0
    }
  },
  {
    "id": "GATE-08",
    "name": "SMT Mutation, SHA-256 Tamper & Fail-Closed Tests",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 72.13,
    "claim_scope": "LOCAL",
    "details": {
      "smt_mutation_detected": true,
      "smt_mutation_transition": "unsat -> sat",
      "z3_failure_injection_fail_closed": true,
      "artifact_tamper_alarm_triggered": true,
      "fail_closed_active": true
    }
  },
  {
    "id": "GATE-09",
    "name": "Daisy 54-Node Architecture CUJ Execution Coverage",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 394.2,
    "claim_scope": "LOCAL",
    "details": {
      "total_nodes": 54,
      "registered_nodes": 54,
      "instantiated_nodes": 54,
      "reachable_nodes": 54,
      "executed_nodes": 54,
      "output_asserted_nodes": 54,
      "evidence_generated_nodes": 54,
      "unsatisfied_node_ids": [],
      "baseline_internal_18": 18,
      "expanded_internal_33": 34,
      "gateways_3": 2,
      "policy_interlocks_1": 1
    }
  },
  {
    "id": "GATE-10",
    "name": "Multi-Tenant Relational & Merkle Chain Persistence",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 2.41,
    "claim_scope": "LOCAL",
    "details": {
      "sqlite_tables_count": 27,
      "required_tables": 27,
      "all_local_passed": true,
      "migration_passed": true,
      "tenant_isolation_passed": true,
      "transaction_rollback_passed": true,
      "restart_readback_passed": true,
      "audit_chain_passed": true,
      "evidence_persistence_passed": true,
      "neon_status": "PROVIDER_REQUIRED"
    }
  },
  {
    "id": "GATE-11",
    "name": "External Provider Gateways (Neon, PayPal)",
    "status": "EXTERNAL_PROVIDER_REQUIRED",
    "passed": false,
    "duration_ms": 157.94,
    "claim_scope": "LOCAL",
    "details": {
      "paypal": {
        "configured": true,
        "environment": "sandbox",
        "authenticated": true,
        "status": "AUTHENTICATED",
        "claim_scope": "LOCAL"
      },
      "neon": {
        "configured": false,
        "connected": false,
        "status": "EXTERNAL_PROVIDER_REQUIRED",
        "claim_scope": "LOCAL"
      },
      "stripe": {
        "status": "PROHIBITED_BLOCKED",
        "policy": "Sovereign Security Directive forbids Stripe; fiat settlements route exclusively to PayPal DN-35"
      }
    }
  },
  {
    "id": "GATE-12",
    "name": "End-to-End Lifecycle Execution",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 0.82,
    "claim_scope": "LOCAL",
    "details": {
      "solution_pipeline": {
        "success": true,
        "completed_stages": 21,
        "total_stages": 21,
        "solution_id": "DH-S-MUIQZT7I"
      },
      "order_lifecycle": {
        "order_id": "e2e_order_1790448812190",
        "transitions_executed": [
          "ORDER_CREATED",
          "ESCROW_FUNDED",
          "SANDBOX_PROVISIONED",
          "REPLAY_VERIFIED",
          "DEPLOYED"
        ],
        "final_status": "DEPLOYED"
      },
      "merkle_audit_append": {
        "record_id": "audit_1790448812191_15",
        "record_hash": "09bb1d4a4334f03f4cd2db9e614e948cb31ff6f040c54163a0580cc934dbcbfa"
      }
    }
  },
  {
    "id": "GATE-13",
    "name": "Evidence Generation & Artifact Packaging",
    "status": "PASSED",
    "passed": true,
    "duration_ms": 2.78,
    "claim_scope": "LOCAL",
    "details": {
      "artifacts_generated": [
        "DFRL-88-MACHINE-VERIFICATION-AUDIT.md",
        "DFRL-88-MACHINE-VERIFICATION-AUDIT.json",
        "public/dfrl_complete_88_proof_dossier.json",
        "enterprise-verification-report.json",
        "enterprise-verification-report.md",
        "solvex-manifest.json",
        "preflight-report.json",
        "preflight-report.md"
      ]
    }
  },
  {
    "id": "GATE-14",
    "name": "Final Truth-Boundary Audit & Production Gate",
    "status": "BLOCKED",
    "passed": false,
    "duration_ms": 0.04,
    "claim_scope": "LOCAL",
    "details": {
      "execution_id": "exec_pipeline_1790448801898",
      "verdict": "BLOCKED_MISSING_EXTERNAL_CREDENTIALS",
      "claim_scope": "LOCAL_VERIFIED / MODEL_VERIFIED",
      "blockers_count": 1,
      "blockers": [
        "Environment is currently [LOCAL]. Production requires explicit SOLVEX_ENV=production opt-in and live provider verification."
      ]
    }
  }
];
export const productionBlockers = ["Environment is currently [LOCAL]. Production requires explicit SOLVEX_ENV=production opt-in and live provider verification."] as const;
