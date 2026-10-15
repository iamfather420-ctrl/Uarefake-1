// SUPPRESS NOISY BIGINT WARNING (Client-side)
// This must be at the very top before any imports that might trigger it
const silenceBigInt = () => {
  const suppress = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('bigint: Failed to load bindings')) {
      return true;
    }
    return false;
  };

  const oldError = console.error;
  console.error = (...args: any[]) => {
    if (suppress(...args)) return;
    oldError.apply(console, args);
  };

  const oldWarn = console.warn;
  console.warn = (...args: any[]) => {
    if (suppress(...args)) return;
    oldWarn.apply(console, args);
  };
};
silenceBigInt();

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { Web3Provider } from './lib/web3.tsx';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Web3Provider>
      <App />
    </Web3Provider>
  </StrictMode>,
);
