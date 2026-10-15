export type TaskDomain = "logistics" | "financial";

export interface LogisticsParams {
  hubsCount: number;
  fleetCapacity: number; // in tons
  routeComplexity: "Simple" | "Standard" | "High-Dimensional";
}

export interface FinancialParams {
  portfolioSize: number;
  riskProfile: "Conservative" | "Balanced" | "Aggressive";
  targetVolatility: number; // percentage (e.g. 12 for 12%)
}

export interface OptimizationParams {
  taskType: TaskDomain;
  logistics: LogisticsParams;
  financial: FinancialParams;
  quantumNodesCount: number;
  neuralSearchIntensity: "Standard" | "High" | "Ultra Deep";
}

export interface SimulatedMetrics {
  computationTimeQuantumMs: number;
  computationTimeClassicalMs: number;
  efficiencyGainPct: number;
  solutionAccuracyPct: number;
  qubitCoherencePct: number;
  nasEpochsCompleted: number;
}

export interface GeminiInsights {
  theoreticalFormula: string;
  nasArchitectureSummary: string;
  quantumNodeAnalysis: string;
  optimizationInsight: string;
  suggestedBlueprintPrompt: string;
}

export interface BlueprintParams {
  prompt: string;
  aspectRatio: "1:1" | "2:3" | "3:2" | "3:4" | "4:3" | "9:16" | "16:9" | "21:9";
  imageSize: "1K" | "2K" | "4K";
  quality: "general" | "studio";
}

export interface SimulationLog {
  timestamp: string;
  message: string;
  type: "info" | "quantum" | "nas" | "success" | "warning";
}
