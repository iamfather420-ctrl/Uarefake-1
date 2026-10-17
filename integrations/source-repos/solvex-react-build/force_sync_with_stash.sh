#!/bin/bash
# SolveX-Integrated-Pipeline: force_sync_with_stash.sh
# Purpose: Stash unstaged changes, pull remote, pop stash, and push.

echo "=========================================================="
echo " [!] Forensic Audit: Syncing local repository with stash"
echo "=========================================================="

# 1. Stash any unstaged/uncommitted changes
git stash

# 2. Pull from the remote repository with rebase
git pull --rebase origin main

# 3. Apply the stashed changes back
git stash pop

# 4. Add the workflow file and any other modified files
git add .github/workflows/main.yml

# 5. Commit the changes (using || true so it doesn't fail if nothing new)
git commit -m "[SolveX] Update main.yml and integrate remote changes" || true

# 6. Push to the remote repository
git push origin main

echo "=========================================================="
echo " [✓] Sync complete. Check GitHub Actions for the new build."
echo "=========================================================="
