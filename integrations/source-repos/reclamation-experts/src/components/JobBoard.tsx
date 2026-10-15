import { AlertCircle, Target } from 'lucide-react';
import { View } from '../App';

interface JobBoardProps {
  onNavigate: (view: View, target?: string) => void;
}

export function JobBoard({ onNavigate }: JobBoardProps) {
  const jobs = [
    {
      id: 'job-1',
      title: 'LOK Transition Enforcement (Curacao)',
      entity: 'CGCB • Curaçao',
      payout: '€2,500 Base + 2.5%',
      target: 'offshore-mirror.ag',
      description: 'Find domains using static Curaçao logos without a 2026-compliant Green Digital Seal. Any site without a live handshake at validator.gamingcontrol.curacao is a "Kill". Funded by the €47,450 base licensing fees pool. Max payout per lead: €10,000.',
      tags: ['Web Scrape', 'Handshake Audit', 'High Priority'],
    },
    {
      id: 'job-2',
      title: 'UKGC-2026-DSA-Sec4 (Multi-Platform Bots)',
      entity: 'UKGC • United Kingdom',
      payout: '£1,000 Base + 0.5%',
      target: 't.me/NoGamStopBot',
      description: 'Identify illicit bots across Telegram, WhatsApp, and Discord using keywords like "No GamStop" or "No ID Required". Produce Evidence Packs used to fine platforms under the Digital Services Act. Funded by the 2026 Illegal Market Budget.',
      tags: ['Social OSINT', 'Bot-ID Harvest', 'Cross-Platform'],
    },
    {
      id: 'job-whatsapp',
      title: 'WhatsApp Black-Market Gateway Audit',
      entity: 'MGCB • United States',
      payout: '$1,250 Base + 1%',
      target: 'wa.me/447512345678',
      description: 'Scan for automated WhatsApp Business accounts serving as unlicensed gambling gateways. Harvest Bot IDs and referral linkages to offshore mirrors. Funded by the State Enforcement Pooled Fund.',
      tags: ['WhatsApp', 'Gateway Audit', 'Referral Harvest'],
    },
    {
      id: 'job-discord',
      title: 'Discord Hidden Casino Discovery',
      entity: 'CGCB • Curaçao',
      payout: '€1,250 Base + 2.5%',
      target: 'discord.gg/shadow-bet-invite',
      description: 'Locate Discord servers hosting automated betting bots without age verification or jurisdictional compliance. Evidence used for Global Takedown Orders. Max payout: €15k per server cluster.',
      tags: ['Discord', 'Automated Betting', 'Kill Order'],
    },
    {
      id: 'job-3',
      title: 'MGCB Illegal Gambling Tip Program',
      entity: 'MGCB • Michigan',
      payout: '$1,500 Base + $5k',
      target: 'michigan-bet-mirror.io',
      description: 'Locate new offshore mirrors (.ag, .io, .lv) accepting wagers from MI residents without a state license. Document deposit process and identify operator. Bonus paid upon successful Cease & Desist enforcement.',
      tags: ['Geo-Spoofing', 'Deposit Audit', 'Offshore'],
    },
    {
      id: 'job-4',
      title: 'SEC Systemic Waste / Unregistered ICO',
      entity: 'SEC • United States',
      payout: '10-30% of Sanctions',
      target: '0x8f3c64a9c65d0522934cc02cc33013ba5557a19c',
      description: 'Identify unregistered token offerings and abandoned smart contracts holding systemic waste. Requires cryptographic proof of funds and contract ownership analysis. Average historical payout: $1.2M.',
      tags: ['Smart Contract', 'On-Chain Analysis', 'Whistleblower'],
    },
    {
      id: 'job-5',
      title: 'Dormant Bridge Re-Entry Audit',
      entity: 'Anonymous Identity & Financial • Sovereign Treasury',
      payout: '$15,000 Base + 20%',
      target: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      description: 'Analyze liquidity concentration in the USDC (Base) portal. Identify abandoned financial states subject to reclamation under Sovereign Treasury protocol SV-03. Requires cryptographic proof of contract abandonment.',
      tags: ['USDC Portal', 'Legacy Bridge', 'High Reward'],
    }
  ];

  return (
    <div className="space-y-4 md:space-y-[24px]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-xl md:text-[24px] font-black tracking-[4px] uppercase flex items-center gap-2 text-amber-metallic">
            <Target className="w-6 h-6 text-primary" />
            SOVEREIGN DIRECTS
          </h2>
          <p className="text-muted-foreground mt-1 text-xs md:text-[13px] uppercase tracking-widest font-bold">Pre-funded state pipelines. Direct payouts from Gaming Boards & Enforcement Agencies.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[1px] text-primary bg-primary/10 px-3 py-1.5 rounded border border-primary/20 glow-border">
          <AlertCircle className="w-4 h-4" />
          <span>Legit: State-Level Auth Required</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-[12px]">
        {jobs.map((job, idx) => (
          <div key={`job-post-${job.id}-${idx}`} className="bg-hive-lattice border border-primary/20 p-4 md:p-[24px] relative hover:border-primary transition-all group rounded-md glow-border">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3 flex-1 md:pr-4">
                <div className="text-[10px] uppercase text-primary tracking-[2px] mb-[4px] flex items-center gap-2 font-black">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
                  {job.entity}
                </div>
                <h3 className="font-sans text-lg md:text-[20px] font-bold tracking-[1px] mb-[12px] group-hover:text-primary transition-colors text-amber-metallic uppercase">{job.title}</h3>
                <p className="text-muted-foreground text-xs md:text-[13px] leading-relaxed max-w-3xl uppercase font-medium">
                  {job.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {job.tags.map((tag, idx) => (
                    <span key={`job-tag-${job.id}-${tag}-${idx}`} className="px-2 py-1 text-[10px] uppercase tracking-[1px] rounded bg-stone-900 border border-primary/10 text-muted-foreground font-black">
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Real Communication Links */}
                <div className="flex items-center gap-3 pt-4">
                  <a 
                    href={`https://t.me/${job.target.includes('t.me/') ? job.target.split('t.me/')[1] : ''}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 border border-sky-500/30 text-sky-500 rounded text-[10px] font-black uppercase hover:bg-sky-500 hover:text-white transition-all"
                  >
                    Telegram
                  </a>
                  <a 
                    href={`https://m.me/`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded text-[10px] font-black uppercase hover:bg-blue-500 hover:text-white transition-all"
                  >
                    Messenger
                  </a>
                  <a 
                    href={`https://www.google.com/search?q=${encodeURIComponent(job.title + ' ' + job.target)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 rounded text-[10px] font-black uppercase hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    Browser Search
                  </a>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-4 shrink-0 min-w-[200px]">
                <div className="text-right border-b border-primary/10 pb-4 w-full">
                  <p className="text-[10px] uppercase tracking-[1px] text-muted-foreground mb-1 font-bold">Bounty Payout</p>
                  <p className="font-mono text-xl md:text-[24px] text-primary font-black glow-text">{job.payout}</p>
                </div>
                
                <button 
                  onClick={() => {
                    if (window.confirm(`ESTABLISH MISSION PROTOCOL?\n\nTarget: ${job.target}\nExpected Yield: ${job.payout}\nSource Channel: ${job.entity}\n\nDo you confirm this real expected payout before submission?`)) {
                      onNavigate('scanner', job.target);
                    }
                  }}
                  className="w-full bg-primary text-background px-[16px] py-[12px] text-[10px] uppercase tracking-[2px] font-black cursor-pointer hover:scale-105 transition-all rounded shadow-[0_0_15px_rgba(245,158,11,0.3)] border-none"
                >
                  Accept & Scan Bloom
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
