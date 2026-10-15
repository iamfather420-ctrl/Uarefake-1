#!/usr/bin/env bash
# ==============================================================================
# CLAIM OF INTELLECTUAL PROPERTY & ORIGINAL PROVENANCE
# AUTHOR / TRUSTEE: TODD JEFFREY ITES JR. (TJ)
# PROJECT ANCHOR: AGATE CORE ECOSYSTEM ($AGE)
#
# GENESIS ENTRY TIMESTAMP: DECEMBER 25, 2025
# SECURITY PERIMETER CONSTRAINT: 380-CHARACTER CRYPTOGRAPHIC HEADER REQUIRED
# HARDWARE ROOT VALIDATION SIGNATURE: MAESTRO_AGE_2026
#
# NOTICE: THIS SOFTWARE IS AN INDEPENDENT SCRIPTURAL AND CRYPTOGRAPHIC BUILD.
# ANY UNAUTHORIZED REPLICATION, REVERSE-ENGINEERING, OR SYSTEMIC TRESPASS 
# CONSTITUTES AN IMMEDIATE INFRINGEMENT OF ORIGINAL PROVENANCE.
# ==============================================================================

echo "=========================================================="
echo "Initializing Safety & Privacy Node (Local Environment)"
echo "=========================================================="

# 1. Ensure Dependencies
echo "[*] Setting up Python Environment for your device..."
pkg update -y && pkg upgrade -y
pkg install python -y
python -m ensurepip --upgrade
pip install -r requirements.txt

# 2. Local Container Folders
mkdir -p ~/.agate_node/vault
mkdir -p payload

# 3. Load Keys from Vault (Exported from UI)
SETTINGS_FILE=~/.agate_node/vault/system_node_settings.json

if [ -f "$SETTINGS_FILE" ]; then
    echo "[+] Loading your personal settings and integration keys..."
    # Simple extraction using python JSON parser
    STRIPE_KEY=$(python -c 'import json; print(json.load(open("'"$SETTINGS_FILE"'"))["integrations"]["stripe_live_key"])')
    SOLVEX_KEY=$(python -c 'import json; print(json.load(open("'"$SETTINGS_FILE"'"))["integrations"]["solvex_master_node_key"])')
    WEBHOOK_URL=$(python -c 'import json; print(json.load(open("'"$SETTINGS_FILE"'"))["integrations"]["active_webhook_url"])')
else
    echo "[!] No settings JSON found in ~/.agate_node/vault/system_node_settings.json"
    echo "    (Please 'Export Settings Backup' from the Web UI Settings Engine, and save it to the path above.)"
    echo "[+] Using fallback static keys..."
    STRIPE_KEY="sk_live_FALLBACK"
    SOLVEX_KEY="SX-PROD-992837465"
    WEBHOOK_URL="https://localhost/webhook"
fi

export STRIPE_LIVE_KEY=$STRIPE_KEY
export SOLVEX_MASTER_NODE_KEY=$SOLVEX_KEY
export ACTIVE_WEBHOOK_URL=$WEBHOOK_URL

echo "[+] Sourced Integrations Matrix:"
echo "    Stripe Key     : ${STRIPE_LIVE_KEY:0:10}..."
echo "    SolveX Node    : ${SOLVEX_MASTER_NODE_KEY}"
echo "    Webhook Target : ${ACTIVE_WEBHOOK_URL}"
echo ""

# Boot API layer
echo "[*] Booting Layer 1: Transaction Engine (Background)..."
nohup uvicorn app.main:app --host 127.0.0.1 --port 8000 > solvex_api.log 2>&1 &
API_PID=$!
sleep 2

# Execute routing logic layer
echo "[*] Booting Layer 2: MMTAI Router Validation..."
python protocols/mmtai_router.py

echo ""
echo "[+] Environment Initialized Successfully."
echo "API Server is running on PID $API_PID. Check solvex_api.log for output."
echo "To execute the internal shield loop: python payload/child_shield.py <DECRYPTION_KEY>"
