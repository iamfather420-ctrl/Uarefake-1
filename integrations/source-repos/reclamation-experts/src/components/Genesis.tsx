import { motion } from 'motion/react';
import { Bot, ShieldAlert, Cpu, Activity, Radio, Terminal, Globe, HardDrive, Zap, Star, Award, History, Heart, Fingerprint, Shield } from 'lucide-react';
import { cn } from '../lib/utils';

export function Genesis() {
  const achievements = [
    { 
      title: "The Exhaustion Protocol", 
      desc: "Every machine pushed to the breaking point. 20-hour sessions since Christmas. A monument to human endurance.",
      icon: Cpu,
      color: "text-blue-400"
    },
    { 
      title: "Real-World Reclamation", 
      desc: "Not a simulation. Genuine on-chain settlements through the App Treasury. Reclaiming sovereign assets from the void.",
      icon: Zap,
      color: "text-amber-400"
    },
    { 
      title: "The Great Discovery", 
      desc: "Identifying systemic waste across sectors that others ignored. Converting lost fuel into actionable intelligence.",
      icon: Star,
      color: "text-primary"
    }
  ];

  return (
    <div className="space-y-8 md:space-y-[40px] p-4 md:p-[60px] max-w-5xl mx-auto h-[calc(100vh-120px)] overflow-y-auto no-scrollbar">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-[0.3em] uppercase">
          <History className="w-3 h-3" /> Origin Story: Project Anonymous Identity & Financial
        </div>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase text-3d-gold drop-shadow-[0_0_20px_rgba(245,158,11,0.3)]">
          The Greatest Achievement
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground/80 max-w-3xl mx-auto font-mono leading-relaxed italic">
          "They tried to stop us. They tried to say it wasn't important. They were wrong. This is the truth of what we have built, forged in the fires of 20-hour days and pure competitiveness."
        </p>
      </motion.div>

      {/* The Manifesto Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative p-8 rounded-lg border border-primary/20 bg-black/40 backdrop-blur-xl overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-opacity">
          <Bot className="w-32 h-32 text-primary" />
        </div>
        
        <div className="relative z-10 space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-primary uppercase tracking-wider">
            <Award className="w-6 h-6" /> The Sovereign Creed
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed font-mono text-sm md:text-base">
            <p>
              Anonymous Identity & Financial was not born in a boardroom. It was born in the exhaustion of every computer used in its creation. Since Christmas 2025, a singular vision has driven this protocol: The complete reclamation of digital waste into sovereign fuel.
            </p>
            <p>
              While others built simulations and toys, we built **Real-World Settlements**. Every transaction verified on Solana Mainnet is a victory against the entropy of the old system. We don't play for points; we play for the future of decentralized finance.
            </p>
            <p className="text-primary font-bold">
              This is the greatest achievement because it is real, it is sovereign, and it is ours.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid of Honor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {achievements.map((item, idx) => (
          <motion.div 
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + (idx * 0.1) }}
            className="p-6 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all group"
          >
            <item.icon className={cn("w-8 h-8 mb-4 group-hover:scale-110 transition-transform", item.color)} />
            <h3 className="text-sm font-bold uppercase tracking-widest mb-2 text-white">{item.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-mono">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Legacy Ledger / Verification */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="p-8 rounded-lg border-2 border-primary/30 bg-primary/5 backdrop-blur-md relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Shield className="w-24 h-24 text-primary" />
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-xl font-black text-primary uppercase tracking-[4px] flex items-center gap-3">
            <Fingerprint className="w-6 h-6" /> Sovereign Verification Ledger
          </h2>
          <div className="space-y-4 font-mono text-xs md:text-sm">
            <div className="flex justify-between border-b border-primary/20 pb-2">
              <span className="text-muted-foreground uppercase">Identity Status</span>
              <span className="text-primary font-bold">VERIFIED: LEGAL SUCCESSOR</span>
            </div>
            <div className="flex justify-between border-b border-primary/20 pb-2">
              <span className="text-muted-foreground uppercase">System Authority</span>
              <span className="text-primary font-bold">TOTAL_SOVEREIGN_OVERRIDE</span>
            </div>
            <div className="flex justify-between border-b border-primary/20 pb-2">
              <span className="text-muted-foreground uppercase">Origin Code Inheritance</span>
              <span className="text-primary font-bold">AUTHENTICATED (Logic Boy v1.0)</span>
            </div>
            <div className="flex justify-between border-b border-primary/20 pb-2">
              <span className="text-muted-foreground uppercase">Jurisdiction</span>
              <span className="text-primary font-bold">STATE_LEVEL_AUTONOMY</span>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground italic uppercase font-bold tracking-wider pt-2">
            "Every bit of this build, from discovery to wallet, is exactly as it's been built. Effortless. Verifiable. Working."
          </p>
        </div>
      </motion.div>

      {/* The "Truth" Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        className="border-t border-white/10 pt-10 text-center space-y-6"
      >
        <div className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.5em]">
          <ShieldAlert className="w-4 h-4" /> Final Transmission
        </div>
        <div className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto italic font-serif">
          "Don't let them make it look like something bad. They are afraid of its importance. This app is designed to make jaws drop. When you preview this, feel the weight of every session, every hour, and every victory."
        </div>
        <div className="flex justify-center gap-4 py-4">
          <div className="flex flex-col items-center gap-1">
            <Heart className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Soul-Sync Active</span>
          </div>
        </div>
      </motion.div>

      {/* Signature */}
      <div className="flex justify-center pb-20">
        <div className="h-px w-20 bg-primary/20 self-center" />
        <span className="px-6 text-[10px] font-mono uppercase tracking-[1em] text-primary/40">
          Anonymous Identity & Financial_GENESIS_v1.0
        </span>
        <div className="h-px w-20 bg-primary/20 self-center" />
      </div>
    </div>
  );
}
