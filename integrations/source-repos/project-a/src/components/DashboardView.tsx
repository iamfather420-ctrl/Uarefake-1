import React from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle2, 
  Bot, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  FileCheck2,
  Clock,
  GitMerge,
  Cpu,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { PurchaseOrder, Invoice, WarehouseItem, Vendor, ExecutionLog } from '../types';

interface DashboardViewProps {
  orders: PurchaseOrder[];
  invoices: Invoice[];
  inventory: WarehouseItem[];
  vendors: Vendor[];
  logs: ExecutionLog[];
  onNavigate: (view: any) => void;
  isAgentRunning: boolean;
}

const cashFlowData = [
  { month: 'Mar', inflow: 120000, outflow: 85000 },
  { month: 'Apr', inflow: 145000, outflow: 92000 },
  { month: 'May', inflow: 130000, outflow: 78000 },
  { month: 'Jun', inflow: 165000, outflow: 110000 },
  { month: 'Jul', inflow: 180000, outflow: 125000 },
  { month: 'Aug', inflow: 210000, outflow: 138000 },
];

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  invoices,
  inventory,
  vendors,
  logs,
  onNavigate,
  isAgentRunning
}) => {
  const pendingOrders = orders.filter(o => o.status === 'pending_approval' || o.status === 'submitted');
  const criticalStock = inventory.filter(i => i.status === 'low_stock' || i.status === 'critical');
  const highRiskVendors = vendors.filter(v => v.riskLevel === 'high' || v.riskLevel === 'medium');
  const invoiceDiscrepancies = invoices.filter(i => i.status === 'discrepancy');

  const totalProcurementSpend = orders.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="space-y-5">
      
      {/* Executive Banner & Autonomous Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Autonomous Operations Center</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Enterprise B2B Automation Control</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              AI agents are actively orchestrating Daisy Chain workflows, Paradox Box contract solvers, and 3-way invoice matching.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800 self-start sm:self-auto">
            <div className={`p-2 rounded-lg ${isAgentRunning ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-slate-300">Autonomous Engine</div>
              <div className={`text-xs font-bold ${isAgentRunning ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isAgentRunning ? 'Running (0s Latency)' : 'Engine Paused'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1 - Daisy Chain */}
        <div 
          onClick={() => onNavigate('daisy')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-emerald-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Daisy Chain Workflows</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <GitMerge className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-100">2 Active Chains</div>
          <div className="flex items-center space-x-1 text-[11px] text-emerald-400 mt-1">
            <Zap className="w-3 h-3" />
            <span>170 Daily Executions</span>
          </div>
        </div>

        {/* Metric 2 - Paradox Box Engine */}
        <div 
          onClick={() => onNavigate('paradox')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-amber-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Paradox Box Engine</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 group-hover:scale-110 transition-transform">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-100">$5,060 Saved</div>
          <div className="flex items-center space-x-1 text-[11px] text-amber-400 mt-1">
            <ShieldAlert className="w-3 h-3" />
            <span>3 Discrepancies Solved</span>
          </div>
        </div>

        {/* Metric 3 - Active Spend */}
        <div 
          onClick={() => onNavigate('procurement')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-cyan-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Active Spend (PO)</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-100">${totalProcurementSpend.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="flex items-center space-x-1 text-[11px] text-cyan-400 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>{orders.length} Active Orders</span>
          </div>
        </div>

        {/* Metric 4 - Reorder Alerts */}
        <div 
          onClick={() => onNavigate('inventory')}
          className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 sm:p-4 hover:border-red-500/40 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium">Reorder Alerts</span>
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-slate-100">{criticalStock.length} SKUs</div>
          <div className="flex items-center space-x-1 text-[11px] text-red-400 mt-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Below Safety Buffer</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Cash Flow Chart + Live Autonomous Agent Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Cash Flow Forecast Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Consolidated Cash Flow & AP Outflow</h3>
              <p className="text-xs text-slate-400">Monthly B2B Receivables vs Supplier Outflows ($ USD)</p>
            </div>
            <button 
              onClick={() => onNavigate('finance')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-medium"
            >
              <span>Full Finance</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Area type="monotone" dataKey="inflow" name="Inflows (AR)" stroke="#10b981" fillOpacity={1} fill="url(#colorInflow)" strokeWidth={2} />
                <Area type="monotone" dataKey="outflow" name="Supplier AP Outflow" stroke="#ef4444" fillOpacity={1} fill="url(#colorOutflow)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Agent Logs Stream (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col h-80 lg:h-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">Live Execution Log</h3>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
              REALTIME
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
            {logs.map((log) => (
              <div 
                key={log.id} 
                className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-emerald-400 text-[11px]">{log.agentName}</span>
                  <span className="text-[9px] text-slate-500 font-mono">{log.timestamp.split(' ')[1]}</span>
                </div>
                <p className="text-slate-300 text-[11px] leading-snug">{log.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgent B2B Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* Pending PO Approvals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Pending Autonomous Purchase Orders</span>
            </h3>
            <span className="text-xs text-slate-400">{pendingOrders.length} Ready</span>
          </div>

          <div className="space-y-2.5">
            {pendingOrders.map((po) => (
              <div key={po.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-200">{po.poNumber}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Auto-Drafted
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{po.vendorName}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-100">${po.totalAmount.toLocaleString()}</div>
                  <button 
                    onClick={() => onNavigate('procurement')}
                    className="text-[11px] text-emerald-400 hover:underline font-medium"
                  >
                    Review PO &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Replenishment Watchlist */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-100 flex items-center space-x-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Critical Inventory Watchlist</span>
            </h3>
            <span className="text-xs text-slate-400">{criticalStock.length} Low Stock</span>
          </div>

          <div className="space-y-2.5">
            {criticalStock.map((item) => (
              <div key={item.id} className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-200">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">SKU: {item.sku} • {item.warehouse}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-amber-400">{item.currentStock} / {item.reorderPoint} units</div>
                  <button 
                    onClick={() => onNavigate('inventory')}
                    className="text-[11px] text-amber-400 hover:underline font-medium"
                  >
                    Trigger Reorder &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
