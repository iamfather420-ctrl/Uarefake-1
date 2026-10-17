import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  Bot, 
  Warehouse, 
  Sliders,
  Sparkles
} from 'lucide-react';
import { WarehouseItem, PurchaseOrder } from '../types';

interface InventoryViewProps {
  inventory: WarehouseItem[];
  onToggleAutoReplenish: (sku: string) => void;
  onTriggerReorderBatch: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onToggleAutoReplenish,
  onTriggerReorderBatch
}) => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');

  const filteredInventory = inventory.filter(item => {
    const matchesWarehouse = selectedWarehouse === 'All' || item.warehouse === selectedWarehouse;
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesWarehouse && matchesCategory;
  });

  const lowStockCount = inventory.filter(i => i.status === 'low_stock' || i.status === 'critical').length;
  const categories = Array.from(new Set(inventory.map(i => i.category)));

  return (
    <div className="space-y-5">
      
      {/* Header & Automated Replenishment Engine Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Multi-Warehouse Inventory & Replenishment</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time stock monitoring, safety threshold automation, and autonomous reorder dispatching.
          </p>
        </div>

        <button
          onClick={onTriggerReorderBatch}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Bot className="w-4 h-4" />
          <span>Execute Auto-Reorder Sweep</span>
        </button>
      </div>

      {/* Warehouse Selector & Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 border border-slate-800 rounded-xl">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-none">
          <Warehouse className="w-4 h-4 text-slate-400 shrink-0" />
          {['All', 'West Coast Hub', 'EU Logistics Depot', 'APAC Central Hub'].map((wh) => (
            <button
              key={wh}
              onClick={() => setSelectedWarehouse(wh)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedWarehouse === wh ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white bg-slate-950/60'
              }`}
            >
              {wh}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400">Category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Warehouse Stock Items</h3>
          <span className="text-xs text-amber-400 font-semibold">{lowStockCount} Items Below Safety Buffer</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                <th className="py-3 px-4">Item SKU & Description</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Safety Buffer</th>
                <th className="py-3 px-4">Unit Cost</th>
                <th className="py-3 px-4 text-center">Auto-Replenish</th>
                <th className="py-3 px-4 text-right">Stock Gauge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInventory.map((item) => {
                const stockPct = Math.min(100, Math.round((item.currentStock / (item.reorderPoint * 1.5)) * 100));
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{item.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">SKU: {item.sku} • {item.location}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{item.warehouse}</td>
                    <td className="py-3 px-4">
                      <span className={`font-bold font-mono ${
                        item.status === 'critical' ? 'text-red-400' :
                        item.status === 'low_stock' ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        {item.currentStock.toLocaleString()} units
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">
                      {item.safetyStock} / {item.reorderPoint} (Reorder)
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-mono">${item.unitCost.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleAutoReplenish(item.sku)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold border transition-all ${
                          item.autoReplenishEnabled
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {item.autoReplenishEnabled ? 'AUTO ON' : 'DISABLED'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="w-28 ml-auto">
                        <div className="flex justify-between text-[9px] text-slate-400 mb-1">
                          <span>Level</span>
                          <span>{stockPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              stockPct < 30 ? 'bg-red-500' : stockPct < 60 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${stockPct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
