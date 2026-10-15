import { useState } from 'react';
import { motion } from 'motion/react';
import { Terminal, Network, ShieldAlert, Cpu, Laptop, ShieldCheck, Shield, Cloud } from 'lucide-react';
import { cn } from '../lib/utils';

export function RetroNetwork() {
  const [activeTab, setActiveTab] = useState<'app1' | 'app2' | 'switching' | 'app2018' | 'app2026' | 'app2027'>('app1');

  return (
    <div className="space-y-6 md:space-y-[30px] p-4 md:p-[30px] max-w-7xl mx-auto h-[calc(100vh-60px)] overflow-y-auto">
      <div className="flex items-center gap-4 border-b border-border pb-[20px]">
        <div className="p-3 bg-green-500/10 rounded-md border border-green-500/20">
          <Cpu className="w-6 h-6 text-green-500" />
        </div>
        <div>
          <h2 className="text-xl md:text-[22px] font-medium tracking-tight text-green-500">
            2015-2027 System Archives
          </h2>
          <p className="text-green-500/60 mt-1 text-xs md:text-[13px] font-mono">
            Accessing container orchestration, IoT botnet tracking, SDN Infrastructure, 2018-2025 ZTA, & 2026-2027 Neural/Quantum Nets...
          </p>
        </div>
      </div>

      <div className="flex space-x-2 border-b border-border">
        {[{ id: 'app1', label: 'Mirai Tracker', icon: Network },
          { id: 'switching', label: 'SDN & Spine-Leaf', icon: Cpu },
          { id: 'app2', label: 'Swarm Orchestrator', icon: Cloud },
          { id: 'app2018', label: 'ZTA & Web3 (2018-25)', icon: Laptop },
          { id: 'app2026', label: 'Agentic Swarm (2026)', icon: ShieldAlert },
          { id: 'app2027', label: 'Quantum Net (2027)', icon: ShieldCheck }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "px-4 py-2 text-[13px] font-mono flex items-center gap-2 border-b-2 transition-colors",
              activeTab === tab.id 
                ? "border-green-500 text-green-500 bg-green-500/5" 
                : "border-transparent text-muted-foreground hover:text-green-500/70"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/80 border border-green-500/20 rounded-md p-6 font-mono text-green-500"
      >
        {activeTab === 'app1' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-green-500/30 pb-2">Mirai Botnet IoT Tracer (2016 Build)</h3>
            <p className="text-xs text-green-400/70 mb-4">Scanning for open Telnet ports (23/2323) across consumer IoT ranges...</p>
            
            <div className="bg-black/50 border border-green-500/10 rounded p-4 h-[300px] overflow-y-auto text-xs space-y-2">
              <div className="flex gap-4 opacity-70 border-b border-green-500/20 pb-2">
                <span className="w-[100px]">TIMESTAMP</span>
                <span className="w-32">TARGET IP</span>
                <span className="w-24">DEVICE</span>
                <span className="w-32">CREDS (USER:PASS)</span>
                <span>STATUS</span>
              </div>
              {[
                { t: "Oct-21 11:10", ip: "185.11.x.x", dev: "Dahua DVR", c: "root:xc3511", s: "BRUTEFORCE_SUCCESS" },
                { t: "Oct-21 11:12", ip: "203.0.113.5", dev: "CCTV Cam", c: "admin:admin", s: "INFECTED" },
                { t: "Oct-21 11:15", ip: "198.51.100.10", dev: "Router", c: "root:vizxv", s: "PAYLOAD_DOWNLOADED" },
                { t: "Oct-21 11:18", ip: "192.0.2.55", dev: "IP Camera", c: "root:888888", s: "BRUTEFORCE_SUCCESS" },
                { t: "Oct-21 11:21", ip: "Dyn DNS", dev: "DDoS TARGET", c: "-", s: "INITIATING_DNS_FLOOD" },
                { t: "Oct-21 11:22", ip: "KrebsSec", dev: "DDoS TARGET", c: "-", s: "GRE_FLOOD_600GBPS" },
                { t: "Oct-21 11:30", ip: "185.22.x.x", dev: "Printer", c: "admin:1234", s: "BOT_ADDED" },
              ].map((pkt, i) => (
                <div key={i} className="flex gap-4 hover:bg-green-500/10 cursor-pointer">
                  <span className="w-[100px] text-green-500/50">{pkt.t}</span>
                  <span className="w-32 truncate text-green-400">{pkt.ip}</span>
                  <span className="w-24 truncate text-yellow-400">{pkt.dev}</span>
                  <span className="w-32 truncate text-red-400">{pkt.c}</span>
                  <span className="text-green-500/80 truncate">{pkt.s}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <button className="px-4 py-1 border border-green-500/50 hover:bg-green-500/20 text-sm">&gt; Map C2 Servers</button>
              <button className="px-4 py-1 border border-green-500/50 hover:bg-green-500/20 text-sm">&gt; Sync Yara Rules</button>
              <button className="px-4 py-1 border border-green-500/50 hover:bg-green-500/20 text-sm">&gt; Export IOCs</button>
            </div>
          </div>
        )}

        {activeTab === 'app2' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-green-500/30 pb-2">Docker Swarm / Kubernetes (Alpha) CLI</h3>
            <div className="bg-black border border-green-500/30 rounded p-4 h-[300px] overflow-y-auto w-full max-w-3xl font-mono text-sm leading-relaxed" style={{ textShadow: "0 0 5px rgba(34,197,94,0.5)"}}>
              <div className="text-green-500/70">~ $ kubectl get pods --all-namespaces</div>
              <div className="mt-2 text-green-400">
                NAMESPACE     NAME                              READY   STATUS    RESTARTS   AGE<br/>
                kube-system   kube-dns-6f4fd74bf-xyz12          3/3     Running   0          4d<br/>
                production    frontend-app-2016-848b9cdf-aaa    1/1     Running   2          12h<br/>
                production    microservice-redis-master-0       1/1     Running   0          4d<br/>
                production    payment-gateway-cb5d49            0/1     CrashLoopBackOff   12   45m<br/>
              </div>
              <div className="mt-4 text-green-500/70">~ $ docker network create -d overlay multi-host-net</div>
              <div className="text-blue-400 mt-1">z9g7f3v5e2b1x4a8c9d0y6w5u4t2</div>
              <div className="mt-4 text-green-500/70">~ $ docker service create --replicas 5 --network multi-host-net alpine ping 8.8.8.8</div>
              <div className="mt-2 text-green-400">
                [====&gt;                                           ] 1/5 replicas provisioned...<br/>
                [=========&gt;                                      ] 2/5 replicas provisioned...<br/>
                [================================================] 5/5 replicas provisioned.
              </div>
              <div className="mt-4 text-green-400 animate-pulse">~ $ _</div>
            </div>
          </div>
        )}

        {activeTab === 'switching' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-green-500/30 pb-2">Advanced Topics: 2015-2017 SDN & Infrastructure</h3>
            <p className="text-[13px] text-green-500/80 leading-relaxed max-w-4xl">
              From 2015 to 2017, enterprise networks underwent a massive shift from traditional hierarchical scaling to Software-Defined Networking (SDN) and flat "spine-and-leaf" datacenter topologies, driven by containerization explosion and east-west traffic needs.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border border-green-500/20 p-4 rounded bg-black/40">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <h4 className="font-bold text-red-400">VXLAN & Network Virtualization</h4>
                </div>
                <p className="text-xs text-green-500/70 mb-2">
                  With VMs and containers migrating across physical hosts, standard 802.1Q (4096 VLANs) wasn't enough. VXLAN encapsulated Layer 2 ethernet frames inside Layer 4 UDP packets, scaling to 16 million segment IDs across Layer 3 boundaries.
                </p>
                <code className="text-[10px] bg-black p-2 block text-red-300">
                  # interface nve 1<br/>
                  # source-interface loopback0<br/>
                  # member vni 10000 mcast-group 239.1.1.1
                </code>
              </div>

              <div className="border border-green-500/20 p-4 rounded bg-black/40">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-bold text-yellow-400">Spine-and-Leaf Architecture</h4>
                </div>
                <p className="text-xs text-green-500/70 mb-2">
                  Replaced the 3-tier (Core/Distribution/Access) model. Every leaf switch connects to every spine switch, ensuring predictable, one-hop-away latency for "east-west" server-to-server traffic critical for microservices.
                </p>
                <code className="text-[10px] bg-black p-2 block text-yellow-300">
                  # router bgp 65001<br/>
                  # neighbor 10.0.0.1 remote-as 65000<br/>
                  # address-family evpn
                </code>
              </div>

              <div className="border border-green-500/20 p-4 rounded bg-black/40">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-blue-400">OpenFlow & SDN Controllers</h4>
                </div>
                <p className="text-xs text-green-500/70 mb-2">
                  Decoupled the network "control plane" (decision making) from the "data plane" (hardware packet forwarding). Controllers like OpenDaylight programmed switch flow tables dynamically via APIs.
                </p>
                <code className="text-[10px] bg-black p-2 block text-blue-300">
                  # ovs-vsctl set-controller br0 tcp:192.168.1.10:6633<br/>
                  # ovs-ofctl dump-flows br0
                </code>
              </div>

              <div className="border border-green-500/20 p-4 rounded bg-black/40">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-green-400">Security Implications</h4>
                </div>
                <ul className="text-xs text-green-500/70 space-y-1 list-disc pl-4">
                  <li><strong>Microsegmentation:</strong> Policies moving from perimeter firewalls to vNICs inside hypervisors (e.g. NSX).</li>
                  <li><strong>Overlay Blindspots:</strong> Traditional IDS/IPS struggled to inspect VXLAN/GRE encapsulated traffic.</li>
                  <li><strong>Controller Takeover:</strong> An attacker compromising the central SDN controller owned the entire network.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'app2018' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold border-b border-green-500/30 pb-2">Intermediate Era: 2018-2025 Zero Trust & Web3 Exploits</h3>
            <p className="text-[13px] text-green-500/80 leading-relaxed max-w-4xl">
              The period bridging classical networking and modern AI swarms was characterized by the collapse of perimeter security (driving Zero Trust Architecture), the explosion of Ransomware-as-a-Service (RaaS), and multi-million dollar DeFi smart contract hemorrhages.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="border border-green-500/20 p-4 rounded bg-black/40">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  <h4 className="font-bold text-blue-400">Zero Trust Architecture (ZTA)</h4>
                </div>
                <p className="text-xs text-green-500/70 mb-2">
                  "Never trust, always verify." Identity and device health replaced the VPN perimeter. Every request to an internal application was dynamically authenticated, regardless of network location.
                </p>
              </div>

              <div className="border border-green-500/20 p-4 rounded bg-black/40">
                <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-5 h-5 text-red-400" />
                  <h4 className="font-bold text-red-400">RaaS & Supply Chain</h4>
                </div>
                <p className="text-xs text-green-500/70 mb-2">
                  Events like SolarWinds (2020) and Log4j (2021) demonstrated that exploiting upstream dependencies could compromise thousands of targets simultaneously, fueling automated extortion syndicates.
                </p>
              </div>

              <div className="border border-green-500/20 p-4 rounded bg-black/40 md:col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Network className="w-5 h-5 text-yellow-400" />
                  <h4 className="font-bold text-yellow-400">Decentralized Finance (DeFi) Hacks</h4>
                </div>
                <p className="text-xs text-green-500/70 mb-2">
                  On-chain bridges and flash loan architectures became massive targets. Attackers exploited logic flaws to drain liquidity pools.
                </p>
                <div className="bg-black border border-yellow-500/20 p-3 rounded font-mono text-[10px] space-y-1">
                  <div className="text-yellow-500/50">// REENTRANCY / FLASH LOAN ORBITAL STRIKE</div>
                  <div className="text-yellow-300">tx: 0x9f8b7c6d5e4f3a2b1c...</div>
                  <div className="text-green-400">- Flash Borrow: 50,000,000 USDC</div>
                  <div className="text-red-400">- Swap USDC {'->'} Illiquid Token (Price Manipulation)</div>
                  <div className="text-red-400">- Drain target protocol Vault based on manipulated oracle</div>
                  <div className="text-green-400">- Repay Flash Loan</div>
                  <div className="text-yellow-400">- Net Profit: $14.2M</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'app2026' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-green-500/30 pb-2">Autonomous LLM Swarm (2026 Build)</h3>
            <p className="text-xs text-green-400/70 mb-4">Tracing large-scale agentic networks deploying self-healing phishing campaigns...</p>
            
            <div className="bg-black/50 border border-green-500/10 rounded p-4 h-[300px] overflow-y-auto text-xs space-y-2">
              <div className="flex gap-4 opacity-70 border-b border-green-500/20 pb-2">
                <span className="w-[100px]">TIMESTAMP</span>
                <span className="w-32">AGENT ID</span>
                <span className="w-32">LLM MODEL</span>
                <span className="w-48">ACTION</span>
                <span>STATUS</span>
              </div>
              {[
                { t: "Nov-04 14:02", id: "Agent-0x4A", mod: "Llama-4-70B", a: "Generating deceptive landing page", s: "DEPLOYED" },
                { t: "Nov-04 14:05", id: "Agent-0x4A", mod: "Llama-4-70B", a: "A/B testing evasion keywords", s: "OPTIMIZING" },
                { t: "Nov-04 14:12", id: "Agent-0x9B", mod: "GPT-4.5", a: "Farming social accounts for referrals", s: "CAPTCHA_BYPASS" },
                { t: "Nov-04 14:15", id: "Agent-0x2C", mod: "Claude-3.5", a: "Auto-negotiating with channel bots", s: "SUCCESS_PAID_SOL" },
                { t: "Nov-04 14:22", id: "Swarm-Orch", mod: "Custom-Agent", a: "Re-routing traffic due to takedown", s: "DOMAIN_SHIFT" },
              ].map((log, i) => (
                <div key={i} className="flex gap-4 hover:bg-green-500/10 cursor-pointer">
                  <span className="w-[100px] text-green-500/50">{log.t}</span>
                  <span className="w-32 truncate text-green-400">{log.id}</span>
                  <span className="w-32 truncate text-yellow-400">{log.mod}</span>
                  <span className="w-48 truncate text-blue-400">{log.a}</span>
                  <span className="text-green-500/80 truncate">{log.s}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-4 mt-4">
              <button className="px-4 py-1 border border-green-500/50 hover:bg-green-500/20 text-sm">&gt; Analyze Prompts</button>
              <button className="px-4 py-1 border border-green-500/50 hover:bg-green-500/20 text-sm">&gt; Disrupt C2 Logic</button>
            </div>
          </div>
        )}

        {activeTab === 'app2027' && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold border-b border-green-500/30 pb-2">Quantum-Resistant Network Topology (2027 Spec)</h3>
            <div className="bg-black border border-green-500/30 rounded p-4 h-[300px] overflow-y-auto w-full font-mono text-sm leading-relaxed" style={{ textShadow: "0 0 5px rgba(34,197,94,0.5)"}}>
              <div className="text-green-500/70">~ $ qnet-cli topology status --lattice</div>
              <div className="mt-2 text-green-400">
                INITIALIZING LATTICE-BASED CRYPTOGRAPHY TUNNELS...<br/>
                Validating Kyber-1024 Key Exchanges on Spine Layer... [OK]<br/>
                Dilithium-5 Signatures verified across 1,024 Leaf Nodes.<br/>
              </div>
              <div className="mt-4 text-green-500/70">~ $ scan --target dark-web-casino-cluster</div>
              <div className="mt-1 text-red-500">WARNING: Shor's algorithm detection heuristics triggered on legacy RSA-2048 connections.</div>
              <div className="mt-2 text-green-400">
                Isolating legacy traffic into Quantum-Sandbox [vTKN-99.2]<br/>
                Initiating zero-knowledge proof verification for anonymous transactions...
              </div>
              <div className="mt-4 border-t border-dashed border-green-500/50 pt-2">
                <p className="text-blue-400"><strong>Advanced Topic: QKD (Quantum Key Distribution) in Illegal FinNet</strong></p>
                <p className="mt-1 text-green-500/80 text-xs">
                  By 2027, high-volume illicit syndicates began adopting QKD via entangled photon transmission over dark fiber to prevent "Store Now, Decrypt Later" attacks by regulatory authorities tracking unverified Crypto deposits.
                </p>
              </div>
              <div className="mt-4 text-green-400 animate-pulse">~ $ _</div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
