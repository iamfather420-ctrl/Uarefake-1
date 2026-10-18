-- PayPal payment ledger (disabled-by-default foundation).
-- No policy is intentionally created yet: with RLS enabled, payment rows remain
-- inaccessible until tenant/user transaction context and policies are reviewed.
-- This migration does not enable Live payments or grant fulfillment.
CREATE TABLE IF NOT EXISTS payment_orders (
  id text PRIMARY KEY,
  tenant_id text NOT NULL,
  user_id text NOT NULL,
  idempotency_key text NOT NULL,
  cart_snapshot jsonb NOT NULL,
  catalog_hash text NOT NULL,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  paypal_order_id text UNIQUE,
  paypal_capture_id text UNIQUE,
  invoice_id text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('CREATING','APPROVAL_PENDING','APPROVED','CAPTURE_REQUESTED','CAPTURE_PENDING','CAPTURED','CAPTURE_FAILED','REFUND_PENDING','REFUNDED','REVERSED','DISPUTED','REVIEW_REQUIRED','CANCELLED')),
  provider_status text,
  provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  captured_at timestamptz,
  reconciled_at timestamptz,
  UNIQUE (tenant_id, user_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS payment_orders_tenant_user_idx ON payment_orders (tenant_id, user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_orders_status_updated_idx ON payment_orders (status, updated_at);
CREATE INDEX IF NOT EXISTS payment_orders_paypal_order_idx ON payment_orders (paypal_order_id) WHERE paypal_order_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS payment_events (
  id text PRIMARY KEY,
  provider_event_id text NOT NULL UNIQUE,
  event_type text NOT NULL,
  resource_id text,
  environment text NOT NULL CHECK (environment IN ('sandbox', 'live')),
  transmission_id text NOT NULL,
  signature_verified boolean NOT NULL DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_status text NOT NULL DEFAULT 'RECEIVED' CHECK (processing_status IN ('RECEIVED','PROCESSING','PROCESSED','RETRY','REJECTED','REVIEW_REQUIRED')),
  attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  last_error_code text,
  sanitized_payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS payment_events_processing_idx ON payment_events (processing_status, received_at);

CREATE TABLE IF NOT EXISTS payment_refunds (
  id text PRIMARY KEY,
  payment_order_id text NOT NULL REFERENCES payment_orders(id),
  tenant_id text NOT NULL,
  user_id text NOT NULL,
  provider_refund_id text UNIQUE,
  idempotency_key text NOT NULL,
  amount_minor bigint NOT NULL CHECK (amount_minor > 0),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  status text NOT NULL CHECK (status IN ('REQUESTED','PENDING','COMPLETED','FAILED','REVIEW_REQUIRED')),
  reason_code text,
  provider_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, user_id, idempotency_key)
);
CREATE INDEX IF NOT EXISTS payment_refunds_order_idx ON payment_refunds (payment_order_id, created_at);

CREATE TABLE IF NOT EXISTS payment_fulfillments (
  id text PRIMARY KEY,
  payment_order_id text NOT NULL UNIQUE REFERENCES payment_orders(id),
  tenant_id text NOT NULL,
  user_id text NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING_APPROVAL','AUTHORIZED','SUSPENDED','REVOKED','FAILED')),
  approval_actor text,
  approval_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS payment_fulfillments_tenant_user_idx ON payment_fulfillments (tenant_id, user_id, status);

-- Deny-by-default until reviewed policies and per-transaction tenant context ship.
ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_fulfillments ENABLE ROW LEVEL SECURITY;
COMMENT ON TABLE payment_orders IS 'Durable PayPal ledger. RLS intentionally has no permissive policy; payment processing stays blocked pending tenant-context implementation.';
COMMENT ON TABLE payment_events IS 'Webhook event deduplication ledger. Only verified provider events may be processed.';
COMMENT ON TABLE payment_fulfillments IS 'Human authorization is separate from payment capture; no browser redirect can authorize fulfillment.';
