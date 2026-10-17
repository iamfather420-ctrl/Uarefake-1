#!/bin/bash
# SolveX-Integrated-Pipeline: force_sync.sh
# Purpose: Pull remote changes to avoid rejected push, then push local updates.

echo "=========================================================="
echo " [!] Forensic Audit: Syncing local repository with remote"
echo "=========================================================="

git pull origin main --rebase
git add .github/workflows/main.yml
git commit -m "[SolveX] Update main.yml with intltool to fix libtool macro error" || true
git push origin main

echo "=========================================================="
echo " [✓] Payload transmitted. Check GitHub Actions for the new build."
echo "=========================================================="
