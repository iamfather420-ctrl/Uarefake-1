import { Archive, Search, ChevronRight, Activity, Zap, Shield, Database } from 'lucide-react';
import { WASTE_TAXONOMY } from '../constants/taxonomy';
import { motion } from 'motion/react';
import { useState } from 'react';

export function TaxonomyExplorer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(WASTE_TAXONOMY[0].title);

  const filteredTaxonomy = WASTE_TAXONOMY.filter(cat => 
    cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.subItems.some(item => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const activeCategory = WASTE_TAXONOMY.find(c => c.title === selectedCategory) || WASTE_TAXONOMY[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-sans text-[24px] font-bold tracking-[2px] uppercase flex items-center gap-2">
            <Archive className="w-6 h-6 text-primary" />
            Systemic Waste Taxonomy
          </h2>
          <p className="text-muted-foreground mt-1 text-[13px]">Encyclopedic classification of permissionless financial efficiencies.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search taxonomy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-border pl-10 pr-4 py-2 text-[12px] focus:outline-none focus:border-primary rounded transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category List */}
        <div className="lg:col-span-4 space-y-2">
          {filteredTaxonomy.map((cat, idx) => (
            <button
              key={`${cat.title}-${idx}`}
              onClick={() => setSelectedCategory(cat.title)}
              className={`w-full text-left p-4 border transition-all duration-200 rounded group ${
                selectedCategory === cat.title 
                  ? 'bg-primary/10 border-primary text-primary shadow-[0_0_15px_rgba(57,255,20,0.1)]' 
                  : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-[1px]">Category {String(idx + 1).padStart(2, '0')}</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedCategory === cat.title ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
              </div>
              <h3 className="font-sans font-bold text-[15px]">{cat.title}</h3>
            </button>
          ))}
          
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-md">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Shield className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-[1px]">Protocol Status</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Every item in this taxonomy represents a **permissionless function**. The Solana Virtual Machine (EVM) allows any authenticated address to interact with these states provided the correct cryptographic logic is supplied.
            </p>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <motion.div 
            key={selectedCategory}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card border border-border p-6 md:p-8 rounded-lg relative overflow-hidden flex-1"
          >
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Database className="w-48 h-48" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/20 rounded-full">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-sans font-bold tracking-tight text-foreground">{activeCategory.title}</h2>
                  <p className="text-[14px] text-muted-foreground">{activeCategory.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {activeCategory.subItems.map((item, sIdx) => (
                  <div key={`${item.title}-${sIdx}`} className="p-4 bg-background border border-border/50 rounded hover:border-primary/30 transition-colors group">
                    <div className="flex items-start gap-3">
                      <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                      <div>
                        <h4 className="font-sans font-bold text-[14px] mb-1 text-primary/90">{item.title}</h4>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Logic Snippet Hook */}
          <div className="bg-black text-[#39FF14] p-4 rounded font-mono text-[11px] border border-primary/20 overflow-hidden relative group">
            <div className="flex items-center justify-between mb-3 border-b border-primary/20 pb-2">
              <span className="opacity-60 uppercase text-[9px] tracking-[2px]">Core Logic Leak: Private RPC Logic</span>
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
              </div>
            </div>
            <pre className="opacity-80 group-hover:opacity-100 transition-opacity">
{`# Logic: Searchers identify the 'price impact' in the mempool.
# Trigger: Submit a 'bundle' via Flashbots (Private RPC).

def check_arbitrage(pool_a, pool_b):
    price_a = pool_a.get_price()
    price_b = pool_b.get_price()
    if price_a < price_b:
        # Execute atomic: Buy A -> Sell B
        execute_swap(amount, [pool_a, pool_b])`}
            </pre>
            <div className="absolute bottom-2 right-4 text-[9px] uppercase tracking-[1px] opacity-40 group-hover:opacity-100 transition-opacity">
              Anonymous Identity & Financial_KERNEL_v1
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
