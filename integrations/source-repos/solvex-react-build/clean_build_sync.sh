#!/bin/bash
# Project Agate: Clean Build Sync (mmtai Protocol)

echo "[!] Cleaning cache and resetting dependencies..."

# 1. Remove potentially corrupted cache/node_modules
rm -rf node_modules
rm -rf .vite
rm -f package-lock.json

# 2. Re-install clean dependencies
npm install

# 3. Verify repository parity
git add .
git commit -m "Sync: Clean dependency re-sync for production build"

# 4. Push to origin to trigger new GitHub Action
git push -u origin main

echo "[+] Dependencies reset. GitHub Actions build triggered."

