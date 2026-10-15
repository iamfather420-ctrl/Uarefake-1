import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Users, 
  DollarSign, 
  Zap, 
  Smartphone, 
  Monitor, 
  Bot, 
  Play, 
  Pause,
  Sparkles,
  GitMerge,
  Cpu,
  ShoppingBag,
  ShieldCheck,
  Brain,
  Code
} from 'lucide-react';
import { ViewMode, DeviceView, EnvironmentMode } from '../types';

interface NavbarProps {
  activeTab: ViewMode;
  setActiveTab: (tab: ViewMode) => void;
  deviceView: DeviceView;
  setDeviceView: (mode: DeviceView) => void;
  isAgentRunning: boolean;
  setIsAgentRunning: React.Dispatch<React.SetStateAction<boolean>>;
  environmentMode?: EnvironmentMode;
  setEnvironmentMode?: (mode: EnvironmentMode) => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  deviceView,
  setDeviceView,
  isAgentRunning,
  setIsAgentRunning,
  environmentMode = 'live',
  setEnvironmentMode,
  onOpenAiAssistant
}) => {
  const navItems: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'daisy_chat', label: 'Daisy Assistant', icon: <Bot className="w-4 h-4 text-purple-300" /> },
    { id: 'marketplace', label: 'Marketplace', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'agent_brain', label: 'Daisy Sovereign Brain', icon: <Brain className="w-4 h-4 text-cyan-300" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'daisy', label: 'Daisy App Forge', icon: <GitMerge className="w-4 h-4" /> },
    { id: 'paradox', label: 'Paradox Box', icon: <Cpu className="w-4 h-4" /> },
    { id: 'jit_build', label: 'Blaze 1.0 Forge', icon: <Code className="w-4 h-4" /> },
    { id: 'mmtai', label: 'MMTAI Protocol', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'procurement', label: 'POs & Invoices', icon: <FileText className="w-4 h-4" /> },
    { id: 'inventory', label: 'Inventory Hub', icon: <Package className="w-4 h-4" /> },
    { id: 'vendors', label: 'Vendor Matrix', icon: <Users className="w-4 h-4" /> },
    { id: 'finance', label: 'AP/AR Finance', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'workflows', label: 'Rules Engine', icon: <Zap className="w-4 h-4" /> },
  ];


  if (deviceView === 'mobile') {
    // For mobile view, we only render top header inside AndroidFrame or mobile compact nav
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-100 text-lg tracking-tight">DAISY HAMINJA</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-medium font-mono">
                  Sovereign AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal">Clean Web Consolidated • Quantum AI & 88 Paradox Engine</p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Control Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Environment Sandbox vs Live Production Toggle */}
            {setEnvironmentMode && (
              <button
                onClick={() => setEnvironmentMode(environmentMode === 'sandbox' ? 'live' : 'sandbox')}
                title={environmentMode === 'sandbox' ? 'Switch to Live Production Mode' : 'Switch to Sandbox Simulation Mode'}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  environmentMode === 'sandbox'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-300 shadow-sm shadow-amber-500/10'
                    : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 shadow-sm shadow-emerald-500/10'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${environmentMode === 'sandbox' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-wider">
                  {environmentMode === 'sandbox' ? 'Sandbox Mode' : 'Live Production'}
                </span>
              </button>
            )}

            {/* AI Co-Pilot Assistant Trigger */}
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin-slow" />
              <span>AI Co-Pilot</span>
            </button>

            {/* Autonomous Engine Toggle */}
            <button
              onClick={() => setIsAgentRunning(!isAgentRunning)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isAgentRunning
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}
            >
              {isAgentRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Engine Active</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Engine Paused</span>
                </>
              )}
            </button>

            {/* Device View Mode Switch (Mobile Android vs Desktop) */}
            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setDeviceView('desktop')}
                title="Desktop Enterprise Portal"
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  deviceView === 'desktop' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceView('mobile')}
                title="Android Enterprise App Frame"
                className={`p-1.5 rounded-md text-xs transition-colors ${
                  deviceView === 'mobile' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll Bar for Desktop Layout */}
        <div className="lg:hidden flex overflow-x-auto py-2 space-x-2 scrollbar-none border-t border-slate-800/80">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 ${
                activeTab === item.id
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-400 bg-slate-800/40 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};
