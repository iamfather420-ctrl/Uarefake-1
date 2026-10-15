/**
 * ==============================================================================
 * CLAIM OF INTELLECTUAL PROPERTY & ORIGINAL PROVENANCE
 * AUTHOR / TRUSTEE: TODD JEFFREY ITES JR. (TJ)
 * PROJECT ANCHOR: SOLVEX DECENTRALIZED PIPELINE CAAS
 *
 * GENESIS ENTRY TIMESTAMP: DECEMBER 25, 2025
 * SECURITY PERIMETER CONSTRAINT: 380-CHARACTER CRYPTOGRAPHIC HEADER REQUIRED
 * HARDWARE ROOT VALIDATION SIGNATURE: MAESTRO_AGE_2026
 *
 * NOTICE: THIS SOFTWARE IS AN INDEPENDENT SCRIPTURAL AND CRYPTOGRAPHIC BUILD.
 * ANY UNAUTHORIZED REPLICATION, REVERSE-ENGINEERING, OR SYSTEMIC TRESPASS 
 * CONSTITUTES AN IMMEDIATE INFRINGEMENT OF ORIGINAL PROVENANCE.
 * ==============================================================================
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import SolveXDashboard from './components/SolveXDashboard';
import RoleSelection from './components/RoleSelection';

export default function App() {
  const [role, setRole] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center relative overflow-hidden">
      {/* 5D Animated Background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        {/* Layer 1: Radial Depth Gradient */}
        <motion.div 
          animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
          transition={{ duration: 25, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#d4af3715] via-[#09090b] to-[#000000] bg-[length:200%_200%]"
        />
        {/* Layer 2: Rotating Geometry (Inner) */}
        <motion.div
           animate={{ rotate: 360, scale: [1, 1.25, 1], opacity: [0.3, 0.6, 0.3] }}
           transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[1px] border-[#d4af371a] border-dashed"
        />
        {/* Layer 3: Rotating Geometry (Outer) */}
        <motion.div
           animate={{ rotate: -360, scale: [1, 1.5, 1], opacity: [0.1, 0.4, 0.1] }}
           transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border-[2px] border-[#d4af370f] rounded-full"
        />
        {/* Layer 4: Pulse Nodes */}
        <motion.div
           animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.5, 0.8] }}
           transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
           className="absolute top-[20%] left-[30%] w-[400px] h-[400px] bg-[#d4af3708] rounded-full blur-[60px]"
        />
        <motion.div
           animate={{ opacity: [0, 0.4, 0], scale: [0.9, 1.3, 0.9] }}
           transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
           className="absolute bottom-[20%] right-[30%] w-[500px] h-[500px] bg-[#991b1b08] rounded-full blur-[80px]"
        />
        {/* Layer 5: Chaotic Holographic Grid (Green, Silver, Purple) */}
        <motion.div
           animate={{
             backgroundSize: ['100% 4px', '200% 20px', '50% 10px', '300% 50px', '100% 4px'],
             backgroundPosition: ['0px 0px', '100px 100px', '-50px 200px', '200px -100px', '0px 0px'],
             rotate: [0, 3, -2, 5, -5, 0],
             scale: [1, 1.15, 0.85, 1.3, 1],
             opacity: [0.2, 0.6, 0.3, 0.8, 0.2],
             filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(-45deg)', 'hue-rotate(180deg)', 'hue-rotate(0deg)']
           }}
           transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
           className="absolute inset-0 pointer-events-none mix-blend-lighten"
           style={{
             backgroundImage: `
               repeating-linear-gradient(0deg, transparent, transparent 10px, #22c55e15 10px, #22c55e15 20px),
               repeating-linear-gradient(90deg, transparent, transparent 10px, #a855f715 10px, #a855f715 20px),
               radial-gradient(circle at 50% 50%, #c0c0c030 2px, transparent 4px)
             `
           }}
        />
      </div>

      <div className="relative z-10 w-full h-full flex items-center justify-center">
        {!role ? <RoleSelection onSelect={setRole} /> : <SolveXDashboard role={role} />}
      </div>
    </div>
  );
}
