#!/bin/bash
# SolveX-Integrated-Pipeline: safe_install_and_build.sh

echo "=========================================================="
echo " Safe Install & Build Script for Termux / Proot           "
echo "=========================================================="
echo "This script limits CPU usage to prevent Android from killing Termux."

COMMANDS="apt update && apt install -y curl openjdk-17-jdk python3 build-essential && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs && cd $PWD && npm install && npm run build && npx cap sync android && cd android && ./gradlew clean assembleDebug"

proot-distro login ubuntu -- bash -c "$COMMANDS"
