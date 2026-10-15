#!/bin/bash
# Termux script to bypass PEP-668 and run buildozer

echo "=========================================================="
echo " Setting up Node & Java in Ubuntu Proot...                "
echo "=========================================================="
proot-distro login ubuntu -- bash -c "apt update && apt install -y curl openjdk-17-jdk python3 build-essential && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs"

echo "=========================================================="
echo " Running React+Capacitor Build...                         "
echo "=========================================================="
proot-distro login ubuntu -- bash -c "cd $PWD && npm install && npm run build && npx cap sync android && cd android && ./gradlew clean assembleDebug"
