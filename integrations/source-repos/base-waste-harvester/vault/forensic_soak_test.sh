#!/data/data/com.termux/files/usr/bin/bash
LOG_FILE="$HOME/.agate_node/vault/consensus_memory.json"
ITERATIONS=50000
PORT=8888
cleanup() {
    echo -e "\nAudit interrupted. Cleaning up..."
    exec 3>&-
    termux-wake-unlock
    exit 0
}
trap cleanup SIGINT
termux-wake-lock
echo "Initiating 50,000-cycle forensic soak test..."
mkdir -p "$HOME/.agate_node/vault"
exec 3>>"$LOG_FILE"
for ((i=1; i<=ITERATIONS; i++)); do
    TIMESTAMP=$(date +%Y-%m-%dT%H:%M:%S)
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:$PORT)
    if [[ "$RESPONSE" == "200" ]]; then
        echo "{\"timestamp\": \"$TIMESTAMP\", \"id\": $i, \"status\": \"SUCCESS\", \"event\": \"Node Heartbeat Validated\"}" >&3
    else
        ERROR_DETAIL=$(curl -s -I http://127.0.0.1:$PORT 2>&1 | head -n 1)
        echo "{\"timestamp\": \"$TIMESTAMP\", \"id\": $i, \"status\": \"FAIL\", \"event\": \"Intrusion/Connection block detected\", \"detail\": \"$ERROR_DETAIL\"}" >&3
    fi
    sleep 0.1
    if (( i % 1000 == 0 )); then
        echo "Audit Progress: $i / $ITERATIONS cycles complete."
    fi
done
exec 3>&-
termux-wake-unlock
echo "Audit Complete."
