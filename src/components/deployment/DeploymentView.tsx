import React, { useState, useMemo } from 'react';
import { Project } from '../../types';
import { 
  Rocket, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ExternalLink, 
  Layers, 
  FileCode, 
  ShieldCheck, 
  Copy, 
  Globe, 
  Check 
} from 'lucide-react';

interface DeploymentViewProps {
  activeProject: Project | null;
}

export const DeploymentView: React.FC<DeploymentViewProps> = ({ activeProject }) => {
  const [selectedPlatform, setSelectedPlatform] = useState<'vercel' | 'netlify' | 'github_pages'>('vercel');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Deployment Readiness Checks
  const readiness = useMemo(() => {
    if (!activeProject) return [];

    const hasIndexHtml = activeProject.files.some(f => f.path === 'index.html' || f.name === 'index.html');
    const hasPackageJson = activeProject.files.some(f => f.name === 'package.json');
    const hasEnvSecrets = activeProject.files.some(f => f.name === '.env');
    const hasReadme = activeProject.files.some(f => f.name.toLowerCase() === 'readme.md');

    let hasBuildScript = false;
    if (hasPackageJson) {
      const pkgFile = activeProject.files.find(f => f.name === 'package.json');
      try {
        const pkg = JSON.parse(pkgFile?.content || '{}');
        hasBuildScript = !!(pkg.scripts && pkg.scripts.build);
      } catch (e) {}
    }

    return [
      {
        id: 'entry',
        title: 'Entry Point Validated',
        passed: hasIndexHtml || hasPackageJson,
        message: hasIndexHtml ? 'Found index.html root entry point.' : hasPackageJson ? 'Found package.json server/app configuration.' : 'No standard index.html or package.json found.'
      },
      {
        id: 'build_script',
        title: 'Production Build Script',
        passed: hasBuildScript || hasIndexHtml,
        message: hasBuildScript ? 'Production build command configured in package.json.' : hasIndexHtml ? 'Static site requires no build step.' : 'Missing "build" script in package.json.'
      },
      {
        id: 'secrets',
        title: 'Secrets Exclusion Check',
        passed: !hasEnvSecrets,
        message: !hasEnvSecrets ? 'Clean: No unprotected .env secrets detected.' : 'Warning: .env file found. Set environment variables on the hosting platform instead of committing.'
      },
      {
        id: 'docs',
        title: 'Documentation / README',
        passed: hasReadme,
        message: hasReadme ? 'README.md exists for hosting platform guides.' : 'Recommended: Add a README.md explaining your project.'
      }
    ];
  }, [activeProject]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 1500);
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6 pb-20 md:pb-8">
      {/* Top Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Rocket className="w-6 h-6 text-electric-400" />
          <span>Deployment Center</span>
        </h1>
        <p className="text-xs text-forge-400 mt-0.5">
          Verify deployment readiness and ship your phone-built apps to Vercel, Netlify, or GitHub Pages.
        </p>
      </div>

      {/* Readiness Check Panel */}
      <div className="bg-forge-900 border border-forge-750 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-forge-800">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Pre-Flight Readiness Check ({activeProject ? activeProject.name : 'No Project'})</span>
          </h3>
          <span className="text-xs font-mono text-emerald-400">
            {readiness.filter(r => r.passed).length} / {readiness.length} Passed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {readiness.map(item => (
            <div
              key={item.id}
              className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                item.passed 
                  ? 'bg-forge-950 border-emerald-500/20' 
                  : 'bg-forge-950 border-amber-500/30'
              }`}
            >
              <div className="mt-0.5">
                {item.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <div className="text-xs">
                <div className="font-bold text-white">{item.title}</div>
                <div className="text-forge-400 text-[11px] mt-0.5">{item.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hosting Platform Guides */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Choose Hosting Destination</h2>

        {/* Platform Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'vercel', name: 'Vercel', bestFor: 'React, Next.js & Full-Stack', url: 'https://vercel.com/new' },
            { id: 'netlify', name: 'Netlify', bestFor: 'Static Sites & Jamstack', url: 'https://app.netlify.com/drop' },
            { id: 'github_pages', name: 'GitHub Pages', bestFor: 'HTML/JS & Documentation', url: 'https://pages.github.com' },
          ].map(p => (
            <div
              key={p.id}
              onClick={() => setSelectedPlatform(p.id as any)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                selectedPlatform === p.id
                  ? 'bg-electric-500/10 border-electric-500 shadow-md shadow-electric-500/10'
                  : 'bg-forge-900 border-forge-750 hover:border-forge-600'
              }`}
            >
              <div className="font-bold text-white text-sm">{p.name}</div>
              <div className="text-[11px] text-forge-400 mt-0.5">{p.bestFor}</div>
            </div>
          ))}
        </div>

        {/* Platform Instructions */}
        <div className="bg-forge-900 border border-forge-750 rounded-2xl p-5 space-y-4">
          {selectedPlatform === 'vercel' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <h3 className="font-bold text-white text-sm">Deploying to Vercel</h3>
              <p className="text-forge-300">
                1. Push your project from PocketForge to GitHub using the <strong>GitHub</strong> tab.
              </p>
              <p className="text-forge-300">
                2. Open Vercel Dashboard and click <strong>"Import Git Repository"</strong>.
              </p>
              <div className="bg-forge-950 p-3 rounded-xl border border-forge-800 space-y-1 font-mono text-[11px]">
                <div>Framework Preset: Vite / Next.js</div>
                <div>Build Command: <code className="text-electric-400">npm run build</code></div>
                <div>Output Directory: <code className="text-electric-400">dist</code></div>
              </div>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-black font-bold text-xs"
              >
                <span>Open Vercel Deploy</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {selectedPlatform === 'netlify' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <h3 className="font-bold text-white text-sm">Deploying to Netlify (Drag & Drop or Git)</h3>
              <p className="text-forge-300">
                1. In PocketForge, click <strong>"Export ZIP"</strong> from Project Manager.
              </p>
              <p className="text-forge-300">
                2. Open Netlify Drop on your phone browser or desktop:
              </p>
              <a
                href="https://app.netlify.com/drop"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-400 text-black font-bold text-xs"
              >
                <span>Open Netlify Drop</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}

          {selectedPlatform === 'github_pages' && (
            <div className="space-y-3 text-xs leading-relaxed">
              <h3 className="font-bold text-white text-sm">Deploying to GitHub Pages</h3>
              <p className="text-forge-300">
                1. Push your project repository to GitHub from the <strong>GitHub</strong> tab.
              </p>
              <p className="text-forge-300">
                2. On GitHub, navigate to <strong>Settings</strong> &rarr; <strong>Pages</strong>.
              </p>
              <p className="text-forge-300">
                3. Under Branch, select <code className="text-electric-400 font-mono">main</code> and <code className="text-electric-400 font-mono">/ (root)</code>, then click Save.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
