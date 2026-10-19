-- Durable provider payment state. All monetary values are integer USD cents.
create table if not exists payment_orders (
  id text primary key,
  tenant_id text not null,
  user_id text not null,
  idempotency_key text not null,
  cart_hash text not null,
  cart_json text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null check (currency = 'USD'),
  environment text not null check (environment in ('sandbox', 'live')),
  paypal_order_id text unique,
  paypal_capture_id text unique,
  invoice_id text not null unique,
  status text not null check (status in ('CREATING','APPROVAL_PENDING','APPROVED','CAPTURE_REQUESTED','CAPTURED','CAPTURE_PENDING','CAPTURE_FAILED','REVIEW_REQUIRED','REFUNDED','REVERSED')),
  capture_amount_cents integer,
  capture_currency text,
  created_at bigint not null,
  captured_at bigint,
  updated_at bigint not null
);

create unique index if not exists payment_orders_tenant_user_idempotency
  on payment_orders (tenant_id, user_id, idempotency_key);
create index if not exists payment_orders_status_updated
  on payment_orders (status, updated_at);
create index if not exists payment_orders_user_created
  on payment_orders (tenant_id, user_id, created_at desc);

create table if not exists payment_events (
  id text primary key,
  event_type text not null,
  resource_id text,
  paypal_order_id text,
  status text not null check (status in ('RECEIVED','RETRY','PROCESSED','FAILED')),
  error text,
  received_at bigint not null,
  processed_at bigint,
  updated_at bigint not null
);
create index if not exists payment_events_order on payment_events (paypal_order_id, received_at);
create index if not exists payment_events_status on payment_events (status, updated_at);

create table if not exists payment_operations (
  id text primary key,
  payment_id text not null references payment_orders(id),
  operation_type text not null check (operation_type in ('CAPTURE','REFUND','REVERSAL','DISPUTE')),
  provider_id text,
  idempotency_key text not null unique,
  amount_cents integer,
  status text not null,
  created_at bigint not null,
  updated_at bigint not null
);
create unique index if not exists payment_operations_provider on payment_operations (operation_type, provider_id) where provider_id is not null;
