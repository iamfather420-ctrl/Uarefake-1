#!/bin/bash
# SolveX-Integrated-Pipeline: run_proot_build.sh
# Purpose: Run React+Capacitor+Gradle build safely.

echo "=========================================================="
echo " Starting Safe React+Capacitor Build Process              "
echo "=========================================================="
echo ""
echo "[!] IMPORTANT DEVICE PREPARATION:"
echo " 1. Pull down your phone's notification bar."
echo " 2. Find the 'Termux' notification."
echo " 3. Tap 'Acquire wakelock'."
echo "=========================================================="

echo "Press ENTER to begin the compiled build process..."
read dummy

# Enter proot and run node+gradle build
proot-distro login ubuntu -- bash -c "cd $PWD && npm install && npm run build && npx cap sync android && cd android && ./gradlew assembleDebug"

if [ $? -eq 0 ]; then
    echo "=========================================================="
    echo " [✓] BUILD COMPLETED!"
    echo "     Your APK should be located in android/app/build/outputs/apk/debug/"
    echo "=========================================================="
else
    echo "=========================================================="
    echo " [X] BUILD FAILED."
    echo "=========================================================="
fi
