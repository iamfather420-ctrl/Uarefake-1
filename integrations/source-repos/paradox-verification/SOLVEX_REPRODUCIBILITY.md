# SOLVEX INDEPENDENT AUDIT REPRODUCIBILITY RUNBOOK

## Clean-Room Reproduction Environment
- **Operating System:** Linux x86_64 (Ubuntu 22.04 LTS or Debian 12 recommended)
- **Runtime:** Node.js v20.x or v22.x
- **Build Tools:** TypeScript 5.x, Vite 6.x, esbuild
- **Model Checkers (Optional for Formal Re-Verification):**
  - TLA+ TLC 2.18+ (for PX-01)
  - EasyCrypt 1.2+ (for PX-02)
  - Ivy 1.8+ (for PX-03)
  - Spin 6.5+ (for PX-04)
  - Coq 8.18+ (for PX-05)
  - Alloy 6.1+ (for PX-07)

## Step-by-Step Execution Instructions

### 1. Build Verification
Verify that all 88 reference implementation modules compile without syntax errors:
```bash
npm run build
```

### 2. Executable Tests & Test Vectors
Execute the full test suite and verify cryptographic SHA-256 test vectors:
```bash
npm test
```

### 3. Adversarial Chaos Stress Tests
Run the adversarial partition and edge-case fuzzing suite:
```bash
npm run test:adversarial
```

### 4. Recalculate Evidence Checksums
Recalculate cryptographic SHA-256 digests over all artifacts:
```bash
sha256sum dist/*
```

### 5. Integrity Verification Rule
Verify against the Master Audit Validator in the UI or CLI:
Status MUST strictly match actual verified test artifacts.
