-- Durable PayPal provider state. Money is stored in integer USD cents.
-- Live processing remains disabled unless the application release gate is satisfied.
create table if not exists payment_orders (
  id text primary key,
  tenant_id text not null,
  user_id text not null,
  idempotency_key text not null,
  cart_hash text not null,
  cart_json text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  environment text not null check (environment in ('sandbox', 'live')),
  paypal_order_id text unique,
  paypal_capture_id text unique,
  invoice_id text not null unique,
  status text not null check (status in ('CREATING','APPROVAL_PENDING','APPROVED','CAPTURE_REQUESTED','CAPTURED','CAPTURE_PENDING','CAPTURE_FAILED','REVIEW_REQUIRED','REFUND_PENDING','REFUNDED','REVERSED','DISPUTED')),
  provider_status text,
  provider_metadata text not null default '{}',
  capture_amount_cents integer,
  capture_currency text,
  created_at bigint not null,
  captured_at bigint,
  reconciled_at bigint,
  updated_at bigint not null
);
create unique index if not exists payment_orders_tenant_user_idempotency on payment_orders (tenant_id, user_id, idempotency_key);
create index if not exists payment_orders_status_updated on payment_orders (status, updated_at);
create index if not exists payment_orders_user_created on payment_orders (tenant_id, user_id, created_at desc);

create table if not exists payment_events (
  id text primary key,
  event_type text not null,
  resource_id text,
  paypal_order_id text,
  status text not null check (status in ('RECEIVED','RETRY','PROCESSED','FAILED','REVIEW_REQUIRED')),
  error text,
  transmission_id text,
  received_at bigint not null,
  processed_at bigint,
  updated_at bigint not null
);
create unique index if not exists payment_events_provider_event on payment_events (id);
create index if not exists payment_events_order on payment_events (paypal_order_id, received_at);
create index if not exists payment_events_status on payment_events (status, updated_at);

create table if not exists payment_refunds (
  id text primary key,
  payment_order_id text not null references payment_orders(id),
  tenant_id text not null,
  user_id text not null,
  provider_refund_id text unique,
  idempotency_key text not null,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'USD' check (currency = 'USD'),
  status text not null check (status in ('REQUESTED','PENDING','COMPLETED','FAILED','REVIEW_REQUIRED')),
  reason_code text,
  created_at bigint not null,
  updated_at bigint not null,
  unique (tenant_id, user_id, idempotency_key)
);
create index if not exists payment_refunds_order on payment_refunds (payment_order_id, created_at);

create table if not exists payment_fulfillments (
  id text primary key,
  payment_order_id text not null unique references payment_orders(id),
  tenant_id text not null,
  user_id text not null,
  status text not null check (status in ('PENDING_APPROVAL','AUTHORIZED','SUSPENDED','REVOKED','FAILED')),
  approval_actor text,
  approval_reason text,
  created_at bigint not null,
  updated_at bigint not null
);
create index if not exists payment_fulfillments_tenant_user on payment_fulfillments (tenant_id, user_id, status);
