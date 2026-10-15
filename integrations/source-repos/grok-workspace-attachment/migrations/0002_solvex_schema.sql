-- Solvex 27-entity ledger (UAREFAKE). Auth-off: rows are unowned public records.
-- Adapted from the sovereign schema: timestamps as bigint, json payloads as text.

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL,
  isolated_storage_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  display_name TEXT,
  role TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  permissions_json TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tenant_memberships (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role_id TEXT,
  status TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS problems (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  raw_problem TEXT NOT NULL,
  normalized_title TEXT NOT NULL,
  domain TEXT NOT NULL,
  detected_constraints_json TEXT NOT NULL,
  invariants_json TEXT NOT NULL,
  status TEXT NOT NULL,
  version TEXT NOT NULL,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS paradoxes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  category TEXT NOT NULL,
  classification TEXT NOT NULL,
  scope TEXT NOT NULL,
  formal_invariant TEXT NOT NULL,
  z3_smt_assertion TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS invariants (
  id TEXT PRIMARY KEY,
  problem_id TEXT,
  paradox_id TEXT,
  statement TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS proof_bundles (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  claim TEXT NOT NULL,
  claim_hash TEXT NOT NULL,
  implementation_hash TEXT,
  environment_hash TEXT,
  dependency_hash TEXT,
  verifier_identity TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  evidence_json TEXT NOT NULL,
  formal_proofs_json TEXT NOT NULL,
  independent_oracles_json TEXT NOT NULL,
  replay_results_json TEXT NOT NULL,
  source_references_json TEXT NOT NULL,
  limitations_json TEXT NOT NULL,
  reproducibility_instructions TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS proof_evidence (
  id TEXT PRIMARY KEY,
  proof_bundle_id TEXT NOT NULL,
  evidence_type TEXT NOT NULL,
  content_json TEXT NOT NULL,
  receipt_hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY,
  proof_bundle_id TEXT,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  passed INTEGER NOT NULL,
  duration_ms REAL NOT NULL,
  receipt_hash TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  scope TEXT NOT NULL,
  environment TEXT NOT NULL,
  commit_sha TEXT,
  status TEXT NOT NULL,
  gates_passed INTEGER NOT NULL,
  gates_total INTEGER NOT NULL,
  root_hash TEXT,
  started_at BIGINT NOT NULL,
  completed_at BIGINT
);

CREATE TABLE IF NOT EXISTS solutions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  problem_id TEXT,
  paradox_id TEXT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  domain TEXT NOT NULL,
  implementation_source TEXT NOT NULL,
  implementation_hash TEXT NOT NULL,
  verification_status TEXT NOT NULL,
  proof_bundle_id TEXT,
  performance_boost_percent REAL NOT NULL,
  reversibility_guaranteed INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  solution_id TEXT NOT NULL,
  proof_bundle_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cost_basis_cents INTEGER NOT NULL,
  verification_complexity_factor REAL NOT NULL,
  risk_class TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  sla_tier TEXT,
  published INTEGER NOT NULL,
  verification_status TEXT NOT NULL,
  publication_blocked_reason TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  offer_id TEXT NOT NULL,
  solution_id TEXT NOT NULL,
  proof_bundle_id TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  payment_id TEXT,
  deployment_id TEXT,
  created_at BIGINT NOT NULL,
  updated_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id TEXT,
  provider TEXT NOT NULL,
  provider_environment TEXT NOT NULL,
  provider_order_id TEXT,
  provider_capture_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL,
  status TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  receipt_hash TEXT,
  raw_response_json TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS deployments (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id TEXT,
  solution_id TEXT,
  environment TEXT NOT NULL,
  status TEXT NOT NULL,
  implementation_hash TEXT,
  deployed_at BIGINT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS checkpoints (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  checkpoint_id TEXT NOT NULL,
  target_mutation TEXT NOT NULL,
  classification TEXT NOT NULL,
  snapshot_state_json TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS rollback_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  checkpoint_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL,
  restored_hash TEXT,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS telemetry (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  node_id TEXT,
  metric TEXT NOT NULL,
  value REAL NOT NULL,
  unit TEXT,
  recorded_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  index_num INTEGER NOT NULL,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  payload_hash TEXT NOT NULL,
  previous_hash TEXT NOT NULL,
  record_hash TEXT NOT NULL UNIQUE,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS chain_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  audit_record_id TEXT NOT NULL,
  chain_height INTEGER NOT NULL,
  merkle_root TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS licenses (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  solution_id TEXT NOT NULL,
  order_id TEXT,
  license_key_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  issued_at BIGINT NOT NULL,
  expires_at BIGINT
);

CREATE TABLE IF NOT EXISTS adapter_status (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  adapter_name TEXT NOT NULL,
  provider TEXT NOT NULL,
  environment TEXT NOT NULL,
  status TEXT NOT NULL,
  last_error TEXT,
  checked_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS node_registry (
  id TEXT PRIMARY KEY,
  node_code TEXT NOT NULL UNIQUE,
  node_name TEXT NOT NULL,
  subsystem TEXT NOT NULL,
  status TEXT NOT NULL,
  capabilities_json TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

CREATE TABLE IF NOT EXISTS execution_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  run_type TEXT NOT NULL,
  target_id TEXT,
  status TEXT NOT NULL,
  input_hash TEXT,
  output_hash TEXT,
  evidence_hash TEXT,
  started_at BIGINT NOT NULL,
  completed_at BIGINT
);

CREATE TABLE IF NOT EXISTS failures (
  id TEXT PRIMARY KEY,
  tenant_id TEXT,
  execution_run_id TEXT,
  failure_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  quarantined INTEGER NOT NULL,
  resolved_at BIGINT,
  created_at BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS paradoxes_domain_idx ON paradoxes (domain);
CREATE INDEX IF NOT EXISTS offers_published_idx ON offers (published, verification_status);
CREATE INDEX IF NOT EXISTS node_registry_subsystem_idx ON node_registry (subsystem);
CREATE INDEX IF NOT EXISTS adapter_status_provider_idx ON adapter_status (provider);
