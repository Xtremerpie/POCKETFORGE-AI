# 🐧 Linux Mint Setup & Project Transfer Guide

PocketForge AI makes moving projects from your Android phone to **Linux Mint** (or any desktop Linux distribution) seamless, clean, and instant.

---

## 📦 How Linux Mint Export Works

In PocketForge, you can export your project specifically prepared for Linux Mint by navigating to:
**Dashboard** -> **Linux Mint Transfer** -> Click **"Export Linux Mint Bundle (.zip)"**.

### What gets included:
- Full source code
- `package.json` or `requirements.txt`
- Project configuration files
- Auto-generated `LINUX_MINT_README.md` containing exact installation commands
- Pre-configured shell startup script `run-linux.sh`

### What gets excluded (to save phone bandwidth and prevent corruption):
- `node_modules/` (heavy binary modules must be built for Linux x86_64)
- `.venv/` (Python virtual environments are platform-specific)
- Secret `.env` files (protects your API keys)
- `.git/` cache files

---

## 🛠️ Setting up Linux Mint (First Time)

If you have a fresh installation of Linux Mint (e.g. Linux Mint 21 or 22 Cinnamon / MATE / Xfce):

### 1. Open Terminal (`Ctrl + Alt + T`)

### 2. Install Development Tools
Run this single command:
```bash
sudo apt update && sudo apt install -y \
  nodejs \
  npm \
  python3 \
  python3-pip \
  python3-venv \
  git \
  curl \
  unzip \
  build-essential
```

### 3. Verify Runtimes
```bash
node -v      # v18.x or newer
npm -v
python3 -V   # Python 3.10+
git --version
```

---

## 🚚 Importing & Running Your Phone Project on Linux Mint

### Method A: Transfer via USB or Local Network
1. On your phone in PocketForge, tap **"Export Linux Mint Bundle (.zip)"**.
2. Transfer the `.zip` file to your Linux Mint computer via USB cable, LocalSend, KDE Connect, or Google Drive.
3. In Linux Mint Terminal:
   ```bash
   cd ~/Downloads
   unzip my-pocketforge-project.zip -d ~/Projects/my-pocketforge-project
   cd ~/Projects/my-pocketforge-project
   ```

### Method B: Start the Project
Depending on the project type:

#### For React / Next.js / Node.js Projects:
```bash
npm install
npm run dev
```
Open `http://localhost:5173` or `http://localhost:3000` in your Linux Mint browser (Firefox / Chrome).

#### For Python / Flask Projects:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

### Method C: One-Click Startup Script
The exported bundle includes a helper script:
```bash
chmod +x run-linux.sh
./run-linux.sh
```
This automatically detects whether the project is Node.js or Python, installs missing packages, and boots the development server!

---

## 🐙 Syncing with Git Between Phone & Linux Mint

To keep your phone and Linux Mint computer synchronized without manual file transfers:
1. Push your changes from PocketForge on Android to a private GitHub repository.
2. In Linux Mint:
   ```bash
   git clone https://github.com/your-username/my-project.git
   ```
3. Pull updates anytime:
   ```bash
   git pull origin main
   ```
