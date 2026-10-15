#!/bin/bash
# handshake.sh - Protocol Verification Logic

verify_header() {
    local header=$1
    # 1. Extract signature (bytes 96-351)
    local signature=$(echo "$header" | cut -c 97-352)
    
    # 2. Extract Timestamp and Nonce for freshness check
    local timestamp=$(echo "$header" | cut -c 33-96)
    
    # 3. Verify Signature against the Active Node Key
    # Using openssl to validate the signature field against the node public key
    if openssl dgst -sha256 -verify ./security-pipeline/keys/active_node.pub \
       -signature <(echo "$signature") <(echo "$timestamp") > /dev/null 2>&1; then
        return 0 # AUTH_SUCCESS
    else
        return 1 # AUTH_FAILURE
    fi
}
