import React, { useState, useEffect, useRef } from 'react';
import { Project, TermuxProcess } from '../../types';
import { createSandboxBlobUrl } from '../../services/webRunner';
import { 
  Play, 
  RotateCw, 
  ExternalLink, 
  Terminal, 
  Server, 
  Globe, 
  AlertTriangle, 
  ChevronUp, 
  ChevronDown, 
  Trash2,
  Maximize2
} from 'lucide-react';

interface PreviewViewProps {
  project: Project | null;
  agentOnline: boolean;
  runningProcesses: TermuxProcess[];
  defaultPort?: number;
}

export const PreviewView: React.FC<PreviewViewProps> = ({
  project,
  agentOnline,
  runningProcesses,
  defaultPort = 5173,
}) => {
  const [previewMode, setPreviewMode] = useState<'sandbox' | 'local_server'>('sandbox');
  const [localPort, setLocalPort] = useState<number>(defaultPort);
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [sandboxUrl, setSandboxUrl] = useState<string>('');
  const [consoleLogs, setConsoleLogs] = useState<{ type: string; text: string; time: string }[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState<boolean>(false);

  // Generate sandbox blob URL when project files change
  useEffect(() => {
    if (project && previewMode === 'sandbox') {
      const url = createSandboxBlobUrl(project);
      setSandboxUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [project, previewMode, iframeKey]);

  // Listen to postMessage logs from the web sandbox iframe
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (e.data && e.data.source === 'pocketforge-sandbox-log') {
        setConsoleLogs(prev => [
          ...prev,
          {
            type: e.data.type || 'log',
            text: e.data.text || '',
            time: new Date().toLocaleTimeString()
          }
        ].slice(-100)); // keep last 100
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRefresh = () => {
    setIframeKey(k => k + 1);
  };

  const currentLocalUrl = `http://localhost:${localPort}`;
  const iframeSrc = previewMode === 'sandbox' ? sandboxUrl : currentLocalUrl;

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-65px)] bg-forge-950 overflow-hidden select-none">
      {/* Top Preview Control Bar */}
      <div className="bg-forge-900 border-b border-forge-750 px-3 py-2 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-forge-950 p-1 rounded-xl border border-forge-800 text-xs font-semibold">
          <button
            onClick={() => setPreviewMode('sandbox')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              previewMode === 'sandbox'
                ? 'bg-electric-500 text-forge-950 shadow-sm'
                : 'text-forge-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Web Sandbox</span>
          </button>

          <button
            onClick={() => setPreviewMode('local_server')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              previewMode === 'local_server'
                ? 'bg-electric-500 text-forge-950 shadow-sm'
                : 'text-forge-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Local Server</span>
          </button>
        </div>

        {/* Local Server Port Selector */}
        {previewMode === 'local_server' && (
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-forge-400">Port:</span>
            <input
              type="number"
              value={localPort}
              onChange={(e) => setLocalPort(Number(e.target.value))}
              className="w-16 bg-forge-950 border border-forge-750 rounded-lg px-2 py-1 text-white text-center font-bold focus:outline-none focus:border-electric-500"
            />
          </div>
        )}

        {/* Action Buttons: Refresh, Open in Browser Tab */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefresh}
            className="p-1.5 rounded-lg bg-forge-800 hover:bg-forge-750 text-forge-300 border border-forge-700 transition-colors"
            title="Reload Preview"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          <a
            href={previewMode === 'sandbox' ? sandboxUrl : currentLocalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forge-800 hover:bg-forge-750 text-forge-200 border border-forge-700 text-xs font-semibold transition-colors"
            title="Open in Native Browser Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Open Tab</span>
          </a>
        </div>
      </div>

      {/* Info Notice for Local Server Mode */}
      {previewMode === 'local_server' && !agentOnline && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 flex items-center gap-2 text-xs text-amber-400">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Termux agent is offline. Start your dev server in Termux or switch to <strong>Web Sandbox</strong> for offline rendering.
          </span>
        </div>
      )}

      {/* The Live Sandbox / Local Server Preview IFrame */}
      <div className="flex-1 bg-white relative overflow-hidden">
        {iframeSrc ? (
          <iframe
            key={iframeKey}
            src={iframeSrc}
            title="PocketForge Live Preview"
            sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
            className="w-full h-full border-none"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-forge-950 text-forge-500 text-xs">
            No preview content available.
          </div>
        )}
      </div>

      {/* Collapsible In-App Console Logger Drawer */}
      <div className="bg-forge-900 border-t border-forge-750 flex flex-col flex-shrink-0">
        <div 
          onClick={() => setIsConsoleOpen(prev => !prev)}
          className="px-4 py-1.5 flex items-center justify-between cursor-pointer text-xs font-mono text-forge-400 hover:text-white"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-electric-400" />
            <span>Preview Console ({consoleLogs.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {consoleLogs.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConsoleLogs([]);
                }}
                className="hover:text-rose-400 p-0.5"
                title="Clear Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            {isConsoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </div>
        </div>

        {isConsoleOpen && (
          <div className="p-3 bg-forge-950 max-h-40 overflow-y-auto space-y-1 font-mono text-xs select-text">
            {consoleLogs.length === 0 ? (
              <div className="text-forge-600 text-[11px] italic">Console output will appear here.</div>
            ) : (
              consoleLogs.map((log, i) => (
                <div 
                  key={i} 
                  className={`flex items-start gap-2 ${
                    log.type === 'error' ? 'text-rose-400' : log.type === 'warn' ? 'text-amber-400' : 'text-forge-200'
                  }`}
                >
                  <span className="text-forge-600 text-[10px] select-none">{log.time}</span>
                  <span className="break-all">{log.text}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
