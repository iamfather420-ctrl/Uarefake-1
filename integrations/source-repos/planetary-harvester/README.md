# Planetary Harvester

**Sovereign Systemic Waste Reclamation Engine**

A comprehensive system for autonomous waste reclamation and resource optimization, built on the SwarmOS architecture with integrated web dashboard and mobile application.

## System Overview

Planetary Harvester implements a sovereign, privacy-first approach to systemic waste reclamation through:

- **SwarmOS Engine**: Core consensus and validation framework
- **Sovereign Gate**: 380-character cryptographic handshake validation
- **Consensus Ledger**: Immutable forensic record of all operations
- **Waste Reclamation**: Autonomous processing and recovery of systemic waste
- **Truth Pillars**: Governance principles ensuring ethical operation

## Truth Pillars

The system operates under four foundational principles:

1. **Identity as a Right** - Sovereign identity validation without external dependencies
2. **Privacy as Default** - All operations maintain cryptographic privacy guarantees
3. **Financial Health** - Transparent accounting of all waste reclamation value
4. **Human Guardianship** - Human oversight and control of all autonomous processes

## Architecture

### Dual-Root Topology

```
System Node Root:     ~/.agate_node/
  └── vault/
      ├── ai_handshake.txt          (380-character sovereign gate)
      ├── consensus_memory.json     (immutable ledger)
      └── waste_reclamation.json    (reclamation tracking)

App Workspace Root:   ~/projects/planetary_harvester/
  ├── main.py                       (Kivy mobile app)
  ├── swarm_engine.py              (SwarmOS engine)
  ├── generate_assets.py           (UI asset generation)
  ├── build_handler.py             (Build configuration)
  ├── build_config.yaml            (YAML build spec)
  ├── buildozer.spec               (Android build config)
  └── sx-hub.sh                    (System monitoring)
```

## Components

### 1. SwarmOS Engine (`swarm_engine.py`)

Core system engine implementing:

- **Sovereign Gate Validation**: Validates 380-character handshake
- **Consensus Memory**: Manages immutable ledger of operations
- **Waste Reclamation**: Processes and tracks waste recovery
- **System Status**: Real-time operational metrics

**Usage:**
```bash
python3 swarm_engine.py
```

**Output:**
- Initializes vault structure with 0o700 permissions
- Generates 380-character handshake if missing
- Creates consensus_memory.json ledger
- Creates waste_reclamation.json tracker
- Displays system status and metrics

### 2. Build Handler (`build_handler.py`)

Manages Android build configuration with:

- **YAML Configuration**: Loads build_config.yaml
- **zlib Header Setup**: Configures zlib for all architectures
- **buildozer.spec Validation**: Ensures all required settings
- **Build Environment**: Prepares complete build environment

**Commands:**
```bash
python3 build_handler.py prepare    # Prepare build environment
python3 build_handler.py validate   # Validate buildozer.spec
python3 build_handler.py zlib       # Setup zlib headers
python3 build_handler.py cmd        # Generate build command
```

### 3. Asset Generation (`generate_assets.py`)

Generates required UI assets:

- **icon.png** (512x512): Application icon with white frame
- **presplash.png** (1080x1920): Splash screen with white frame

**Usage:**
```bash
python3 generate_assets.py
```

### 4. System Hub (`sx-hub.sh`)

Real-time system monitoring and status reporting:

- Vault directory validation
- Ledger file verification
- Storage information
- SwarmOS engine validation

**Usage:**
```bash
./sx-hub.sh
```

### 5. Mobile Application (`main.py`)

Kivy-based mobile interface:

- Dark background (#0A0A0A)
- Green text display (#00FF00)
- Sovereign identity display
- Audit status indicator

**Usage:**
```bash
python3 main.py
```

### 6. Web Dashboard

React-based web interface displaying:

- System status and operational state
- Protocol version and quantum state
- Waste reclamation metrics
- Node configuration details
- Truth pillars governance display
- Real-time telemetry updates

## Build Configuration

### buildozer.spec

Android build specification with:

- **API Level**: 34 (target), 21 (minimum)
- **NDK Version**: 25b
- **zlib Support**: Outsourced headers for all architectures
- **Debug Symbols**: Enabled for development
- **Permissions**: INTERNET, ACCESS_NETWORK_STATE

### build_config.yaml

YAML configuration for:

- Android debug settings
- zlib architecture configuration
- Gradle dependencies
- Application metadata
- Asset specifications

## Installation & Setup

### Prerequisites

- Python 3.8+
- Kivy 2.2.0+
- Pillow (PIL)
- PyYAML
- Buildozer (for Android builds)

### Initial Setup

1. **Initialize SwarmOS Engine:**
   ```bash
   python3 swarm_engine.py
   ```

2. **Generate UI Assets:**
   ```bash
   python3 generate_assets.py
   ```

3. **Prepare Build Environment:**
   ```bash
   python3 build_handler.py prepare
   ```

4. **Check System Status:**
   ```bash
   ./sx-hub.sh
   ```

### Running the Mobile App

```bash
python3 main.py
```

### Building Android APK

```bash
python3 build_handler.py prepare
buildozer android debug
```

## System Ledgers

### Consensus Memory (`consensus_memory.json`)

```json
{
  "node_configuration": {
    "protocol_version": "3.0.0-QuantumEdge",
    "sovereign_identity_node": "0x7d999f82972d557a83f778d412d62849cd2f2bd6",
    "truth_pillars": [
      "Identity as a Right",
      "Privacy as Default",
      "Financial Health",
      "Human Guardianship"
    ]
  },
  "consensus_state": {
    "last_validated_block": 0,
    "quantum_state_signature": "STABLE"
  },
  "forensic_ledger_immutable": []
}
```

### Waste Reclamation (`waste_reclamation.json`)

```json
{
  "reclamation_protocol": "BASE-WASTE-HARVESTER-v1.0",
  "total_waste_processed": 0,
  "reclamation_events": [],
  "efficiency_metrics": {
    "recovery_rate": 0.0,
    "processing_speed": 0.0,
    "system_health": "OPTIMAL"
  }
}
```

## Security

### Sovereign Gate

The 380-character handshake provides:

- Cryptographic validation of system initialization
- Exact length verification (380 characters)
- Prevention of malformed intrusions
- Quantum state signature validation

### Vault Permissions

System vault directory permissions: `0o700` (read/write/execute for owner only)

### Truth Pillars

Governance ensures:

- Privacy-first operation
- Human oversight
- Transparent accounting
- Sovereign identity

## Monitoring & Telemetry

### Real-time Metrics

- System operational status
- Protocol version verification
- Quantum state signature
- Waste processing volume
- System health indicators

### Logging

- Build process logs
- System initialization logs
- Waste reclamation events
- Error and warning messages

## Development

### Project Structure

```
Planetary-Harvester/
├── main.py                 # Kivy mobile app
├── swarm_engine.py        # SwarmOS core engine
├── generate_assets.py     # Asset generation
├── build_handler.py       # Build management
├── build_config.yaml      # YAML configuration
├── buildozer.spec         # Android build spec
├── sx-hub.sh              # System monitoring
├── icon.png               # App icon
├── presplash.png          # Splash screen
└── README.md              # This file
```

### Adding Features

1. Extend `swarm_engine.py` for new reclamation protocols
2. Update `build_config.yaml` for build changes
3. Modify `main.py` for UI updates
4. Regenerate assets with `generate_assets.py`

## Troubleshooting

### Handshake Validation Fails

- Ensure `~/.agate_node/vault/ai_handshake.txt` exists
- Verify file is exactly 380 characters: `wc -c ~/.agate_node/vault/ai_handshake.txt`
- Regenerate with: `python3 swarm_engine.py`

### Build Fails

- Run: `python3 build_handler.py validate`
- Check zlib setup: `python3 build_handler.py zlib`
- Verify buildozer.spec: `cat buildozer.spec | grep android`

### System Status Shows Error

- Check vault directory: `ls -la ~/.agate_node/vault/`
- Verify ledger files exist and are readable
- Run: `./sx-hub.sh` for detailed diagnostics

## License

Planetary Harvester - Sovereign Systemic Waste Reclamation Engine

## Support

For issues, questions, or contributions, refer to the system diagnostics:

```bash
./sx-hub.sh
python3 swarm_engine.py
python3 build_handler.py validate
```

---

**Version**: 1.0.0  
**Protocol**: 3.0.0-QuantumEdge  
**Status**: OPERATIONAL  
**System Health**: OPTIMAL
