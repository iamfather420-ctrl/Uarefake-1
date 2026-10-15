#!/bin/bash
# SolveX-Integrated-Pipeline: sync_github.sh
# Purpose: Synchronize Termux workspace with GitHub (Pull new files from AI Studio, and Push local changes/APKs back)

echo "================================================="
echo "      SolveX Git Synchronizer (Termux)           "
echo "================================================="

# 1. Check if git is installed
if ! command -v git &> /dev/null; then
    echo "[-] Git is not installed. Installing git..."
    pkg update -y && pkg install git -y
fi

# Fix embedded git repos to prevent untracked submodule issues
echo "[1] Fixing embedded git repositories..."
if [ -d "agate-core-build" ]; then
    rm -rf agate-core-build/.git
    git rm --cached agate-core-build 2>/dev/null || true
fi
if [ -d "agate-deploy" ]; then
    rm -rf agate-deploy/.git
    git rm --cached agate-deploy 2>/dev/null || true
fi

# 2. Pull latest changes from the remote repository
echo "[2] Fetching and pulling latest updates from GitHub..."
git config pull.rebase true
# Try pulling from main, fallback to master if main doesn't exist
git pull origin main --rebase || git pull origin master --rebase

# 3. Stage local files for commit (this captures any locally built files/changes)
echo "[3] Staging local files for commit..."
git add .

# 4. Check if there are actually local changes to commit
if git diff-index --quiet HEAD --; then
    echo "================================================="
    echo "[!] No local changes to commit or push."
    echo "    Workspace is up-to-date with remote."
    echo "================================================="
    exit 0
fi

# 5. Prompt for commit message
echo ""
echo "[?] Local changes detected."
read -p "Enter commit message (Leave blank for default timestamp): " commit_message
if [ -z "$commit_message" ]; then
    commit_message="Automated Termux Sync: $(date -u +'%Y-%m-%dT%H:%M:%SZ')"
fi

# 6. Commit changes
echo "[3] Committing changes..."
git commit -m "$commit_message"

# 7. Push to GitHub
echo "[4] Pushing to GitHub..."
# Push to the current tracked branch
git push origin HEAD

if [ $? -eq 0 ]; then
    echo "================================================="
    echo " [✓] SYNC OPERATION COMPLETED SUCCESSFULLY"
    echo "================================================="
else
    echo "================================================="
    echo " [X] PUSH FAILED"
    echo "     - Verify your Git authentication (Personal Access Token or SSH Key)."
    echo "     - Verify your network connectivity."
    echo "================================================="
fi
