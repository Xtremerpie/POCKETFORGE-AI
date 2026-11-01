import { TermuxSystemInfo, TermuxProcess } from '../types';

export interface AgentConfig {
  url: string; // e.g. http://127.0.0.1:8765
  token: string;
}

const STORAGE_KEY_AGENT_CONFIG = 'pocketforge_agent_config';

export function getStoredAgentConfig(): AgentConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AGENT_CONFIG);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {
    url: 'http://127.0.0.1:8765',
    token: ''
  };
}

export function saveAgentConfig(config: AgentConfig) {
  localStorage.setItem(STORAGE_KEY_AGENT_CONFIG, JSON.stringify(config));
}

class AgentClient {
  private config: AgentConfig;

  constructor() {
    this.config = getStoredAgentConfig();
  }

  public updateConfig(newConfig: Partial<AgentConfig>) {
    this.config = { ...this.config, ...newConfig };
    saveAgentConfig(this.config);
  }

  public getConfig(): AgentConfig {
    return { ...this.config };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.url.replace(/\/+$/, '')}${endpoint}`;
    const headers = new Headers(options.headers || {});
    
    if (this.config.token) {
      headers.set('Authorization', `Bearer ${this.config.token}`);
    }
    if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.method === 'POST' ? 60000 : 8000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      clearTimeout(timeout);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      return data;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        throw new Error(`Agent request timed out to ${endpoint}`);
      }
      throw err;
    }
  }

  // Health and System Status
  public async getStatus(): Promise<{ success: boolean; status: string; memory: any; platform: string; isTermux: boolean; version: string; uptime: number; runningProcessesCount: number }> {
    return this.request('/api/status', { method: 'GET' });
  }

  // Pair with local agent
  public async pair(token: string): Promise<{ success: boolean; message: string; workspace: string }> {
    const res = await this.request<{ success: boolean; message: string; workspace: string }>('/api/pair', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
    if (res.success) {
      this.updateConfig({ token });
    }
    return res;
  }

  // Filesystem operations
  public async listFiles(subpath: string = ''): Promise<{ success: boolean; items: any[]; currentPath: string }> {
    return this.request(`/api/fs/list?path=${encodeURIComponent(subpath)}`, { method: 'GET' });
  }

  public async readFile(filePath: string): Promise<{ success: boolean; content: string; size: number }> {
    return this.request('/api/fs/read', {
      method: 'POST',
      body: JSON.stringify({ path: filePath })
    });
  }

  public async writeFile(filePath: string, content: string): Promise<{ success: boolean; size: number }> {
    return this.request('/api/fs/write', {
      method: 'POST',
      body: JSON.stringify({ path: filePath, content })
    });
  }

  public async deleteFile(filePath: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/fs/delete', {
      method: 'POST',
      body: JSON.stringify({ path: filePath })
    });
  }

  // Command Execution
  public async execCommand(command: string, cwd: string = '', timeout: number = 30000): Promise<{
    success: boolean;
    command: string;
    exitCode: number;
    stdout: string;
    stderr: string;
  }> {
    return this.request('/api/exec', {
      method: 'POST',
      body: JSON.stringify({ command, cwd, timeout })
    });
  }

  // Process & Dev Server Management
  public async startProcess(command: string, name?: string, port?: number, cwd?: string): Promise<{
    success: boolean;
    process: TermuxProcess;
  }> {
    return this.request('/api/process/start', {
      method: 'POST',
      body: JSON.stringify({ command, name, port, cwd })
    });
  }

  public async listProcesses(): Promise<{ success: boolean; processes: TermuxProcess[] }> {
    return this.request('/api/process/list', { method: 'GET' });
  }

  public async stopProcess(processId: string): Promise<{ success: boolean; message: string }> {
    return this.request('/api/process/stop', {
      method: 'POST',
      body: JSON.stringify({ processId })
    });
  }

  public async getProcessLogs(processId: string): Promise<{ success: boolean; logs: any[] }> {
    return this.request(`/api/process/logs?processId=${encodeURIComponent(processId)}`, { method: 'GET' });
  }

  // Git operations
  public async getGitStatus(cwd?: string): Promise<{
    success: boolean;
    isRepo: boolean;
    branch?: string;
    clean?: boolean;
    files?: { status: string; file: string }[];
    error?: string;
  }> {
    return this.request('/api/git/status', {
      method: 'POST',
      body: JSON.stringify({ cwd })
    });
  }

  public async gitCommit(message: string, cwd?: string): Promise<{
    success: boolean;
    stdout: string;
    stderr: string;
  }> {
    return this.request('/api/git/commit', {
      method: 'POST',
      body: JSON.stringify({ message, cwd })
    });
  }

  // System tools telemetry (Node, Python, Git availability)
  public async getSystemTools(): Promise<{
    success: boolean;
    tools: { name: string; available: boolean; version: string | null }[];
    isTermux: boolean;
    platform: string;
  }> {
    return this.request('/api/system/tools', { method: 'GET' });
  }
}

export const agentClient = new AgentClient();
