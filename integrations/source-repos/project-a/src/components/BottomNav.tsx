import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Users, 
  DollarSign, 
  Zap,
  GitMerge,
  Cpu,
  ShoppingBag,
  ShieldCheck,
  Brain,
  Code,
  Bot
} from 'lucide-react';
import { ViewMode } from '../types';

interface BottomNavProps {
  activeTab: ViewMode;
  setActiveTab: (tab: ViewMode) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs: { id: ViewMode; label: string; icon: React.ReactNode }[] = [
    { id: 'daisy_chat', label: 'Daisy Chat', icon: <Bot className="w-4 h-4 text-purple-300" /> },
    { id: 'marketplace', label: 'Market', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'agent_brain', label: 'Brain', icon: <Brain className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'daisy', label: 'Daisy', icon: <GitMerge className="w-4 h-4" /> },
    { id: 'paradox', label: 'Paradox', icon: <Cpu className="w-4 h-4" /> },
    { id: 'jit_build', label: 'Blaze 1.0', icon: <Code className="w-4 h-4" /> },
    { id: 'mmtai', label: 'MMTAI', icon: <ShieldCheck className="w-4 h-4" /> },
  ];


  return (
    <div className="sticky bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 py-1.5 px-1 z-30 flex items-center justify-around select-none">
      {tabs.map((t) => {
        const isActive = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive ? 'text-emerald-400 font-medium' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className={`p-1 rounded-lg ${isActive ? 'bg-emerald-500/10' : ''}`}>
              {t.icon}
            </div>
            <span className="text-[10px] mt-0.5">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
