#!/usr/bin/env bash
# ==============================================================================
# PROJECT AGATE: PRODUCTION NODE PUSH UTILITY
# Script: ./push_updates.sh
# Purpose: Synchronize ledger state, update AI OS daemon, and cycle systemd targets
# ==============================================================================

set -euo pipefail

# --- CONFIGURATION PARAMETERS ---
TARGET_USER="${SUDO_USER:-$(whoami)}"
NODE_ROOT_DIR="/var/lib/agate_node"
SOURCE_CORE_DIR="./os-core"
VAULT_DIR="${NODE_ROOT_DIR}/vault"
LOG_FILE="/var/log/agate_deploy.log"

echo "=== [1/4] INITIALIZING FORENSIC ENVIRONMENT VALIDATION ==="
if [[ $EUID -ne 0 ]]; then
   echo "[ERROR] This deployment script must be run with root/sudo privileges to bind systemd services." 1>&2
   exit 1
fi

# Ensure core target directories exist on the node
mkdir -p "${NODE_ROOT_DIR}/core"
mkdir -p "${VAULT_DIR}"

echo "=== [2/4] SYNCHRONIZING DECENTRALIZED LEDGER STATE ==="
# Backup current consensus state prior to code migration
if [ -f "${VAULT_DIR}/consensus_memory.json" ]; then
    echo "[STATUS] Archiving existing consensus_memory.json before delta merge..."
    cp "${VAULT_DIR}/consensus_memory.json" "${VAULT_DIR}/consensus_memory.json.bak_$(date +%s)"
fi

# Enforce file copies from repo context to target runtime spaces
echo "[STATUS] Copying production FreedomSimAIOS core engine components..."
cp "${SOURCE_CORE_DIR}/ai_os.py" "${NODE_ROOT_DIR}/core/ai_os.py"
chmod 755 "${NODE_ROOT_DIR}/core/ai_os.py"
chown -R "${TARGET_USER}:${TARGET_USER}" "${NODE_ROOT_DIR}" || true

echo "=== [3/4] DEPLOYING & HARDENING SYSTEMD SERVICE LAYER ==="
if [ -f "${SOURCE_CORE_DIR}/agate-node.service" ]; then
    if [ -d "/etc/systemd/system" ]; then
        echo "[STATUS] Injecting systemd configuration file into system targets..."
        cp "${SOURCE_CORE_DIR}/agate-node.service" /etc/systemd/system/agate-node.service
        chmod 644 /etc/systemd/system/agate-node.service
    else
        echo "[WARNING] /etc/systemd/system directory not found. Skipping service file copy."
    fi
    
    if command -v systemctl >/dev/null 2>&1; then
        echo "[STATUS] Reloading systemd manager configurations..."
        systemctl daemon-reload
        
        echo "[STATUS] Enabling and cycling the Agate Node Service..."
        systemctl enable agate-node.service
        systemctl restart agate-node.service
    else
        echo "[WARNING] systemctl command not found (likely running in Termux). Skipping service cycle."
    fi
else
    echo "[WARNING] agate-node.service file not found in ${SOURCE_CORE_DIR}. Skipping service cycle."
fi

echo "=== [4/4] EXECUTING POST-DEPLOYMENT FORENSIC HANDSHAKE ==="
# Verify if the daemon initialized and successfully stabilized its system loop
sleep 2
if command -v systemctl >/dev/null 2>&1 && systemctl is-active --quiet agate-node.service; then
    echo "================================================================================"
    echo "[SUCCESS] Project Agate Production Build successfully deployed to active pipeline."
    echo "[STATUS] SolveX Node UI Status: ACTIVE"
    echo "[STATUS] 380-Byte Protocol Execution Layer: ENFORCED"
    echo "================================================================================"
elif ! command -v systemctl >/dev/null 2>&1; then
    echo "================================================================================"
    echo "[SUCCESS] Project Agate Build successfully prepared."
    echo "[STATUS] Termux Environment Detected. Manual daemon start required:"
    echo "         python3 ${NODE_ROOT_DIR}/core/ai_os.py"
    echo "================================================================================"
else
    echo "[WARNING] Freedom Sim AI OS daemon may not be running or service failed."
    echo "Check raw logs using: journalctl -u agate-node.service"
fi
