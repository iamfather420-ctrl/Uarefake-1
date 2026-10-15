import React, { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, CheckCircle2, History, Send, Lock, Wifi, ShieldAlert, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LedgerEntry {
  timestamp: string;
  event: string;
  fingerprint_sha256: string;
}

export default function SolveXDashboard({ role }: { role: string }) {
  const [nodeStatus, setNodeStatus] = useState<any>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [inputData, setInputData] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [intrusions, setIntrusions] = useState<{id: number, left: string, top: string, scale: number}[]>([]);

  const getRoleConfig = () => {
    switch (role) {
       case 'Institution':
       case 'Business':
          return {
             subtitle: 'NETWORK ADMINISTRATION & MESSAGING',
             formTitle: 'SEND SECURE COMMAND / MESSAGE',
             formDesc: 'Send an encrypted message or system command directly to the trusted network.',
             statusSuccess: 'Message Confirmed & Sent',
             sealBtn: 'SEND SECURE MESSAGE',
             tableTitle: 'Secure System History'
          };
       case 'Child':
          return {
             subtitle: 'THIS DEVICE IS FULLY PROTECTED',
             formTitle: 'CONNECTION STATUS',
             formDesc: 'All internet traffic and messages are safely filtered through a secure connection.',
             statusSuccess: 'Protection Active',
             sealBtn: 'CHECK CONNECTION',
             tableTitle: 'Recent Filtered Activity'
          };
       case 'Family':
       case 'Parent':
       default:
          return {
             subtitle: 'FAMILY DEVICE CONTROLS',
             formTitle: 'UPDATE SECURITY SETTINGS',
             formDesc: 'Apply new safety rules or message a protected phone.',
             statusSuccess: 'Settings Updated Successfully',
             sealBtn: 'APPLY CHANGES',
             tableTitle: 'Family Activity Log'
          };
    }
  };

  const config = getRoleConfig();

  // Fetch node status and ledger on mount
  useEffect(() => {
    fetchNodeStatus();
    fetchLedger();
  }, []);

  // Simulate real-time background blocked access attempts
  useEffect(() => {
    if (role === 'Child') return;
    const interval = setInterval(() => {
      if (Math.random() > 0.6) {
        addIntrusion();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [role]);

  // Burst on explicit failure
  useEffect(() => {
    if (submissionStatus === 'error') {
       for(let i=0; i<4; i++) {
         setTimeout(() => addIntrusion(), i * 200 + 100);
       }
    }
  }, [submissionStatus]);

  const addIntrusion = () => {
    const newIntrusion = {
      id: Date.now() + Math.random(),
      left: `${10 + Math.random() * 80}%`,
      top: `${10 + Math.random() * 80}%`,
      scale: 0.5 + Math.random() * 1
    };
    setIntrusions(prev => {
      const updated = [...prev, newIntrusion];
      // Keep only last 10 nodes to avoid clutter
      return updated.length > 10 ? updated.slice(updated.length - 10) : updated;
    });
  };

  const API_BASE = '';

  const safeFetch = async (url: string, options?: RequestInit) => {
    try {
      const res = await fetch(url, options);
      const text = await res.text();
      if (text.startsWith('<')) {
        return { ok: false, status: res.status, data: null, error: "Network Error." };
      }
      try {
        const data = text ? JSON.parse(text) : null;
        return { ok: res.ok, status: res.status, data, error: null };
      } catch (e: any) {
        return { ok: false, status: res.status, data: null, error: e.message };
      }
    } catch (err: any) {
      return { ok: false, status: 0, data: null, error: err.message };
    }
  };

  const fetchNodeStatus = async () => {
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/health`);
      if (res.ok && res.data) {
        setNodeStatus(res.data.node_status);
      }
    } catch (err: any) {
      console.error("Failed to fetch node status");
    }
  };

  const fetchLedger = async () => {
    try {
      const res = await safeFetch(`${API_BASE}/api/v1/ledger`, {
        headers: { 'x-api-key': 'SX-PROD-992837465' }
      });
      if (res.ok && res.data) {
        setLedger(res.data.ledger || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch ledger");
    }
  };

  // Format exactly 380 bytes
  const formatPayload = (str: string): string => {
    const baseObj = { 
        title: "User Action",
        content: str.substring(0, 100)
    };
    let jsonStr = JSON.stringify(baseObj);
    const encoder = new TextEncoder();
    let bytes = encoder.encode(jsonStr);
    if (bytes.length > 380) {
        const decoder = new TextDecoder('utf-8', {fatal: false});
        jsonStr = decoder.decode(bytes.slice(0, 380)).replace(/\uFFFD/g, '');
        bytes = encoder.encode(jsonStr);
    }
    let paddingNeeded = 380 - bytes.length;
    return jsonStr + '\0'.repeat(paddingNeeded);
  };

  const handleManualSubmission = async () => {
    if (!inputData) return;
    setIsVerifying(true);
    setSubmissionStatus('idle');
    const payload = formatPayload(inputData);
    try {
      const response = await safeFetch(`${API_BASE}/api/v1/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': 'SX-PROD-992837465' },
        body: payload
      });
      if (response.ok || response.status === 201) {
          setSubmissionStatus('success');
          setStatusMessage('Action secured and logged successfully.');
          fetchLedger();
          setInputData('');
      } else {
          setSubmissionStatus('error');
          setStatusMessage('Request denied for security reasons.');
      }
    } catch (err: any) {
        setSubmissionStatus('error');
        setStatusMessage('Network communication failed.');
    } finally {
        setIsVerifying(false);
    }
  };

  return (
    <div className="z-10 text-gray-100 font-sans p-4 md:p-8 flex flex-col items-center w-full">
      <div className="w-full max-w-4xl space-y-10 py-8">
        
        {/* Header Section */}
        <header className="text-center space-y-4 relative">
          <div className="absolute top-0 right-0">
             <a href="/api/v1/export-project" className="inline-flex items-center space-x-2 bg-blue-600/30 hover:bg-blue-600/50 backdrop-blur-md px-4 py-2 rounded-full border border-blue-400/30 transition-all font-mono text-xs uppercase tracking-wider text-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.2)]">
                <Download className="w-4 h-4" />
                <span>Export TAR.GZ</span>
             </a>
          </div>
          <div className="inline-flex items-center space-x-3 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 mb-4 mt-6 md:mt-0">
            <Lock className="w-5 h-5 text-green-400" />
            <span className="font-bold tracking-widest uppercase text-white/90">Freedom Security System</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-wide drop-shadow-xl">
            {role.toUpperCase()}
          </h1>
          
          <p className="text-white/80 text-xl font-medium mt-2 max-w-2xl mx-auto drop-shadow-md">
            {config.subtitle}
          </p>
        </header>

        {/* Global Node Status */}
        {role !== 'Child' && (
        <section className="bg-black/60 backdrop-blur-lg rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"></div>
          
          <div className="flex items-center space-x-6">
             <motion.div
               animate={nodeStatus?.status === 'VERIFIED' ? { boxShadow: ['0px 0px 0px 0px rgba(34,197,94,0.4)', '0px 0px 20px 10px rgba(34,197,94,0)', '0px 0px 0px 0px rgba(34,197,94,0.4)'] } : {}}
               transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
               className={`p-4 rounded-full ${nodeStatus?.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-orange-500/20 text-orange-400 border-orange-500/50'} border-2 relative`}
             >
               <Wifi className="w-8 h-8 relative z-10" />
             </motion.div>
             
             <div>
                <h3 className="text-2xl font-bold tracking-wide text-white">
                  {nodeStatus?.status === 'VERIFIED' ? 'Secure Network Active' : 'Waiting for connection...'}
                </h3>
                <div className="flex items-center space-x-2 mt-2 text-white/50 text-sm">
                  <div className={`w-2 h-2 rounded-full ${nodeStatus?.status === 'VERIFIED' ? 'bg-green-400' : 'bg-orange-400 animate-pulse'}`}></div>
                  <p>All sensitive information is fully encrypted</p>
                </div>
             </div>
          </div>
          
          <div className="text-right bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
            <div className="text-xs text-white/40 uppercase tracking-widest font-bold mb-1">Current Time</div>
            <div className="font-mono text-lg text-white">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </section>
        )}

        {/* Action Form */}
        <section className="mt-8">
            {role === 'Child' ? (
               <div className="bg-black/40 backdrop-blur-lg rounded-3xl p-12 border border-green-500/20 flex flex-col items-center justify-center text-center shadow-2xl">
                    <div className="w-32 h-32 rounded-full bg-green-500/10 border-4 border-green-500/40 flex items-center justify-center mb-6">
                         <ShieldCheck className="w-16 h-16 text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-wide">Fully Protected</h2>
                    <p className="text-white/70 mt-4 max-w-md text-lg leading-relaxed">
                       {config.formDesc}
                    </p>
               </div>
            ) : (
            <div className="bg-black/60 backdrop-blur-lg rounded-3xl p-8 md:p-10 border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold text-white tracking-widest uppercase mb-2">{config.formTitle}</h3>
              <p className="text-white/60 mb-6 text-sm">{config.formDesc}</p>
              
              <textarea
                 value={inputData}
                 onChange={(e) => setInputData(e.target.value)}
                 className="w-full h-32 bg-white/5 rounded-2xl border border-white/10 p-5 text-lg text-white placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all resize-none mb-6"
                 placeholder="Type your secure command or message..."
              ></textarea>
              
              <button
                 onClick={handleManualSubmission}
                 disabled={isVerifying || !inputData}
                 className="w-full py-4 bg-white text-black font-bold text-lg rounded-xl uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-300 transition-all shadow-[0_5px_20px_rgba(255,255,255,0.2)] flex items-center justify-center space-x-3"
              >
                <Send className="w-5 h-5" />
                <span>{config.sealBtn}</span>
              </button>

              <AnimatePresence>
                {submissionStatus !== 'idle' && (
                   <motion.div
                     initial={{ opacity: 0, y: -10 }}
                     animate={{ opacity: 1, y: 0 }}
                     exit={{ opacity: 0, y: -10 }}
                     className={`mt-6 p-4 rounded-xl flex items-start space-x-4 border ${submissionStatus === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}
                   >
                      {submissionStatus === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <ShieldCheck className="w-6 h-6 shrink-0" />}
                      <span className="font-medium text-lg leading-tight">{statusMessage}</span>
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
            )}
        </section>

        {/* Real-time Intrusion Monitor */}
        {role !== 'Child' && (
        <section className="bg-black/60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl p-6 md:p-8 overflow-hidden relative min-h-[320px] flex flex-col">
            <div className="flex items-center justify-between mb-4 relative z-10">
               <div className="flex items-center space-x-3 text-white uppercase tracking-wider font-bold">
                 <ShieldAlert className="w-6 h-6 text-red-500" />
                 <span>Gatekeeper Perimeter Radar</span>
               </div>
               <div className="flex items-center space-x-2">
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                 <span className="text-red-400 font-mono text-xs font-bold tracking-widest uppercase">Monitoring Active</span>
               </div>
            </div>

            <div className="relative flex-1 rounded-2xl border border-red-500/20 bg-[#2a0808]/40 overflow-hidden shadow-inner flex flex-col items-center justify-center">
               <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.05)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
               
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-red-500/20 border-dashed opacity-50"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border border-red-500/20 border-dashed opacity-50"></div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
               
               <AnimatePresence>
                 {intrusions.map((node) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0.6, 0], scale: [0, node.scale, node.scale * 1.5, node.scale * 2.5] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 4, ease: 'easeOut' }}
                      className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-red-500 shadow-[0_0_20px_4px_rgba(239,68,68,0.7)]"
                      style={{ left: node.left, top: node.top }}
                    >
                      <div className="absolute inset-0 rounded-full border border-red-500 animate-ping"></div>
                    </motion.div>
                 ))}
               </AnimatePresence>

               {intrusions.length === 0 && (
                   <span className="text-white/30 font-mono text-xs tracking-widest z-10">NO UNAUTHORIZED TRAFFIC DETECTED</span>
               )}
            </div>
        </section>
        )}

        {/* Action Log / Ledger */}
        {role !== 'Child' && (
        <section className="bg-black/60 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl overflow-hidden mt-8">
          <div className="bg-white/5 px-6 py-5 border-b border-white/10 flex items-center justify-between">
            <span className="flex items-center space-x-3 text-white uppercase tracking-wider font-bold">
               <History className="w-5 h-5 opacity-70" />
               <span>{config.tableTitle}</span>
            </span>
            <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold text-white/70">{ledger.length} Records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-white/80">
              <thead className="bg-white/[0.02] text-xs tracking-wider uppercase text-white/40 border-b border-white/5">
                <tr>
                  <th className="px-6 py-4 font-bold">Time & Date</th>
                  <th className="px-6 py-4 font-bold">Activity</th>
                  <th className="px-6 py-4 font-bold text-right">Security Code</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {ledger.length === 0 ? (
                  <tr>
                     <td colSpan={3} className="text-center py-12 text-white/40 tracking-wider">
                       No recent activity found on this system.
                     </td>
                  </tr>
                ) : (
                  ledger.map((entry, idx) => (
                    <tr key={idx} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm">{entry.timestamp}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${entry.event.includes('ERROR') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                          {entry.event}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-white/40 text-right">{entry.fingerprint_sha256}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        )}
      </div>
    </div>
  );
}
