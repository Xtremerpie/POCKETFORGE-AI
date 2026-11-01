# 📱 Termux Setup & Operation Guide

This guide details how to run the PocketForge AI execution engine inside Termux on Android.

---

## 📥 Why Termux?

Android browser sandboxes prevent web applications from directly executing arbitrary shell commands, compiling code, or binding system ports without an intermediary. 

PocketForge AI uses an **honest, production architecture**:
1. The **PWA UI** runs smoothly in your browser or installed standalone app (low RAM, hardware accelerated UI).
2. The **Local Agent (`pocketforge-agent.js`)** runs in your local Termux environment on `127.0.0.1:8765`.
3. They communicate over local, token-authenticated HTTP/JSON requests.

---

## 🛠️ Detailed Setup Walkthrough

### 1. Download & Install Termux
Do not use Google Play. Install from F-Droid:
- F-Droid link: https://f-droid.org/packages/com.termux/

### 2. Initial Termux Setup
Open Termux and run:
```bash
pkg update -y
pkg install -y nodejs-lts python git curl openssh
```

### 3. Clone or Download the Agent
```bash
git clone https://github.com/pocketforge/pocketforge-ai.git
cd pocketforge-ai/agent
```
Or run the automated setup script:
```bash
bash setup-termux.sh
```

### 4. Start the Agent
```bash
node pocketforge-agent.js
```
You will see:
```text
======================================================
 🔥 POCKETFORGE AI LOCAL AGENT (v1.0.0)
 Status:     ONLINE
 Agent URL:  http://127.0.0.1:8765
 Workspace:  /data/data/com.termux/files/home/pocketforge-projects
 Platform:   android (Android Termux)
 Auth Token: pf_sec_xxxxxxxxxxxxxxxxxxxxxxxx
======================================================
```

### 5. Pair with PocketForge
1. In the PocketForge UI, go to **Terminal** or **Settings**.
2. If the status says `Offline`, enter:
   - **Agent Host:** `http://127.0.0.1:8765`
   - **Auth Token:** *Copy the token displayed in Termux*
3. Tap **"Pair Agent"**.
4. The status pill will change to green: `● Termux Connected`.

---

## ⚡ Starting Development Servers in Termux

Once connected, you can run any dev server from the **Terminal** tab or through the **Project Manager**:

### Run a Node.js / React project:
```bash
npm install
npm run dev
```

### Run a Python / Flask project:
```bash
pip install flask
python app.py
```

### Previewing the Dev Server:
In the **Preview** tab, select **"Local Agent Server"** and enter the port (e.g. `5173` for Vite, `5000` for Flask, `3000` for Express). The live site will render directly inside PocketForge!

---

## 🔋 Preventing Android from Killing Termux

Android battery managers may terminate background tasks after a few minutes. To keep servers running:
1. Swipe down the Android notification shade.
2. Locate the **Termux** notification and tap **"Acquire Wakelock"**.
3. In Android Settings -> Apps -> Termux -> Battery -> set to **Unrestricted**.
