import React from 'react';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  Percent, 
  Calendar,
  Zap,
  ArrowDownRight,
  ShieldAlert
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Invoice } from '../types';

interface FinanceViewProps {
  invoices: Invoice[];
  onAddLog: (log: any) => void;
}

const agingData = [
  { bracket: 'Current (0-30d)', amount: 142000 },
  { bracket: '31-60 Days', amount: 34200 },
  { bracket: '61-90 Days', amount: 8900 },
  { bracket: '90+ Days', amount: 0 },
];

export const FinanceView: React.FC<FinanceViewProps> = ({ invoices, onAddLog }) => {
  const totalAP = invoices.reduce((acc, curr) => acc + (curr.status !== 'paid' ? curr.amount : 0), 0);
  const totalDiscountsCaptured = 1498.00;

  const handleExecutePaymentSweep = () => {
    onAddLog({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      agentName: 'AP Treasury Agent',
      actionType: 'Early Discount Payout',
      details: 'Executed automated early payment sweep for matched invoices. Captured $258 in 2/10 Net 30 settlement discounts.',
      status: 'success'
    });
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Accounts Payable / Receivable & Cash Optimizer</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated payment terms enforcement, early settlement discount capture, and cash flow reconciliation.
          </p>
        </div>

        <button
          onClick={handleExecutePaymentSweep}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>Execute Early Payment Discount Sweep</span>
        </button>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Total Outstanding AP</div>
          <div className="text-xl font-bold text-slate-100">${totalAP.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Net 30/45 Terms Active</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Early Settlement Savings Captured</div>
          <div className="text-xl font-bold text-emerald-400">${totalDiscountsCaptured.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center space-x-1">
            <Percent className="w-3 h-3" />
            <span>2% Cash Discount Yield</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Working Capital Efficiency</div>
          <div className="text-xl font-bold text-slate-100">98.2%</div>
          <div className="text-[11px] text-teal-400 mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>Zero Late Payment Penalties</span>
          </div>
        </div>
      </div>

      {/* Invoice Aging Bar Chart + Payment Release Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Aging Breakdown Chart (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-slate-100 mb-3">AP Invoice Aging Bracket Breakdown</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData}>
                <XAxis dataKey="bracket" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val: any) => [`$${Number(val).toLocaleString()}`, 'Outflow Amount']}
                />
                <Bar dataKey="amount" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scheduled Payouts List (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-100 mb-3 flex items-center justify-between">
              <span>SOX 404 Double-Entry Ledger</span>
              <Calendar className="w-4 h-4 text-emerald-400" />
            </h3>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>DR: 1200 - Inventory Hardware</span>
                  <span className="text-emerald-400 font-bold">+$48,500.00</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>CR: 2000 - Accounts Payable</span>
                  <span className="text-amber-400 font-bold">-$48,500.00</span>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-900">
                  Voucher: JV-SOX-2026-0812 • Verified by 3-Way Match
                </div>
              </div>

              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>DR: 2000 - Accounts Payable</span>
                  <span className="text-emerald-400 font-bold">+$37,500.00</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>CR: 1010 - Cash Reserve (ISO 20022)</span>
                  <span className="text-amber-400 font-bold">-$36,750.00</span>
                </div>
                <div className="flex justify-between text-emerald-400 text-[10px]">
                  <span>CR: 4900 - Early Discount Earned</span>
                  <span>-$750.00</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onAddLog({
                id: `LOG-${Date.now()}`,
                timestamp: new Date().toLocaleString(),
                agentName: 'SOX 404 Ledger Engine',
                actionType: 'Double-Entry Post Verified',
                details: 'Posted $86,000 in balanced AP/AR journal entries to ERP general ledger with SOX 404 hash compliance.',
                status: 'success'
              });
            }}
            className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Post ERP Double-Entry Journal</span>
          </button>
        </div>

      </div>

    </div>
  );
};
