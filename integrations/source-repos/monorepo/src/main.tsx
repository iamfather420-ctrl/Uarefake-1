import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { SovereignStrictJsonPipelineCore } from './lib/sovereignStrictJsonPipeline';

SovereignStrictJsonPipelineCore.initializeStrictJsonEnforcement();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

