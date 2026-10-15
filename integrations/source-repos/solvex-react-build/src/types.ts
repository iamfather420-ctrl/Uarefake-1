/**
 * ==============================================================================
 * CLAIM OF INTELLECTUAL PROPERTY & ORIGINAL PROVENANCE
 * AUTHOR / TRUSTEE: TODD JEFFREY ITES JR. (TJ)
 * PROJECT ANCHOR: SOLVEX DECENTRALIZED PIPELINE CAAS
 *
 * GENESIS ENTRY TIMESTAMP: DECEMBER 25, 2025
 * SECURITY PERIMETER CONSTRAINT: 380-CHARACTER CRYPTOGRAPHIC HEADER REQUIRED
 * HARDWARE ROOT VALIDATION SIGNATURE: MAESTRO_AGE_2026
 *
 * NOTICE: THIS SOFTWARE IS AN INDEPENDENT SCRIPTURAL AND CRYPTOGRAPHIC BUILD.
 * ANY UNAUTHORIZED REPLICATION, REVERSE-ENGINEERING, OR SYSTEMIC TRESPASS 
 * CONSTITUTES AN IMMEDIATE INFRINGEMENT OF ORIGINAL PROVENANCE.
 * ==============================================================================
 */

/**
 * System Architecture Blueprint: Tri-Layer Isolated Deployment Pipeline
 * Type Definitions for React System Settings UI
 */

export interface MonitoringProfile {
  strict_filtering: boolean;
  block_trackers: boolean;
  custom_blocklist: string[];
  custom_allowlist: string[];
}

export interface StorageGovernance {
  max_log_size_mb: number;
  retention_days: number;
  auto_purge_on_violation: boolean;
}

export interface TelemetryHandlers {
  silent_logging: boolean;
  local_notification_level: 'NONE' | 'LOW' | 'CRITICAL';
  local_network_broadcast: boolean;
}

export interface CryptographicAccess {
  admin_hash_sha256: string;
  override_key_enabled: boolean;
}

export interface ProductionIntegrations {
  stripe_live_key: string;
  solvex_master_node_key: string;
  active_webhook_url: string;
}

export interface SystemSettings {
  monitoring: MonitoringProfile;
  storage: StorageGovernance;
  telemetry: TelemetryHandlers;
  access: CryptographicAccess;
  integrations: ProductionIntegrations;
}
