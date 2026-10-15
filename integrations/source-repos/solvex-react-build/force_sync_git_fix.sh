#!/usr/bin/env bash
# ==============================================================================
# PROJECT AGATE: FORENSIC GIT FORCE SYNC UTILITY
# Script: ./force_sync_git_fix.sh
# Purpose: Resolves stuck git states, merge conflicts, and forces origin sync.
# ==============================================================================

set -e

echo "=== [1/4] CLEARING PENDING GIT STATES ==="
# Abort any stuck merges or rebases
git merge --abort >/dev/null 2>&1 || true
git rebase --abort >/dev/null 2>&1 || true

echo "=== [2/4] FETCHING ORIGIN STATE ==="
git fetch origin

echo "=== [3/4] SYNCHRONIZING BRANCH ==="
# Attempt to rebase local commits on top of origin
if ! git pull origin main --rebase; then
    echo "[WARNING] Rebase encountered conflicts. Aborting rebase and prioritizing local state."
    git rebase --abort >/dev/null 2>&1 || true
fi

echo "=== [4/4] ENFORCING FORENSIC OVERRIDE PUSH ==="
git add -A
if ! git diff-index --quiet HEAD; then
    git commit -m "[SolveX] Forensic Override: Automated Git state resolution" || true
fi

# Force push to origin to ensure the pipeline aligns with the local node state
git push origin main --force

echo "================================================================================"
echo "[SUCCESS] Git forensic sync complete. Remote states are aligned with local."
echo "================================================================================"
