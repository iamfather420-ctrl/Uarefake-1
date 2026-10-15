import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Layers, Terminal, Sliders, Activity, ShoppingBag, ShieldAlert, CheckCircle, RefreshCw, Server, ShieldCheck, GitBranch, Shield } from 'lucide-react';
import NodeGrid from './components/NodeGrid.tsx';
import ParadoxRegistry from './components/ParadoxRegistry.tsx';
import GithubUnifier from './components/GithubUnifier.tsx';
import JitCompiler from './components/JitCompiler.tsx';
import SandboxTelemetry from './components/SandboxTelemetry.tsx';
import SovereignMarketplace from './components/SovereignMarketplace.tsx';
import CicdOrchestration from './components/CicdOrchestration.tsx';
import EnclaveTab from './components/EnclaveTab.tsx';
import { AutonomousSovereignController } from './utils/SovereignController.ts';

interface SystemStatus {
  gridHealth: number;
  activeNodesCount: number;
  totalNodes: number;
  criticalParadoxesCount: number;
  totalParadoxes: number;
  totalSolutions: number;
  avgLatencyMs: number;
  avgUtilizationPercent: number;
  tetherStatus: string;
  complianceVerified: boolean;
  chaosFactor: number;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('grid');
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [buildTriggeredCount, setBuildTriggeredCount] = useState<number>(0);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Fetch overall system statistics
  const fetchSystemStatus = async () => {
    try {
      const res = await fetch('/api/system/status');
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (e) {
      console.error("Error fetching system status", e);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    const interval = setInterval(fetchSystemStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  // Autopilot continuous background monitoring loop (Sovereign Heartbeat: 60,000ms)
  useEffect(() => {
    // Run once on load
    AutonomousSovereignController.runAutoPilot();
    
    const autopilotInterval = setInterval(() => {
      AutonomousSovereignController.runAutoPilot();
    }, 60000);
    
    return () => clearInterval(autopilotInterval);
  }, []);

  // Callback when a new JIT Build starts from the unifier or template purchase
  const handleBuildCreated = () => {
    setBuildTriggeredCount(prev => prev + 1);
    fetchSystemStatus();
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Ambience Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40"></div>
      
      {/* Dynamic Ambient Blur Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Primary Header Console */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur z-20 sticky top-0 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          
          {/* Logo & Operational Status */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-indigo-950/40 border border-indigo-500/20 rounded-xl relative overflow-hidden shrink-0">
                <Server className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-display font-bold tracking-tight text-slate-100 uppercase">
                    dAIsy HaMINJA
                  </h1>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-slate-900 border border-slate-800 rounded-md text-indigo-400">
                    V1.0.0-STABLE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">SolveX Sovereign Core Institutional Orchestrator</p>
              </div>
            </div>
          </div>

          {/* Core Handshake Telemetry Widget */}
          {systemStatus ? (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[11px] bg-slate-950/80 border border-slate-900 rounded-xl p-2.5 sm:px-4">
              <div className="flex items-center gap-1.5 border-r border-slate-900 pr-3 sm:pr-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-slate-400">GRID:</span>
                <span className="text-emerald-400 font-bold">{systemStatus.gridHealth}%</span>
              </div>

              <div className="flex items-center gap-1.5 border-r border-slate-900 pr-3 sm:pr-4">
                <span className="text-slate-400">LATENCY:</span>
                <span className="text-slate-200 font-bold">{systemStatus.avgLatencyMs} ms</span>
              </div>

              <div className="flex items-center gap-1.5 border-r border-slate-900 pr-3 sm:pr-4">
                <span className="text-slate-400">PARADOX VULNS:</span>
                <span className={`${systemStatus.criticalParadoxesCount > 0 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-400'}`}>
                  {systemStatus.criticalParadoxesCount}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">TETHER RAG:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE
                </span>
              </div>
            </div>
          ) : (
            <div className="h-10 w-64 bg-slate-950 animate-pulse rounded-xl border border-slate-900"></div>
          )}

        </div>
      </header>

      {/* Main Operational Cockpit Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6 z-10">
        
        {/* Navigation Tabs Bar */}
        <div className="border-b border-slate-900 pb-px">
          <nav className="flex flex-wrap gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('grid')}
              className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'grid'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 font-bold shadow-[0_-2px_8px_rgba(99,102,241,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 bg-slate-950/20'
              }`}
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              Grid Map (54 Nodes)
            </button>

            <button
              onClick={() => setActiveTab('paradox')}
              className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'paradox'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 font-bold shadow-[0_-2px_8px_rgba(99,102,241,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 bg-slate-950/20'
              }`}
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              Paradox Registry (88)
            </button>

            <button
              onClick={() => setActiveTab('unifier')}
              className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'unifier'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 font-bold shadow-[0_-2px_8px_rgba(99,102,241,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 bg-slate-950/20'
              }`}
            >
              <Terminal className="w-4 h-4 text-teal-400" />
              Repository Unifier
            </button>

            <button
              onClick={() => setActiveTab('compiler')}
              className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'compiler'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 font-bold shadow-[0_-2px_8px_rgba(99,102,241,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 bg-slate-950/20'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-amber-400" />
              JIT Compiler
            </button>

            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'sandbox'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 font-bold shadow-[0_-2px_8px_rgba(99,102,241,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 bg-slate-950/20'
              }`}
            >
              <Activity className="w-4 h-4 text-rose-400" />
              Efficacy Sandbox Suite
            </button>

            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'marketplace'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 font-bold shadow-[0_-2px_8px_rgba(99,102,241,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 bg-slate-950/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-sky-400" />
              Dual-Market
            </button>

            <button
              onClick={() => setActiveTab('cicd')}
              className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cicd'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 font-bold shadow-[0_-2px_8px_rgba(99,102,241,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 bg-slate-950/20'
              }`}
            >
              <GitBranch className="w-4 h-4 text-indigo-400 animate-pulse" />
              Autonomous CI/CD
            </button>

            <button
              onClick={() => setActiveTab('enclave')}
              className={`px-4 py-2.5 rounded-t-lg border-t border-x transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'enclave'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-100 font-bold shadow-[0_-2px_8px_rgba(99,102,241,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 bg-slate-950/20'
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              Hardware Enclave
            </button>
          </nav>
        </div>

        {/* Tab Content Display Area */}
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'grid' && (
                <NodeGrid systemStatus={systemStatus} onRefreshSystem={fetchSystemStatus} />
              )}
              {activeTab === 'paradox' && (
                <ParadoxRegistry />
              )}
              {activeTab === 'unifier' && (
                <GithubUnifier onBuildCreated={handleBuildCreated} setActiveTab={setActiveTab} />
              )}
              {activeTab === 'compiler' && (
                <JitCompiler buildTriggeredCount={buildTriggeredCount} />
              )}
              {activeTab === 'sandbox' && (
                <SandboxTelemetry />
              )}
              {activeTab === 'marketplace' && (
                <SovereignMarketplace onSelectTemplate={handleSelectTemplate} setActiveTab={setActiveTab} />
              )}
              {activeTab === 'cicd' && (
                <CicdOrchestration />
              )}
              {activeTab === 'enclave' && (
                <EnclaveTab />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Enterprise Security Certifications Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-[10px] font-mono text-slate-500 z-10 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span>COMPLIANCE STACK:</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-400">NIST SP 800-53</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-400">SOC2 TYPE II</span>
            <span className="px-2 py-0.5 bg-slate-900 rounded border border-slate-800 text-slate-400">ISO 42001</span>
          </div>

          <div>
            SOVEREIGN ENCRYPTED DISTRIBUTION PIPELINE. PROTECTING 58 PROPRIETARY PARADOX RESOLVERS.
          </div>
        </div>
      </footer>

    </div>
  );
}
