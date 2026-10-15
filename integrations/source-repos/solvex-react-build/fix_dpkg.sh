#!/bin/bash
# SolveX-Integrated-Pipeline: fix_dpkg.sh
# Purpose: Fix broken dpkg state in the Ubuntu proot environment

echo "=========================================================="
echo " Fixing broken dpkg state in Ubuntu Proot                 "
echo "=========================================================="

proot-distro login ubuntu -- bash -c "dpkg --configure -a"

if [ $? -eq 0 ]; then
    echo "=========================================================="
    echo " [✓] dpkg fixed successfully!"
    echo "     You can now try running the build script again."
    echo "=========================================================="
else
    echo "=========================================================="
    echo " [X] Failed to fix dpkg."
    echo "=========================================================="
fi
