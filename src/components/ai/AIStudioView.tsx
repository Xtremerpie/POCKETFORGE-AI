import React, { useState } from 'react';
import { 
  Project, 
  AISettings, 
  AIProviderId, 
  AIChatMessage, 
  MultiAgentRole, 
  AgentPlanStep 
} from '../../types';
import { 
  runArchitectAgent, 
  runCoderAgent, 
  runDebuggerAgent, 
  runTesterAgent, 
  ArchitectPlanResponse 
} from '../../services/multiAgent';
import { generateAIResponse, testProviderConnection } from '../../services/aiProviders';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Settings, 
  CheckCircle2, 
  Clock, 
  Cpu, 
  Play, 
  FileCode, 
  AlertTriangle, 
  RotateCcw, 
  Wrench, 
  Code2, 
  Check, 
  X,
  FileCheck,
  Zap
} from 'lucide-react';

interface AIStudioViewProps {
  activeProject: Project | null;
  aiSettings: AISettings;
  onUpdateAISettings: (settings: AISettings) => void;
  onSaveProject: (project: Project) => void;
  agentOnline: boolean;
}

export const AIStudioView: React.FC<AIStudioViewProps> = ({
  activeProject,
  aiSettings,
  onUpdateAISettings,
  onSaveProject,
  agentOnline,
}) => {
  const [activeTab, setActiveTab] = useState<'multi_agent' | 'chat' | 'providers'>('multi_agent');

  // Multi-Agent Pipeline State
  const [goalInput, setGoalInput] = useState('');
  const [isArchitectWorking, setIsArchitectWorking] = useState(false);
  const [architectPlan, setArchitectPlan] = useState<ArchitectPlanResponse | null>(null);
  const [isCodingWorking, setIsCodingWorking] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [codeReviewFiles, setCodeReviewFiles] = useState<{ path: string; content: string; explanation: string }[]>([]);

  // Debugger & Tester State
  const [errorInput, setErrorInput] = useState('');
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugResult, setDebugResult] = useState<{ rootCause: string; fix: string; files: any[] } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ passed: boolean; output: string; exitCode: number } | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your PocketForge AI development copilot. I can write code, analyze project architecture, debug errors, and generate mobile-friendly components. How can I help you today?',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [attachFileContext, setAttachFileContext] = useState(true);

  // Provider Connection Testing State
  const [testingProvider, setTestingProvider] = useState<AIProviderId | null>(null);
  const [testStatusMessage, setTestStatusMessage] = useState<string>('');

  // 1. Run Architect Agent
  const handleStartArchitect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalInput.trim() || !activeProject) return;

    setIsArchitectWorking(true);
    setArchitectPlan(null);
    setCodeReviewFiles([]);
    setCompletedTasks([]);

    try {
      const plan = await runArchitectAgent(goalInput.trim(), activeProject);
      setArchitectPlan(plan);
    } catch (err: any) {
      alert(`Architect failed: ${err.message}`);
    } finally {
      setIsArchitectWorking(false);
    }
  };

  // 2. Approve Architect Plan & Run Coder
  const handleApprovePlan = async () => {
    if (!architectPlan || !activeProject) return;
    setIsCodingWorking(true);

    const generatedUpdates: { path: string; content: string; explanation: string }[] = [];

    try {
      for (const task of architectPlan.tasks) {
        const coderResult = await runCoderAgent(task, activeProject, architectPlan.summary);
        for (const update of coderResult.fileUpdates) {
          generatedUpdates.push(update);
        }
        setCompletedTasks(prev => [...prev, task.id]);
      }
      setCodeReviewFiles(generatedUpdates);
    } catch (err: any) {
      alert(`Coder Agent error: ${err.message}`);
    } finally {
      setIsCodingWorking(false);
    }
  };

  // 3. Save Code Changes to Active Project
  const handleApplyChangesToProject = () => {
    if (!activeProject || codeReviewFiles.length === 0) return;

    const filesMap = new Map(activeProject.files.map(f => [f.path, f]));

    for (const update of codeReviewFiles) {
      const existing = filesMap.get(update.path);
      if (existing) {
        filesMap.set(update.path, {
          ...existing,
          content: update.content,
          updatedAt: new Date().toISOString()
        });
      } else {
        const ext = update.path.split('.').pop() || 'txt';
        filesMap.set(update.path, {
          id: 'f_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          path: update.path,
          name: update.path.split('/').pop() || update.path,
          content: update.content,
          language: ext === 'ts' || ext === 'tsx' ? 'typescript' : ext === 'js' || ext === 'jsx' ? 'javascript' : ext,
          updatedAt: new Date().toISOString()
        });
      }
    }

    onSaveProject({
      ...activeProject,
      files: Array.from(filesMap.values())
    });

    alert('✅ Code changes applied to project!');
    setCodeReviewFiles([]);
    setArchitectPlan(null);
    setGoalInput('');
  };

  // 4. Run Debugger Agent
  const handleRunDebugger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorInput.trim() || !activeProject) return;

    setIsDebugging(true);
    setDebugResult(null);

    try {
      const result = await runDebuggerAgent(errorInput.trim(), activeProject);
      setDebugResult({
        rootCause: result.rootCause,
        fix: result.proposedFix,
        files: result.fileUpdates
      });
    } catch (err: any) {
      alert(`Debugger error: ${err.message}`);
    } finally {
      setIsDebugging(false);
    }
  };

  // 5. Run Tester Agent
  const handleRunTester = async () => {
    if (!activeProject) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await runTesterAgent(activeProject, agentOnline);
      setTestResult({
        passed: result.passed,
        output: result.output,
        exitCode: result.exitCode
      });
    } catch (err: any) {
      alert(`Tester error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  // 6. Normal Chat Interaction
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text) return;

    const userMsg: AIChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);

    try {
      // Build context
      let contextPrompt = '';
      if (attachFileContext && activeProject) {
        contextPrompt = `\nActive Project: ${activeProject.name} (${activeProject.template})\nFiles in project: ${activeProject.files.map(f => f.path).join(', ')}`;
      }

      const res = await generateAIResponse([
        ...chatMessages.map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: text + contextPrompt }
      ], 'You are PocketForge AI, an expert mobile and full-stack software development assistant.', aiSettings);

      setChatMessages(prev => [
        ...prev,
        {
          id: 'asst_' + Date.now(),
          role: 'assistant',
          content: res.text,
          timestamp: new Date().toLocaleTimeString(),
          tokenUsage: res.tokenUsage
        }
      ]);
    } catch (err: any) {
      setChatMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          content: `Error generating response: ${err.message}`,
          timestamp: new Date().toLocaleTimeString(),
          error: true
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Test Provider Latency
  const handleTestConnection = async (id: AIProviderId) => {
    setTestingProvider(id);
    setTestStatusMessage('Testing connection latency...');
    try {
      const result = await testProviderConnection(id, aiSettings);
      setTestStatusMessage(result.message);
    } catch (err: any) {
      setTestStatusMessage(`Error: ${err.message}`);
    } finally {
      setTestingProvider(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-neon-purple" />
            <span>AI Studio & Multi-Agent Development</span>
          </h1>
          <p className="text-xs text-forge-400 mt-0.5">
            Architect, Coder, Debugger, and Tester autonomous multi-agent pipeline.
          </p>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1.5 bg-forge-900 p-1 rounded-xl border border-forge-750 text-xs font-semibold select-none">
          <button
            onClick={() => setActiveTab('multi_agent')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'multi_agent'
                ? 'bg-neon-purple text-white shadow-sm'
                : 'text-forge-400 hover:text-white'
            }`}
          >
            4-Agent Pipeline
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'chat'
                ? 'bg-neon-purple text-white shadow-sm'
                : 'text-forge-400 hover:text-white'
            }`}
          >
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'providers'
                ? 'bg-neon-purple text-white shadow-sm'
                : 'text-forge-400 hover:text-white'
            }`}
          >
            Providers & Keys
          </button>
        </div>
      </div>

      {/* TAB 1: 4-AGENT MULTI-AGENT PIPELINE */}
      {activeTab === 'multi_agent' && (
        <div className="space-y-6">
          {/* Agent Workflow Stepper */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 select-none">
            <div className={`p-3 rounded-xl border ${architectPlan ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-forge-900 border-forge-750'}`}>
              <span className="text-[10px] font-mono text-forge-400 block uppercase">Agent 1</span>
              <div className="font-bold text-xs sm:text-sm text-white">ARCHITECT</div>
              <span className="text-[11px] text-forge-400">Plans structure</span>
            </div>

            <div className={`p-3 rounded-xl border ${completedTasks.length > 0 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-forge-900 border-forge-750'}`}>
              <span className="text-[10px] font-mono text-forge-400 block uppercase">Agent 2</span>
              <div className="font-bold text-xs sm:text-sm text-white">CODER</div>
              <span className="text-[11px] text-forge-400">Generates files</span>
            </div>

            <div className="p-3 rounded-xl border bg-forge-900 border-forge-750">
              <span className="text-[10px] font-mono text-forge-400 block uppercase">Agent 3</span>
              <div className="font-bold text-xs sm:text-sm text-white">DEBUGGER</div>
              <span className="text-[11px] text-forge-400">Diagnoses errors</span>
            </div>

            <div className={`p-3 rounded-xl border ${testResult ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-forge-900 border-forge-750'}`}>
              <span className="text-[10px] font-mono text-forge-400 block uppercase">Agent 4</span>
              <div className="font-bold text-xs sm:text-sm text-white">TESTER</div>
              <span className="text-[11px] text-forge-400">Runs test suite</span>
            </div>
          </div>

          {/* User Feature Request Input Form */}
          <div className="bg-forge-900 border border-forge-750 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-neon-purple" />
              <span>Describe Feature or Application Requirement</span>
            </h3>

            <form onSubmit={handleStartArchitect} className="space-y-3">
              <textarea
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                placeholder="e.g. Add a responsive dark mode toggle, create a REST endpoint for user profiles, or build a mobile calculator..."
                rows={3}
                className="w-full bg-forge-950 border border-forge-700 rounded-xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-neon-purple"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isArchitectWorking || !goalInput.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-purple to-electric-500 hover:from-purple-500 hover:to-electric-400 text-white font-bold text-xs transition-all shadow-md shadow-neon-purple/20 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isArchitectWorking ? 'Architect Planning...' : 'Run Architect Agent'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Architect Plan Review (Requires User Approval Checkpoint) */}
          {architectPlan && (
            <div className="bg-forge-900 border border-neon-purple/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-forge-800">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-neon-purple" />
                  <h3 className="font-bold text-sm text-white">Architect Blueprint & Task Breakdown</h3>
                </div>
                <span className="text-xs font-mono text-neon-purple font-semibold">
                  Pending Approval
                </span>
              </div>

              <p className="text-xs text-forge-300 leading-relaxed">
                {architectPlan.summary}
              </p>

              {architectPlan.architecture && (
                <div className="bg-forge-950 p-3 rounded-xl border border-forge-800 text-xs text-forge-400 font-mono">
                  {architectPlan.architecture}
                </div>
              )}

              {/* Task Checklist */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-forge-400 font-semibold">
                  Scheduled Implementation Tasks:
                </h4>
                {architectPlan.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-forge-950 border border-forge-800 rounded-xl p-3 flex items-start justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{task.title}</span>
                        {completedTasks.includes(task.id) && (
                          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            Completed
                          </span>
                        )}
                      </div>
                      <p className="text-forge-400 text-[11px] mt-0.5">{task.description}</p>
                      {task.targetFile && (
                        <span className="font-mono text-[10px] text-electric-400 mt-1 block">
                          Target: {task.targetFile}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Explicit Approval Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setArchitectPlan(null)}
                  className="px-4 py-2 text-xs font-semibold text-forge-400 hover:text-white"
                >
                  Discard Blueprint
                </button>
                <button
                  onClick={handleApprovePlan}
                  disabled={isCodingWorking}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-forge-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isCodingWorking ? 'Coder Agent Generating...' : 'Approve Plan & Launch Coder'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Coder File Diffs & Review */}
          {codeReviewFiles.length > 0 && (
            <div className="bg-forge-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-forge-800">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span>Review Generated Code Changes ({codeReviewFiles.length} files)</span>
                </h3>
              </div>

              <div className="space-y-3">
                {codeReviewFiles.map((item, idx) => (
                  <div key={idx} className="bg-forge-950 border border-forge-800 rounded-xl overflow-hidden">
                    <div className="bg-forge-850 px-3 py-2 border-b border-forge-800 flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-electric-400">{item.path}</span>
                      <span className="text-forge-400">{item.explanation}</span>
                    </div>
                    <pre className="p-3 text-[11px] font-mono text-forge-200 overflow-x-auto max-h-48 leading-relaxed">
                      {item.content}
                    </pre>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  onClick={() => setCodeReviewFiles([])}
                  className="px-4 py-2 text-xs font-semibold text-forge-400 hover:text-white"
                >
                  Reject Changes
                </button>
                <button
                  onClick={handleApplyChangesToProject}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-forge-950 font-bold text-xs transition-all shadow-md shadow-electric-500/20 active:scale-95"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Apply All Changes to Project</span>
                </button>
              </div>
            </div>
          )}

          {/* DEBUGGER & TESTER SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Debugger Tool */}
            <div className="bg-forge-900 border border-forge-750 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Debugger Agent</h3>
              </div>
              <p className="text-xs text-forge-400">
                Paste compiler or terminal errors to receive an automated diagnosis and patch.
              </p>
              <form onSubmit={handleRunDebugger} className="space-y-2">
                <textarea
                  value={errorInput}
                  onChange={(e) => setErrorInput(e.target.value)}
                  placeholder="Paste error stack trace or failed command output..."
                  rows={3}
                  className="w-full bg-forge-950 border border-forge-700 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isDebugging || !errorInput.trim()}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-forge-950 font-bold text-xs disabled:opacity-50"
                >
                  {isDebugging ? 'Analyzing Error...' : 'Diagnose & Fix'}
                </button>
              </form>

              {debugResult && (
                <div className="bg-forge-950 p-3 rounded-xl border border-forge-800 text-xs space-y-2 animate-in fade-in">
                  <div className="font-bold text-amber-400">Cause: {debugResult.rootCause}</div>
                  <div className="text-forge-300">{debugResult.fix}</div>
                </div>
              )}
            </div>

            {/* Tester Tool */}
            <div className="bg-forge-900 border border-forge-750 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Tester Agent</h3>
              </div>
              <p className="text-xs text-forge-400">
                Executes unit test suites on the Termux local agent and reports authentic exit codes.
              </p>
              <div className="pt-2">
                <button
                  onClick={handleRunTester}
                  disabled={isTesting}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forge-950 font-bold text-xs disabled:opacity-50"
                >
                  {isTesting ? 'Running Tests...' : 'Run Test Suite'}
                </button>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                  testResult.passed 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}>
                  <div className="font-bold">
                    {testResult.passed ? '✅ All Tests Passed' : '❌ Tests Failed'} (Exit Code: {testResult.exitCode})
                  </div>
                  <pre className="text-[11px] whitespace-pre-wrap">{testResult.output}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AI CHAT */}
      {activeTab === 'chat' && (
        <div className="bg-forge-900 border border-forge-750 rounded-2xl flex flex-col h-[520px] shadow-xl overflow-hidden">
          <div className="bg-forge-850 border-b border-forge-800 px-4 py-2.5 flex items-center justify-between text-xs select-none">
            <span className="font-bold text-white">AI Developer Chat</span>
            <label className="flex items-center gap-1.5 text-forge-400 cursor-pointer">
              <input
                type="checkbox"
                checked={attachFileContext}
                onChange={(e) => setAttachFileContext(e.target.checked)}
                className="rounded accent-neon-purple"
              />
              <span>Attach project context</span>
            </label>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {chatMessages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role !== 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-neon-purple/20 text-neon-purple flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] rounded-2xl p-3.5 ${
                  msg.role === 'user'
                    ? 'bg-electric-500 text-forge-950 font-medium rounded-tr-none'
                    : msg.error
                    ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-tl-none'
                    : 'bg-forge-950 border border-forge-800 text-forge-100 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                  {msg.tokenUsage && (
                    <div className="mt-2 pt-1 border-t border-forge-850 text-[10px] font-mono text-forge-400 flex items-center gap-2">
                      <Zap className="w-3 h-3 text-electric-400" />
                      <span>{msg.tokenUsage.totalTokens} tokens used</span>
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-electric-500/20 text-electric-400 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {isChatLoading && (
              <div className="text-xs text-forge-400 flex items-center gap-2 italic">
                <span className="animate-spin">⏳</span>
                <span>Generating response...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendChat} className="bg-forge-850 border-t border-forge-800 p-3 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question or request a component..."
              className="flex-1 bg-forge-950 border border-forge-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-neon-purple"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isChatLoading}
              className="p-2.5 rounded-xl bg-neon-purple hover:bg-purple-600 text-white disabled:opacity-50 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: PROVIDERS & API KEYS */}
      {activeTab === 'providers' && (
        <div className="space-y-4">
          <div className="bg-forge-900 border border-forge-750 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-electric-400" />
              <span>AI Provider Configuration</span>
            </h3>
            <p className="text-xs text-forge-400">
              Keys are encrypted in browser local storage and never committed to Git or sent to third-party proxies.
            </p>

            {/* Provider List: Gemini, Groq, OpenRouter */}
            <div className="space-y-4">
              {(['gemini', 'groq', 'openrouter'] as AIProviderId[]).map(id => {
                const prov = aiSettings.providers[id];
                const isPrimary = aiSettings.primaryProvider === id;
                const isFallback = aiSettings.fallbackProvider === id;

                return (
                  <div key={id} className="bg-forge-950 border border-forge-800 rounded-xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{prov.name}</span>
                        {isPrimary && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-electric-500/10 text-electric-400 border border-electric-500/20">
                            Primary
                          </span>
                        )}
                        {isFallback && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                            Fallback
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            onUpdateAISettings({ ...aiSettings, primaryProvider: id });
                          }}
                          className={`text-xs px-2.5 py-1 rounded-lg border ${
                            isPrimary ? 'bg-electric-500 text-forge-950 font-bold' : 'text-forge-400 hover:text-white border-forge-750'
                          }`}
                        >
                          Make Primary
                        </button>
                        <button
                          onClick={() => handleTestConnection(id)}
                          disabled={!prov.apiKey || testingProvider === id}
                          className="text-xs px-2.5 py-1 rounded-lg bg-forge-800 hover:bg-forge-750 text-forge-300 border border-forge-700 disabled:opacity-50"
                        >
                          {testingProvider === id ? 'Testing...' : 'Test Connection'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-forge-400 block mb-1 text-[11px]">API Key</label>
                        <input
                          type="password"
                          value={prov.apiKey}
                          onChange={(e) => {
                            const updated = { ...aiSettings };
                            updated.providers[id].apiKey = e.target.value.trim();
                            onUpdateAISettings(updated);
                          }}
                          placeholder={`Enter ${prov.name} API Key...`}
                          className="w-full bg-forge-900 border border-forge-750 rounded-lg px-3 py-1.5 text-white font-mono text-xs focus:outline-none focus:border-electric-500"
                        />
                      </div>

                      <div>
                        <label className="text-forge-400 block mb-1 text-[11px]">Model Selection</label>
                        <select
                          value={prov.selectedModel}
                          onChange={(e) => {
                            const updated = { ...aiSettings };
                            updated.providers[id].selectedModel = e.target.value;
                            onUpdateAISettings(updated);
                          }}
                          className="w-full bg-forge-900 border border-forge-750 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-electric-500"
                        >
                          {prov.availableModels.map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {testStatusMessage && (
              <div className="p-3 rounded-xl bg-forge-850 border border-forge-800 text-xs text-forge-300 font-mono">
                {testStatusMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
