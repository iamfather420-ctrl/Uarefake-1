#!/bin/bash
# Planetary Harvester System Hub
# Outputs system status, storage space, and validation feedback

set -e

VAULT_DIR="$HOME/.agate_node/vault"
LEDGER_FILE="$VAULT_DIR/consensus_memory.json"
WASTE_FILE="$VAULT_DIR/waste_reclamation.json"

echo "======================================"
echo "PLANETARY HARVESTER - SYSTEM STATUS"
echo "======================================"
echo ""

# Check vault directory
if [ -d "$VAULT_DIR" ]; then
    echo "[✓] Vault Directory: $VAULT_DIR"
    echo "    Permissions: $(stat -c '%a' $VAULT_DIR)"
else
    echo "[✗] Vault Directory not found: $VAULT_DIR"
    exit 1
fi

# Check consensus memory ledger
if [ -f "$LEDGER_FILE" ]; then
    echo "[✓] Consensus Memory Ledger: $(wc -l < $LEDGER_FILE) lines"
    PROTOCOL=$(grep -o '"protocol_version": "[^"]*"' $LEDGER_FILE | cut -d'"' -f4)
    echo "    Protocol Version: $PROTOCOL"
else
    echo "[✗] Consensus Memory Ledger not found"
fi

# Check waste reclamation ledger
if [ -f "$WASTE_FILE" ]; then
    echo "[✓] Waste Reclamation Ledger: $(wc -l < $WASTE_FILE) lines"
    TOTAL_WASTE=$(grep -o '"total_waste_processed": [0-9]*' $WASTE_FILE | cut -d' ' -f2)
    echo "    Total Waste Processed: $TOTAL_WASTE units"
else
    echo "[✗] Waste Reclamation Ledger not found"
fi

echo ""
echo "======================================"
echo "STORAGE INFORMATION"
echo "======================================"
echo ""

# Disk space information
DISK_USAGE=$(df -h $HOME | tail -1 | awk '{print $5}')
DISK_AVAILABLE=$(df -h $HOME | tail -1 | awk '{print $4}')

echo "Home Directory: $HOME"
echo "Disk Usage: $DISK_USAGE"
echo "Disk Available: $DISK_AVAILABLE"

echo ""
echo "======================================"
echo "VALIDATION FEEDBACK"
echo "======================================"
echo ""

# Run swarm engine validation
if command -v python3 &> /dev/null; then
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    if [ -f "$SCRIPT_DIR/swarm_engine.py" ]; then
        echo "[RUNNING] SwarmOS Engine Validation..."
        python3 "$SCRIPT_DIR/swarm_engine.py"
    fi
else
    echo "[WARNING] Python3 not found"
fi

echo ""
echo "======================================"
echo "SYSTEM STATUS COMPLETE"
echo "======================================"
