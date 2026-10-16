-- Recovery evidence schema compatible with both the enterprise production tables
-- and the legacy recovery tables created by earlier releases. Existing deployments
-- keep their records; all additions are nullable so no historical data is invented.
create table if not exists checkpoints (
  id text primary key,
  tenant_id text not null,
  checkpoint_id text not null,
  target_mutation text not null,
  classification text not null,
  snapshot_state_json text not null,
  created_at bigint not null,
  updated_at bigint,
  status text,
  version text,
  payload_json jsonb
);

alter table checkpoints
  add column if not exists target_id text,
  add column if not exists tenant_id text,
  add column if not exists checkpoint_id text,
  add column if not exists target_mutation text,
  add column if not exists classification text,
  add column if not exists snapshot_state_json text,
  add column if not exists updated_at bigint,
  add column if not exists status text,
  add column if not exists version text,
  add column if not exists payload_json jsonb;

create table if not exists failures (
  id text primary key,
  tenant_id text,
  execution_run_id text,
  failure_type text not null,
  severity text not null,
  message text not null,
  quarantined boolean not null default true,
  resolved_at bigint,
  created_at bigint not null,
  updated_at bigint,
  status text,
  version text,
  payload_json jsonb
);

alter table failures
  add column if not exists target_id text,
  add column if not exists tenant_id text,
  add column if not exists execution_run_id text,
  add column if not exists failure_type text,
  add column if not exists severity text,
  add column if not exists message text,
  add column if not exists quarantined boolean,
  add column if not exists resolved_at bigint,
  add column if not exists updated_at bigint,
  add column if not exists status text,
  add column if not exists version text,
  add column if not exists payload_json jsonb;

create table if not exists rollback_records (
  id text primary key,
  tenant_id text not null,
  checkpoint_id text not null,
  reason text not null,
  status text not null,
  restored_hash text,
  created_at bigint not null,
  updated_at bigint,
  version text,
  payload_json jsonb
);

alter table rollback_records
  add column if not exists target_id text,
  add column if not exists tenant_id text,
  add column if not exists reason text,
  add column if not exists updated_at bigint,
  add column if not exists version text,
  add column if not exists payload_json jsonb;

-- Preserve the legacy index names for safe upgrades; new recovery paths use the
-- enterprise fields while legacy readers can continue filtering by target_id.
create index if not exists checkpoints_target_idx on checkpoints (target_id, created_at);
create index if not exists failures_target_idx on failures (target_id, created_at);
create index if not exists rollbacks_target_idx on rollback_records (target_id, created_at);
create index if not exists checkpoints_mutation_idx on checkpoints (target_mutation, created_at);
create index if not exists failures_type_idx on failures (failure_type, created_at);
create index if not exists rollbacks_checkpoint_idx on rollback_records (checkpoint_id, created_at);
