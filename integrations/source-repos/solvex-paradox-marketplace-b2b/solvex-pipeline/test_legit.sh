#!/bin/bash
# SolveX-Integrated-Pipeline: test_legit.sh
# Purpose: Construct a valid cryptographic packet and pass it to Gatekeeper

HEADER_SIZE=380
PRIVATE_KEY="./security-pipeline/keys/node_private.pem"
GATEKEEPER="./security-pipeline/gatekeeper.sh"

# 1. Verify we have the private key to sign the packet
if [ ! -f "$PRIVATE_KEY" ]; then
    echo "ERROR: node_private.pem not found."
    echo "Please ensure the RSA key configuration is complete before running this script."
    exit 1
fi

PAYLOAD="[SOVEREIGN-OPS]: SYSTEM_NOMINAL. SECURE_HANDSHAKE_ACKNOWLEDGED. UPLINK=SECURE."

# 2. Cryptographically Sign the Payload
# Generate signature, format as Base64, and strip newlines
SIGNATURE_B64=$(printf "%s" "$PAYLOAD" | openssl dgst -sha256 -sign "$PRIVATE_KEY" | base64 | tr -d '\n')

# 3. Pad the Header to exactly 380 bytes to meet Protocol constraints
# The gatekeeper will safely strip spacing and base64 decode it.
CURRENT_LEN=${#SIGNATURE_B64}
PAD_LEN=$((HEADER_SIZE - CURRENT_LEN))
PADDING=$(printf '%*s' "$PAD_LEN" '')
HEADER="${SIGNATURE_B64}${PADDING}"

# 4. Construct the Full Packet
FULL_PACKET="${HEADER}${PAYLOAD}"

echo "======================================"
echo "--- Initiating Legitimacy Test ---"
echo "Payload: $PAYLOAD"
echo "Header length: ${#HEADER} bytes"
echo "Packet length: ${#FULL_PACKET} bytes"
echo "Sending Packet to Gatekeeper..."

# 5. Dispatch to Gatekeeper
bash "$GATEKEEPER" --verify "$FULL_PACKET"
EXIT_CODE=$?

# 6. Audit Results
echo "-----------------------------------"
if [ $EXIT_CODE -eq 0 ]; then
    echo "Gatekeeper Check: [AUTHORIZATION SUCCESSFUL]"
else
    echo "Gatekeeper Check: [AUTHORIZATION FAILED] (Exit Code: $EXIT_CODE)"
fi

echo "======================================"
echo "Latest Consensus Ledger Entry:"
tail -n 1 ./consensus-vault/consensus_memory.json
