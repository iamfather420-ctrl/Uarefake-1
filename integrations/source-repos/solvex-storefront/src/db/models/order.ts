// src/db/models/order.ts
// Neon Order Model & Relational Schema Mapping

export interface OrderModel {
  id: string;
  userId: string;
  lotId: string;
  itemTitle: string;
  amount: number; // NUMERIC(10,2)
  currency: string;
  paymentGateway: 'PAYPAL' | 'ESCROW' | 'DIRECT';
  gatewayOrderId?: string;
  gatewayCaptureId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  createdAt: string;
  updatedAt: string;
}

export const OrderTableSchema = `
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lot_id VARCHAR(128) NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payment_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  gateway_capture_id VARCHAR(255) UNIQUE NOT NULL,
  raw_payload JSONB NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
