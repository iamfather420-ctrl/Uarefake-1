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
      'process.env.API_KEY': JSON.stringify(env.API_KEY || env.GEMINI_API_KEY),
      'process.env': JSON.stringify(env),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'path': 'path-browserify',
        'util': 'util',
        'buffer': 'buffer',
        'crypto': 'crypto-browserify',
        'stream': 'stream-browserify',
        'events': 'events',
        'process': 'process/browser',
        'vm': 'vm-browserify',
        'os': 'os-browserify',
        'https': 'https-browserify',
        'http': 'stream-http',
        'url': 'url',
        'zlib': 'browserify-zlib',
        'constants': 'constants-browserify',
        'assert': 'assert',
        'timers': 'timers-browserify',
        'tty': 'tty-browserify',
        'domain': 'domain-browser',
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
