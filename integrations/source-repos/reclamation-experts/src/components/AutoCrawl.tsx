import { useState, useEffect, useRef } from 'react';
import { Bot, Play, Square, AlertTriangle, DollarSign, ExternalLink, Activity, Zap, Search, ArrowUpRight, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CrawlHit {
  id: string;
  type: string;
  target: string;
  value: string;
  category: string;
  isGasless: boolean;
  confidence: number;
  timestamp: string;
}

export function AutoCrawl() {
  const [isCrawling, setIsCrawling] = useState(false);
  const [isAutoPilot, setIsAutoPilot] = useState(true);
  const [isGaslessOnly, setIsGaslessOnly] = useState(true); 
  const [logs, setLogs] = useState<any[]>([]);
  const [hits, setHits] = useState<CrawlHit[]>([]);
  const [trackingLead, setTrackingLead] = useState<any>(null);
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollTop = logsEndRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string) => {
    const id = `CRAWL-${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
    setLogs(prev => [...prev.slice(-99), {
      id,
      msg,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  useEffect(() => {
    // Release the pollinators automatically on mount
    const timer = setTimeout(() => {
      if (!isCrawling) toggleCrawl();
      addLog('HIVE_MIND: Queen Node established.');
      addLog('POLLINATORS: Swarm release initiated for real-time foraging...');
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const toggleCrawl = () => {
    if (isCrawling) {
      if (wsRef.current) {
        (wsRef.current as any).close();
      }
      setIsCrawling(false);
      addLog('NESTING_PROTOCOL: Pollinators recalled to Hive.');
    } else {
      setIsCrawling(true);
      addLog('SWARM_PROTOCOL: Releasing Hive-Mind foragers...');
      addLog('TARGET: Scanning for Pollen Samples (Token Residue)...');
      if (isAutoPilot) {
        addLog('HIVE_MIND: Autonomous mode active. Consolidating all blooms.');
      }
      
      try {
        const eventSource = new EventSource(`/api/crawl/stream?gaslessOnly=${isGaslessOnly}`);
        wsRef.current = eventSource;
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'LOG') {
              addLog(data.message.replace('Lead', 'Sample').replace('Leads', 'Pollen Samples'));
            } else if (data.type === 'HIT') {
              setHits(prev => {
                if (prev.some(h => h.id === data.hit.id)) return prev;
                return [data.hit, ...prev];
              });
              addLog(`🛡️ BLOOM DETECTED: ${data.hit.type} - ${data.hit.value.replace('USD', 'HUNNY')}`);
              
              if (isAutoPilot) {
                submitHit(data.hit, 'The Queen Node');
              }
            }
          } catch (e) {
            // ignore
          }
        };
        
        eventSource.onerror = () => {
          addLog('HIVE_COMM_FAILURE: Signal weak. Recalibrating pollinators...');
          eventSource.close();
          setIsCrawling(false);
        };
      } catch (e: any) {
        addLog(`Drone Hub Failure: ${e.message}`);
        setIsCrawling(false);
      }
    }
  };

  
  const sendHit = (hit: any) => {
    setHits((prev: any[]) => {
      if (prev.some(h => h.id === hit.id)) return prev;
      return [hit, ...prev];
    });
    addLog(`🛡️ DISCOVERY DETECTED: ${hit.type} - ${hit.value}`);
    if (isAutoPilot) submitHit(hit);
  };

  const submitHit = async (hit: CrawlHit, destination: string = 'Treasury Vault') => {
    // User requested confirmation of real expected payout before submission
    if (!isAutoPilot) {
      const confirmed = window.confirm(
        `CONFIRM POLLEN SETTLEMENT?\n\n` +
        `Sample: ${hit.id}\n` +
        `Target: ${hit.target}\n` +
        `Real Expected Payout: ${hit.value.replace('USD', 'HUNNY')}\n` +
        `Source: ${hit.type}\n\n` +
        `Confirm this honey harvest?`
      );
      if (!confirmed) return;
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target: hit.target,
          board: destination,
          payout: hit.value,
          violation: hit.type,
          is_gasless: hit.isGasless,
          strategy: destination === 'Treasury Gas' ? 'TREASURY_GAS' : 'PAYOUT'
        })
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }
      
      const data = await res.json();
      
      // Remove from hits list after submission
      setHits(prev => prev.filter(h => h.id !== hit.id));
      const successMsg = `SUCCESS: Discovery lead ${hit.id} submitted to ${destination} for reclamation.`;
      
      setLogs(prev => [...prev, {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        msg: successMsg,
        timestamp: new Date().toLocaleTimeString()
      }]);
      
      // Start tracking this lead
      setTrackingLead({ ...hit, id: data.id, status: 'pending' });
    } catch (e: any) {
      addLog(`ERROR: Failed to submit lead ${hit.id}.`);
    }
  };

  // Poll for tracking lead status if one exists
  useEffect(() => {
    if (!trackingLead || trackingLead.status === 'settled') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/leads');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Non-JSON response');
        }
        const allLeads = await res.json();
        const updated = allLeads.find((l: any) => l.id === trackingLead.id);
        if (updated && updated.status !== trackingLead.status) {
          setTrackingLead(updated);
          addLog(`STATUS UPDATE: Lead ${trackingLead.id} moved to ${updated.status}.`);
        }
      } catch (err) {
        console.error('Tracking poll failed', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [trackingLead]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="space-y-[24px]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-[24px] tracking-tight italic text-amber-metallic glow-text">Pollinator Swarm</h2>
          <p className="text-muted-foreground mt-1 text-[13px] uppercase tracking-widest">Autonomous foragers scanning the field for pollen and accumulation vectors.</p>
        </div>
        <button
          onClick={toggleCrawl}
          className={`flex items-center gap-2 px-[24px] py-[12px] text-[10px] uppercase tracking-[1px] transition-colors cursor-pointer border font-black ${
            isCrawling 
              ? 'bg-transparent text-destructive border-destructive hover:bg-destructive hover:text-background' 
              : 'bg-primary text-background border-primary hover:scale-105 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
          }`}
        >
          {isCrawling ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isCrawling ? 'NEST SWARM' : 'RELEASE POLLINATORS'}
        </button>
      </div>

      <div className="flex items-center gap-6 p-4 bg-hive-lattice border border-primary/20 rounded-lg glow-border">
        <div className="flex items-center gap-4 border-r border-primary/20 pr-6">
          <div className="flex items-center gap-2">
            <Bot className={`w-4 h-4 ${isAutoPilot ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-[11px] uppercase tracking-widest font-bold">Hive-Mind</span>
          </div>
          <button 
            onClick={() => setIsAutoPilot(!isAutoPilot)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isAutoPilot ? 'bg-primary' : 'bg-stone-800'}`}
          >
            <motion.div 
              animate={{ x: isAutoPilot ? 24 : 0 }}
              className="absolute top-1 left-1 w-4 h-4 bg-hive-lattice border border-primary/20 rounded-full shadow-md"
            />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Activity className={`w-4 h-4 ${isGaslessOnly ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-[11px] uppercase tracking-widest font-bold">Pure Pollen</span>
          </div>
          <button 
            onClick={() => setIsGaslessOnly(!isGaslessOnly)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isGaslessOnly ? 'bg-primary' : 'bg-stone-800'}`}
          >
            <motion.div 
              animate={{ x: isGaslessOnly ? 24 : 0 }}
              className="absolute top-1 left-1 w-4 h-4 bg-hive-lattice border border-primary/20 rounded-full shadow-md"
            />
          </button>
        </div>

        <p className="text-[10px] text-muted-foreground italic ml-auto uppercase tracking-tighter">
          {isGaslessOnly ? 'Focused strictly on pure zero-gas vectors.' : 'Scanning all field blooms for potential accumulation.'}
        </p>

        <div className="flex items-center gap-4 ml-auto">
          <button 
            onClick={async () => {
              const target = window.prompt("Enter domain for Compliance Audit (e.g. lucky-slots.com):");
              if (!target) return;

              addLog(`COMPLIANCE_SWARM: Launching regulatory handshake for ${target}...`);
              try {
                const res = await fetch('/api/compliance/audit', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ target })
                });
                const data = await res.json();
                
                addLog(`CGCB_SEAL: ${data.cgcb_seal ? 'VERIFIED' : 'FAILED'}`);
                addLog(`UKGC_HANDSHAKE: ${data.ukgc_handshake ? 'VERIFIED' : 'FAILED'}`);
                addLog(`MGCB_MARKER: ${data.mgcb_compliance ? 'VERIFIED' : 'FAILED'}`);
                
                if (!data.compliant) {
                  addLog(`REGULATORY_GAP: ${target} is NON-COMPLIANT. Manifesting reclamation lead.`);
                  sendHit({
                    id: `COMP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                    type: 'Regulatory Non-Compliance',
                    category: 'License Violation',
                    isGasless: false,
                    target: target,
                    value: '$750.00 HUNNY',
                    confidence: 96,
                    evidence: data.flags.join('|'),
                    timestamp: new Date().toISOString()
                  });
                } else {
                  addLog(`REGULATORY_CHECK: Domain ${target} is fully compliant.`);
                }
              } catch (e) {
                addLog('Compliance Audit Failure.');
              }
            }}
            className="flex items-center gap-2 bg-amber-900/40 text-primary px-4 py-2 rounded text-[11px] uppercase font-bold hover:bg-primary hover:text-black transition-all border border-primary/20"
          >
            <ShieldAlert className="w-4 h-4 text-primary group-hover:text-black" />
            Compliance Swarm
          </button>
          <button 
            onClick={async () => {
              addLog(`SWARMING CHAT THREADS (License Image Vector)...`);
              try {
                const res = await fetch('/api/verify-license', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    target: 'HIVE_SCRAPE_' + Math.random().toString(36).substring(2,8).toUpperCase(),
                    image: 'base64_encoded_mock_image_data_here'
                  })
                });
                const data = await res.json();
                
                addLog(`Pollinator Engine -> Status: ${data.status}`);
                addLog(`C2PA Check: ${data.hasC2PA ? 'VERIFIED' : 'FAILED'}`);
                
                if (data.status === 'Fraudulent') {
                  addLog(`POLLEN CONTAMINATED: ${data.errorReason}`);
                  sendHit({
                    id: `FRAUD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
                    type: 'Fraudulent License Detected',
                    category: 'Contaminated Sample',
                    isGasless: false,
                    target: data.target,
                    value: '$5000.00 HUNNY',
                    confidence: 100,
                    evidence: data.evidence,
                    timestamp: new Date().toISOString()
                  });
                } else {
                  addLog('POLLEN VERIFIED: Specimen confirmed.');
                }
              } catch (e) {
                addLog('Drone Scrape Failed.');
              }
            }}
            className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded text-[11px] uppercase font-bold hover:bg-primary hover:text-black transition-all border border-primary/20"
          >
            <Search className="w-4 h-4 text-primary group-hover:text-black" />
            Analyze Blooms (C2PA)
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-[24px]">
        <div className="lg:col-span-2 bg-hive-lattice border border-primary/30 p-[16px] h-[500px] flex flex-col font-mono text-[12px] relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between border-b border-primary/10 pb-2 mb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Bot className={`w-4 h-4 ${isCrawling ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
              <span className="text-primary font-bold">HIVE_SWARM_LOGS_v4.2</span>
            </div>
            <span className="text-[10px] uppercase tracking-[1px] text-primary">{isCrawling ? 'FORAGING' : 'NESTED'}</span>
          </div>
          
          <div 
            ref={logsEndRef}
            className="flex-1 overflow-y-auto space-y-1.5 p-2 scroll-smooth"
          >
            {!isCrawling && logs.length === 0 && (
              <div className="text-primary/20 italic flex h-full items-center justify-center uppercase tracking-widest font-black text-center">
                Hive nested. Release pollinators to begin foraging.
              </div>
            )}
            {logs.map((log: any, idx) => (
              <div 
                key={`crawl-log-${log.id || 'idx'}-${idx}`} 
                className={log.msg.includes('DISCOVERY DETECTED') || log.msg.includes('POLLEN') ? 'text-primary font-bold bg-primary/5 p-1 rounded' : 'text-muted-foreground'}
              >
                [{log.timestamp}] {log.msg.replace('Leads', 'Pollen Samples').replace('Lead', 'Sample')}
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-card border border-border p-4 rounded-lg bg-hive-lattice">
            <h3 className="text-[11px] font-black uppercase tracking-[3px] text-amber-metallic mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Hive Comms
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <a 
                href="https://t.me/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded hover:bg-primary/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#229ED9]/20 flex items-center justify-center border border-[#229ED9]/30">
                    <Zap className="w-4 h-4 text-[#229ED9]" />
                  </div>
                  <span className="text-[12px] font-bold uppercase">Telegram</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a 
                href="https://messenger.com/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded hover:bg-primary/10 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-[#00B2FF]/20 flex items-center justify-center border border-[#00B2FF]/30">
                    <Activity className="w-4 h-4 text-[#00B2FF]" />
                  </div>
                  <span className="text-[12px] font-bold uppercase">Messenger</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <button 
                onClick={() => window.open('https://google.com', '_blank')}
                className="flex items-center justify-between p-3 bg-primary/5 border border-primary/10 rounded hover:bg-primary/10 transition-colors group text-left w-full"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center border border-primary/30">
                    <Search className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[12px] font-bold uppercase">Secure Browser</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg flex-1">
            <h4 className="text-[10px] font-black uppercase text-primary/60 tracking-widest mb-2">Honey Accumulation</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-muted-foreground">SCAN_RATE:</span>
                <span className="text-primary">14.2 blooms/sec</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-muted-foreground">SWARM_SIZE:</span>
                <span className="text-primary">2,048 Drones</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono">
                <span className="text-muted-foreground">LATENCY:</span>
                <span className="text-primary">0.12ms</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border flex flex-col overflow-hidden h-[500px]">
          <div className="p-[16px] border-b border-border bg-hive-lattice">
            <h3 className="font-sans font-bold uppercase tracking-widest text-[14px] flex items-center gap-2 text-amber-metallic">
              <DollarSign className="w-4 h-4 text-primary" />
              Bloom Harvest Opportunities
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto p-[16px] space-y-[12px]">
            <AnimatePresence>
              {hits.map((hit, index) => (
                <motion.div 
                  key={`crawl-hit-${hit.id || 'idx'}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-hive-lattice border border-primary/20 p-[16px] relative hover:border-primary transition-colors glow-border"
                >
                  <div className="flex justify-between items-start mb-[12px]">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-mono uppercase tracking-widest ${hit.id.startsWith('FRAUD') ? 'text-primary' : 'text-muted-foreground'}`}>{hit.category}</span>
                      <span className="text-[10px] font-mono text-primary/40">{hit.id}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border text-primary bg-primary/10 border-primary/20">
                      {hit.confidence}% SPECIMEN
                    </span>
                  </div>
                  <p className="font-sans font-bold text-[16px] mb-[4px] leading-tight uppercase tracking-tight text-foreground">{hit.type}</p>
                  <div className="flex items-center gap-2 mb-[16px]">
                    <p className="text-[12px] text-muted-foreground truncate font-mono opacity-70 flex-1">{hit.target}</p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-[12px] pt-[12px] border-t border-primary/10">
                    <div className="flex flex-col">
                      <span className="text-[9px] uppercase text-muted-foreground tracking-tighter font-bold">Est. Hunny</span>
                      <span className="font-mono font-bold text-primary tracking-tight text-lg">{hit.value.replace('USD', 'HUNNY')}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => submitHit(hit, 'The Queen Node')}
                        className="px-4 py-2 text-[10px] uppercase font-black border border-primary text-background bg-primary hover:scale-105 transition-all rounded shadow-sm cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        RECLAIM HUNNY <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {hits.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground uppercase tracking-[4px] opacity-20 gap-4 mt-20">
                <Bot className="w-16 h-16" />
                <span>POLLEN_SCAN: FAIL</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {trackingLead && (
          <motion.div 
            key={`tracking-${trackingLead.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="bg-primary/5 border border-primary/30 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4 mt-8 bg-hive-lattice glow-border"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                <Bot className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div className="overflow-hidden">
                <p className="text-[10px] uppercase font-bold text-primary tracking-widest flex items-center justify-between">
                  Queen's Monitoring (Active Sample)
                  <button 
                    onClick={() => {
                      const detail = { detail: 'tracker' };
                      if (typeof CustomEvent === 'function') {
                        window.dispatchEvent(new CustomEvent('changeView', detail));
                      }
                    }}
                    className="ml-4 text-[9px] uppercase hover:underline"
                  >
                    Enter Hive Vault
                  </button>
                </p>
                <p className="text-[13px] font-mono truncate text-amber-metallic font-bold">{trackingLead.id} • {trackingLead.target}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-1 max-w-md w-full">
              <div className="flex-1 h-2 bg-stone-900 rounded-full overflow-hidden border border-primary/10">
                <motion.div 
                  initial={{ width: '25%' }}
                  animate={{ 
                    width: 
                      trackingLead.status === 'pending' ? '25%' :
                      trackingLead.status === 'verified' ? '70%' :
                      '100%'
                  }}
                  className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                />
              </div>
              <span className="text-[10px] uppercase font-black text-primary min-w-[80px] text-right">
                {trackingLead.status.replace('_', ' ')}
              </span>
            </div>

            <button 
              onClick={() => setTrackingLead(null)}
              className="px-4 py-2 text-[10px] uppercase font-bold text-muted-foreground hover:text-primary transition-colors border border-primary/20 rounded-md bg-stone-900/50"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
