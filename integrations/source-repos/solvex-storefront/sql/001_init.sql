-- sql/001_init.sql
-- Neon PostgreSQL Migration: Core E-Commerce, Users, Purchases, Ledger, and Unlocked Lots

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Purchases
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paypal_order_id TEXT NOT NULL,
  lot_ids TEXT NOT NULL, -- comma-separated IDs, matches your current usage
  total_amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL, -- e.g. 'CREATED', 'CAPTURED', 'REFUNDED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payment ledger
CREATE TABLE IF NOT EXISTS payment_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  paypal_order_id TEXT NOT NULL,
  paypal_capture_id TEXT,
  event_type TEXT NOT NULL, -- e.g. 'ORDER_CREATED', 'ORDER_CAPTURED', 'WEBHOOK'
  amount NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  raw_payload JSONB, -- webhook / API payload snapshot
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unlocked lots / items
CREATE TABLE IF NOT EXISTS unlocked_lots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lot_id TEXT NOT NULL, -- matches SolutionItem.id
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, lot_id)
);
