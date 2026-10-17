#!/bin/bash
# SolveX-Integrated-Pipeline: setup_github_auth.sh
# Purpose: Configure Git authentication inside Termux using a Personal Access Token (PAT)

echo "================================================="
echo "   SolveX GitHub Authentication Setup (Termux)   "
echo "================================================="

if ! command -v git &> /dev/null; then
    echo "[-] Git not installed. Installing..."
    pkg update -y && pkg install git -y
fi

echo "[1] Configuring Git Identity..."
read -p "Enter your GitHub Username: " git_user
read -p "Enter your GitHub Email Address: " git_email

git config --global user.name "$git_user"
git config --global user.email "$git_email"

echo "[2] Configuring Credential Caching..."
# Set git to cache credentials for 1 year (31536000 seconds) so you don't have to keep entering the token
git config --global credential.helper "cache --timeout=31536000"

echo ""
echo "================================================="
echo " [✓] GIT AUTHENTICATION CONFIGURED"
echo ""
echo " IMPORTANT:"
echo " The next time you run './sync_github.sh' or 'git push',"
echo " it will ask for your Username and Password."
echo ""
echo " FOR THE PASSWORD: You MUST use a GitHub Personal Access Token (PAT)."
echo " (Your standard GitHub password will not work)."
echo " You can generate a token here: https://github.com/settings/tokens"
echo "================================================="
