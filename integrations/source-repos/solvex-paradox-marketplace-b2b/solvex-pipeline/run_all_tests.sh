#!/bin/bash
# SolveX-Integrated-Pipeline: run_all_tests.sh
# Purpose: Execute all security, intrusion, and capacity tests sequentially

echo "==============================================="
echo "   SOLVEX PIPELINE: MASTER TEST SEQUENCE       "
echo "==============================================="

echo "-----------------------------------------------"
echo "[1/4] INITIATING LEGITIMATE TRAFFIC TEST"
echo "-----------------------------------------------"
if [ -f "./test_legit.sh" ]; then
    ./test_legit.sh
else
    echo "[-] test_legit.sh missing. Skipping."
fi
echo ""

echo "-----------------------------------------------"
echo "[2/4] INITIATING TRESPASS / INTRUSION TEST"
echo "-----------------------------------------------"
if [ -f "./test_trespass.sh" ]; then
    ./test_trespass.sh
else
    echo "[-] test_trespass.sh missing. Skipping."
fi
echo ""

echo "-----------------------------------------------"
echo "[3/4] INITIATING FLOOD / RATE-LIMIT TEST"
echo "-----------------------------------------------"
if [ -f "./flood_test.sh" ]; then
    ./flood_test.sh
else
    echo "[-] flood_test.sh missing. Skipping."
fi
echo ""

echo "-----------------------------------------------"
echo "[4/4] INITIATING STRESS / LOAD TEST"
echo "-----------------------------------------------"
if [ -f "./stress_test.sh" ]; then
    ./stress_test.sh
else
    echo "[-] stress_test.sh missing. Skipping."
fi
echo ""

echo "==============================================="
echo "   [✓] ALL PROTOCOL TESTS EXECUTED             "
echo "==============================================="
