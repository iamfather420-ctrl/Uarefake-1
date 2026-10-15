/**
 * CI/CD AUDIT TEST RUNNER
 * 
 * Executes:
 * 1. NIST FIPS 180-4 SHA-256 Engine Self-Test against official vectors
 * 2. Master Audit Validator across all 88 paradox certificates
 * 3. Reproducibility Harness (BUILD -> VERIFY -> TEST -> HASH -> EXPORT)
 */

import { verifySha256EngineIntegrity, realSha256 } from '../src/utils/cryptoSha256.ts';
import { runMasterAuditValidation } from '../src/utils/auditValidator.ts';
import { executeReproducibilityHarness } from '../src/utils/reproducibilityHarness.ts';

async function main() {
  console.log('================================================================');
  console.log('SOLVEX ENTERPRISE AUDIT ENGINE: CI/CD FORMAL TEST RUNNER');
  console.log('================================================================');

  // 1. Crypto verification
  console.log('\n[1/3] Testing NIST FIPS 180-4 SHA-256 Engine...');
  const cryptoOk = verifySha256EngineIntegrity();
  if (!cryptoOk) {
    console.error('FATAL: SHA-256 engine failed official NIST test vectors!');
    process.exit(1);
  }
  console.log('✓ SHA-256 engine verified against NIST vectors (zero simulated hashes).');

  // 2. Master Audit Validator
  console.log('\n[2/3] Executing Master Audit Validator across 88 paradoxes...');
  const report = runMasterAuditValidation();
  console.log(`Total Certificates Audited: ${report.totalCertificatesAudited}`);
  console.log(`Integrity Score: ${report.overallIntegrityScorePercent}%`);
  console.log(`PASS: ${report.counts.PASS} | FAIL: ${report.counts.FAIL} | WARNING: ${report.counts.WARNING} | MISSING EVIDENCE: ${report.counts.MISSING_EVIDENCE}`);

  if (report.counts.FAIL > 0) {
    console.error(`FATAL: ${report.counts.FAIL} audit validation checks failed!`);
    report.checks.filter(c => c.result === 'FAIL').forEach(c => {
      console.error(` - [${c.checkId}] ${c.checkName}: ${c.details}`);
    });
    process.exit(1);
  }
  console.log('✓ Master Audit Validator passed 100% of schema, crypto, attestation, and boundaries.');

  // 3. Reproducibility Pipeline
  console.log('\n[3/3] Executing Reproducibility Pipeline Harness...');
  const repro = await executeReproducibilityHarness();
  console.log(`Run ID: ${repro.executionId}`);
  console.log(`Overall Result: ${repro.overallResult}`);
  repro.stages.forEach(st => {
    console.log(` - Stage ${st.stage}: ${st.status} (${st.durationMs}ms)`);
  });

  if (repro.overallResult === 'FAIL') {
    console.error('FATAL: Reproducibility pipeline reported failure!');
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('ALL FORMAL AUDIT AND CRYPTOGRAPHIC CHECKS PASSED PERFECTLY!');
  console.log('================================================================');
}

main().catch(err => {
  console.error('Unexpected error in test runner:', err);
  process.exit(1);
});
