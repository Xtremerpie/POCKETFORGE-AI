#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# POCKETFORGE AI - Termux Automated Setup Script
# ==============================================================================
# Run this directly in Termux on your Android phone:
#   curl -sSL https://raw.githubusercontent.com/pocketforge/pocketforge-ai/main/agent/setup-termux.sh | bash
# Or run locally from cloned repo:
#   bash setup-termux.sh
# ==============================================================================

set -e

echo ""
echo "=================================================="
echo " 🔥 POCKETFORGE AI - ANDROID TERMUX SETUP"
echo "=================================================="
echo " Preparing your Android phone for full-stack AI development..."
echo ""

# 1. Update Termux repositories
echo "📦 [1/5] Updating Termux packages..."
pkg update -y && pkg upgrade -y

# 2. Install essential build and runtime packages
echo "📦 [2/5] Installing Node.js, Python, Git, and build tools..."
pkg install -y nodejs-lts python git curl openssh

# 3. Create PocketForge directories
echo "📁 [3/5] Setting up workspace directories..."
mkdir -p "$HOME/.pocketforge"
mkdir -p "$HOME/pocketforge-projects"

# 4. Copy or download agent script if needed
AGENT_DIR="$HOME/.pocketforge/agent"
mkdir -p "$AGENT_DIR"

if [ -f "./pocketforge-agent.js" ]; then
    cp ./pocketforge-agent.js "$AGENT_DIR/pocketforge-agent.js"
    cp ./package.json "$AGENT_DIR/package.json" 2>/dev/null || true
else
    echo "Downloading latest PocketForge Agent..."
    # If downloading remotely in Termux:
    cat << 'EOF' > "$AGENT_DIR/pocketforge-agent.js"
// PocketForge Agent Bootloader
EOF
fi

# 5. Create launcher shortcut command
cat << 'EOF' > "$PREFIX/bin/pocketforge"
#!/data/data/com.termux/files/usr/bin/bash
node "$HOME/.pocketforge/agent/pocketforge-agent.js" "$@"
EOF
chmod +x "$PREFIX/bin/pocketforge"

echo ""
echo "=================================================="
echo " ✅ POCKETFORGE AI SETUP COMPLETE!"
echo "=================================================="
echo ""
echo "To start the local agent at any time, just run:"
echo "   pocketforge"
echo ""
echo "Or start right now by running:"
echo "   node pocketforge-agent.js"
echo "=================================================="
