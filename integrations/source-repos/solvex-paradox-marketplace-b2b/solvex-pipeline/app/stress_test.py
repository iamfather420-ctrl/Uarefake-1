import time
import json
import random
import urllib.request
import urllib.error

# Internal "Self-Audit" and Stress Testing Logic for the SolveX Node
TARGET_URL = "http://127.0.0.1:8081/audit/protocol"

def generate_handshake_payload(is_valid=True):
    # Generating 380-Byte constraints test payloads
    if is_valid:
        # A payload designed to meet EXACTLY the 380-byte header format (mock)
        return {"header": "A" * 367, "timestamp": str(time.time()), "event": "SYNC"}
    else:
        # Intentional malformed network packet to test Forensic Audit logic
        return {"header": "B" * 500, "timestamp": str(time.time()), "event": "MALFORMED_SYNC"}

def run_stress_test(cycles=10, delay=1.0):
    print("Beginning Consensus Stress Test...")
    success_count = 0
    failure_count = 0
    
    for i in range(cycles):
        # Randomly decide to send a valid or invalid protocol packet
        valid = random.choice([True, False])
        payload = generate_handshake_payload(valid)
        
        try:
            # Send heartbeat/sync packet
            print(f"Cycle {i+1}/{cycles}: Sending {'Valid' if valid else 'Invalid'} Packet...")
            data = json.dumps(payload).encode('utf-8')
            req = urllib.request.Request(TARGET_URL, data=data, headers={'Content-Type': 'application/json'}, method='POST')
            with urllib.request.urlopen(req, timeout=2.0) as response:
                if response.status == 200:
                    print(f"   [SUCCESS] Node processed handshake: {response.read().decode()}")
                    success_count += 1
                else:
                    print(f"   [REJECTED] Node denied packet. Status Code: {response.status}")
                    failure_count += 1
        except urllib.error.URLError as e:
            print(f"   [ERROR] Node network latency / timeout: {e}")
            failure_count += 1
            
        time.sleep(delay)
        
    print("\n--- Stress Test Complete ---")
    print(f"Cycles: {cycles} | Handshakes Delivered/Accepted: {success_count} | Blocked/Failed: {failure_count}")

if __name__ == "__main__":
    run_stress_test(cycles=10, delay=0.5)
