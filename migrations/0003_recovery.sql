-- Production recovery evidence. Drill records are synthetic, append-only, and reversible.
create table if not exists checkpoints (
  id text primary key,
  target_id text not null,
  state_json text not null,
  state_hash text not null,
  created_at bigint not null
);

-- CREATE TABLE IF NOT EXISTS does not upgrade an existing table.
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

-- Upgrade pre-existing tables before indexes reference their newer columns.
alter table failures
  add column if not exists target_id text;

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

alter table rollback_records
  add column if not exists target_id text;

create index if not exists checkpoints_target_idx on checkpoints (target_id, created_at);
create index if not exists failures_target_idx on failures (target_id, created_at);
create index if not exists rollbacks_target_idx on rollback_records (target_id, created_at);
