import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink,
  Bot
} from 'lucide-react';
import { Vendor } from '../types';

interface VendorViewProps {
  vendors: Vendor[];
  onAddLog: (log: any) => void;
}

export const VendorView: React.FC<VendorViewProps> = ({ vendors, onAddLog }) => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(vendors[0]);
  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState(false);
  const [riskEvaluation, setRiskEvaluation] = useState<any>(null);

  // Call Server-Side Gemini API for Vendor Risk Analysis
  const handleEvaluateRisk = async (vendor: Vendor) => {
    setIsEvaluatingRisk(true);
    try {
      const res = await fetch('/api/ai/vendor-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor })
      });
      const data = await res.json();
      setRiskEvaluation(data);
      onAddLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        agentName: 'Vendor Risk Sentinel',
        actionType: 'Risk Audit & SLA Scoring',
        details: `Evaluated ${vendor.name}. Calculated Risk Score: ${data.riskScore} (${data.riskLevel.toUpperCase()}).`,
        status: data.riskLevel === 'high' ? 'warning' : 'success'
      });
    } catch (err) {
      console.error('Vendor risk evaluation failed:', err);
    } finally {
      setIsEvaluatingRisk(false);
    }
  };

  return (
    <div className="space-y-5">
      
      {/* View Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Strategic B2B Supplier & SLA Matrix</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time vendor SLA tracking, defect rate compliance, and AI risk scoring.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Avg SLA Performance: 97.4%</span>
        </div>
      </div>

      {/* Main Grid: Vendor Table + AI Risk Evaluator Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Supplier Directory (2 cols) */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Approved Suppliers</h3>
            <span className="text-xs text-slate-400">{vendors.length} Strategic Partners</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                  <th className="py-3 px-4">Supplier Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">SLA / Defect</th>
                  <th className="py-3 px-4">Tier</th>
                  <th className="py-3 px-4 text-center">Risk Score</th>
                  <th className="py-3 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {vendors.map((v) => (
                  <tr 
                    key={v.id} 
                    onClick={() => { setSelectedVendor(v); setRiskEvaluation(null); }}
                    className={`cursor-pointer transition-colors ${
                      selectedVendor?.id === v.id ? 'bg-slate-800/80 border-l-2 border-emerald-400' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-100">{v.name}</div>
                      <div className="text-[10px] text-slate-400">{v.code} • Terms: {v.paymentTerms}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{v.category}</td>
                    <td className="py-3 px-4">
                      <div className="text-slate-200 font-mono font-medium">{v.slaPerformance}% SLA</div>
                      <div className="text-[10px] text-slate-400">{v.defectRate}% Defect Rate</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        v.tier === 'Strategic' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        v.tier === 'Preferred' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {v.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        v.riskLevel === 'high' ? 'bg-red-950 text-red-400 border border-red-500/40' :
                        v.riskLevel === 'medium' ? 'bg-amber-950 text-amber-400 border border-amber-500/40' :
                        'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                      }`}>
                        {v.riskScore} / 100
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEvaluateRisk(v); }}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-[10px] font-medium rounded-lg transition-all"
                      >
                        AI Risk Audit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Vendor Profile & Gemini Risk Audit (1 col) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
          {selectedVendor ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Vendor Risk Profile</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedVendor.name}</h3>
                <p className="text-xs text-slate-400">{selectedVendor.summary}</p>
              </div>

              {/* Compliance Badges */}
              <div>
                <span className="text-xs text-slate-400 block mb-1">Certifications & Standards</span>
                <div className="flex flex-wrap gap-1">
                  {selectedVendor.complianceCertifications?.map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-300">
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Risk Audit Action Button */}
              <button
                onClick={() => handleEvaluateRisk(selectedVendor)}
                disabled={isEvaluatingRisk}
                className="w-full py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isEvaluatingRisk ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini Auditing SLA & Risk...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run AI Vendor Risk Evaluation</span>
                  </>
                )}
              </button>

              {/* Gemini Risk Evaluation Result */}
              {riskEvaluation && (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-semibold text-slate-200">AI Risk Verdict</span>
                    <span className={`font-mono font-bold ${
                      riskEvaluation.riskLevel === 'high' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      Score: {riskEvaluation.riskScore}/100 ({riskEvaluation.riskLevel.toUpperCase()})
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{riskEvaluation.summary}</p>
                  
                  {riskEvaluation.recommendations && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-semibold text-emerald-400">Recommendations:</span>
                      {riskEvaluation.recommendations.map((r: string, idx: number) => (
                        <div key={idx} className="flex items-start space-x-1.5 text-[11px] text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              Select a vendor to inspect compliance profile and run AI risk evaluation.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
