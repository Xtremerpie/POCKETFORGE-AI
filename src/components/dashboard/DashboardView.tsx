import React, { useMemo } from 'react';
import { Project, TermuxSystemInfo, ViewTab, AISettings, GitHubUser, TermuxProcess } from '../../types';
import { 
  FolderKanban, 
  Terminal, 
  Cpu, 
  Sparkles, 
  Github, 
  HardDrive, 
  Play, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Server,
  Layers,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  activeProject: Project | null;
  agentOnline: boolean;
  agentInfo: TermuxSystemInfo | null;
  runningProcesses: TermuxProcess[];
  aiSettings: AISettings;
  githubUser: GitHubUser | null;
  onNavigate: (tab: ViewTab) => void;
  onOpenProject: (project: Project) => void;
  onQuickCreate: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  projects,
  activeProject,
  agentOnline,
  agentInfo,
  runningProcesses,
  aiSettings,
  githubUser,
  onNavigate,
  onOpenProject,
  onQuickCreate,
}) => {
  // Compute real application metrics
  const totalFiles = useMemo(() => {
    return projects.reduce((acc, p) => acc + p.files.length, 0);
  }, [projects]);

  const totalStorageBytes = useMemo(() => {
    return projects.reduce((acc, p) => {
      const pBytes = p.files.reduce((fAcc, f) => fAcc + (f.content?.length || 0), 0);
      return acc + pBytes;
    }, 0);
  }, [projects]);

  const formattedStorage = useMemo(() => {
    if (totalStorageBytes < 1024) return `${totalStorageBytes} B`;
    if (totalStorageBytes < 1024 * 1024) return `${(totalStorageBytes / 1024).toFixed(1)} KB`;
    return `${(totalStorageBytes / (1024 * 1024)).toFixed(2)} MB`;
  }, [totalStorageBytes]);

  const connectedAIProvidersCount = useMemo(() => {
    return Object.values(aiSettings.providers).filter(p => !!p.apiKey).length;
  }, [aiSettings]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 4);
  }, [projects]);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-forge-850 via-forge-900 to-forge-950 border border-forge-750 p-5 sm:p-7 shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-electric-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-electric-500/10 border border-electric-500/20 text-electric-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-ping" />
              Phone-First AI IDE v1.0.0
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              POCKETFORGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-neon-purple">AI</span>
            </h1>
            <p className="text-xs sm:text-sm text-forge-400 max-w-xl">
              Your phone. Your code. Your own development universe. Build, edit, test, and export complete applications using only an Android device.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onQuickCreate}
              className="flex items-center gap-2 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-forge-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-electric-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Project</span>
            </button>
            <button
              onClick={() => onNavigate('preview')}
              className="flex items-center gap-2 bg-forge-800 hover:bg-forge-750 text-white font-medium px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-forge-700 transition-colors"
            >
              <Play className="w-4 h-4 fill-current text-electric-400" />
              <span>Live Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Real Statistics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Projects */}
        <div 
          onClick={() => onNavigate('projects')}
          className="bg-forge-900 border border-forge-750 hover:border-forge-600 rounded-xl p-3.5 flex flex-col justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-forge-400 mb-2">
            <span className="text-xs font-medium">Projects</span>
            <FolderKanban className="w-4 h-4 text-electric-400 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">{projects.length}</div>
            <div className="text-[11px] text-forge-400 mt-0.5">{totalFiles} total files</div>
          </div>
        </div>

        {/* Local Termux Agent */}
        <div 
          onClick={() => onNavigate('terminal')}
          className="bg-forge-900 border border-forge-750 hover:border-forge-600 rounded-xl p-3.5 flex flex-col justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-forge-400 mb-2">
            <span className="text-xs font-medium">Termux Agent</span>
            <Terminal className={`w-4 h-4 ${agentOnline ? 'text-emerald-400' : 'text-forge-500'}`} />
          </div>
          <div>
            <div className={`text-sm sm:text-base font-bold ${agentOnline ? 'text-emerald-400' : 'text-forge-400'}`}>
              {agentOnline ? 'Connected' : 'Offline'}
            </div>
            <div className="text-[11px] text-forge-400 mt-0.5 truncate">
              {agentOnline ? (agentInfo?.platform || '127.0.0.1:8765') : 'Click to pair'}
            </div>
          </div>
        </div>

        {/* AI Providers */}
        <div 
          onClick={() => onNavigate('ai')}
          className="bg-forge-900 border border-forge-750 hover:border-forge-600 rounded-xl p-3.5 flex flex-col justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-forge-400 mb-2">
            <span className="text-xs font-medium">AI Engines</span>
            <Sparkles className="w-4 h-4 text-neon-purple group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">{connectedAIProvidersCount} / 3</div>
            <div className="text-[11px] text-forge-400 mt-0.5">Gemini, Groq, Router</div>
          </div>
        </div>

        {/* GitHub Status */}
        <div 
          onClick={() => onNavigate('github')}
          className="bg-forge-900 border border-forge-750 hover:border-forge-600 rounded-xl p-3.5 flex flex-col justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-forge-400 mb-2">
            <span className="text-xs font-medium">GitHub</span>
            <Github className="w-4 h-4 text-forge-300 group-hover:scale-110 transition-transform" />
          </div>
          <div>
            <div className={`text-sm sm:text-base font-bold ${githubUser ? 'text-electric-400' : 'text-forge-400'}`}>
              {githubUser ? githubUser.login : 'Unlinked'}
            </div>
            <div className="text-[11px] text-forge-400 mt-0.5 truncate">
              {githubUser ? `${githubUser.public_repos} repos` : 'Connect PAT'}
            </div>
          </div>
        </div>

        {/* Running Servers */}
        <div 
          onClick={() => onNavigate('terminal')}
          className="bg-forge-900 border border-forge-750 hover:border-forge-600 rounded-xl p-3.5 flex flex-col justify-between transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-forge-400 mb-2">
            <span className="text-xs font-medium">Dev Servers</span>
            <Server className={`w-4 h-4 ${runningProcesses.length > 0 ? 'text-emerald-400' : 'text-forge-500'}`} />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white">{runningProcesses.length}</div>
            <div className="text-[11px] text-forge-400 mt-0.5">Active ports</div>
          </div>
        </div>

        {/* Local Storage */}
        <div className="bg-forge-900 border border-forge-750 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-forge-400 mb-2">
            <span className="text-xs font-medium">App Storage</span>
            <HardDrive className="w-4 h-4 text-electric-400" />
          </div>
          <div>
            <div className="text-lg sm:text-xl font-bold text-white font-mono">{formattedStorage}</div>
            <div className="text-[11px] text-forge-400 mt-0.5">IndexedDB cache</div>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Recently Edited Projects & Ecosystem Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recently Edited Projects */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-electric-400" />
              <span>Recently Edited Projects</span>
            </h2>
            <button
              onClick={() => onNavigate('projects')}
              className="text-xs font-medium text-electric-400 hover:text-electric-300 flex items-center gap-1"
            >
              <span>View all ({projects.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recentProjects.map((p) => {
              const isCurrent = activeProject?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onOpenProject(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-forge-850 border-electric-500/40 shadow-md shadow-electric-500/5'
                      : 'bg-forge-900 border-forge-750 hover:border-forge-600'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <h3 className="font-bold text-sm text-white group-hover:text-electric-400 transition-colors truncate">
                        {p.name}
                      </h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forge-800 text-forge-300 border border-forge-700 uppercase">
                        {p.template}
                      </span>
                    </div>
                    <p className="text-xs text-forge-400 line-clamp-2 mb-3">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-forge-800/80 text-[11px] text-forge-400 font-mono">
                    <span>{p.files.length} files</span>
                    <span>{new Date(p.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="col-span-2 p-8 text-center bg-forge-900 border border-dashed border-forge-700 rounded-xl space-y-3">
                <p className="text-xs text-forge-400">No projects created yet.</p>
                <button
                  onClick={onQuickCreate}
                  className="px-4 py-2 bg-electric-500 text-forge-950 rounded-lg text-xs font-bold"
                >
                  Create Your First Project
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Ecosystem Actions & System Health */}
        <div className="space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-neon-purple" />
            <span>Developer Center</span>
          </h2>

          <div className="bg-forge-900 border border-forge-750 rounded-xl p-4 space-y-3">
            {/* Linux Mint Transfer Action Card */}
            <div 
              onClick={() => onNavigate('linux-mint')}
              className="p-3 rounded-lg bg-forge-850 hover:bg-forge-800 border border-forge-750 transition-colors cursor-pointer group flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-electric-400 transition-colors">
                  Linux Mint Transfer
                </h4>
                <p className="text-[11px] text-forge-400 mt-0.5">
                  Export clean ZIP bundle + apt setup
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-forge-500 group-hover:text-electric-400 transition-colors" />
            </div>

            {/* Deployment Center Action Card */}
            <div 
              onClick={() => onNavigate('deployment')}
              className="p-3 rounded-lg bg-forge-850 hover:bg-forge-800 border border-forge-750 transition-colors cursor-pointer group flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-electric-400 transition-colors">
                  Deployment Center
                </h4>
                <p className="text-[11px] text-forge-400 mt-0.5">
                  Vercel, Netlify, GitHub Pages readiness
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-forge-500 group-hover:text-electric-400 transition-colors" />
            </div>

            {/* AI Studio Multi-Agent Action Card */}
            <div 
              onClick={() => onNavigate('ai')}
              className="p-3 rounded-lg bg-forge-850 hover:bg-forge-800 border border-forge-750 transition-colors cursor-pointer group flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-electric-400 transition-colors">
                  4-Agent AI Pipeline
                </h4>
                <p className="text-[11px] text-forge-400 mt-0.5">
                  Architect, Coder, Debugger, Tester
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-forge-500 group-hover:text-electric-400 transition-colors" />
            </div>
          </div>

          {/* Termux Daemon Quick Telemetry Card */}
          <div className="bg-forge-900 border border-forge-750 rounded-xl p-4 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">Local Execution Layer</span>
              <span className={`font-mono text-[11px] ${agentOnline ? 'text-emerald-400' : 'text-forge-500'}`}>
                {agentOnline ? 'PAIRED' : 'STANDALONE PWA'}
              </span>
            </div>
            <p className="text-[11px] text-forge-400 leading-relaxed">
              {agentOnline
                ? `Running on ${agentInfo?.platform || 'Android'}. Dev servers listen on localhost and can be previewed live.`
                : `PocketForge is operating in offline browser sandbox mode. Start Termux local agent for terminal commands and Node/Python execution.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
