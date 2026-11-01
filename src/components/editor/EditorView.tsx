import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Project, ProjectFile } from '../../types';
import { MobileAccessoryBar } from './MobileAccessoryBar';
import { 
  FileCode, 
  Folder, 
  FolderPlus, 
  FilePlus, 
  Save, 
  Search, 
  Replace, 
  X, 
  ChevronRight, 
  ChevronDown, 
  Trash2, 
  Edit3, 
  Check, 
  FileText, 
  Menu, 
  PanelLeftClose, 
  PanelLeftOpen,
  Play,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface EditorViewProps {
  project: Project | null;
  onSaveProject: (p: Project) => void;
  onOpenPreview: () => void;
  onAskAIAboutFile?: (file: ProjectFile) => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  project,
  onSaveProject,
  onOpenPreview,
  onAskAIAboutFile,
}) => {
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-3">
        <Folder className="w-12 h-12 text-forge-600" />
        <h3 className="text-base font-bold text-white">No Active Project</h3>
        <p className="text-xs text-forge-400">Please select or create a project from the Projects tab.</p>
      </div>
    );
  }

  // Active open file and tab registry
  const [openFileIds, setOpenFileIds] = useState<string[]>(() => {
    return project.files.length > 0 ? [project.files[0].id] : [];
  });
  const [activeFileId, setActiveFileId] = useState<string>(() => {
    return project.activeFileId || (project.files[0] ? project.files[0].id : '');
  });

  // Current file buffer & dirty flag
  const [fileContent, setFileContent] = useState<string>('');
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Sidebar visibility (collapsible on mobile)
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Search & Replace within active file
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchWord, setSearchWord] = useState<string>('');
  const [replaceWord, setReplaceWord] = useState<string>('');
  const [matchCount, setMatchCount] = useState<number>(0);

  // File creation modal / state
  const [newFileName, setNewFileName] = useState<string>('');
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);

  // Textarea ref for accessory insertion
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Current active file object
  const currentFile = useMemo(() => {
    return project.files.find(f => f.id === activeFileId) || project.files[0];
  }, [project.files, activeFileId]);

  // Sync buffer when active file changes
  useEffect(() => {
    if (currentFile) {
      setFileContent(currentFile.content);
      setIsDirty(false);
    }
  }, [currentFile?.id]);

  // Auto-save debounce effect (saves automatically after 2 seconds of inactivity)
  useEffect(() => {
    if (!isDirty || !currentFile) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [fileContent, isDirty]);

  // Count search matches
  useEffect(() => {
    if (!searchWord || !fileContent) {
      setMatchCount(0);
      return;
    }
    try {
      const regex = new RegExp(searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const matches = fileContent.match(regex);
      setMatchCount(matches ? matches.length : 0);
    } catch {
      setMatchCount(0);
    }
  }, [searchWord, fileContent]);

  const handleSave = () => {
    if (!currentFile) return;
    setSaveStatus('saving');

    const updatedFiles = project.files.map(f => {
      if (f.id === currentFile.id) {
        return { ...f, content: fileContent, updatedAt: new Date().toISOString() };
      }
      return f;
    });

    onSaveProject({
      ...project,
      files: updatedFiles,
      activeFileId: currentFile.id
    });

    setIsDirty(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 1500);
  };

  const handleOpenFile = (file: ProjectFile) => {
    if (!openFileIds.includes(file.id)) {
      setOpenFileIds(prev => [...prev, file.id]);
    }
    setActiveFileId(file.id);
    setIsSidebarOpen(false); // Close sidebar on mobile once selected
  };

  const handleCloseTab = (fileId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = openFileIds.filter(id => id !== fileId);
    setOpenFileIds(remaining);
    if (activeFileId === fileId) {
      setActiveFileId(remaining[remaining.length - 1] || '');
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const name = newFileName.trim();
    const ext = name.split('.').pop()?.toLowerCase() || '';
    let language = 'text';
    if (['js', 'jsx'].includes(ext)) language = 'javascript';
    else if (['ts', 'tsx'].includes(ext)) language = 'typescript';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'json') language = 'json';
    else if (ext === 'py') language = 'python';
    else if (ext === 'md') language = 'markdown';

    const newFile: ProjectFile = {
      id: 'f_' + Date.now(),
      path: name,
      name: name.split('/').pop() || name,
      content: '',
      language,
      updatedAt: new Date().toISOString()
    };

    const updated = {
      ...project,
      files: [...project.files, newFile]
    };

    onSaveProject(updated);
    setOpenFileIds(prev => [...prev, newFile.id]);
    setActiveFileId(newFile.id);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const handleDeleteFile = (file: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.files.length <= 1) {
      alert('Cannot delete the last remaining file in the project.');
      return;
    }
    if (confirm(`Delete ${file.name}?`)) {
      const remainingFiles = project.files.filter(f => f.id !== file.id);
      setOpenFileIds(prev => prev.filter(id => id !== file.id));
      if (activeFileId === file.id) {
        setActiveFileId(remainingFiles[0]?.id || '');
      }
      onSaveProject({
        ...project,
        files: remainingFiles
      });
    }
  };

  // Virtual mobile accessory insert text at cursor
  const handleInsertText = (text: string) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const val = fileContent;

    const nextVal = val.substring(0, start) + text + val.substring(end);
    setFileContent(nextVal);
    setIsDirty(true);

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + text.length, start + text.length);
    }, 10);
  };

  const handleIndent = () => {
    handleInsertText('  '); // 2 spaces
  };

  const handleFindReplace = () => {
    if (!searchWord) return;
    const regex = new RegExp(searchWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const updated = fileContent.replace(regex, replaceWord);
    setFileContent(updated);
    setIsDirty(true);
  };

  // Compute line count
  const lineCount = useMemo(() => {
    return fileContent.split('\n').length;
  }, [fileContent]);

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-65px)] bg-forge-950 overflow-hidden relative select-none">
      {/* Top File Action Toolbar */}
      <div className="bg-forge-900 border-b border-forge-750 px-3 py-2 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
          {/* Toggle File Tree Button */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className={`p-1.5 rounded-lg border transition-colors ${
              isSidebarOpen 
                ? 'bg-electric-500/20 text-electric-400 border-electric-500/30' 
                : 'bg-forge-800 text-forge-300 border-forge-700 hover:text-white'
            }`}
            title="Toggle File Tree"
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>

          {/* Open Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {openFileIds.map(fid => {
              const file = project.files.find(f => f.id === fid);
              if (!file) return null;
              const isActive = activeFileId === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer border transition-all flex-shrink-0 ${
                    isActive 
                      ? 'bg-forge-800 text-electric-400 border-electric-500/30 font-semibold' 
                      : 'bg-forge-850 text-forge-400 border-forge-800 hover:text-forge-200'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[100px]">{file.name}</span>
                  {isActive && isDirty && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Unsaved changes" />
                  )}
                  <button
                    onClick={(e) => handleCloseTab(file.id, e)}
                    className="hover:text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setIsSearchOpen(prev => !prev)}
            className={`p-1.5 rounded-lg border text-xs transition-colors ${
              isSearchOpen 
                ? 'bg-electric-500/20 text-electric-400 border-electric-500/30' 
                : 'bg-forge-800 text-forge-400 border-forge-700 hover:text-white'
            }`}
            title="Search & Replace"
          >
            <Search className="w-4 h-4" />
          </button>

          {currentFile && onAskAIAboutFile && (
            <button
              onClick={() => onAskAIAboutFile(currentFile)}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neon-purple/10 hover:bg-neon-purple/20 text-neon-purple border border-neon-purple/30 text-xs font-semibold transition-colors"
              title="Analyze with AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={!isDirty}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
              isDirty
                ? 'bg-electric-500 hover:bg-electric-400 text-forge-950 shadow-md shadow-electric-500/20'
                : 'bg-forge-800 text-forge-500 border border-forge-700 opacity-60'
            }`}
            title="Save File (Ctrl+S)"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">
              {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved' : 'Save'}
            </span>
          </button>
        </div>
      </div>

      {/* Search & Replace Floating Bar */}
      {isSearchOpen && (
        <div className="bg-forge-900 border-b border-forge-750 p-2.5 flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 bg-forge-950 border border-forge-800 rounded-lg px-2 py-1 flex-1 min-w-[130px]">
            <Search className="w-3.5 h-3.5 text-forge-400" />
            <input
              type="text"
              placeholder="Find in file..."
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value)}
              className="bg-transparent text-white w-full focus:outline-none font-mono"
            />
            {matchCount > 0 && (
              <span className="text-[10px] text-electric-400 font-mono">{matchCount} matches</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-forge-950 border border-forge-800 rounded-lg px-2 py-1 flex-1 min-w-[130px]">
            <Replace className="w-3.5 h-3.5 text-forge-400" />
            <input
              type="text"
              placeholder="Replace with..."
              value={replaceWord}
              onChange={(e) => setReplaceWord(e.target.value)}
              className="bg-transparent text-white w-full focus:outline-none font-mono"
            />
          </div>

          <button
            onClick={handleFindReplace}
            disabled={!searchWord}
            className="px-3 py-1.5 bg-forge-800 hover:bg-forge-750 text-white rounded-lg border border-forge-700 font-medium disabled:opacity-50"
          >
            Replace All
          </button>

          <button
            onClick={() => setIsSearchOpen(false)}
            className="text-forge-400 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Work Area: File Explorer + Code Editor */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* File Explorer Pane (Responsive drawer on mobile, pane on desktop) */}
        {isSidebarOpen && (
          <aside className="absolute inset-y-0 left-0 z-30 w-64 bg-forge-900 border-r border-forge-750 shadow-2xl flex flex-col p-3 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-forge-800">
              <span className="text-xs font-bold text-forge-200 uppercase tracking-wider font-mono">
                Files
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsCreatingFile(true)}
                  className="p-1 rounded hover:bg-forge-800 text-forge-400 hover:text-white"
                  title="New File"
                >
                  <FilePlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 rounded hover:bg-forge-800 text-forge-400 hover:text-white md:hidden"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* New File Inline Input */}
            {isCreatingFile && (
              <form onSubmit={handleCreateFile} className="flex items-center gap-1">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="filename.ext"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="bg-forge-950 border border-electric-500 rounded px-2 py-1 text-xs text-white w-full focus:outline-none font-mono"
                />
                <button type="submit" className="p-1 bg-electric-500 text-forge-950 rounded">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingFile(false)}
                  className="p-1 bg-forge-800 text-forge-300 rounded"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </form>
            )}

            {/* File List */}
            <div className="flex-1 overflow-y-auto space-y-1">
              {project.files.map(f => {
                const isActive = activeFileId === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => handleOpenFile(f)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-mono cursor-pointer transition-colors group ${
                      isActive 
                        ? 'bg-electric-500/10 text-electric-400 font-semibold border border-electric-500/20' 
                        : 'text-forge-300 hover:bg-forge-850 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-electric-400' : 'text-forge-400'}`} />
                      <span className="truncate">{f.path}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteFile(f, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-rose-400 text-forge-500"
                      title="Delete File"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Code Editor Surface */}
        <main className="flex-1 flex flex-col overflow-hidden bg-forge-950">
          {currentFile ? (
            <div className="flex-1 flex overflow-hidden">
              {/* Line Numbers Column */}
              <div className="w-10 sm:w-12 bg-forge-950 text-forge-500 font-mono text-xs select-none py-3 text-right pr-2 sm:pr-3 border-r border-forge-850 overflow-hidden leading-6">
                {Array.from({ length: lineCount }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Code Textarea Area */}
              <textarea
                ref={textareaRef}
                value={fileContent}
                onChange={(e) => {
                  setFileContent(e.target.value);
                  setIsDirty(true);
                }}
                spellCheck={false}
                autoCapitalize="none"
                autoComplete="off"
                autoCorrect="off"
                className="flex-1 bg-forge-950 text-forge-100 font-mono text-xs sm:text-sm p-3 leading-6 focus:outline-none resize-none overflow-y-auto selection:bg-electric-500/20"
                placeholder="Start typing your code..."
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-forge-500 text-xs">
              No open file. Select a file from the explorer.
            </div>
          )}

          {/* Virtual Accessory Toolbar for Android Mobile Typing */}
          <MobileAccessoryBar
            onInsertText={handleInsertText}
            onIndent={handleIndent}
          />

          {/* Bottom Editor Status Bar */}
          <div className="bg-forge-900 border-t border-forge-750 px-3 py-1 flex items-center justify-between text-[11px] font-mono text-forge-400 select-none">
            <div className="flex items-center gap-3">
              <span>{currentFile ? currentFile.name : ''}</span>
              <span>•</span>
              <span className="uppercase">{currentFile ? currentFile.language : 'TXT'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{lineCount} lines</span>
              <span>•</span>
              <span className={isDirty ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {isDirty ? 'Unsaved' : 'Saved'}
              </span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
