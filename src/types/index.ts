export type TemplateId = 
  | 'html-js'
  | 'react'
  | 'nextjs'
  | 'node-api'
  | 'python-app'
  | 'flask-api'
  | 'portfolio'
  | 'discord-bot';

export interface ProjectFile {
  id: string;
  path: string; // e.g. 'src/App.tsx' or 'index.html'
  name: string;
  content: string;
  language: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  template: TemplateId;
  createdAt: string;
  updatedAt: string;
  files: ProjectFile[];
  activeFileId?: string;
  gitRepo?: string;
  lastRunCommand?: string;
}

export type AIProviderId = 'gemini' | 'groq' | 'openrouter';

export interface AIProviderConfig {
  id: AIProviderId;
  name: string;
  apiKey: string;
  selectedModel: string;
  availableModels: string[];
  enabled: boolean;
  latencyMs?: number;
  lastChecked?: string;
  status: 'online' | 'offline' | 'unconfigured' | 'error';
  errorMessage?: string;
}

export interface AISettings {
  primaryProvider: AIProviderId;
  fallbackProvider?: AIProviderId;
  enableFallback: boolean;
  providers: Record<AIProviderId, AIProviderConfig>;
  temperature: number;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  agentRole?: MultiAgentRole;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: boolean;
}

export type MultiAgentRole = 'architect' | 'coder' | 'debugger' | 'tester';

export interface AgentPlanStep {
  id: string;
  title: string;
  description: string;
  targetFile?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface MultiAgentWorkflowState {
  currentRole: MultiAgentRole;
  step: 'idle' | 'architect_planning' | 'waiting_user_approval' | 'coding' | 'debugging' | 'testing' | 'done';
  userGoal: string;
  plan: AgentPlanStep[];
  filesCreatedOrModified: Record<string, string>;
  debugNotes?: string;
  testResults?: {
    passed: boolean;
    output: string;
    exitCode: number;
  };
}

export interface TermuxSystemInfo {
  version: string;
  nodeVersion: string;
  platform: string;
  isTermux: boolean;
  uptime: number;
  memory: {
    totalMB: number;
    freeMB: number;
    usedMB: number;
  };
  workspace: string;
  runningProcessesCount: number;
}

export interface TermuxProcess {
  id: string;
  name: string;
  command: string;
  port?: number | null;
  pid: number;
  cwd: string;
  startedAt: string;
  status: 'running' | 'stopped' | 'error';
  exitCode?: number | null;
  logs: {
    type: 'stdout' | 'stderr' | 'system' | 'error';
    text: string;
    time: string;
  }[];
}

export interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  public_repos: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
}

export interface PendingCommandApproval {
  id: string;
  command: string;
  cwd: string;
  reason: string;
  source: 'ai_coder' | 'ai_tester' | 'git' | 'user';
}

export type ViewTab = 
  | 'dashboard'
  | 'projects'
  | 'editor'
  | 'terminal'
  | 'preview'
  | 'ai'
  | 'github'
  | 'deployment'
  | 'linux-mint'
  | 'settings';
