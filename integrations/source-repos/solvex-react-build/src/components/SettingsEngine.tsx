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

import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../types';

/**
 * SolveX Decentralized Software Pipeline CaaS: Configuration Engine
 * Maps directly to secure payload management models.
 */

const defaultSettings: SystemSettings = {
  monitoring: {
    strict_filtering: true,
    block_trackers: true,
    custom_blocklist: [],
    custom_allowlist: []
  },
  storage: {
    max_log_size_mb: 50,
    retention_days: 7,
    auto_purge_on_violation: true
  },
  telemetry: {
    silent_logging: true,
    local_notification_level: 'CRITICAL',
    local_network_broadcast: false
  },
  access: {
    admin_hash_sha256: '',
    override_key_enabled: false
  },
  integrations: {
    stripe_live_key: '',
    solvex_master_node_key: '',
    active_webhook_url: ''
  }
};

export default function SettingsEngine() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [unmaskSecrets, setUnmaskSecrets] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('system_node_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse local settings', e);
      }
    }
  }, []);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSave = () => {
    localStorage.setItem('system_node_settings', JSON.stringify(settings));
    showStatus('Settings saved to your device.');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'user_settings.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showStatus('Settings backup file generated.');
  };

  const handleMonitoringToggle = (key: keyof typeof settings.monitoring) => {
    setSettings(prev => ({
      ...prev,
      monitoring: {
        ...prev.monitoring,
        [key]: !prev.monitoring[key]
      }
    }));
  };

  const handlePurgeRequest = () => {
    if (window.confirm("WARNING: This will permanently erase your local settings and return to factory defaults. Are you sure you want to proceed?")) {
      localStorage.removeItem('system_node_settings');
      setSettings(defaultSettings);
      showStatus('All settings have been successfully reset.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-8 space-y-8 bg-white text-slate-800 rounded-xl shadow-lg border border-slate-200 font-sans">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Privacy & Safety Settings</h2>
        <p className="text-slate-500 text-sm">Manage your local device settings. All your data stays private and secure on your device.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monitoring Profile */}
        <section className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Safety & Privacy Filters</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-5 w-5 text-blue-600 rounded bg-white border-slate-300 focus:ring-offset-slate-50"
                checked={settings.monitoring.strict_filtering}
                onChange={() => handleMonitoringToggle('strict_filtering')}
              />
              <span className="text-sm">Enable Strict Content Filtering (Block adult/unsafe content)</span>
            </label>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input 
                type="checkbox" 
                className="form-checkbox h-5 w-5 text-blue-600 rounded bg-white border-slate-300 focus:ring-offset-slate-50"
                checked={settings.monitoring.block_trackers}
                onChange={() => handleMonitoringToggle('block_trackers')}
              />
              <span className="text-sm">Block Advertising & Data Trackers</span>
            </label>
          </div>
        </section>

        {/* Local Storage & Ledger Auditing */}
        <section className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Data Storage Limits</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1 block">Maximum Storage Limit (MB)</label>
              <input 
                type="number" 
                value={settings.storage.max_log_size_mb}
                onChange={(e) => setSettings(s => ({...s, storage: {...s.storage, max_log_size_mb: Number(e.target.value)}}))}
                className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1 block">Keep History For (Days)</label>
              <input 
                type="number" 
                value={settings.storage.retention_days}
                onChange={(e) => setSettings(s => ({...s, storage: {...s.storage, retention_days: Number(e.target.value)}}))}
                className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </section>

        {/* Telemetry Handlers */}
        <section className="bg-slate-50 p-5 rounded-lg border border-slate-200">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Alerts & Notifications</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1 block">Device Alert Level</label>
              <select 
                value={settings.telemetry.local_notification_level}
                onChange={(e) => setSettings(s => ({...s, telemetry: {...s.telemetry, local_notification_level: e.target.value as any}}))}
                className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              >
                <option value="NONE">None</option>
                <option value="LOW">Low</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </section>

        {/* Cryptographic Access */}
        <section className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-blue-700">Security & Access</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1 block">Administrator Password / PIN</label>
              <input 
                type="password" 
                placeholder="Secure Password"
                value={settings.access.admin_hash_sha256}
                onChange={(e) => setSettings(s => ({...s, access: {...s.access, admin_hash_sha256: e.target.value}}))}
                className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <button 
              onClick={handlePurgeRequest}
              className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded transition-colors font-semibold"
            >
              RESET & ERASE ALL DATA
            </button>
          </div>
        </section>

        {/* Production Integrations Matrix */}
        <section className="md:col-span-2 bg-slate-100 p-5 rounded-lg border border-slate-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Advanced Integrations (Optional)</h3>
            <button 
              onClick={() => setUnmaskSecrets(!unmaskSecrets)}
              className="px-3 py-1 text-xs border border-slate-400 text-slate-600 rounded hover:bg-slate-200 transition"
            >
              {unmaskSecrets ? "MASK SECRETS" : "UNMASK SECRETS"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1 block uppercase">Payment API Key (Stripe)</label>
              <input 
                type={unmaskSecrets ? "text" : "password"} 
                placeholder="sk_live_..."
                value={settings.integrations.stripe_live_key}
                onChange={(e) => setSettings(s => ({...s, integrations: {...s.integrations, stripe_live_key: e.target.value}}))}
                className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1 block uppercase">Network Node Key</label>
              <input 
                type={unmaskSecrets ? "text" : "password"} 
                placeholder="SX-PROD-..."
                value={settings.integrations.solvex_master_node_key}
                onChange={(e) => setSettings(s => ({...s, integrations: {...s.integrations, solvex_master_node_key: e.target.value}}))}
                className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 outline-none"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs text-slate-500 font-medium mb-1 block uppercase">Custom Alert Webhook URL</label>
              <input 
                type="url" 
                placeholder="https://..."
                value={settings.integrations.active_webhook_url}
                onChange={(e) => setSettings(s => ({...s, integrations: {...s.integrations, active_webhook_url: e.target.value}}))}
                className="w-full bg-white border border-slate-300 rounded p-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-800 outline-none"
              />
            </div>
          </div>
          <p className="mt-4 text-xs text-slate-600 leading-relaxed bg-slate-200/50 p-3 rounded border border-slate-200">
            <strong>INFORMATION:</strong> Settings provided here establish a direct, secure connection to external services for personalized alerts and network processing.
          </p>
        </section>

        {/* Action Footer */}
        <div className="md:col-span-2 flex flex-col md:flex-row items-center justify-between mt-6 pt-6 border-t border-slate-200">
          <div className="flex items-center space-x-4 w-full md:w-auto mb-4 md:mb-0">
            <button 
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded shadow-sm transition-colors"
            >
              Save Settings
            </button>
            <button 
              onClick={handleExport}
              className="px-6 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded shadow-sm transition-colors"
            >
              Export Settings Backup
            </button>
          </div>
          {statusMessage && (
            <div className="text-blue-700 font-semibold animate-pulse text-sm bg-blue-50 px-3 py-1 rounded border border-blue-200">
              {statusMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
