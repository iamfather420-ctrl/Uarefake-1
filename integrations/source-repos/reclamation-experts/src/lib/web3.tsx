import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { SolanaAdapter } from '@reown/appkit-adapter-solana';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { base, solana } from '@reown/appkit/networks';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// 1. Get projectId from environment or localStorage override
const getProjectId = () => {
  if (typeof window !== 'undefined') {
    const override = localStorage.getItem('warhive_manual_project_id');
    if (override && override.length > 5) return override.replace(/-/g, '').trim();
  }
  
  const envKeys = [
    (import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID,
    (import.meta as any).env.vite_wallet_connect,
    (import.meta as any).env.VITE_WALLET_CONNECT
  ];

  for (const raw of envKeys) {
    if (raw && raw.length > 10 && !raw.includes('VITE_') && !raw.includes('YOUR_')) {
      return raw.replace(/-/g, '').trim();
    }
  }
  
  return '';
};

const projectId = getProjectId();

// Diagnostic logging for debugging (safe version)
if (typeof window !== 'undefined') {
  console.log('[Anonymous Identity & Financial_WEB3] Initialization Context:', {
    origin: window.location.origin,
    id_detected: !!projectId,
    id_preview: projectId ? `${projectId.substring(0, 4)}...${projectId.substring(28)}` : 'MISSING',
    id_valid_format: /^[0-9a-fA-F]{32}$/.test(projectId || ''),
    env_keys_present: {
      VITE: !!(import.meta as any).env.VITE_WALLETCONNECT_PROJECT_ID,
      VITE_LEGACY: !!(import.meta as any).env.VITE_WALLET_CONNECT
    }
  });
}

// KILL SWITCH: Allow user to totally disable Web3 if the key is causing crashes
const isWeb3Disabled = typeof window !== 'undefined' && localStorage.getItem('warhive_disable_web3') === 'true';

// VALIDATION: Strict check. Reown Project IDs must be 32-char hex.
const isValidId = !isWeb3Disabled && projectId && /^[0-9a-fA-F]{32}$/.test(projectId);

// Global Error Suppressor
if (typeof window !== 'undefined') {
  const handleWCCrash = (msg: string) => {
    if (msg.includes('code: 3000') || msg.includes('Unauthorized') || msg.includes('Project not found') || msg.includes('invalid key')) {
      console.warn('[Anonymous Identity & Financial_GUARD] Suppressed Reown WebSocket Error (check your Project ID):', msg);
      return true;
    }
    return false;
  };

  window.addEventListener('error', (e) => { if (handleWCCrash(e.message)) e.stopImmediatePropagation(); }, true);
  window.addEventListener('unhandledrejection', (e) => { if (handleWCCrash(e.reason?.message || '')) e.stopImmediatePropagation(); }, true);

  const originalError = window.onerror;
  window.onerror = function(msg, url, line, col, error) {
    if (handleWCCrash(String(msg || error || ''))) return true;
    return originalError ? originalError.apply(this, arguments as any) : false;
  };
}

// 2. Create query client
const queryClient = new QueryClient();

// 3. Set up metadata
const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://war-hive.io';
const metadata = {
  name: 'Anonymous Identity & Financial',
  description: 'Decentralized Asset Reclamation Experts',
  url: currentOrigin, 
  icons: ['https://avatars.githubusercontent.com/u/37784886']
};

// 4. Create Web3 Configuration
const solanaNetwork = solana;
const evmNetworks = [base] as const;
const allNetworks = [solanaNetwork, ...evmNetworks];

// Wagmi Config
const wagmiConfig = isValidId 
  ? new WagmiAdapter({ networks: evmNetworks as any, projectId, ssr: true }).wagmiConfig 
  : createConfig({
      chains: [base],
      transports: { [base.id]: http() }
    });

// 5. Always initialize AppKit to prevent hook crashes. Use proxy ID if missing.
const proxyId = '1234567890abcdef1234567890abcdef';
const activeProjectId = isValidId ? projectId : proxyId;

if (typeof window !== 'undefined') {
  try {
    const wagmiAdapter = new WagmiAdapter({ networks: evmNetworks as any, projectId: activeProjectId, ssr: true });
    const solanaAdapter = new SolanaAdapter({
      wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
    });

    createAppKit({
      adapters: [wagmiAdapter, solanaAdapter],
      networks: allNetworks as [any, ...any[]],
      projectId: activeProjectId,
      metadata,
      features: { analytics: true, email: false, socials: [] },
      featuredWalletIds: [
        'a31742a753e7495209434f964344440a', // Phantom
        'fd20dc4226334f74895c59ce360f9e08', // Coinbase Wallet
        'c56bbc0c1d141e6915f450c182d3ca2d'  // MetaMask
      ],
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#39FF14',
        '--w3m-color-mix': '#39FF14',
        '--w3m-color-mix-strength': 15
      }
    });
  } catch (err) {
    console.error('[Anonymous Identity & Financial_WEB3] Soft initialization failure:', err);
  }
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
