#!/usr/bin/env bash
# ==============================================================================
# POCKETFORGE AI - Linux / Linux Mint Setup & Daemon Installer
# ==============================================================================

set -e

echo "=================================================="
echo " 🔥 POCKETFORGE AI - LINUX / DESKTOP SETUP"
echo "=================================================="

# Detect package manager
if command -v apt-get >/dev/null 2>&1; then
    echo "📦 Detected APT (Linux Mint / Ubuntu / Debian). Installing prerequisites..."
    sudo apt-get update
    sudo apt-get install -y nodejs npm python3 python3-pip python3-venv git curl
elif command -v dnf >/dev/null 2>&1; then
    echo "📦 Detected DNF (Fedora / RHEL). Installing prerequisites..."
    sudo dnf install -y nodejs npm python3 python3-pip git curl
elif command -v pacman >/dev/null 2>&1; then
    echo "📦 Detected Pacman (Arch Linux). Installing prerequisites..."
    sudo pacman -Sy --noconfirm nodejs npm python python-pip git curl
fi

mkdir -p "$HOME/.pocketforge"
mkdir -p "$HOME/pocketforge-projects"

echo ""
echo "✅ Prerequisites installed."
echo "Starting PocketForge Local Agent on Linux..."
node ./pocketforge-agent.js
