import React from 'react';
import { ViewTab, Project, TermuxSystemInfo } from '../../types';
import { 
  Terminal, 
  Wifi, 
  WifiOff, 
  Play, 
  Github, 
  FolderGit2, 
  Cpu, 
  Sparkles,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentTab: ViewTab;
  activeProject: Project | null;
  projects: Project[];
  onSelectProject: (p: Project) => void;
  agentOnline: boolean;
  agentInfo: TermuxSystemInfo | null;
  isOnline: boolean;
  onOpenPreview: () => void;
  onOpenSettings: () => void;
  onOpenTerminal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  activeProject,
  projects,
  onSelectProject,
  agentOnline,
  agentInfo,
  isOnline,
  onOpenPreview,
  onOpenSettings,
  onOpenTerminal,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-forge-900/90 backdrop-blur-md border-b border-forge-750 px-3 sm:px-5 py-2.5 flex items-center justify-between select-none">
      {/* Brand & Project Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-electric-500 to-neon-purple flex items-center justify-center shadow-lg shadow-electric-500/10">
            <span className="text-forge-950 font-black text-sm">PF</span>
          </div>
          <div className="hidden xs:block">
            <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1">
              POCKETFORGE <span className="text-[10px] text-electric-400 font-mono bg-electric-500/10 px-1 py-0.5 rounded border border-electric-500/20">AI</span>
            </span>
          </div>
        </div>

        {/* Project Selector Dropdown */}
        {activeProject && (
          <div className="relative group">
            <select
              aria-label="Active Project"
              value={activeProject.id}
              onChange={(e) => {
                const p = projects.find(proj => proj.id === e.target.value);
                if (p) onSelectProject(p);
              }}
              className="appearance-none bg-forge-800 text-xs sm:text-sm text-forge-100 font-medium pl-2.5 pr-7 py-1.5 rounded-lg border border-forge-700 hover:border-forge-600 focus:outline-none focus:border-electric-500/50 cursor-pointer max-w-[140px] sm:max-w-[190px] truncate"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-forge-900 text-white">
                  {proj.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-forge-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Status Indicators & Action Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Local Agent Status Pill */}
        <button
          onClick={onOpenTerminal}
          title={agentOnline ? `Termux Agent Online (${agentInfo?.platform || 'local'})` : 'Termux Agent Offline (Click to setup)'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-mono border transition-all ${
            agentOnline 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-forge-800 text-forge-400 border-forge-700 hover:text-forge-200'
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${agentOnline ? 'bg-emerald-400 animate-pulse' : 'bg-forge-500'}`} />
          <Terminal className="w-3 h-3" />
          <span className="hidden sm:inline">{agentOnline ? 'Termux Active' : 'Agent Offline'}</span>
        </button>

        {/* Network Online / Offline Pill */}
        <div 
          title={isOnline ? 'Internet Connected' : 'Offline Mode (PWA)'}
          className={`hidden xs:flex items-center gap-1 px-2 py-1 rounded-full text-[11px] border font-mono ${
            isOnline 
              ? 'bg-forge-800/80 text-forge-300 border-forge-750' 
              : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          }`}
        >
          {isOnline ? <Wifi className="w-3 h-3 text-forge-400" /> : <WifiOff className="w-3 h-3 text-amber-400" />}
          <span className="hidden md:inline">{isOnline ? 'Online' : 'Offline'}</span>
        </div>

        {/* Quick Live Preview Action */}
        <button
          onClick={onOpenPreview}
          className="flex items-center gap-1.5 bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-forge-950 px-2.5 sm:px-3 py-1.5 rounded-lg font-semibold text-xs transition-all shadow-md shadow-electric-500/20 active:scale-95"
          title="Open Live Preview"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Preview</span>
        </button>
      </div>
    </header>
  );
};
