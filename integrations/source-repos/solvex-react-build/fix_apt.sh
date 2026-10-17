#!/bin/bash
# SolveX-Integrated-Pipeline: fix_apt.sh
# Purpose: Fix broken apt dependencies in the Ubuntu proot environment

echo "=========================================================="
echo " Fixing broken apt dependencies in Ubuntu Proot           "
echo "=========================================================="

proot-distro login ubuntu -- bash -c "apt --fix-broken install -y"

if [ $? -eq 0 ]; then
    echo "=========================================================="
    echo " [✓] apt dependencies fixed successfully!"
    echo "     You can now try running the build script again."
    echo "=========================================================="
else
    echo "=========================================================="
    echo " [X] Failed to fix apt dependencies."
    echo "=========================================================="
fi
