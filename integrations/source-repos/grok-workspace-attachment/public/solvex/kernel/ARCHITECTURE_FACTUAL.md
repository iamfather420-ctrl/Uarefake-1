# Architecture (Authoritative)

## Single Pipeline Kernel

Solvex runs under **one user-space pipeline kernel** (`PipelineKernel`).

That kernel owns:

1. **54 real OS child processes** (one per pipeline node, ports 41001–41054)
2. **HTTP message bus** (`127.0.0.1:40999`)
3. **Boot / halt / reboot** of the whole pipeline
4. **Per-node reboot** (kill + respawn → new PID)
5. **Per-node diagnostic** (live HTTP health probe)

It is the single supervisor of the Solvex system. It is **not** a host operating-system kernel (no ring-0, no hardware control, no replacing Linux/Windows).

## Layers

```
UI (React AI shell)
        │
        ▼
API  (/api/kernel/*, /api/grid/*, /api/bus/*)
        │
        ▼
Pipeline Kernel  (single)
        │
        ├── Message bus
        └── 54 node worker processes
              + in-process modules (Z3, MMTAI, NOPOT, ledger, market, PayPal)
```

## Formal layer

120 classic paradox cases as **bounded SAT witnesses** for Z3.  
No claim of unrestricted resolution of the historical paradoxes.

## Credentials

PayPal and DB secrets come from environment variables only (see `.env.example`).

## Run

```bash
npx tsx server.ts
# Kernel boots → 54 processes + bus → API/UI
```
