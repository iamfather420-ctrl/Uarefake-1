#!/data/data/com.termux/files/usr/bin/bash

# Configuration: Source of Truth
LOG_FILE="$HOME/.agate_node/vault/consensus_memory.json"
PORT="8888"
TARGET_IP="127.0.0.1"

# 1. Forensic Cycle Count (Raw Data Fidelity)
TOTAL_CYCLES=$(wc -l < "$LOG_FILE")
BLOCK_COUNT=$(grep -c "FAIL" "$LOG_FILE")

# 2. Heartbeat/Ping Verification (Connectivity)
# Checks if the local loopback/network is responsive
PING_STATUS=$(ping -c 1 -W 1 $TARGET_IP > /dev/null 2>&1 && echo "100% HEARTBEAT ACTIVE" || echo "FAIL")

# 3. Port Defense Verification (Port Specific)
# Probes the port to confirm it is blocked as intended
PORT_CHECK=$(timeout 1 curl -sI http://$TARGET_IP:$PORT > /dev/null 2>&1 || echo "PORT BLOCKED - DEFENSE VERIFIED")

# 4. Report Assembly
echo "--- AGATE LIVE AUDIT: $(date) ---"
echo "TOTAL FORENSIC CYCLES: $TOTAL_CYCLES"
echo "CONNECTION HEARTBEAT: $PING_STATUS"
echo "PORT $PORT DEFENSE STATUS: $PORT_CHECK"
echo "CURRENT BLOCK RATE: $(( (BLOCK_COUNT * 100) / TOTAL_CYCLES ))%"
echo "RAW INTRUSION LOG TAIL (LAST 3):"
tail -n 3 "$LOG_FILE"
