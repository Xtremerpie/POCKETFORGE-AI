import React, { useState, useEffect } from 'react';
import { Project, GitHubUser, GitHubRepository } from '../../types';
import { 
  getStoredGitHubToken, 
  saveStoredGitHubToken, 
  fetchGitHubUser, 
  fetchUserRepos, 
  createGitHubRepo, 
  pushProjectToGitHub 
} from '../../services/githubClient';
import { agentClient } from '../../services/agentClient';
import { 
  Github, 
  GitBranch, 
  GitCommit, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Check, 
  AlertCircle, 
  UploadCloud, 
  DownloadCloud, 
  FileText
} from 'lucide-react';

interface GitHubViewProps {
  activeProject: Project | null;
  onSaveProject: (p: Project) => void;
  agentOnline: boolean;
  onRefreshProjectList: () => void;
}

export const GitHubView: React.FC<GitHubViewProps> = ({
  activeProject,
  onSaveProject,
  agentOnline,
  onRefreshProjectList,
}) => {
  const [tokenInput, setTokenInput] = useState(() => getStoredGitHubToken());
  const [githubUser, setGithubUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // New repo state
  const [isCreatingRepo, setIsCreatingRepo] = useState(false);
  const [newRepoName, setNewRepoName] = useState(activeProject?.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-') || '');
  const [isPrivateRepo, setIsPrivateRepo] = useState(true);

  // Commit & Push state
  const [commitMessage, setCommitMessage] = useState('Update from PocketForge AI');
  const [selectedRepoFullName, setSelectedRepoFullName] = useState<string>('');
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ commitSha: string; htmlUrl: string } | null>(null);

  // Local Git status from Termux agent
  const [localGitStatus, setLocalGitStatus] = useState<any>(null);

  useEffect(() => {
    const savedToken = getStoredGitHubToken();
    if (savedToken) {
      loadUserData(savedToken);
    }
  }, []);

  useEffect(() => {
    if (agentOnline && activeProject) {
      agentClient.getGitStatus(activeProject.name).then(setLocalGitStatus).catch(() => {});
    }
  }, [agentOnline, activeProject?.id]);

  const loadUserData = async (token: string) => {
    setIsLoading(true);
    setStatusMessage('');
    try {
      const user = await fetchGitHubUser(token);
      setGithubUser(user);
      const userRepos = await fetchUserRepos(token);
      setRepos(userRepos);
      if (userRepos.length > 0) {
        setSelectedRepoFullName(userRepos[0].full_name);
      }
    } catch (err: any) {
      setStatusMessage(`GitHub Authentication Failed: ${err.message}`);
      setGithubUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    saveStoredGitHubToken(tokenInput.trim());
    loadUserData(tokenInput.trim());
  };

  const handleDisconnect = () => {
    saveStoredGitHubToken('');
    setTokenInput('');
    setGithubUser(null);
    setRepos([]);
  };

  const handleCreateNewRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput || !newRepoName.trim()) return;

    setIsLoading(true);
    try {
      const newRepo = await createGitHubRepo(tokenInput, newRepoName.trim(), isPrivateRepo);
      setRepos(prev => [newRepo, ...prev]);
      setSelectedRepoFullName(newRepo.full_name);
      setIsCreatingRepo(false);
      setStatusMessage(`✅ Repository ${newRepo.full_name} created successfully!`);
    } catch (err: any) {
      setStatusMessage(`Failed to create repository: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushProject = async () => {
    if (!tokenInput || !selectedRepoFullName || !activeProject) return;

    const [owner, repoName] = selectedRepoFullName.split('/');
    setIsPushing(true);
    setPushResult(null);
    setStatusMessage('Pushing files to GitHub...');

    try {
      const targetRepo = repos.find(r => r.full_name === selectedRepoFullName);
      const branch = targetRepo?.default_branch || 'main';

      const result = await pushProjectToGitHub(
        tokenInput,
        owner,
        repoName,
        branch,
        activeProject,
        commitMessage
      );

      setPushResult(result);
      setStatusMessage('✅ Pushed changes to GitHub repository successfully!');
    } catch (err: any) {
      setStatusMessage(`Push failed: ${err.message}`);
    } finally {
      setIsPushing(false);
    }
  };

  const handleGenerateGitignore = () => {
    if (!activeProject) return;
    const gitignoreContent = `# Logs\nlogs\n*.log\nnpm-debug.log*\nyarn-debug.log*\n\n# Dependencies\nnode_modules/\n.venv/\n__pycache__/\n\n# Environment & Secrets\n.env\n.env.local\n*.pem\n*.key\n\n# Output build\ndist/\nbuild/\n.cache/\n`;

    const existing = activeProject.files.find(f => f.path === '.gitignore');
    let updatedFiles;
    if (existing) {
      updatedFiles = activeProject.files.map(f => f.path === '.gitignore' ? { ...f, content: gitignoreContent } : f);
    } else {
      updatedFiles = [
        ...activeProject.files,
        {
          id: 'f_gi_' + Date.now(),
          path: '.gitignore',
          name: '.gitignore',
          content: gitignoreContent,
          language: 'text',
          updatedAt: new Date().toISOString()
        }
      ];
    }

    onSaveProject({
      ...activeProject,
      files: updatedFiles
    });
    alert('✅ .gitignore generated and added to project!');
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Github className="w-6 h-6 text-white" />
            <span>GitHub Workflows</span>
          </h1>
          <p className="text-xs text-forge-400 mt-0.5">
            Synchronize, commit, push, and create repositories directly from your phone.
          </p>
        </div>

        {githubUser && (
          <div className="flex items-center gap-3">
            <img
              src={githubUser.avatar_url}
              alt={githubUser.login}
              className="w-8 h-8 rounded-full border border-forge-700"
            />
            <div className="text-xs">
              <span className="font-bold text-white block">{githubUser.name || githubUser.login}</span>
              <span className="text-forge-400 text-[10px]">@{githubUser.login}</span>
            </div>
            <button
              onClick={handleDisconnect}
              className="px-2.5 py-1 text-xs text-rose-400 hover:underline"
            >
              Sign out
            </button>
          </div>
        )}
      </div>

      {/* GitHub Authentication Card */}
      {!githubUser ? (
        <div className="bg-forge-900 border border-forge-750 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-forge-800 text-white">
              <Github className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Connect GitHub Account</h3>
              <p className="text-xs text-forge-400">
                Generate a Personal Access Token with <code>repo</code> permissions on GitHub to authenticate.
              </p>
            </div>
          </div>

          <form onSubmit={handleConnect} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-forge-300 block mb-1">
                Personal Access Token (Classic or Fine-Grained)
              </label>
              <input
                type="password"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="github_pat_... or ghp_..."
                className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-electric-500"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href="https://github.com/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-electric-400 hover:underline flex items-center gap-1"
              >
                <span>Generate token on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="submit"
                disabled={isLoading || !tokenInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-electric-500 hover:bg-electric-400 text-forge-950 font-bold text-xs transition-colors shadow-md shadow-electric-500/20 disabled:opacity-50"
              >
                {isLoading ? 'Connecting...' : 'Connect GitHub'}
              </button>
            </div>
          </form>

          {statusMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {statusMessage}
            </div>
          )}
        </div>
      ) : (
        /* Connected Workflow Hub */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Push / Commit Project */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-forge-900 border border-forge-750 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-forge-800">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-electric-400" />
                  <span>Push Project to GitHub</span>
                </h3>
                <button
                  onClick={handleGenerateGitignore}
                  className="text-xs font-semibold text-forge-300 hover:text-white flex items-center gap-1"
                  title="Inject .gitignore template"
                >
                  <FileText className="w-3.5 h-3.5 text-electric-400" />
                  <span>Generate .gitignore</span>
                </button>
              </div>

              {activeProject ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-forge-400 block mb-1">Target Repository</label>
                      <select
                        value={selectedRepoFullName}
                        onChange={(e) => setSelectedRepoFullName(e.target.value)}
                        className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-electric-500"
                      >
                        {repos.map(r => (
                          <option key={r.id} value={r.full_name}>
                            {r.full_name} {r.private ? '(Private)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-forge-400 block mb-1">Commit Message</label>
                      <input
                        type="text"
                        value={commitMessage}
                        onChange={(e) => setCommitMessage(e.target.value)}
                        className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-electric-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-mono text-forge-400">
                      {activeProject.files.length} files in {activeProject.name}
                    </span>

                    <button
                      onClick={handlePushProject}
                      disabled={isPushing || !selectedRepoFullName}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-forge-950 font-bold text-xs transition-all shadow-md shadow-electric-500/20 active:scale-95 disabled:opacity-50"
                    >
                      <UploadCloud className="w-4 h-4 stroke-[2.5]" />
                      <span>{isPushing ? 'Pushing Commits...' : 'Commit & Push Changes'}</span>
                    </button>
                  </div>

                  {pushResult && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center justify-between">
                      <span>Commit SHA: {pushResult.commitSha.substring(0, 8)}</span>
                      <a
                        href={pushResult.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline flex items-center gap-1"
                      >
                        View on GitHub <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-forge-400">
                  Select an active project from the Projects tab to push to GitHub.
                </div>
              )}
            </div>

            {/* Termux Local Git CLI Status */}
            {agentOnline && (
              <div className="bg-forge-900 border border-forge-750 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-white">
                  <span className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-emerald-400" />
                    <span>Termux Local Git Agent</span>
                  </span>
                  <span className="font-mono text-emerald-400 text-[11px]">ACTIVE</span>
                </div>
                <p className="text-forge-400 text-[11px]">
                  Local git binary is available inside Termux. Full branch switching, merge resolution, and command-line commits are supported via the Terminal tab.
                </p>
              </div>
            )}
          </div>

          {/* Right 1 Col: Repositories List & Create Repo */}
          <div className="space-y-4">
            <div className="bg-forge-900 border border-forge-750 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Your Repositories</h3>
                <button
                  onClick={() => setIsCreatingRepo(prev => !prev)}
                  className="p-1 rounded-lg bg-forge-800 hover:bg-forge-750 text-white"
                  title="Create New Repo"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Create Repo Form */}
              {isCreatingRepo && (
                <form onSubmit={handleCreateNewRepo} className="bg-forge-950 p-3 rounded-xl border border-forge-800 space-y-2 text-xs">
                  <input
                    type="text"
                    required
                    placeholder="repository-name"
                    value={newRepoName}
                    onChange={(e) => setNewRepoName(e.target.value)}
                    className="w-full bg-forge-900 border border-forge-700 rounded-lg px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-electric-500"
                  />
                  <label className="flex items-center gap-2 text-forge-300">
                    <input
                      type="checkbox"
                      checked={isPrivateRepo}
                      onChange={(e) => setIsPrivateRepo(e.target.checked)}
                      className="rounded accent-electric-500"
                    />
                    <span>Private Repository</span>
                  </label>
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-electric-500 text-forge-950 font-bold rounded-lg"
                  >
                    Create on GitHub
                  </button>
                </form>
              )}

              {/* Repo Items */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {repos.map(r => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-forge-950 border border-forge-800 flex items-center justify-between text-xs hover:border-forge-700 transition-colors"
                  >
                    <div className="truncate mr-2">
                      <div className="font-bold text-white truncate flex items-center gap-1.5">
                        {r.private ? <Lock className="w-3 h-3 text-amber-400 flex-shrink-0" /> : <Unlock className="w-3 h-3 text-forge-400 flex-shrink-0" />}
                        <span className="truncate">{r.name}</span>
                      </div>
                      <span className="text-[10px] text-forge-400 font-mono">{r.default_branch}</span>
                    </div>

                    <a
                      href={r.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-forge-400 hover:text-white p-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
