#!/bin/bash
# SolveX-Integrated-Pipeline: user_management.sh
# Location: os-core/user_management.sh
# Purpose: Offline Termux User Management interface to the Node.

NODE_URL="http://localhost:8000/api/v1/users"

echo "==============================================="
echo "   SOLVEX NODE: USER MANAGEMENT (OFFLINE)      "
echo "==============================================="

command_missing=0
if ! command -v curl >/dev/null 2>&1; then
    echo "ERROR: 'curl' is required for Node API interaction."
    command_missing=1
fi
if ! command -v jq >/dev/null 2>&1; then
    echo "ERROR: 'jq' is required for Node API interaction."
    command_missing=1
fi

if [ $command_missing -eq 1 ]; then
    echo "Please install missing dependencies (pkg install curl jq)."
    exit 1
fi

show_help() {
    echo "Usage: ./os-core/user_management.sh [command]"
    echo ""
    echo "Commands:"
    echo "  register [username] [password] [role]   - Register a new node user"
    echo "  login [username] [password]             - Authenticate against the node"
    echo "  assign [username] [new_role] [admin_token]- Update user role (requires admin)"
    echo "  ping                                    - Check node connectivity"
    echo ""
}

ping_node() {
    echo "[-] Pinging Node at $NODE_URL..."
    resp=$(curl -s "http://localhost:8000/api/v1/health")
    if [ -z "$resp" ]; then
        echo "[X] Node Offline or Unreachable."
    else
        echo "[✓] Node Active: $resp"
    fi
}

register_user() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "Error: Missing arguments for register."
        show_help
        return
    fi
    local role=${3:-viewer}
    echo "[-] Registering $1 as $role..."
    
    payload=$(jq -n --arg user "$1" --arg pass "$2" --arg role "$role" '{username: $user, password: $pass, role: $role}')
    
    curl -s -X POST "$NODE_URL/register" \
        -H "Content-Type: application/json" \
        -d "$payload" | jq .
}

login_user() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        echo "Error: Missing arguments for login."
        show_help
        return
    fi
    echo "[-] Authenticating $1..."
    
    payload=$(jq -n --arg user "$1" --arg pass "$2" '{username: $user, password: $pass}')
    
    curl -s -X POST "$NODE_URL/login" \
        -H "Content-Type: application/json" \
        -d "$payload" | jq .
}

assign_role() {
    if [ -z "$1" ] || [ -z "$2" ] || [ -z "$3" ]; then
        echo "Error: Missing arguments for assign."
        show_help
        return
    fi
    echo "[-] Upgrading $1 to $2..."
    
    payload=$(jq -n --arg user "$1" --arg role "$2" '{username: $user, new_role: $role}')
    
    curl -s -X POST "$NODE_URL/assign-role" \
        -H "Content-Type: application/json" \
        -H "x-user-token: $3" \
        -d "$payload" | jq .
}

case "$1" in
    register)
        register_user "$2" "$3" "$4"
        ;;
    login)
        login_user "$2" "$3"
        ;;
    assign)
        assign_role "$2" "$3" "$4"
        ;;
    ping)
        ping_node
        ;;
    *)
        show_help
        ;;
esac
