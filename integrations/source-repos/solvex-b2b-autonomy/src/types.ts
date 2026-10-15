export interface GridNode {
  id: string;
  name: string;
  status: 'online' | 'active' | 'diagnostic' | 'rebooting' | 'offline';
  latency: number;
  utilization: number;
  jobType: string;
  lastPing: string;
  cryptHealth: number;
}

export interface ParadoxOperator {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'shared' | 'proprietary';
  defaultSolutionId: string;
  status: 'stable' | 'vulnerable' | 'under_reconstruction';
  complexity: 'low' | 'medium' | 'high';
}

export interface SolutionAnchor {
  id: string;
  code: string;
  title: string;
  explanation: string;
  paradoxCodes: string[];
  complianceStandards: string[];
  verificationMetric: string;
  performanceEfficacy: number;
}

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  tier: 'Standard' | 'Enterprise' | 'Sovereign';
  capabilities: string[];
  version: string;
  antiTamperReady: boolean;
}

export interface JITBuild {
  id: string;
  templateId: string;
  templateName: string;
  status: 'queued' | 'watermarking' | 'obfuscating' | 'fingerprinting' | 'sealing' | 'completed' | 'failed';
  logs: string[];
  watermark: string;
  sha256Fingerprint: string;
  antiTamperSeal: string;
  duration: number;
  completedAt?: string;
  credentialsConfig?: Record<string, string>;
}

export interface ProofMetric {
  timestamp: string;
  tps: number;
  cpuLoad: number;
  ramUtilization: number;
  blockHeight: number;
  latency: number;
}

export interface PipelineStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'skipped';
  durationSeconds: number;
  logs: string[];
}

export interface K8sStatus {
  name: string;
  namespace: string;
  replicas: number;
  availableReplicas: number;
  cpuUtilization: number;
  memoryUtilization: number;
}

export interface Pipeline {
  id: string;
  name: string;
  repository: string;
  lastBuildStatus: 'success' | 'failed' | 'running' | 'idle';
  lastBuildTime?: string;
  dockerImage: string;
  vulns: {
    critical: number;
    high: number;
    medium: number;
  };
  k8s: K8sStatus;
  steps: PipelineStep[];
}
