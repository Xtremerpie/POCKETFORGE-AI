# ⚡ POCKETFORGE AI

> **Your phone. Your code. Your own development universe.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Android Termux](https://img.shields.io/badge/Platform-Android%20Termux%20%7C%20Linux%20Mint-green.svg)](#termux-agent)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-purple.svg)](#pwa-support)
[![AI Multi-Agent](https://img.shields.io/badge/AI-Gemini%20%7C%20Groq%20%7C%20OpenRouter-orange.svg)](#multi-agent-system)

---

## 📱 What is PocketForge AI?

**PocketForge AI** is a production-grade, phone-first AI integrated development environment (IDE) crafted to build, edit, test, manage, and export complete web applications, Node.js APIs, Python backends, and Discord bots directly from an **Android smartphone**.

Unlike cloud-locked mobile IDEs or "toy" web editors with simulated runtimes, PocketForge AI pairs a responsive, high-performance Progressive Web Application (PWA) with a **native Android Termux background agent (`pocketforge-agent`)**. This gives your phone real Node.js and Python execution, real Git automation, live local server previewing, and an interactive 4-stage AI agent pipeline (Architect, Coder, Debugger, Tester).

When you're ready to move your work to a desktop, PocketForge includes a **one-click Linux Mint / desktop migration engine** that packages your code with clean dependencies, instructions, and configuration.

---

## 🌟 Key Features

| Feature | Description |
| :--- | :--- |
| **📱 Phone-First Design** | Custom mobile layout with bottom navigation bar, touch-friendly file trees, virtual code keyboard toolbar, and dark graphite cyberpunk aesthetics. |
| **⚡ Termux Execution Daemon** | Lightweight, zero-dependency Node.js daemon running locally on your phone inside Termux for real command execution, server spawning, and tests. |
| **🧠 Multi-Agent AI Studio** | 4 specialized agents: **Architect** (planning), **Coder** (file generation), **Debugger** (error remediation), and **Tester** (running test suites). |
| **🔌 Provider-Agnostic AI** | Native support for Google Gemini (Flash & Pro), Groq (Llama 3.3, Mixtral), and OpenRouter with latency checks, token usage telemetry, and fallback routing. |
| **💾 Offline-First Architecture** | IndexedDB project persistence, service worker offline shell, client-side web sandbox preview, and zero-server code editing. |
| **🐙 Real GitHub Workflows** | Repo creation, listing, commit/push/pull, branch management, and `.gitignore` automation. |
| **👁️ Live Dual Previews** | Instant client-side web sandbox iframe preview (runs offline) + localhost agent dev server preview (Vite, Flask, Express). |
| **🐧 Linux Mint Migration** | Auto-clean export bundles stripping `node_modules` and secrets, with tailored `apt-get` setup guides and start scripts. |
| **🛡️ Ironclad Security** | Token-based local agent pairing, strict path traversal guards (`..` blocking), mandatory AI command approval checkpoints, and safe export sanitation. |

---

## 🏗️ Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │        ANDROID SMARTPHONE            │
                      │                                      │
                      │  ┌────────────────────────────────┐  │
                      │  │   PocketForge AI (PWA / Web)   │  │
                      │  │   React + TypeScript + Vite    │  │
                      │  │   CodeMirror 6 + Tailwind CSS  │  │
                      │  │   IndexedDB Project Storage    │  │
                      │  └───────────────▲────────────────┘  │
                      │                  │ Localhost REST    │
                      │                  │ Bearer Token Auth │
                      │  ┌───────────────▼────────────────┐  │
                      │  │   Termux Local Agent Daemon    │  │
                      │  │   (pocketforge-agent.js)       │  │
                      │  │   - Node.js & Python runtimes  │  │
                      │  │   - Local dev servers & ports  │  │
                      │  │   - Process manager & Git CLI  │  │
                      │  └────────────────────────────────┘  │
                      └──────────────────┬───────────────────┘
                                         │
               ┌─────────────────────────┼─────────────────────────┐
               ▼                         ▼                         ▼
   ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────────────┐
   │    AI Providers       │ │     GitHub Cloud      │ │   Linux Mint Export   │
   │ Gemini / Groq / Router│ │ Repos, Commits, Sync  │ │ Clean ZIP + apt setup │
   └───────────────────────┘ └───────────────────────┘ └───────────────────────┘
```

---

## 🚀 Quick Start (Under 3 Minutes)

### 1. Launch the Web PWA
Run the web application on your local machine or phone browser:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` on your Android device (or via Chrome/Firefox). You can tap **"Install"** or **"Add to Home screen"** to use it as a native standalone PWA.

### 2. Start the Android Termux Agent
In the Termux app on your phone:
```bash
# 1. Install prerequisites
pkg update && pkg install -y nodejs-lts python git

# 2. Run the agent
node agent/pocketforge-agent.js
```
The agent outputs:
```
======================================================
 🔥 POCKETFORGE AI LOCAL AGENT (v1.0.0)
 Status:     ONLINE
 Agent URL:  http://127.0.0.1:8765
 Auth Token: pf_sec_e8b420f17a94c1e...
======================================================
```

### 3. Connect & Pair
In the PocketForge web app, navigate to **Settings** or **Terminal**, input your **Agent URL** (`http://127.0.0.1:8765`) and **Auth Token**, and tap **"Pair Agent"**. You're now connected with real phone execution!

---

## 📁 Repository Structure

```
├── agent/                        # Termux / Linux local execution daemon
│   ├── pocketforge-agent.js      # Zero-dependency Node.js HTTP server
│   ├── package.json              # Agent metadata
│   ├── setup-termux.sh           # Automated Termux installation script
│   ├── install.sh                # Linux / Mint installer
│   └── test-agent.js             # Automated agent test suite
├── src/                          # Mobile PWA Frontend
│   ├── components/               # UI components
│   │   ├── layout/               # Mobile bottom bar, desktop sidebar
│   │   ├── dashboard/            # System & project telemetry
│   │   ├── projects/             # Project CRUD & 8 templates
│   │   ├── editor/               # CodeMirror 6 touch editor & virtual bar
│   │   ├── terminal/             # Local agent execution & approval modal
│   │   ├── ai/                   # AI Studio & 4-Agent workflow
│   │   ├── preview/              # Sandbox & local server preview
│   │   ├── github/               # Git commit, repo & sync manager
│   │   ├── deployment/           # Vercel, Netlify & Pages readiness
│   │   └── linux-mint/           # Linux Mint export engine
│   ├── services/                 # Business logic & APIs
│   │   ├── db.ts                 # IndexedDB storage engine
│   │   ├── templates.ts          # 8 full working template structures
│   │   ├── agentClient.ts        # Agent REST client
│   │   ├── aiProviders.ts        # Gemini, Groq, OpenRouter adapters
│   │   ├── multiAgent.ts         # Architect, Coder, Debugger, Tester
│   │   ├── githubClient.ts       # GitHub REST client
│   │   ├── zipService.ts         # Project ZIP packager & unzipper
│   │   └── security.ts           # Path validator & secret scrubber
│   ├── hooks/                    # Reactive state hooks
│   ├── types/                    # Full TypeScript typings
│   ├── App.tsx                   # Main state & view router
│   ├── main.tsx                  # React DOM entry
│   └── index.css                 # Cyberpunk Tailwind styling
├── public/                       # PWA assets & Service Worker
├── README.md                     # Project overview
├── INSTALLATION.md               # Complete installation manual
├── ANDROID_SETUP.md              # Android phone configuration
├── TERMUX_SETUP.md               # Termux setup instructions
├── LINUX_MINT_SETUP.md           # Desktop migration guide
├── AI_CONFIGURATION.md           # Gemini, Groq & OpenRouter setup
├── GITHUB_SETUP.md               # Git & GitHub PAT setup
├── SECURITY.md                   # Threat model & security controls
├── ARCHITECTURE.md               # Architectural design document
└── TROUBLESHOOTING.md            # Common issues & fixes
```

---

## 📄 License
Released under the permissive [MIT License](LICENSE). Built for the global developer community.
#   P O C K E T F O R G E - A I  
 