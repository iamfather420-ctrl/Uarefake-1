import { useState, useEffect } from 'react';
import { geminiService } from '../services/GeminiService';
import { useAccount } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { Filter, ListChecks, Loader2, X, Shield, ExternalLink, Hash, Clock, Landmark, CheckCircle2, Circle, ArrowRight, Zap, Trophy, ShieldAlert, Cpu, Bot, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export function LeadTracker() {
  const { address: connectedAddress, isConnected } = useAccount();
  const { open } = useAppKit();
  const [filter, setFilter] = useState<string>('all');
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchLeads = () => {
    const handleJsonResponse = async (res: Response) => {
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON response from Anonymous Identity & Financial system');
      }
      return res.json();
    };

    fetch('/api/leads', {
      headers: { 'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || '' }
    })
      .then(handleJsonResponse)
      .then(data => {
        setLeads(data);
        if (selectedLead) {
          const updated = data.find((l: any) => l.id === selectedLead.id);
          if (updated) setSelectedLead(updated);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leads:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const res = await fetch(`/api/leads/${id}/verify`, { 
        method: 'POST',
        headers: { 'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || '' }
      });
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Non-JSON verification response');
      }
      const data = await res.json();
      if (data.success) {
        fetchLeads();
      }
    } catch (err) {
      console.error('Final verification error:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleAiVerify = async (lead: any) => {
    setIsVerifying(true);
    try {
      const auditResult = await geminiService.auditLead(
        lead.target,
        lead.violation_type,
        lead.evidence
      );

      const res = await fetch(`/api/leads/${lead.id}/ai-verify`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || ''
        },
        body: JSON.stringify({ audit_result: auditResult })
      });

      if (res.ok) {
        fetchLeads();
      }
    } catch (err) {
      console.error('AI verification error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const filteredLeads = leads.filter(lead => filter === 'all' || lead.status === filter);

  const getStatusStage = (status: string) => {
    switch (status) {
      case 'pending': return 1;
      case 'verified': return 2;
      case 'settled':
      case 'paid': return 3;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const stages = [
    { id: 0, label: 'Submitted', desc: 'Lead captured & entered vault' },
    { id: 1, label: 'Review', desc: 'System validation in progress' },
    { id: 2, label: 'Verified', desc: 'Evidence approved for payout' },
    { id: 3, label: 'Settled', desc: 'Funds pushed to Solana Mainnet' },
  ];

  return (
    <div className="space-y-4 md:space-y-[24px]">
      {/* Lead Details Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-primary w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/50">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-sans font-bold uppercase tracking-widest text-sm">Evidence Vault: {selectedLead.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedLead(null)}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Close"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Status Tracker */}
              <div className="bg-secondary/30 border border-border rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-8 relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 left-0 w-full h-0.5 bg-border -z-10" />
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(Math.max(0, getStatusStage(selectedLead.status)) / (stages.length - 1)) * 100}%` 
                    }}
                    className="absolute top-4 left-0 h-0.5 bg-primary -z-10 transition-all duration-500"
                  />

                  {stages.map((stage, idx) => {
                    const currentStage = getStatusStage(selectedLead.status);
                    const isCompleted = currentStage >= stage.id;
                    const isActive = currentStage === stage.id;
                    const isRejected = currentStage === -1;

                    return (
                      <div key={`stage-${stage.id}-${idx}`} className="flex flex-col items-center text-center w-1/4">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-card transition-colors duration-300 ${
                          isRejected ? 'border-destructive text-destructive' :
                          isCompleted ? 'border-primary bg-primary text-background' : 
                          'border-border text-muted-foreground'
                        }`}>
                          {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                        <div className="mt-2">
                          <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                            {stage.label}
                          </p>
                          <p className="text-[9px] text-muted-foreground/60 hidden sm:block leading-tight mt-0.5">
                            {isRejected && stage.id > 0 ? 'Validation Failed' : stage.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {selectedLead.status === 'rejected' && (
                  <div className="flex items-center gap-2 text-destructive bg-destructive/10 border border-destructive/20 p-3 rounded text-[11px]">
                    <Shield className="w-4 h-4" />
                    <span>This lead was rejected by the system due to insufficient evidence or duplicate status.</span>
                  </div>
                )}
              </div>

                {/* AI Insight (if available) */}
                {selectedLead.ai_status_suggestion && (
                  <div className={cn(
                    "p-4 rounded-lg border flex gap-3 items-start mb-6",
                    selectedLead.status === 'verified' ? "bg-primary/5 border-primary/20" : "bg-amber-500/5 border-amber-500/20"
                  )}>
                    <Bot className={cn("w-5 h-5 shrink-0 mt-0.5", selectedLead.status === 'verified' ? "text-primary" : "text-amber-500")} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">AI Auditor Insight</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i < (selectedLead.confidence_score * 5) ? (selectedLead.status === 'verified' ? "bg-primary" : "bg-amber-500") : "bg-muted")} />
                          ))}
                        </div>
                      </div>
                      <p className="text-[11px] text-foreground font-mono leading-relaxed italic">
                        "{selectedLead.ai_status_suggestion}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block mb-1">Target Identity</span>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-foreground truncate max-w-[200px]">{selectedLead.target}</span>
                        {selectedLead.target.startsWith('0x') && (
                          <a 
                            href={`https://basescan.org/address/${selectedLead.target}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-[9px] flex items-center gap-1 bg-primary/5 px-2 py-1 rounded"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Verify on Basescan
                          </a>
                        )}
                      </div>
                      
                      {/* Social Links for direct contact */}
                      <div className="flex items-center gap-2">
                        <a 
                          href={`https://t.me/${selectedLead.target.includes('t.me/') ? selectedLead.target.split('t.me/')[1] : ''}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-500 rounded text-[9px] font-black uppercase hover:bg-sky-500 hover:text-white transition-all shadow-sm"
                        >
                          Telegram
                        </a>
                        <a 
                          href={`https://m.me/`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded text-[9px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all shadow-sm"
                        >
                          Messenger
                        </a>
                        <a 
                          href={`https://www.google.com/search?q=${encodeURIComponent(selectedLead.target)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded text-[9px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                        >
                          Search
                        </a>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block mb-1">Enforcement Board</span>
                    <div className="flex items-center gap-2">
                      <Landmark className="w-4 h-4 text-primary" />
                      <span className="uppercase text-xs font-mono">{selectedLead.board || selectedLead.violation_type}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block mb-1">Validation Status</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      selectedLead.status === 'verified' ? 'bg-primary/20 text-primary border border-primary/30' : 
                      selectedLead.status === 'settled' || selectedLead.status === 'paid' ? 'bg-primary text-background' : 
                      'bg-secondary text-muted-foreground border border-border'
                    }`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-muted-foreground block mb-1">Submission Date</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{selectedLead.date || new Date(selectedLead.created_at * 1000).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <span className="text-[10px] uppercase text-muted-foreground block mb-3"> Cryptographic Evidence Packet</span>
                
                {/* Specific UI for Regulatory Compliance */}
                {selectedLead.violation_type === 'REGULATORY_NON_COMPLIANCE' ? (
                  <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-lg space-y-4">
                    <div className="flex items-center gap-3 text-amber-500 font-bold uppercase text-[12px] mb-2">
                       <ShieldAlert className="w-5 h-5" />
                       Regulatory Compliance Audit Report
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                       <div className={`p-3 border rounded ${selectedLead.evidence?.includes('MISSING_CGCB_DIGITAL_SEAL') ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                          <p className="text-[9px] uppercase opacity-60">Curacao (CGCB)</p>
                          <p className="font-bold text-[11px] mt-1">{selectedLead.evidence?.includes('MISSING_CGCB_DIGITAL_SEAL') ? 'SEAL_MISSING' : 'SEAL_VERIFIED'}</p>
                       </div>
                       <div className={`p-3 border rounded ${selectedLead.evidence?.includes('UKGC_HANDSHAKE_TIMEOUT') ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                          <p className="text-[9px] uppercase opacity-60">UK (UKGC)</p>
                          <p className="font-bold text-[11px] mt-1">{selectedLead.evidence?.includes('UKGC_HANDSHAKE_TIMEOUT') ? 'HANDSHAKE_FAIL' : 'HANDSHAKE_LIVE'}</p>
                       </div>
                       <div className={`p-3 border rounded ${selectedLead.evidence?.includes('MGCB_MARKER_ABSENT') ? 'bg-destructive/10 border-destructive/20 text-destructive' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                          <p className="text-[9px] uppercase opacity-60">Michigan (MGCB)</p>
                          <p className="font-bold text-[11px] mt-1">{selectedLead.evidence?.includes('MGCB_MARKER_ABSENT') ? 'MARKER_ABSENT' : 'MARKER_VERIFIED'}</p>
                       </div>
                    </div>
                    <div className="bg-black/60 p-3 rounded text-[10px] font-mono text-muted-foreground/80 lowercase">
                       {selectedLead.evidence}
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/40 border border-border/50 p-4 rounded font-mono text-[11px] text-muted-foreground overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {selectedLead.evidence || JSON.stringify(selectedLead, null, 2)}
                  </div>
                )}
              </div>

              {selectedLead.settlement_tx && (
                <div className="bg-primary/5 border border-primary/20 p-4 rounded flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase text-primary font-bold">Solana Mainnet Settlement Confirmed</span>
                    <span className="text-primary"><Landmark className="w-4 h-4" /></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Hash className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-mono text-muted-foreground truncate flex-1">{selectedLead.settlement_tx}</span>
                    {selectedLead.settlement_tx.startsWith('RELAY_AUTH_') ? (
                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded text-[9px] text-amber-500 font-bold uppercase">
                        <Zap className="w-3 h-3" />
                        Relay Protocol
                      </div>
                    ) : (
                      <a 
                        href={`https://basescan.org/tx/${selectedLead.settlement_tx}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-[10px] flex items-center gap-1"
                      >
                        Verify <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-secondary/30 flex justify-between items-center gap-4">
              <div className="flex-1">
                <span className="text-[10px] uppercase text-muted-foreground block">Estimated Payout</span>
                <span className="font-mono text-xl text-primary glow-text">{selectedLead.payout || `$${selectedLead.payout_amount?.toLocaleString()}`}</span>
              </div>
              
              <div className="flex gap-2">
                {selectedLead.status === 'verified' && (
                  <div className="flex bg-secondary rounded border border-border overflow-hidden">
                    <button 
                      onClick={async () => {
                        const res = await fetch(`/api/leads/${selectedLead.id}/strategy`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || ''
                          },
                          body: JSON.stringify({ strategy: 'PAYOUT' })
                        });
                        if (res.ok) fetchLeads();
                      }}
                      className={`px-3 py-2 text-[9px] uppercase font-bold transition-colors ${selectedLead.settlement_strategy === 'PAYOUT' ? 'bg-primary text-background' : 'hover:bg-white/5 text-muted-foreground'}`}
                    >
                      Vault
                    </button>
                    <button 
                      onClick={async () => {
                        const res = await fetch(`/api/leads/${selectedLead.id}/strategy`, {
                          method: 'POST',
                          headers: { 
                            'Content-Type': 'application/json',
                            'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || ''
                          },
                          body: JSON.stringify({ strategy: 'TREASURY_GAS' })
                        });
                        if (res.ok) fetchLeads();
                      }}
                      className={`px-3 py-2 text-[9px] uppercase font-bold transition-colors ${selectedLead.settlement_strategy === 'TREASURY_GAS' ? 'bg-amber-500 text-background' : 'hover:bg-white/5 text-muted-foreground'}`}
                    >
                      Propellant
                    </button>
                  </div>
                )}
                {selectedLead.status === 'verified' && (
                  <div className="flex flex-col gap-2">
                    {isConnected ? (
                      <button 
                        onClick={async () => {
                          setIsVerifying(true);
                          // SIMULATED DIRECT RECLAIM
                          // In a real app, this might trigger a contract call via useWriteContract
                          const res = await fetch('/api/settle-relay', { 
                            method: 'POST',
                            headers: { 
                              'Content-Type': 'application/json',
                              'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || ''
                            },
                            body: JSON.stringify({ directTo: connectedAddress })
                          });
                          if (res.ok) {
                             setSelectedLead(null);
                             fetchLeads();
                          }
                          setIsVerifying(false);
                        }}
                        disabled={isVerifying}
                        className="bg-primary text-background px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:opacity-90 transition-all rounded flex items-center justify-center gap-2 border-2 border-primary shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                      >
                        <Wallet className="w-3 h-3" />
                        Direct Reclaim to Wallet
                      </button>
                    ) : (
                      <button 
                        onClick={() => open()}
                        className="bg-primary/20 border border-primary/40 text-primary px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-primary hover:text-background transition-all rounded flex items-center justify-center gap-2"
                      >
                        <Zap className="w-3 h-3" />
                        Connect to Reclaim
                      </button>
                    )}
                    <button 
                      onClick={async () => {
                        setIsVerifying(true);
                        const res = await fetch('/api/settle-relay', { 
                          method: 'POST',
                          headers: { 'x-warhive-reg-id': localStorage.getItem('warhive_reg_id') || '' }
                        });
                        if (res.ok) {
                           setSelectedLead(null);
                           fetchLeads();
                        }
                        setIsVerifying(false);
                      }}
                      disabled={verifyingId !== null}
                      className="bg-secondary border border-border text-foreground px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:opacity-90 transition-all rounded flex items-center justify-center gap-2"
                    >
                      <Bot className="w-3 h-3" />
                      Relay Hub Settle
                    </button>
                    <span className="text-[8px] text-muted-foreground uppercase text-center">5% Fuel Tax applies to Relay</span>
                  </div>
                )}
                {selectedLead.status === 'pending' && (
                  <button 
                    onClick={() => handleAiVerify(selectedLead)}
                    disabled={isVerifying}
                    className="bg-amber-500/20 border border-amber-500/40 text-amber-500 px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-amber-500 hover:text-background transition-all rounded flex items-center gap-2"
                  >
                    {isVerifying ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                    AI Re-Audit
                  </button>
                )}
                {selectedLead.status === 'pending' && (
                  <button 
                    onClick={() => handleVerify(selectedLead.id)}
                    disabled={verifyingId === selectedLead.id}
                    className="bg-primary/20 border border-primary/40 text-primary px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-primary hover:text-background transition-all rounded flex items-center gap-2"
                  >
                    {verifyingId === selectedLead.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Shield className="w-3 h-3" />}
                    Authorize Settlement
                  </button>
                )}
                <button 
                  onClick={() => setSelectedLead(null)}
                  className="bg-secondary text-foreground px-4 py-2 text-[10px] uppercase font-bold tracking-widest hover:bg-muted transition-opacity rounded"
                >
                  Close Vault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl md:text-[24px] font-bold tracking-[2px] uppercase flex items-center gap-2">
            <ListChecks className="w-6 h-6 text-primary" />
            Evidence Vault
          </h2>
          <p className="text-muted-foreground mt-1 text-xs md:text-[13px]">Monitor the status of your submitted evidence packs.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-secondary p-1 border border-border overflow-x-auto w-full sm:w-auto">
          <div className="px-2 text-muted-foreground shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          {['all', 'pending', 'verified', 'paid', 'rejected'].map((status, idx) => (
            <button
              key={`status-filter-${status}-${idx}`}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[1px] transition-colors whitespace-nowrap ${
                filter === status 
                  ? 'bg-background text-primary border border-primary glow-border' 
                  : 'text-muted-foreground hover:text-foreground border border-transparent'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] text-left">
            <thead className="text-[10px] text-muted-foreground uppercase tracking-[1px] bg-secondary border-b border-border">
              <tr>
                <th className="px-4 md:px-[24px] py-3 md:py-[16px] font-normal whitespace-nowrap">Lead ID</th>
                <th className="px-4 md:px-[24px] py-3 md:py-[16px] font-normal whitespace-nowrap">Target</th>
                <th className="px-4 md:px-[24px] py-3 md:py-[16px] font-normal whitespace-nowrap">Gaming Board</th>
                <th className="px-4 md:px-[24px] py-3 md:py-[16px] font-normal whitespace-nowrap">Date Submitted</th>
                <th className="px-4 md:px-[24px] py-3 md:py-[16px] font-normal whitespace-nowrap">Status</th>
                <th className="px-4 md:px-[24px] py-3 md:py-[16px] font-normal text-right whitespace-nowrap">Est. Payout</th>
                <th className="px-4 md:px-[24px] py-3 md:py-[16px] font-normal text-center whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map((lead: any, idx: number) => (
                <tr key={`lead-row-${lead.id}-${idx}`} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-4 md:px-[24px] py-3 md:py-[16px] font-mono text-muted-foreground whitespace-nowrap">{lead.id}</td>
                  <td className="px-4 md:px-[24px] py-3 md:py-[16px] font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       {(() => {
                          const payout = lead.payout_amount || 0;
                          const violation = lead.violation_type || '';
                          const highValueKeywords = ['satoshi', 'abandoned', 'unlicensed', 'escheatable', 'smart contract', 'residual'];
                          const isHighValue = payout >= 1000 || 
                                             highValueKeywords.some(kw => violation.toLowerCase().includes(kw));
                          
                          return isHighValue && (
                            <div key={`trophy-lead-${lead.id}`} className="bg-amber-500/20 p-0.5 rounded border border-amber-500/30" title="HIGH-VALUE">
                              <Trophy className="w-2.5 h-2.5 text-amber-500" />
                            </div>
                          );
                       })()}
                       <span className={cn(
                         "truncate max-w-[150px]",
                         (lead.payout_amount >= 1000) ? "text-amber-500 font-bold" : ""
                       )}>
                         {lead.target}
                       </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-[24px] py-3 md:py-[16px] whitespace-nowrap">
                    <span className="text-[10px] uppercase tracking-[1px] text-muted-foreground">
                      {lead.violation_type}
                    </span>
                  </td>
                  <td className="px-4 md:px-[24px] py-3 md:py-[16px] text-muted-foreground whitespace-nowrap">
                    {lead.created_at ? new Date(lead.created_at * 1000).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-4 md:px-[24px] py-3 md:py-[16px] whitespace-nowrap">
                    <span className={`text-[11px] font-bold uppercase ${lead.status === 'rejected' ? 'text-destructive' : lead.status === 'paid' || lead.status === 'settled' ? 'text-primary' : 'text-foreground'}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-[24px] py-3 md:py-[16px] text-right font-mono text-[16px] text-primary glow-text whitespace-nowrap">
                    ${(lead.payout_amount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 md:px-[24px] py-3 md:py-[16px] text-center whitespace-nowrap">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedLead(lead);
                      }}
                      className="bg-transparent border border-primary text-primary px-[12px] py-[6px] text-[10px] uppercase cursor-pointer hover:bg-primary hover:text-background transition-colors rounded relative z-10"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLeads.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 md:px-[24px] py-[40px] text-center text-muted-foreground text-[13px]">
                    No leads found matching the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
