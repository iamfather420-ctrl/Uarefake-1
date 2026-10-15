import React, { useState } from 'react';
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  Briefcase, 
  ShieldCheck, 
  DollarSign, 
  CheckCircle2, 
  Copy, 
  Check, 
  Filter, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Send, 
  ArrowRight, 
  ExternalLink, 
  Cpu, 
  RefreshCw, 
  Plus, 
  Layers, 
  Download, 
  Zap,
  Globe,
  Award
} from 'lucide-react';
import { 
  VentureIdea, 
  SolveXJobOpportunity, 
  INITIAL_VENTURE_IDEAS, 
  INITIAL_SOLVEX_JOBS, 
  evaluateCustomIdea 
} from '../data/ideaVaultData';

export const IdeaVaultView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'ideas' | 'jobs' | 'evaluator'>('ideas');
  
  // Venture Ideas State
  const [ideas, setIdeas] = useState<VentureIdea[]>(() => {
    try {
      const saved = localStorage.getItem('solvex_venture_ideas');
      return saved ? JSON.parse(saved) : INITIAL_VENTURE_IDEAS;
    } catch {
      return INITIAL_VENTURE_IDEAS;
    }
  });

  const [selectedIdea, setSelectedIdea] = useState<VentureIdea | null>(ideas[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Freelance Jobs State
  const [jobs, setJobs] = useState<SolveXJobOpportunity[]>(INITIAL_SOLVEX_JOBS);
  const [selectedJob, setSelectedJob] = useState<SolveXJobOpportunity | null>(jobs[0] || null);
  const [jobFilter, setJobFilter] = useState<string>('ALL');

  // Custom Idea Evaluator Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<VentureIdea | null>(null);

  const saveIdeasState = (updated: VentureIdea[]) => {
    setIdeas(updated);
    try {
      localStorage.setItem('solvex_venture_ideas', JSON.stringify(updated));
    } catch {}
  };

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = ideas.map(idea => 
      idea.id === id ? { ...idea, isBookmarked: !idea.isBookmarked } : idea
    );
    saveIdeasState(updated);
    if (selectedIdea?.id === id) {
      setSelectedIdea(prev => prev ? { ...prev, isBookmarked: !prev.isBookmarked } : null);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: VentureIdea['status']) => {
    const updated = ideas.map(idea => 
      idea.id === id ? { ...idea, status: newStatus } : idea
    );
    saveIdeasState(updated);
    if (selectedIdea?.id === id) {
      setSelectedIdea(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRunEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customDescription.trim()) return;

    setIsEvaluating(true);
    setTimeout(() => {
      const evaluated = evaluateCustomIdea(customTitle, customDescription);
      setEvalResult(evaluated);
      const updated = [evaluated, ...ideas];
      saveIdeasState(updated);
      setSelectedIdea(evaluated);
      setIsEvaluating(false);
    }, 800);
  };

  const handleApplyJobBid = (jobId: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: 'Bid Placed' } : j));
    if (selectedJob?.id === jobId) {
      setSelectedJob(prev => prev ? { ...prev, status: 'Bid Placed' } : null);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(ideas, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `solvex_idea_vault_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = 
      idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.originalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      idea.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (statusFilter === 'BOOKMARKED') return idea.isBookmarked;
    if (statusFilter !== 'ALL') return idea.status === statusFilter;
    return true;
  });

  const filteredJobs = jobs.filter(j => {
    if (jobFilter === 'ALL') return true;
    return j.board === jobFilter;
  });

  const totalVaultValuation = ideas.reduce((sum, item) => sum + item.valuation, 0);
  const totalB2BJobPool = jobs.reduce((sum, j) => sum + j.budgetNumeric, 0);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold px-3 py-1 rounded-full font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>SOLVEX-HUB VENTURE SCOUT & B2B CONTRACT ENGINE</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
              Autonomous Idea Vault & Opportunity Matcher
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Derived from <span className="text-cyan-300 font-mono font-semibold">Solvex-Hub</span>. Automated scouting of high-yield B2B problem statements, TAM/feasibility scoring, outreach pitch generation, and live zero-knowledge freelance contract matching across global talent boards.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <div className="bg-slate-900/90 border border-indigo-500/30 rounded-2xl p-4 min-w-[140px] shadow-inner">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Vault Valuation</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                ${totalVaultValuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{ideas.length} Scouted Ventures</div>
            </div>

            <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-4 min-w-[140px] shadow-inner">
              <div className="text-[11px] font-mono text-slate-400 uppercase">Live B2B Job Pool</div>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
                ${totalB2BJobPool.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">{jobs.length} Active Bounties</div>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-indigo-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('ideas')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
              activeSubTab === 'ideas'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Venture Idea Vault ({ideas.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('jobs')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
              activeSubTab === 'jobs'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30 ring-1 ring-cyan-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Briefcase className="w-4 h-4 text-cyan-300" />
            <span>SolveX B2B Contract Jobs ({jobs.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('evaluator')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold transition-all ${
              activeSubTab === 'evaluator'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Cpu className="w-4 h-4 text-purple-300" />
            <span>AI TAM & Valuation Evaluator</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SUB-TAB 1: VENTURE IDEA VAULT */}
      {/* ========================================================================= */}
      {activeSubTab === 'ideas' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Idea Feed & Filters */}
          <div className="lg:col-span-5 space-y-4">
            {/* Search & Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-md">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search problem, tags, TAM..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
              >
                <option value="ALL">All Stages</option>
                <option value="BOOKMARKED">Bookmarked</option>
                <option value="Scouted">Scouted</option>
                <option value="Evaluating">Evaluating</option>
                <option value="Outreach Sent">Outreach Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Signed Contract">Signed Contract</option>
                <option value="Secured Vault">Secured Vault</option>
              </select>

              <button
                onClick={handleExportJson}
                title="Export Vault Data to JSON"
                className="p-1.5 bg-slate-800 hover:bg-indigo-950 border border-slate-700 hover:border-indigo-500/40 rounded-xl text-slate-300 hover:text-indigo-300 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {/* Ideas List */}
            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredIdeas.length === 0 ? (
                <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs">
                  No venture ideas match the current filters. Try evaluating a custom concept!
                </div>
              ) : (
                filteredIdeas.map(idea => {
                  const isSelected = selectedIdea?.id === idea.id;
                  return (
                    <div
                      key={idea.id}
                      onClick={() => setSelectedIdea(idea)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-400 shadow-xl'
                          : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-indigo-300 border border-indigo-500/30">
                              {idea.source}
                            </span>
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              idea.status === 'Secured Vault' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' :
                              idea.status === 'Signed Contract' ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' :
                              idea.status === 'Accepted' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' :
                              'bg-slate-900 text-slate-400 border border-slate-800'
                            }`}>
                              {idea.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{idea.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{idea.originalText}</p>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={e => handleToggleBookmark(idea.id, e)}
                          className="text-slate-400 hover:text-amber-400 p-1 transition-colors"
                        >
                          {idea.isBookmarked ? (
                            <BookmarkCheck className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Bookmark className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Scores & Valuation Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-xs font-mono">
                        <div className="flex items-center space-x-3">
                          <span className="text-slate-400">TAM: <b className="text-indigo-300">{idea.tamScore}</b></span>
                          <span className="text-slate-400">Gap: <b className="text-cyan-300">{idea.gapScore}</b></span>
                          <span className="text-slate-400">Score: <b className="text-emerald-400">{idea.totalScore}/100</b></span>
                        </div>
                        <div className="font-bold text-amber-400">
                          ${idea.valuation.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Selected Idea Deep Dive & Outreach Matrix */}
          <div className="lg:col-span-7">
            {selectedIdea ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-20">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono text-indigo-400 font-bold uppercase">{selectedIdea.source}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-mono">Scouted from {selectedIdea.author}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white font-mono">{selectedIdea.title}</h2>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono text-slate-400">Market Valuation</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">
                      ${selectedIdea.valuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                {/* Score Matrix & Gauges */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-950 border border-indigo-500/20 rounded-2xl p-3 text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">TAM Score</div>
                    <div className="text-xl font-bold font-mono text-indigo-400 mt-0.5">{selectedIdea.tamScore}%</div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${selectedIdea.tamScore}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-cyan-500/20 rounded-2xl p-3 text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Feasibility</div>
                    <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">{selectedIdea.feasibilityScore}%</div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${selectedIdea.feasibilityScore}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-emerald-500/20 rounded-2xl p-3 text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Market Gap</div>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">{selectedIdea.gapScore}%</div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${selectedIdea.gapScore}%` }} />
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-amber-500/20 rounded-2xl p-3 text-center">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Composite Total</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-0.5">{selectedIdea.totalScore}/100</div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1.5 overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: `${selectedIdea.totalScore}%` }} />
                    </div>
                  </div>
                </div>

                {/* Problem Statement & Analysis */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Problem Statement & Market Horizon</span>
                  </h3>
                  <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed font-sans">
                    <p className="italic text-slate-200">"{selectedIdea.originalText}"</p>
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className="text-cyan-400 font-semibold">{selectedIdea.marketSize}</span>
                      <span className="text-slate-400">Timeframe: {selectedIdea.executionTimeframe}</span>
                    </div>
                  </div>
                </div>

                {/* Dialectic Analysis Details */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>SolveX Dialectic Analysis & Competitive Edge</span>
                  </h3>
                  <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 leading-relaxed">
                    {selectedIdea.analysisDetails}
                  </p>
                </div>

                {/* Generated Client / Investor Outreach Message */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center space-x-1.5">
                      <Send className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Turnkey Outreach Pitch Script</span>
                    </h3>
                    <button
                      onClick={() => handleCopy(selectedIdea.outreachMessage, 'outreach')}
                      className="flex items-center space-x-1 text-[11px] font-mono text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-950/60 border border-indigo-500/30 transition-colors"
                    >
                      {copiedId === 'outreach' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Pitch</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {selectedIdea.outreachMessage}
                  </pre>
                </div>

                {/* Stage Progression Lifecycle */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-mono text-slate-400 uppercase">Update Venture Lifecycle Stage:</label>
                  <div className="flex flex-wrap gap-2">
                    {(['Scouted', 'Evaluating', 'Outreach Sent', 'Accepted', 'Signed Contract', 'Payout Completed', 'Secured Vault'] as VentureIdea['status'][]).map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(selectedIdea.id, st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                          selectedIdea.status === st
                            ? 'bg-indigo-600 text-white font-bold shadow-md shadow-indigo-900/40 border border-indigo-400'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs">
                Select an idea from the list to view the valuation matrix and outreach proposal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 2: SOLVEX B2B FREELANCE JOBS & CONTRACT MATCHER */}
      {/* ========================================================================= */}
      {activeSubTab === 'jobs' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Jobs Feed */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-md">
              <span className="text-xs font-mono text-slate-300 font-bold flex items-center space-x-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Aggregated Talent Boards:</span>
              </span>

              <select
                value={jobFilter}
                onChange={e => setJobFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Boards</option>
                <option value="upwork">Upwork Global</option>
                <option value="toptal">Toptal Network</option>
                <option value="freelancer">Freelancer Enterprise</option>
                <option value="peopleperhour">PeoplePerHour</option>
                <option value="smart-contract">Smart Contract Bounty</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[700px] overflow-y-auto pr-1 scrollbar-thin">
              {filteredJobs.map(job => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500 ring-1 ring-cyan-400 shadow-xl'
                        : 'bg-slate-950/80 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-cyan-500/30">
                            {job.board}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{job.postedAgo}</span>
                          {job.zkpVerified && (
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              ZKP Matched
                            </span>
                          )}
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{job.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2">{job.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold font-mono text-emerald-400">{job.budget}</div>
                        <div className="text-[10px] font-mono text-slate-400">{job.clientCountry}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60 text-xs font-mono">
                      <span className="text-slate-400">Match Score: <b className="text-cyan-300">{job.matchScore}%</b></span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                        job.status === 'Bid Placed' ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' :
                        job.status === 'In Negotiation' ? 'bg-amber-950 text-amber-300 border border-amber-500/30' :
                        'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Selected Job Bid Composer */}
          <div className="lg:col-span-7">
            {selectedJob ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 sticky top-20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono uppercase text-cyan-400 font-bold">{selectedJob.board}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 font-mono">Client in {selectedJob.clientCountry} (Rating: {selectedJob.clientReputation}★)</span>
                    </div>
                    <h2 className="text-xl font-bold text-white font-mono">{selectedJob.title}</h2>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-mono text-slate-400">Budget / Escrow</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">{selectedJob.budget}</div>
                  </div>
                </div>

                {/* Job Details & Required Skills */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase font-mono text-slate-300">Mandate Description</h3>
                  <p className="text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800 leading-relaxed font-sans">
                    {selectedJob.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {selectedJob.requiredSkills.map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-950 text-cyan-300 border border-cyan-500/20">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Turnkey AI-Generated Proposal */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase font-mono text-slate-300 flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>One-Click Turnkey Proposal Script</span>
                    </h3>
                    <button
                      onClick={() => handleCopy(selectedJob.generatedProposal, selectedJob.id)}
                      className="flex items-center space-x-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-300 px-2 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 transition-colors"
                    >
                      {copiedId === selectedJob.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Proposal</span>
                        </>
                      )}
                    </button>
                  </div>

                  <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                    {selectedJob.generatedProposal}
                  </pre>
                </div>

                {/* Action Row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <div className="text-xs font-mono text-slate-400">
                    Suggested Optimal Bid: <b className="text-emerald-400">{selectedJob.suggestedBid}</b>
                  </div>

                  <button
                    onClick={() => handleApplyJobBid(selectedJob.id)}
                    disabled={selectedJob.status === 'Bid Placed'}
                    className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedJob.status === 'Bid Placed'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40 cursor-default'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/30'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{selectedJob.status === 'Bid Placed' ? 'Bid Registered in Vault' : 'Transmit Automated Bid'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs">
                Select a B2B contract opportunity to inspect criteria and transmit an automated proposal.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-TAB 3: AI TAM & VALUATION EVALUATOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'evaluator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-mono flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-purple-400" />
                <span>Evaluate Any Problem or Startup Concept</span>
              </h2>
              <p className="text-xs text-slate-400">
                Input any user problem, market friction, or business proposal to calculate TAM, Feasibility, Gap index, and commercial valuation.
              </p>
            </div>

            <form onSubmit={handleRunEvaluation} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Venture / Solution Title:</label>
                <input
                  type="text"
                  placeholder="e.g. Decentralized Sub-Millisecond Settlement Bridge"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300">Problem Statement & Functional Description:</label>
                <textarea
                  rows={5}
                  placeholder="Describe the friction, target user persona, compliance challenges, or technical bottleneck..."
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isEvaluating || !customTitle.trim()}
                className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:from-purple-500 hover:to-cyan-400 text-white shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
              >
                {isEvaluating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Evaluating TAM Vectors & Calculating Valuation...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Run Solvex Dialectic Evaluation & Store in Vault</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Evaluation Result Preview */}
          <div className="lg:col-span-6">
            {evalResult ? (
              <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 shadow-2xl space-y-6 animate-fade-in">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 border border-purple-500/30">
                      Evaluated & Added to Vault
                    </span>
                    <h3 className="text-lg font-bold text-white font-mono">{evalResult.title}</h3>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono text-slate-400">Assessed Valuation</div>
                    <div className="text-xl font-bold font-mono text-emerald-400">
                      ${evalResult.valuation.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3 rounded-2xl text-center border border-indigo-500/20">
                    <div className="text-[10px] font-mono text-slate-400">TAM Score</div>
                    <div className="text-lg font-bold font-mono text-indigo-400">{evalResult.tamScore}%</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl text-center border border-cyan-500/20">
                    <div className="text-[10px] font-mono text-slate-400">Feasibility</div>
                    <div className="text-lg font-bold font-mono text-cyan-400">{evalResult.feasibilityScore}%</div>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-2xl text-center border border-emerald-500/20">
                    <div className="text-[10px] font-mono text-slate-400">Total Index</div>
                    <div className="text-lg font-bold font-mono text-emerald-400">{evalResult.totalScore}/100</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-mono text-slate-300 font-bold">Turnkey Outreach Pitch Script:</div>
                  <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {evalResult.outreachMessage}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-900/40 border border-dashed border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs">
                Submit a problem or concept to see the real-time AI valuation and pitch script here.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
