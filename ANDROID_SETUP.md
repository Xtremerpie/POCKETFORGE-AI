# 📱 Android Setup Guide for PocketForge AI

PocketForge AI turns any Android phone into a full-stack development environment without needing root access.

---

## 🛠️ Step 1: Termux Installation & Permissions

### 1. Source Download
- Download Termux APK from **F-Droid** ([f-droid.org/packages/com.termux](https://f-droid.org/packages/com.termux/)) or **GitHub Releases**.
- *Warning:* Do not use Google Play Store versions; updates there were halted due to SDK target restrictions.

### 2. Grant Storage Permission (Optional)
If you wish to allow Termux to access shared phone storage (`/sdcard/Download`, etc.):
```bash
termux-setup-storage
```
Grant permission on the prompt.

### 3. Disable Battery Optimization
Android kills background processes aggressively to preserve battery. For your development servers to stay alive while switching tabs:
1. Open phone **Settings** -> **Apps** -> **Termux**.
2. Tap **Battery** -> select **"Unrestricted"** or **"Don't optimize"**.
3. In Termux notification, tap **"Acquire Wakelock"** when running long dev servers.

---

## ⚡ Step 2: Setting Up the Runtimes

Inside Termux, execute:

```bash
# Update repo lists
pkg update -y && pkg upgrade -y

# Install Node.js LTS, Python, Git, and OpenSSH
pkg install -y nodejs-lts python git curl openssh-sftp-server

# Verify installations
node -v
python --version
git --version
```

---

## 🚀 Step 3: Launching the Local Agent

```bash
# Clone the repository
git clone https://github.com/pocketforge/pocketforge-ai.git
cd pocketforge-ai/agent

# Start agent daemon
node pocketforge-agent.js
```

### Keeping the Agent Running in Background
You can run the agent in the background or use `tmux`:
```bash
pkg install tmux -y
tmux new -s pocketforge
node pocketforge-agent.js
# Detach with: Ctrl+B then D
```

---

## 🌐 Step 4: Installing the PocketForge PWA

1. Open Chrome or Firefox on your phone.
2. Navigate to your PocketForge URL (e.g. `http://localhost:5173` if running on phone, or your deployed PWA URL).
3. Tap **Menu (⋮)** -> **"Add to Home screen"** or **"Install application"**.
4. PocketForge will now open in fullscreen standalone mode without browser chrome, functioning like a native Android app!
