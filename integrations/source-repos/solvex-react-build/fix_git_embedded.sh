#!/bin/bash
# SolveX-Integrated-Pipeline: fix_git_embedded.sh
# Purpose: Clean up accidentally cloned embedded Git repositories inside the workspace.

echo "================================================="
echo "   SolveX Workspace Git Cleaner (Termux)         "
echo "================================================="

echo "[1] Removing nested git repositories from cache..."
if [ -d "agate-core-build" ]; then
    git rm --cached agate-core-build || true
    echo "[-] Un-tracked embedded repo: agate-core-build"
fi

if [ -d "agate-deploy" ]; then
    git rm --cached agate-deploy || true
    echo "[-] Un-tracked embedded repo: agate-deploy"
fi

echo ""
echo "[2] Do you want to delete these duplicate folders from your workspace?"
echo "    (Recommended if you accidentally ran 'git clone' inside the current repo)"
read -p "Delete duplicate nested folders? (y/n): " delete_choice

if [ "$delete_choice" == "y" ] || [ "$delete_choice" == "Y" ]; then
    rm -rf agate-core-build
    rm -rf agate-deploy
    echo "[-] Duplicate folders removed."
else
    # If they keep them, we need to remove the .git folders inside them so they act as normal folders
    echo "[-] Converting them to normal folders by removing their internal .git data..."
    rm -rf agate-core-build/.git
    rm -rf agate-deploy/.git
fi

echo ""
echo "[3] Updating git index..."
git add .

echo "================================================="
echo " [✓] WORKSPACE CLEANED                           "
echo "     You can now run your sync or commit script. "
echo "================================================="
