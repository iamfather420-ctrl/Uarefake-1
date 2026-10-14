-- Durable, tenant-scoped JIT fulfillment lifecycle. Payment confirmation is deliberately separate.
create table if not exists entitlements (
  id text primary key,
  user_id text not null,
  order_id text not null,
  sku text not null,
  status text not null check (status in ('ACTIVE','REVOKED','EXPIRED')),
  provider_payment_id text,
  evidence_hash text not null,
  created_at bigint not null,
  updated_at bigint not null,
  unique (order_id, sku)
);
create unique index if not exists entitlements_payment_unique
  on entitlements (provider_payment_id) where provider_payment_id is not null;
create index if not exists entitlements_user_status_idx
  on entitlements (user_id, status, created_at);

create table if not exists fulfillment_jobs (
  id text primary key,
  entitlement_id text not null references entitlements(id),
  user_id text not null,
  sku text not null,
  status text not null check (status in ('WAITING_AUTH','READY_TO_BUILD','BUILDING','VERIFIED','DISTRIBUTED','FAILED','REVOKED')),
  authorization_id text,
  artifact_sha256 text,
  artifact_uri text,
  failure_code text,
  created_at bigint not null,
  updated_at bigint not null
);
create index if not exists fulfillment_jobs_user_idx
  on fulfillment_jobs (user_id, created_at);
create index if not exists fulfillment_jobs_entitlement_idx
  on fulfillment_jobs (entitlement_id, created_at);

create table if not exists fulfillment_authorizations (
  id text primary key,
  job_id text not null references fulfillment_jobs(id),
  authorized_by text not null,
  scope text not null,
  expires_at bigint not null,
  revoked_at bigint,
  created_at bigint not null
);
create index if not exists fulfillment_authorizations_job_idx
  on fulfillment_authorizations (job_id, expires_at);
