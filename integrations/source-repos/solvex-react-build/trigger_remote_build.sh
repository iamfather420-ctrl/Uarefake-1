#!/bin/bash
# SolveX-Integrated-Pipeline: trigger_remote_build.sh
# Purpose: Offload APK compilation to the Node consensus (GitHub Actions) due to local storage constraints.

echo "=========================================================="
echo " [!] Forensic Audit: Local storage exhausted."
echo "     Routing build tasks to SolveX CSaaS Pipeline..."
echo "=========================================================="

git add .github/workflows/main.yml
git commit -m "[SolveX] Update CI workflow to fix remote builds"
git push origin main

echo "=========================================================="
echo " [✓] Payload transmitted. The remote pipeline is now compiling the APK."
echo "     Check the 'Actions' tab on your GitHub repository to download the APK once finished."
echo "=========================================================="
