import React, { useState } from 'react';
import { 
  Zap, 
  Bot, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Trash2, 
  Play, 
  Pause,
  Sliders,
  Sparkles,
  ListFilter
} from 'lucide-react';
import { WorkflowRule, ExecutionLog } from '../types';

interface WorkflowViewProps {
  workflows: WorkflowRule[];
  logs: ExecutionLog[];
  onToggleWorkflow: (id: string) => void;
  onAddWorkflow: (rule: WorkflowRule) => void;
  isAgentRunning: boolean;
  setIsAgentRunning: React.Dispatch<React.SetStateAction<boolean>>;
}

export const WorkflowView: React.FC<WorkflowViewProps> = ({
  workflows,
  logs,
  onToggleWorkflow,
  onAddWorkflow,
  isAgentRunning,
  setIsAgentRunning
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [triggerEvent, setTriggerEvent] = useState<WorkflowRule['triggerEvent']>('STOCK_BELOW_SAFETY');
  const [conditions, setConditions] = useState('Stock <= ReorderPoint');
  const [action, setAction] = useState<WorkflowRule['action']>('AUTO_APPROVE');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule: WorkflowRule = {
      id: `WF-${Date.now()}`,
      name: ruleName,
      triggerEvent,
      conditions,
      action,
      isEnabled: true,
      executionCount: 0
    };

    onAddWorkflow(newRule);
    setRuleName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold text-white">Autonomous Agent Rule Orchestrator</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure event triggers, conditional business logic, and automated action handlers.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsAgentRunning(!isAgentRunning)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border flex items-center space-x-2 transition-all ${
              isAgentRunning 
                ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40' 
                : 'bg-amber-950 text-amber-300 border-amber-500/40'
            }`}
          >
            {isAgentRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isAgentRunning ? 'Pause All Agents' : 'Resume Agents'}</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Workflow Rule</span>
          </button>
        </div>
      </div>

      {/* Workflow Rule List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workflows.map((wf) => (
          <div 
            key={wf.id} 
            className={`p-4 rounded-2xl border transition-all ${
              wf.isEnabled 
                ? 'bg-slate-900 border-slate-800 hover:border-emerald-500/40' 
                : 'bg-slate-950/60 border-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-emerald-400">{wf.id}</span>
                <span className="text-xs font-bold text-slate-100">{wf.name}</span>
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => onToggleWorkflow(wf.id)}
                className={`w-10 h-5 flex items-center rounded-full p-0.5 transition-colors ${
                  wf.isEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-800 justify-start'
                }`}
              >
                <div className="w-4 h-4 rounded-full bg-slate-950 shadow-md" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400 mt-3">
              <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase">Trigger Event</span>
                <span className="font-mono text-[11px] text-amber-300 font-medium">{wf.triggerEvent}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase">Logic Condition</span>
                <span className="font-mono text-[11px] text-slate-300">{wf.conditions}</span>
              </div>

              <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 uppercase">Automated Action</span>
                <span className="font-mono text-[11px] text-emerald-400 font-bold">{wf.action}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500 pt-2 border-t border-slate-800/60">
              <span>Executions: {wf.executionCount} times</span>
              <span>Last: {wf.lastTriggered || 'Active'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Autonomous Agent Execution History</h3>
          </div>
          <span className="text-xs text-slate-400">{logs.length} Logged Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Autonomous Agent</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                  <td className="py-3 px-4 font-bold text-emerald-400">{log.agentName}</td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{log.actionType}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-md">{log.details}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.status === 'warning' ? 'bg-amber-950 text-amber-400 border border-amber-500/30' :
                      log.status === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE WORKFLOW RULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Configure New Autonomous Rule</span>
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Auto-Approve Minor Invoice Variances"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Trigger Event</label>
                <select
                  value={triggerEvent}
                  onChange={(e: any) => setTriggerEvent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="STOCK_BELOW_SAFETY">STOCK_BELOW_SAFETY</option>
                  <option value="INVOICE_RECEIVED">INVOICE_RECEIVED</option>
                  <option value="PRICE_VARIANCE_DETECTED">PRICE_VARIANCE_DETECTED</option>
                  <option value="VENDOR_RISK_HIGH">VENDOR_RISK_HIGH</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Logic Conditions</label>
                <input
                  type="text"
                  required
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Automated Action</label>
                <select
                  value={action}
                  onChange={(e: any) => setAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                >
                  <option value="AUTO_APPROVE">AUTO_APPROVE</option>
                  <option value="REQUIRE_APPROVAL">REQUIRE_APPROVAL</option>
                  <option value="GENERATE_RFQ">GENERATE_RFQ</option>
                  <option value="SEND_PAYMENT_REMINDER">SEND_PAYMENT_REMINDER</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
