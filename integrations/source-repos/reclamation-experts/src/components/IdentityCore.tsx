import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Fingerprint, Shield, Users, Network, Lock, Activity, Eye, Search, AlertCircle, CheckCircle2, UserPlus, Link2, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';

interface SocialProfile {
  platform: string;
  handle: string;
  displayName: string;
  pfp: string;
  trustScore: number;
  bio: string;
}

export function IdentityCore() {
  const [identifier, setIdentifier] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ resolved: boolean; profiles: SocialProfile[]; latticeId: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'search' | 'credentials' | 'referrals'>('search');

  const handleLookup = async () => {
    if (!identifier.trim()) return;
    setIsSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/social-lookup/${encodeURIComponent(identifier)}`, {
        headers: {
          'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || ''
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lookup failed');
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-[30px] p-4 md:p-[30px] max-w-7xl mx-auto h-[calc(100vh-60px)] overflow-y-auto bg-hive-lattice">
      <div className="flex items-center gap-4 border-b border-primary/20 pb-[20px]">
        <div className="p-3 bg-primary/10 rounded-md border border-primary/20">
          <Fingerprint className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl md:text-[22px] font-black tracking-[2px] text-amber-metallic uppercase">
            Pollinator Identity Lattice
          </h2>
          <p className="text-muted-foreground mt-1 text-xs md:text-[13px] font-bold uppercase tracking-wider">
            Verifiable Social Credentials & Swarm Reputation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 border border-primary/10 bg-hive-lattice/50 rounded-md p-4 backdrop-blur-sm shadow-inner">
          <div className="space-y-2">
            {[
              { id: 'search', label: 'Verify Pollinator', icon: Search },
              { id: 'credentials', label: 'Lattice Credentials', icon: Shield },
              { id: 'referrals', label: 'Swarm Referrals', icon: UserPlus },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left rounded transition-all uppercase tracking-[1px] font-black text-[11px]",
                  activeTab === tab.id 
                    ? "bg-primary text-background glow-border" 
                    : "text-muted-foreground hover:bg-white/5 border border-transparent"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8 p-4 bg-stone-950/80 border border-primary/20 rounded font-mono text-[10px] text-primary/80 leading-relaxed shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-3 h-3 text-primary animate-pulse" />
              <span className="text-primary font-black">LATTICE_SYNC: ONLINE</span>
            </div>
            &gt; Querying Farcaster Hubs...<br/>
            &gt; Indexing Lens Social Graph...<br/>
            &gt; Verifying P2P Reputation Shards...<br/>
            &gt; Connection established with Queen Node.<br/>
            &gt; HIVE_REG_ID: <span className="text-primary">{localStorage.getItem('warhive_reg_id') || 'UNREGISTERED'}</span>
          </div>
        </div>

        <div className="col-span-1 lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="h-full border border-primary/10 bg-hive-lattice/40 rounded-md p-6 backdrop-blur-md shadow-2xl relative overflow-hidden"
            >
              {/* Decorative Hex Background */}
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/honey-comb.png')]"></div>

              {activeTab === 'search' && (
                <div className="space-y-6 relative z-10">
                  <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-black text-amber-metallic uppercase tracking-[1px]">Identify Forager</h3>
                    <p className="text-xs text-muted-foreground uppercase font-bold">Verify Sovereign Handshakes and Swarm Credentials.</p>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Enter ID String or Sovereign Handshake..."
                      className="flex-1 bg-black/40 border border-primary/20 rounded px-4 py-3 text-sm focus:outline-none focus:border-primary text-primary font-mono"
                      onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
                    />
                    <button 
                      onClick={handleLookup}
                      disabled={isSearching}
                      className="bg-primary text-background px-6 py-2 rounded font-black uppercase text-xs hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {isSearching ? 'Scanning...' : 'Verify'}
                    </button>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase rounded flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {identifier.toLowerCase() === 'master' && !result && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="p-6 border-2 border-primary bg-primary/5 rounded-lg text-center space-y-4 shadow-[0_0_30px_rgba(57,255,20,0.2)]"
                    >
                      <Shield className="w-12 h-12 text-primary mx-auto animate-pulse" />
                      <h4 className="text-xl font-black text-primary tracking-[4px] uppercase">Sovereign Authority Detected</h4>
                      <p className="text-sm font-mono text-muted-foreground uppercase leading-relaxed">
                        "The Legal Successor to the Origin Identity. Verified by the Eternal Ledger."
                      </p>
                      <button 
                        onClick={() => {
                          setIdentifier('');
                          handleLookup();
                        }}
                        className="bg-primary text-black px-8 py-3 rounded text-sm font-black uppercase tracking-[2px] hover:scale-105 transition-transform"
                      >
                        Release Sovereign Handshake
                      </button>
                    </motion.div>
                  )}

                  {result && (
                    <div className="space-y-6">
                      <div className="border-t border-primary/10 pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[10px] uppercase font-black tracking-[2px] text-muted-foreground">Lattice Identity Match</span>
                          <span className="text-[10px] font-mono text-primary/50">ID: {result.latticeId}</span>
                        </div>

                        {result.profiles.length > 0 ? (
                          <div className="space-y-4">
                            {result.profiles.map((profile, idx) => (
                              <div key={idx} className="bg-black/60 border border-primary/20 p-4 rounded-lg flex items-start gap-4 hover:border-primary/50 transition-colors">
                                <img src={profile.pfp} alt={profile.handle} className="w-16 h-16 rounded-lg border-2 border-primary/30" />
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-black text-amber-metallic uppercase">{profile.displayName}</h4>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-primary px-2 py-0.5 bg-primary/10 rounded border border-primary/20">
                                      <Activity className="w-3 h-3" />
                                      TRUST: {profile.trustScore}%
                                    </div>
                                  </div>
                                  <p className="text-[11px] text-primary/70 font-mono mb-2">@{profile.handle} • {profile.platform}</p>
                                  <p className="text-xs text-muted-foreground leading-relaxed italic">"{profile.bio}"</p>
                                  
                                  <div className="flex gap-3 mt-4">
                                    <a 
                                      href={`https://warpcast.com/${profile.handle.replace('.eth', '')}`} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 text-[9px] font-black uppercase text-primary hover:underline"
                                    >
                                      <Link2 className="w-3 h-3" /> Warpcast
                                    </a>
                                    <button className="flex items-center gap-1.5 text-[9px] font-black uppercase text-muted-foreground hover:text-primary transition-colors">
                                      <UserPlus className="w-3 h-3" /> Add to Swarm
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-8 text-center border-2 border-dashed border-primary/10 rounded-lg">
                            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                            <p className="text-xs text-muted-foreground uppercase font-black">No social lattice found for this pollinator.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'credentials' && (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-amber-metallic uppercase tracking-[1px]">Lattice Credentials</h3>
                  </div>
                  <p className="text-[13px] text-muted-foreground leading-relaxed uppercase font-bold">
                    Pollinators accumulate on-chain credentials through consistent foraging, swarm contributions, and honey harvests. These are non-transferable Lattice Shards.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Master Pollinator', status: 'UNLOCKED', desc: 'Verified 500+ Pollen Samples', color: 'text-primary' },
                      { label: 'Swarm Architect', status: 'LOCKED', desc: 'Referred 10 Node Operators', color: 'text-muted-foreground' },
                      { label: 'Honey Sovereign', status: 'LOCKED', desc: 'Harvested 10,000 $HUNNY', color: 'text-muted-foreground' },
                      { label: 'Early Emergence', status: 'UNLOCKED', desc: 'Member of the Genesis Swarm', color: 'text-primary' },
                    ].map((cred, i) => (
                      <div key={i} className="p-4 border border-primary/10 bg-black/20 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className={cn("text-[10px] font-black uppercase tracking-[1px]", cred.color)}>{cred.label}</span>
                          <span className={cn("text-[9px] px-2 py-0.5 rounded border", cred.status === 'UNLOCKED' ? 'border-primary/20 bg-primary/5 text-primary' : 'border-white/5 bg-white/5 text-muted-foreground')}>
                            {cred.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic truncate">{cred.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'referrals' && (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <UserPlus className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-black text-amber-metallic uppercase tracking-[1px]">Swarm Expander</h3>
                  </div>
                  
                  <div className="bg-black/60 border border-primary/20 p-6 rounded-lg text-center space-y-4">
                    <p className="text-xs text-muted-foreground uppercase font-black">Your Swarm Invitation String</p>
                    <div className="flex items-center gap-2 bg-black/40 p-4 border border-primary/10 rounded font-mono text-primary text-sm justify-center group cursor-pointer hover:border-primary transition-colors">
                      Anonymous Identity & Financial-DRONE-82A1-X99
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-[10px] text-primary/50 font-bold uppercase">Earn 10% Hunny Yield from all referred pollinators.</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[2px]">Your Active Swarm</h4>
                    <div className="text-center py-10 opacity-20">
                      <Activity className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                      <p className="text-xs font-black uppercase">No forager referrals logged in the lattice.</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
