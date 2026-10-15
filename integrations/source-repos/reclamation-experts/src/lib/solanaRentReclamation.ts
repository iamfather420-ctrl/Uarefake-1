import { Connection, PublicKey, Transaction, Keypair, sendAndConfirmTransaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, createCloseAccountInstruction } from '@solana/spl-token';
import WebSocket from 'ws';

export class SolanaReclaimer {
  private connection: Connection;
  
  constructor(rpcUrl: string = 'https://api.mainnet-beta.solana.com') {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  /**
   * Scans a target wallet for SPL token accounts with exactly 0 balance.
   * On Solana, these accounts hold ~0.002039 SOL in rent that can be reclaimed.
   */
  async scanForOrphanedAccounts(walletAddress: string) {
    const owner = new PublicKey(walletAddress);
    
    // Fetch all token accounts owned by the wallet
    const response = await this.connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID
    });

    const orphanedAccounts = response.value.filter(accountInfo => {
      const parsedInfo = accountInfo.account.data.parsed.info;
      // We only want to reclaim rent from accounts that are completely empty (zero dust)
      // or we could sweep dust too, but for strict rent reclamation, 0 balance is safest
      return parsedInfo.tokenAmount.uiAmount === 0;
    });

    return orphanedAccounts.map(acc => ({
      pubkey: acc.pubkey.toBase58(),
      mint: acc.account.data.parsed.info.mint,
      rentEpoch: acc.account.rentEpoch
    }));
  }

  /**
   * Executes the CloseAccount instruction to recover the SOL rent.
   * This reclaims the SOL locked in the orphaned SPL token account back to the owner/destination.
   */
  async reclaimRent(
    ownerKeypair: Keypair,
    accountToClose: string,
    destinationAddress: string
  ): Promise<string> {
    const accountPubkey = new PublicKey(accountToClose);
    const destinationPubkey = new PublicKey(destinationAddress);

    const closeIx = createCloseAccountInstruction(
      accountPubkey,          // Token account to close
      destinationPubkey,      // Destination for the reclaimed rent SOL
      ownerKeypair.publicKey, // Owner of the token account
      []                      // multisig signers
    );

    const transaction = new Transaction().add(closeIx);
    
    // We send and confirm the transaction
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [ownerKeypair]
    );

    return signature;
  }
}

/**
 * WebSocket Monitor for Pump.fun or Raydium pairs
 * Monitors real-time contract deployments to snipe breakouts with recovered rent.
 */
export class PumpFunMonitor {
  private ws: WebSocket | null = null;
  private wsUrl: string;

  // Helius provides high-performance geyser WebSockets for Solana
  constructor(heliusWsUrl: string) {
    this.wsUrl = heliusWsUrl;
  }

  connect(onNextBreakout: (data: any) => void) {
    this.ws = new WebSocket(this.wsUrl);

    this.ws.on('open', () => {
      console.log('[PumpFunMonitor] Connected to Solana WebSocket');
      // Subscribe to program logs or specific account changes for Pump.fun
      // Pump.fun Program ID: 6EF8rrecthR5Dkzon8Nwu78hRvfCsxwM2R7XnZ23pBqC (Example)
      const subscribeMessage = JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'logsSubscribe',
        params: [
          { mentions: [ '6EF8rrecthR5Dkzon8Nwu78hRvfCsxwM2R7XnZ23pBqC' ] },
          { commitment: 'processed' }
        ]
      });
      this.ws?.send(subscribeMessage);
    });

    this.ws.on('message', (data: Buffer) => {
      const payload = JSON.parse(data.toString());
      if (payload.method === 'logsNotification') {
        // Cross-site pattern logic to identify whale buys and new token breakouts
        const logs = payload.params.result.value.logs;
        if (logs.some((log: string) => log.includes('InitializeMint') || log.includes('Buy'))) {
          onNextBreakout(payload.params.result);
        }
      }
    });

    this.ws.on('error', (error: any) => {
      console.error('[PumpFunMonitor] WebSocket Error:', error);
    });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
