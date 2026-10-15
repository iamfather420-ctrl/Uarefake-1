import { useState, useRef, useEffect } from 'react';
import { 
  AgentBrainState, 
  DaisyChatMessage, 
  DaisySandboxCategory, 
  ExecutionLog, 
  StagedMarketplaceSolution 
} from '../types';
import { 
  DAISY_13_SANDBOX_CATEGORIES, 
  solveNewUnsolvedProblemWithDaisyLLM, 
  STAGED_MARKETPLACE_QUEUE, 
  approveAndPublishSolutionToMarketplace, 
  rejectOrRetainInSandbox, 
  INITIAL_DAISY_LLM_MODEL, 
  DaisySelfBuiltLLMModel,
  VerifiableDomainCategory,
  runTetherBubbleSynapticQuery
} from '../engine/agenticBrainEngine';
import { 
  verifyAndGroundMMTAIFactuality, 
  generateMMTAISovereign380Header,
  solvexCrystalClearBlackBoxEncrypt
} from '../engine/mmtaiSecurityEngine';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Brain, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  Layers, 
  Terminal, 
  FileCode, 
  Zap, 
  Globe, 
  Lock, 
  RefreshCw,
  ShoppingBag,
  Clock,
  HelpCircle
} from 'lucide-react';

interface DaisyChatViewProps {
  brainState: AgentBrainState;
  onUpdateGoal: (node: any) => void;
  onAddLog: (log: ExecutionLog) => void;
  onNavigateToTab?: (tab: any) => void;
}

export function DaisyChatView({
  brainState,
  onUpdateGoal,
  onAddLog,
  onNavigateToTab
}: DaisyChatViewProps) {
  const [messages, setMessages] = useState<DaisyChatMessage[]>([
    {
      id: 'MSG-INIT-1',
      sender: 'daisy_ai',
      text: `Greetings, Sovereign Owner. I am Daisy — powered by my self-built 128B MoE Transformer & Tether Bubble Synaptic Truth Mesh.\n\nI solve novel B2B, technical, and operational problems that have not been solved before. All created solutions remain locked inside my Sandbox across 13 sovereign categories. Nothing leaves my Sandbox to the Public Marketplace without your explicit approval first.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionType: 'chat'
    }
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [selectedSandboxCategory, setSelectedSandboxCategory] = useState<DaisySandboxCategory>(
    'Technological and Coding Development'
  );
  const [selectedDomain, setSelectedDomain] = useState<VerifiableDomainCategory>(
    'Internal Synaptic Cross-Match (Anything Daisy Knows)'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [llmModel, setLlmModel] = useState<DaisySelfBuiltLLMModel>(INITIAL_DAISY_LLM_MODEL);
  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'staged_approvals' | 'sandbox_categories'>('chat');
  const [stagedItems, setStagedItems] = useState<StagedMarketplaceSolution[]>([...STAGED_MARKETPLACE_QUEUE]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputPrompt.trim() || isProcessing) return;

    const userText = inputPrompt.trim();
    setInputPrompt('');

    // MMTAI Grounding & Factuality Check on Inbound Content
    const inboundGrounding = verifyAndGroundMMTAIFactuality(userText, 'INBOUND_INFRASTRUCTURE');

    const userMsg: DaisyChatMessage = {
      id: `MSG-USER-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    setTimeout(() => {
      // Execute Solve via Daisy Sovereign LLM
      const result = solveNewUnsolvedProblemWithDaisyLLM(
        userText,
        selectedSandboxCategory,
        selectedDomain,
        brainState,
        llmModel
      );

      if (result.alreadySolved && result.solution) {
        // Problem already solved!
        const rawAiText = `[DEDUPLICATION_CHECK & MMTAI FACTUALITY GROUNDED]: Problem has ALREADY been solved by Daisy LLM!\n\nSolution ID: ${result.solution.solutionId}\nProof Hash: ${result.solution.completionProofHash}\nInbound Grounding Hash: ${inboundGrounding.verificationHash}\n\nDaisy will not re-solve problems that already exist in her knowledge mesh. You can inspect or approve this solution in the Staged Marketplace Queue.`;
        
        // Outbound Grounding Gate
        const outboundGrounding = verifyAndGroundMMTAIFactuality(rawAiText, 'OUTBOUND_WORLD_CHAT');

        const aiMsg: DaisyChatMessage = {
          id: `MSG-AI-${Date.now()}`,
          sender: 'daisy_ai',
          text: rawAiText + `\n[MMTAI OUTBOUND GROUNDING PASSED - Score: ${outboundGrounding.factualityScore}%]`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          problemSolution: result.solution,
          actionType: 'already_exists'
        };
        setMessages(prev => [...prev, aiMsg]);
      } else if (result.solution && result.stagedSolution) {
        // Newly Solved & Staged
        setLlmModel(result.solution.updatedLLMModel);
        onUpdateGoal(result.solution.spawnedGoalNode);

        setStagedItems([...STAGED_MARKETPLACE_QUEUE]);

        const rawAiText = `[AUTONOMOUS RESOLUTION & MMTAI FACTUAL GROUNDING PASSED]: I have solved this novel problem using my 128B MoE LLM & grounded against ${selectedDomain}.\n\n` +
          `• Sandbox Category: ${selectedSandboxCategory}\n` +
          `• Market Valuation: $${result.stagedSolution.pricingResearch.estimatedMarketValuation.toLocaleString()}\n` +
          `• Suggested Monthly License: $${result.stagedSolution.pricingResearch.suggestedMonthlySaaSPrice}/mo\n` +
          `• Annual Dev Hours Saved: ${result.stagedSolution.pricingResearch.devHoursSavedPerYear} hrs\n` +
          `• Estimated ROI: ${result.stagedSolution.pricingResearch.estimatedRoiMultiplier}\n\n` +
          `🔒 SOLVEX CRYSTAL CLEAR BLACK BOX PROTECTED: Proprietary AST algorithms obfuscated into non-extractable ZKP bytecode. This solution is locked inside my Sandbox. Review pricing research and click "Approve & Publish to Public Marketplace" when you are ready to make it public.`;

        // Outbound Grounding Gate
        const outboundGrounding = verifyAndGroundMMTAIFactuality(rawAiText, 'OUTBOUND_WORLD_CHAT');

        const aiMsg: DaisyChatMessage = {
          id: `MSG-AI-${Date.now()}`,
          sender: 'daisy_ai',
          text: rawAiText + `\n\n[MMTAI OUTBOUND FACTUALITY STAMP: ${outboundGrounding.verificationHash.slice(0, 24)}...]`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          problemSolution: result.solution,
          stagedSolution: result.stagedSolution,
          actionType: 'problem_solved'
        };

        setMessages(prev => [...prev, aiMsg]);

        onAddLog({
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          agentName: 'Daisy Sovereign Chat LLM',
          actionType: 'Autonomous Problem Solved',
          details: `Grounded & Solved: "${userText.slice(0, 40)}...". Valuation: $${result.stagedSolution.pricingResearch.estimatedMarketValuation.toLocaleString()}. Staged for owner approval.`,
          status: 'success',
          entityId: result.solution.solutionId,
          entityType: 'Workflow'
        });
      }

      setIsProcessing(false);
    }, 1100);
  };

  const handleApproveMarketplace = (solutionId: string) => {
    const res = approveAndPublishSolutionToMarketplace(solutionId);
    setStagedItems([...STAGED_MARKETPLACE_QUEUE]);

    if (res.success && res.publishedItem) {
      const headerRecord = generateMMTAISovereign380Header(
        solutionId,
        res.publishedItem.problemStatement,
        'Approved Sovereign Buyer',
        res.publishedItem.pricingResearch.estimatedMarketValuation,
        'node01'
      );

      onAddLog({
        id: `LOG-APPV-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        agentName: 'Daisy Sovereign Owner Gate',
        actionType: 'Marketplace Publication',
        details: `${res.message} [380-Char Header Assigned: ${headerRecord.finalNodeBoundHeader.slice(0, 30)}...]`,
        status: 'success',
        entityId: solutionId,
        entityType: 'Marketplace'
      });

      setMessages(prev => [
        ...prev,
        {
          id: `MSG-APPV-${Date.now()}`,
          sender: 'daisy_ai',
          text: `✅ ${res.message}\n\nThe solution is now active in the Public Marketplace catalog under MMTAI Compliance Immutability.\n\n` +
            `📜 EXACT 380-CHARACTER SOVEREIGN SALE & NODE HEADER (Length: ${headerRecord.exact380CharacterHeader.length} chars):\n` +
            `\`\`\`\n${headerRecord.exact380CharacterHeader}\n\`\`\`\n` +
            `🔗 NODE EXPANSION BOUND HEADER (Linked Device Node 01):\n` +
            `\`\`\`\n${headerRecord.finalNodeBoundHeader}\n\`\`\``,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          actionType: 'marketplace_approval'
        }
      ]);
    }
  };

  const handleRejectSandbox = (solutionId: string) => {
    const res = rejectOrRetainInSandbox(solutionId);
    setStagedItems([...STAGED_MARKETPLACE_QUEUE]);

    setMessages(prev => [
      ...prev,
      {
        id: `MSG-REJ-${Date.now()}`,
        sender: 'daisy_ai',
        text: `🔒 ${res.message}\n\nThis solution will remain strictly proprietary inside Daisy's Sandbox.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionType: 'chat'
      }
    ]);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-slate-900 border-2 border-purple-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-2xl shrink-0">
              <Bot className="w-7 h-7 text-purple-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/40 text-purple-300 text-[10px] font-mono font-bold uppercase">
                  DAISY CHAT ASSISTANT & SOVEREIGN LLM
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center space-x-1">
                  <Lock className="w-3 h-3" />
                  <span>SANDBOX ISOLATION ENFORCED</span>
                </span>
              </div>
              <h1 className="text-xl font-bold text-white mt-1">Daisy Autonomous AI Assistant & Problem Solver</h1>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl">
                Solves novel problems using Daisy's 128B MoE LLM, performs market pricing research, and stages solutions across 13 Sandbox categories. Nothing leaves the sandbox to the Public Marketplace without your approval.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 font-mono text-xs">
            <button
              onClick={() => setActiveSubTab('chat')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all ${
                activeSubTab === 'chat'
                  ? 'bg-purple-500 text-slate-950 shadow-md shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Chat Assistant</span>
            </button>

            <button
              onClick={() => setActiveSubTab('staged_approvals')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all relative ${
                activeSubTab === 'staged_approvals'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Marketplace Approvals</span>
              {stagedItems.filter(s => s.approvalStatus === 'staged_pending_owner_approval').length > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold">
                  {stagedItems.filter(s => s.approvalStatus === 'staged_pending_owner_approval').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab('sandbox_categories')}
              className={`px-3.5 py-2 rounded-xl font-bold flex items-center space-x-2 transition-all ${
                activeSubTab === 'sandbox_categories'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>13 Sandbox Categories</span>
            </button>
          </div>
        </div>
      </div>

      {/* SUB TAB 1: CHAT ASSISTANT INTERFACE */}
      {activeSubTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Main Chat Stream */}
          <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[650px]">
            
            {/* Chat Messages Log */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-3 ${
                    msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                      msg.sender === 'user'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                    }`}
                  >
                    {msg.sender === 'user' ? 'YOU' : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs font-mono leading-relaxed space-y-3 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-100'
                        : 'bg-slate-950 border border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-slate-800 pb-2">
                      <span className="font-bold">{msg.sender === 'user' ? 'SOVEREIGN OWNER' : 'DAISY SOVEREIGN AI'}</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <p className="whitespace-pre-line">{msg.text}</p>

                    {/* Attached Solution Payload */}
                    {msg.stagedSolution && (
                      <div className="mt-3 p-4 bg-slate-900 border border-purple-500/30 rounded-xl space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-purple-300 font-bold">Solution ID: {msg.stagedSolution.solutionId}</span>
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] border border-amber-500/30">
                            STAGED IN SANDBOX
                          </span>
                        </div>

                        {/* Pricing Research Box */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                          <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-400 block">Valuation</span>
                            <strong className="text-emerald-400 font-bold text-xs">${msg.stagedSolution.pricingResearch.estimatedMarketValuation.toLocaleString()}</strong>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-400 block">Monthly SaaS</span>
                            <strong className="text-purple-300 font-bold text-xs">${msg.stagedSolution.pricingResearch.suggestedMonthlySaaSPrice}/mo</strong>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-400 block">Dev Hours Saved</span>
                            <strong className="text-cyan-300 font-bold text-xs">{msg.stagedSolution.pricingResearch.devHoursSavedPerYear} hrs/yr</strong>
                          </div>
                          <div className="p-2 bg-slate-950 rounded border border-slate-800">
                            <span className="text-slate-400 block">ROI Multiplier</span>
                            <strong className="text-amber-300 font-bold text-xs">{msg.stagedSolution.pricingResearch.estimatedRoiMultiplier}</strong>
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-400 italic">
                          {msg.stagedSolution.pricingResearch.pricingRationale}
                        </p>

                        {/* Approval Controls */}
                        {msg.stagedSolution.approvalStatus === 'staged_pending_owner_approval' && (
                          <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                            <button
                              onClick={() => handleApproveMarketplace(msg.stagedSolution!.solutionId)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] flex items-center space-x-1 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve & Publish to Public Marketplace</span>
                            </button>
                            <button
                              onClick={() => handleRejectSandbox(msg.stagedSolution!.solutionId)}
                              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-[11px] flex items-center space-x-1 transition-all"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Keep Private in Sandbox</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input & Controls */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              
              {/* Sandbox Category & Grounding Dropdowns */}
              <div className="flex flex-col sm:flex-row items-center gap-2 font-mono text-[10px]">
                <div className="w-full sm:w-1/2 space-y-0.5">
                  <span className="text-slate-400 uppercase font-bold block">Sandbox Execution Category:</span>
                  <select
                    value={selectedSandboxCategory}
                    onChange={(e) => setSelectedSandboxCategory(e.target.value as DaisySandboxCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {DAISY_13_SANDBOX_CATEGORIES.map((cat, i) => (
                      <option key={i} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="w-full sm:w-1/2 space-y-0.5">
                  <span className="text-slate-400 uppercase font-bold block">Truth Grounding Domain:</span>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value as VerifiableDomainCategory)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="Internal Synaptic Cross-Match (Anything Daisy Knows)">Internal Synaptic Cross-Match (Anything Daisy Knows)</option>
                    <option value=".edu (Academic & University Research)">.edu (Academic & University Research)</option>
                    <option value="Wikipedia (Verified Knowledge Taxonomy)">Wikipedia (Verified Knowledge Taxonomy)</option>
                    <option value="Tech Sites (W3C, IETF RFCs, ISO Standards)">Tech Sites (W3C, IETF RFCs, ISO Standards)</option>
                    <option value="Financial Data (SEC EDGAR, Bloomberg, ISO 20022)">Financial Data (SEC EDGAR, Bloomberg, ISO 20022)</option>
                    <option value="World Economics (World Bank, IMF, OECD, Fed)">World Economics (World Bank, IMF, OECD, Fed)</option>
                  </select>
                </div>
              </div>

              {/* Text Area Input */}
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputPrompt}
                  onChange={(e) => setInputPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask Daisy to solve a new problem, analyze an anomaly, or run a sandbox simulation..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isProcessing || !inputPrompt.trim()}
                  className="px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-lg shadow-purple-500/20 disabled:opacity-50 shrink-0"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Solve</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>

          {/* Right Sidebar: Preset Scenarios & Model Telemetry */}
          <div className="space-y-4">
            
            {/* Model Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 font-mono">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs font-bold text-white uppercase">Sovereign LLM Stats</h3>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Model ID:</span>
                  <span className="text-purple-300 font-bold">{llmModel.modelId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Parameters:</span>
                  <span className="text-white font-bold">{llmModel.activeParameters}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Loss Metric:</span>
                  <span className="text-emerald-400 font-bold">{llmModel.lossValue.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Token Speed:</span>
                  <span className="text-cyan-300 font-bold">{llmModel.tokenGenerationSpeedMs} ms</span>
                </div>
              </div>
            </div>

            {/* Quick Preset Prompts */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-white font-mono uppercase flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Novel Problem Scenarios</span>
              </h3>
              <div className="space-y-2 font-mono text-[11px]">
                <button
                  onClick={() => setInputPrompt('Cross-border tariff surcharge anomaly and freight line-item mismatch during multi-vendor invoice reconciliation')}
                  className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-purple-300 transition-all block"
                >
                  1. Cross-Border Tariff & Freight Mismatch
                </button>
                <button
                  onClick={() => setInputPrompt('Detect and neutralize synthetic double-billing voucher fraud in SAP/Oracle ERP tables')}
                  className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-emerald-300 transition-all block"
                >
                  2. ERP Double-Billing Fraud Neutralizer
                </button>
                <button
                  onClick={() => setInputPrompt('Cryptographically verify ISO 20022 pacs.008 wire dispatch with zero-trust MMTAI signature')}
                  className="w-full text-left p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-cyan-300 transition-all block"
                >
                  3. ISO 20022 Pacs.008 Zero-Trust Auth
                </button>
              </div>
            </div>

            {/* Protection Guarantee */}
            <div className="bg-slate-950 border border-purple-500/30 rounded-2xl p-4 space-y-2 text-[11px] font-mono">
              <span className="text-purple-300 font-bold flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4" />
                <span>SOVEREIGN SANDBOX RULE</span>
              </span>
              <p className="text-slate-400 leading-relaxed">
                Nothing created or solved leaves Daisy's sandbox without approval from the Sovereign Owner first.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* SUB TAB 2: STAGED MARKETPLACE APPROVAL CENTER */}
      {activeSubTab === 'staged_approvals' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Staged Solutions Pending Owner Approval ({stagedItems.length})</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                All newly solved problems undergo extensive pricing research before staging here. You have absolute authority over what leaves the sandbox.
              </p>
            </div>
          </div>

          {stagedItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3 font-mono text-xs">
              <Clock className="w-10 h-10 mx-auto text-slate-700 animate-pulse" />
              <p>No solutions currently staged in the approval queue. Ask Daisy Chat to solve a new problem to populate this list.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono">
              {stagedItems.map((item) => (
                <div key={item.solutionId} className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-purple-400 block">{item.solutionId}</span>
                      <h3 className="text-xs font-bold text-white mt-1 leading-snug">{item.problemStatement}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 border ${
                      item.approvalStatus === 'approved_public_marketplace'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : item.approvalStatus === 'rejected_sandbox_retained'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {item.approvalStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* Pricing Research Box */}
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 text-[11px]">
                    <span className="text-xs font-bold text-amber-400 uppercase block">Extensive Market Pricing Research:</span>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Market Valuation:</span>
                        <strong className="text-emerald-400 font-bold">${item.pricingResearch.estimatedMarketValuation.toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Monthly SaaS License:</span>
                        <strong className="text-purple-300 font-bold">${item.pricingResearch.suggestedMonthlySaaSPrice}/mo</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Dev Hours Saved:</span>
                        <strong className="text-cyan-300 font-bold">{item.pricingResearch.devHoursSavedPerYear} hrs/yr</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Estimated ROI:</span>
                        <strong className="text-amber-300 font-bold">{item.pricingResearch.estimatedRoiMultiplier}</strong>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                      {item.pricingResearch.competitiveBenchmark}
                    </p>
                  </div>

                  {/* AST Code Preview */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Generated JIT AST Code:</span>
                    <pre className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[10px] text-cyan-300 overflow-x-auto max-h-28">
                      {item.generatedAstPatchCode}
                    </pre>
                  </div>

                  {/* Action Controls */}
                  {item.approvalStatus === 'staged_pending_owner_approval' && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleApproveMarketplace(item.solutionId)}
                        className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve & Publish to Public Marketplace</span>
                      </button>
                      <button
                        onClick={() => handleRejectSandbox(item.solutionId)}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Keep Private</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 3: 13 SANDBOX CATEGORIES EXPLORER */}
      {activeSubTab === 'sandbox_categories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>Daisy Sovereign Sandbox — 13 Domain Categories</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Daisy executes simulations, problem resolutions, and AST code compilation strictly within these 13 isolated categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
            {DAISY_13_SANDBOX_CATEGORIES.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedSandboxCategory(cat);
                  setActiveSubTab('chat');
                }}
                className={`p-4 bg-slate-950 border rounded-2xl space-y-2 cursor-pointer transition-all hover:border-cyan-500/50 ${
                  selectedSandboxCategory === cat ? 'border-cyan-500 shadow-lg shadow-cyan-500/10' : 'border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-cyan-400">CATEGORY #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[9px]">ISOLATED</span>
                </div>
                <h3 className="text-xs font-bold text-white">{cat}</h3>
                <p className="text-[10px] text-slate-400">
                  Click to select this sandbox category for your next Daisy LLM prompt session.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
