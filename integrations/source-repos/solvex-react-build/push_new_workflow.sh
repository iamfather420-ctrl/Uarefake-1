#!/bin/bash
# SolveX-Integrated-Pipeline: push_new_workflow.sh
# Purpose: Push the corrected GitHub Action workflow to trigger the cloud build.

echo "=========================================================="
echo " [!] Forensic Audit: Syncing Cloud Build Pipeline"
echo "=========================================================="
git add .github/workflows/main.yml
git commit -m "[SolveX] Update workflow to stable Buildozer configuration (Python 3.11, v4 artifacts)"
git push origin main
echo "=========================================================="
echo " [✓] Payload transmitted. Monitor the GitHub Actions tab."
echo "=========================================================="
