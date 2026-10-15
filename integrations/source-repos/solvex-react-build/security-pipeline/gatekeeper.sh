#!/bin/bash
# SolveX-Integrated-Pipeline: gatekeeper.sh
# Purpose: Enforce packet-level authentication via 380-byte header verification

HEADER_SIZE=380
LEDGER="./consensus-vault/consensus_memory.json"
KEY_STORE="./security-pipeline/keys/active_node.key"

sync_ledger() {
    local event_type=$1
    local node_id=$(whoami)
    local packet_hash=$2
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Tamper-evident format using SHA-256 hash of the log entry
    local log_content="{\"timestamp\":\"$timestamp\",\"event\":\"$event_type\",\"node\":\"$node_id\",\"hash\":\"$packet_hash\"}"
    local entry_signature=$(echo -n "$log_content" | sha256sum | awk '{print $1}')
    
    # Write to JSON ledger via JSON Lines
    echo "{\"log\": $log_content, \"signature\": \"$entry_signature\"}" >> $LEDGER
}

verify_packet() {
    local packet="$1"
    
    # Failure trapping
    set -e
    trap 'sync_ledger "INTRUSION_ATTEMPT" "SYSTEM_ERROR"; exit 1' ERR

    if [ -z "$packet" ]; then
        sync_ledger "INTRUSION_ATTEMPT" "EMPTY_PACKET"
        exit 1
    fi

    # Extract the first 380 bytes
    local header=$(printf "%s" "$packet" | cut -c 1-$HEADER_SIZE)
    local payload=$(printf "%s" "$packet" | cut -c $(($HEADER_SIZE + 1))-)
    local packet_hash=$(printf "%s" "$packet" | sha256sum | awk '{print $1}')
    
    if [ ${#header} -lt $HEADER_SIZE ]; then
        sync_ledger "INTRUSION_ATTEMPT" "$packet_hash"
        exit 1
    fi
    
    # Cryptographically decode the Base64 Header (ignoring padding spaces)
    local sig_file=$(mktemp)
    printf "%s" "$header" | tr -d ' ' | base64 -d > "$sig_file" 2>/dev/null
    
    local payload_file=$(mktemp)
    printf "%s" "$payload" > "$payload_file"
    
    # Cryptographic verification against stored node key
    if openssl dgst -sha256 -verify $KEY_STORE -signature "$sig_file" "$payload_file" > /dev/null 2>&1; then
        sync_ledger "AUTH_SUCCESS" "$packet_hash"
        rm -f "$sig_file" "$payload_file"
        return 0
    else
        # Log intrusion and terminate
        sync_ledger "INTRUSION_ATTEMPT" "$packet_hash"
        rm -f "$sig_file" "$payload_file"
        exit 1
    fi
}

# Execute verification on incoming stream
if [[ "$1" == "--verify" ]]; then
    verify_packet "$2"
else
    verify_packet "$1"
fi