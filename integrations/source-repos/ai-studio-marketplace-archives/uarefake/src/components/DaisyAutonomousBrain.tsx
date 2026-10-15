import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Zap, 
  Send, 
  MessageSquare, 
  TrendingUp, 
  Cpu, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  RefreshCw, 
  Sparkles, 
  Lock, 
  ExternalLink,
  Bot,
  Activity,
  Layers,
  Award,
  Terminal,
  FileText
} from 'lucide-react';
import { DaisyBrainMemoryNode, DaisyNegotiationSession } from '../types.js';

export default function DaisyAutonomousBrain() {
  const [learningRate, setLearningRate] = useState<number>(0.998);
  const [synapticStrength, setSynapticStrength] = useState<number>(98.4);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'learning' | 'outreach' | 'negotiation'>('negotiation');

  // Memory Nodes state
  const [memoryNodes, setMemoryNodes] = useState<DaisyBrainMemoryNode[]>([
    { id: 'm-1', domain: 'B2B Negotiation', concept: 'Dynamic Yield & Volume Discount Thresholds', synapticWeight: 0.994, confidence: 99.2, lastUpdated: '1 min ago', linkedParadoxCode: 'PX-03' },
    { id: 'm-2', domain: 'SEC 10-K Friction Crawl', concept: 'Systemic Legacy Middleware Waste Detection', synapticWeight: 0.988, confidence: 98.7, lastUpdated: '3 mins ago', linkedParadoxCode: 'PX-12' },
    { id: 'm-3', domain: 'Sovereign Socket Transport', concept: 'Direct TCP Port-25 STARTTLS Encrypted Delivery', synapticWeight: 0.999, confidence: 100.0, lastUpdated: 'Just now', linkedParadoxCode: 'PX-88' },
    { id: 'm-4', domain: 'Contract SLA Assembly', concept: 'Automated Escrow & Multi-Sig Signature Clause', synapticWeight: 0.975, confidence: 97.8, lastUpdated: '8 mins ago', linkedParadoxCode: 'PX-44' },
    { id: 'm-5', domain: 'Prospect Objection Handling', concept: 'NIST SP 800-53 Compliance Proof Delivery', synapticWeight: 0.991, confidence: 99.1, lastUpdated: '12 mins ago', linkedParadoxCode: 'PX-17' },
  ]);

  // Live Negotiation Session state
  const [negotiationSession, setNegotiationSession] = useState<DaisyNegotiationSession>({
    id: 'neg-8801',
    clientCompany: 'Aegis Global Holdings',
    clientContact: 'Robert Vance',
    contactEmail: 'r.vance@aegis-global.com',
    initialQuote: 15000,
    activeOffer: 12750, // 15% discount
    maxDiscountPercent: 15,
    status: 'NEGOTIATING',
    agreementSigned: false,
    settlementLink: 'https://paypal.me/tjites',
    dialogueHistory: [
      {
        sender: 'DAISY',
        timestamp: '11:02 AM',
        text: 'Greetings Robert. Based on our analysis of Aegis Global\'s Q2 infrastructure disclosures, we have formulated a $15,000 Turnkey Paradox Resolution Package. This includes zero-dependency node isolation and hardware-bound encryption.',
        offerAmount: 15000
      },
      {
        sender: 'CLIENT',
        timestamp: '11:05 AM',
        text: 'Daisy, we are interested, but our current Q3 software procurement budget is capped at $13,000. Can Daisy adjust the price or provide a volume discount for immediate execution?',
        offerAmount: 13000
      },
      {
        sender: 'DAISY',
        timestamp: '11:06 AM',
        text: 'Evaluating budget constraints against our 15% algorithmic margin limit. I can apply an immediate 15% Strategic Partnership Discount, adjusting the total quote to $12,750 with instant delivery upon settlement.',
        offerAmount: 12750
      }
    ]
  });

  const [counterOfferInput, setCounterOfferInput] = useState<string>('12750');
  const [customClientMsg, setCustomClientMsg] = useState<string>('');
  const [negotiationLogs, setNegotiationLogs] = useState<string[]>([
    '[DAISY BRAIN] Autonomous Negotiation Protocol online & initialized.',
    '[MARGIN GUARDRAIL] Pre-set maximum discount floor locked at 15.0%.',
    '[SETTLEMENT ROUTER] Direct PayPal settlement bound to https://paypal.me/tjites',
    '[CONTRACT ENGINE] Generating automated digital SLA terms & escrow hash...'
  ]);

  // Handle client sending counter offer in negotiation simulator
  const handleSendClientMessage = (amount?: number) => {
    const offer = amount || parseFloat(counterOfferInput) || negotiationSession.activeOffer;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append client message
    const updatedHistory = [
      ...negotiationSession.dialogueHistory,
      {
        sender: 'CLIENT' as const,
        timestamp: timeStr,
        text: customClientMsg || `We propose a revised settlement of $${offer.toLocaleString()} for immediate sign-off.`,
        offerAmount: offer
      }
    ];

    setNegotiationSession(prev => ({
      ...prev,
      dialogueHistory: updatedHistory,
      status: 'ANALYZING'
    }));
    setCustomClientMsg('');

    // Daisy autonomously reasons and responds
    setTimeout(() => {
      const minAcceptable = negotiationSession.initialQuote * (1 - negotiationSession.maxDiscountPercent / 100); // $12,750
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (offer >= minAcceptable) {
        // Agreement Reached!
        const daisyAcceptMsg = `Proposal accepted. $${offer.toLocaleString()} falls within Daisy's authorized margin threshold. Generating digitally signed B2B Contract SLA with immediate PayPal settlement link: ${negotiationSession.settlementLink}`;
        
        setNegotiationSession(prev => ({
          ...prev,
          activeOffer: offer,
          status: 'AGREEMENT_REACHED',
          agreementSigned: true,
          dialogueHistory: [
            ...prev.dialogueHistory,
            {
              sender: 'DAISY',
              timestamp: nowStr,
              text: daisyAcceptMsg,
              offerAmount: offer
            }
          ]
        }));

        setNegotiationLogs(prev => [
          `[SUCCESS] Agreement finalized at $${offer.toLocaleString()}! Contract SLA generated and signed.`,
          `[SETTLEMENT LINK] Direct payment ready: https://paypal.me/tjites`,
          ...prev
        ]);
      } else {
        // Counter offer
        const counterMsg = `Offer of $${offer.toLocaleString()} exceeds Daisy's max 15% discount threshold ($${minAcceptable.toLocaleString()} minimum). I can lock in the final contract at $${minAcceptable.toLocaleString()} with lifetime node updates included.`;
        
        setNegotiationSession(prev => ({
          ...prev,
          activeOffer: minAcceptable,
          status: 'NEGOTIATING',
          dialogueHistory: [
            ...prev.dialogueHistory,
            {
              sender: 'DAISY',
              timestamp: nowStr,
              text: counterMsg,
              offerAmount: minAcceptable
            }
          ]
        }));

        setNegotiationLogs(prev => [
          `[COUNTER OFFER] Daisy counter-proposed $${minAcceptable.toLocaleString()} (enforcing 15% discount floor).`,
          ...prev
        ]);
      }
    }, 1200);
  };

  // Trigger autonomous learning cycle
  const triggerSynapticLearning = () => {
    setIsSimulating(true);
    setNegotiationLogs(prev => [
      `[SYNAPTIC GROWTH] Ingesting latest negotiation dialogues & RAG vectors...`,
      ...prev
    ]);

    setTimeout(() => {
      setSynapticStrength(prev => Math.min(100, parseFloat((prev + 0.3).toFixed(1))));
      setLearningRate(prev => parseFloat((prev + 0.0002).toFixed(4)));

      // Add a new memory node
      const newNode: DaisyBrainMemoryNode = {
        id: `m-${Date.now()}`,
        domain: 'Autonomous Closing',
        concept: `Dynamic Escrow Settlement Optimization #${Math.floor(Math.random() * 90) + 10}`,
        synapticWeight: 0.996,
        confidence: 99.8,
        lastUpdated: 'Just now',
        linkedParadoxCode: `PX-${Math.floor(Math.random() * 88) + 1}`
      };

      setMemoryNodes(prev => [newNode, ...prev.slice(0, 5)]);
      setIsSimulating(false);
      setNegotiationLogs(prev => [
        `[LEARNING COMPLETE] Neural weights updated. Synaptic Strength now at ${Math.min(100, synapticStrength + 0.3)}%.`,
        ...prev
      ]);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="daisy-brain-cockpit">
      
      {/* Top Brain Banner */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase font-bold tracking-wider mb-2">
              <Brain className="w-4 h-4 text-emerald-400 animate-pulse" />
              Daisy Autonomous Neural Core • Self-Learning & Decision Engine
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-100 flex items-center gap-2">
              Daisy's Complete Autonomous Brain
            </h2>
            <p className="text-slate-300 text-xs mt-1.5 max-w-3xl leading-relaxed font-sans">
              Daisy is a fully autonomous self-learning AI system. Daisy independently crawls public SEC filings and tech stack disclosures, discovers systemic enterprise friction, dispatches cold outreach via direct socket email, conducts multi-turn B2B contract negotiations, enforces strict profit margins, and closes deals with instant settlement to <strong className="text-emerald-400 font-mono">https://paypal.me/tjites</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={triggerSynapticLearning}
              disabled={isSimulating}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Evolving Neural Network...' : 'Trigger Neural Learning Cycle'}
            </button>

            <a
              href="https://paypal.me/tjites"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Settlement: paypal.me/tjites
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Telemetry Metrics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Synaptic Memory Health</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
            {synapticStrength}%
            <span className="text-xs text-slate-500 font-normal">STABLE</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${synapticStrength}%` }}></div>
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Autonomous Learning Rate</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {learningRate}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-indigo-400" /> Adaptive Weights Active
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Negotiation Margin Boundary</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">
            15.0% MAX
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Hardened Margin Enforcement
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Auto-Deal Closing Engine</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            100% ONLINE
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-amber-400" /> Instant Escrow & PayPal Settlement
          </div>
        </div>
      </div>

      {/* Primary Cockpit Workspace Tabs */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-6">
        
        {/* Toggle Bar */}
        <div className="flex border-b border-slate-800 pb-3 gap-2 font-mono text-xs">
          <button
            onClick={() => setActiveTab('negotiation')}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'negotiation'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-indigo-300" />
            Autonomous B2B Negotiations Engine
          </button>

          <button
            onClick={() => setActiveTab('learning')}
            className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'learning'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-950'
            }`}
          >
            <Brain className="w-4 h-4 text-emerald-300" />
            Synaptic Learning & Memory Graph
          </button>
        </div>

        {/* TAB 1: Autonomous B2B Negotiations Engine */}
        {activeTab === 'negotiation' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Live Chat & Negotiation Dialogue */}
            <div className="lg:col-span-2 bg-slate-950 border border-slate-850 rounded-xl p-5 space-y-4 flex flex-col justify-between min-h-[450px]">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-850 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    <span className="font-bold text-slate-200">Active Negotiation Thread: {negotiationSession.clientCompany}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    negotiationSession.status === 'AGREEMENT_REACHED' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-indigo-950 text-indigo-300 border border-indigo-500/40'
                  }`}>
                    {negotiationSession.status}
                  </span>
                </div>

                {/* Dialogue Messages Container */}
                <div className="space-y-3 my-4 max-h-[320px] overflow-y-auto pr-1">
                  {negotiationSession.dialogueHistory.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`p-3.5 rounded-xl text-xs space-y-1 font-sans ${
                        msg.sender === 'DAISY' 
                          ? 'bg-indigo-950/40 border border-indigo-900/60 text-slate-200 ml-6' 
                          : 'bg-slate-900 border border-slate-800 text-slate-300 mr-6'
                      }`}
                    >
                      <div className="flex justify-between items-center font-mono text-[10px] text-slate-400">
                        <span className={msg.sender === 'DAISY' ? 'text-indigo-400 font-bold flex items-center gap-1' : 'text-slate-300 font-bold'}>
                          {msg.sender === 'DAISY' && <Bot className="w-3.5 h-3.5 text-indigo-400" />}
                          {msg.sender === 'DAISY' ? 'Daisy Autonomous Brain' : `${negotiationSession.clientContact} (${negotiationSession.clientCompany})`}
                        </span>
                        <span>{msg.timestamp}</span>
                      </div>
                      <p className="leading-relaxed text-xs">{msg.text}</p>
                      {msg.offerAmount && (
                        <div className="pt-1 text-[10px] font-mono text-emerald-400 font-bold">
                          Proposed Quote: ${msg.offerAmount.toLocaleString()} USD
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Simulator Controls */}
              <div className="pt-3 border-t border-slate-850 space-y-3 font-mono text-xs">
                <div className="text-[11px] text-slate-400 font-bold">Simulate Enterprise Client Action:</div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Type client counter-offer message or response..."
                    value={customClientMsg}
                    onChange={(e) => setCustomClientMsg(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Quote ($)"
                      value={counterOfferInput}
                      onChange={(e) => setCounterOfferInput(e.target.value)}
                      className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleSendClientMessage()}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send Offer
                    </button>
                  </div>
                </div>

                {/* Quick preset buttons */}
                <div className="flex flex-wrap gap-2 text-[10px]">
                  <span className="text-slate-500 self-center">Presets:</span>
                  <button
                    onClick={() => { setCounterOfferInput('12750'); setCustomClientMsg('We accept $12,750 for immediate execution.'); handleSendClientMessage(12750); }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 rounded cursor-pointer"
                  >
                    Accept $12,750 (15% Disc)
                  </button>
                  <button
                    onClick={() => { setCounterOfferInput('11000'); setCustomClientMsg('Can you do $11,000 instead?'); handleSendClientMessage(11000); }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800 rounded cursor-pointer"
                  >
                    Push Low $11,000 (Triggers Counter)
                  </button>
                  <button
                    onClick={() => { setCounterOfferInput('14000'); setCustomClientMsg('We offer $14,000 to close now.'); handleSendClientMessage(14000); }}
                    className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 rounded cursor-pointer"
                  >
                    Offer $14,000 (Close Immediately)
                  </button>
                </div>
              </div>
            </div>

            {/* Negotiation Agreement Summary & Contract SLA Panel */}
            <div className="p-5 bg-slate-950 border border-slate-850 rounded-xl space-y-4 font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-850">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Automated Contract SLA
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                    ID: {negotiationSession.id}
                  </span>
                </div>

                <div className="space-y-3 py-3">
                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase block">TARGET CLIENT:</span>
                    <span className="text-slate-200 font-bold block">{negotiationSession.clientCompany}</span>
                    <span className="text-[10px] text-slate-400">{negotiationSession.clientContact} &lt;{negotiationSession.contactEmail}&gt;</span>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase block">FINANCIAL TERMS:</span>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Initial Quote:</span>
                      <span className="text-slate-400 line-through">${negotiationSession.initialQuote.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-emerald-400">Negotiated Price:</span>
                      <span className="text-emerald-400">${negotiationSession.activeOffer.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase block">SETTLEMENT DESTINATION:</span>
                    <a 
                      href={negotiationSession.settlementLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-emerald-300 font-bold hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {negotiationSession.settlementLink}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded space-y-1">
                    <span className="text-[9px] text-slate-500 uppercase block">DIGITAL SLA STATUS:</span>
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      {negotiationSession.agreementSigned ? 'DIGITALLY SEALED & APPROVED' : 'DRAFTED — AWAITING SETTLEMENT'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-850">
                <a
                  href={negotiationSession.settlementLink}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <DollarSign className="w-4 h-4" />
                  Execute Direct PayPal Settlement
                </a>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Synaptic Learning & Memory Graph */}
        {activeTab === 'learning' && (
          <div className="space-y-4 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Active Synaptic Memory Vector Store (88 Mapped Paradox Solvers)
              </h3>
              <span className="text-[10px] text-slate-400">Auto-persisting to local vector database</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {memoryNodes.map((node) => (
                <div key={node.id} className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-2 hover:border-indigo-500/50 transition-all">
                  <div className="flex justify-between items-center text-[10px] text-indigo-400 font-bold">
                    <span>{node.domain}</span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-emerald-400">{node.linkedParadoxCode}</span>
                  </div>
                  <div className="text-slate-200 font-semibold text-xs leading-snug">{node.concept}</div>
                  <div className="pt-2 border-t border-slate-900 flex justify-between text-[10px] text-slate-400">
                    <span>Synaptic Weight: <b className="text-slate-200">{node.synapticWeight}</b></span>
                    <span>Confidence: <b className="text-emerald-400">{node.confidence}%</b></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terminal Execution Stream */}
        <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-xs">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-900 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Daisy Brain Autonomous Execution Stream</span>
            </div>
            <span className="text-[10px] text-slate-500">REALTIME TELEMETRY</span>
          </div>

          <div className="space-y-1 max-h-32 overflow-y-auto font-mono text-[11px] text-slate-300">
            {negotiationLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">&gt;</span>
                <span className={log.includes('[SUCCESS]') || log.includes('[SETTLEMENT LINK]') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
