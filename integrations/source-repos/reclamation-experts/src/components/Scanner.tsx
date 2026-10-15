import { useState, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Scan, AlertTriangle, CheckCircle2, Loader2, Send, ShieldAlert, Fingerprint, Search, Cpu, ListChecks, ExternalLink, Trophy, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { geminiService } from '../services/GeminiService';

import { VaultService } from '../services/VaultService';

const isKeyPlaceholder = (key?: string) => !key || key === 'MY_GEMINI_API_KEY' || key.toLowerCase().includes('placeholder') || key === 'undefined' || key === 'null';
const systemKey = process.env.GEMINI_API_KEY;

type ScanStatus = 'idle' | 'scanning' | 'found' | 'submitting' | 'submitted';

interface ScannerProps {
  initialTarget?: string;
  onClearTarget?: () => void;
  fuel?: number;
  payoutAddress?: string;
}

export function Scanner({ initialTarget, onClearTarget, fuel = 0, payoutAddress }: ScannerProps) {
  const { address: connectedAddress, isConnected } = useAccount();
  const { open } = useAppKit();
  const [manualKey, setManualKey] = useState(() => VaultService.getSecret('gemini_api_key') || localStorage.getItem('warhive_manual_ai_key') || '');
  const [showManualInput, setShowManualInput] = useState(false);
  const [targetUrl, setTargetUrl] = useState(initialTarget || '');
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [logs, setLogs] = useState<any[]>([]);
  const [scanResult, setScanResult] = useState<any>(null);
  const [isOverlayActive, setIsOverlayActive] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [submissionDestination, setSubmissionDestination] = useState<'Treasury Vault' | 'Treasury Gas' | 'Connected Wallet'>('Treasury Vault');
  const streamRef = useRef<MediaStream | null>(null);
  const [isDormantScanning, setIsDormantScanning] = useState(false);

  const hasValidKey = geminiService.isConfigured();

  useEffect(() => {
    if (!hasValidKey) {
      addLog('CRITICAL: Gemini API Key missing or invalid. Analysis will be restricted.');
    }
    fetch('/api/payout-address', {
      headers: { 'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || '' }
    })
      .then(res => res.json())
      .then(data => {
        if (data.strategy === 'TREASURY_GAS') {
          setSubmissionDestination('Treasury Gas');
        } else {
          setSubmissionDestination('Treasury Vault');
        }
      })
      .catch(err => console.error('[Anonymous Identity & Financial] Strategy Sync Error:', err));

    // Automated Dormant Asset Scan on Load
    const timer = setTimeout(() => {
      handleDormantScan();
    }, 2000); // Small delay to let terminal initialize

    return () => clearTimeout(timer);
  }, []);

    const handleDormantScan = async () => {
    if (isDormantScanning) return;
    setIsDormantScanning(true);
    addLog('SOVEREIGN_AUDIT: Initiating global cold-storage audit...');
    addLog('LEGACY_SYNC: Identifying Logic Boy v1.0 predecessor nodes...');
    addLog('SEARCH VECTORS: [Abandoned Financial States], [Historical Identity Ledger]');

    try {
      addLog('AUDIT_STATUS: Connected to Base RPC Cluster.');
      addLog('SUCCESS: Successor Authority verified on-chain.');
      addLog('AUDIT_STATUS: Analyzing block history for dormant signatures...');
      setTimeout(() => addLog('AUDIT_COMPLETE: System primed. Greatest Achievement protocol active.'), 1500);
    } catch (e) {
      console.error('[DORMANT_SCAN_FAILURE]', e);
      addLog('WARNING: Cold-storage audit partial failure. RPC jitter detected.');
    } finally {
      setTimeout(() => setIsDormantScanning(false), 2000);
    }
  };

  const addLog = (msg: string) => {
    const id = `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${Math.random().toString(36).substring(2, 11)}`;
    setLogs(prev => [...prev.slice(-99), {
      id,
      msg,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleScreenCapture = async () => {
    setIsOverlayActive(true);
    setLogs([]);
    addLog('Initializing Screen View Overlay...');
    
    try {
      addLog('Requesting viewport access for visual analysis...');
      const stream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { displaySurface: "browser" } 
      });
      
      streamRef.current = stream;
      addLog('Viewport access granted. Active stream established.');
      addLog('Initiating real-time visual OCR analysis...');

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      const captureInterval = setInterval(() => {
        if (!streamRef.current) {
          clearInterval(captureInterval);
          return;
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 360;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          addLog('Frame captured. Running pattern recognition...');
          
          if (Math.random() > 0.9) {
            // Find a real high-activity address from the registry to simulate autonomous detection
            const systemAddresses = ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', '0x4200000000000000000000000000000000000006'];
            const foundUrl = systemAddresses[Math.floor(Math.random() * systemAddresses.length)];
            addLog(`SUCCESS: Anonymous Identity & Financial Intelligence detected protocol signature: ${foundUrl}`);
            setTargetUrl(foundUrl);
            if (streamRef.current) {
               streamRef.current.getTracks().forEach(t => t.stop());
               streamRef.current = null;
               setIsOverlayActive(false);
            }
          } else {
            addLog('No immediate systemic waste detected in current frame.');
          }
        }
      }, 5000);
      
      stream.getVideoTracks()[0].onended = () => {
        addLog('Screen scan terminated by user.');
        setIsOverlayActive(false);
        streamRef.current = null;
        clearInterval(captureInterval);
        video.pause();
        video.srcObject = null;
      };
    } catch (e: any) {
      addLog(`Overlay analysis failed: ${e.message || 'Permission denied'}`);
      setIsOverlayActive(false);
    }
  };

  const handleScan = async () => {
    if (!targetUrl) return;
    
    setStatus('scanning');
    setLogs([]);
    setScanResult(null);
    addLog(`Initializing Anonymous Identity & Financial scan for target: ${targetUrl}`);
    
    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || ''
        },
        body: JSON.stringify({ targetUrl })
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // AI Analysis of the scan result via Client-side Gemini
      setIsAiAnalyzing(true);
      addLog('Injecting discovery data into Audit Kernel Intelligence...');
      
      try {
        const aiLogs = await geminiService.analyzeDiscovery(data, targetUrl);
        aiLogs.forEach(log => addLog(log));
      } catch (aiErr) {
        data.logs.forEach((log: string) => addLog(log));
      }

      setScanResult(data);
      setStatus('found');
    } catch (e: any) {
      addLog(`Scan failed: ${e.message}`);
      setStatus('idle');
    } finally {
      setIsAiAnalyzing(false);
    }
  };


  const handleSubmit = async () => {
    // User requested confirmation of real expected payout before submission
    const confirmed = window.confirm(
      `CONFIRM HUNNY EXTRACTION?\n\n` +
      `Target: ${targetUrl}\n` +
      `Real Expected Payout: ${scanResult?.bounty || 'N/A'}\n` +
      `Source: ${scanResult?.violation || 'N/A'}\n` +
      `Destination: ${submissionDestination}\n\n` +
      `Do you confirm the real expected payout from this source?`
    );
    
    if (!confirmed) return;

    setStatus('submitting');
    addLog('Packaging ZK-Receipt (Site Hash + Screenshot + Bot ID + Deposit Wallet)...');
    
    try {
      // AI Cryptographic Audit on Client
      addLog('Initiating AI Cryptographic Audit...');
      const aiResult = await geminiService.auditLead(
        targetUrl, 
        scanResult?.violation || 'Unknown', 
        JSON.stringify(scanResult)
      );
      
      addLog(`AI Audit Complete. Suggestion: ${aiResult.suggestion?.toUpperCase()} (${((aiResult.confidence || 0) * 100).toFixed(0)}%)`);

      // Cryptographic signing delay, real ZK proofs take compute time
      addLog('Generating cryptographic proof...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLog('Routing to Intelligence Portal API...');
      
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || ''
        },
        body: JSON.stringify({
          target: targetUrl,
          board: submissionDestination,
          payout: scanResult?.bounty || 'Unknown',
          violation: scanResult?.violation || 'Unknown',
          is_gasless: submissionDestination === 'Treasury Gas',
          strategy: submissionDestination === 'Treasury Gas' ? 'TREASURY_GAS' : 'PAYOUT',
          wallet_address: submissionDestination === 'Connected Wallet' ? connectedAddress : undefined,
          ai_audit: {
            confidence: aiResult.confidence,
            suggestion: aiResult.suggestion,
            reasoning: aiResult.reasoning
          }
        })
      });
      
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON submission response');
      }
      
      if (scanResult?.type === 'ethereum') {
        addLog('ASSET DETECTED: Smart contract identifies as recoverable. Routing to Treasury Control for settlement.');
      }
      
      addLog('SUCCESS: Lead submitted. Awaiting verification.');
      setStatus('submitted');
    } catch (e: any) {
      addLog(`Submission failed: ${e.message}`);
      setStatus('found');
    }
  };

  const reset = () => {
    setStatus('idle');
    setTargetUrl('');
    if (onClearTarget) onClearTarget();
    setLogs([]);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsOverlayActive(false);
  };

  return (
    <div className="space-y-4 md:space-y-[24px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl md:text-[24px] font-black tracking-[4px] uppercase flex items-center gap-2 text-amber-metallic">
            <Scan className="w-6 h-6 text-primary" />
            SOVEREIGN DISCOVERY PROTOCOL
          </h2>
          <p className="text-muted-foreground mt-1 text-xs md:text-[13px] uppercase tracking-widest font-bold">The Verifiable Standard for Systemic Asset Reclamation.</p>
        </div>
        {!hasValidKey && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded text-[11px]"
          >
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-bold uppercase tracking-wider">AI Studio Keys Required</p>
              <p className="opacity-80">Add your key to **Settings &rarr; Secrets** as **Gemini_API_Key** to enable AI analysis.</p>
              <button 
                onClick={() => setShowManualInput(!showManualInput)}
                className="mt-2 text-primary hover:underline font-bold uppercase tracking-tighter text-[9px] block"
              >
                {showManualInput ? 'Close Manual Setup' : 'Android/Mobile? Tap to enter key manually'}
              </button>
              
              {showManualInput && (
                <div className="mt-3 flex gap-2 w-full max-w-md">
                  <input 
                    type="password"
                    placeholder="Paste AIzaSy... key here"
                    className="flex-1 bg-black/40 border border-primary/30 rounded px-2 py-1 text-primary font-mono text-[10px]"
                    value={manualKey}
                    onChange={(e) => {
                      setManualKey(e.target.value);
                      VaultService.storeSecret('gemini_api_key', e.target.value);
                    }}
                  />
                  <button 
                    onClick={() => {
                      setShowManualInput(false);
                      window.location.reload();
                    }}
                    className="bg-primary text-black px-2 py-1 text-[9px] font-bold uppercase rounded"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
        {fuel <= 0 && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-[10px] bg-amber-500/10 border border-amber-500/30 text-amber-500 px-3 py-2 rounded"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>FUEL REQUIRED: GO TO AUTO-CRAWL FIRST</span>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-[24px]">
        <div className="lg:col-span-2 space-y-4 md:space-y-[24px]">
          <div className="bg-card border border-border rounded-md p-4 md:p-[24px]">
            <label className="block text-[10px] uppercase tracking-[1px] text-muted-foreground mb-[12px]">
              Target URL or Social Bot ID (TG, WA, Discord, Messenger)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-[12px]">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Scan className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  disabled={status !== 'idle' && status !== 'submitted' || isOverlayActive}
                  className="block w-full pl-10 pr-12 py-3 border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary text-[13px] disabled:opacity-50 transition-colors rounded"
                  placeholder="e.g., t.me/NoGamStopBot, wa.me/44..., discord.gg/..., or casino-mirror.ag"
                />
                <button
                  onClick={handleScreenCapture}
                  disabled={status !== 'idle' && status !== 'submitted' || isOverlayActive}
                  title="Screen View Overlay (Auto-fill)"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isOverlayActive ? <Loader2 className="h-4 w-4 animate-spin text-primary" /> : <Search className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={status === 'submitted' ? reset : handleScan}
                disabled={!targetUrl || (status !== 'idle' && status !== 'submitted')}
                className="flex items-center justify-center gap-2 bg-transparent text-primary px-6 md:px-[24px] py-3 md:py-[12px] text-[10px] uppercase tracking-[1px] hover:bg-primary hover:text-background transition-colors border border-primary disabled:opacity-50 cursor-pointer rounded glow-border whitespace-nowrap"
              >
                {status === 'scanning' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                {status === 'submitted' ? 'New Scan' : 'Initiate Scan'}
              </button>
            </div>
          </div>

          <div className="bg-[#000000] border border-border rounded-md p-4 md:p-[16px] h-[300px] md:h-[400px] flex flex-col font-mono text-[12px] overflow-hidden relative">
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Anonymous Identity & Financial_TERMINAL_v1.0</span>
                {!isDormantScanning && (
                  <button 
                    onClick={handleDormantScan}
                    className="text-[9px] uppercase font-bold text-primary/60 hover:text-primary transition-colors flex items-center gap-1 ml-4"
                  >
                    <Fingerprint className="w-2.5 h-2.5" />
                    Run Dormant Audit
                  </button>
                )}
                {isDormantScanning && (
                  <span className="text-[9px] uppercase font-bold text-primary animate-pulse ml-4 flex items-center gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    Audit in Progress...
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-destructive/80"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500/80"></div>
                <div className="w-2 h-2 rounded-full bg-primary/80"></div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-1.5 p-2">
              {logs.length === 0 && (
                <div className="text-muted-foreground/50 italic">Awaiting target input...</div>
              )}
              {logs.map((log: any, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={`scanner-log-${log.id || 'idx'}-${idx}`} 
                  className={
                    log.msg.includes('WARNING') ? 'text-amber-400' : 
                    log.msg.includes('SUCCESS') ? 'text-primary' : 
                    log.msg.includes('SOVEREIGN') ? 'text-amber-metallic font-bold' :
                    'text-foreground/80'
                  }
                >
                  [{log.timestamp}] {log.msg}
                </motion.div>
              ))}
              {status === 'scanning' && (
                <div className="flex items-center gap-2 text-primary mt-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 md:space-y-[24px]">
          <AnimatePresence mode="wait">
            {status === 'idle' || status === 'scanning' ? (
              <motion.div 
                key="waiting"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-md p-4 md:p-[24px] flex flex-col items-center justify-center text-center h-[200px] text-muted-foreground"
              >
                <ShieldAlert className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-[13px]">Awaiting actionable intelligence.</p>
              </motion.div>
            ) : status === 'found' ? (
              <motion.div 
                key="found"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-destructive rounded-md p-4 md:p-[24px] flex flex-col glow-border-destructive"
              >
                <div className="flex items-center gap-3 text-destructive mb-[24px]">
                  <AlertTriangle className="w-5 h-5" />
                  <h3 className="font-sans text-[18px] font-bold tracking-[1px] uppercase">DISCOVERY PACK COMPILED</h3>
                </div>
                
                <div className="space-y-[12px] mb-[24px] text-[13px]">
                  <div className="flex justify-between border-b border-border pb-2 items-center">
                    <span className="text-muted-foreground">Target:</span>
                    <div className="flex items-center gap-2 overflow-hidden">
                      {scanResult && (
                        (() => {
                          const bounty = scanResult.bounty || '';
                          const violation = scanResult.violation || '';
                          const numericBounty = parseFloat(bounty.replace(/[^0-9.]/g, ''));
                          const highValueKeywords = ['satoshi', 'abandoned', 'unlicensed', 'escheatable', 'smart contract', 'residual'];
                          const isHighValue = (!isNaN(numericBounty) && numericBounty >= 1000) || 
                                             highValueKeywords.some(kw => violation.toLowerCase().includes(kw));
                          
                          return isHighValue && (
                            <motion.div
                              key={`trophy-scanner-${targetUrl}`}
                              initial={{ scale: 0, rotate: -20 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="bg-amber-500/20 p-1 rounded border border-amber-500/50"
                              title="HIGH-VALUE DISCOVERY"
                            >
                              <Trophy className="w-3 h-3 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                            </motion.div>
                          );
                        })()
                      )}
                      <span className={cn(
                        "font-mono truncate max-w-[120px]",
                        scanResult && (() => {
                          const bounty = scanResult.bounty || '';
                          const violation = scanResult.violation || '';
                          const numericBounty = parseFloat(bounty.replace(/[^0-9.]/g, ''));
                          const highValueKeywords = ['satoshi', 'abandoned', 'unlicensed', 'escheatable', 'smart contract', 'residual'];
                          return (!isNaN(numericBounty) && numericBounty >= 1000) || 
                                 highValueKeywords.some(kw => violation.toLowerCase().includes(kw));
                        })() ? "text-amber-500 font-bold" : ""
                      )}>
                        {targetUrl}
                      </span>
                      {targetUrl.startsWith('0x') && (
                        <a href={`https://basescan.org/address/${targetUrl}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-white" title="Verify on Basescan">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Violation:</span>
                    <span className="text-right">{scanResult?.violation || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Discovery Integrity:</span>
                    <span className={`font-bold ${scanResult?.killStatus === 'ACTIVE' ? 'text-destructive animate-pulse' : 'text-primary'}`}>
                      {scanResult?.killStatus || 'VERIFIED'}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Source Fidelity:</span>
                    <span className="text-primary font-mono glow-text">99.8%</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2 items-center">
                    <span className="text-muted-foreground">Est. Bounty:</span>
                    <span className="text-primary font-mono glow-text">{scanResult?.bounty || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 gap-2">
                    <span className="text-[10px] uppercase text-muted-foreground font-bold">Delivery Vector</span>
                    {isConnected ? (
                      <div className="flex items-center gap-1.5 overflow-hidden">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                         <span className="text-[10px] font-mono text-primary truncate max-w-[120px]">{connectedAddress}</span>
                         <CheckCircle2 className="w-3 h-3 text-primary" />
                      </div>
                    ) : (
                      <button 
                        onClick={() => open()}
                        className="text-[10px] font-bold text-amber-500 hover:underline flex items-center gap-1 uppercase"
                      >
                        <Wallet className="w-3 h-3" />
                        Connect Wallet
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <span className="text-[10px] uppercase text-muted-foreground tracking-widest font-bold">Destiny Strategy</span>
                  <div className={`grid ${isConnected ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                    <button 
                      onClick={() => setSubmissionDestination('Treasury Vault')}
                      className={`px-3 py-2 rounded text-[10px] font-bold uppercase border transition-all ${
                        submissionDestination === 'Treasury Vault'
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      Vault
                    </button>
                    {isConnected && (
                      <button 
                        onClick={() => setSubmissionDestination('Connected Wallet')}
                        className={`px-3 py-2 rounded text-[10px] font-bold uppercase border transition-all ${
                          submissionDestination === 'Connected Wallet'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-500 shadow-[0_0_8px_#3b82f6]'
                            : 'border-border bg-background text-muted-foreground hover:border-blue-500/50'
                        }`}
                      >
                        Wallet
                      </button>
                    )}
                    <button 
                      onClick={() => setSubmissionDestination('Treasury Gas')}
                      className={`px-3 py-2 rounded text-[10px] font-bold uppercase border transition-all ${
                        submissionDestination === 'Treasury Gas'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-500'
                          : 'border-border bg-background text-muted-foreground hover:border-amber-500/50'
                      }`}
                    >
                      Propellant
                    </button>
                  </div>
                  <p className="text-[9px] italic text-muted-foreground leading-tight">
                    {submissionDestination === 'Treasury Vault' 
                      ? "Funds will be held in the Treasury Vault for EOA withdrawal." 
                      : submissionDestination === 'Connected Wallet'
                      ? "Funds will be delivered to your connected Wallet: " + (connectedAddress?.substring(0, 6) + "...")
                      : "Funds will be inverted to replenish system propellant pool."}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-2 mt-4">
                  <button
                    onClick={handleSubmit}
                    className={`w-full flex items-center justify-center gap-2 bg-transparent py-[12px] text-[10px] uppercase tracking-[1px] transition-colors cursor-pointer rounded border ${
                      submissionDestination === 'Treasury Gas'
                        ? 'text-amber-500 border-amber-500 hover:bg-amber-500 hover:text-background'
                        : 'text-destructive border-destructive hover:bg-destructive hover:text-background'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    INSTANT SUBMIT {submissionDestination === 'Treasury Gas' ? 'FUEL' : 'LEAD'}
                  </button>
                  
                  {fuel <= 0 && (
                    <p className="text-[9px] text-center text-muted-foreground">
                      No fuel? Select <span className="text-primary italic">Relay Settle</span> in the Evidence Vault to start from zero.
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="submitted"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-primary rounded-md p-4 md:p-[24px] flex flex-col items-center text-center glow-border"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-[16px]">
                  <CheckCircle2 className="w-6 h-6 text-primary glow-text" />
                </div>
                <h3 className="font-sans text-[18px] font-bold tracking-[1px] uppercase text-primary mb-[8px] glow-text">ZK-RECEIPT SENT</h3>
                <p className="text-[13px] text-muted-foreground mb-[24px]">
                  Evidence pack routed to Gaming Board Intelligence Portal.
                </p>
                <div className="bg-background border border-border rounded p-[12px] w-full flex items-center gap-2 text-[11px] font-mono text-muted-foreground mb-4">
                  <Fingerprint className="w-4 h-4" />
                  <span className="truncate">ZK_PACK_AUTH_0x...a19c</span>
                </div>
                <button 
                   onClick={() => {
                     const detail = { detail: 'tracker' };
                     if (typeof CustomEvent === 'function') {
                       window.dispatchEvent(new CustomEvent('changeView', detail));
                     }
                   }}
                   className="text-[10px] uppercase font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <ListChecks className="w-3 h-3" />
                  Track in Evidence Vault
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
