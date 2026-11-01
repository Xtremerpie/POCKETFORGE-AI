import React, { useState } from 'react';
import { AISettings, TermuxSystemInfo } from '../../types';
import { agentClient } from '../../services/agentClient';
import { 
  Settings, 
  Terminal, 
  Trash2, 
  HardDrive, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Info 
} from 'lucide-react';

interface SettingsViewProps {
  aiSettings: AISettings;
  onUpdateAISettings: (settings: AISettings) => void;
  agentOnline: boolean;
  agentInfo: TermuxSystemInfo | null;
  isOnline: boolean;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  aiSettings,
  onUpdateAISettings,
  agentOnline,
  agentInfo,
  isOnline,
  onResetAllData,
}) => {
  const [agentUrl, setAgentUrl] = useState(() => agentClient.getConfig().url);
  const [agentToken, setAgentToken] = useState(() => agentClient.getConfig().token);
  const [saveStatus, setSaveStatus] = useState('');

  const handleSaveAgent = (e: React.FormEvent) => {
    e.preventDefault();
    agentClient.updateConfig({
      url: agentUrl.trim(),
      token: agentToken.trim()
    });
    setSaveStatus('✅ Agent settings updated.');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-20 md:pb-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-electric-400" />
          <span>System Settings</span>
        </h1>
        <p className="text-xs text-forge-400 mt-0.5">
          Configure Termux local agent, offline PWA storage, and system preferences.
        </p>
      </div>

      {/* Termux Local Execution Agent Config */}
      <div className="bg-forge-900 border border-forge-750 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-forge-800">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Termux Local Agent Connection</h3>
          </div>
          <span className={`text-xs font-mono ${agentOnline ? 'text-emerald-400' : 'text-forge-500'}`}>
            {agentOnline ? '● CONNECTED' : '○ DISCONNECTED'}
          </span>
        </div>

        <form onSubmit={handleSaveAgent} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-forge-300 block mb-1 font-semibold">Agent Server URL</label>
              <input
                type="text"
                value={agentUrl}
                onChange={(e) => setAgentUrl(e.target.value)}
                placeholder="http://127.0.0.1:8765"
                className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-electric-500"
              />
            </div>

            <div>
              <label className="text-forge-300 block mb-1 font-semibold">Security Pairing Token</label>
              <input
                type="password"
                value={agentToken}
                onChange={(e) => setAgentToken(e.target.value)}
                placeholder="pf_sec_..."
                className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-electric-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-forge-400">
              Token generated in Termux: <code>~/.pocketforge/token</code>
            </span>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-electric-500 hover:bg-electric-400 text-forge-950 font-bold text-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>

        {saveStatus && (
          <div className="text-xs text-emerald-400 font-mono">{saveStatus}</div>
        )}
      </div>

      {/* Network & Offline PWA Status */}
      <div className="bg-forge-900 border border-forge-750 rounded-2xl p-5 space-y-3 shadow-xl">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          {isOnline ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-amber-400" />}
          <span>PWA & Offline Telemetry</span>
        </h3>
        <p className="text-xs text-forge-300 leading-relaxed">
          Network Status: <strong className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>{isOnline ? 'Online' : 'Offline'}</strong>. PocketForge AI is an installable Progressive Web Application (PWA) with client-side caching. Project editing, local drafting, file management, and web sandbox previews operate without an active internet connection.
        </p>
      </div>

      {/* Storage & Data Reset */}
      <div className="bg-forge-900 border border-rose-500/20 rounded-2xl p-5 space-y-3 shadow-xl">
        <h3 className="font-bold text-sm text-white flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-rose-400" />
          <span>Storage Management & Reset</span>
        </h3>
        <p className="text-xs text-forge-400">
          Reset all locally saved IndexedDB projects, preferences, and restore factory starter templates.
        </p>
        <button
          onClick={onResetAllData}
          className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors"
        >
          Reset Application Data
        </button>
      </div>

      {/* About & Version */}
      <div className="bg-forge-950 border border-forge-800 rounded-2xl p-4 text-xs font-mono text-forge-400 space-y-1">
        <div className="text-white font-bold">POCKETFORGE AI v1.0.0</div>
        <div>Tagline: Your phone. Your code. Your own development universe.</div>
        <div>Target Runtimes: Android Termux, Linux Mint, Desktop Web.</div>
      </div>
    </div>
  );
};
