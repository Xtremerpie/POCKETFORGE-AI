# 📦 POCKETFORGE AI - Complete Installation Guide

This manual covers step-by-step setup instructions for Android phones, Linux Mint, Ubuntu/Debian, macOS, and Windows.

---

## 📋 System Requirements

| Environment | Minimum | Recommended |
| :--- | :--- | :--- |
| **Android OS** | Android 7.0 (Nougat) | Android 10+ (Termux full support) |
| **Android RAM** | 2 GB | 4 GB+ |
| **Android Storage**| 500 MB free | 2 GB free (for Node packages/Python) |
| **Desktop OS** | Linux Mint 21+, Ubuntu 22.04+, Windows 10/11, macOS 12+ | Linux Mint 22 (Cinnamon) |
| **Desktop RAM** | 4 GB | 8 GB+ |
| **Node.js** | v18.0.0+ | v20 LTS or v22 LTS |
| **Browser** | Chrome Mobile 100+, Firefox Mobile 100+, Edge Mobile | Any Chromium or Gecko browser |

---

## 📱 Method 1: Android Setup (Phone-Only)

PocketForge is specifically engineered to run directly on your smartphone. Follow these 3 steps:

### Step 1: Install Termux
> [!IMPORTANT]
> **Do not install Termux from Google Play Store** (that build is deprecated).
> Install Termux from **F-Droid** or the official **GitHub Releases**:
> - F-Droid: [https://f-droid.org/packages/com.termux/](https://f-droid.org/packages/com.termux/)
> - GitHub Releases: [https://github.com/termux/termux-app/releases](https://github.com/termux/termux-app/releases)

### Step 2: Install Packages in Termux
Open Termux and run:
```bash
pkg update -y
pkg install -y nodejs-lts python git curl openssh
```

### Step 3: Run the PocketForge Local Agent
Navigate to your preferred directory and run:
```bash
# Clone the repository
git clone https://github.com/pocketforge/pocketforge-ai.git
cd pocketforge-ai/agent

# Start the agent
node pocketforge-agent.js
```
The agent will initialize, bind to `http://127.0.0.1:8765`, and output your unique pairing token:
```
======================================================
 🔥 POCKETFORGE AI LOCAL AGENT (v1.0.0)
 Status:     ONLINE
 Agent URL:  http://127.0.0.1:8765
 Auth Token: pf_sec_38c92a10bf...
======================================================
```

### Step 4: Open the PWA in your Mobile Browser
In Chrome or Firefox on your phone, open the PocketForge web app.
Tap the three dots `⋮` in Chrome and choose **"Install app"** or **"Add to Home screen"**.

Go to **Terminal** or **Settings**, enter the Agent URL and Token, and tap **"Pair Agent"**.

---

## 🐧 Method 2: Linux Mint / Ubuntu Desktop Setup

To run or develop PocketForge on Linux Mint:

### 1. Install System Dependencies
```bash
sudo apt update
sudo apt install -y nodejs npm python3 python3-pip python3-venv git curl
```

### 2. Verify Node.js Version
```bash
node -v   # Should be v18+
npm -v
```

### 3. Install & Start Web App
```bash
git clone https://github.com/pocketforge/pocketforge-ai.git
cd pocketforge-ai

npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

### 4. Start Local Agent (Optional for Desktop Shell Execution)
In a separate terminal tab:
```bash
cd agent
node pocketforge-agent.js
```

---

## 🪟 Method 3: Windows Setup

### 1. Prerequisites
- Node.js LTS (v20+ recommended) from [nodejs.org](https://nodejs.org)
- Git for Windows from [gitforwindows.org](https://gitforwindows.org)
- Python 3.10+ (optional for Python templates)

### 2. Install Dependencies & Run
In PowerShell:
```powershell
git clone https://github.com/pocketforge/pocketforge-ai.git
cd pocketforge-ai
npm install
npm run dev
```

---

## 🧪 Verifying Installation

To ensure both web app and local agent are operating normally:

```bash
# Run unit tests
npm test

# Test the local agent daemon
node agent/test-agent.js
```
All tests should report `PASS`.
