import React, { useState, useEffect, useRef } from 'react';
import { Project, TermuxSystemInfo, TermuxProcess } from '../../types';
import { agentClient } from '../../services/agentClient';
import { redactSecrets } from '../../services/security';
import { 
  Terminal, 
  Play, 
  Square, 
  Trash2, 
  Copy, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Server, 
  Cpu, 
  HardDrive, 
  Key, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface TerminalViewProps {
  activeProject: Project | null;
  agentOnline: boolean;
  agentInfo: TermuxSystemInfo | null;
  runningProcesses: TermuxProcess[];
  onRefreshProcesses: () => void;
  onRequestCommandApproval: (command: string, cwd: string, reason: string, source: any) => void;
  onOpenPreview: (port?: number) => void;
}

export const TerminalView: React.FC<TerminalViewProps> = ({
  activeProject,
  agentOnline,
  agentInfo,
  runningProcesses,
  onRefreshProcesses,
  onRequestCommandApproval,
  onOpenPreview,
}) => {
  const [commandInput, setCommandInput] = useState('');
  const [terminalLogs, setTerminalLogs] = useState<{ id: string; type: 'input' | 'stdout' | 'stderr' | 'system'; text: string; time: string }[]>([
    {
      id: 'init-1',
      type: 'system',
      text: '⚡ POCKETFORGE AI Local Execution Terminal initialized.',
      time: new Date().toLocaleTimeString()
    }
  ]);
  const [isRunning, setIsRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Agent configuration state for pairing
  const [agentUrl, setAgentUrl] = useState(() => agentClient.getConfig().url);
  const [agentToken, setAgentToken] = useState(() => agentClient.getConfig().token);
  const [pairingStatus, setPairingStatus] = useState<string>('');

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs]);

  const handlePairAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setPairingStatus('Connecting...');
    agentClient.updateConfig({ url: agentUrl });

    try {
      const res = await agentClient.pair(agentToken);
      if (res.success) {
        setPairingStatus('✅ Successfully paired with local agent!');
        setTerminalLogs(prev => [
          ...prev,
          {
            id: 'pair-ok',
            type: 'system',
            text: `Connected to Termux Agent at ${agentUrl}. Workspace: ${res.workspace}`,
            time: new Date().toLocaleTimeString()
          }
        ]);
        onRefreshProcesses();
      }
    } catch (err: any) {
      setPairingStatus(`❌ Connection error: ${err.message}`);
    }
  };

  const handleRunCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    if (!agentOnline) {
      setTerminalLogs(prev => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          type: 'stderr',
          text: 'Error: Cannot execute command. PocketForge Termux local agent is offline. Please start the agent in Termux and pair below.',
          time: new Date().toLocaleTimeString()
        }
      ]);
      return;
    }

    setTerminalLogs(prev => [
      ...prev,
      {
        id: 'in-' + Date.now(),
        type: 'input',
        text: `$ ${cmd}`,
        time: new Date().toLocaleTimeString()
      }
    ]);
    setCommandInput('');
    setIsRunning(true);

    try {
      const cwd = activeProject ? activeProject.name : '';
      const res = await agentClient.execCommand(cmd, cwd);
      
      if (res.stdout) {
        setTerminalLogs(prev => [
          ...prev,
          {
            id: 'out-' + Date.now(),
            type: 'stdout',
            text: redactSecrets(res.stdout),
            time: new Date().toLocaleTimeString()
          }
        ]);
      }
      if (res.stderr) {
        setTerminalLogs(prev => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            type: 'stderr',
            text: redactSecrets(res.stderr),
            time: new Date().toLocaleTimeString()
          }
        ]);
      }

      setTerminalLogs(prev => [
        ...prev,
        {
          id: 'code-' + Date.now(),
          type: 'system',
          text: `[Process exited with code ${res.exitCode}]`,
          time: new Date().toLocaleTimeString()
        }
      ]);
      onRefreshProcesses();
    } catch (err: any) {
      setTerminalLogs(prev => [
        ...prev,
        {
          id: 'fail-' + Date.now(),
          type: 'stderr',
          text: `Execution failed: ${err.message}`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleStopProcess = async (processId: string) => {
    try {
      await agentClient.stopProcess(processId);
      onRefreshProcesses();
    } catch (err: any) {
      alert(`Could not stop process: ${err.message}`);
    }
  };

  const handleStartDevServer = async () => {
    if (!activeProject) return;
    const isPython = activeProject.template === 'python-app' || activeProject.template === 'flask-api';
    const devCmd = isPython ? 'python app.py' : 'npm run dev';
    const defaultPort = isPython ? 5000 : 5173;

    try {
      await agentClient.startProcess(devCmd, `${activeProject.name} Dev Server`, defaultPort, activeProject.name);
      onRefreshProcesses();
      setTerminalLogs(prev => [
        ...prev,
        {
          id: 'start-server-' + Date.now(),
          type: 'system',
          text: `🚀 Started dev server: "${devCmd}" on port ${defaultPort}`,
          time: new Date().toLocaleTimeString()
        }
      ]);
    } catch (err: any) {
      alert(`Failed to start server: ${err.message}`);
    }
  };

  const clearTerminal = () => {
    setTerminalLogs([
      {
        id: 'cleared',
        type: 'system',
        text: 'Terminal output cleared.',
        time: new Date().toLocaleTimeString()
      }
    ]);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Terminal className="w-6 h-6 text-emerald-400" />
            <span>Terminal & Local Execution</span>
          </h1>
          <p className="text-xs text-forge-400 mt-0.5">
            Real Node.js and Python shell execution powered by the PocketForge Termux local agent.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeProject && agentOnline && (
            <button
              onClick={handleStartDevServer}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-forge-950 text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Dev Server</span>
            </button>
          )}

          <button
            onClick={clearTerminal}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forge-800 hover:bg-forge-750 text-forge-300 border border-forge-700 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Running Background Dev Servers */}
      {runningProcesses.length > 0 && (
        <div className="bg-forge-900 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <span>Active Background Development Servers ({runningProcesses.length})</span>
            </h3>
            <button
              onClick={onRefreshProcesses}
              className="text-forge-400 hover:text-white p-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {runningProcesses.map(proc => (
              <div
                key={proc.id}
                className="bg-forge-950 border border-forge-800 rounded-xl p-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{proc.name}</div>
                  <div className="text-[11px] font-mono text-forge-400 truncate">
                    <code>{proc.command}</code> {proc.port ? `(:${proc.port})` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {proc.port && (
                    <button
                      onClick={() => onOpenPreview(proc.port || undefined)}
                      className="px-2.5 py-1 rounded bg-electric-500/10 text-electric-400 hover:bg-electric-500/20 font-semibold text-[11px] border border-electric-500/30"
                    >
                      Preview
                    </button>
                  )}
                  <button
                    onClick={() => handleStopProcess(proc.id)}
                    className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30"
                    title="Stop Process"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* The Real Terminal Window */}
      <div className="bg-forge-950 border border-forge-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Terminal Header Bar */}
        <div className="bg-forge-900 border-b border-forge-800 px-4 py-2.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-forge-400 text-[11px]">
              {activeProject ? `termux:~/${activeProject.name}` : 'termux:~'}
            </span>
          </div>

          <div className="text-[11px] text-forge-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${agentOnline ? 'bg-emerald-400' : 'bg-rose-500'}`} />
            <span>{agentOnline ? '127.0.0.1:8765' : 'Termux Offline'}</span>
          </div>
        </div>

        {/* Scrollable Output Box */}
        <div className="p-4 max-h-80 sm:max-h-96 min-h-[220px] overflow-y-auto space-y-2 select-text">
          {terminalLogs.map(log => {
            if (log.type === 'input') {
              return (
                <div key={log.id} className="text-electric-400 font-bold">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'stderr') {
              return (
                <div key={log.id} className="text-rose-400 whitespace-pre-wrap">
                  {log.text}
                </div>
              );
            }
            if (log.type === 'system') {
              return (
                <div key={log.id} className="text-forge-500 text-[11px] italic">
                  {log.text}
                </div>
              );
            }
            return (
              <div key={log.id} className="text-forge-200 whitespace-pre-wrap">
                {log.text}
              </div>
            );
          })}
          {isRunning && (
            <div className="text-amber-400 flex items-center gap-2">
              <span className="animate-spin">⏳</span>
              <span>Executing command...</span>
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Interactive Shell Input Line */}
        <form onSubmit={handleRunCommand} className="bg-forge-900 border-t border-forge-800 p-2.5 flex items-center gap-2">
          <span className="text-emerald-400 font-bold pl-2 select-none">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            disabled={isRunning}
            placeholder={agentOnline ? "npm test, git status, python app.py, ls -la..." : "Agent is offline - pair below to enable shell execution"}
            className="flex-1 bg-transparent text-white font-mono text-xs focus:outline-none"
          />
          <button
            type="submit"
            disabled={!commandInput.trim() || isRunning}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-forge-950 font-bold text-xs disabled:opacity-50"
          >
            Run
          </button>
        </form>
      </div>

      {/* TERMUX SETUP & PAIRING SECTION (Shown when offline or to re-pair) */}
      {!agentOnline ? (
        <div className="bg-forge-900 border border-amber-500/30 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Connect Termux Local Agent on Android
              </h3>
              <p className="text-xs text-forge-400 mt-0.5">
                Android web browsers cannot run arbitrary shell commands directly. PocketForge uses a lightweight local daemon running in Termux to give your phone full command execution.
              </p>
            </div>
          </div>

          {/* 3 Step Setup Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-forge-950 p-3.5 rounded-xl border border-forge-800 space-y-1.5">
              <div className="font-bold text-electric-400">1. Install in Termux</div>
              <p className="text-forge-400 text-[11px]">
                Install Node.js & Git in Termux (F-Droid version):
              </p>
              <code className="block bg-forge-900 p-2 rounded text-[10px] text-forge-300 font-mono select-all">
                pkg install -y nodejs-lts python git
              </code>
            </div>

            <div className="bg-forge-950 p-3.5 rounded-xl border border-forge-800 space-y-1.5">
              <div className="font-bold text-electric-400">2. Start Local Agent</div>
              <p className="text-forge-400 text-[11px]">
                Run the PocketForge local agent:
              </p>
              <code className="block bg-forge-900 p-2 rounded text-[10px] text-forge-300 font-mono select-all">
                node agent/pocketforge-agent.js
              </code>
            </div>

            <div className="bg-forge-950 p-3.5 rounded-xl border border-forge-800 space-y-1.5">
              <div className="font-bold text-electric-400">3. Pair Below</div>
              <p className="text-forge-400 text-[11px]">
                Copy the auth token printed in Termux and paste it into the pairing form below.
              </p>
            </div>
          </div>

          {/* Pairing Form */}
          <form onSubmit={handlePairAgent} className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:w-1/3">
              <label className="text-[11px] font-mono text-forge-400 block mb-1">Agent URL</label>
              <input
                type="text"
                value={agentUrl}
                onChange={(e) => setAgentUrl(e.target.value)}
                placeholder="http://127.0.0.1:8765"
                className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-electric-500"
              />
            </div>

            <div className="w-full sm:w-1/2">
              <label className="text-[11px] font-mono text-forge-400 block mb-1">Auth Token</label>
              <input
                type="password"
                value={agentToken}
                onChange={(e) => setAgentToken(e.target.value)}
                placeholder="pf_sec_..."
                className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-electric-500"
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto mt-auto px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-forge-950 font-bold text-xs transition-colors shadow-md shadow-electric-500/20"
            >
              Pair Agent
            </button>
          </form>

          {pairingStatus && (
            <div className="text-xs font-mono text-forge-300 mt-2">
              {pairingStatus}
            </div>
          )}
        </div>
      ) : (
        /* Agent Connected Telemetry Pill */
        <div className="bg-forge-900 border border-emerald-500/20 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <div className="font-bold text-white">Local Agent Paired & Active</div>
              <div className="text-forge-400 text-[11px] font-mono">
                Platform: {agentInfo?.platform} ({agentInfo?.isTermux ? 'Android Termux' : 'Linux/Host'}) • Uptime: {Math.round((agentInfo?.uptime || 0) / 60)} min
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-forge-400 font-mono text-[11px]">
            <span>RAM: {agentInfo?.memory?.usedMB || 0}MB / {agentInfo?.memory?.totalMB || 0}MB</span>
            <button
              onClick={() => {
                agentClient.updateConfig({ token: '' });
                window.location.reload();
              }}
              className="text-rose-400 hover:underline"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
