import React, { useState } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Bell, 
  Smartphone, 
  Monitor, 
  Bot, 
  ChevronLeft,
  X,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { DeviceView, ExecutionLog } from '../types';

interface AndroidFrameProps {
  deviceView: DeviceView;
  setDeviceView: (mode: DeviceView) => void;
  logs: ExecutionLog[];
  children: React.ReactNode;
  activeViewTitle: string;
  isAgentRunning: boolean;
  toggleAgentRunning: () => void;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({
  deviceView,
  setDeviceView,
  logs,
  children,
  activeViewTitle,
  isAgentRunning,
  toggleAgentRunning
}) => {
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const unreadLogs = logs.slice(0, 5);

  if (deviceView === 'desktop') {
    return <div className="min-h-screen bg-slate-900 text-slate-100">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-2 sm:p-6 transition-colors duration-300">
        {/* Device Toggle Switch Banner */}
        <div className="w-full max-w-sm sm:max-w-md mb-3 flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs">
          <div className="flex items-center space-x-2 text-emerald-400 font-medium">
            <Smartphone className="w-4 h-4" />
            <span>Android Enterprise Client v2.6</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-mono">
              Sync: 12ms
            </span>
          </div>
          <button
            onClick={() => setDeviceView('desktop')}
            className="flex items-center space-x-1 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg transition-all"
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Switch to Desktop View</span>
          </button>
        </div>

      {/* Android Smartphone Shell Frame */}
      <div className="relative w-full max-w-md bg-slate-900 border-4 border-slate-700/80 rounded-[42px] shadow-2xl overflow-hidden flex flex-col h-[840px] max-h-[92vh]">
        {/* Android Notch / Punch Hole Camera */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-5 bg-slate-950 rounded-b-xl z-50 flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
          </div>
          <div className="w-2 h-2 rounded-full bg-slate-900 ml-3" />
        </div>

        {/* Android Top Status Bar */}
        <div className="w-full h-8 bg-slate-950 px-6 pt-1 text-xs text-slate-300 flex items-center justify-between z-40 select-none">
          <span className="font-medium text-[11px]">{currentTime}</span>
          <div className="flex items-center space-x-2">
            <Bot className={`w-3.5 h-3.5 ${isAgentRunning ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
            <Signal className="w-3 h-3 text-slate-300" />
            <Wifi className="w-3 h-3 text-slate-300" />
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px] text-slate-400">98%</span>
              <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400/30" />
            </div>
          </div>
        </div>

        {/* Android App Top Bar Header */}
        <div className="w-full h-12 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-30 select-none">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Bot className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 leading-none">{activeViewTitle}</h1>
              <p className="text-[10px] text-emerald-400 font-medium">B2B Auto Engine</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Agent Status Toggle Button */}
            <button
              onClick={toggleAgentRunning}
              title={isAgentRunning ? 'Pause Autonomous Agent' : 'Resume Autonomous Agent'}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center space-x-1 ${
                isAgentRunning 
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                  : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isAgentRunning ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span>{isAgentRunning ? 'AI ACTIVE' : 'PAUSED'}</span>
            </button>

            {/* Notification Bell Icon */}
            <button
              onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
              className="relative p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadLogs.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Android Push Notification Overlay Drawer */}
        {showNotificationDrawer && (
          <div className="absolute top-20 left-0 right-0 z-50 mx-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md transition-all">
            <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">System Activity Push Feed</span>
              </div>
              <button 
                onClick={() => setShowNotificationDrawer(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-64 overflow-y-auto space-y-2 text-xs">
              {unreadLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-start space-x-2.5">
                  {log.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  ) : log.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-200 text-[11px] truncate">{log.agentName}</span>
                      <span className="text-[9px] text-slate-500">{log.timestamp.split(' ')[1]}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{log.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Android Main App Canvas (Scrollable) */}
        <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-3 scrollbar-thin scrollbar-thumb-slate-800">
          {children}
        </div>

        {/* Android Bottom Soft Navigation Bar */}
        <div className="w-full h-8 bg-slate-950 border-t border-slate-900 flex items-center justify-center space-x-12 shrink-0 select-none">
          <div className="w-3.5 h-3.5 border-l-2 border-b-2 border-slate-500 rotate-45 transform cursor-pointer opacity-70 hover:opacity-100" />
          <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-500 cursor-pointer opacity-70 hover:opacity-100" />
          <div className="w-3 h-3 border-2 border-slate-500 rounded-sm cursor-pointer opacity-70 hover:opacity-100" />
        </div>
      </div>
    </div>
  );
};
