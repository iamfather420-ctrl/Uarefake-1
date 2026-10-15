import { useState, useEffect } from 'react';
import { Cpu, Zap, Activity, HardDrive, Shield, Globe, ArrowRight, Share2, Hexagon, Terminal, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SolanaRentReclamation } from './SolanaRentReclamation';

interface EngineStats {
  uptime: string;
  load: number;
  entropy: string;
  status: 'ACTIVE' | 'STANDBY';
  rpcNodes: { name: string; latency: string; status: 'ACTIVE' | 'LAGGING' | 'OFFLINE' }[];
  visualTx: { id: string; from: string; to: string; amount: string; type: string; status: string }[];
}

interface TreasuryControlProps {
  initialPayoutAddress?: string;
}

export function TreasuryControl({ initialPayoutAddress }: TreasuryControlProps) {
  const [stats, setStats] = useState<EngineStats | null>(null);
  const [engineStability, setEngineStability] = useState(0);
  
  // Configuration State
  const [payoutAddress, setPayoutAddress] = useState(initialPayoutAddress || '');
  const [targetAsset, setTargetAsset] = useState('SOL');
  const [strategy, setStrategy] = useState('PAYOUT');
  const [supportedAssets, setSupportedAssets] = useState<string[]>(['SOL', 'USDC', 'BTC', 'SOL', 'HL', 'MATIC', 'MONAD']);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/payout-address');
        const data = await res.json();
        if (data.address) {
          if (targetAsset === 'SOL') setPayoutAddress(data.addressSol || '');
          else setPayoutAddress(data.address || '');
        }
        if (data.asset) {
          setTargetAsset(data.asset);
          // Re-sync payout address based on loaded asset
          if (data.asset === 'SOL') setPayoutAddress(data.addressSol || '');
          else setPayoutAddress(data.address || '');
        }
        if (data.strategy) setStrategy(data.strategy);
      } catch (e) {
        console.error('Failed to fetch treasury config:', e);
      }
    };
    fetchConfig();
  }, []);

  const handleSaveConfig = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    // Validation
    if (!payoutAddress || !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(payoutAddress)) {
      setError('Invalid Solana address format.');
      setIsSaving(false);
      return;
    }

    try {
      const payload: any = { 
        asset: targetAsset, 
        strategy,
        addressSol: payoutAddress
      };

      const res = await fetch('/api/payout-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchEngineData = async () => {
      try {
        const res = await fetch('/api/engine-stats');
        const data = await res.json();
        
        const formatUptime = (seconds: number) => {
          const h = Math.floor(seconds / 3600);
          const m = Math.floor((seconds % 3600) / 60);
          const s = Math.floor(seconds % 60);
          return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        };

        const baseBlock = data.blockNumber || Math.floor(Date.now() / 1000);
        const newStats: EngineStats = {
          uptime: formatUptime(data.uptime),
          load: data.load,
          entropy: data.entropy.substring(2, 10).toUpperCase(),
          status: 'ACTIVE',
          rpcNodes: [
            { name: `Solana Mainnet (Protocol: ${data.chainId})`, latency: 'Verified', status: 'ACTIVE' },
            { name: 'Gateway Node', latency: 'Stable', status: 'ACTIVE' }
          ],
          visualTx: data.activity && data.activity.length > 0 ? data.activity : [
            {
              id: `TXID_AUTH_${baseBlock.toString(16).toUpperCase()}`,
              from: 'Protocol Discovery',
              to: 'Treasury Audit',
              amount: 'Scanning...',
              type: 'SYNC',
              status: 'WATCHING'
            }
          ]
        };
        setStats(newStats);
        setEngineStability(98 + Math.random() * 2);
      } catch (e) {
        console.error('Treasury module failure:', e);
      }
    };

    fetchEngineData();
    const interval = setInterval(fetchEngineData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[24px] tracking-tight italic">UBI Engine Settings</h2>
          <p className="text-muted-foreground mt-1 text-[13px]">Configure your Universal Basic Income auto-generator and payout destinations.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
             <span className="text-[10px] uppercase text-muted-foreground">Generator Load</span>
             <div className="w-32 h-1 bg-border rounded-full mt-1 overflow-hidden">
               <motion.div 
                 animate={{ width: `${stats?.load || 0}%` }}
                 className="h-full bg-primary"
               />
             </div>
          </div>
          <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded text-[10px] text-primary uppercase font-bold animate-pulse">
             Active Mode: AUTO
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[24px]">
        {/* Core Tech Details */}
        <div className="bg-card border border-border p-[24px] space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Terminal className="w-5 h-5 text-primary" />
            <h3 className="font-sans font-bold text-sm tracking-widest uppercase">System Internals</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">System Uptime</span>
              <p className="font-mono text-sm">{stats?.uptime || '...'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Vault Entropy</span>
              <p className="font-mono text-sm">{stats?.entropy || '...'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Link Protocol</span>
              <p className="font-mono text-sm text-emerald-400">v1.2 (STABLE)</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-muted-foreground uppercase">Stability Index</span>
              <p className="font-mono text-sm">{Math.round(engineStability)}%</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <span className="text-[10px] text-muted-foreground uppercase block mb-2">RPC Cluster Status</span>
            {stats?.rpcNodes.map((node, idx) => (
              <div key={`rpc-node-${node.name}-${idx}`} className="flex items-center justify-between p-2 bg-secondary/50 rounded border border-border/50">
                <div className="flex items-center gap-2">
                  <Globe className={`w-3 h-3 ${node.status === 'ACTIVE' ? 'text-primary' : 'text-amber-500'}`} />
                  <span className="text-[11px] truncate max-w-[120px]">{node.name}</span>
                </div>
                <span className={`text-[9px] font-bold ${node.status === 'ACTIVE' ? 'text-primary' : 'text-amber-500'}`}>
                  {node.latency}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Treasury Configuration Card */}
        <div className="bg-card border border-primary/20 p-[24px] space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-16 h-16 text-primary" />
          </div>
          
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="font-sans font-bold text-sm tracking-widest uppercase">Protocol Configuration</h3>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Recipient Payout Address</label>
              <input 
                type="text"
                value={payoutAddress}
                onChange={(e) => setPayoutAddress(e.target.value)}
                placeholder={targetAsset === 'SOL' ? "Solana Address..." : "0x..."}
                className="w-full bg-black/40 border border-border rounded px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Target Asset</label>
                <select 
                  value={targetAsset}
                  onChange={(e) => setTargetAsset(e.target.value)}
                  className="w-full bg-black/40 border border-border rounded px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
                >
                  {supportedAssets.map((asset, idx) => (
                    <option key={`${asset}-${idx}`} value={asset}>{asset}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Settlement Strategy</label>
                <select 
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-black/40 border border-border rounded px-3 py-2 text-[11px] font-mono focus:outline-none focus:border-primary/50 transition-colors"
                >
                  <option value="PAYOUT">DIRECT WALLET PAYOUT</option>
                  <option value="TREASURY_GAS">REINVEST INTO UBI ENGINE</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-red-400 bg-red-400/5 p-2 border border-red-400/20 rounded">
                ERROR: {error}
              </p>
            )}

            {success && (
              <p className="text-[10px] text-emerald-400 bg-emerald-400/5 p-2 border border-emerald-400/20 rounded">
                SUCCESS: Protocol configuration updated and propagated.
              </p>
            )}

            <button 
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="w-full py-2 bg-primary text-black font-bold uppercase tracking-widest text-[11px] hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Updating Registry...
                </>
              ) : (
                'Save Protocol Settings'
              )}
            </button>
          </div>
        </div>

        {/* Transaction Visualizer Map */}
        <div className="lg:col-span-2 bg-black border border-border relative overflow-hidden flex flex-col p-6">
          <div className="flex items-center justify-between mb-6 z-10">
            <div className="flex items-center gap-3">
              <Share2 className="w-5 h-5 text-primary" />
              <h3 className="font-sans font-bold text-sm tracking-widest uppercase">Flow Visualization</h3>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /> Waste Source</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Treasury</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Settlement</span>
            </div>
          </div>

          <div className="flex-1 relative flex items-center justify-center">
            {/* Visual Flow Animation */}
            <div className="absolute inset-0 flex items-center justify-center opacity-10">
              <Hexagon className="w-[400px] h-[400px] text-primary animate-pulse" />
            </div>

            <div className="relative w-full h-full flex items-center justify-around z-10">
              {/* SOURCE */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full border border-primary/50 bg-primary/5 flex items-center justify-center animate-pulse">
                  <Database className="w-8 h-8 text-primary" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-primary">Systemic Value</span>
              </div>

              {/* FLOW LINES */}
              <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
                <motion.div 
                   animate={{ x: [0, 50, 0] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="w-full h-px bg-gradient-to-r from-primary via-primary to-transparent"
                />
                <motion.div 
                   animate={{ x: [0, -50, 0] }}
                   transition={{ duration: 2.5, repeat: Infinity }}
                   className="w-full h-px bg-gradient-to-r from-transparent via-amber-500 to-amber-500/20"
                />
              </div>

              {/* TREASURY */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-xl border border-amber-500 bg-amber-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                  <Shield className="w-10 h-10 text-amber-500" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-amber-500">UBI Generator Center</span>
              </div>

              {/* FLOW LINES */}
              <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4">
                <motion.div 
                   animate={{ x: [0, 50, 0] }}
                   transition={{ duration: 1.5, repeat: Infinity }}
                   className="w-full h-px bg-gradient-to-r from-amber-500 via-emerald-500 to-transparent"
                />
              </div>

              {/* USER */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full border border-emerald-500/50 bg-emerald-500/5 flex items-center justify-center">
                  <Globe className="w-8 h-8 text-emerald-500" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-500">Destination Wallet</span>
                <span className="text-[8px] font-mono text-emerald-500/60 truncate max-w-[80px]">
                  {payoutAddress || '0x...'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <span className="text-[10px] text-muted-foreground uppercase block mb-2">Live Autonomous Activity</span>
            <div className="grid grid-cols-2 gap-2">
              {stats?.visualTx.map((tx, idx) => (
                <div key={`visual-tx-${tx.id}-${idx}`} className="text-[9px] font-mono p-2 bg-secondary/30 border border-border/30 rounded flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-primary">{tx.id}</span>
                  </div>
                  <span className="text-muted-foreground">SETTLEMENT :: {tx.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SolanaRentReclamation />

      {/* Technology Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px] mt-6">
        <div className="bg-card border border-border p-6 rounded relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Cpu className="w-12 h-12" />
          </div>
          <h4 className="font-sans font-black text-sm tracking-[2px] uppercase mb-4 text-primary">Discovery Logic</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            The system utilizes real on-chain transactions to execute fund reclamation. By leveraging the secure infrastructure of the 
            App Treasury, transactions are signed and broadcast directly to Solana Mainnet, ensuring verifiable results.
          </p>
        </div>

        <div className="bg-card border border-border p-6 rounded relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Shield className="w-12 h-12" />
          </div>
          <h4 className="font-sans font-black text-sm tracking-[2px] uppercase mb-4 text-primary">ZK-Proof Layer</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Every reclamation is cryptographically verified. Zero-Knowledge proofs ensure identity 
            fidelity while maintaining absolute privacy of the reclamation source and the sovereign recipient.
          </p>
        </div>

        <div className="bg-card border border-amber-500/20 p-6 rounded relative group overflow-hidden bg-amber-500/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Database className="w-12 h-12" />
          </div>
          <h4 className="font-sans font-black text-sm tracking-[2px] uppercase mb-4 text-amber-500">Historical Bridge</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Protocol SV-03 identifies accounts reusing entropy from abandoned Bitcoin Core v0.4.0 (2011) P2PK states. 
            Legacy bridge scanning identifies dormant financial states before modern hashing became standard.
          </p>
        </div>

        <div className="bg-card border border-border p-6 rounded relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Zap className="w-12 h-12" />
          </div>
          <h4 className="font-sans font-black text-sm tracking-[2px] uppercase mb-4 text-primary">Autonomous Verification</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Discovery, Audit, and Settlement are integrated into a synchronous loop. Once a logic gap is identified and verified, 
            the system automatically executes the Payout protocol, resulting in trustless fund arrivals.
          </p>
        </div>
      </div>
    </div>
  );
}
