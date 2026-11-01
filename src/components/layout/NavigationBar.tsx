import React from 'react';
import { ViewTab } from '../../types';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Code2, 
  Sparkles, 
  Terminal, 
  Github, 
  Settings,
  Rocket,
  HardDriveDownload,
  Eye
} from 'lucide-react';

interface NavigationBarProps {
  currentTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  agentOnline: boolean;
  hasUnsavedChanges?: boolean;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  currentTab,
  onTabChange,
  agentOnline,
  hasUnsavedChanges,
}) => {
  const mainNavItems = [
    { id: 'dashboard' as ViewTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects' as ViewTab, label: 'Projects', icon: FolderKanban },
    { id: 'editor' as ViewTab, label: 'Editor', icon: Code2, badge: hasUnsavedChanges ? '●' : undefined },
    { id: 'ai' as ViewTab, label: 'AI Studio', icon: Sparkles },
    { id: 'terminal' as ViewTab, label: 'Terminal', icon: Terminal, dot: agentOnline ? 'bg-emerald-400' : 'bg-forge-500' },
    { id: 'github' as ViewTab, label: 'GitHub', icon: Github },
    { id: 'settings' as ViewTab, label: 'Settings', icon: Settings },
  ];

  const secondaryNavItems = [
    { id: 'preview' as ViewTab, label: 'Live Preview', icon: Eye },
    { id: 'deployment' as ViewTab, label: 'Deployments', icon: Rocket },
    { id: 'linux-mint' as ViewTab, label: 'Linux Mint', icon: HardDriveDownload },
  ];

  return (
    <>
      {/* 📱 Mobile Bottom Navigation Bar (Fixed to bottom with safe-area padding) */}
      <nav 
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-forge-900/95 backdrop-blur-lg border-t border-forge-750 px-1 py-1 pb-safe select-none"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {mainNavItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-electric-400 font-semibold scale-105'
                    : 'text-forge-400 hover:text-forge-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
                  {item.dot && (
                    <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${item.dot} border border-forge-900`} />
                  )}
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 text-[10px] text-amber-400 font-bold leading-none">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-4 h-0.5 bg-electric-400 rounded-full mt-0.5 absolute -bottom-0.5" />
                )}
              </button>
            );
          })}

          {/* More / Settings Menu on Mobile */}
          <button
            onClick={() => onTabChange('settings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all relative ${
              currentTab === 'settings' || currentTab === 'deployment' || currentTab === 'linux-mint'
                ? 'text-electric-400 font-semibold scale-105'
                : 'text-forge-400 hover:text-forge-200'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">More</span>
          </button>
        </div>
      </nav>

      {/* 💻 Desktop Sidebar Navigation (Visible on md+ screens) */}
      <aside 
        aria-label="Desktop Sidebar"
        className="hidden md:flex flex-col w-56 lg:w-64 bg-forge-900 border-r border-forge-750 p-4 select-none flex-shrink-0"
      >
        <div className="space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-forge-400 px-3 mb-2 font-semibold">
            Development
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-electric-500/10 text-electric-400 border border-electric-500/20 shadow-sm'
                    : 'text-forge-300 hover:text-white hover:bg-forge-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-electric-400' : 'text-forge-400'}`} />
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {item.dot && (
                    <span className={`w-2 h-2 rounded-full ${item.dot}`} />
                  )}
                  {item.badge && (
                    <span className="text-xs text-amber-400 font-bold">{item.badge}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-forge-800 space-y-1">
          <p className="text-[11px] font-mono uppercase tracking-wider text-forge-400 px-3 mb-2 font-semibold">
            Ecosystem
          </p>
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-electric-500/10 text-electric-400 border border-electric-500/20'
                    : 'text-forge-300 hover:text-white hover:bg-forge-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-electric-400' : 'text-forge-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* System Daemon Info Footer */}
        <div className="mt-auto pt-4 border-t border-forge-800/80">
          <div className="bg-forge-850 p-3 rounded-xl border border-forge-800">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-forge-400">Termux Daemon</span>
              <span className={`font-mono text-[11px] ${agentOnline ? 'text-emerald-400' : 'text-forge-500'}`}>
                {agentOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <p className="text-[11px] text-forge-400 leading-tight">
              {agentOnline ? 'Localhost agent paired via :8765' : 'Start daemon in Termux to run code'}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
