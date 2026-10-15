import React, { useState } from 'react';

export interface SovereignApiResponse {
  success: boolean;
  proofHash?: string;
  bytesDelivered?: number;
  smtpResponse?: string;
  error?: string;
}

export interface PublishState {
  status: 'IDLE' | 'SEALING_ENCLAVE' | 'INFERRING_DAISY' | 'DIRECT_SOCKET_SEND' | 'SUCCESS' | 'ERROR';
  proofHash?: string;
  bytesTransferred?: number;
  errorMsg?: string;
}

export const PublishButton: React.FC = () => {
  const [state, setState] = useState<PublishState>({ status: 'IDLE' });

  const handlePublishAndLaunch = async () => {
    try {
      setState({ status: 'SEALING_ENCLAVE' });

      // Trigger Autonomous Enclave Seal & Outbound Outreach Engine
      const response = await fetch('/api/sovereign-smtp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'AUTONOMOUS_PUBLISH_AND_OUTREACH',
          domainTarget: 'target-opportunity.com',
          recipient: 'lead@target-opportunity.com'
        })
      });

      const data: SovereignApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to execute autonomous pipeline');
      }

      setState({
        status: 'SUCCESS',
        proofHash: data.proofHash,
        bytesTransferred: data.bytesDelivered
      });
    } catch (err: any) {
      setState({ status: 'ERROR', errorMsg: err.message });
    }
  };

  return (
    <div className="sovereign-publish-container p-4 border rounded-lg border-slate-800 bg-slate-900 text-white font-sans">
      <h3 className="text-xl font-bold mb-2">DAISY Sovereign Core Enclave</h3>
      <p className="text-sm text-slate-400 mb-4">
        Clicking Publish locks the 144-byte Q32.32 proof header and triggers instant direct-socket outreach.
      </p>

      <button
        onClick={handlePublishAndLaunch}
        disabled={state.status !== 'IDLE' && state.status !== 'SUCCESS' && state.status !== 'ERROR'}
        className="px-6 py-3 font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 transition-colors cursor-pointer"
      >
        {state.status === 'IDLE' && 'Publish / Launch Enclave'}
        {state.status === 'SEALING_ENCLAVE' && 'Sealing Enclave & Running Verifier...'}
        {state.status === 'SUCCESS' && 'Enclave Live - Outreach Active'}
        {state.status === 'ERROR' && 'Retry Publication'}
      </button>

      {state.status === 'SUCCESS' && (
        <div className="mt-4 p-3 bg-emerald-950 border border-emerald-700 rounded text-xs font-mono">
          <p className="text-emerald-400 font-bold">✓ 100% PARITY & OUTREACH ACTIVE</p>
          <p>Proof Hash: {state.proofHash}</p>
          <p>Bytes Transferred: {state.bytesTransferred} (Port 25 Direct)</p>
        </div>
      )}

      {state.status === 'ERROR' && (
        <div className="mt-4 p-3 bg-red-950 border border-red-700 rounded text-xs font-mono text-red-300">
          <p className="font-bold">❌ Pipeline Halted</p>
          <p>{state.errorMsg}</p>
        </div>
      )}
    </div>
  );
};

export default PublishButton;
