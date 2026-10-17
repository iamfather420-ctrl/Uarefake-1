/**
 * AUDIT ARTIFACT GENERATOR SCRIPT
 * 
 * Generates the authoritative final verification lock artifacts:
 * - SOLVEX_FINAL_AUDIT.json
 * - SOLVEX_FINAL_AUDIT_REPORT.md
 * - SOLVEX_EVIDENCE_INDEX.json
 * - SOLVEX_CHAIN_OF_CUSTODY.json
 * - SOLVEX_REPRODUCIBILITY.md
 */

import fs from 'fs';
import path from 'path';
import { 
  generateFinalAuditJson, 
  generateFinalAuditReportMarkdown, 
  generateEvidenceIndexJson, 
  generateChainOfCustodyJson, 
  generateReproducibilityMarkdown 
} from '../src/utils/exportPackage.ts';

async function main() {
  console.log('Generating SolveX Formal Audit Lock Artifacts...');
  const rootDir = process.cwd();

  const finalAuditJson = generateFinalAuditJson();
  fs.writeFileSync(path.join(rootDir, 'SOLVEX_FINAL_AUDIT.json'), finalAuditJson, 'utf-8');
  console.log('✓ Wrote SOLVEX_FINAL_AUDIT.json');

  const finalAuditReportMd = generateFinalAuditReportMarkdown();
  fs.writeFileSync(path.join(rootDir, 'SOLVEX_FINAL_AUDIT_REPORT.md'), finalAuditReportMd, 'utf-8');
  console.log('✓ Wrote SOLVEX_FINAL_AUDIT_REPORT.md');

  const evidenceIndexJson = generateEvidenceIndexJson();
  fs.writeFileSync(path.join(rootDir, 'SOLVEX_EVIDENCE_INDEX.json'), evidenceIndexJson, 'utf-8');
  console.log('✓ Wrote SOLVEX_EVIDENCE_INDEX.json');

  const chainOfCustodyJson = generateChainOfCustodyJson();
  fs.writeFileSync(path.join(rootDir, 'SOLVEX_CHAIN_OF_CUSTODY.json'), chainOfCustodyJson, 'utf-8');
  console.log('✓ Wrote SOLVEX_CHAIN_OF_CUSTODY.json');

  const reproducibilityMd = generateReproducibilityMarkdown();
  fs.writeFileSync(path.join(rootDir, 'SOLVEX_REPRODUCIBILITY.md'), reproducibilityMd, 'utf-8');
  console.log('✓ Wrote SOLVEX_REPRODUCIBILITY.md');

  console.log('\nAll 5 SolveX Audit Lock Artifacts successfully generated on disk.');
}

main().catch(err => {
  console.error('Failed to generate audit artifacts:', err);
  process.exit(1);
});
