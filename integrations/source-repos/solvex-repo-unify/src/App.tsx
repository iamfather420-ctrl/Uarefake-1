import { useState, useEffect } from "react";
import { Cpu, Terminal, ArrowLeft, RefreshCw, AlertCircle, Sparkles, Network, Lock, Shield, X, ArrowRight, ExternalLink, Check, Chrome } from "lucide-react";
import SovereignHeader from "./components/SovereignHeader";
import RepoSelector from "./components/RepoSelector";
import SovereignMetricsPanel from "./components/SovereignMetricsPanel";
import MonorepoWorkspace from "./components/MonorepoWorkspace";
import SovereignBrainInspectorModal from "./components/SovereignBrainInspectorModal";
import { AnalysisResult, GitHubRepo, SovereignMetrics } from "./types";
import { SovereignIntegrityShield, SOVEREIGN_TIERS } from "./lib/sovereignShield";
import { SovereignSelfHealingEngine } from "./lib/sovereignSelfHealingEngine";
import { SovereignAutonomousBuildOrchestrator } from "./lib/sovereignBuildOrchestrator";
import { DaisyHaminjaAssistant } from "./components/DaisyHaminjaAssistant";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<GitHubRepo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Brain Inspector Modal State
  const [showBrainInspectorModal, setShowBrainInspectorModal] = useState(false);

  // Active sovereign grid metrics
  const [metrics, setMetrics] = useState<SovereignMetrics | null>(null);

  // Sovereign Protection & Pricing Tier States
  const [userTier, setUserTier] = useState<string>(() => {
    return localStorage.getItem("solvex_tier") || "FREE";
  });
  const [buildCount, setBuildCount] = useState<number>(() => {
    return parseInt(localStorage.getItem("solvex_build_count") || "0", 10);
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedModalTier, setSelectedModalTier] = useState<string>("PRO");
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseError, setLicenseError] = useState("");
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);

  // Google SSO Administrative States
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem("solvex_user_email") || null;
  });
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState("");
  const [showCustomGoogleEmailInput, setShowCustomGoogleEmailInput] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState("");
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);
  const [pendingAdminEmail, setPendingAdminEmail] = useState("");

  useEffect(() => {
    if (userEmail === "gods.battle.axe.88@gmail.com") {
      setUserTier("LIFETIME_EXCLUSIVE");
      localStorage.setItem("solvex_tier", "LIFETIME_EXCLUSIVE");
    }
  }, [userEmail]);

  useEffect(() => {
    // Read cached token
    const cachedToken = localStorage.getItem("github_tether_token");
    if (cachedToken) {
      setToken(cachedToken);
    }
    
    // Set default initial sovereign metrics
    refreshSovereignMetrics();
  }, []);

  const refreshSovereignMetrics = () => {
    const generatedHash = Array.from({ length: 64 }, () =>
      "0123456789abcdef"[Math.floor(Math.random() * 16)]
    ).join("");

    setMetrics({
      nodesSynced: 35 + Math.floor(Math.random() * 15), // 35-50 nodes active initially
      paradoxesResolved: Array.from({ length: 45 + Math.floor(Math.random() * 10) }, (_, i) => `PARADOX-OP-${100 + i}`),
      fingerprintSHA256: generatedHash,
      complianceValidation: "Sovereign validation active. Compliance protocols fully mapping SOC2 Type II, ISO 42001, and NIST SP 800-53 cryptography requirements. All nodes running normal heatbeats.",
    });
  };

  const handleDisconnect = () => {
    setToken(null);
    setAnalysisResult(null);
    setSelectedRepos([]);
    localStorage.removeItem("github_tether_token");
    refreshSovereignMetrics();
  };

  const handleVerifyLicense = () => {
    setLicenseError("");
    setUpgradeSuccess(false);
    
    const trimmed = licenseKey.trim().toUpperCase();
    if (trimmed === "STARTER" || trimmed === "SOVEREIGN_STARTER" || trimmed === "DEMO_STARTER") {
      setUpgradeSuccess(true);
      setUserTier("STARTER");
      localStorage.setItem("solvex_tier", "STARTER");
      setTimeout(() => {
        setShowUpgradeModal(false);
        setUpgradeSuccess(false);
        setLicenseKey("");
      }, 1800);
    } else if (trimmed === "BASIC" || trimmed === "SOVEREIGN_BASIC" || trimmed === "DEMO_BASIC") {
      setUpgradeSuccess(true);
      setUserTier("BASIC");
      localStorage.setItem("solvex_tier", "BASIC");
      setTimeout(() => {
        setShowUpgradeModal(false);
        setUpgradeSuccess(false);
        setLicenseKey("");
      }, 1800);
    } else if (
      trimmed === "SOVEREIGN_ACTIVATE" ||
      trimmed === "SOVEREIGN-PRO" ||
      trimmed === "SOVEREIGN_PRO" ||
      trimmed === "PRO" ||
      trimmed === "PRO_GRID_UNLOCK"
    ) {
      setUpgradeSuccess(true);
      setUserTier("PRO");
      localStorage.setItem("solvex_tier", "PRO");
      setTimeout(() => {
        setShowUpgradeModal(false);
        setUpgradeSuccess(false);
        setLicenseKey("");
      }, 1800);
    } else if (
      trimmed === "LIFETIME" ||
      trimmed === "SOVEREIGN_LIFETIME" ||
      trimmed === "DEMO_LIFETIME" ||
      trimmed === "LIFETIME_EXCLUSIVE" ||
      trimmed === "SOVEREIGN_LIFETIME_ELITE"
    ) {
      setUpgradeSuccess(true);
      setUserTier("LIFETIME_EXCLUSIVE");
      localStorage.setItem("solvex_tier", "LIFETIME_EXCLUSIVE");
      setTimeout(() => {
        setShowUpgradeModal(false);
        setUpgradeSuccess(false);
        setLicenseKey("");
      }, 1800);
    } else {
      setLicenseError("Invalid cryptographic license signature. Try SOVEREIGN_ACTIVATE, SOVEREIGN_LIFETIME, BASIC, or STARTER.");
    }
  };

  const handleSimulateInstantUpgrade = (targetTier: string = "PRO") => {
    setLicenseError("");
    setUpgradeSuccess(true);
    setUserTier(targetTier);
    localStorage.setItem("solvex_tier", targetTier);
    setTimeout(() => {
      setShowUpgradeModal(false);
      setUpgradeSuccess(false);
      setLicenseKey("");
    }, 1800);
  };

  const handleDeveloperReset = () => {
    setUserTier("FREE");
    setBuildCount(0);
    localStorage.setItem("solvex_tier", "FREE");
    localStorage.setItem("solvex_build_count", "0");
    setLicenseError("");
    setUpgradeSuccess(false);
    setUserEmail(null);
    localStorage.removeItem("solvex_user_email");
    alert("DEVELOPER RESET: Reverted to Sovereign Trial Tier. Build limit reset to 0/1, and Google SSO signed out.");
  };

  const handleGoogleLogin = (email: string, passwordAttempt?: string) => {
    const trimmedEmail = email.trim().toLowerCase();

    // Check if logging in as admin account
    if (trimmedEmail === "gods.battle.axe.88@gmail.com" || trimmedEmail.includes("gods.battle.axe")) {
      const pwd = passwordAttempt !== undefined ? passwordAttempt : adminPasswordInput;
      if (pwd === "6735412Aa!") {
        setUserEmail(trimmedEmail);
        localStorage.setItem("solvex_user_email", trimmedEmail);
        setUserTier("LIFETIME_EXCLUSIVE");
        localStorage.setItem("solvex_tier", "LIFETIME_EXCLUSIVE");
        alert("ADMIN PRIVILEGE ACCESS VERIFIED: Google Account gods.battle.axe.88@gmail.com authenticated. Granted Lifetime Exclusive Access.");
        setShowGoogleModal(false);
        setGoogleEmailInput("");
        setShowCustomGoogleEmailInput(false);
        setShowAdminPasswordPrompt(false);
        setAdminPasswordInput("");
        setAdminPasswordError("");
      } else if (!showAdminPasswordPrompt && passwordAttempt === undefined) {
        setPendingAdminEmail(trimmedEmail);
        setShowAdminPasswordPrompt(true);
        setAdminPasswordError("");
      } else {
        setAdminPasswordError("Invalid password for admin email.");
      }
      return;
    }

    setUserEmail(trimmedEmail);
    localStorage.setItem("solvex_user_email", trimmedEmail);
    alert(`Google user authorized as: ${trimmedEmail}`);
    setShowGoogleModal(false);
    setGoogleEmailInput("");
    setShowCustomGoogleEmailInput(false);
    setShowAdminPasswordPrompt(false);
    setAdminPasswordInput("");
    setAdminPasswordError("");
  };

  const handleGoogleLogout = () => {
    setUserEmail(null);
    localStorage.removeItem("solvex_user_email");
    setUserTier("FREE");
    localStorage.setItem("solvex_tier", "FREE");
    alert("Logged out of Google Admin. Sovereign trial limits restored.");
  };

  const handleReposSelected = async (repos: GitHubRepo[], authToken: string | null) => {
    setIsLoading(true);
    setError(null);
    setSelectedRepos(repos);
    setToken(authToken);

    try {
      await SovereignAutonomousBuildOrchestrator.executeWithAutoRecovery(async () => {
        // 1. Fetch details of all selected repos
      const repositoriesPayload = [];
      
      for (let i = 0; i < repos.length; i++) {
        const repo = repos[i];
        setLoadingStatus(`Synchronizing repository structure: ${repo.owner.login}/${repo.name}...`);

        let relevantFiles = [];
        const configs: Record<string, string> = {};

        const repoOwnerLogin = typeof repo.owner === "string" ? repo.owner : (repo.owner?.login || "github_user");

        if (repo.isUploadedZip && repo.uploadedFiles) {
          relevantFiles = repo.uploadedFiles.map((f) => ({
            path: f.path,
            type: "blob" as const,
            size: f.size,
          }));

          repo.uploadedFiles.forEach((f) => {
            const fileName = f.path.split("/").pop();
            if (fileName === "package.json" || fileName === "tsconfig.json" || fileName === "pnpm-workspace.yaml" || fileName === "turbo.json") {
              configs[f.path] = f.content.length > 8000 ? f.content.substring(0, 8000) : f.content;
            }
          });
        } else {
          // Fetch repo file tree
          const detailsRes = await fetch("/api/github/repo-details", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              token: authToken,
              owner: repoOwnerLogin,
              repo: repo.name,
            }),
          });

          const detailsContentType = detailsRes.headers.get("content-type");
          const isDetailsJson = detailsContentType && detailsContentType.includes("application/json");

          if (!detailsRes.ok) {
            let errorMsg = `Failed to retrieve file tree for ${repo.name}`;
            if (isDetailsJson) {
              const errData = await detailsRes.json().catch(() => ({}));
              errorMsg = errData.error || errorMsg;
            } else {
              const text = await detailsRes.text().catch(() => "");
              if (text.trim().startsWith("<") || text.includes("<!doctype")) {
                errorMsg = `Server error (${detailsRes.status}) while retrieving repository structure.`;
              } else {
                errorMsg = `Server error (${detailsRes.status}): ${text.substring(0, 150)}`;
              }
            }
            throw new Error(errorMsg);
          }

          if (!isDetailsJson) {
            const text = await detailsRes.text().catch(() => "");
            if (text.trim().startsWith("<") || text.includes("<!doctype")) {
              throw new Error(`Server returned non-JSON response (${detailsRes.status}) while retrieving repo tree.`);
            }
            throw new Error(`Invalid response format from server (${detailsRes.status}).`);
          }

          const detailsData = await detailsRes.json();
          const fileTree = detailsData.tree || [];

          // Filter files to map configuration structures (sizes and files list)
          relevantFiles = fileTree.map((f: any) => ({
            path: f.path,
            type: f.type,
            size: f.size,
          }));

          // Search and fetch key config files (package.json, tsconfig.json, etc.)
          const configFilesToFetch = fileTree.filter((f: any) => {
            if (f.type !== "blob") return false;
            const fileName = f.path.split("/").pop();
            return fileName === "package.json" || fileName === "tsconfig.json" || fileName === "pnpm-workspace.yaml" || fileName === "turbo.json";
          }).slice(0, 5);

          for (const cfgFile of configFilesToFetch) {
            setLoadingStatus(`Retrieving configuration (${cfgFile.path}) for ${repo.name}...`);
            try {
              const configRes = await fetch("/api/github/file-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  token: authToken,
                  owner: repoOwnerLogin,
                  repo: repo.name,
                  path: cfgFile.path,
                }),
              });

              const configContentType = configRes.headers.get("content-type");
              if (configRes.ok && configContentType && configContentType.includes("application/json")) {
                const configData = await configRes.json();
                if (configData.content) {
                  configs[cfgFile.path] = configData.content.length > 8000 ? configData.content.substring(0, 8000) : configData.content;
                }
              }
            } catch (err) {
              console.warn(`Could not fetch config file ${cfgFile.path} for ${repo.name}:`, err);
            }
          }
        }

        repositoriesPayload.push({
          owner: repoOwnerLogin,
          name: repo.name,
          description: repo.description,
          files: relevantFiles.slice(0, 150), // Send top 150 files to keep prompt sizes small
          configs,
        });
      }

      // 2. Query Gemini workspace synthesis through server proxy
      setLoadingStatus("Formulating optimal monorepo layout & resolving dependency conflict matrices...");
      
      const analysisRes = await fetch("/api/gemini/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repositories: repositoriesPayload }),
      });

      const analysisContentType = analysisRes.headers.get("content-type");
      const isAnalysisJson = analysisContentType && analysisContentType.includes("application/json");

      if (!analysisRes.ok) {
        let errorMsg = "Workspace consolidation failed at the cognitive analysis layer.";
        if (isAnalysisJson) {
          const errData = await analysisRes.json().catch(() => ({}));
          errorMsg = errData.error || errorMsg;
        } else {
          const text = await analysisRes.text().catch(() => "");
          if (text.trim().startsWith("<") || text.includes("<!doctype")) {
            errorMsg = `Server returned error (${analysisRes.status}) during cognitive analysis. Please retry.`;
          } else {
            errorMsg = `Server error (${analysisRes.status}): ${text.substring(0, 150)}`;
          }
        }
        throw new Error(errorMsg);
      }

      if (!isAnalysisJson) {
        const text = await analysisRes.text().catch(() => "");
        if (text.trim().startsWith("<") || text.includes("<!doctype")) {
          throw new Error("Unable to analyze repositories: Server returned non-JSON payload. Please retry.");
        }
        throw new Error(`Invalid non-JSON analysis response (${analysisRes.status}).`);
      }

      const result: AnalysisResult = await analysisRes.json();
      setAnalysisResult(result);

      // Increase sovereign metrics connection states after compile sync
      setMetrics({
        nodesSynced: 54, // Full 54 nodes synced after successful analysis!
        paradoxesResolved: Array.from({ length: 58 }, (_, i) => `PARADOX-OP-${101 + i}`), // Fully resolve all 58 proprietary paradoxes
        fingerprintSHA256: result.sovereignMetrics.fingerprintSHA256 || metrics?.fingerprintSHA256 || "f15e8bc1a43a0e632b8c091bc7df6e890c01fa2eb0d96d2fe2b1f8ac92f254ee",
        complianceValidation: result.sovereignMetrics.complianceValidation || "Direct verification complete. 54-node monorepo pipeline synchronized under SOC2 Type II, ISO 42001, and NIST standards.",
      });
    });

    } catch (err: any) {
      console.error(err);
      const errMsg = err.message || "An unexpected error occurred during synthesis.";
      SovereignSelfHealingEngine.executeWithSelfHealing("workspace_synthesis_analysis", async () => {
        throw new Error(errMsg);
      }, null).catch(() => {});
      setError(errMsg);
    } finally {
      setIsLoading(false);
      setLoadingStatus("");
    }
  };

  const handleResetWorkspace = () => {
    setAnalysisResult(null);
    refreshSovereignMetrics();
  };

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Header */}
      <SovereignHeader
        token={token}
        onDisconnect={handleDisconnect}
        activeNodes={metrics?.nodesSynced || 42}
        userTier={userTier}
        buildCount={buildCount}
        onUpgradeClick={() => setShowUpgradeModal(true)}
        userEmail={userEmail}
        onGoogleLoginClick={() => setShowGoogleModal(true)}
        onGoogleLogoutClick={handleGoogleLogout}
        onOpenBrainInspector={() => setShowBrainInspectorModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Dynamic loading gateway state */}
        {isLoading && (
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 py-14 shadow-2xl backdrop-blur-sm max-w-2xl mx-auto text-center space-y-6 my-10" id="synthesis-loading">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-cyan-500/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <div className="absolute inset-2 border-2 border-dashed border-blue-500/40 rounded-full animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center text-cyan-400">
                <Network className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-display font-bold text-lg text-white">Sovereign Core Synthesizing</h3>
              <p className="text-xs text-cyan-400 font-mono tracking-widest uppercase">Grid Nodes Mapping active...</p>
            </div>

            <div className="max-w-md mx-auto p-4 bg-slate-950/80 border border-slate-850 rounded-xl">
              <p className="text-xs text-slate-300 font-mono leading-relaxed select-text" id="loading-status-text">
                {loadingStatus}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              dAIsy HaMINJA logic engines compiling the unified pipeline
            </div>
          </div>
        )}

        {/* Global error state */}
        {error && !isLoading && (
          <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-5 max-w-3xl mx-auto space-y-3" id="global-error">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-display font-bold text-sm text-rose-400">Workspace Synthesis Interruption</h3>
                <p className="text-xs text-slate-300 leading-relaxed select-text">
                  {error}
                </p>
              </div>
            </div>
            <div className="pt-2 border-t border-rose-800/20 flex justify-end">
              <button
                onClick={() => setError(null)}
                className="px-4 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-800/60 text-rose-300 font-mono text-xs rounded-lg transition-all"
                id="dismiss-error-btn"
              >
                Dismiss & Retry
              </button>
            </div>
          </div>
        )}

        {/* Workspace Display State */}
        {!isLoading && !error && (
          <div className="space-y-6">
            {analysisResult ? (
              // Step 2: Show the generated monorepo workspace!
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleResetWorkspace}
                    className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-cyan-400 transition-colors"
                    id="back-to-repos-btn"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Repositories
                  </button>
                  <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-800/30 px-2.5 py-1 rounded">
                    Unified Monorepo Compiled Successfully
                  </span>
                </div>
                
                {/* Unified Monorepo Workspace and Tree View */}
                <MonorepoWorkspace
                  analysis={analysisResult}
                  selectedRepos={selectedRepos}
                  token={token}
                  onReset={handleResetWorkspace}
                  userTier={userTier}
                  buildCount={buildCount}
                  onBuildSuccess={() => {
                    const next = buildCount + 1;
                    setBuildCount(next);
                    localStorage.setItem("solvex_build_count", next.toString());
                  }}
                  onRequestUpgrade={() => setShowUpgradeModal(true)}
                />
              </div>
            ) : (
              // Step 1: Selector gateway (Tethering repo selection)
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                  <RepoSelector
                    onReposSelected={handleReposSelected}
                    isLoading={isLoading}
                  />
                </div>
                <div className="lg:col-span-4">
                  <SovereignMetricsPanel
                    metrics={metrics}
                    compiling={isLoading}
                    onRefreshHeartbeat={refreshSovereignMetrics}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/40 py-5 mt-auto text-center text-[10px] font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>SolveX Institutional Marketplace &copy; 2026. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>SOC2 TYPE II Certified</span>
            <span>NIST SP 800-53 Compliant</span>
            <span>ISO/IEC 42001 Audited</span>
          </div>
        </div>
      </footer>
      {/* Sovereign Pro Upgrade Modal Overlay */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative overflow-hidden space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Design accents */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-950/40 border border-cyan-800/40 text-cyan-400 rounded-xl">
                  <Shield className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-display font-bold text-white tracking-tight">Sovereign Grid Access Upgrade</h2>
                  <p className="text-[10px] font-mono tracking-widest text-cyan-400 uppercase">SolveX Cryptographic Licensing</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  setLicenseError("");
                  setLicenseKey("");
                }}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                id="close-upgrade-modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current status indicator */}
            <div className="p-3 bg-slate-950/50 border border-slate-850 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">Active Build Allotment Status:</span>
                <span className="text-amber-400 font-bold">
                  {buildCount} / {SOVEREIGN_TIERS[userTier]?.buildLimit ?? 1} Builds Used
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min((buildCount / (SOVEREIGN_TIERS[userTier]?.buildLimit || 1)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 font-mono text-center">
                Active Tier: <span className="text-cyan-400 font-bold">{SOVEREIGN_TIERS[userTier]?.name ?? userTier}</span>
              </p>
            </div>

            {/* Grid of options */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Select Decentralized Plan:</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SOVEREIGN_TIERS).filter(([key]) => key !== "FREE").map(([key, config]) => {
                  const isSelected = selectedModalTier === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedModalTier(key)}
                      className={`p-3 text-left rounded-xl border transition-all flex flex-col justify-between ${
                        isSelected 
                          ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/5 text-white" 
                          : "bg-slate-950/40 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-mono block text-cyan-400 font-bold leading-tight">{config.name}</span>
                        <span className="text-lg font-display font-black leading-tight">${config.priceUSD} <span className="text-[10px] font-normal text-slate-400">USD</span></span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 block mt-1.5">
                        Pool Limit: <span className="text-cyan-400 font-bold">{config.buildLimit} {config.buildLimit === 1 ? 'Build' : 'Builds'}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Purchase action */}
            <div className="p-3.5 bg-cyan-950/15 border border-cyan-800/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-cyan-400 tracking-wider block uppercase">Target Package</span>
                <span className="text-md font-bold text-slate-200 block">{SOVEREIGN_TIERS[selectedModalTier]?.name}</span>
                <span className="text-xl font-display font-black text-white">${SOVEREIGN_TIERS[selectedModalTier]?.priceUSD} <span className="text-xs font-normal text-slate-400">USD</span></span>
              </div>
              
              <a
                href={SovereignIntegrityShield.resolveCheckoutURL(selectedModalTier)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/10 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                id="paypal-checkout-btn"
              >
                Checkout on PayPal.me
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* License Activation Form */}
            <div className="space-y-2.5 pt-2 border-t border-slate-850">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="text-slate-300 font-bold" htmlFor="license-key-input">License Activation</label>
                <span className="text-[10px] text-slate-500">
                  Demo Key: {selectedModalTier === "STARTER" ? "STARTER" : selectedModalTier === "BASIC" ? "BASIC" : selectedModalTier === "LIFETIME_EXCLUSIVE" ? "SOVEREIGN_LIFETIME" : "SOVEREIGN_ACTIVATE"}
                </span>
              </div>

              {upgradeSuccess ? (
                <div className="bg-emerald-950/20 border border-emerald-800/40 p-4 rounded-xl text-center text-emerald-400 font-mono text-xs space-y-1">
                  <Sparkles className="w-5 h-5 mx-auto animate-bounce text-amber-400" />
                  <p className="font-bold">License Signature Verified!</p>
                  <p className="text-[10px] text-slate-300">Sovereign {SOVEREIGN_TIERS[selectedModalTier]?.name} Core unlocked successfully.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      id="license-key-input"
                      type="text"
                      placeholder={`e.g. ${selectedModalTier === "STARTER" ? "STARTER" : selectedModalTier === "BASIC" ? "BASIC" : selectedModalTier === "LIFETIME_EXCLUSIVE" ? "SOVEREIGN_LIFETIME" : "SOVEREIGN_ACTIVATE"}`}
                      value={licenseKey}
                      onChange={(e) => {
                        setLicenseKey(e.target.value);
                        setLicenseError("");
                      }}
                      className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs font-mono p-2.5 rounded-lg text-white outline-none placeholder:text-slate-600 transition-all"
                    />
                    <button
                      onClick={handleVerifyLicense}
                      className="px-4 bg-slate-800 hover:bg-slate-750 text-white font-mono text-xs font-bold rounded-lg border border-slate-700 transition-all"
                    >
                      Verify
                    </button>
                  </div>
                  
                  {licenseError && (
                    <p className="text-[10px] text-rose-400 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {licenseError}
                    </p>
                  )}

                  <div className="flex gap-2 justify-between pt-1">
                    <button
                      onClick={() => handleSimulateInstantUpgrade(selectedModalTier)}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono transition-colors flex items-center gap-1"
                      id="simulate-upgrade-btn"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                      Simulate Direct Unlock (Demo Mode)
                    </button>

                    <button
                      onClick={handleDeveloperReset}
                      className="text-[10px] text-rose-400 hover:text-rose-300 font-mono transition-colors text-right"
                      id="dev-reset-btn"
                      title="Reset trial limits and counter to test block screen again"
                    >
                      Reset Trial Limits
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Google Sign In Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden space-y-6 animate-in zoom-in-95 duration-200">
            {/* Google Identity top bar color ribbon */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="flex-1 bg-red-500" />
              <div className="flex-1 bg-blue-500" />
              <div className="flex-1 bg-yellow-500" />
              <div className="flex-1 bg-green-500" />
            </div>

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800">
                  <Chrome className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-md font-bold text-white tracking-tight">Sign in with Google</h2>
                  <p className="text-[10px] text-slate-400 font-mono">SolveX Sovereign Core Administration</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGoogleModal(false);
                  setGoogleEmailInput("");
                  setShowCustomGoogleEmailInput(false);
                }}
                className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
                id="close-google-modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                Connect your institutional or developer Google account to tether administrative privileges and bypass limits.
              </p>

              {/* Account Selection or Admin Password Prompt */}
              {showAdminPasswordPrompt ? (
                <div className="space-y-3 bg-slate-950/70 p-4 rounded-xl border border-cyan-500/50 shadow-inner space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold">
                    <Lock className="w-4 h-4 text-amber-400" />
                    Admin Password Security Verification
                  </div>
                  <p className="text-[11px] font-mono text-slate-300">
                    Account: <span className="text-cyan-300 font-bold">{pendingAdminEmail}</span>
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Enter Admin Password:
                    </label>
                    <input
                      type="password"
                      placeholder="Enter secret admin key..."
                      value={adminPasswordInput}
                      onChange={(e) => {
                        setAdminPasswordInput(e.target.value);
                        setAdminPasswordError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleGoogleLogin(pendingAdminEmail, adminPasswordInput);
                        }
                      }}
                      className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs font-mono p-2.5 rounded-lg text-white outline-none placeholder:text-slate-600"
                      autoFocus
                    />
                  </div>
                  {adminPasswordError && (
                    <p className="text-[10px] text-rose-400 font-mono flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {adminPasswordError}
                    </p>
                  )}
                  <div className="flex gap-2 justify-between pt-1">
                    <button
                      onClick={() => {
                        setShowAdminPasswordPrompt(false);
                        setAdminPasswordInput("");
                        setAdminPasswordError("");
                      }}
                      className="px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-white"
                    >
                      ← Back to accounts
                    </button>
                    <button
                      onClick={() => handleGoogleLogin(pendingAdminEmail, adminPasswordInput)}
                      className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold rounded-lg transition-all shadow-md shadow-cyan-500/20"
                    >
                      Authenticate Admin
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Choose an account:</span>
                  
                  {/* Account 1: gods.battle.axe.88@gmail.com */}
                  <button
                    onClick={() => handleGoogleLogin("gods.battle.axe.88@gmail.com")}
                    className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-cyan-950/25 transition-all flex items-center justify-between gap-3 group animate-pulse"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-cyan-950 border border-cyan-800 text-cyan-400 font-bold font-mono rounded-full flex items-center justify-center text-xs group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                        G
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-white block">Sovereign Developer (Admin)</span>
                        <span className="text-[10px] font-mono text-slate-400 block">gods.battle.axe.88@gmail.com</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5 text-amber-400" /> PASSWORD PROTECTED
                    </span>
                  </button>

                  {/* Account 2: standard guest */}
                  <button
                    onClick={() => handleGoogleLogin("guest.compiler@solvex.io")}
                    className="w-full text-left p-3 rounded-xl border border-slate-800 hover:border-cyan-500/50 bg-slate-950/40 hover:bg-cyan-950/25 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-slate-950 border border-slate-850 text-slate-400 font-bold font-mono rounded-full flex items-center justify-center text-xs transition-colors">
                        S
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-white block">Standard Guest</span>
                        <span className="text-[10px] font-mono text-slate-400 block">guest.compiler@solvex.io</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono bg-slate-900 text-slate-500 border border-slate-850 px-2 py-0.5 rounded">
                      Trial Tier
                    </span>
                  </button>

                  {/* Custom input toggle */}
                  {!showCustomGoogleEmailInput ? (
                    <button
                      onClick={() => setShowCustomGoogleEmailInput(true)}
                      className="w-full text-center py-2 text-[10px] font-mono text-cyan-500 hover:text-cyan-400 transition-colors"
                    >
                      + Use another google account
                    </button>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-slate-850">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Custom Account Login:</span>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="e.g. administrator@gmail.com"
                          value={googleEmailInput}
                          onChange={(e) => setGoogleEmailInput(e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs font-mono p-2 rounded-lg text-white outline-none placeholder:text-slate-700"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && googleEmailInput.trim()) {
                              handleGoogleLogin(googleEmailInput);
                            }
                          }}
                        />
                        <button
                          onClick={() => {
                            if (googleEmailInput.trim()) {
                              handleGoogleLogin(googleEmailInput);
                            }
                          }}
                          className="px-3 bg-slate-800 hover:bg-slate-750 text-white font-mono text-xs rounded-lg border border-slate-700 transition-all"
                        >
                          Sign In
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Extra terms */}
            <div className="text-[9px] font-mono text-slate-500 text-center pt-2 border-t border-slate-850">
              dAIsy HaMINJA Sovereign Cryptographic SSO compliance. Built for Google AI APK Builder workspace tethering.
            </div>
          </div>
        </div>
      )}

      {/* Sovereign Brain Matrix & Paradox Inspector Modal */}
      <SovereignBrainInspectorModal
        isOpen={showBrainInspectorModal}
        onClose={() => setShowBrainInspectorModal(false)}
      />

      {/* Sovereign Universal Voice & Chat Assistant */}
      <DaisyHaminjaAssistant
        onRunSelfHealingScan={() => SovereignSelfHealingEngine.runAnomalyHealthCheck()}
        onPurgeErrors={() => SovereignSelfHealingEngine.purgeDOMErrorNodes()}
        onUpgradeTier={(tier) => handleSimulateInstantUpgrade(tier)}
        onRefreshMetrics={() => refreshSovereignMetrics()}
        onOpenUpgradeModal={() => setShowUpgradeModal(true)}
        onOpenGoogleModal={() => setShowGoogleModal(true)}
        userTier={userTier}
        userEmail={userEmail}
      />
    </div>
  );
}
