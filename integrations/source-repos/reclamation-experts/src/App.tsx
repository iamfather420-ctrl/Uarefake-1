/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { JobBoard } from './components/JobBoard';
import { Scanner } from './components/Scanner';
import { LeadTracker } from './components/LeadTracker';
import { Wallet } from './components/Wallet';
import { AutoCrawl } from './components/AutoCrawl';
import { TaxonomyExplorer } from './components/TaxonomyExplorer';
import { TreasuryControl } from './components/TreasuryControl';
import { RetroNetwork } from './components/RetroNetwork';
import { IdentityCore } from './components/IdentityCore';
import { SovereignOS } from './components/SovereignOS';
import { Genesis } from './components/Genesis';
import { Warden } from './components/Warden';
import { Onboarding } from './components/Onboarding';
import { Menu, Power, Bot } from 'lucide-react';
import { cn } from './lib/utils';

export type View = 'dashboard' | 'jobs' | 'scanner' | 'tracker' | 'wallet' | 'crawler' | 'taxonomy' | 'engine' | 'retro' | 'custom' | 'identity' | 'sovereign' | 'genesis' | 'warden';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('warhive_view');
      if (saved) return saved as View;
    }
    return 'dashboard';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBooted, setIsBooted] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('warhive_booted') === 'true';
    }
    return false;
  });

  // Unique Registration Number
  const [registrationId, setRegistrationId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('warhive_reg_id');
      if (!id) {
        id = `WH-REG-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
        localStorage.setItem('warhive_reg_id', id);
      }
      return id;
    }
    return 'WH-REG-INITIALIZING';
  });
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('warhive_onboarding_complete') !== 'true' && localStorage.getItem('warhive_booted') === 'true';
    }
    return false;
  });

  const handleOnboardingComplete = async (config: { payoutAddress: string; payoutAddressSol: string; strategy: 'PAYOUT' | 'TREASURY_GAS' }) => {
    try {
      await fetch('/api/payout-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          address: config.payoutAddress,
          addressSol: config.payoutAddressSol,
          strategy: config.strategy 
        })
      });
      setPayoutAddress(config.payoutAddress);
      setShowOnboarding(false);
      localStorage.setItem('warhive_onboarding_complete', 'true');
    } catch (err) {
      console.error('Failed to save onboarding config', err);
    }
  };
  const [balance, setBalance] = useState<number>(0);
  const [totalDiscovery, setTotalDiscovery] = useState<number>(0);
  const [manifestedValue, setManifestedValue] = useState<number>(0);
  const [treasuryFuel, setTreasuryFuel] = useState<number>(0);
  const [leadCount, setLeadCount] = useState<number>(0);
  const [payoutAddress, setPayoutAddress] = useState<string>('');
  const [scanTarget, setScanTarget] = useState<string>('');

  useEffect(() => {
    const handleViewChange = (e: any) => {
      if (e.detail) setCurrentView(e.detail);
    };
    window.addEventListener('changeView', handleViewChange);
    return () => window.removeEventListener('changeView', handleViewChange);
  }, []);

  useEffect(() => {
    if (!isBooted) return;

    const fetchData = () => {
      const handleJsonResponse = async (res: Response) => {
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.warn('[Anonymous Identity & Financial] Received non-JSON response. System may be warming up.');
          return null;
        }
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || `Server Error (${res.status})`);
        }
        return res.json();
      };

      fetch('/api/balance')
        .then(handleJsonResponse)
        .then(data => {
          if (!data) return;
          setBalance(data.available ?? 0);
          setTotalDiscovery(data.systemDiscoveryValue ?? 0);
          setTreasuryFuel(data.propellantPool ?? 0);
        })
        .catch(err => {
          if (err.message.includes('Server Error')) {
             console.error('[Anonymous Identity & Financial] Balance Sync Conflict:', err);
          }
        });

      fetch('/api/leads')
        .then(handleJsonResponse)
        .then(data => {
          if (!data) return;
          setLeadCount(data.filter((l: any) => l.status === 'verified' || l.status === 'paid').length);
        })
        .catch(err => {
           if (err.message.includes('Server Error')) {
             console.error('[Anonymous Identity & Financial] Leads Sync Conflict:', err);
           }
        });

      fetch('/api/activity')
        .then(handleJsonResponse)
        .then(data => {
          if (!data || !Array.isArray(data)) return;
          const total = data
            .filter((a: any) => a.settlement_strategy === 'PAYOUT' && a.status === 'paid')
            .reduce((acc: number, a: any) => acc + (a.payout_amount || 0), 0);
          setManifestedValue(total);
        })
        .catch(err => console.warn('Activity fetch failed', err));

      fetch('/api/payout-address')
        .then(handleJsonResponse)
        .then(data => {
          if (!data) return;
          setPayoutAddress(data.address || '');
        })
        .catch(err => {
           if (err.message.includes('Server Error')) {
             console.error('[Anonymous Identity & Financial] Config Sync Conflict:', err);
           }
        });
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    
    return () => clearInterval(interval);
  }, [isBooted]);

  const handleBoot = (isAuto = false) => {
    setIsBooted(true);
    localStorage.setItem('warhive_booted', 'true');
    
    if (localStorage.getItem('warhive_onboarding_complete') !== 'true') {
      setShowOnboarding(true);
    }
    
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const timeString = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    
    const text = `Welcome to your self sufficient kingdom Anons`;
    
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        
        const voices = window.speechSynthesis.getVoices();
        const englishVoices = voices.filter(v => v.lang.startsWith('en'));
        if (englishVoices.length > 0) {
          utterance.voice = englishVoices.find(v => v.name.includes('Google') || v.name.includes('Samantha')) || englishVoices[0];
        }
        
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn('[Anonymous Identity & Financial_OS] Speech synthesis inhibited by environment security policy.', err);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && isBooted) {
      localStorage.setItem('warhive_view', currentView);
    }
  }, [currentView, isBooted]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'jobs': return <JobBoard onNavigate={(view, target) => {
        if (target) setScanTarget(target);
        setCurrentView(view);
      }} />;
      case 'scanner': return <Scanner initialTarget={scanTarget} onClearTarget={() => setScanTarget('')} fuel={treasuryFuel} payoutAddress={payoutAddress} />;
      case 'tracker': return <LeadTracker />;
      case 'wallet': return <Wallet />;
      case 'crawler': return <AutoCrawl />;
      case 'taxonomy': return <TaxonomyExplorer />;
      case 'engine': return <TreasuryControl initialPayoutAddress={payoutAddress} />;
      case 'retro': return <RetroNetwork />;
      case 'identity': return <IdentityCore />;
      case 'sovereign': return <SovereignOS />;
      case 'genesis': return <Genesis />;
      case 'warden': return <Warden />;
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  if (!isBooted) {
    return (
      <div className="flex h-screen w-full bg-[#050505] items-center justify-center text-foreground p-4 overflow-hidden">
        {/* Cinematic Background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(57,255,20,0.03)_0%,transparent_70%)]" />
        <div className="absolute inset-0 bg-hive-lattice opacity-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="flex flex-col items-center gap-10 p-10 md:p-16 bg-black/60 border border-primary/30 rounded-2xl shadow-[0_0_50px_rgba(57,255,20,0.1)] backdrop-blur-xl max-w-3xl w-full text-center relative z-10"
        >
          <div className="relative">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
            />
            <Bot className="w-28 h-28 text-primary relative z-10 drop-shadow-[0_0_20px_#39FF14]" />
          </div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ letterSpacing: "1em", opacity: 0 }}
              animate={{ letterSpacing: "0.2em", opacity: 1 }}
              transition={{ duration: 2, delay: 0.5 }}
              className="font-sans text-xl md:text-5xl font-black uppercase text-amber-metallic tracking-[0.2em] drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]"
            >
              Anonymous Identity & Financial
            </motion.h1>
            <div className="flex flex-col items-center gap-1">
              <span className="text-red-500 font-black text-2xl md:text-3xl tracking-[10px] uppercase opacity-80">UBI ENGINE</span>
              <span className="text-white/40 font-mono text-[10px] md:text-xs tracking-[4px] uppercase max-w-md leading-relaxed mt-4">
                "The Universal Basic Income Generator. Powered by the next generation of digital identity and financial infrastructure, 10 years ahead of time."
              </span>
            </div>
          </div>
          
          <div className="w-full max-w-md space-y-6">
            <button 
              onClick={() => handleBoot()}
              className="group relative w-full flex items-center justify-center gap-4 bg-primary text-black px-10 py-5 text-xl uppercase tracking-[4px] font-black hover:scale-[1.02] active:scale-95 transition-all rounded-lg shadow-[0_0_30px_rgba(57,255,20,0.4)] overflow-hidden"
            >
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shimmer_1.5s_infinite]" />
              <Power className="w-6 h-6" />
              Initialize Identity & UBI
            </button>
            <div className="flex justify-between text-[9px] font-mono text-primary/40 uppercase tracking-widest">
              <span>Status: Ready</span>
              <span>Uptime: Persistent</span>
              <span>Security: Verified</span>
            </div>
          </div>
        </motion.div>

        {/* Floating Code Snippets for "Master" vibe */}
        <div className="absolute inset-0 pointer-events-none opacity-5 font-mono text-[10px] overflow-hidden select-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: "100vh" }}
              animate={{ y: "-100vh" }}
              transition={{ 
                duration: 20 + Math.random() * 20, 
                repeat: Infinity, 
                delay: Math.random() * 20,
                ease: "linear"
              }}
              style={{ left: `${Math.random() * 100}%` }}
              className="absolute text-primary"
            >
              {Math.random().toString(16).substring(2, 10).toUpperCase()}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-steel-plate overflow-hidden text-foreground">
      <AnimatePresence>
        {isBooted && showOnboarding && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar 
          currentView={currentView} 
          onViewChange={(v) => {
            setCurrentView(v);
            setIsMobileMenuOpen(false);
          }} 
          onShowTutorial={() => setShowOnboarding(true)}
        />
      </div>
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden p-4 md:p-8 gap-4 md:gap-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-4 shrink-0 gap-4">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden text-primary hover:bg-primary/10 p-2 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="font-sans text-2xl md:text-4xl font-black tracking-[2px] uppercase text-3d-gold flex items-center gap-3">
                <Bot className="w-8 h-8 md:w-10 md:h-10 text-3d-gold animate-pulse" />
                Anonymous Identity & Financial
              </h1>
              <div className="mt-2 flex flex-col">
                <span className="text-outline-red font-black text-2xl md:text-3xl tracking-[6px] uppercase">IDENTITY SECURED</span>
                <span className="text-black-metallic font-bold text-[11px] md:text-sm tracking-[2px] uppercase mt-1">Autonomous UBI Generation Engine</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
            <div className="text-left md:text-right">
              <div className="text-[10px] uppercase text-muted-foreground tracking-[1px]">Your Available UBI</div>
              <div className="font-mono text-lg md:text-xl text-primary glow-text">
                ${(balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase text-amber-500 font-black tracking-[1px]">Total Generating Power</div>
              <div className="font-mono text-lg md:text-xl text-amber-500 glow-text">
                ${(totalDiscovery ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto pb-4">
          {renderView()}
        </div>

        <footer className="flex flex-col md:flex-row justify-between items-center gap-2 py-3 text-[10px] md:text-[11px] text-muted-foreground border-t border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#39FF14]"></div>
            <span className="uppercase tracking-widest">System Operational: Handshake Validators Online</span>
          </div>
          <div className="font-mono text-center md:text-right">
            ZK-PROOF GENERATOR: <span className="text-primary glow-text">READY</span> | SEED_HASH: 0x82f...a10e
          </div>
        </footer>
      </main>
    </div>
  );
}

