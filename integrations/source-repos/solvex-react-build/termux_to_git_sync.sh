#!/usr/bin/env bash
# ==============================================================================
# PROJECT AGATE: 3-WAY TERMUX FORENSIC PARITY SYNC
# Script: ./termux_to_git_sync.sh
# Purpose: Ingest Termux target artifacts into the local build context and enforce Github synchronization.
# ==============================================================================

set -e

TERMUX_NODE="$HOME/.agate_node"
WORKSPACE_DIR="$HOME/agate-core-build"

# Ensure we are operating inside the repository
if [ ! -d "$WORKSPACE_DIR" ]; then
    echo "[ERROR] Repository directory not found at $WORKSPACE_DIR"
    exit 1
fi

cd "$WORKSPACE_DIR"

echo "=== [1/3] VERIFYING TERMUX NODE PARITY ==="
if [ -d "$TERMUX_NODE" ]; then
    echo "[STATUS] Termux Sovereign Node detected at $TERMUX_NODE."
    echo "[STATUS] Ingesting modified data from Termux into local build context..."

    # Sync vault (Consensus Memory / Shared Ledger)
    if [ -d "$TERMUX_NODE/vault" ]; then
        mkdir -p "$WORKSPACE_DIR/consensus-vault"
        cp -rf "$TERMUX_NODE/vault/"* "$WORKSPACE_DIR/consensus-vault/" 2>/dev/null || true
        echo "[STATUS] Consensus Vault synchronized from Termux."
    fi

    # Sync core (Freedom SIM AI OS)
    if [ -d "$TERMUX_NODE/core" ]; then
        mkdir -p "$WORKSPACE_DIR/os-core"
        cp -rf "$TERMUX_NODE/core/"* "$WORKSPACE_DIR/os-core/" 2>/dev/null || true
        echo "[STATUS] OS Core synchronized from Termux."
    fi

    # Sync pipeline (SolveX Pipeline)
    if [ -d "$TERMUX_NODE/pipeline" ]; then
        mkdir -p "$WORKSPACE_DIR/security-pipeline"
        cp -rf "$TERMUX_NODE/pipeline/"* "$WORKSPACE_DIR/security-pipeline/" 2>/dev/null || true
        echo "[STATUS] Security Pipeline synchronized from Termux."
    fi
else
    echo "[WARNING] Termux node ($TERMUX_NODE) not found. Assuming local pipeline is the current true baseline."
    echo "[STATUS] Proceeding to Git parity stage..."
fi

echo "=== [2/3] RESOLVING PENDING GIT STATES ==="
git merge --abort >/dev/null 2>&1 || true
git rebase --abort >/dev/null 2>&1 || true
git fetch origin

echo "=== [3/3] ENFORCING FORENSIC GITHUB PUSH ==="
git add -A

# Commit if there are active changes between Termux ingestion and local repo tracking
if ! git diff-index --quiet HEAD; then
    echo "[STATUS] Detected structural delta. Committing 3-way parity alignment..."
    git commit -m "[SolveX] Forensic Override: 3-way parity sync (Termux -> Local -> GitHub)" || true
else
    echo "[STATUS] No delta detected post-ingestion. Proceeding to force current state push."
fi

echo "[STATUS] Pushing consensus state to Origin..."
if ! git pull origin main --rebase; then
    echo "[WARNING] Rebase conflict detected. Aborting rebase to preserve local Termux truth hierarchy."
    git rebase --abort >/dev/null 2>&1 || true
fi

# Force push parity upwards to establish absolute network synchronization
git push origin main --force

echo "================================================================================"
echo "[SUCCESS] Project Agate 3-Way Sync Complete."
echo "[STATUS] Protocol Enforced: Local build mirrors Termux. Remote Origin mirrors Local."
echo "================================================================================"
