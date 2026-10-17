#!/bin/bash
# SolveX-Integrated-Pipeline: test_trespass.sh
# Purpose: Inject unauthorized mock payload to verify rejection logic

echo "Simulating Intrusion Payload..."
MOCK_PAYLOAD="UNAUTHORIZED_TRESPASS_PACKET_DATA_STREAM_0010110001_NO_VALID_HEADER"

# Supply mock payload to Gatekeeper
./security-pipeline/gatekeeper.sh "$MOCK_PAYLOAD"
EXIT_CODE=$?

echo "Gatekeeper Exit Code: $EXIT_CODE"

if [ $EXIT_CODE -eq 1 ]; then
    echo "Result: REJECTION SUCCESSFUL"
else
    echo "Result: REJECTION FAILED"
fi

# Audit the immutable ledger
echo "Reviewing Immutable Ledger entry:"
tail -n 1 ./consensus-vault/consensus_memory.json
