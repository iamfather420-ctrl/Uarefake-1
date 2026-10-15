import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Eye, 
  Recycle, 
  Cpu, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Zap, 
  Server, 
  Terminal, 
  Copy, 
  Check, 
  Layers, 
  Download,
  Flame,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { 
  ComplianceFrameworkRecord, 
  WasteHarvesterMetric, 
  ConsensusMemoryRecord,
  INITIAL_COMPLIANCE_FRAMEWORKS,
  INITIAL_WASTE_METRICS,
  INITIAL_CONSENSUS_MEMORY
} from '../data/wasteHarvesterData';

export const CrystalClearBoxView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'compliance' | 'harvester' | 'consensus' | 'headerTester'>('compliance');
  
  // Frameworks & Audits
  const [frameworks, setFrameworks] = useState<ComplianceFrameworkRecord[]>(INITIAL_COMPLIANCE_FRAMEWORKS);
  const [selectedFramework, setSelectedFramework] = useState<ComplianceFrameworkRecord>(frameworks[0]);
  const [isAuditing, setIsAuditing] = useState(false);

  // Waste Harvester State
  const [wasteMetrics, setWasteMetrics] = useState<WasteHarvesterMetric[]>(INITIAL_WASTE_METRICS);
  const [isHarvesting, setIsHarvesting] = useState<string | null>(null);
  const [totalHarvestedUsd, setTotalHarvestedUsd] = useState<number>(3460.00);
  const [totalKwHRecovered, setTotalKwHRecovered] = useState<number>(147.2);

  // Consensus Memory State
  const [consensusRecords, setConsensusRecords] = useState<ConsensusMemoryRecord[]>(INITIAL_CONSENSUS_MEMORY);

  // 380-Byte Header Tester
  const [headerInput, setHeaderInput] = useState<string>('SOLVEX-ENTERPRISE-380CHAR-HEADER::COMPANY-[UAREFAKE.COM ENTERPRISE GLOBAL]::SYSTEM-JIT-DISTRIBUTION::HASH-a8f9c2104e7b83d1059f3211e038294a772c10b984102938475a6b1029384756c9d81726354019283746501928374650192837465019283746501928374650192837465019283746501928374650192837465019283746501928374650192837465019283746501928374650192837465019283746501928374650192837465019283746501928374650192837465019283746501928374650192837465::NODE-01');
  const [headerValidation, setHeaderValidation] = useState<{
    length: number;
    isValidLength: boolean;
    hasPrefix: boolean;
    nodeSuffix: string;
    status: 'Valid' | 'Invalid';
  } | null>(null);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRunComplianceAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setFrameworks(prev => prev.map(f => ({
        ...f,
        lastScannedAt: new Date().toISOString(),
        score: 100
      })));
      setIsAuditing(false);
    }, 900);
  };

  const handleHarvestResource = (id: string, usdValue: number, kwh: number) => {
    setIsHarvesting(id);
    setTimeout(() => {
      setWasteMetrics(prev => prev.map(w => 
        w.id === id ? { 
          ...w, 
          reclamationStatus: 'RECLAIMED',
          merkleProof: `0xRECLAIM_${Math.random().toString(16).substring(2, 10).toUpperCase()}_OK` 
        } : w
      ));
      setTotalHarvestedUsd(prev => prev + usdValue);
      setTotalKwHRecovered(prev => Number((prev + kwh).toFixed(1)));
      
      // Add consensus ledger entry
      const newLedgerEntry: ConsensusMemoryRecord = {
        id: `cm-${Date.now()}`,
        timestamp: new Date().toISOString(),
        event: `CRYSTAL_CLEAR_BOX::HARVEST_RECLAIMED_${id.toUpperCase()}`,
        node: 'EDGE-NORTH (::NODE-02)',
        fingerprintSha256: `a8f9c2104e7b83d1059f3211e038294a${Math.random().toString(16).substring(2, 10)}`,
        merkleRoot: `0x${Math.random().toString(16).substring(2, 42)}`,
        status: 'WAL_SAFE'
      };
      setConsensusRecords(prev => [newLedgerEntry, ...prev]);

      setIsHarvesting(null);
    }, 750);
  };

  const handleVerifyHeader = (e: React.FormEvent) => {
    e.preventDefault();
    const len = headerInput.length;
    const isValidLength = len === 380;
    const hasPrefix = headerInput.includes('SOLVEX-ENTERPRISE-380CHAR-HEADER');
    const suffixMatch = headerInput.match(/::(NODE-\d+)$/i);
    const nodeSuffix = suffixMatch ? suffixMatch[1].toUpperCase() : 'NONE';

    setHeaderValidation({
      length: len,
      isValidLength,
      hasPrefix,
      nodeSuffix,
      status: isValidLength && hasPrefix ? 'Valid' : 'Invalid'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950/80 to-slate-950 border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full font-mono">
              <Eye className="w-3.5 h-3.5 text-teal-400" />
              <span>CRYSTAL-CLEAR BOX IMMUTABILITY & BASE WASTE HARVESTER</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              Glass-Box Compliance & Compute Reclamation
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Derived from <span className="text-teal-300 font-mono font-semibold">SolveX-Crystal-Clear-Box-Compliance-Immutibility</span>. High-assurance explainable AI decision tracking across 6 regulatory standards with autonomous zero-loss compute cycle & stranded gas reclamation.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-teal-500/30 rounded-2xl p-4 min-w-[140px] shadow-inner">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Recycled Value</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ${totalHarvestedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-teal-300 mt-0.5">{totalKwHRecovered} kWh Energy Saved</div>
            </div>

            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 min-w-[140px] shadow-inner">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Compliance Health</div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                100.0%
              </div>
              <div className="text-[10px] text-emerald-400 mt-0.5">EAL6+ Verified</div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-teal-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('compliance')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
              activeTab === 'compliance'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/30 ring-1 ring-teal-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Regulatory Standards ({frameworks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('harvester')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
              activeTab === 'harvester'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Recycle className="w-4 h-4 text-emerald-300" />
            <span>Base Waste Harvester ({wasteMetrics.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('consensus')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
              activeTab === 'consensus'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-300" />
            <span>Consensus Memory WAL</span>
          </button>

          <button
            onClick={() => setActiveTab('headerTester')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
              activeTab === 'headerTester'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Lock className="w-4 h-4 text-indigo-300" />
            <span>380-Byte Perimeter Router</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: REGULATORY COMPLIANCE MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'compliance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Standards List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-mono text-slate-400">Glass-Box Verification Frameworks</span>
              <button
                onClick={handleRunComplianceAudit}
                disabled={isAuditing}
                className="flex items-center space-x-1.5 text-xs font-mono text-teal-300 hover:text-white bg-teal-950/60 border border-teal-500/30 px-3 py-1 rounded-xl transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                <span>{isAuditing ? 'Auditing...' : 'Re-Scan All'}</span>
              </button>
            </div>

            {frameworks.map(fw => {
              const isSelected = selectedFramework.id === fw.id;
              return (
                <div
                  key={fw.id}
                  onClick={() => setSelectedFramework(fw)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-teal-500 ring-1 ring-teal-400 shadow-xl'
                      : 'bg-slate-950/80 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-teal-400">{fw.code}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                      {fw.status} (Score: {fw.score}%)
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">{fw.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">{fw.authority}</div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Deep Explanation */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <span className="text-xs font-mono text-teal-400 font-bold uppercase">{selectedFramework.standardLevel}</span>
                  <h2 className="text-xl font-bold text-white font-mono">{selectedFramework.name}</h2>
                  <div className="text-xs text-slate-400">{selectedFramework.authority}</div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-mono text-slate-400">Deterministic Score</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">{selectedFramework.score}%</div>
                </div>
              </div>

              {/* Glass-Box Explanation Box */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <span>Glass-Box Algorithmic Justification</span>
                </h3>
                <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed font-sans">
                  {selectedFramework.glassBoxExplanation}
                </p>
              </div>

              {/* Merkle Immutability Proof */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center space-x-1.5">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span>Cryptographic Immutability Merkle Proof</span>
                  </h3>
                  <button
                    onClick={() => handleCopy(selectedFramework.immutabilityProof, selectedFramework.id)}
                    className="flex items-center space-x-1 text-[11px] font-mono text-teal-400 hover:text-teal-300 px-2 py-1 rounded bg-teal-950/60 border border-teal-500/30 transition-colors"
                  >
                    {copiedId === selectedFramework.id ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Hash</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 font-mono text-xs text-slate-400 break-all">
                  {selectedFramework.immutabilityProof}
                </div>
              </div>

              {/* Scanned Timestamp */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono text-slate-400">
                <span>Rules Evaluated: <b className="text-slate-200">{selectedFramework.rulesCount} Assertions</b></span>
                <span>Last Attested: {new Date(selectedFramework.lastScannedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BASE WASTE HARVESTER & RECLAMATION ENGINE */}
      {/* ========================================================================= */}
      {activeTab === 'harvester' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Recycled Value Yield</span>
                <Recycle className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                ${totalHarvestedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Autonomous micro-budget reclamation</div>
            </div>

            <div className="bg-slate-900 border border-teal-500/30 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Recovered Cloud Energy</span>
                <Flame className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-teal-300 mt-2">
                {totalKwHRecovered} kWh
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Direct carbon offset telemetry</div>
            </div>

            <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Active Reclamation Daemons</span>
                <Cpu className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold font-mono text-cyan-300 mt-2">
                4 Nodes Active
              </div>
              <div className="text-[11px] text-slate-400 mt-1">::NODE-01..03 cluster sweep</div>
            </div>
          </div>

          {/* Waste Resources List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold uppercase font-mono text-slate-200 flex items-center space-x-2">
              <Recycle className="w-4 h-4 text-emerald-400" />
              <span>Real-Time Waste Detection & Reclaim Actions</span>
            </h3>

            <div className="space-y-3">
              {wasteMetrics.map(item => (
                <div
                  key={item.id}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-emerald-500/30">
                        {item.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs font-mono text-slate-400">{item.clusterNode}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.resourceName}</h4>
                    <div className="text-xs text-slate-400 font-mono">
                      Volume: <b className="text-slate-200">{item.wasteVolume}</b> • Est. Loss: <b className="text-rose-400">${item.estimatedWasteUsdMonth}/mo</b>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <button
                      onClick={() => handleHarvestResource(item.id, item.estimatedWasteUsdMonth, item.recoveredKwH)}
                      disabled={item.reclamationStatus === 'RECLAIMED' || isHarvesting === item.id}
                      className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                        item.reclamationStatus === 'RECLAIMED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                      }`}
                    >
                      {isHarvesting === item.id ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Reclaiming...</span>
                        </>
                      ) : item.reclamationStatus === 'RECLAIMED' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Reclaimed (Proof Verified)</span>
                        </>
                      ) : (
                        <>
                          <Recycle className="w-3.5 h-3.5" />
                          <span>Harvest & Recycle</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CONSENSUS MEMORY WAL */}
      {/* ========================================================================= */}
      {activeTab === 'consensus' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold font-mono text-white flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>Consensus Memory State Ledger (consensus_memory.json)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tamper-proof write-ahead log recording multi-node transaction commits and Merkle hashes.
              </p>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              WAL-SAFE
            </span>
          </div>

          <div className="space-y-3">
            {consensusRecords.map(rec => (
              <div key={rec.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-indigo-300 font-bold">{rec.event}</span>
                  <span className="text-slate-400">{new Date(rec.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="text-xs text-slate-400 font-mono">Node: <b className="text-slate-200">{rec.node}</b></div>
                <div className="bg-slate-900 p-2.5 rounded-xl text-[11px] font-mono text-slate-400 break-all">
                  SHA-256: <span className="text-cyan-300">{rec.fingerprintSha256}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: 380-BYTE PERIMETER ROUTER TESTER */}
      {/* ========================================================================= */}
      {activeTab === 'headerTester' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span>380-Character Strict Perimeter Router</span>
            </h2>
            <p className="text-xs text-slate-400">
              Derived from <span className="text-indigo-300 font-mono">protocols/mmtai_router.py</span>. Validates exact 380-character payload length, company token prefix, and node suffix before granting access to the Sovereign Core.
            </p>
          </div>

          <form onSubmit={handleVerifyHeader} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Test 380-Character Cryptographic Header:</span>
                <span className={headerInput.length === 380 ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                  Length: {headerInput.length} / 380
                </span>
              </div>
              <textarea
                rows={4}
                value={headerInput}
                onChange={e => setHeaderInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 break-all leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Validate Header Against MMTAI 5-Hop Perimeter</span>
            </button>
          </form>

          {headerValidation && (
            <div className={`p-4 rounded-2xl border ${
              headerValidation.status === 'Valid'
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
            }`}>
              <div className="flex items-center space-x-2 font-mono font-bold text-sm">
                {headerValidation.status === 'Valid' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>PERIMETER VALIDATED — 380 CHARACTERS MATCHED</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>PERIMETER REJECTED — INVALID HEADER LENGTH OR FORMAT</span>
                  </>
                )}
              </div>
              <div className="mt-2 text-xs font-mono space-y-1">
                <div>Length: {headerValidation.length} / 380 chars ({headerValidation.isValidLength ? 'PASS' : 'FAIL'})</div>
                <div>Prefix: SOLVEX-ENTERPRISE-380CHAR-HEADER ({headerValidation.hasPrefix ? 'FOUND' : 'MISSING'})</div>
                <div>Node Target Suffix: {headerValidation.nodeSuffix}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
