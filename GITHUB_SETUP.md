# 🐙 GitHub Integration Setup Guide

PocketForge AI integrates with GitHub through two distinct operational paths:

1. **Direct GitHub REST API:** For lightweight operations (listing repos, creating repos, reading commits, pushing file trees) directly from your phone browser without needing git binaries.
2. **Termux Local Git Agent:** For full git branch management, merge conflict resolution, detached commits, and local repository cloning.

---

## 🔑 Creating a GitHub Personal Access Token (PAT)

PocketForge connects to GitHub securely using a Fine-Grained Personal Access Token or Classic PAT.

### Recommended: Fine-Grained Token
1. Go to **GitHub Settings** -> **Developer Settings** -> **Personal Access Tokens** -> **Fine-grained tokens** ([github.com/settings/tokens?type=beta](https://github.com/settings/tokens?type=beta)).
2. Click **"Generate new token"**.
3. Set **Token name:** `PocketForge Android`.
4. Set **Expiration:** 90 days (or your preference).
5. Repository access: Select **"All repositories"** or select specific repositories.
6. Grant Permissions:
   - **Contents:** Read and write (Allows creating files, committing, pushing).
   - **Metadata:** Read-only (Required).
   - **Administration:** Read and write (Optional: required only if you want PocketForge to create new repos).
7. Tap **"Generate token"** and copy the string (starts with `github_pat_...`).

---

## 📲 Pairing with PocketForge

1. Open PocketForge on your phone.
2. Navigate to the **GitHub** tab.
3. Paste your Personal Access Token.
4. Tap **"Connect GitHub"**.
5. Your profile badge and repository feed will appear instantly!

---

## 🚀 Common Workflows

### 1. Push Current Project to GitHub
1. In the **GitHub** tab, tap **"Initialize Git Repository"** (if not already a git repository).
2. Choose **"Create New GitHub Repo"** or link to an existing repo.
3. Review changed files in the status panel.
4. Type a commit message and tap **"Commit & Push"**.

### 2. Clone a Repository into PocketForge
1. Open the **GitHub** tab and tap **"Clone Repository"**.
2. Select one of your repositories from the dropdown list or paste a clone URL.
3. The Termux local agent will execute `git clone` into your project directory.
4. PocketForge automatically opens the cloned project in the Project Manager and Editor!

---

## 🛡️ Security Protections

- Your GitHub token is stored solely in browser encrypted local storage.
- It is never transmitted to any third-party analytics or server.
- The `.gitignore` generator automatically includes sensitive keys and logs (`.env`, `*.pem`, `node_modules/`, `build/`).
