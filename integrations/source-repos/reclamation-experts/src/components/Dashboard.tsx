import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Target, ShieldCheck, AlertTriangle, Zap, Fuel, Activity, Terminal, CheckCircle2, History, Loader2, Globe, Radar, Crosshair } from 'lucide-react';
import { View } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [statsData, setStatsData] = useState<any>(null);
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [isAutomating, setIsAutomating] = useState(false);

  useEffect(() => {
    const fetchStats = () => {
      const handleJsonResponse = async (res: Response) => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('[Anonymous Identity & Financial_DASHBOARD] System stabilizing (Non-JSON received).');
          return null;
        }
        if (!res.ok) {
           const err = await res.json().catch(() => ({}));
           throw new Error(err.message || `API Error (${res.status})`);
        }
        return res.json();
      };

      fetch('/api/stats')
        .then(handleJsonResponse)
        .then(data => data && setStatsData(data))
        .catch(err => {
          if (err.message.includes('API Error')) {
            console.error('[Anonymous Identity & Financial] Stats Sync Conflict:', err);
          }
        });
    };

    const fetchValidators = () => {
      const handleJsonResponse = async (res: Response) => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return null;
        if (!res.ok) return null;
        return res.json();
      };

      fetch('/api/validators')
        .then(handleJsonResponse)
        .then(data => data && setValidatorData(data))
        .catch(err => console.debug('Validator fetch skipped during stabilizing.'));
    };

    const fetchRecentLeads = () => {
      const handleJsonResponse = async (res: Response) => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) return null;
        if (!res.ok) return null;
        return res.json();
      };

      fetch('/api/leads')
        .then(handleJsonResponse)
        .then(data => data && setRecentLeads(data.slice(0, 5)))
        .catch(err => console.debug('Leads fetch skipped during stabilizing.'));
    };

    fetchStats();
    fetchValidators();
    fetchRecentLeads();

    const handleProtocolUpdate = () => {
      fetchStats();
      fetchValidators();
      fetchRecentLeads();
    };

    window.addEventListener('protocol-update', handleProtocolUpdate);

    const interval = setInterval(() => {
      fetchStats();
      fetchValidators();
      fetchRecentLeads();
    }, 10000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('protocol-update', handleProtocolUpdate);
    };
  }, []);

  const [validatorData, setValidatorData] = useState<any>(null);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSystemLogs = () => {
      fetch('/api/system-logs')
        .then(res => res.json())
        .then(data => setSystemLogs(data))
        .catch(() => {});
    };

    fetchSystemLogs();
    const interval = setInterval(fetchSystemLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [systemLogs]);

  const stats = [
    { label: 'Active Connections', value: statsData?.gasPrice !== undefined ? `${statsData.gasPrice} GWEI` : '...', icon: Target, color: 'text-primary' },
    { label: 'Available Funds', value: statsData?.available !== undefined ? `${statsData.available.toLocaleString()}` : '$0.00', icon: ShieldCheck, color: 'text-primary font-bold' },
    { label: 'Total Earnings', value: statsData?.totalEarned !== undefined ? `${statsData.totalEarned.toLocaleString()}` : '$0.00', icon: Fuel, color: 'text-primary font-bold' },
    { label: 'Live Treasury', value: statsData?.physicalSol !== undefined ? `${Number(statsData.physicalSol).toFixed(4)} SOL` : '0 SOL', icon: Zap, color: 'text-primary' },
  ];

  return (
    <div className="space-y-4 md:space-y-[32px] animate-in fade-in duration-1000">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[24px]">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={`stat-card-${stat.label}-${idx}`} 
              className="bg-card border border-primary/20 rounded-lg p-4 md:p-[24px] flex flex-col gap-3 hover:border-primary/50 transition-all duration-300 bg-hive-lattice relative group overflow-hidden shadow-[0_0_20px_rgba(57,255,20,0.02)]"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] uppercase text-muted-foreground tracking-[2px] font-black">{stat.label}</span>
                <Icon className={`w-4 h-4 ${stat.color} group-hover:scale-110 transition-transform`} />
              </div>
              <span className="font-mono text-xl md:text-[28px] text-amber-metallic tracking-tighter glow-text relative z-10">{stat.value}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sector Sweep Visualization */}
        <div className="lg:col-span-1 border border-primary/20 bg-black/40 rounded-lg p-6 relative overflow-hidden h-[400px] flex flex-col justify-center items-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.05)_0%,transparent_70%)]" />
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 border border-primary/20 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="w-48 h-48 border border-primary/10 rounded-full absolute" />
              <div className="w-32 h-32 border border-primary/5 rounded-full absolute" />
            </div>
            
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute w-64 h-64 border-t-2 border-primary/40 rounded-full"
            />
            
            <div className="relative z-10 flex flex-col items-center">
              <Radar className="w-12 h-12 text-primary animate-pulse mb-4" />
              <h3 className="text-[10px] uppercase tracking-[0.5em] font-black text-primary/60">Global Scanner</h3>
              <p className="text-[20px] font-mono text-primary font-black mt-1">ACTIVE</p>
            </div>

            {/* Random "pings" */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0], 
                  scale: [0, 1.2, 1],
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200
                }}
                transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                className="absolute w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_10px_#39FF14]"
              />
            ))}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] font-mono text-primary/40 uppercase tracking-tighter">
            <span>Lat: 34.0522° N</span>
            <span>Lon: 118.2437° W</span>
            <span>Alt: 1042m</span>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card border-2 border-primary/20 rounded-lg p-6 bg-hive-lattice relative overflow-hidden flex flex-col justify-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full border border-primary/20 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                <Crosshair className="w-8 h-8 text-primary animate-pulse" />
              </div>
              <div>
                <h2 className="font-sans text-2xl font-black tracking-[4px] uppercase text-3d-gold">AUTONOMOUS UBI PROTOCOL</h2>
                <p className="text-[10px] text-muted-foreground uppercase tracking-[0.3em] font-bold">Protocol v4.2 // Automated Digital Generation</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
            {[
              { step: '01', title: 'SCAN', desc: 'Scan for Value', icon: Zap, status: (statsData?.totalLeads || 0) > 0 ? 'READY' : 'SENSING' },
              { step: '02', title: 'VERIFY', desc: 'Check Source Data', icon: Target, status: (statsData?.totalLeads || 0) > 0 ? 'ACTIVE' : 'IDLE' },
              { step: '03', title: 'STAGE', desc: 'Secure Asset Transit', icon: ShieldCheck, status: (statsData?.pendingLeads || 0) > 0 ? 'AWAITING' : 'IDLE' },
              { step: '04', title: 'DELIVER', desc: 'Send to Wallet', icon: ArrowUpRight, status: (statsData?.pendingLeads || 0) > 0 ? 'READY' : 'IDLE' },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={`protocol-step-${item.step}-${idx}`} className={`relative p-4 border rounded-lg bg-black/20 backdrop-blur-sm transition-all duration-500 hover:scale-[1.05] ${item.status === 'READY' || item.status === 'ACTIVE' ? 'border-primary shadow-[0_0_25px_rgba(57,255,20,0.15)] bg-primary/5' : 'border-border'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[40px] font-black text-primary/10 absolute -top-3 -right-1 leading-none">{item.step}</span>
                    <div className={`p-2 rounded-lg ${item.status === 'SENSING' || item.status === 'ACTIVE' ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(57,255,20,0.3)]' : 'bg-secondary text-muted-foreground'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h4 className="font-sans font-black text-[12px] tracking-widest mb-1 text-primary uppercase">{item.title}</h4>
                  <p className="text-[9px] text-muted-foreground leading-tight uppercase font-bold opacity-60">{item.desc}</p>
                </div>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center">
            <button 
              disabled={isAutomating}
              onClick={async () => {
                setIsAutomating(true);
                try {
                  const res = await fetch('/api/automation/step-one', { method: 'POST' });
                  if (res.ok) window.dispatchEvent(new CustomEvent('protocol-update'));
                } catch (e) {
                } finally {
                  setTimeout(() => setIsAutomating(false), 2000);
                }
              }}
              className={cn(
                "w-full flex items-center justify-center gap-3 px-8 py-4 rounded-lg uppercase font-black text-[13px] tracking-[5px] transition-all group overflow-hidden relative shadow-[0_0_30px_rgba(57,255,20,0.1)]",
                isAutomating 
                  ? "bg-primary/20 border border-primary text-primary cursor-wait" 
                  : "bg-primary text-black hover:opacity-90 hover:scale-[1.01]"
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_2s_infinite]" />
              {isAutomating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isAutomating ? 'SCANNING SYSTEM...' : 'ENGAGE AUTO-SCANNER'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded p-6 shadow-sm overflow-hidden relative bg-hive-lattice">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <ShieldCheck className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <div>
              <h3 className="font-sans font-bold text-sm tracking-widest uppercase">System Connectivity</h3>
              <p className="text-[11px] text-muted-foreground mt-1 uppercase">Operating node maintaining real-time global connection.</p>
            </div>
          </div>
          <div className="flex items-center gap-8 pr-4">
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Sovereign Heritage</span>
              <span className="font-mono text-[11px] text-primary font-black uppercase">Established Christmas 2025</span>
            </div>
            <div className="flex flex-col items-end text-right">
              <span className="text-[10px] uppercase text-muted-foreground font-black tracking-widest">Persistence Metric</span>
              <span className="font-mono text-[11px] text-primary font-black uppercase">20H/DAY Exhaustion Protocol</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 md:gap-[24px]">
        <div className="space-y-4 md:space-y-[24px]">
          <div className="bg-card border border-border rounded p-4 md:p-[24px] flex flex-col bg-hive-lattice relative">
            <div className="flex justify-between items-center mb-[20px] relative z-10">
              <h3 className="font-sans text-[18px] font-bold tracking-[2px] uppercase flex items-center gap-2 text-amber-metallic">
                <Terminal className="w-4 h-4 text-primary" />
                Live System Activity
              </h3>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                 <span className="text-[9px] uppercase font-mono text-muted-foreground font-bold italic">Auto Generator Running</span>
              </div>
            </div>
            
            <div 
              ref={logContainerRef}
              className="bg-[#000000] border border-border rounded p-4 h-[280px] overflow-y-auto font-mono text-[11px] space-y-2.5 shadow-inner relative z-10"
            >
              <AnimatePresence mode="popLayout">
                {systemLogs.length > 0 ? systemLogs.map((log: any, idx: number) => (
                  <motion.div 
                    key={`system-log-${log.id}-${idx}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 leading-relaxed"
                  >
                    <span className="text-muted-foreground/30 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={cn(
                      "flex-1 uppercase font-bold",
                      log.type === 'success' ? "text-primary" : 
                      log.type === 'warning' ? "text-amber-500" : 
                      log.type === 'error' ? "text-destructive" : "text-foreground/80"
                    )}>
                      {log.msg.replace('Leads', 'Funds').replace('Lead', 'Target').replace('Pollen', 'Value')}
                    </span>
                  </motion.div>
                )) : (
                  <div className="text-muted-foreground italic text-center py-20 opacity-30">
                    <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                    Scanning For Opportunities...
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="bg-card border border-border rounded p-4 md:p-[24px] flex flex-col bg-hive-lattice">
            <div className="flex justify-between items-center mb-[20px]">
              <h3 className="font-sans text-[18px] font-bold tracking-[2px] uppercase text-amber-metallic">Recent Earnings</h3>
            </div>
            <div className="space-y-3">
              {recentLeads.length > 0 ? recentLeads.map((lead: any, idx: number) => (
                <div key={`recent-lead-${lead.id}-${idx}`} className="flex items-center justify-between p-3 bg-background/50 backdrop-blur-sm border border-border rounded hover:border-primary transition-all cursor-pointer group" onClick={() => onNavigate('tracker')}>
                  <div className="flex flex-col">
                    <span className="font-bold text-[13px] text-primary transition-all group-hover:glow-text uppercase tracking-tight">{lead.target}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-[1px]">{lead.violation_type}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`text-[10px] font-black uppercase ${lead.status === 'paid' || lead.status === 'settled' ? 'text-primary' : 'text-foreground'}`}>
                      {lead.status === 'paid' || lead.status === 'settled' ? 'DELIVERED' : lead.status}
                    </span>
                    <span className="text-[12px] font-mono font-black text-amber-metallic tracking-tighter">${(lead.payout_amount ?? 0).toLocaleString()} USD</span>
                  </div>
                </div>
              )) : (
                <div className="text-center text-muted-foreground py-8 text-[13px] uppercase tracking-widest opacity-30">
                  No recent earnings. Start scan.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded p-4 md:p-[24px] flex flex-col bg-hive-lattice">
          <div className="flex justify-between items-center mb-[20px]">
            <h3 className="font-sans text-[18px] font-bold tracking-[2px] uppercase text-amber-metallic">System Nodes</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-[10px] text-primary uppercase tracking-[1px] font-bold">Online Nodes</span>
            </div>
          </div>
          <div className="space-y-3">
            {validatorData ? Object.entries(validatorData).map(([vName, data]: [string, any], idx) => (
              <div key={`validator-${vName}-${idx}`} className="flex items-center justify-between p-3 bg-background/50 backdrop-blur-sm border border-border rounded hover:border-primary/30 transition-all">
                <div className="flex flex-col">
                  <span className="font-bold text-[13px] text-foreground/80 uppercase">{vName} Portal</span>
                  <span className="text-[10px] text-muted-foreground truncate max-w-[150px] font-mono">{data.portal}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[10px] font-black uppercase ${data.status === 'online' ? 'text-primary' : data.status === 'restricted' ? 'text-amber-500' : 'text-destructive'}`}>
                    {data.status}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-mono">{data.latency || 'N/A'}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-4 text-muted-foreground text-[12px] uppercase tracking-widest opacity-30">Scanning flowers...</div>
            )}
          </div>
          <div className="mt-auto pt-4">
            <div className="text-[10px] text-muted-foreground uppercase tracking-[1px] mb-2 font-black">Quick Action</div>
            <div className="grid grid-cols-1 gap-[12px]">
              <button 
                onClick={() => onNavigate('scanner')}
                className="bg-background/50 backdrop-blur-sm border border-primary/20 p-[16px] text-left relative hover:border-primary transition-all group overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="text-[10px] uppercase text-muted-foreground mb-[4px] font-bold tracking-tighter relative z-10">Manual UBI Request</div>
                <div className="font-sans text-[16px] font-black tracking-[2px] uppercase mb-[12px] group-hover:text-primary group-hover:glow-text transition-all relative z-10">Run Global Scan</div>
                <div className="absolute right-[16px] bottom-[16px] border border-primary text-primary px-[12px] py-[6px] text-[10px] uppercase font-black tracking-widest group-hover:bg-primary group-hover:text-background transition-all relative z-10">
                  START
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
