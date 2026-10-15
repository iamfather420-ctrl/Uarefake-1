import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  // Robust key detection: Check process.env (system) and env (file) for all common casings
  const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || 
                    process.env.Gemini_API_Key || env.Gemini_API_Key ||
                    process.env.gemini_api_key || env.gemini_api_key;

  return {
    plugins: [react(), tailwindcss()],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'import.meta.env.vite_wallet_connect': JSON.stringify(env.vite_wallet_connect || process.env.vite_wallet_connect),
      'import.meta.env.VITE_WALLET_CONNECT': JSON.stringify(env.VITE_WALLET_CONNECT || process.env.VITE_WALLET_CONNECT),
      'import.meta.env.VITE_WALLETCONNECT_PROJECT_ID': JSON.stringify(env.VITE_WALLETCONNECT_PROJECT_ID || process.env.VITE_WALLETCONNECT_PROJECT_ID || env.vite_wallet_connect || process.env.vite_wallet_connect),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: false,
      port: 3000,
      host: '0.0.0.0',
    },
  };
});
