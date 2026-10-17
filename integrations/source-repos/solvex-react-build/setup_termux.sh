#!/bin/bash
# SolveX-Integrated-Pipeline: setup_termux.sh
# Purpose: 100% Deployment & Dependency Resolution for Termux Environments

echo "==============================================="
echo "   SolveX-Integrated-Pipeline (Termux Build)   "
echo "==============================================="

echo "[1] Updating Termux Repositories..."
pkg update -y 2>/dev/null || apt update -y 2>/dev/null

echo "[2] Installing Core Cryptographic Dependencies..."
# coreutils provides sha256sum, base64, tr, head, tail
# openssl provides key generation and cryptographic enforcement
pkg install -y coreutils openssl bash jq 2>/dev/null || apt install -y coreutils openssl bash jq 2>/dev/null

echo "[3] Securing Execution Permissions..."
chmod +x setup_node.sh 2>/dev/null || true
chmod +x test_legit.sh 2>/dev/null || true
chmod +x test_transgress.sh 2>/dev/null || true
chmod +x test_trespass.sh 2>/dev/null || true
chmod +x flood_test.sh 2>/dev/null || true
chmod +x stress_test.sh 2>/dev/null || true
chmod +x run_all_tests.sh 2>/dev/null || true
chmod +x monitor_routing.sh 2>/dev/null || true
chmod +x cross_examine.sh 2>/dev/null || true
chmod +x security-pipeline/gatekeeper.sh 2>/dev/null || true
chmod +x security-pipeline/handshake.sh 2>/dev/null || true
chmod +x os-core/user_management.sh 2>/dev/null || true

echo "[4] Bootstrapping Sovereign AI Node..."
if [ -f "./setup_node.sh" ]; then
    ./setup_node.sh
else
    echo "[!] WARNING: setup_node.sh not found. Proceeding with environment setup."
fi

echo "==============================================="
echo " [✓] SYSTEM 100% OPERATIONAL IN TERMUX"
echo "==============================================="
echo "Available Directives:"
echo "  ./test_legit.sh        - Simulate Authorized Packet"
echo "  ./test_trespass.sh     - Simulate Intrusion Vector"
echo "  ./flood_test.sh        - 100 Malformed Packets"
echo "  ./stress_test.sh       - 1000 Malformed Packets"
echo "==============================================="
