-- Production recovery evidence. Drill records are synthetic, append-only, and reversible.
create table if not exists checkpoints (
  id text primary key,
  target_id text not null,
  state_json text not null,
  state_hash text not null,
  created_at bigint not null
);

-- Upgrade databases where checkpoints predates this migration. CREATE TABLE IF
-- NOT EXISTS does not add columns to an existing table, which caused deploys to
-- fail when the following index referenced target_id. This is additive and safe
-- for existing rows; new recovery-drill rows always supply target_id explicitly.
alter table checkpoints
  add column if not exists target_id text;

create table if not exists failures (
  id text primary key,
  checkpoint_id text not null,
  target_id text not null,
  failure_code text not null,
  failure_json text not null,
  created_at bigint not null
);

create table if not exists rollback_records (
  id text primary key,
  checkpoint_id text not null,
  failure_id text not null,
  target_id text not null,
  status text not null,
  restored_hash text not null,
  evidence_hash text not null,
  created_at bigint not null
);

create index if not exists checkpoints_target_idx on checkpoints (target_id, created_at);
create index if not exists failures_target_idx on failures (target_id, created_at);
create index if not exists rollbacks_target_idx on rollback_records (target_id, created_at);
