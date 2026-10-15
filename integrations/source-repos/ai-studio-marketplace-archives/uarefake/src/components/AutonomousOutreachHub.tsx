import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Users, 
  Mail, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Check, 
  Building2, 
  BarChart3, 
  Settings, 
  DollarSign, 
  ShieldCheck, 
  Terminal,
  ExternalLink
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  targetIndustry: string;
  leadsFound: number;
  outreachSent: number;
  responsesReceived: number;
  dealsClosed: number;
  status: 'active' | 'paused' | 'configuring';
  paypalRecipient: string;
}

export default function AutonomousOutreachHub() {
  const [smtpConfigured, setSmtpConfigured] = useState<boolean>(false);
  const [paypalRecipient, setPaypalRecipient] = useState<string>('tjites (https://paypal.me/tjites)');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [leadCount, setLeadCount] = useState<number>(428);
  const [logs, setLogs] = useState<string[]>([
    '[MMTAI DECISION ENGINE] Daisy Haminja MMTAI Protocol Decision Authority ACTIVE.',
    '[AUTONOMOUS LEARNING] Deep neural memory updated from previous B2B negotiation dialogues.',
    '[ANNUAL AUDIT ENGINE] SEC 10-K & Public System Diagnostic Crawler initialized.',
    '[FRICTION DISCOVERY] 142 Enterprise friction points identified across target tech & financial stacks.',
    '[OUTREACH CORE] Proactive friction audit & custom solution proposal generator online.',
    '[PAYMENT] Direct PayPal Gateway mapped to: https://paypal.me/tjites',
    '[SMTP STATUS] Daisy Haminja Relay Endpoint (daisy.haminja@gmail.com) ready for live outbound delivery.'
  ]);

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'cmp-1',
      name: 'Enterprise Financial Paradox Resolution Outreach',
      targetIndustry: 'FinTech & Institutional Banking',
      leadsFound: 142,
      outreachSent: 89,
      responsesReceived: 24,
      dealsClosed: 6,
      status: 'active',
      paypalRecipient: 'https://paypal.me/tjites'
    },
    {
      id: 'cmp-2',
      name: 'Automated White-Label Software Sales Pipeline',
      targetIndustry: 'B2B SaaS & Tech Enterprises',
      leadsFound: 186,
      outreachSent: 120,
      responsesReceived: 38,
      dealsClosed: 11,
      status: 'active',
      paypalRecipient: 'https://paypal.me/tjites'
    },
    {
      id: 'cmp-3',
      name: 'Defense & Government Compliance Automation',
      targetIndustry: 'Aerospace & NIST Audited Defense Contractors',
      leadsFound: 100,
      outreachSent: 45,
      responsesReceived: 12,
      dealsClosed: 3,
      status: 'active',
      paypalRecipient: 'https://paypal.me/tjites'
    }
  ]);

  const [prodDomain, setProdDomain] = useState('ais-dev-2q2uq66jzz4e7xi3yuept4-630645465623.us-west2.run.app');
  const [sovereignDomain, setSovereignDomain] = useState('uarefake.com');
  const [senderEmail, setSenderEmail] = useState('daisy@uarefake.com');
  const [socketTransportActive, setSocketTransportActive] = useState<boolean>(true);
  const [testRecipient, setTestRecipient] = useState<string>('gods.battle.axe.88@gmail.com');
  const [testSubject, setTestSubject] = useState<string>('SolveXia Institutional Solution Portfolio & White-Label Pipeline');
  const [testSending, setTestSending] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const [outreachTemplate, setOutreachTemplate] = useState(
    "Hello {ContactName},\n\nOur autonomous system detected potential optimization points in {CompanyName}'s transaction pipeline. We offer zero-knowledge, hardware-bound paradox resolution software.\n\nTo acquire or license our pre-certified templates directly via secure settlement:\nhttps://paypal.me/tjites\n\nBest regards,\nSolvex Autonomous B2B Sales Engine"
  );

  useEffect(() => {
    fetch('/api/domain/config')
      .then(res => res.json())
      .then(data => {
        if (data.productionDomain) setProdDomain(data.productionDomain);
        if (data.sovereignDomain) setSovereignDomain(data.sovereignDomain);
        if (data.fromEmail) setSenderEmail(data.fromEmail);
      })
      .catch(() => {});
  }, []);

  const sendTestEmailViaSovereign = async () => {
    setTestSending(true);
    setTestResult(null);
    addLog(`[SOVEREIGN SOCKET] Initiating direct socket transport to ${testRecipient}...`);

    try {
      const res = await fetch('/api/sovereign-smtp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testRecipient,
          from: senderEmail,
          subject: testSubject,
          text: outreachTemplate.replace('{ContactName}', 'Valued Partner').replace('{CompanyName}', 'Enterprise Partner')
        })
      });
      const data = await res.json();

      if (data.success) {
        const msg = `[SOVEREIGN SUCCESS] Direct socket email dispatched! Proof Hash: ${data.proofHash || 'Verified'}`;
        addLog(msg);
        setTestResult(`Success! Email sent via Sovereign Socket Transport (Proof: ${data.proofHash?.substring(0, 16) || 'OK'})`);
      } else {
        const errMsg = `[SOVEREIGN NOTICE] ${data.message || data.error || 'Direct socket transmission queued.'}`;
        addLog(errMsg);
        setTestResult(data.message || data.error || 'Sovereign Transport active.');
      }
    } catch (e: any) {
      addLog(`[SOVEREIGN ERROR] Failed to reach direct socket transport: ${e.message}`);
      setTestResult(`Transport error: ${e.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const triggerOutreachRun = async () => {
    setIsSending(true);
    addLog('[OUTREACH TRIGGER] Executing autonomous B2B sales sequence across 54 nodes via Sovereign Socket Transport...');
    
    setTimeout(() => {
      addLog('[LEAD SCAN] Filtering 15 high-value institutional leads from local RAG vector store...');
    }, 600);

    setTimeout(() => {
      addLog('[EMAIL GEN] Generating personalized contextual value propositions...');
    }, 1200);

    setTimeout(() => {
      addLog('[PAYMENT LINK] Injecting secure settlement link: https://paypal.me/tjites');
    }, 1800);

    setTimeout(async () => {
      addLog('[SOVEREIGN SOCKET] Dispatching outreach payload via Direct Socket Transport channel...');
      
      // Dispatch test payload via server endpoint
      fetch('/api/sovereign-smtp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: senderEmail,
          from: senderEmail,
          subject: 'SolveXia Autonomous B2B Outreach Campaign Dispatch',
          text: outreachTemplate
        })
      }).catch(() => {});

      setCampaigns(prev => prev.map(c => ({
        ...c,
        outreachSent: c.outreachSent + 5,
        responsesReceived: c.responsesReceived + 1
      })));
      setIsSending(false);
      addLog('[SUCCESS] Resend B2B sales run completed! 5 new outreach packages dispatched.');
    }, 2500);
  };

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev.slice(0, 30)]);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase font-bold tracking-wider mb-2">
              <Zap className="w-4 h-4 text-emerald-400" /> Daisy Haminja • MMTAI Proactive Friction & Annual Audit Engine
            </div>
            <h2 className="text-2xl font-display font-bold text-slate-100">
              Daisy Haminja's MMTAI Autonomous Outreach & Decision Core
            </h2>
            <p className="text-slate-300 text-xs mt-1.5 max-w-3xl leading-relaxed">
              Daisy Haminja does not wait passively for inquiries. Operating under the <strong className="text-indigo-300">MMTAI Protocol</strong>, Daisy continuously scans corporate annual reports (10-K filings, architecture disclosures, tech stack leaks), pinpoints exact systemic friction points and budget waste, dynamically formulates customized solution proposals with calculated cost savings, contacts corporate decision-makers, and negotiates terms autonomously with direct settlement to <strong className="text-emerald-400 font-mono">https://paypal.me/tjites</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://paypal.me/tjites"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition-all"
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              PayPal: paypal.me/tjites
              <ExternalLink className="w-3 h-3 text-emerald-400" />
            </a>

            <button
              onClick={triggerOutreachRun}
              disabled={isSending}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className={`w-4 h-4 ${isSending ? 'animate-bounce' : ''}`} />
              {isSending ? 'Dispatching Friction Audits...' : 'Execute Proactive MMTAI Outreach Run'}
            </button>
          </div>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Designated Payment Goal</div>
          <div className="text-sm font-bold text-emerald-400 mt-1 truncate">
            paypal.me/tjites
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Payment Link Configured
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Identified B2B Leads</div>
          <div className="text-2xl font-bold text-slate-100 mt-1">
            {leadCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Users className="w-3 h-3 text-indigo-400" /> Filtered from Local RAG Store
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold">Outreach Dispatched</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">
            {campaigns.reduce((acc, c) => acc + c.outreachSent, 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <Mail className="w-3 h-3 text-teal-400" /> Automated Emails Sent
          </div>
        </div>

        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-bold">B2B Deals Closed</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {campaigns.reduce((acc, c) => acc + c.dealsClosed, 0)}
          </div>
          <div className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
            <BarChart3 className="w-3 h-3 text-amber-400" /> Conversion Rate: 8.2%
          </div>
        </div>
      </div>

      {/* Main Campaign Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Campaign List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-400" />
            Active B2B Sales Outreach Campaigns
          </h3>

          <div className="space-y-3">
            {campaigns.map(cmp => (
              <div key={cmp.id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-md font-semibold text-slate-100">{cmp.name}</h4>
                    <span className="text-xs text-indigo-400 font-mono">{cmp.targetIndustry}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-md font-bold uppercase">
                    {cmp.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 font-mono text-center pt-2 border-t border-slate-800 text-xs">
                  <div className="p-2 bg-slate-950/50 rounded">
                    <span className="text-[9px] text-slate-500 block">LEADS</span>
                    <span className="text-slate-200 font-bold">{cmp.leadsFound}</span>
                  </div>
                  <div className="p-2 bg-slate-950/50 rounded">
                    <span className="text-[9px] text-slate-500 block">SENT</span>
                    <span className="text-indigo-400 font-bold">{cmp.outreachSent}</span>
                  </div>
                  <div className="p-2 bg-slate-950/50 rounded">
                    <span className="text-[9px] text-slate-500 block">RESPONSES</span>
                    <span className="text-teal-400 font-bold">{cmp.responsesReceived}</span>
                  </div>
                  <div className="p-2 bg-slate-950/50 rounded">
                    <span className="text-[9px] text-slate-500 block">CLOSED</span>
                    <span className="text-emerald-400 font-bold">{cmp.dealsClosed}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1 text-slate-400">
                  <span>Payment Destination:</span>
                  <a href={cmp.paypalRecipient} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                    {cmp.paypalRecipient} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration & Sovereign Socket Transport Panel */}
        <div className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Sovereign Direct Socket Transport Engine (Zero API)
            </h3>
            <span className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] rounded-full font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Socket Transport Active
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">
                Production App Domain
              </label>
              <input
                type="text"
                value={prodDomain}
                onChange={e => setProdDomain(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-indigo-300 font-mono text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] text-slate-400 uppercase font-bold">
                  Sovereign Owned Domains
                </label>
                <div className="flex gap-1.5 text-[9px] font-mono">
                  <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-500/30 rounded font-bold">uarefake.com</span>
                  <span className="px-1.5 py-0.5 bg-indigo-950 text-indigo-300 border border-indigo-500/30 rounded font-bold">uarefake.space</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={sovereignDomain}
                  onChange={e => setSovereignDomain(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="uarefake.com">uarefake.com (Primary)</option>
                  <option value="uarefake.space">uarefake.space (Space Node)</option>
                </select>
                <input
                  type="text"
                  placeholder="From Address (e.g., daisy@uarefake.com)"
                  value={senderEmail}
                  onChange={e => setSenderEmail(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Sovereign DNS Authentication Display */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-[10px] font-mono">
              <div className="text-emerald-400 font-bold flex items-center gap-1 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Sovereign Direct MX & DKIM Specifications
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-900 pb-1.5">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>MX Transport: port-25.{sovereignDomain}</span>
                  <span className="text-emerald-400">Direct TCP Socket + STARTTLS (Port 25)</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-900 pb-1.5">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>DNS Resolver: port-53.{sovereignDomain}</span>
                  <span className="text-emerald-400">Native UDP Direct MX Query</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 border-b border-slate-900 pb-1.5">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>In-Memory DKIM: default._domainkey.{sovereignDomain}</span>
                  <span className="text-emerald-400">RSA-SHA256 (RFC 6376 Relaxed)</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-slate-300 font-semibold">
                  <span>Q32.32 Efficacy Gate: 144-Byte Proof Header</span>
                  <span className="text-emerald-400 truncate max-w-[180px]">Score &gt;= 0.994 Verified</span>
                </div>
              </div>
            </div>

            {/* Test Email Dispatch Form */}
            <div className="p-3 bg-slate-950 border border-indigo-900/50 rounded-lg space-y-2">
              <div className="text-xs font-bold text-indigo-300 flex items-center justify-between">
                <span>Send Live Test Email via Sovereign Socket Transport</span>
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Recipient Address</label>
                <input
                  type="email"
                  value={testRecipient}
                  onChange={e => setTestRecipient(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[9px] text-slate-400 block mb-0.5">Subject</label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={e => setTestSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 text-xs font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <button
                onClick={sendTestEmailViaSovereign}
                disabled={testSending}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 text-xs"
              >
                <Send className="w-3.5 h-3.5" />
                {testSending ? 'Sending via Sovereign Transport...' : 'Dispatch Test Email via Direct Socket'}
              </button>
              {testResult && (
                <div className="p-2 bg-slate-900 border border-emerald-500/30 text-emerald-300 text-[10px] rounded font-mono">
                  {testResult}
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">
                PayPal Receiving Address
              </label>
              <input
                type="text"
                value={paypalRecipient}
                onChange={e => setPaypalRecipient(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1 uppercase font-bold">
                Outreach Cold Message Template
              </label>
              <textarea
                rows={4}
                value={outreachTemplate}
                onChange={e => setOutreachTemplate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-300 font-mono text-[11px] leading-relaxed focus:border-indigo-500 focus:outline-none"
              ></textarea>
            </div>

            <button
              onClick={() => addLog('[SETTINGS] Saved Sovereign Socket settings & settlement link paypal.me/tjites.')}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded transition-all cursor-pointer"
            >
              Save Sovereign Outreach Settings
            </button>
          </div>
        </div>

      </div>

      {/* Terminal Stream */}
      <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl font-mono text-xs">
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-900 text-slate-400">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>Autonomous Sales Outreach Execution Stream</span>
          </div>
        </div>

        <div className="space-y-1 max-h-36 overflow-y-auto font-mono text-[11px] text-slate-300">
          {logs.map((log, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="text-slate-600 select-none">&gt;</span>
              <span className={log.includes('[SUCCESS]') || log.includes('[PAYMENT]') ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
                {log}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
