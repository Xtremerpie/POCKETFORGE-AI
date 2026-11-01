import React, { useState, useMemo, useRef } from 'react';
import { Project, TemplateId } from '../../types';
import { TEMPLATES, createProjectFromTemplate } from '../../services/templates';
import { exportProjectZip, importProjectZip, triggerDownload } from '../../services/zipService';
import { 
  FolderKanban, 
  Plus, 
  Search, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Folder, 
  FileCode, 
  Layers, 
  Globe, 
  Atom, 
  Server, 
  Terminal, 
  Code2, 
  User, 
  Bot,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

interface ProjectManagerViewProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  onSaveProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  onOpenInEditor: (p: Project) => void;
}

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  'Globe': Globe,
  'Atom': Atom,
  'Layers': Layers,
  'Server': Server,
  'Terminal': Terminal,
  'Code2': Code2,
  'User': User,
  'Bot': Bot,
};

export const ProjectManagerView: React.FC<ProjectManagerViewProps> = ({
  projects,
  activeProject,
  onSelectProject,
  onSaveProject,
  onDeleteProject,
  onOpenInEditor,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreatingModal, setIsCreatingModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('html-js');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Project to rename
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  // Project to delete (confirmation)
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  // File input for ZIP import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.template.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [projects, searchQuery]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProj = createProjectFromTemplate(
      selectedTemplate,
      newProjectName.trim(),
      newProjectDesc.trim()
    );

    onSaveProject(newProj);
    onSelectProject(newProj);
    setIsCreatingModal(false);
    setNewProjectName('');
    setNewProjectDesc('');
    onOpenInEditor(newProj);
  };

  const handleDuplicate = (project: Project) => {
    const duplicated: Project = {
      ...project,
      id: 'proj_' + Date.now(),
      name: `${project.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      files: project.files.map((f, i) => ({
        ...f,
        id: 'f_' + Date.now() + '_' + i
      }))
    };
    onSaveProject(duplicated);
  };

  const handleStartRename = (project: Project) => {
    setEditingProjectId(project.id);
    setEditingName(project.name);
  };

  const handleSaveRename = (project: Project) => {
    if (editingName.trim()) {
      onSaveProject({
        ...project,
        name: editingName.trim()
      });
    }
    setEditingProjectId(null);
  };

  const handleExportZip = async (project: Project) => {
    try {
      const blob = await exportProjectZip(project);
      triggerDownload(blob, `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}.zip`);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const importedData = await importProjectZip(file);
      const now = new Date().toISOString();
      const newProj: Project = {
        id: 'proj_' + Date.now(),
        ...importedData,
        createdAt: now,
        updatedAt: now
      };
      onSaveProject(newProj);
      onSelectProject(newProj);
      onOpenInEditor(newProj);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-electric-400" />
            <span>Project Manager</span>
          </h1>
          <p className="text-xs text-forge-400 mt-0.5">
            Create, manage, duplicate, import and export your mobile development projects.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".zip"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-forge-800 hover:bg-forge-750 text-forge-200 border border-forge-700 text-xs font-semibold transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{isImporting ? 'Importing...' : 'Import ZIP'}</span>
          </button>

          <button
            onClick={() => setIsCreatingModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 text-forge-950 text-xs font-bold transition-all shadow-md shadow-electric-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create Project</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-forge-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search projects by name, template, or description..."
          className="w-full bg-forge-900 border border-forge-750 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-forge-400 focus:outline-none focus:border-electric-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-forge-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const isCurrent = activeProject?.id === project.id;
          const isEditing = editingProjectId === project.id;

          return (
            <div
              key={project.id}
              className={`bg-forge-900 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group ${
                isCurrent 
                  ? 'border-electric-500/50 shadow-lg shadow-electric-500/5 bg-forge-850' 
                  : 'border-forge-750 hover:border-forge-600'
              }`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  {isEditing ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="bg-forge-950 border border-electric-500 text-white px-2 py-1 rounded text-sm w-full font-bold focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(project)}
                        className="p-1 rounded bg-emerald-500 text-forge-950"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingProjectId(null)}
                        className="p-1 rounded bg-forge-800 text-forge-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <h3 
                      onClick={() => {
                        onSelectProject(project);
                        onOpenInEditor(project);
                      }}
                      className="font-bold text-base text-white group-hover:text-electric-400 transition-colors cursor-pointer truncate"
                      title={project.name}
                    >
                      {project.name}
                    </h3>
                  )}

                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-forge-800 text-forge-300 border border-forge-700 flex-shrink-0">
                    {project.template}
                  </span>
                </div>

                <p className="text-xs text-forge-400 line-clamp-2 mb-4 leading-relaxed">
                  {project.description || 'No project description.'}
                </p>

                {/* File Count & Meta */}
                <div className="flex items-center gap-3 text-xs text-forge-400 font-mono mb-4">
                  <div className="flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-electric-400" />
                    <span>{project.files.length} files</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Actions Toolbar */}
              <div className="pt-3 border-t border-forge-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => {
                    onSelectProject(project);
                    onOpenInEditor(project);
                  }}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-electric-500/10 hover:bg-electric-500/20 text-electric-400 font-semibold text-xs border border-electric-500/20 transition-colors text-center"
                >
                  Open Editor
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartRename(project)}
                    className="p-1.5 rounded-lg hover:bg-forge-800 text-forge-400 hover:text-white transition-colors"
                    title="Rename"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDuplicate(project)}
                    className="p-1.5 rounded-lg hover:bg-forge-800 text-forge-400 hover:text-white transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleExportZip(project)}
                    className="p-1.5 rounded-lg hover:bg-forge-800 text-forge-400 hover:text-white transition-colors"
                    title="Export ZIP"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setDeletingProject(project)}
                    className="p-1.5 rounded-lg hover:bg-rose-500/10 text-forge-400 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 bg-forge-900 border border-dashed border-forge-750 rounded-2xl space-y-3">
          <Folder className="w-10 h-10 text-forge-500 mx-auto" />
          <h3 className="text-sm font-bold text-white">No projects found</h3>
          <p className="text-xs text-forge-400 max-w-sm mx-auto">
            {searchQuery ? `No projects matching "${searchQuery}"` : 'Create a new project from one of the 8 pre-configured templates.'}
          </p>
        </div>
      )}

      {/* CREATE PROJECT MODAL WITH 8 TEMPLATES */}
      {isCreatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forge-950/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-forge-900 border border-forge-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-forge-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-electric-400" />
                <span>Create New Project</span>
              </h2>
              <button
                onClick={() => setIsCreatingModal(false)}
                className="text-forge-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-forge-300 block mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="e.g. My Next.js Dashboard or Python Analyzer"
                  className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-forge-300 block mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder="Brief summary of the application..."
                  className="w-full bg-forge-950 border border-forge-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-electric-500"
                />
              </div>

              {/* Template Selector (All 8 Templates) */}
              <div>
                <label className="text-xs font-semibold text-forge-300 block mb-2">
                  Select Project Template (8 Stacks Available)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                  {TEMPLATES.map((tpl) => {
                    const IconComponent = TEMPLATE_ICONS[tpl.icon] || Code2;
                    const isSelected = selectedTemplate === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => setSelectedTemplate(tpl.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-electric-500/10 border-electric-500 shadow-sm shadow-electric-500/10'
                            : 'bg-forge-850 border-forge-800 hover:border-forge-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-electric-500 text-forge-950' : 'bg-forge-800 text-forge-300'}`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-white truncate">{tpl.name}</h4>
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-forge-800 text-forge-400">
                              {tpl.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-forge-400 line-clamp-2 mt-0.5 leading-tight">
                            {tpl.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-forge-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-forge-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-electric-500 to-electric-600 hover:from-electric-400 hover:to-electric-500 disabled:opacity-50 text-forge-950 font-bold text-xs shadow-md shadow-electric-500/20"
                >
                  Create & Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forge-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-forge-900 border border-forge-750 max-w-sm w-full rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Delete Project?</h3>
                <p className="text-xs text-forge-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-forge-300 bg-forge-950 p-3 rounded-xl border border-forge-800">
              Are you sure you want to permanently delete <strong className="text-white">{deletingProject.name}</strong> containing {deletingProject.files.length} files?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                onClick={() => setDeletingProject(null)}
                className="px-3.5 py-2 text-xs font-semibold text-forge-300 hover:text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProject(deletingProject.id);
                  setDeletingProject(null);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
