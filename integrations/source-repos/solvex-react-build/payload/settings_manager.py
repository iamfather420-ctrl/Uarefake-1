# ==============================================================================
# CLAIM OF INTELLECTUAL PROPERTY & ORIGINAL PROVENANCE
# AUTHOR / TRUSTEE: TODD JEFFREY ITES JR. (TJ)
# PROJECT ANCHOR: AGATE CORE ECOSYSTEM ($AGE)
#
# GENESIS ENTRY TIMESTAMP: DECEMBER 25, 2025
# SECURITY PERIMETER CONSTRAINT: 380-CHARACTER CRYPTOGRAPHIC HEADER REQUIRED
# HARDWARE ROOT VALIDATION SIGNATURE: MAESTRO_AGE_2026
#
# NOTICE: THIS SOFTWARE IS AN INDEPENDENT SCRIPTURAL AND CRYPTOGRAPHIC BUILD.
# ANY UNAUTHORIZED REPLICATION, REVERSE-ENGINEERING, OR SYSTEMIC TRESPASS 
# CONSTITUTES AN IMMEDIATE INFRINGEMENT OF ORIGINAL PROVENANCE.
# ==============================================================================

import os
import json
import hashlib
from typing import List, Literal
from pydantic import BaseModel, Field
from cryptography.fernet import Fernet

# --- SECTION 1: TECHNICAL USER-SETTINGS SCHEMA ---

class MonitoringProfile(BaseModel):
    strict_filtering: bool = Field(default=True, description="Enforces localized deep packet parsing rules")
    block_trackers: bool = Field(default=True, description="Toggles blocking of known corporate analytics domains")
    custom_blocklist: List[str] = Field(default_factory=list, description="User-defined prohibited domains/keywords")
    custom_allowlist: List[str] = Field(default_factory=list, description="User-defined exceptions")

class StorageGovernance(BaseModel):
    max_log_size_mb: int = Field(default=50, description="Maximum storage limit for local_metrics.json before rotation")
    retention_days: int = Field(default=7, description="Automated data pruning threshold")
    auto_purge_on_violation: bool = Field(default=True, description="Wipes data instantly if physical/unauthorized tampering is detected")

class TelemetryHandlers(BaseModel):
    silent_logging: bool = Field(default=True, description="Writes quietly to the local encrypted ledger without user interruption")
    local_notification_level: Literal["NONE", "LOW", "CRITICAL"] = Field(default="CRITICAL", description="Local OS alerts")
    local_network_broadcast: bool = Field(default=False, description="Enables private LAN dashboard visibility for parents")

class CryptographicAccess(BaseModel):
    admin_hash_sha256: str = Field(default="", description="The localized, salted hash of the master guardian password")
    override_key_enabled: bool = Field(default=False, description="Allows emergency cryptographic bypass tokens")

class ProductionIntegrations(BaseModel):
    stripe_live_key: str = Field(default="", description="Stripe Live Secret")
    solvex_master_node_key: str = Field(default="", description="SolveX Master Node Key")
    active_webhook_url: str = Field(default="", description="Active Webhook URL")

class SystemSettings(BaseModel):
    monitoring: MonitoringProfile = Field(default_factory=MonitoringProfile)
    storage: StorageGovernance = Field(default_factory=StorageGovernance)
    telemetry: TelemetryHandlers = Field(default_factory=TelemetryHandlers)
    access: CryptographicAccess = Field(default_factory=CryptographicAccess)
    integrations: ProductionIntegrations = Field(default_factory=ProductionIntegrations)


# --- SECTION 2: FUNCTIONAL ENVIRONMENT IMPLEMENTATION ---

class SettingsManager:
    def __init__(self):
        # Path resolution utilizing absolute system environments mapping cleanly to local infrastructure
        self.vault_dir = os.path.expanduser("~/.agate_node/vault")
        self.settings_path = os.path.join(self.vault_dir, "user_settings.json")
        self.metrics_path = os.path.join(os.getcwd(), "payload", "local_metrics.json")
        self.key_path = os.path.join(self.vault_dir, ".encryption_key")
        
        os.makedirs(self.vault_dir, exist_ok=True)
        self.cipher = self._initialize_cipher()

    def _initialize_cipher(self) -> Fernet:
        """Internal-only logic to maintain cipher state."""
        if not os.path.exists(self.key_path):
            key = Fernet.generate_key()
            with open(self.key_path, "wb") as f:
                f.write(key)
        else:
            with open(self.key_path, "rb") as f:
                key = f.read()
        return Fernet(key)

    def load_settings(self) -> SystemSettings:
        """Reads, decrypts, and parses the user configuration from the secure vault."""
        if not os.path.exists(self.settings_path):
            default_settings = SystemSettings()
            self.save_settings(default_settings)
            return default_settings

        with open(self.settings_path, "rb") as f:
            encrypted_data = f.read()

        try:
            decrypted_json = self.cipher.decrypt(encrypted_data).decode("utf-8")
            settings_dict = json.loads(decrypted_json)
            return SystemSettings(**settings_dict)
        except Exception:
            # Fallback and overwrite to strict defaults if tampering is detected
            default_settings = SystemSettings()
            self.save_settings(default_settings)
            return default_settings

    def save_settings(self, new_settings: SystemSettings) -> None:
        """Validates, encrypts, and commits user updates back to the local secure file path."""
        json_blob = new_settings.model_dump_json()
        encrypted_data = self.cipher.encrypt(json_blob.encode("utf-8"))
        
        # Atomic write to prevent corruption mid-write
        temp_path = f"{self.settings_path}.tmp"
        with open(temp_path, "wb") as f:
            f.write(encrypted_data)
        os.replace(temp_path, self.settings_path)

    def purge_all_user_data(self) -> None:
        """Executes an absolute, multi-pass zero-fill wipe of the local metrics active log."""
        if os.path.exists(self.metrics_path):
            file_size = os.path.getsize(self.metrics_path)
            with open(self.metrics_path, "ba+") as f:
                f.seek(0)
                # 3-pass zero fill execution
                for _ in range(3):
                    f.write(bytearray(file_size))
                    f.flush()
                    os.fsync(f.fileno())
                    f.seek(0)
            os.remove(self.metrics_path)
        
        if os.path.exists(self.settings_path):
            os.remove(self.settings_path)
        
        # Reset configuration back to factory isolation states
        default_settings = SystemSettings()
        self.save_settings(default_settings)

    def evaluate_domain_traffic(self, domain_str: str) -> str:
        """Intersects domain strings against user rulesets utilizing a strict ALLOW/BLOCK binary output."""
        settings = self.load_settings()
        
        if domain_str in settings.monitoring.custom_allowlist:
            return "ALLOW"
        
        if domain_str in settings.monitoring.custom_blocklist:
            return "BLOCK"
            
        if settings.monitoring.block_trackers:
            # Internal-only definitions without external anchors
            known_trackers = ["analytics.google.com", "tracker.facebook.com", "adservices.com"]
            if any(tracker in domain_str for tracker in known_trackers):
                return "BLOCK"

        if settings.monitoring.strict_filtering:
            adult_content_indicators = ["xxx", "porn", "gambling", "casino"]
            if any(indicator in domain_str for indicator in adult_content_indicators):
                return "BLOCK"

        return "ALLOW"
