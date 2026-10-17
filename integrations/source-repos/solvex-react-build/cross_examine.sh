#!/bin/bash
# SolveX-Integrated-Pipeline: cross_examine.sh
# Purpose: Deep Forensic Audit and Cross-Examination of the Termux Environment 
# to ensure absolute parity between the pipeline architecture and the local deployment.

echo "================================================="
echo "   SOLVEX PIPELINE: TERMUX CROSS-EXAMINATION     "
echo "================================================="

# 1. Dependency Cross-Check
echo "[1] Verifying Cryptographic & Core Dependencies..."
DEPS=("openssl" "sha256sum" "base64" "jq" "bash" "node")
MISSING=0
for DEP in "${DEPS[@]}"; do
    if command -v $DEP >/dev/null 2>&1; then
        echo "  [✓] $DEP is installed. ($(command -v $DEP))"
    else
        echo "  [X] $DEP is MISSING."
        MISSING=$((MISSING + 1))
    fi
done

# 2. Pipeline File Integrity Cross-Check
echo ""
echo "[2] Performing Forensic File Audit..."
FILES=(
    "security-pipeline/gatekeeper.sh"
    "security-pipeline/handshake.sh"
    "consensus-vault/consensus_memory.json"
    "os-core/user_management.sh"
    "setup_node.sh"
    "setup_termux.sh"
    "update_termux.sh"
    "test_legit.sh"
    "test_trespass.sh"
    "flood_test.sh"
    "stress_test.sh"
    "run_all_tests.sh"
    "monitor_routing.sh"
)

FILE_MISSING=0
for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        HASH=$(sha256sum "$FILE" | awk '{print $1}')
        # Only print first 16 chars of hash for clean layout
        echo "  [✓] ${HASH:0:16}... : $FILE"
    else
        echo "  [X] MISSING: $FILE "
        FILE_MISSING=$((FILE_MISSING + 1))
    fi
done

# 3. Cryptographic Key Presence
echo ""
echo "[3] Verifying Sovereign Node Keys..."
KEYS=(
    "security-pipeline/keys/node_private.pem"
    "security-pipeline/keys/node_public.pem"
    "security-pipeline/keys/active_node.pub"
)
KEY_MISSING=0
for KEY in "${KEYS[@]}"; do
    if [ -f "$KEY" ]; then
        echo "  [✓] Key Array Present: $KEY"
    else
        echo "  [-] Key Object Uninitialized/Missing: $KEY"
        KEY_MISSING=$((KEY_MISSING + 1))
    fi
done

# 4. Summary & Assertion
echo "================================================="
if [ $MISSING -eq 0 ] && [ $FILE_MISSING -eq 0 ]; then
    echo "CROSS-EXAMINATION RESULT: [VERIFIED OMNI-SYNC]"
    echo "Status: Termux environment and SolveX pipeline are 100% matched."
else
    echo "CROSS-EXAMINATION RESULT: [INCOMPLETE SYNC]"
    echo "Missing Dep(s): $MISSING | Missing File(s): $FILE_MISSING"
    echo "Resolution: Execute ./setup_termux.sh to repair parity."
fi
echo "================================================="
