#!/bin/bash

echo "[True] Initializing automated ZIP pull and GitHub push pipeline..."

# Ensure required packages exist natively on Termux
pkg install unzip curl git -y

echo "[True] 1. Downloading the live workspace TAR.GZ..."
curl -L -o agate_update.tar.gz "https://ais-dev-spgmmduclq3ylngyvro7wj-656663776978.us-east1.run.app/api/v1/export-project"

echo "[True] 2. Extracting updated files..."
tar -xzf agate_update.tar.gz

echo "[True] 3. Staging files into local repository..."
git add .

echo "[True] 4. Committing the latest AI Studio updates..."
git commit -m "chore(sync): import ZIP payload and trigger Ubuntu cloud build"

echo "[True] 5. Pushing to GitHub..."
git push origin main

echo "[True] Pipeline Complete. The GitHub Action (Ubuntu Cloud Build) will now compile your APK on the cloud. Please check the Actions tab in your GitHub repository."
