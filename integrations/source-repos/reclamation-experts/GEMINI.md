# WAR-HIVE Project Instructions

## Sovereign Treasury Architecture
- The application uses an autonomous treasury on **Solana Mainnet**.
- Primary key override: **WAR_HIVE_TREASURY_PRIVATE_KEY** (or `WAR_HIVE_TREASURY_SECRET`, `WAR_HIVE_SECRET`).
- Keys are automatically generated and stored in the SQLite `system_config` table if no environment variable is provided.
- All bounty payouts are tracked in the `leads` table.
- Users must fund the **App Treasury Address** displayed in the Financials component to enable settlements.

## Real-World Settlements
- The system executes real on-chain transactions via the App Treasury.
- All settlements are verified on Solana Mainnet.
- No simulations or mock functions are used for financial processing.

## Discovery & Fuel
- Systemic waste identified by the scanner generates the fuel required for settlement protocols.
- "Lost and Found" logic drives the reclamation suite.

## Local Development
- Database: `warhive.db` (SQLite)
- Port: 3000
