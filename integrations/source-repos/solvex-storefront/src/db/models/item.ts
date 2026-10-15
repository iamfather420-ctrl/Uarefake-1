// src/db/models/item.ts
// Marketplace Item & Turnkey Solution Model

export interface ItemModel {
  id: string;
  lotNumber: number;
  title: string;
  category: string;
  price: number; // Stored and formatted as NUMERIC(10,2)
  currency: 'USD' | 'ETH' | 'USDC';
  shortDesc: string;
  fullDesc: string;
  repo: string;
  stars: number;
  deliveryType: 'INSTANT_DOWNLOAD' | 'ESCROW_DISPATCH' | 'JIT_CONTAINER' | 'API_ACCESS';
  tags: string[];
  techStack: string[];
  features: string[];
  specifications: Record<string, string>;
  isHot?: boolean;
  status: 'ACTIVE' | 'UNLOCKED' | 'PENDING';
}

export const ItemTableSchema = `
CREATE TABLE IF NOT EXISTS marketplace_items (
  id VARCHAR(64) PRIMARY KEY,
  lot_number INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  short_desc TEXT NOT NULL,
  full_desc TEXT,
  repo_url VARCHAR(255),
  delivery_type VARCHAR(64) NOT NULL DEFAULT 'INSTANT_DOWNLOAD',
  tags TEXT[],
  tech_stack TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
`;
