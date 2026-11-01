import { TemplateId, ProjectFile } from '../types';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  description: string;
  category: 'frontend' | 'fullstack' | 'backend' | 'python' | 'bot';
  icon: string;
  defaultPort?: number;
  files: Omit<ProjectFile, 'id' | 'updatedAt'>[];
}

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: 'html-js',
    name: 'HTML/CSS/JavaScript Website',
    description: 'Clean responsive web page with modern CSS and interactive JavaScript. Zero setup required.',
    category: 'frontend',
    icon: 'Globe',
    defaultPort: 3000,
    files: [
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PocketForge Project</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">⚡ PocketForge</div>
      <p class="tagline">Built directly on Android</p>
    </header>
    <main>
      <div class="card">
        <h2>Interactive Mobile Counter</h2>
        <div class="counter-display" id="count">0</div>
        <div class="actions">
          <button id="decrement">-</button>
          <button id="reset">Reset</button>
          <button id="increment">+</button>
        </div>
      </div>
    </main>
  </div>
  <script src="app.js"></script>
</body>
</html>`
      },
      {
        path: 'style.css',
        name: 'style.css',
        language: 'css',
        content: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body {
  background: #0c0e14;
  color: #f1f3f9;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
}

.container {
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.logo {
  font-size: 28px;
  font-weight: 700;
  color: #00e5ff;
  letter-spacing: -0.5px;
}

.tagline {
  color: #838ea8;
  font-size: 14px;
  margin-top: 4px;
}

.card {
  background: #171b26;
  border: 1px solid #282f42;
  border-radius: 16px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
}

.card h2 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #d9deec;
}

.counter-display {
  font-size: 64px;
  font-weight: 800;
  color: #00e5ff;
  margin: 16px 0;
}

.actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

button {
  background: #282f42;
  color: #ffffff;
  border: 1px solid #39425a;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

button:active {
  transform: scale(0.95);
  background: #00e5ff;
  color: #06070a;
}`
      },
      {
        path: 'app.js',
        name: 'app.js',
        language: 'javascript',
        content: `// PocketForge Interactive Counter Logic
let count = 0;
const countDisplay = document.getElementById('count');
const incBtn = document.getElementById('increment');
const decBtn = document.getElementById('decrement');
const resetBtn = document.getElementById('reset');

function updateDisplay() {
  countDisplay.textContent = count;
  if (count > 0) countDisplay.style.color = '#00e5ff';
  else if (count < 0) countDisplay.style.color = '#f43f5e';
  else countDisplay.style.color = '#d9deec';
}

incBtn.addEventListener('click', () => {
  count++;
  updateDisplay();
});

decBtn.addEventListener('click', () => {
  count--;
  updateDisplay();
});

resetBtn.addEventListener('click', () => {
  count = 0;
  updateDisplay();
});`
      },
      {
        path: 'README.md',
        name: 'README.md',
        language: 'markdown',
        content: `# HTML/CSS/JavaScript Starter
Created with PocketForge AI on Android.

## Previewing
- In PocketForge, switch to the **Preview** tab.
- Click **"Run Web Sandbox"** for instant offline rendering.`
      }
    ]
  },
  {
    id: 'react',
    name: 'React 18 SPA (Vite)',
    description: 'Modern component-driven single-page React app with fast state hooks and Tailwind-ready CSS.',
    category: 'frontend',
    icon: 'Atom',
    defaultPort: 5173,
    files: [
      {
        path: 'package.json',
        name: 'package.json',
        language: 'json',
        content: `{
  "name": "pocketforge-react-app",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "vite": "^5.4.10"
  }
}`
      },
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App - PocketForge</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
      },
      {
        path: 'src/main.jsx',
        name: 'main.jsx',
        language: 'javascript',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
      },
      {
        path: 'src/App.jsx',
        name: 'App.jsx',
        language: 'javascript',
        content: `import React, { useState } from 'react';

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Install PocketForge PWA on Android', done: true },
    { id: 2, text: 'Start Termux local execution agent', done: true },
    { id: 3, text: 'Build mobile web apps on the go', done: false },
  ]);
  const [input, setInput] = useState('');

  const addTodo = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos([...todos, { id: Date.now(), text: input, done: false }]);
    setInput('');
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  return (
    <div className="app-container">
      <header>
        <h1>⚡ PocketForge React</h1>
        <p>Mobile-first reactive development</p>
      </header>

      <form onSubmit={addTodo} className="todo-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="New task..."
        />
        <button type="submit">Add</button>
      </form>

      <ul className="todo-list">
        {todos.map(t => (
          <li key={t.id} onClick={() => toggleTodo(t.id)} className={t.done ? 'done' : ''}>
            <span>{t.done ? '✓' : '○'}</span>
            <p>{t.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}`
      },
      {
        path: 'src/index.css',
        name: 'index.css',
        language: 'css',
        content: `body {
  margin: 0;
  background: #090a0f;
  color: #f1f3f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 16px;
}

.app-container {
  max-width: 480px;
  margin: 0 auto;
}

header h1 {
  color: #00e5ff;
  font-size: 24px;
  margin-bottom: 4px;
}

header p {
  color: #838ea8;
  font-size: 14px;
  margin-bottom: 20px;
}

.todo-form {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.todo-form input {
  flex: 1;
  background: #171b26;
  border: 1px solid #282f42;
  color: #fff;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 15px;
}

.todo-form button {
  background: #00e5ff;
  color: #06070a;
  border: none;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  background: #11141c;
  border: 1px solid #1f2433;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.todo-list li.done p {
  text-decoration: line-through;
  color: #525d7e;
}`
      },
      {
        path: 'vite.config.js',
        name: 'vite.config.js',
        language: 'javascript',
        content: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
});`
      }
    ]
  },
  {
    id: 'nextjs',
    name: 'Next.js Application',
    description: 'Server and client framework with API routes and page routing.',
    category: 'fullstack',
    icon: 'Layers',
    defaultPort: 3000,
    files: [
      {
        path: 'package.json',
        name: 'package.json',
        language: 'json',
        content: `{
  "name": "pocketforge-nextjs-app",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}`
      },
      {
        path: 'pages/index.js',
        name: 'index.js',
        language: 'javascript',
        content: `import { useState, useEffect } from 'react';

export default function Home() {
  const [data, setData] = useState({ message: 'Loading from API route...' });

  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(setData)
      .catch(err => setData({ message: 'Offline or server error' }));
  }, []);

  return (
    <div style={{ padding: 24, background: '#0a0b10', color: '#fff', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#00e5ff' }}>⚡ Next.js on PocketForge</h1>
      <p style={{ color: '#8b5cf6' }}>API Response: <strong>{data.message}</strong></p>
    </div>
  );
}`
      },
      {
        path: 'pages/api/hello.js',
        name: 'hello.js',
        language: 'javascript',
        content: `export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from PocketForge Next.js API route!',
    timestamp: new Date().toISOString()
  });
}`
      }
    ]
  },
  {
    id: 'node-api',
    name: 'Node.js API Server',
    description: 'Lightweight REST API backend with JSON endpoints, health checks, and CORS.',
    category: 'backend',
    icon: 'Server',
    defaultPort: 4000,
    files: [
      {
        path: 'package.json',
        name: 'package.json',
        language: 'json',
        content: `{
  "name": "pocketforge-node-api",
  "version": "1.0.0",
  "description": "Zero-dependency lightweight Node.js API",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  }
}`
      },
      {
        path: 'server.js',
        name: 'server.js',
        language: 'javascript',
        content: `const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 4000;

const mockDatabase = [
  { id: 1, title: 'Build PocketForge', priority: 'high', done: true },
  { id: 2, title: 'Code on Android phone', priority: 'high', done: true },
  { id: 3, title: 'Export to Linux Mint', priority: 'medium', done: false }
];

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);

  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // Routes
  if (parsed.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
  }

  if (parsed.pathname === '/api/items' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ success: true, items: mockDatabase }));
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Endpoint not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(\`⚡ PocketForge Node API server listening on http://localhost:\${PORT}\`);
});`
      }
    ]
  },
  {
    id: 'python-app',
    name: 'Python Application',
    description: 'Pure Python application with CLI utility, file processing, and unit tests.',
    category: 'python',
    icon: 'Terminal',
    files: [
      {
        path: 'main.py',
        name: 'main.py',
        language: 'python',
        content: `#!/usr/bin/env python3
"""
PocketForge Python Application
Built for Android Termux and Linux Mint
"""
import sys
import platform
import datetime

def main():
    print("=" * 48)
    print(" ⚡ POCKETFORGE PYTHON RUNTIME")
    print("=" * 48)
    print(f" Python Version: {platform.python_version()}")
    print(f" OS Platform:    {platform.system()} ({platform.release()})")
    print(f" Timestamp:      {datetime.datetime.now().isoformat()}")
    print("=" * 48)
    
    # Simple algorithmic demo
    nums = [7, 2, 9, 1, 5, 3]
    sorted_nums = sorted(nums)
    print(f" Original list: {nums}")
    print(f" Sorted list:   {sorted_nums}")
    print(f" Sum:           {sum(nums)}")
    print("=" * 48)

if __name__ == '__main__':
    main()`
      },
      {
        path: 'test_main.py',
        name: 'test_main.py',
        language: 'python',
        content: `import unittest

class TestCalculator(unittest.TestCase):
    def test_math(self):
        self.assertEqual(2 + 2, 4)
        self.assertTrue("pocketforge".upper() == "POCKETFORGE")

if __name__ == '__main__':
    unittest.main()`
      },
      {
        path: 'requirements.txt',
        name: 'requirements.txt',
        language: 'text',
        content: `# PocketForge Python Dependencies`
      }
    ]
  },
  {
    id: 'flask-api',
    name: 'Flask REST API',
    description: 'Python Flask web service with JSON responses, error handlers, and route decorators.',
    category: 'python',
    icon: 'Code2',
    defaultPort: 5000,
    files: [
      {
        path: 'app.py',
        name: 'app.py',
        language: 'python',
        content: `from flask import Flask, jsonify, request
import datetime

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "service": "PocketForge Flask API",
        "timestamp": datetime.datetime.utcnow().isoformat()
    })

@app.route('/api/echo', methods=['POST'])
def echo():
    data = request.get_json() or {}
    return jsonify({
        "received": data,
        "message": "Processed successfully by PocketForge Python engine"
    })

if __name__ == '__main__':
    print("Starting Flask API on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)`
      },
      {
        path: 'requirements.txt',
        name: 'requirements.txt',
        language: 'text',
        content: `flask>=2.3.0`
      }
    ]
  },
  {
    id: 'portfolio',
    name: 'Static Portfolio',
    description: 'Sleek dark-themed personal portfolio showcasing projects, bio, skills, and contact links.',
    category: 'frontend',
    icon: 'User',
    defaultPort: 3000,
    files: [
      {
        path: 'index.html',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Developer Portfolio | PocketForge</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="wrapper">
    <header>
      <div class="avatar">👨‍💻</div>
      <h1>Alex Developer</h1>
      <p class="role">Mobile & Systems Software Engineer</p>
      <div class="badge">Built on Android with PocketForge</div>
    </header>

    <section class="section">
      <h2>Tech Stack</h2>
      <div class="tags">
        <span>TypeScript</span>
        <span>Python</span>
        <span>React</span>
        <span>Termux</span>
        <span>Linux Mint</span>
      </div>
    </section>

    <section class="section">
      <h2>Featured Projects</h2>
      <div class="project-card">
        <h3>PocketForge Mobile AI</h3>
        <p>A full phone-first development environment with local Termux agent execution.</p>
      </div>
    </section>
  </div>
</body>
</html>`
      },
      {
        path: 'style.css',
        name: 'style.css',
        language: 'css',
        content: `body {
  margin: 0;
  background: #08090d;
  color: #f1f3f9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  padding: 24px 16px;
}
.wrapper {
  max-width: 520px;
  margin: 0 auto;
}
header {
  text-align: center;
  margin-bottom: 32px;
}
.avatar {
  font-size: 56px;
  margin-bottom: 12px;
}
h1 {
  font-size: 28px;
  margin: 0 0 4px 0;
  color: #fff;
}
.role {
  color: #00e5ff;
  font-size: 15px;
  margin-bottom: 12px;
}
.badge {
  display: inline-block;
  background: rgba(139, 92, 246, 0.15);
  color: #c084fc;
  border: 1px solid rgba(139, 92, 246, 0.3);
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
}
.section {
  margin-bottom: 28px;
}
h2 {
  font-size: 18px;
  color: #838ea8;
  border-bottom: 1px solid #1f2433;
  padding-bottom: 8px;
  margin-bottom: 16px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tags span {
  background: #171b26;
  border: 1px solid #282f42;
  color: #d9deec;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
}
.project-card {
  background: #11141c;
  border: 1px solid #1f2433;
  padding: 16px;
  border-radius: 12px;
}
.project-card h3 {
  margin: 0 0 6px 0;
  color: #00e5ff;
  font-size: 16px;
}
.project-card p {
  margin: 0;
  color: #838ea8;
  font-size: 14px;
}`
      }
    ]
  },
  {
    id: 'discord-bot',
    name: 'Discord Bot Starter',
    description: 'Node.js Discord bot with slash command structure, event handlers, and token security.',
    category: 'bot',
    icon: 'Bot',
    files: [
      {
        path: 'package.json',
        name: 'package.json',
        language: 'json',
        content: `{
  "name": "pocketforge-discord-bot",
  "version": "1.0.0",
  "description": "Discord.js bot configured for Termux execution",
  "main": "bot.js",
  "scripts": {
    "start": "node bot.js"
  },
  "dependencies": {
    "discord.js": "^14.16.3",
    "dotenv": "^16.4.5"
  }
}`
      },
      {
        path: 'bot.js',
        name: 'bot.js',
        language: 'javascript',
        content: `require('dotenv').config();

// Note: To run this bot in Termux, execute 'npm install' then 'npm start'
console.log('⚡ PocketForge Discord Bot Initializing...');

const token = process.env.DISCORD_BOT_TOKEN;
if (!token || token === 'YOUR_DISCORD_TOKEN_HERE') {
  console.warn('⚠️ DISCORD_BOT_TOKEN not configured in .env file.');
  console.log('Add your bot token to .env before starting in Termux.');
} else {
  console.log('Bot token detected. Ready to connect via discord.js Client.');
}`
      },
      {
        path: '.env.example',
        name: '.env.example',
        language: 'text',
        content: `DISCORD_BOT_TOKEN=YOUR_DISCORD_TOKEN_HERE
CLIENT_ID=YOUR_CLIENT_ID_HERE`
      },
      {
        path: 'README.md',
        name: 'README.md',
        language: 'markdown',
        content: `# Discord Bot Starter
Built with PocketForge on Android Termux.

## Setup
1. Copy \`.env.example\` to \`.env\`
2. Insert your Bot Token from Discord Developer Portal
3. Run in Termux: \`npm install\`
4. Start bot: \`npm start\``
      }
    ]
  }
];

export function createProjectFromTemplate(templateId: TemplateId, projectName: string, description: string = '') {
  const tpl = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];
  const now = new Date().toISOString();
  const files: ProjectFile[] = tpl.files.map((f, i) => ({
    id: 'f_' + Date.now() + '_' + i,
    path: f.path,
    name: f.name,
    content: f.content,
    language: f.language,
    updatedAt: now
  }));

  return {
    id: 'proj_' + Date.now(),
    name: projectName,
    description: description || tpl.description,
    template: templateId,
    createdAt: now,
    updatedAt: now,
    files,
    activeFileId: files[0]?.id
  };
}
