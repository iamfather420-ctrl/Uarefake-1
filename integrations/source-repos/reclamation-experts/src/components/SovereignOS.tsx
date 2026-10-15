import { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, Cpu, Activity, Radio, Power, EyeOff, 
  Database, Code, Zap, Key, Save, Trash2, Eye, ShieldCheck,
  Terminal, Server, Globe, HardDrive, RefreshCcw, Wifi, AlertTriangle,
  Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { VaultService } from '../services/VaultService';
import { motion, AnimatePresence } from 'motion/react';

export function SovereignOS() {
  const [geminiKey, setGeminiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isKeySaved, setIsKeySaved] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [validators, setValidators] = useState<any>({});
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = VaultService.getSecret('gemini_api_key');
    if (saved) {
      setGeminiKey(saved);
      setIsKeySaved(true);
    }

    const fetchSystemData = async () => {
      try {
        const [logsRes, valRes] = await Promise.all([
          fetch('/api/system-logs', { headers: { 'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || '' } }),
          fetch('/api/validators', { headers: { 'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || '' } })
        ]);
        if (logsRes.ok) setLogs(await logsRes.json());
        if (valRes.ok) setValidators(await valRes.json());
      } catch (e) {
        console.error('Failed to sync system data:', e);
      } finally {
        setIsLoadingLogs(false);
      }
    };

    fetchSystemData();
    const interval = setInterval(fetchSystemData, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = 0;
    }
  }, [logs]);

  const saveKey = () => {
    VaultService.storeSecret('gemini_api_key', geminiKey);
    setIsKeySaved(true);
    window.location.reload(); 
  };

  const purgeKey = () => {
    VaultService.removeSecret('gemini_api_key');
    setGeminiKey('');
    setIsKeySaved(false);
    window.location.reload();
  };

  const [killSwitchEngaged, setKillSwitchEngaged] = useState(false);
  const [isSweeping, setIsSweeping] = useState(false);
  const [isReclaimingRent, setIsReclaimingRent] = useState(false);
  const [threatEvents, setThreatEvents] = useState([
    { id: 1, type: 'CRITICAL', msg: 'IMSI Catcher detected on Band 4', time: 'Just now' },
    { id: 2, type: 'WARN', msg: 'Unexpected Baseband query blocked', time: '2m ago' },
    { id: 3, type: 'INFO', msg: 'Agate Handshake Protocol synced', time: '15m ago' },
  ]);

  const toggleKillSwitch = () => {
    setKillSwitchEngaged(prev => !prev);
    if (!killSwitchEngaged) {
      setThreatEvents(prev => [
        { id: Date.now(), type: 'CRITICAL', msg: 'RADIO SILENCE ENGAGED. RIL PURGED.', time: 'Just now' },
        ...prev
      ]);
    }
  };

  const triggerSweep = async () => {
    if (isSweeping) return;
    setIsSweeping(true);
    try {
      const res = await fetch('/api/system/trigger-sweep', { 
        method: 'POST',
        headers: { 'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || '' } 
      });
      if (res.ok) {
        // Logs will update via polling
      }
    } catch (e) {
      console.error('Sweep trigger failed:', e);
    } finally {
      setTimeout(() => setIsSweeping(false), 2000);
    }
  };

  const triggerRentReclaim = async () => {
    if (isReclaimingRent) return;
    setIsReclaimingRent(true);
    try {
      const res = await fetch('/api/system/trigger-rent-reclaim', { 
        method: 'POST',
        headers: { 'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || '' } 
      });
      if (res.ok) {
        // Logs will update via polling
      }
    } catch (e) {
      console.error('Rent reclaim trigger failed:', e);
    } finally {
      setTimeout(() => setIsReclaimingRent(false), 2000);
    }
  };

  return (
    <div className="space-y-6 md:space-y-[30px] p-4 md:p-[30px] max-w-7xl mx-auto h-[calc(100vh-60px)] overflow-y-auto no-scrollbar">
      {/* Header with System Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-red-500/20 pb-[20px]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-md border border-red-500/20 relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/5 animate-pulse" />
            <ShieldAlert className="w-6 h-6 text-red-500 relative z-10" />
          </div>
          <div>
            <h2 className="text-xl md:text-[22px] font-bold tracking-[0.2em] text-red-500 uppercase glow-text-red">
              Sovereign Shell v4.0
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                KERNEL: ENFORCING
              </span>
              <span className="text-red-500/30 text-[10px]">|</span>
              <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                <Wifi className="w-3 h-3" />
                NETSEC: MASKED
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={toggleKillSwitch}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded uppercase font-bold text-[10px] tracking-widest transition-all w-full md:w-auto justify-center",
              killSwitchEngaged 
                ? "bg-red-600 outline-none text-white shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-pulse" 
                : "bg-red-500/10 text-red-500 border border-red-500/50 hover:bg-red-500/20"
            )}
          >
            <Power className="w-4 h-4" />
            {killSwitchEngaged ? 'Radio Silence Active' : 'Kill Switch (RIL Reset)'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: Metrics & Network */}
        <div className="lg:col-span-1 space-y-6">
           {/* System Resources */}
           <div className="border border-white/5 bg-black/40 rounded-md p-4 backdrop-blur-md">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <Server className="w-4 h-4" /> System Resources
            </h3>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">CRYO_CACHE</span>
                  <span className="text-primary tracking-tighter">84.2%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[84%] shadow-[0_0_10px_#39FF14]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">HPU_LOAD</span>
                  <span className="text-red-500 tracking-tighter">12.1%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 w-[12%] shadow-[0_0_10px_#ef4444]" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-muted-foreground">PH_UP_LINK</span>
                  <span className="text-blue-500 tracking-tighter">ACTIVE</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-full animate-[pulse_2s_infinite]" />
                </div>
              </div>
            </div>
          </div>

          {/* Network Defensive Perimeter */}
          <div className="border border-orange-500/20 bg-orange-500/5 rounded-md p-4">
            <h3 className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
              <Radio className="w-4 h-4" /> Net Perimeter
            </h3>
            <div className="space-y-3 font-mono text-[10px]">
              {Object.entries(validators).map(([name, val]: [string, any]) => (
                <div key={name} className="flex flex-col gap-1 border-b border-orange-500/10 pb-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{name}</span>
                    <span className={cn("px-1.5 py-0.5 rounded-[2px]", 
                      val.status === 'online' ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                    )}>{val.status.toUpperCase()}</span>
                  </div>
                  <span className="text-orange-500/60 text-[9px] uppercase tracking-tighter">{val.portal}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-1">
                <span className="text-muted-foreground">LATENCY_CORE</span>
                <span className="text-orange-400 tracking-tighter">14ms</span>
              </div>
            </div>
          </div>

          <div className="border border-purple-500/20 bg-purple-500/5 rounded-md p-4">
            <h3 className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
              <Activity className="w-4 h-4" /> Activity Density
            </h3>
            <div className="h-[100px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[
                  { v: 10 }, { v: 25 }, { v: 15 }, { v: 35 }, { v: 20 }, { v: 45 }, { v: 30 }
                ]}>
                  <Area type="monotone" dataKey="v" stroke="#a855f7" fill="#a855f7" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Center Column: System Shell & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Terminal Shell */}
          <div className="border border-primary/20 bg-black/60 rounded-md overflow-hidden flex flex-col h-[500px] shadow-[0_0_30px_rgba(57,255,20,0.05)] border-t-primary/40">
            <div className="bg-primary/5 border-b border-primary/20 p-3 flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase font-mono">
                  Anonymous Identity & Financial_SYSLOG_DAEMON::PRIMARY
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCcw className={cn("w-3 h-3 text-primary/40", !isLoadingLogs && "animate-spin-slow")} />
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>
            </div>
            
            <div 
              ref={terminalRef}
              className="flex-1 overflow-y-auto p-4 space-y-2 font-mono text-[11px] no-scrollbar selection:bg-primary selection:text-black"
            >
              <AnimatePresence initial={false}>
                {logs.length === 0 && !isLoadingLogs && (
                  <div className="text-muted-foreground/30 text-center mt-10 italic">
                    Waiting for hive metabolic signals...
                  </div>
                )}
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      "flex gap-3 leading-relaxed",
                      log.type === 'error' ? "text-red-400" :
                      log.type === 'success' ? "text-primary" :
                      log.type === 'warning' ? "text-yellow-400" : "text-muted-foreground/80"
                    )}
                  >
                    <span className="opacity-30 shrink-0 select-none">[{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                    <span className="opacity-50 shrink-0 select-none tracking-tighter">|</span>
                    <span className="break-all">{log.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="bg-black/80 border-t border-primary/10 p-2 px-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-[9px] font-mono text-primary/40">
                <span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> SWAP: 0.1%</span>
                <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> UPTIME: 99.9%</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={triggerRentReclaim}
                  disabled={isReclaimingRent}
                  className="text-[9px] font-mono text-primary/40 hover:text-primary transition-colors flex items-center gap-1 uppercase disabled:opacity-30"
                >
                  {isReclaimingRent ? <Loader2 className="w-2 h-2 animate-spin" /> : <Droplet className="w-2 h-2" />}
                  Rent Reclaim
                </button>
                <button 
                  onClick={triggerSweep}
                  disabled={isSweeping}
                  className="text-[9px] font-mono text-primary/40 hover:text-primary transition-colors flex items-center gap-1 uppercase disabled:opacity-30"
                >
                  {isSweeping ? <Loader2 className="w-2 h-2 animate-spin" /> : <Zap className="w-2 h-2" />}
                  Hive Sweep
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Hardware Auditor Section */}
             <div className="border border-yellow-500/20 bg-yellow-500/5 rounded-md p-4">
              <h3 className="text-[10px] font-bold text-yellow-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
                <Cpu className="w-4 h-4" /> Hardware Auditor
              </h3>
              <div className="space-y-2">
                 <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-yellow-500/10">
                    <span className="text-[10px] text-muted-foreground font-mono">Secure Element</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                 </div>
                 <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-yellow-500/10">
                    <span className="text-[10px] text-muted-foreground font-mono">Entropy Pool</span>
                    <span className="text-[10px] text-yellow-400 font-mono">LOCKED</span>
                 </div>
                 <div className="flex items-center justify-between bg-black/40 p-2 rounded border border-yellow-500/10">
                    <span className="text-[10px] text-muted-foreground font-mono">TPM Integrity</span>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                 </div>
              </div>
            </div>

            {/* AI Vault Section */}
            <div className="border border-primary/20 bg-primary/5 rounded-md p-4 backdrop-blur-sm">
              <h3 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
                <Key className="w-4 h-4" /> Secure API Vault
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="relative">
                    <input 
                      type={showKey ? "text" : "password"}
                      value={geminiKey}
                      onChange={(e) => setGeminiKey(e.target.value)}
                      className="w-full bg-black/60 border border-primary/20 rounded px-3 py-2 text-xs font-mono text-primary focus:border-primary outline-none pr-10 hover:border-primary/40 transition-colors"
                      placeholder="GEMINI_API_KEY"
                    />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-2 top-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={saveKey}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary/10 border border-primary/30 text-primary py-2 rounded text-[10px] font-bold uppercase hover:bg-primary/20 active:scale-95 transition-all font-mono tracking-widest"
                  >
                    <Save className="w-3 h-3" />
                    Commit
                  </button>
                  {isKeySaved && (
                    <button 
                      onClick={purgeKey}
                      className="flex items-center justify-center px-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded hover:bg-red-500/20 transition-all active:scale-95"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Threat Feed & Identity */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-red-500/20 bg-red-500/5 rounded-md p-4 h-[400px] flex flex-col">
            <h3 className="text-[10px] font-bold text-red-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
              <AlertTriangle className="w-4 h-4" /> Threat Feed
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 no-scrollbar">
              {threatEvents.map(event => (
                <div key={event.id} className="p-3 border border-red-500/10 bg-black/40 rounded-sm relative overflow-hidden group">
                  <div className={cn("absolute left-0 top-0 bottom-0 w-0.5", 
                    event.type === 'CRITICAL' ? "bg-red-500 animate-pulse" : "bg-orange-500"
                  )} />
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn("text-[8px] font-bold tracking-widest px-1.5 py-0.5 rounded-[2px]", 
                      event.type === 'CRITICAL' ? "bg-red-500/20 text-red-500" : "bg-orange-500/20 text-orange-500"
                    )}>{event.type}</span>
                    <span className="text-[8px] text-muted-foreground font-mono">{event.time}</span>
                  </div>
                  <div className="text-[10px] font-mono text-red-100/90 leading-relaxed italic">
                    {event.msg}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border border-cyan-500/20 bg-cyan-500/5 rounded-md p-4 backdrop-blur-md">
            <h3 className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2 font-mono">
              <Globe className="w-4 h-4" /> Node Identity
            </h3>
            <div className="space-y-4 font-mono">
              <div className="p-2 border border-cyan-500/10 rounded bg-black/40">
                <span className="text-cyan-400 block mb-1 text-[9px] uppercase tracking-wider font-bold">Registration ID</span>
                <span className="text-muted-foreground text-[9px] break-all tracking-tight opacity-80">
                  {localStorage.getItem('warhive_reg_id') || 'INITIALIZING...'}
                </span>
              </div>
              <div className="p-2 border border-cyan-500/10 rounded bg-black/40">
                <span className="text-cyan-400 block mb-1 text-[9px] uppercase tracking-wider font-bold">Geo-Fencing Status</span>
                <span className="text-emerald-500 text-[9px] flex items-center gap-1 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  MASKED (ZKP_VOID)
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

const CheckCircle2 = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
);

const Droplet = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>
);
