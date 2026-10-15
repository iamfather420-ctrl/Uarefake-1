#!/bin/bash
# SolveX-Integrated-Pipeline: flood_test.sh
# Purpose: Flood the Gatekeeper with 100 randomized invalid packets to test rejection consistency.

GATEKEEPER="./security-pipeline/gatekeeper.sh"

if [ ! -f "$GATEKEEPER" ]; then
    echo "ERROR: Gatekeeper pipeline not found at $GATEKEEPER"
    exit 1
fi

echo "======================================"
echo "--- Initiating Perimeter Flood Test ---"
echo "Target: Gatekeeper Pipeline"
echo "Volume: 100 Malformed Packets"
echo "======================================"

REJECT_COUNT=0
BREACH_COUNT=0

for i in {1..100}; do
    # Generate random payload (varies between 50 and 600 chars to test boundary constraints)
    RAND_LEN=$(( ( RANDOM % 550 ) + 50 ))
    RANDOM_PACKET=$(head -c "$RAND_LEN" /dev/urandom | base64 | tr -d '\n' | head -c "$RAND_LEN")
    
    # Route through Sovereign Bridge
    bash "$GATEKEEPER" --verify "$RANDOM_PACKET" > /dev/null 2>&1
    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "[!] CRITICAL BREACH: Packet $i bypassed verification!"
        BREACH_COUNT=$((BREACH_COUNT + 1))
    else
        REJECT_COUNT=$((REJECT_COUNT + 1))
        # Log progress periodically
        if [ $((i % 25)) -eq 0 ]; then
            echo "[-] Status: $i/100 packets rejected safely."
        fi
    fi
done

echo "======================================"
echo "Flood Test Diagnostics:"
echo "Total Transmitted: 100"
echo "Successfully Dropped: $REJECT_COUNT"
echo "Gatekeeper Breaches: $BREACH_COUNT"
echo "======================================"
echo "Recent Ledger Forensic Audit:"
tail -n 3 ./consensus-vault/consensus_memory.json
