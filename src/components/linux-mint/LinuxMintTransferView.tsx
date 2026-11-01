import React, { useState } from 'react';
import { Project } from '../../types';
import { exportLinuxMintBundle, triggerDownload } from '../../services/zipService';
import { 
  HardDriveDownload, 
  Terminal, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  FileCode, 
  ShieldCheck, 
  Cpu, 
  Download 
} from 'lucide-react';

interface LinuxMintTransferViewProps {
  activeProject: Project | null;
}

export const LinuxMintTransferView: React.FC<LinuxMintTransferViewProps> = ({ activeProject }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const handleExportLinuxMint = async () => {
    if (!activeProject) return;
    setIsExporting(true);

    try {
      const blob = await exportLinuxMintBundle(activeProject);
      triggerDownload(
        blob,
        `${activeProject.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-')}-linux-mint.zip`
      );
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  const isNode = activeProject?.template === 'react' || activeProject?.template === 'nextjs' || activeProject?.template === 'node-api' || activeProject?.template === 'discord-bot';
  const isPython = activeProject?.template === 'python-app' || activeProject?.template === 'flask-api';

  const aptCommand = `sudo apt update && sudo apt install -y ${isNode ? 'nodejs npm ' : ''}${isPython ? 'python3 python3-pip python3-venv ' : ''}git curl unzip`;

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <HardDriveDownload className="w-6 h-6 text-emerald-400" />
          <span>Linux Mint & Desktop Transfer Engine</span>
        </h1>
        <p className="text-xs text-forge-400 mt-0.5">
          Package your mobile project for instant execution on Linux Mint, Ubuntu, Debian, or desktop PCs.
        </p>
      </div>

      {/* Primary Export Action Banner */}
      <div className="bg-gradient-to-br from-forge-850 via-forge-900 to-forge-950 border border-emerald-500/30 rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
            <span>● Ready to Package</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white">
            Export for Linux Mint: <span className="text-emerald-400">{activeProject ? activeProject.name : 'Select a Project'}</span>
          </h2>
          <p className="text-xs text-forge-400 max-w-lg">
            Automatically scrubs binary caches and secrets, writes a tailored <code>LINUX_MINT_README.md</code>, and includes a one-click <code>run-linux.sh</code> starter script.
          </p>
        </div>

        <button
          onClick={handleExportLinuxMint}
          disabled={!activeProject || isExporting}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-forge-950 font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>{isExporting ? 'Packaging Bundle...' : 'Export Linux Mint Bundle (.zip)'}</span>
        </button>
      </div>

      {/* What Gets Included vs Excluded */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-forge-900 border border-forge-750 rounded-2xl p-4 space-y-2.5 text-xs">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Included in the Mint Bundle</span>
          </h3>
          <ul className="space-y-1.5 text-forge-300">
            <li>✓ Complete source code ({activeProject ? activeProject.files.length : 0} files)</li>
            <li>✓ <code>package.json</code> or <code>requirements.txt</code> dependencies</li>
            <li>✓ Tailored <code>LINUX_MINT_README.md</code> with exact setup steps</li>
            <li>✓ Auto-executable <code>run-linux.sh</code> boot script</li>
            <li>✓ Pre-configured <code>.gitignore</code></li>
          </ul>
        </div>

        <div className="bg-forge-900 border border-forge-750 rounded-2xl p-4 space-y-2.5 text-xs">
          <h3 className="font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-electric-400" />
            <span>Safely Excluded (To Save Phone Bandwidth)</span>
          </h3>
          <ul className="space-y-1.5 text-forge-400">
            <li>✗ Heavy <code>node_modules/</code> (re-installed cleanly on Linux)</li>
            <li>✗ Platform-specific <code>.venv/</code> Python virtualenvs</li>
            <li>✗ <code>.env</code> files containing secret API keys</li>
            <li>✗ Local build caches (<code>dist/</code>, <code>build/</code>)</li>
          </ul>
        </div>
      </div>

      {/* Linux Mint Desktop Terminal Commands Guide */}
      <div className="bg-forge-900 border border-forge-750 rounded-2xl p-5 space-y-4 shadow-xl">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Linux Mint Terminal Quick-Start</span>
        </h3>

        {/* Step 1: Install apt packages */}
        <div className="space-y-1.5 text-xs">
          <div className="text-forge-300 font-semibold">1. Install Prerequisites on Linux Mint:</div>
          <div className="bg-forge-950 border border-forge-800 rounded-xl p-3 flex items-center justify-between gap-2 font-mono text-[11px] text-emerald-400">
            <code className="select-all overflow-x-auto">{aptCommand}</code>
            <button
              onClick={() => copyCommand(aptCommand)}
              className="p-1 rounded hover:bg-forge-800 text-forge-400 hover:text-white flex-shrink-0"
              title="Copy"
            >
              {copiedCmd === aptCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2: Unzip and run */}
        <div className="space-y-1.5 text-xs">
          <div className="text-forge-300 font-semibold">2. Unzip and Boot with run-linux.sh:</div>
          <div className="bg-forge-950 border border-forge-800 rounded-xl p-3 flex items-center justify-between gap-2 font-mono text-[11px] text-emerald-400">
            <code className="select-all overflow-x-auto">chmod +x run-linux.sh && ./run-linux.sh</code>
            <button
              onClick={() => copyCommand('chmod +x run-linux.sh && ./run-linux.sh')}
              className="p-1 rounded hover:bg-forge-800 text-forge-400 hover:text-white flex-shrink-0"
              title="Copy"
            >
              {copiedCmd === 'chmod +x run-linux.sh && ./run-linux.sh' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
