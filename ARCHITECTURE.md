# 🏛️ POCKETFORGE AI - Architecture & Design Decisions

This document details the architectural choices, system modules, data flows, and performance considerations behind PocketForge AI.

---

## 🎯 Architecture Decision: Vite + React SPA vs. Next.js

A critical design requirement is providing maximum responsiveness on **low RAM (2GB - 4GB) Android devices** with offline capability.

### Why Vite + React SPA was chosen:
1. **Zero Phone Server Overhead:** Next.js requires either a persistent Node.js SSR runtime or a complex static generation pipeline. Running a heavy Node server just to serve the editor UI consumes 150MB - 350MB of precious phone RAM.
2. **Instant Offline PWA:** A client-side Single Page Application (SPA) built with Vite and packaged with a Service Worker caches completely on the phone. Once loaded, the entire IDE boots in under 1 second without internet or server execution.
3. **Dedicated Termux Agent:** Instead of running the IDE inside a monolithic server, PocketForge cleanly isolates the execution layer into `pocketforge-agent.js`—a tiny 15MB daemon that only wakes up when dev servers or commands are needed.
4. **Lightweight Component Tree:** React 18+ paired with Tailwind CSS compiles into minimal, tree-shaken static assets under 400KB compressed.

---

## 🏗️ Core Modules

```
┌─────────────────────────────────────────────────────────────┐
│                      POCKETFORGE UI                         │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│  Dashboard  │  Projects   │ Code Editor │     AI Studio     │
│ (Telemetry) │  (8 Stacks) │(CodeMirror6)│  (4-Agent Engine) │
├─────────────┼─────────────┼─────────────┼───────────────────┤
│  Terminal   │Live Preview │   GitHub    │ Linux Mint Transfer│
│ (Local Exec)│(Dual Mode)  │ (REST & Git)│  (Export Engine)  │
└──────┬──────┴──────┬──────┴──────┬──────┴─────────┬─────────┘
       │             │             │                │
       ▼             ▼             ▼                ▼
┌──────────────┬──────────────┬──────────────┬────────────────┐
│  IndexedDB   │  Web Sandbox │ Octokit REST │ Termux Agent   │
│ Persistence  │ Client Runner│   API Sync   │ (Local Daemon) │
└──────────────┴──────────────┴──────────────┴────────────────┘
```

---

## 💾 Storage Engine: Client-Side IndexedDB

PocketForge stores all project files, directories, git metadata, and drafts in the browser's high-speed **IndexedDB** engine:
- **Persistence:** Survived browser reloads and app restarts.
- **Quota:** Modern mobile browsers allocate gigabytes of local storage to PWAs.
- **Syncing:** Changes can be synced bidirectionally with the Termux filesystem on demand.

---

## 📝 Code Editor: CodeMirror 6 over Monaco

Monaco Editor (used in desktop VS Code) is notoriously heavy for mobile browsers:
- Monaco bundle size: ~4MB+ uncompressed.
- Monaco DOM nodes & memory: High memory consumption leading to Android browser tab crashes.
- CodeMirror 6 is modular, mobile-first, provides seamless touch gestures, virtual keyboard support, and uses less than 15% of Monaco's memory footprint!

---

## 🔄 Dual Live Preview Engine

1. **Client-Side Web Sandbox (Offline Mode):**
   - For HTML/CSS/JS and static React templates.
   - Compiles and injects code directly into a sandboxed `<iframe>` with blob URLs.
   - Zero Termux agent or internet required.
2. **Termux Local Dev Server (Full-Stack Mode):**
   - For Node.js Express, Vite dev servers, Flask, and Python scripts.
   - Termux agent launches the dev server on a designated local port (e.g. `localhost:3000`).
   - The preview frame connects directly to the local port with hot reload and console log capturing.

---

## 🧠 4-Stage Multi-Agent AI Workflow

```
[User Request]
       │
       ▼
[1. ARCHITECT AGENT]
  - Analyzes problem statement
  - Generates file architecture & tech stack
  - Produces sequential development checklist
       │
       ▼ (Explicit User Approval Checkpoint)
[2. CODER AGENT]
  - Generates complete code for required files
  - Follows established architectural conventions
       │
       ├───> [Error Detected?] ───> [3. DEBUGGER AGENT]
       │                                - Pinpoints stack trace
       │                                - Creates surgical patch
       ▼
[4. TESTER AGENT]
  - Generates unit test cases
  - Commands Termux Agent to execute `npm test` or `pytest`
  - Streams real terminal exit code & results
       │
       ▼
[Final Review & Merge into Project]
```
