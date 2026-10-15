#!/bin/bash
# SolveX-Integrated-Pipeline: monitor_routing.sh
# Purpose: Real-time forensic log monitor to verify CSaaS routing status

echo "==============================================="
echo "   SOLVEX NODE: ROUTING TELEMETRY MONITOR      "
echo "==============================================="

LOG_FILE="solvex_api.log"

if [ -f "$LOG_FILE" ]; then
    echo "[-] Sourcing telemetry from active node log: $LOG_FILE"
    echo "[-] Press [CTRL+C] to exit monitor mode."
    echo "-----------------------------------------------"
    tail -f "$LOG_FILE"
elif [ -f ".agate_node/vault/solvex_api.log" ]; then
    echo "[-] Sourcing telemetry from vault node log..."
    echo "[-] Press [CTRL+C] to exit monitor mode."
    echo "-----------------------------------------------"
    tail -f ".agate_node/vault/solvex_api.log"
else
    echo "[!] CRITICAL: No active routing log detected in the current scope."
    echo "    Make sure the Sovereign Node is online and generating telemetry."
    echo "    Checked paths: ./solvex_api.log , ./.agate_node/vault/solvex_api.log"
fi
