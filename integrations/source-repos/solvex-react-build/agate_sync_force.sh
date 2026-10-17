#!/bin/bash
# agate_sync_force.sh
# Forces the local Termux environment to push its exact state to the GitHub repository, overwriting any conflicts.

echo "[True] Initializing forceful GitHub sync for Project Agate..."

# Ensure we are in the correct primary node directory
cd ~/.agate_node || { echo "[Unverified] Node directory not found. Please ensure ~/.agate_node exists."; exit 1; }

echo "[True] Staging all current pipeline and UI components..."
git add .

echo "[True] Committing recent UI, roles, and real-time monitoring changes..."
git commit -m "feat(pipeline): force sync latest UI configurations, heartbeat animations, gatekeeper radar, and custom roles"

echo "[True] Executing forceful resolution of remote divergence. Overwriting remote state with local consensus..."
git push origin main --force

echo "[True] Sync complete. The remote GitHub repository now perfectly mirrors the current local build."
