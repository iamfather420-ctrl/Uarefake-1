#!/bin/bash
# SolveX-Integrated-Pipeline: setup_node.sh
# Purpose: Initialize Sovereign Node Identity and Cryptographic Keys.

echo "==============================================="
echo "   SOLVEX PIPELINE: NODE INITIALIZATION        "
echo "==============================================="

# 1. Create Key Directory
mkdir -p security-pipeline/keys

# 2. Generate Missing Keys (Node Identity)
echo "[-] Verifying Cryptographic Identity..."

if [ ! -f "security-pipeline/keys/node_private.pem" ]; then
    echo "  -> Generating Node Private Key (RSA 2048)..."
    openssl genpkey -algorithm RSA -out security-pipeline/keys/node_private.pem -pkeyopt rsa_keygen_bits:2048
else
    echo "  [✓] Node Private Key exists."
fi

if [ ! -f "security-pipeline/keys/node_public.pem" ]; then
    echo "  -> Extracting Node Public Key..."
    openssl rsa -pubout -in security-pipeline/keys/node_private.pem -out security-pipeline/keys/node_public.pem 2>/dev/null
else
    echo "  [✓] Node Public Key exists."
fi

if [ ! -f "security-pipeline/keys/active_node.pub" ]; then
    echo "  -> Establishing Active Node Authority..."
    cp security-pipeline/keys/node_public.pem security-pipeline/keys/active_node.pub
else
    echo "  [✓] Active Node Authority established."
fi

# 3. Ensure permissions
chmod +x security-pipeline/*.sh 2>/dev/null
chmod +x *.sh 2>/dev/null

echo "==============================================="
echo " [✓] SOVEREIGN NODE INITIALIZED                "
echo "==============================================="
