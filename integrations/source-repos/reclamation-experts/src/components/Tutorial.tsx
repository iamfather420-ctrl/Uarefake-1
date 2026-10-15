import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, ShieldAlert, Zap, Search, Wallet, Bot, Activity, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  title: string;
  description: string;
  icon: any;
  highlight?: string;
  action?: string;
}

const STEPS: Step[] = [
  {
    title: "Anonymous Identity & Financial PROTOCOL",
    description: "Welcome to the Unified Asset Reclamation Engine. You are now part of the D.A.R.E. initiative—Decentralized Asset Reclamation Experts. Our mission is to identify systemic waste and manifest it into usable capital.",
    icon: ShieldAlert,
    highlight: "MISSION_OBJECTIVE"
  },
  {
    title: "DISCOVERY LAYER",
    description: "Use the 'Discovery Scanner' or 'Auto-Crawl' modules to sweep Solana Mainnet for abandoned financial states, orphaned smart contracts, and MEV residues. Every hit is a potential bounty.",
    icon: Search,
    highlight: "SCAN_VECTORS"
  },
  {
    title: "EVIDENCE VAULT",
    description: "Verified hits appear in your 'Evidence Vault'. Here, the system verifies the cryptographic proof of each lead. Once verified, assets become eligible for settlement.",
    icon: Activity,
    highlight: "VERIFICATION_LOGIC"
  },
  {
    title: "SETTLEMENT ENGINE",
    description: "Choose your manifestation path. 'Standard' uses Treasury SOL for gas, while 'Relay' (Gasless) uses the Synthetic Fuel protocol with a small 5% tax. No upfront SOL required for Relay.",
    icon: Zap,
    highlight: "LIQUIDITY_BRIDGE"
  },
  {
    title: "TREASURY CONTROL",
    description: "Finalize your setup by designating a Payout Address or funneling funds into 'Treasury Gas' to self-fund the engine's propellant. You are now operational.",
    icon: Wallet,
    highlight: "SYSTEM_READY",
    action: "READY"
  }
];

export function Tutorial({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        className="bg-card/90 border-2 border-primary/30 w-full max-w-[550px] rounded-lg shadow-[0_0_50px_rgba(57,255,20,0.15)] overflow-hidden relative"
      >
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-muted flex">
          {STEPS.map((_, i) => (
            <div 
              key={`tutorial-step-dot-${i}`} 
              className={cn(
                "h-full transition-all duration-500",
                i <= currentStep ? "bg-primary w-full" : "w-0"
              )} 
            />
          ))}
        </div>

        <div className="p-8 md:p-12 space-y-8 min-h-[450px] flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col items-center text-center space-y-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                <step.icon className="w-16 h-16 text-primary relative z-10" />
              </div>

              <div className="space-y-2 w-full">
                <div className="flex items-center justify-center gap-2">
                  <span className="w-8 h-[1px] bg-primary/30" />
                  <span className="text-[10px] uppercase font-mono tracking-[4px] text-primary">Step 0{currentStep + 1}</span>
                  <span className="w-8 h-[1px] bg-primary/30" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black tracking-[2px] uppercase text-foreground">
                  {step.title}
                </h2>
              </div>

              <p className="text-[14px] md:text-[15px] leading-relaxed text-muted-foreground font-medium max-w-[400px]">
                {step.description}
              </p>

              <div className="bg-primary/5 border border-primary/20 px-4 py-2 rounded font-mono text-[10px] uppercase tracking-widest text-primary font-bold">
                SYSTEM_STATUS: {step.highlight}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between gap-4 pt-4 border-t border-border/30">
            <button 
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-2 px-4 py-3 rounded text-[11px] font-bold uppercase transition-all",
                currentStep === 0 ? "opacity-0 pointer-events-none" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
              Return
            </button>

            <button 
              onClick={handleNext}
              className="flex-1 max-w-[200px] flex items-center justify-center gap-3 bg-primary text-background px-6 py-4 rounded text-[12px] font-black uppercase tracking-[1px] hover:opacity-90 active:scale-95 transition-all shadow-lg"
            >
              {currentStep === STEPS.length - 1 ? "Initialize Protocol" : "Next Data-Point"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary/40 rounded-bl-lg" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary/40 rounded-br-lg" />
      </motion.div>
    </div>
  );
}
