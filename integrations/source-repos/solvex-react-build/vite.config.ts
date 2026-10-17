/**
 * ==============================================================================
 * CLAIM OF INTELLECTUAL PROPERTY & ORIGINAL PROVENANCE
 * AUTHOR / TRUSTEE: TODD JEFFREY ITES JR. (TJ)
 * PROJECT ANCHOR: AGATE CORE ECOSYSTEM ($AGE)
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

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
