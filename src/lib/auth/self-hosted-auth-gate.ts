export type SelfHostedAuthProductionGate = {
  passwordAuthEnabled: boolean;
  productionApproved: boolean;
  recoveryVerified: boolean;
  emailVerificationVerified: boolean;
  tenantIsolationVerified: boolean;
  backupRestoreVerified: boolean;
  runtimeDatabaseConfigured: boolean;
  signingSecretConfigured: boolean;
  canonicalBaseUrlConfigured: boolean;
};

/** Production auth is opt-in and fails closed until every required control is verified. */
export function isSelfHostedAuthProductionReady(gate: SelfHostedAuthProductionGate): boolean {
  return gate.passwordAuthEnabled && gate.productionApproved && gate.recoveryVerified && gate.tenantIsolationVerified && gate.backupRestoreVerified && gate.runtimeDatabaseConfigured && gate.signingSecretConfigured && gate.canonicalBaseUrlConfigured;
}
