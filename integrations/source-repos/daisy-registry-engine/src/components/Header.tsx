import React from 'react';
import { ShieldCheck, Cpu, Database, Network, FileCheck2, Sparkles, Radio, Lock } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systemStatusScore: number;
  onLockOS?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, systemStatusScore, onLockOS }) => {
  const tabs = [
    { id: 'registry', label: 'AI Registry Inspector', icon: FileCheck2 },
    { id: 'solver', label: 'Dual-Track Solver', icon: Sparkles },
    { id: 'mesh', label: '54-Node Mesh Telemetry', icon: Network },
    { id: 'conflict', label: 'Conflict Analysis', icon: ShieldCheck },
    { id: 'b2b', label: 'B2B Economic Solver', icon: Cpu },
    { id: 'chat', label: 'Autonomous Communicator', icon: Radio },
    { id: 'compliance', label: 'Compliance & Audit', icon: Database },
  ];

  return (
    <header className="bg-[#0A0A10] border-b border-[#2A2A35] text-[#A0A0B0] sticky top-0 z-50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & System Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('registry')}>
            <div className="w-3 h-3 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]"></div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-[0.2em] text-[#E0E0F0] uppercase flex items-center gap-2">
                Daisy Haminja / <span className="text-[#00F0FF]">UAREFAKE Registry</span>
              </h1>
              <p className="text-[10px] font-mono text-[#505060] hidden sm:block">
                54-NODE MESH • 88 PARADOX DIALECTIC • ZK IP LOCKBOX
              </p>
            </div>
          </div>

          {/* Telemetry Stats Bar */}
          <div className="flex items-center gap-6 text-[10px] font-mono tracking-widest">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[#505060]">SYSTEM STATUS</span>
              <span className="text-[#00FF41] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF41] animate-pulse"></span>
                <span>ALL NODES NOMINAL</span>
              </span>
            </div>

            <div className="hidden md:flex flex-col items-end">
              <span className="text-[#505060]">ARCHITECTURE</span>
              <span className="text-white">ZK-MESH v4.0.2</span>
            </div>

            {onLockOS && (
              <button 
                onClick={onLockOS}
                className="flex flex-col items-end hover:opacity-80 transition-opacity text-left group"
                title="Click to lock system and enter Biometric Gateway"
              >
                <span className="text-[#505060] group-hover:text-[#FF0055]">REGISTRY LOCK</span>
                <span className="text-[#FFB800] group-hover:text-[#FF0055] font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#FF0055]" />
                  <span>ACTIVE (EAL6+)</span>
                </span>
              </button>
            )}
            {!onLockOS && (
              <div className="flex flex-col items-end">
                <span className="text-[#505060]">REGISTRY LOCK</span>
                <span className="text-[#FFB800] font-bold">ACTIVE (EAL6+)</span>
              </div>
            )}
          </div>

        </div>

        {/* Navigation Tab Bar */}
        <nav className="flex space-x-1.5 overflow-x-auto pb-2.5 scrollbar-none border-t border-[#1A1A25] pt-2 font-mono text-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded border transition-all whitespace-nowrap text-[11px] ${
                  isActive
                    ? 'bg-[#12121A] border-[#00F0FF] text-[#00F0FF] font-bold cyan-glow-sm'
                    : 'bg-[#0A0A10] border-[#1A1A25] text-[#808090] hover:text-[#E0E0F0] hover:bg-[#12121A]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#00F0FF]' : 'text-[#505060]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
