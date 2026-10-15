# Daisy AI OS

Three parts:

1. **Solvex core** (`server.ts`, `src/kernel`, `src/runtime`): user-space Pipeline Kernel supervising 54 real OS processes + message bus.
2. **Daisy AI shell** (`daisy-ai-os/`): permissioned tools, live activation gate, optional LLM agent, browser desktop UI. Runs on a host OS.
3. **Daisy kernel** (`machine-os/`): a bootable i386 Multiboot kernel with IDT/PIC/PIT interrupts, preemptive kernel tasks, a Multiboot-backed physical allocator/heap, and a real RTL8139 ARP/IPv4/ICMP path. It boots and is smoke-tested under QEMU.
   It does **not** yet run parts 1 or 2. The AI agent/UI and the original 54 TypeScript nodes still require their host runtime; the kernel shell explicitly reports that none of those 54 nodes is native yet. See `machine-os/README.md` for exact implemented limits.

```bash
npx tsx server.ts          # core        http://localhost:3000
npm run os                 # AI shell    http://127.0.0.1:3100 (prints operator token)
cd machine-os && make run  # kernel      (needs qemu-system-i386)
cd machine-os && make qemu-test # real boot + timer, memory, NIC, ICMP smoke test
```
Optional agent: `DAISY_LLM_URL`, `DAISY_LLM_MODEL`, `DAISY_LLM_KEY` (any OpenAI-compatible endpoint).
Tests: `npm run verify:kernel`, `npm run verify:os`, `cd machine-os && make test && make qemu-test`.
