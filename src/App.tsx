import React, { useState, useEffect, useCallback } from 'react';
import { 
  Project, 
  ViewTab, 
  TermuxSystemInfo, 
  TermuxProcess, 
  AISettings, 
  GitHubUser, 
  PendingCommandApproval,
  ProjectFile
} from './types';
import { getAllProjects, saveProject, deleteProject } from './services/db';
import { agentClient } from './services/agentClient';
import { getStoredAISettings, saveStoredAISettings } from './services/aiProviders';
import { getStoredGitHubToken, fetchGitHubUser } from './services/githubClient';
import { Header } from './components/layout/Header';
import { NavigationBar } from './components/layout/NavigationBar';
import { CommandApprovalModal } from './components/layout/CommandApprovalModal';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProjectManagerView } from './components/projects/ProjectManagerView';
import { EditorView } from './components/editor/EditorView';
import { TerminalView } from './components/terminal/TerminalView';
import { PreviewView } from './components/preview/PreviewView';
import { AIStudioView } from './components/ai/AIStudioView';
import { GitHubView } from './components/github/GitHubView';
import { DeploymentView } from './components/deployment/DeploymentView';
import { LinuxMintTransferView } from './components/linux-mint/LinuxMintTransferView';
import { SettingsView } from './components/settings/SettingsView';

export function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Termux Local Agent state
  const [agentOnline, setAgentOnline] = useState<boolean>(false);
  const [agentInfo, setAgentInfo] = useState<TermuxSystemInfo | null>(null);
  const [runningProcesses, setRunningProcesses] = useState<TermuxProcess[]>([]);

  // AI & GitHub settings
  const [aiSettings, setAiSettings] = useState<AISettings>(() => getStoredAISettings());
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);

  // Security command approval modal state
  const [pendingCommand, setPendingCommand] = useState<PendingCommandApproval | null>(null);

  // Target preview port when opening from terminal
  const [previewPort, setPreviewPort] = useState<number>(5173);

  // Load Projects from IndexedDB
  const refreshProjects = useCallback(async () => {
    try {
      const projs = await getAllProjects();
      setProjects(projs);
      if (projs.length > 0 && !activeProject) {
        setActiveProject(projs[0]);
      }
    } catch (e) {
      console.error('Failed to load projects from DB:', e);
    }
  }, [activeProject]);

  useEffect(() => {
    refreshProjects();
  }, []);

  // Network online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Poll Local Termux Agent Health
  const checkAgentHealth = useCallback(async () => {
    try {
      const res = await agentClient.getStatus();
      if (res && res.status === 'online') {
        setAgentOnline(true);
        setAgentInfo(res as any);

        // Fetch running processes
        const procRes = await agentClient.listProcesses();
        if (procRes && procRes.processes) {
          setRunningProcesses(procRes.processes.filter(p => p.status === 'running'));
        }
      } else {
        setAgentOnline(false);
      }
    } catch {
      setAgentOnline(false);
    }
  }, []);

  useEffect(() => {
    checkAgentHealth();
    const interval = setInterval(checkAgentHealth, 5000);
    return () => clearInterval(interval);
  }, [checkAgentHealth]);

  // Load GitHub User if token is present
  useEffect(() => {
    const token = getStoredGitHubToken();
    if (token) {
      fetchGitHubUser(token)
        .then(setGithubUser)
        .catch(() => setGithubUser(null));
    }
  }, []);

  // Project CRUD Handlers
  const handleSaveProject = async (p: Project) => {
    await saveProject(p);
    setProjects(prev => prev.map(proj => proj.id === p.id ? p : proj));
    if (activeProject?.id === p.id) {
      setActiveProject(p);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    if (activeProject?.id === id) {
      setActiveProject(remaining[0] || null);
    }
  };

  const handleUpdateAISettings = (newSettings: AISettings) => {
    setAiSettings(newSettings);
    saveStoredAISettings(newSettings);
  };

  const handleResetAllData = () => {
    if (confirm('Are you sure you want to delete all projects and reset PocketForge?')) {
      indexedDB.deleteDatabase('pocketforge_db');
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleOpenPreview = (port?: number) => {
    if (port) setPreviewPort(port);
    setCurrentTab('preview');
  };

  const handleAskAIAboutFile = (file: ProjectFile) => {
    setCurrentTab('ai');
  };

  return (
    <div className="min-h-screen bg-forge-950 text-forge-100 flex flex-col font-sans">
      {/* Top Global Header */}
      <Header
        currentTab={currentTab}
        activeProject={activeProject}
        projects={projects}
        onSelectProject={setActiveProject}
        agentOnline={agentOnline}
        agentInfo={agentInfo}
        isOnline={isOnline}
        onOpenPreview={() => handleOpenPreview()}
        onOpenSettings={() => setCurrentTab('settings')}
        onOpenTerminal={() => setCurrentTab('terminal')}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation (Sidebar on Desktop, Bottom Bar on Mobile) */}
        <NavigationBar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          agentOnline={agentOnline}
        />

        {/* Dynamic Main View Router */}
        <main className="flex-1 overflow-y-auto bg-forge-950">
          {currentTab === 'dashboard' && (
            <DashboardView
              projects={projects}
              activeProject={activeProject}
              agentOnline={agentOnline}
              agentInfo={agentInfo}
              runningProcesses={runningProcesses}
              aiSettings={aiSettings}
              githubUser={githubUser}
              onNavigate={setCurrentTab}
              onOpenProject={(p) => {
                setActiveProject(p);
                setCurrentTab('editor');
              }}
              onQuickCreate={() => setCurrentTab('projects')}
            />
          )}

          {currentTab === 'projects' && (
            <ProjectManagerView
              projects={projects}
              activeProject={activeProject}
              onSelectProject={setActiveProject}
              onSaveProject={handleSaveProject}
              onDeleteProject={handleDeleteProject}
              onOpenInEditor={(p) => {
                setActiveProject(p);
                setCurrentTab('editor');
              }}
            />
          )}

          {currentTab === 'editor' && (
            <EditorView
              project={activeProject}
              onSaveProject={handleSaveProject}
              onOpenPreview={() => handleOpenPreview()}
              onAskAIAboutFile={handleAskAIAboutFile}
            />
          )}

          {currentTab === 'terminal' && (
            <TerminalView
              activeProject={activeProject}
              agentOnline={agentOnline}
              agentInfo={agentInfo}
              runningProcesses={runningProcesses}
              onRefreshProcesses={checkAgentHealth}
              onRequestCommandApproval={(command, cwd, reason, source) => {
                setPendingCommand({ id: 'cmd_' + Date.now(), command, cwd, reason, source });
              }}
              onOpenPreview={(port) => handleOpenPreview(port)}
            />
          )}

          {currentTab === 'preview' && (
            <PreviewView
              project={activeProject}
              agentOnline={agentOnline}
              runningProcesses={runningProcesses}
              defaultPort={previewPort}
            />
          )}

          {currentTab === 'ai' && (
            <AIStudioView
              activeProject={activeProject}
              aiSettings={aiSettings}
              onUpdateAISettings={handleUpdateAISettings}
              onSaveProject={handleSaveProject}
              agentOnline={agentOnline}
            />
          )}

          {currentTab === 'github' && (
            <GitHubView
              activeProject={activeProject}
              onSaveProject={handleSaveProject}
              agentOnline={agentOnline}
              onRefreshProjectList={refreshProjects}
            />
          )}

          {currentTab === 'deployment' && (
            <DeploymentView activeProject={activeProject} />
          )}

          {currentTab === 'linux-mint' && (
            <LinuxMintTransferView activeProject={activeProject} />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              aiSettings={aiSettings}
              onUpdateAISettings={handleUpdateAISettings}
              agentOnline={agentOnline}
              agentInfo={agentInfo}
              isOnline={isOnline}
              onResetAllData={handleResetAllData}
            />
          )}
        </main>
      </div>

      {/* Explicit Security Command Approval Modal */}
      <CommandApprovalModal
        pendingCommand={pendingCommand}
        onApprove={(cmd) => {
          agentClient.execCommand(cmd.command, cmd.cwd).catch(console.error);
          setPendingCommand(null);
        }}
        onReject={() => setPendingCommand(null)}
      />
    </div>
  );
}

export default App;
