import React, { useState } from 'react';
import { Header } from './components/Header';
import { AIRegistryViewer } from './components/AIRegistryViewer';
import { SolverDashboard } from './components/SolverDashboard';
import { MeshTelemetryPanel } from './components/MeshTelemetryPanel';
import { ConflictAnalysisPanel } from './components/ConflictAnalysisPanel';
import { B2BEconomicDashboard } from './components/B2BEconomicDashboard';
import { AutonomousCommunicationPanel } from './components/AutonomousCommunicationPanel';
import { ComplianceDashboard } from './components/ComplianceDashboard';
import { BiometricLockScreen } from './components/BiometricLockScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('registry');
  const [systemStatusScore] = useState<number>(100);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  if (isLocked) {
    return <BiometricLockScreen onUnlock={() => setIsLocked(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#050507] text-[#A0A0B0] font-sans antialiased selection:bg-[#00F0FF] selection:text-black">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatusScore={systemStatusScore}
        onLockOS={() => setIsLocked(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {activeTab === 'registry' && <AIRegistryViewer />}
        {activeTab === 'solver' && <SolverDashboard />}
        {activeTab === 'mesh' && <MeshTelemetryPanel />}
        {activeTab === 'conflict' && <ConflictAnalysisPanel />}
        {activeTab === 'b2b' && <B2BEconomicDashboard />}
        {activeTab === 'chat' && <AutonomousCommunicationPanel />}
        {activeTab === 'compliance' && <ComplianceDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2A2A35] bg-[#0A0A10] py-4 text-center text-[10px] font-mono tracking-widest text-[#505060]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 uppercase">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#00F0FF] cyan-glow-sm"></span>
            <span>UAREFAKE ARCHITECTURE // DAISY HAMINJA PROPRIETARY</span>
          </div>
          <div className="flex items-center space-x-4 text-[#808090]">
            <span>LATENCY: 1.4ms</span>
            <span>THROUGHPUT: 42.8 KP/S</span>
            <span>SESSION: 0xFD91...A210</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
