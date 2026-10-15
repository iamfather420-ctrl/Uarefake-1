import React, { useState, useEffect, useRef } from "react";
import { 
  Zap, 
  Cpu, 
  Network, 
  Settings, 
  Sliders, 
  Activity, 
  Terminal, 
  Code, 
  Image as ImageIcon, 
  Maximize2, 
  Download, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle, 
  LineChart, 
  BarChart4, 
  CheckCircle2, 
  ChevronRight, 
  Sparkles,
  Info
} from "lucide-react";
import { 
  TaskDomain, 
  OptimizationParams, 
  SimulatedMetrics, 
  GeminiInsights, 
  BlueprintParams, 
  SimulationLog 
} from "./types";

export default function App() {
  // App Config States
  const [params, setParams] = useState<OptimizationParams>({
    taskType: "logistics",
    logistics: {
      hubsCount: 24,
      fleetCapacity: 120,
      routeComplexity: "Standard"
    },
    financial: {
      portfolioSize: 250,
      riskProfile: "Balanced",
      targetVolatility: 15
    },
    quantumNodesCount: 16,
    neuralSearchIntensity: "High"
  });

  // Simulation Status States
  const [simStatus, setSimStatus] = useState<"idle" | "running" | "completed">("idle");
  const [simProgress, setSimProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");
  const [logs, setLogs] = useState<SimulationLog[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Results & Insights States
  const [metrics, setMetrics] = useState<SimulatedMetrics | null>(null);
  const [insights, setInsights] = useState<GeminiInsights | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Image Generation States
  const [blueprintParams, setBlueprintParams] = useState<BlueprintParams>({
    prompt: "",
    aspectRatio: "16:9",
    imageSize: "1K",
    quality: "studio"
  });
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Interactive Quantum Network Node Visualization Helper state
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const [simulationPulse, setSimulationPulse] = useState(0);

  // Auto-scroll console
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Periodic visual tick for quantum node rendering animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationPulse((prev) => (prev + 1) % 100);
    }, 120);
    return () => clearInterval(interval);
  }, []);

  // Add line to terminal logs
  const addLog = (message: string, type: SimulationLog["type"] = "info") => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  // Run classical and quantum simulation flow
  const runSimulation = async () => {
    setSimStatus("running");
    setSimProgress(0);
    setLogs([]);
    setMetrics(null);
    setInsights(null);
    setErrorMsg(null);

    const steps = [
      { text: "Initializing superconducting qubit state vectors...", progress: 5, type: "info" as const },
      { text: `Mapping ${params.taskType} constraints to distributed Hamiltonian tensors...`, progress: 15, type: "info" as const },
      { text: `Establishing quantum coherent entanglement bonds across ${params.quantumNodesCount} nodes...`, progress: 30, type: "quantum" as const },
      { text: "Spinning up Neural Architecture Search (NAS) spatial policy filters...", progress: 45, type: "nas" as const },
      { text: `[Epoch 1/50] Running hardware-aware topological lattice search: complexity = ${params.neuralSearchIntensity}...`, progress: 60, type: "nas" as const },
      { text: "[Epoch 35/50] Quantum gate arrangement convergence detected...", progress: 75, type: "nas" as const },
      { text: "Measuring qubit eigenvalues and collapsing wave-function vectors...", progress: 90, type: "quantum" as const },
      { text: "Synaptic-quantum feedback loops completed successfully.", progress: 100, type: "success" as const },
    ];

    for (let i = 0; i < steps.length; i++) {
      setCurrentStep(steps[i].text);
      setSimProgress(steps[i].progress);
      addLog(steps[i].text, steps[i].type);
      // artificial delay
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    // Generate simulated metrics based on parameters
    const randomMultiplier = 0.9 + Math.random() * 0.2; // 0.9 to 1.1
    const baseClassicalTime = params.taskType === "logistics" 
      ? params.logistics.hubsCount * 12 + (params.logistics.routeComplexity === "High-Dimensional" ? 800 : 200)
      : params.financial.portfolioSize * 2.5 + (params.financial.riskProfile === "Aggressive" ? 300 : 100);

    const quantumTime = Math.max(12, Math.round((20 + params.quantumNodesCount * 0.8) * randomMultiplier));
    const classicalTime = Math.round(baseClassicalTime * randomMultiplier);
    const efficiency = Math.round(((classicalTime - quantumTime) / classicalTime) * 1000) / 10;
    const accuracy = Math.round((95 + Math.random() * 4.8) * 10) / 10;
    const coherence = Math.round((88 + (64 - params.quantumNodesCount) * 0.15 + Math.random() * 5) * 10) / 10;
    const epochs = params.neuralSearchIntensity === "Ultra Deep" ? 150 : params.neuralSearchIntensity === "High" ? 80 : 40;

    const computedMetrics: SimulatedMetrics = {
      computationTimeQuantumMs: quantumTime,
      computationTimeClassicalMs: classicalTime,
      efficiencyGainPct: efficiency,
      solutionAccuracyPct: accuracy,
      qubitCoherencePct: Math.min(99.9, coherence),
      nasEpochsCompleted: epochs
    };

    setMetrics(computedMetrics);
    setSimStatus("completed");
    addLog(`Simulation complete! Computational reduction achieved: ${efficiency}%`, "success");

    // Pull analysis from server endpoint (Gemini API 3.5-flash)
    setLoadingInsights(true);
    try {
      const response = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskType: params.taskType,
          parameters: params.taskType === "logistics" ? params.logistics : params.financial,
          quantumNodesCount: params.quantumNodesCount,
          neuralSearchIntensity: params.neuralSearchIntensity,
          simulatedMetrics: computedMetrics
        })
      });

      const data = await response.json();
      if (data.success) {
        setInsights(data.insights);
        // Pre-fill the blueprint generator prompt with the AI suggested one
        setBlueprintParams((prev) => ({
          ...prev,
          prompt: data.insights.suggestedBlueprintPrompt || ""
        }));
      } else {
        if (data.error) {
          setErrorMsg(data.error);
        }
        if (data.insights) {
          setInsights(data.insights);
          setBlueprintParams((prev) => ({
            ...prev,
            prompt: data.insights.suggestedBlueprintPrompt || ""
          }));
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to connect to the backend optimization analyzer.");
    } finally {
      setLoadingInsights(false);
    }
  };

  // Generate Blueprint via API (Gemini-3 Pro / Flash image models)
  const generateBlueprintImage = async () => {
    if (!blueprintParams.prompt.trim()) return;

    setGeneratingImage(true);
    setGeneratedImage(null);
    setImageError(null);

    try {
      const response = await fetch("/api/generate-blueprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blueprintParams)
      });

      const data = await response.json();
      if (data.success) {
        setGeneratedImage(data.imageUrl);
        addLog("AI schematic blueprint successfully compiled and rendered.", "success");
      } else {
        setImageError(data.error || "Failed to generate image.");
        addLog("AI schematic compiler returned an execution timeout or credential error.", "warning");
      }
    } catch (err: any) {
      console.error(err);
      setImageError("Server connection timeout or invalid API keys. Check local environment secrets.");
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <div id="quantum-app-container" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Sci-Fi Navigation / Status Bar */}
      <header id="app-header" className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/80 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-wider text-slate-100">QUANTUM <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">AI OPTIMIZER</span></h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-slate-800 text-cyan-400 rounded-full border border-slate-700">v3.5 Live</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">Distributed Qubit Superposition & Neural Architecture Search (NAS) Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-400">STATUS:</span>
            <span className="text-emerald-400 uppercase font-semibold">
              {simStatus === "idle" ? "READY" : simStatus === "running" ? "COMPUTING" : "COHERENT"}
            </span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-400 hidden sm:block">
            TIME: <span className="text-slate-200">2026-07-08 UTC</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="app-main-grid" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Engine parameters (4 Cols) */}
        <section id="engine-settings-column" className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Optimization parameters card */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Engine Configuration</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">INIT // CAP</span>
            </div>

            {/* Task Domain Selector */}
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Target Analytical Domain</label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                <button
                  onClick={() => setParams(prev => ({ ...prev, taskType: "logistics" }))}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    params.taskType === "logistics" 
                      ? "bg-slate-800 text-cyan-400 border border-cyan-500/20 shadow-md" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Network className="w-3.5 h-3.5" />
                  Logistics Route
                </button>
                <button
                  onClick={() => setParams(prev => ({ ...prev, taskType: "financial" }))}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                    params.taskType === "financial" 
                      ? "bg-slate-800 text-indigo-400 border border-indigo-500/20 shadow-md" 
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Financial Risk
                </button>
              </div>
            </div>

            {/* Domain-specific Parameter Fields */}
            <div className="bg-slate-950/30 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Sliders className="w-3 h-3 text-cyan-500" />
                  {params.taskType === "logistics" ? "Routing Matrices" : "Portfolio Metrics"}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono">LIVE_CALIBRATION</span>
              </div>

              {params.taskType === "logistics" ? (
                <>
                  {/* Hubs Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs font-mono">
                      <span className="text-slate-400">Logistics Hubs / Cities</span>
                      <span className="text-cyan-400 font-bold">{params.logistics.hubsCount}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="100"
                      value={params.logistics.hubsCount}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        logistics: { ...prev.logistics, hubsCount: parseInt(e.target.value) }
                      }))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <span className="text-[9px] text-slate-500 block mt-1">Superposition dimension nodes calculated in parallel</span>
                  </div>

                  {/* Fleet Capacity */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs font-mono">
                      <span className="text-slate-400">Avg Fleet Capacity (Tons)</span>
                      <span className="text-cyan-400 font-bold">{params.logistics.fleetCapacity}t</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={params.logistics.fleetCapacity}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        logistics: { ...prev.logistics, fleetCapacity: parseInt(e.target.value) }
                      }))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                  </div>

                  {/* Complexity Segmented Control */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Mandelbrot Network Complexity</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg">
                      {(["Simple", "Standard", "High-Dimensional"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setParams(prev => ({
                            ...prev,
                            logistics: { ...prev.logistics, routeComplexity: level }
                          }))}
                          className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
                            params.logistics.routeComplexity === level 
                              ? "bg-slate-800 text-cyan-300 border border-cyan-500/10" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Portfolio Size */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs font-mono">
                      <span className="text-slate-400">Portfolio Asset Pool</span>
                      <span className="text-indigo-400 font-bold">{params.financial.portfolioSize}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={params.financial.portfolioSize}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        financial: { ...prev.financial, portfolioSize: parseInt(e.target.value) }
                      }))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                    <span className="text-[9px] text-slate-500 block mt-1">Stochastic covariance matrix tensors to optimize</span>
                  </div>

                  {/* Target Volatility Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1 text-xs font-mono">
                      <span className="text-slate-400">Target Volatility Boundary</span>
                      <span className="text-indigo-400 font-bold">{params.financial.targetVolatility}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="50"
                      value={params.financial.targetVolatility}
                      onChange={(e) => setParams(prev => ({
                        ...prev,
                        financial: { ...prev.financial, targetVolatility: parseInt(e.target.value) }
                      }))}
                      className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>

                  {/* Risk Profiles Segmented Control */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Asset Risk Allocation Profile</label>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-lg">
                      {(["Conservative", "Balanced", "Aggressive"] as const).map((profile) => (
                        <button
                          key={profile}
                          onClick={() => setParams(prev => ({
                            ...prev,
                            financial: { ...prev.financial, riskProfile: profile }
                          }))}
                          className={`py-1 text-[10px] font-semibold rounded-md transition-all ${
                            params.financial.riskProfile === profile 
                              ? "bg-slate-800 text-indigo-300 border border-indigo-500/10" 
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {profile}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Core Quantum & Neural Search Hardware Constraints */}
            <div className="flex flex-col gap-4 border-t border-slate-800/80 pt-4">
              {/* Distributed Quantum Nodes Count */}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-mono">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    Distributed Quantum Nodes
                  </span>
                  <span className="text-cyan-400 font-bold">{params.quantumNodesCount} Nodes</span>
                </div>
                <input
                  type="range"
                  min="4"
                  max="64"
                  step="4"
                  value={params.quantumNodesCount}
                  onChange={(e) => setParams(prev => ({ ...prev, quantumNodesCount: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[9px] text-slate-500 block mt-1">Increases computational fidelity but constraints qubit coherence</span>
              </div>

              {/* Neural Architecture Search intensity */}
              <div>
                <label className="text-xs text-slate-400 block mb-1.5">Neural Architecture Search Depth</label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800/80">
                  {(["Standard", "High", "Ultra Deep"] as const).map((depth) => (
                    <button
                      key={depth}
                      onClick={() => setParams(prev => ({ ...prev, neuralSearchIntensity: depth }))}
                      className={`py-1.5 text-[10px] font-mono rounded-lg transition-all ${
                        params.neuralSearchIntensity === depth 
                          ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/15" 
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {depth}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Activate Button */}
            <button
              onClick={runSimulation}
              disabled={simStatus === "running"}
              className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-55 disabled:cursor-not-allowed"
            >
              {simStatus === "running" ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  Quantum Annealing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-slate-950 fill-current" />
                  Execute Quantum Optimization
                </>
              )}
            </button>
          </div>

          {/* Engine telemetry brief info block */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-xl p-4 text-[11px] font-mono text-slate-400 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs">
              <Info className="w-3.5 h-3.5" />
              <span>Architectural Methodology</span>
            </div>
            <p className="leading-relaxed">
              This sandbox models continuous quadratic unconstrained binary optimization (QUBO) using a hybrid classically-simulated variational eigensolver. It executes a concurrent Neural Architecture Search (NAS) to generate customized quantum-gate mappings tailored specifically for logistical routes and financial risk distributions.
            </p>
          </div>
        </section>

        {/* CENTER/RIGHT PANEL: Visualization & Results (8 Cols) */}
        <section id="visualization-results-column" className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Top segment: Live simulation visualization stage */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Quantum Entanglement & Topology Grid</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">{params.quantumNodesCount} Coherence Matrix Streams</span>
            </div>

            {/* Interactive SVG Quantum processing network map */}
            <div className="relative aspect-video w-full bg-slate-950 rounded-xl border border-slate-800/60 flex items-center justify-center overflow-hidden group">
              
              {/* CAD grid lines background */}
              <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#0ea5e9_1px,transparent_1px),linear-gradient(to_bottom,#0ea5e9_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* Cyber crosshair indicators */}
              <div className="absolute top-4 left-4 text-[9px] font-mono text-slate-600">SYS_TOPOLOGY_01_LATTICE</div>
              <div className="absolute bottom-4 right-4 text-[9px] font-mono text-slate-600">SCALE: 1e-15m // SIMULATED</div>

              {/* Animated radial radar ring during simulation */}
              {simStatus === "running" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-4/5 h-4/5 rounded-full border border-dashed border-cyan-500/20 animate-[spin_12s_linear_infinite]"></div>
                  <div className="absolute w-3/5 h-3/5 rounded-full border border-double border-indigo-500/10 animate-[spin_8s_linear_infinite_reverse]"></div>
                  <div className="absolute w-2/5 h-2/5 rounded-full bg-cyan-500/5 animate-pulse"></div>
                </div>
              )}

              {/* Dynamic SVG Nodes Grid */}
              <svg className="w-full h-full max-h-[360px]" viewBox="0 0 600 320">
                <defs>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Draw dynamic entanglement vectors */}
                {Array.from({ length: params.quantumNodesCount }).map((_, idx) => {
                  const angle = (idx * 2 * Math.PI) / params.quantumNodesCount;
                  const x = 300 + Math.cos(angle) * 110;
                  const y = 160 + Math.sin(angle) * 110;

                  // Connect to core neural hub in the center
                  // Also connect each node to next node to form circular loop
                  const nextAngle = ((idx + 1) * 2 * Math.PI) / params.quantumNodesCount;
                  const nextX = 300 + Math.cos(nextAngle) * 110;
                  const nextY = 160 + Math.sin(nextAngle) * 110;

                  // Connect to an inner NAS ring node representing a neural pipeline
                  const nasAngle = ((idx + (simulationPulse * 0.05)) * 2 * Math.PI) / params.quantumNodesCount;
                  const nasX = 300 + Math.cos(nasAngle) * 55;
                  const nasY = 160 + Math.sin(nasAngle) * 55;

                  return (
                    <g key={idx}>
                      {/* Inter-node quantum loop entanglement lines */}
                      <line
                        x1={x}
                        y1={y}
                        x2={nextX}
                        y2={nextY}
                        className={`stroke-slate-800 ${simStatus === "running" ? "stroke-cyan-500/30" : "stroke-slate-800"}`}
                        strokeWidth={1}
                        strokeDasharray={simStatus === "running" ? "4 4" : "none"}
                        style={{
                          strokeDashoffset: simulationPulse * (idx % 2 === 0 ? 1 : -1)
                        }}
                      />

                      {/* NAS mapping pathways from outer quantum ring to inner neural network ring */}
                      <line
                        x1={x}
                        y1={y}
                        x2={nasX}
                        y2={nasY}
                        className={`stroke-slate-900 transition-all ${
                          simStatus === "running" 
                            ? "stroke-indigo-500/20" 
                            : hoveredNode === idx 
                              ? "stroke-cyan-500/40" 
                              : "stroke-slate-900"
                        }`}
                        strokeWidth={0.8}
                      />
                    </g>
                  );
                })}

                {/* Draw inner neural loss loop */}
                {Array.from({ length: Math.min(8, params.quantumNodesCount) }).map((_, idx) => {
                  const count = Math.min(8, params.quantumNodesCount);
                  const angle = (idx * 2 * Math.PI) / count + (simulationPulse * 0.02);
                  const x = 300 + Math.cos(angle) * 55;
                  const y = 160 + Math.sin(angle) * 55;

                  const nextAngle = ((idx + 1) * 2 * Math.PI) / count + (simulationPulse * 0.02);
                  const nextX = 300 + Math.cos(nextAngle) * 55;
                  const nextY = 160 + Math.sin(nextAngle) * 55;

                  return (
                    <line
                      key={`nas-${idx}`}
                      x1={x}
                      y1={y}
                      x2={nextX}
                      y2={nextY}
                      className="stroke-indigo-500/40"
                      strokeWidth={1.5}
                      filter="url(#glow)"
                    />
                  );
                })}

                {/* Core Neural Loss Hub */}
                <circle
                  cx={300}
                  cy={160}
                  r={simStatus === "running" ? 22 + Math.sin(simulationPulse * 0.4) * 3 : 20}
                  className={`fill-slate-900 stroke-2 transition-all ${
                    simStatus === "running" ? "stroke-indigo-400" : "stroke-slate-700"
                  }`}
                  filter="url(#glow-cyan)"
                />
                <circle cx={300} cy={160} r={6} className="fill-cyan-400" />

                {/* Render processing nodes themselves */}
                {Array.from({ length: params.quantumNodesCount }).map((_, idx) => {
                  const angle = (idx * 2 * Math.PI) / params.quantumNodesCount;
                  const x = 300 + Math.cos(angle) * 110;
                  const y = 160 + Math.sin(angle) * 110;

                  const isHighlighted = simStatus === "running" && Math.floor(simulationPulse / 4) % params.quantumNodesCount === idx;

                  return (
                    <g 
                      key={`node-${idx}`}
                      onMouseEnter={() => setHoveredNode(idx)}
                      onMouseLeave={() => setHoveredNode(null)}
                      className="cursor-pointer"
                    >
                      {/* Active scan glow aura */}
                      {(isHighlighted || hoveredNode === idx) && (
                        <circle
                          cx={x}
                          cy={y}
                          r={12}
                          className="fill-cyan-500/10 stroke-none animate-ping"
                        />
                      )}
                      
                      {/* Node circle */}
                      <circle
                        cx={x}
                        cy={y}
                        r={hoveredNode === idx ? 7 : 4.5}
                        className={`transition-all duration-150 ${
                          isHighlighted 
                            ? "fill-cyan-400 stroke-white stroke-2" 
                            : hoveredNode === idx 
                              ? "fill-indigo-400 stroke-cyan-400 stroke-1.5" 
                              : "fill-slate-950 stroke-cyan-500/50 stroke-1.5 hover:stroke-cyan-300"
                        }`}
                        filter={isHighlighted || hoveredNode === idx ? "url(#glow)" : undefined}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Progress Bar Overlay */}
              {simStatus === "running" && (
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-900">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 transition-all duration-300 ease-out"
                    style={{ width: `${simProgress}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Simulated Live Terminal output logs */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                  Simulated Coherence Stream Logs
                </span>
                <span className="text-[10px] text-indigo-400 font-mono">Q_LOG_BUFFER</span>
              </div>
              
              <div 
                ref={logContainerRef}
                className="h-28 overflow-y-auto font-mono text-[11px] leading-relaxed flex flex-col gap-1 text-slate-300 pr-2 scrollbar-thin scrollbar-thumb-slate-800"
              >
                {logs.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-500 italic">
                    Engine currently idle. Configure settings and click 'Execute' to begin simulated real-time annealing.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex gap-2 items-start hover:bg-slate-900/50 px-1 py-0.5 rounded transition-all">
                      <span className="text-slate-500 select-none">[{log.timestamp}]</span>
                      <span className={`
                        ${log.type === "quantum" ? "text-cyan-400" : ""}
                        ${log.type === "nas" ? "text-indigo-400" : ""}
                        ${log.type === "success" ? "text-emerald-400 font-semibold" : ""}
                        ${log.type === "warning" ? "text-amber-500" : ""}
                      `}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Bottom segment: Results and Gemini Insights (Only visible once computed) */}
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Computation Time Comparison Chart & Stats (5 Cols) */}
              <div className="md:col-span-5 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <BarChart4 className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Latency Benchmark</h3>
                </div>

                {/* Computation Time Visual Comparison Chart */}
                <div className="bg-slate-950/60 border border-slate-800/60 rounded-xl p-4 flex flex-col gap-5">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-widest">Compute latency (Lower is better)</span>
                  
                  {/* Classical Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-slate-400">Classical Xeon 32-Core</span>
                      <span className="text-slate-200 font-bold">{metrics.computationTimeClassicalMs} ms</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3.5 rounded-md overflow-hidden border border-slate-800">
                      <div className="bg-slate-600 h-full rounded-md" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  {/* Quantum Simulated Bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-cyan-400 font-semibold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-cyan-400 fill-current" />
                        Quantum-NAS Core
                      </span>
                      <span className="text-cyan-400 font-black">{metrics.computationTimeQuantumMs} ms</span>
                    </div>
                    <div className="w-full bg-slate-900 h-3.5 rounded-md overflow-hidden border border-slate-800">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-md shadow-glow-cyan" 
                        style={{ width: `${Math.max(4, (metrics.computationTimeQuantumMs / metrics.computationTimeClassicalMs) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-3 text-center">
                    <div className="text-2xl font-black text-emerald-400 tracking-tight">
                      {metrics.efficiencyGainPct}% Speedup
                    </div>
                    <p className="text-[10px] text-slate-500 font-mono uppercase mt-0.5">Computational complexity reduction</p>
                  </div>
                </div>

                {/* Stats cards list */}
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Qubit Coherence</span>
                    <span className="text-base font-bold text-cyan-400 font-mono">{metrics.qubitCoherencePct}%</span>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-3 flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">NAS Epochs</span>
                    <span className="text-base font-bold text-indigo-400 font-mono">{metrics.nasEpochsCompleted}/150</span>
                  </div>
                </div>
              </div>

              {/* Advanced Gemini AI Optimization Oracle Insights (7 Cols) */}
              <div className="md:col-span-7 bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Gemini AI Synthesis Analysis</h3>
                  </div>
                  <span className="text-[10px] font-mono text-yellow-400 bg-yellow-400/5 px-2 py-0.5 rounded border border-yellow-400/10">3.5 FLASH</span>
                </div>

                {loadingInsights ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="text-xs font-mono">Synthesizing topological optimization results...</span>
                  </div>
                ) : errorMsg && !insights ? (
                  <div className="flex-1 flex flex-col items-center justify-center gap-3 py-10 px-4 text-center border border-dashed border-red-500/20 rounded-xl bg-red-500/5">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="text-xs font-semibold text-red-400">AI Key Configuration Missing</p>
                      <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-sm">
                        Please set your <span className="font-mono text-slate-200">GEMINI_API_KEY</span> in the Secrets panel in AI Studio for actual live analytical synthesis. Rendering fallback insights...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    
                    {/* Theoretical Formula Box */}
                    {insights?.theoreticalFormula && (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2 relative overflow-hidden group">
                        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Theoretical Cost Hamiltonian</span>
                        <div className="font-mono text-xs text-cyan-300 py-1 overflow-x-auto whitespace-nowrap scrollbar-thin bg-slate-900/40 px-2.5 rounded-lg border border-slate-850">
                          {insights.theoreticalFormula}
                        </div>
                      </div>
                    )}

                    {/* Multi-Paragraph Analysis details */}
                    <div className="flex flex-col gap-3 text-xs leading-relaxed text-slate-300">
                      
                      {insights?.nasArchitectureSummary && (
                        <div className="flex gap-2.5 items-start">
                          <div className="p-1.5 bg-indigo-950/80 rounded-lg border border-indigo-500/20 text-indigo-400 shrink-0 mt-0.5">
                            <Code className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block mb-0.5">Searched Neural Architecture Summary</span>
                            <p className="text-slate-400 text-[11px]">{insights.nasArchitectureSummary}</p>
                          </div>
                        </div>
                      )}

                      {insights?.quantumNodeAnalysis && (
                        <div className="flex gap-2.5 items-start">
                          <div className="p-1.5 bg-cyan-950/80 rounded-lg border border-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                            <Network className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block mb-0.5">Distributed Superposition Scaling</span>
                            <p className="text-slate-400 text-[11px]">{insights.quantumNodeAnalysis}</p>
                          </div>
                        </div>
                      )}

                      {insights?.optimizationInsight && (
                        <div className="flex gap-2.5 items-start">
                          <div className="p-1.5 bg-emerald-950/80 rounded-lg border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 block mb-0.5">Oracle Takeaways</span>
                            <p className="text-slate-400 text-[11px]">{insights.optimizationInsight}</p>
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

          {/* BLUEPRINT SCHEMATIC GENERATION SECTION (Requires image model preview) */}
          {metrics && (
            <div id="blueprint-schematic-section" className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold tracking-wide text-slate-200 uppercase">Quantum Hardware Blueprint Generator</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">GEMINI IMAGE API</span>
              </div>

              {/* Layout splits into control panel and image stage */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Generation settings controls (5 Cols) */}
                <div className="md:col-span-5 flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Prompt Customization</label>
                    <textarea
                      value={blueprintParams.prompt}
                      onChange={(e) => setBlueprintParams(prev => ({ ...prev, prompt: e.target.value }))}
                      placeholder="Enter sci-fi tech schematic details..."
                      rows={4}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/80 leading-relaxed resize-none scrollbar-thin"
                    />
                  </div>

                  {/* Size, aspect ratio, quality matrices */}
                  <div className="grid grid-cols-2 gap-3">
                    
                    {/* Size Selector */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Image Size (Fidelity)</label>
                      <select
                        value={blueprintParams.imageSize}
                        onChange={(e) => setBlueprintParams(prev => ({ ...prev, imageSize: e.target.value as any }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
                      >
                        <option value="1K">1K (Standard HD)</option>
                        <option value="2K">2K (High Resolution)</option>
                        <option value="4K">4K (Ultra Detail UHD)</option>
                      </select>
                    </div>

                    {/* Aspect Ratio */}
                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Aspect Ratio</label>
                      <select
                        value={blueprintParams.aspectRatio}
                        onChange={(e) => setBlueprintParams(prev => ({ ...prev, aspectRatio: e.target.value as any }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500/50"
                      >
                        <option value="1:1">1:1 Square</option>
                        <option value="3:2">3:2 Classic</option>
                        <option value="4:3">4:3 Standard</option>
                        <option value="16:9">16:9 Widescreen</option>
                        <option value="21:9">21:9 Cinematic</option>
                        <option value="3:4">3:4 Vertical</option>
                        <option value="2:3">2:3 Portrait</option>
                        <option value="9:16">9:16 Mobile</option>
                      </select>
                    </div>

                  </div>

                  {/* Quality Engine Choice */}
                  <div>
                    <label className="text-xs text-slate-400 block mb-1.5">Model Rendering Quality</label>
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950/60 rounded-xl border border-slate-800/80">
                      <button
                        onClick={() => setBlueprintParams(prev => ({ ...prev, quality: "general" }))}
                        className={`py-1.5 text-[10px] font-mono rounded-lg transition-all ${
                          blueprintParams.quality === "general" 
                            ? "bg-slate-800 text-cyan-300 border border-cyan-500/20" 
                            : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        Flash Preview (3.1-flash)
                      </button>
                      <button
                        onClick={() => setBlueprintParams(prev => ({ ...prev, quality: "studio" }))}
                        className={`py-1.5 text-[10px] font-mono rounded-lg transition-all ${
                          blueprintParams.quality === "studio" 
                            ? "bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/15" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Studio Schematics (3-pro)
                      </button>
                    </div>
                  </div>

                  {/* Trigger compilation */}
                  <button
                    onClick={generateBlueprintImage}
                    disabled={generatingImage || !blueprintParams.prompt}
                    className="w-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/30 hover:border-cyan-400 text-cyan-400 font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {generatingImage ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Compiling Canvas CAD...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Compile Technical Blueprint
                      </>
                    )}
                  </button>
                </div>

                {/* Right side display visualizer (7 Cols) */}
                <div className="md:col-span-7 flex flex-col gap-3">
                  
                  {/* Generated schematic display canvas */}
                  <div className="relative aspect-video w-full bg-slate-950 rounded-xl border border-slate-850/80 flex items-center justify-center overflow-hidden">
                    
                    {/* Background layout crosshairs */}
                    <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    
                    {generatingImage ? (
                      <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
                        <RefreshCw className="w-8 h-8 animate-spin text-cyan-400" />
                        <div className="text-center">
                          <span className="text-xs font-mono block">Synthesizing CAD schematics...</span>
                          <span className="text-[10px] text-slate-500 mt-1 block">Executing deep convolution lattice matrices</span>
                        </div>
                      </div>
                    ) : generatedImage ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                        <img 
                          src={generatedImage} 
                          alt="Quantum Blueprint CAD" 
                          className="w-full h-full object-contain p-2 max-h-[300px]"
                        />
                        {/* Overlay specifications block for tech authenticity */}
                        <div className="absolute top-3 left-3 bg-slate-950/90 border border-cyan-500/20 px-2 py-1 rounded text-[8px] font-mono text-cyan-400/90 flex flex-col gap-0.5">
                          <span>RES: {blueprintParams.imageSize === "1K" ? "1024x1024" : blueprintParams.imageSize === "2K" ? "2048x2048" : "4096x4096"}</span>
                          <span>RATIO: {blueprintParams.aspectRatio}</span>
                          <span>ENGINE: {blueprintParams.quality === "studio" ? "3-pro-image-preview" : "3.1-flash-image-preview"}</span>
                        </div>

                        {/* Save Button */}
                        <a 
                          href={generatedImage} 
                          download="quantum-cad-schematic.png"
                          className="absolute bottom-3 right-3 p-2 bg-slate-950/90 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-lg hover:text-cyan-400 transition-all flex items-center gap-1 text-[10px] font-mono uppercase"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Export Image
                        </a>
                      </div>
                    ) : (
                      <div className="text-center p-6 flex flex-col items-center justify-center gap-3">
                        {/* Default static wireframe SVG preview representing a high-tech CAD circuit */}
                        <div className="p-3 bg-slate-900/50 rounded-full border border-slate-800">
                          <ImageIcon className="w-6 h-6 text-slate-500" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-400">Schematic Render Pipeline Idle</p>
                          <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                            Click 'Compile Technical Blueprint' above. The AI will translate the exact quantum results into a high-fidelity schematics visual.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Warning banner about key config if error happens */}
                  {imageError && (
                    <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3.5 flex gap-2.5 items-start text-xs text-amber-300/90">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 block">AI Image Key Alert</span>
                        <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                          To run live image rendering via the Gemini Image APIs, configure your API key inside the Secrets panel. This will activate the full-stack <span className="font-mono text-amber-200">gemini-3-pro-image-preview</span> model outputs.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <footer id="app-footer" className="border-t border-slate-900/80 bg-slate-950 px-6 py-5 mt-8 text-center text-xs text-slate-500 font-mono">
        <p className="mb-1">© 2026 QUANTUM-NAS ENGINE CORP. ACCELERATING HIGH-DIMENSIONAL COMPUTATION ON CLOUD RUN.</p>
        <p className="text-slate-600">Simulated quantum registers: qubits, Hamiltonian constraints solver, policy-gradient optimization algorithms.</p>
      </footer>
    </div>
  );
}
