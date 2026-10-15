import React, { useState } from 'react';
import { ShieldCheck, User, Building, Smartphone, Network, Landmark, Flag, Crosshair, PenTool } from 'lucide-react';

interface RoleSelectionProps {
  onSelect: (role: string) => void;
}

export default function RoleSelection({ onSelect }: RoleSelectionProps) {
  const [customValue, setCustomValue] = useState('');

  const roles = [
    { id: 'Federal', title: 'Federal', desc: 'National Protocol Authority', icon: Landmark },
    { id: 'State', title: 'State', desc: 'Regional Governance', icon: Flag },
    { id: 'Military', title: 'Military', desc: 'Tactical Sub-Network', icon: Crosshair },
    { id: 'Institution', title: 'Institution', desc: 'Main Control & Routing Hub', icon: Building },
    { id: 'Business', title: 'Business', desc: 'Secure Mobile Operations', icon: Network },
    { id: 'Family', title: 'Family UI', desc: 'Overview of all family devices', icon: User },
    { id: 'Parent', title: 'Parent Device', desc: 'Manage security and settings', icon: ShieldCheck },
    { id: 'Child', title: 'Child Device', desc: 'Protected & monitored phone', icon: Smartphone },
  ];

  return (
    <div className="z-10 text-center space-y-8 max-w-7xl w-full p-6">
      <div>
         <ShieldCheck className="w-20 h-20 text-burnished-gold mx-auto mb-4" />
         <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-widest uppercase pb-2 inline-block drop-shadow-lg">
           Device Setup
         </h1>
         <p className="text-white/80 text-lg tracking-widest font-mono mt-4 uppercase">
           Choose Who Is Using This Device
         </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {roles.map((role) => (
           <button
             key={role.id}
             onClick={() => onSelect(role.id)}
             className="bg-black/40 backdrop-blur-md p-8 border border-white/10 hover:border-burnished-gold/60 hover:bg-white/5 hover:scale-105 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(212,175,55,0.2)] transition-all duration-300 text-left flex flex-col items-center text-center group rounded-3xl"
           >
              <role.icon className="w-10 h-10 text-white/50 group-hover:text-burnished-gold mb-4 transition-colors" />
              <span className="font-bold tracking-widest text-lg text-white group-hover:text-burnished-gold uppercase transition-colors">{role.title}</span>
              <span className="text-sm text-white/60 font-mono mt-3">{role.desc}</span>
           </button>
        ))}

        <div className="bg-black/40 backdrop-blur-md p-8 border border-white/10 hover:border-burnished-gold/60 hover:bg-white/5 transition-all duration-300 text-left flex flex-col items-center text-center rounded-3xl col-span-1 sm:col-span-2 lg:col-span-3 xl:col-span-1">
           <PenTool className="w-10 h-10 text-white/50 mb-4 transition-colors" />
           <span className="font-bold tracking-widest text-lg text-white uppercase mb-4">Custom Identity</span>
           <div className="flex flex-col w-full space-y-3 mt-auto">
             <input
               type="text"
               placeholder="Enter custom role..."
               value={customValue}
               onChange={(e) => setCustomValue(e.target.value)}
               className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-burnished-gold/60 transition-colors shadow-inner"
             />
             <button
               disabled={!customValue.trim()}
               onClick={() => { if(customValue.trim()) onSelect(customValue.trim()) }}
               className="w-full bg-burnished-gold/20 text-burnished-gold border border-burnished-gold/30 hover:bg-burnished-gold/40 disabled:opacity-50 disabled:grayscale transition-colors rounded-xl py-3 font-bold uppercase tracking-widest text-xs"
             >
               Initialize
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
