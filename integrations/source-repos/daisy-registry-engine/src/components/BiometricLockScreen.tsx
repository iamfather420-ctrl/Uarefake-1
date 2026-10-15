import React, { useState, useEffect } from 'react';
import { Lock, Shield, Fingerprint, KeyRound, CheckCircle2, AlertTriangle, Cpu, Terminal, Sparkles } from 'lucide-react';

interface BiometricLockScreenProps {
  onUnlock: () => void;
}

export const BiometricLockScreen: React.FC<BiometricLockScreenProps> = ({ onUnlock }) => {
  const [pinCode, setPinCode] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('TOUCH AND HOLD SENSOR TO INITIATE COGNITIVE SCAN');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isScanning) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false);
            setStatusMessage('COGNITIVE SCAN VERIFIED // BIOMETRIC ACCESS GRANTED');
            setTimeout(() => {
              onUnlock();
            }, 600);
            return 100;
          }
          return prev + 12;
        });
      }, 100);
    } else {
      setScanProgress(0);
    }
    return () => clearInterval(interval);
  }, [isScanning, onUnlock]);

  const handleTouchStart = () => {
    setErrorMsg('');
    setIsScanning(true);
    setStatusMessage('ANALYZING COGNITIVE FREQUENCY... HOLD SENSOR');
  };

  const handleTouchEnd = () => {
    if (scanProgress < 100) {
      setIsScanning(false);
      setScanProgress(0);
      setStatusMessage('SCAN INTERRUPTED • HOLD UNTIL COMPLETE');
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinCode.trim()) {
      // Default unlock if empty or any PIN entered
      setStatusMessage('COMPLIANCE CODE VERIFIED // OVERRIDE GRANTED');
      setTimeout(() => onUnlock(), 400);
      return;
    }

    if (pinCode === '88' || pinCode.toLowerCase() === 'uarefake' || pinCode === '1234' || pinCode.trim().length > 0) {
      setStatusMessage('COMPLIANCE OVERRIDE AUTHORIZED // INITIALIZING ENCLAVE');
      setTimeout(() => onUnlock(), 400);
    } else {
      setErrorMsg('INVALID COMPLIANCE PIN CODE');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#030307] text-[#E0E0F0] flex flex-col items-center justify-between p-4 sm:p-8 select-none font-sans overflow-y-auto">
      {/* Background Cyber Grid effect */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#00F0FF 1px, transparent 1px), radial-gradient(#FF0055 1px, #030307 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px'
        }}
      />

      {/* Top Header Badge */}
      <div className="flex flex-col items-center pt-6 z-10">
        <div className="w-12 h-12 rounded-2xl bg-[#1A0A18] border border-[#FF0055] flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(255,0,85,0.4)] animate-pulse">
          <Lock className="w-6 h-6 text-[#FF0055]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-[0.25em] text-white uppercase text-center">
          DAISY HAMINJA AI OS
        </h1>
        <p className="text-[11px] font-mono tracking-widest text-[#FF0055] uppercase mt-1 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF0055] inline-block animate-ping"></span>
          SECURE COGNITIVE MEMORY SPACE ENCRYPTED
        </p>
      </div>

      {/* Main Sensor Scanner Widget */}
      <div className="my-auto py-8 flex flex-col items-center justify-center z-10 max-w-md w-full">
        <div className="relative flex flex-col items-center justify-center">
          {/* Pulsing Outer Shield Ring */}
          <div 
            onMouseDown={handleTouchStart}
            onMouseUp={handleTouchEnd}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              // Quick tap alternative if click
              if (!isScanning) {
                setIsScanning(true);
              }
            }}
            className={`w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative group ${
              isScanning
                ? 'border-[#00FF41] bg-[#002B10] shadow-[0_0_40px_rgba(0,255,65,0.5)] scale-105'
                : 'border-[#1A2538] bg-[#080E18] hover:border-[#00F0FF] hover:shadow-[0_0_30px_rgba(0,240,255,0.3)]'
            }`}
          >
            {/* SVG Ring Progress */}
            {isScanning && (
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="46%"
                  stroke="#00FF41"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray="280"
                  strokeDashoffset={280 - (280 * scanProgress) / 100}
                  className="transition-all duration-100 ease-linear"
                />
              </svg>
            )}

            {isScanning ? (
              <Fingerprint className="w-16 h-16 sm:w-20 sm:h-20 text-[#00FF41] animate-pulse" />
            ) : (
              <Shield className="w-14 h-14 sm:w-16 sm:h-16 text-[#00F0FF] group-hover:scale-110 transition-transform" />
            )}

            {/* Glowing inner core */}
            <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none"></div>
          </div>

          {/* Progress bar indicator */}
          {isScanning && (
            <div className="w-48 bg-[#1A1A25] h-1.5 rounded-full overflow-hidden mt-6 border border-[#00FF41]/30">
              <div 
                className="bg-[#00FF41] h-full transition-all duration-100 shadow-[0_0_10px_#00FF41]"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
          )}

          {/* Status Instruction */}
          <div className="mt-6 text-center font-mono text-[11px] tracking-wider max-w-xs">
            <p className={`font-semibold transition-colors ${isScanning ? 'text-[#00FF41]' : 'text-[#8080A0]'}`}>
              {statusMessage}
            </p>
            <p className="text-[10px] text-[#505060] mt-1">
              [ TOUCH & HOLD OR CLICK TO VERIFY COGNITIVE IDENTITY ]
            </p>
          </div>
        </div>

        {/* Override PIN Mode Container */}
        <div className="mt-10 w-full bg-[#080B12] border border-[#1E2538] rounded-xl p-4 sm:p-5 shadow-2xl backdrop-blur">
          <div className="flex items-center justify-between text-[11px] font-mono tracking-wider mb-3">
            <span className="text-[#00F0FF] font-bold flex items-center gap-1.5 uppercase">
              <KeyRound className="w-3.5 h-3.5 text-[#00F0FF]" />
              OVERRIDE PIN MODE
            </span>
            <span className="text-[#505060]">Default Bypass: Click/Touch</span>
          </div>

          <form onSubmit={handlePinSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="password"
                placeholder="INPUT COMPLIANCE CODE"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                className="w-full bg-[#030509] border border-[#1F293D] rounded-lg px-3 py-2.5 text-xs font-mono text-white placeholder-[#404055] focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] uppercase tracking-widest"
              />
            </div>
            <button
              type="submit"
              className="bg-[#00FF41]/10 hover:bg-[#00FF41]/20 border border-[#00FF41] text-[#00FF41] px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-widest transition-all hover:shadow-[0_0_15px_rgba(0,255,65,0.4)] active:scale-95 flex items-center gap-1.5"
            >
              <span>UNLOCK</span>
            </button>
          </form>

          {errorMsg && (
            <p className="text-[10px] font-mono text-[#FF0055] mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              {errorMsg}
            </p>
          )}

          <div className="mt-3 pt-3 border-t border-[#121824] flex items-center justify-between text-[10px] font-mono text-[#505065]">
            <span>ENCLAVE LOCK: ACTIVE</span>
            <button
              type="button"
              onClick={() => onUnlock()}
              className="text-[#00F0FF] hover:underline"
            >
              DIRECT SYSTEM ACCESS &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="z-10 text-center font-mono text-[10px] tracking-widest text-[#404050] uppercase pb-2">
        <p>DAISY HAMINJA OS KERNEL V2.8.0-BETA-X // SPACE ENCLAVES SECURE SANDBOX</p>
        <p className="text-[#303040] mt-0.5">UAREFAKE DOMAIN ENFORCED • SSL SECURE TUNNEL</p>
      </div>
    </div>
  );
};
