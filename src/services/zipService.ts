import JSZip from 'jszip';
import { Project, ProjectFile } from '../types';

export async function exportProjectZip(project: Project): Promise<Blob> {
  const zip = new JSZip();

  for (const file of project.files) {
    // Strip leading slashes to prevent root-relative zip issues
    const cleanPath = file.path.replace(/^\/+/, '');
    zip.file(cleanPath, file.content);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export async function exportLinuxMintBundle(project: Project): Promise<Blob> {
  const zip = new JSZip();

  // Filter out any unwanted or sensitive files
  const filteredFiles = project.files.filter(f => {
    const p = f.path.toLowerCase();
    if (p.includes('node_modules/') || p.includes('.venv/') || p.startsWith('.git/')) return false;
    if (p === '.env' || p.endsWith('/.env')) return false;
    return true;
  });

  for (const file of filteredFiles) {
    const cleanPath = file.path.replace(/^\/+/, '');
    zip.file(cleanPath, file.content);
  }

  // 1. Generate customized LINUX_MINT_README.md
  const isNode = project.template === 'react' || project.template === 'nextjs' || project.template === 'node-api' || project.template === 'discord-bot';
  const isPython = project.template === 'python-app' || project.template === 'flask-api';

  const linuxMintReadme = `# 🐧 ${project.name} - Linux Mint Setup & Run Guide

Exported from **PocketForge AI** on Android.

---

## 📋 System Prerequisites on Linux Mint
Open your terminal (\`Ctrl + Alt + T\`) and run:

\`\`\`bash
sudo apt update
sudo apt install -y ${isNode ? 'nodejs npm ' : ''}${isPython ? 'python3 python3-pip python3-venv ' : ''}git curl
\`\`\`

---

## 🚀 Running Your Project

### Option A: One-Click Startup Script
\`\`\`bash
chmod +x run-linux.sh
./run-linux.sh
\`\`\`

### Option B: Manual Setup
${isNode ? `
\`\`\`bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev # or npm start
\`\`\`
` : ''}
${isPython ? `
\`\`\`bash
# 1. Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install requirements
pip install -r requirements.txt

# 3. Run application
python3 ${project.files.some(f => f.path === 'app.py') ? 'app.py' : 'main.py'}
\`\`\`
` : ''}
${!isNode && !isPython ? `
Open \`index.html\` directly in Firefox / Chrome or serve locally:
\`\`\`bash
python3 -m http.server 3000
\`\`\`
` : ''}

---
*Created with PocketForge AI - Your phone. Your code. Your own development universe.*
`;

  zip.file('LINUX_MINT_README.md', linuxMintReadme);

  // 2. Generate run-linux.sh startup script
  let scriptContent = `#!/usr/bin/env bash
# PocketForge AI - Linux Mint Auto-Runner
set -e

echo "🐧 Initializing ${project.name} on Linux..."
`;

  if (isNode) {
    scriptContent += `
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm packages..."
    npm install
fi
echo "🚀 Starting development server..."
if grep -q '"dev":' package.json; then
    npm run dev
else
    npm start
fi
`;
  } else if (isPython) {
    scriptContent += `
if [ ! -d ".venv" ]; then
    echo "🐍 Creating virtual environment..."
    python3 -m venv .venv
fi
source .venv/bin/activate
if [ -f "requirements.txt" ] && [ -s "requirements.txt" ]; then
    echo "📦 Installing Python requirements..."
    pip install -r requirements.txt
fi
echo "🚀 Starting Python script..."
if [ -f "app.py" ]; then
    python3 app.py
elif [ -f "main.py" ]; then
    python3 main.py
else
    python3 $(ls *.py | head -n 1)
fi
`;
  } else {
    scriptContent += `
echo "🌐 Starting local web preview server on port 3000..."
python3 -m http.server 3000
`;
  }

  zip.file('run-linux.sh', scriptContent);

  // 3. Generate standard .gitignore if not present
  if (!project.files.some(f => f.path === '.gitignore')) {
    zip.file('.gitignore', `node_modules/\n.venv/\n__pycache__/\n*.pyc\n.env\n.DS_Store\ndist/\nbuild/\n.cache/\n`);
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
}

export async function importProjectZip(zipFile: File): Promise<Omit<Project, 'id' | 'createdAt' | 'updatedAt'>> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(zipFile);
  const files: ProjectFile[] = [];
  const now = new Date().toISOString();

  let detectedTemplate: Project['template'] = 'html-js';
  const fileEntries: string[] = [];

  for (const [relativePath, entry] of Object.entries(loadedZip.files)) {
    if (entry.dir) continue;
    if (relativePath.includes('__MACOSX') || relativePath.includes('.DS_Store')) continue;

    fileEntries.push(relativePath);
    const content = await entry.async('string');
    const name = relativePath.split('/').pop() || relativePath;

    // Detect language
    const ext = name.split('.').pop()?.toLowerCase() || '';
    let language = 'text';
    if (['js', 'jsx'].includes(ext)) language = 'javascript';
    else if (['ts', 'tsx'].includes(ext)) language = 'typescript';
    else if (ext === 'html') language = 'html';
    else if (ext === 'css') language = 'css';
    else if (ext === 'json') language = 'json';
    else if (ext === 'py') language = 'python';
    else if (ext === 'md') language = 'markdown';

    files.push({
      id: 'f_imp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      path: relativePath,
      name,
      content,
      language,
      updatedAt: now
    });
  }

  // Template auto-detection
  if (fileEntries.some(f => f.includes('next.config') || f.includes('pages/api'))) {
    detectedTemplate = 'nextjs';
  } else if (fileEntries.some(f => f.includes('vite.config') || f.includes('src/App.tsx') || f.includes('src/App.jsx'))) {
    detectedTemplate = 'react';
  } else if (fileEntries.some(f => f.includes('app.py') && f.includes('flask'))) {
    detectedTemplate = 'flask-api';
  } else if (fileEntries.some(f => f.endsWith('.py'))) {
    detectedTemplate = 'python-app';
  } else if (fileEntries.some(f => f.includes('bot.js') || f.includes('discord'))) {
    detectedTemplate = 'discord-bot';
  } else if (fileEntries.some(f => f.includes('server.js'))) {
    detectedTemplate = 'node-api';
  }

  const projectName = zipFile.name.replace(/\.zip$/i, '') || 'Imported Project';

  return {
    name: projectName,
    description: `Imported from ${zipFile.name}`,
    template: detectedTemplate,
    files,
    activeFileId: files[0]?.id
  };
}

export function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
