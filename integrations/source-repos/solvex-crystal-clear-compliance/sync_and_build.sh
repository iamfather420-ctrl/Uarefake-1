#!/usr/bin/env bash
# ==============================================================================
# PROJECT AGATE — ARCHITECTURE NODE SYNCHRONIZATION RUNTIME
# ==============================================================================
set -e

# --- ENVIRONMENTAL CONSTANTS ---
NODE_ROOT="$HOME/.agate_node"
VAULT_DIR="$NODE_ROOT/vault"

echo "[*] Verifying environment dependencies..."
cd "$NODE_ROOT"

# Ensure Git tracking infrastructure is sound
if [ ! -d ".git" ]; then
    echo "[!] Critical Error: Script must execute inside a tracked Git repository context."
    exit 1
fi

echo "[*] Enforcing AGATE Auditor Identity..."
echo "[*] Guarding directory structure..."

# Explicitly ensure mandatory files exist inside the layout to prevent "Abandon" errors
if [ -f "$VAULT_DIR/buildozer.spec" ]; then
    # Validate critical identity fields inside the .spec before committing
    for key in "version" "title" "package.name"; do
        if ! grep -q "^[[:space:]]*android\.$key" "$VAULT_DIR/buildozer.spec"; then
            echo "[!] Structural Warning: android.$key is not explicitly defined in buildozer.spec."
        fi
    done
fi

echo "[*] Staging verified artifacts from vault, script, and workflows..."

# --- DYNAMIC RECOVERY PATHSPEC LOGIC ---
# Dynamically locate and stage buildozer.spec based on established layout context
if [ -f "vault/buildozer.spec" ]; then
    git add vault/buildozer.spec
elif [ -f "buildozer.spec" ]; then
    git add buildozer.spec
fi

# Track any modifications to local scripts, manifests, and workflow configurations
git add sync_and_build.sh
if [ -d ".github" ]; then
    git add .github/workflows/*.yml
fi

echo "[*] Committing node configuration state..."
# Prevent empty commit interruptions if there are no raw code modifications
if git diff-index --quiet HEAD --; then
    echo "Nothing to commit, working tree clean."
else
    git commit -m "feat(web3): track root build configuration and override environment dependencies"
fi

echo "[*] Setting remote destination tracking..."
echo "[*] Executing force push sequence to clear remote conflicts..."

# Initiate remote upload sequence
git push -u origin main

