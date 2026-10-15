// src/components/ItemCard.tsx
// High-contrast, responsive card representing a marketplace software item or solution

import React from 'react';
import { SolutionItem } from '../types';
import { CheckoutButton } from './CheckoutButton';
import { useStore } from '../context/StoreContext';
import { CheckCircle2, Star, Shield, Code, ArrowRight } from 'lucide-react';

interface ItemCardProps {
  item: SolutionItem;
  onSelect?: (item: SolutionItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onSelect }) => {
  const { addToCart, isItemUnlocked } = useStore();
  const unlocked = isItemUnlocked(item.id);

  return (
    <div
      id={`item-card-${item.id}`}
      className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/20 group"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
            LOT #{item.lotNumber || 1}
          </span>
          <div className="flex items-center space-x-1 text-amber-400 text-xs font-mono">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{(item.rating || 5.0).toFixed(1)}</span>
          </div>
        </div>

        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 line-clamp-1">
          {item.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {item.description || item.fullDescription}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {item.features?.slice(0, 3).map((feat, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-xs text-slate-400">Fixed Sovereign Price:</span>
          <div className="text-lg font-bold text-emerald-400 font-mono">
            ${item.price.toFixed(2)} <span className="text-xs text-slate-400 font-normal">USD</span>
          </div>
        </div>

        {unlocked ? (
          <div className="w-full py-2.5 px-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-center space-x-2 text-emerald-400 text-xs font-bold font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>UNLOCKED & PERSISTED IN NEON</span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => addToCart(item)}
              className="flex-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition-colors"
            >
              Add to Cart
            </button>
            <CheckoutButton
              lotId={item.id}
              itemTitle={item.title}
              amount={item.price}
              className="flex-1"
            />
          </div>
        )}
      </div>
    </div>
  );
};
