import { ElementType } from 'react';
import { LayoutDashboard, Target, ScanSearch, ListChecks, Wallet, Bot, Archive, Cpu, HelpCircle, Fingerprint, Power, Zap, History, ShieldCheck } from 'lucide-react';
import { View } from '../App';
import { cn } from '../lib/utils';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onShowTutorial?: () => void;
}

export function Sidebar({ currentView, onViewChange, onShowTutorial }: SidebarProps) {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const navItems: { id: View; label: string; icon: ElementType }[] = [
    { id: 'genesis', label: 'History & Logs', icon: History },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Available Jobs', icon: Target },
    { id: 'engine', label: 'UBI Engine', icon: Cpu },
    { id: 'scanner', label: 'Web Scanner', icon: ScanSearch },
    { id: 'crawler', label: 'Auto Scanner', icon: Bot },
    { id: 'tracker', label: 'Earnings Tracker', icon: ListChecks },
    { id: 'identity', label: 'Digital Identity', icon: Fingerprint },
    { id: 'wallet', label: 'My Wallets', icon: Wallet },
  ];

  return (
    <aside className="w-64 h-full border-r border-border bg-card flex flex-col shrink-0 py-6 px-4 md:py-[30px] md:px-[20px] overflow-y-auto no-scrollbar">
      <div className="mb-[50px] hidden md:block">
        <h1 className="font-sans text-[24px] font-black text-amber-metallic tracking-[4px] uppercase glow-text flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary animate-pulse" />
          Anonymous Identity & Financial
        </h1>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={`nav-item-${item.id}-${idx}`}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded text-[13px] uppercase tracking-[1px] transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary border-l-2 border-primary glow-border" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground border-l-2 border-transparent"
              )}
            >
              <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
              {item.label}
            </button>
          );
        })}
      </nav>
      
      <div className="mt-auto pt-4 space-y-3">
        {onShowTutorial && (
          <button 
            onClick={onShowTutorial}
            className="w-full flex items-center gap-3 px-4 py-2 text-[11px] uppercase tracking-[1px] text-muted-foreground hover:text-primary transition-colors border border-dashed border-border hover:border-primary/50 rounded"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Protocol Training
          </button>
        )}

        <button 
          onClick={() => open()}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded uppercase font-black text-[10px] tracking-widest transition-all shadow-inner",
            isConnected 
              ? "bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20" 
              : "bg-primary text-black hover:opacity-90 shadow-[0_0_15px_rgba(57,255,20,0.3)] animate-pulse"
          )}
        >
          {isConnected ? <Power className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
          {isConnected ? 'Sync Active' : 'Engage Wallet'}
        </button>

        <div className="bg-secondary/50 rounded p-3 border border-border">
          <p className="text-[9px] text-muted-foreground font-mono mb-1 uppercase tracking-tighter opacity-70">
            {isConnected ? 'CONNECTED_RECOVERY_NODE' : 'LOCAL_EPHEMERAL_ID'}
          </p>
          <p className="text-[11px] font-mono text-primary glow-text truncate tracking-tighter">
            {isConnected ? address : (localStorage.getItem('warhive_reg_id')?.substring(0, 8) || '0x...')}
          </p>
        </div>
      </div>
    </aside>
  );
}
