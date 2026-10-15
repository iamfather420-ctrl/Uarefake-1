import { useState } from 'react';
import { Terminal, Droplet, ArrowRight, Activity, Loader2, Link } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function SolanaRentReclamation() {
  const [address, setAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isReclaiming, setIsReclaiming] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [reclaimSignature, setReclaimSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reclaimedAccount, setReclaimedAccount] = useState<string | null>(null);

  const handleScan = async () => {
    setIsScanning(true);
    setError(null);
    setScanResult(null);
    setReclaimSignature(null);

    try {
      const res = await fetch(`/api/solana/rent-scan${address ? `?address=${address}` : ''}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Scan failed');
      
      setScanResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReclaim = async (accountToClose: string) => {
    setIsReclaiming(true);
    setError(null);
    setReclaimedAccount(accountToClose);
    
    try {
      const res = await fetch('/api/solana/rent-reclaim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountToClose, destinationAddress: address })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reclaim failed');

      setReclaimSignature(data.signature);
      // Remove from list after success
      if (scanResult) {
        setScanResult((prev: any) => ({
          ...prev,
          accounts: prev.accounts.filter((a: any) => a.pubkey !== accountToClose),
          totalOrphaned: prev.totalOrphaned - 1,
          potentialReclaimSol: prev.potentialReclaimSol - 0.00203928
        }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsReclaiming(false);
      setReclaimedAccount(null);
    }
  };

  return (
    <div className="bg-card border border-border p-6 rounded relative group overflow-hidden mt-6">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
        <Droplet className="w-24 h-24 text-primary" />
      </div>
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-primary/10 rounded-md border border-primary/20">
          <Droplet className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-sans font-black text-sm tracking-[2px] uppercase text-primary">Solana Rent Reclamation</h3>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Extract SOL from 0-balance token accounts</p>
        </div>
      </div>

      <div className="space-y-4 relative z-10">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Target Wallet Address (or leave empty for Treasury)"
            className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs font-mono focus:border-primary focus:outline-none placeholder:text-muted-foreground/50 transition-colors duration-300"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <button 
            onClick={handleScan}
            disabled={isScanning}
            className="bg-primary text-primary-foreground px-4 py-2 rounded text-[10px] font-black tracking-[1px] uppercase hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Terminal className="w-3 h-3" />}
            {isScanning ? 'Scanning...' : 'Scan Accounts'}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-xs font-mono">
            [ERROR] {error}
          </div>
        )}

        {reclaimSignature && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <div>
                <div className="text-emerald-500 text-xs font-bold font-mono">RENT RECLAIMED</div>
                <div className="text-emerald-500/70 text-[10px] font-mono">
                  Tx: {reclaimSignature.substring(0, 16)}...
                </div>
              </div>
            </div>
            <a 
              href={`https://solscan.io/tx/${reclaimSignature}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold rounded flex items-center gap-1 hover:bg-emerald-500/30 transition-colors"
            >
              Verify <Link className="w-3 h-3" />
            </a>
          </div>
        )}

        <AnimatePresence>
          {scanResult && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-secondary/20 border border-border p-3 rounded">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Orphaned Accounts</span>
                  <span className="text-lg font-mono text-primary font-bold">{scanResult.totalOrphaned}</span>
                </div>
                <div className="bg-secondary/20 border border-border p-3 rounded">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-1">Potential SOL</span>
                  <span className="text-lg font-mono text-amber-500 font-bold">{scanResult.potentialReclaimSol.toFixed(4)} SOL</span>
                </div>
              </div>

              {scanResult.accounts.length > 0 ? (
                <div className="space-y-2 mt-4 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {scanResult.accounts.map((acc: any) => (
                    <div key={acc.pubkey} className="flex items-center justify-between p-2 bg-background border border-border rounded text-xs font-mono group">
                      <div>
                        <div className="text-muted-foreground">Account: <span className="text-primary">{acc.pubkey.substring(0, 8)}...</span></div>
                        <div className="text-[9px] text-muted-foreground/60 mt-0.5">Mint: {acc.mint.substring(0, 8)}...</div>
                      </div>
                      <button
                        onClick={() => handleReclaim(acc.pubkey)}
                        disabled={isReclaiming}
                        className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 rounded flex items-center gap-1 disabled:opacity-50"
                      >
                        {isReclaiming && reclaimedAccount === acc.pubkey ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>Reclaim 0.002 SOL <ArrowRight className="w-3 h-3" /></>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 border border-dashed border-border/50 text-muted-foreground text-xs font-mono">
                  NO ORPHANED ACCOUNTS FOUND
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
