/**
 * PROJECT: Freedom SIM AI OS (Project AGate)
 * IDENTITY: HUMAN_0001 (Verified Primary)
 * STATUS: SOVEREIGN_ROOT_ESTABLISHED
 * HEARTBEAT: RANDOMIZED_PULSE_ACTIVE
 * OWNER: TODD JEFFREY ITES JR
 */
import React, { Component, ReactNode } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import Liberation from './components/Liberation';
import TechReality from './components/TechReality';
import TrainingModule from './components/TrainingModule';
import SwarmOS from './components/SwarmOS';
import AppIngest from './components/AppIngest';
import MMTAI from './components/MMTAI';
import Footer from './components/Footer';
import OnboardingTour from './components/OnboardingTour';
import { AlertTriangle } from 'lucide-react';

class GlobalErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Global Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center text-white font-mono">
          <div className="max-w-2xl space-y-6">
            <AlertTriangle size={64} className="mx-auto text-red-600 animate-pulse" />
            <h1 className="text-3xl font-bold uppercase tracking-tighter">Global_System_Crash</h1>
            <div className="bg-red-900/20 border border-red-600/50 p-4 rounded text-left overflow-auto max-h-64">
              <pre className="text-xs text-red-400 whitespace-pre-wrap">
                {this.state.error?.stack || this.state.error?.message || "Unknown Error"}
              </pre>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest rounded hover:bg-gray-200 transition-all"
            >
              Hard_Reboot
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [isTourVisible, setIsTourVisible] = React.useState(false);

  React.useEffect(() => {
    const hasSeenTour = localStorage.getItem('sovereign_tour_seen');
    if (!hasSeenTour) {
      const timer = setTimeout(() => setIsTourVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <GlobalErrorBoundary>
      <div className="relative min-h-screen bg-dark-sovereign text-text-main font-sans selection:bg-freedom-red selection:text-white">
        <OnboardingTour isVisible={isTourVisible} onClose={() => setIsTourVisible(false)} />
        {/* Animated Grid Background */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-grid-pattern z-0" style={{ animation: 'gridDrift 30s linear infinite' }}></div>
        
        <Navbar onStartTour={() => setIsTourVisible(true)} />
        
        <main className="relative z-10">
          <Hero />
          <Manifesto />
          <Liberation />
          <TechReality />
          <TrainingModule />
          <SwarmOS />
          <AppIngest />
          <MMTAI />
        </main>

        <Footer />
      </div>
    </GlobalErrorBoundary>
  );
}
