#!/bin/bash
# SolveX-Integrated-Pipeline: update_termux.sh
# Purpose: Comprehensive Termux Environment Update & Maintenance

echo "================================================="
echo "   SolveX-Integrated-Pipeline (Termux Updater)   "
echo "================================================="

echo "[1] Synchronizing Termux Package Repositories..."
pkg update -y 2>/dev/null || apt update -y 2>/dev/null

echo "[2] Upgrading Installed System Packages..."
pkg upgrade -y 2>/dev/null || apt upgrade -y 2>/dev/null

echo "[3] Verifying Core Cryptographic Dependencies..."
pkg install -y coreutils openssl bash jq 2>/dev/null || apt install -y coreutils openssl bash jq 2>/dev/null

echo "[4] Re-Securing Pipeline Executables..."
find . -type f -name "*.sh" -exec chmod +x {} +

echo "================================================="
echo " [✓] TERMUX ENVIRONMENT MAINTAINED AND UPDATED"
echo "================================================="
