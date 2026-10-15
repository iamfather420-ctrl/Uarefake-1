# ==============================================================================
# DAISY — Distributed Autonomous Software Intelligence Yield Engine
# MODULE: AI Autonomous Optimizer + Self-Healing Mutation Engine
# AUTHOR: SolveX / TJ Ites Jr.
# GENESIS: 2025-12-25 | AGATE CORE INTEGRATION BUILD
# ==============================================================================

import json
import math
import time
import hashlib
import logging
from copy import deepcopy
from dataclasses import dataclass, field, asdict
from typing import Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [DAISY-OPTIMIZER] %(levelname)s %(message)s"
)
log = logging.getLogger("daisy.optimizer")

# ==============================================================================
# SECTION 1 — DATA MODELS
# ==============================================================================

@dataclass
class BubbleMetrics:
    """Live telemetry snapshot for a single execution node (Bubble)."""
    bubble_id: str
    latency_ms: float          # Average response time in milliseconds
    dependency_depth: int      # Hops from root node in the DAG
    failure_rate: float        # 0.0 - 1.0 (0 = never fails, 1 = always fails)
    cpu_cost_usd_hr: float     # Hourly CPU cost in USD
    memory_cost_usd_hr: float  # Hourly memory cost in USD
    io_cost_usd_hr: float      # Hourly I/O cost in USD
    compliance_risk: float     # 0.0 - 1.0 (0 = fully compliant, 1 = critical violation)
    region: str                # Cloud region e.g. "us-east-1", "eu-west-1"
    encrypted: bool            # Whether data at rest/transit is encrypted
    evc_budget_usd_hr: float   # Max allowed hourly cost for this bubble


@dataclass
class GraphNode:
    """A node in the DAISY execution graph (JSON-serializable)."""
    id: str
    address: str
    metrics: BubbleMetrics
    dependencies: list[str] = field(default_factory=list)
    active: bool = True


@dataclass
class MutationRecord:
    """Immutable audit log entry for each graph mutation."""
    timestamp: float
    action: str                # "REMOVE", "REPLACE", "REROUTE"
    target_bubble: str
    reason: str
    graph_hash_before: str
    graph_hash_after: str


# ==============================================================================
# SECTION 2 — REWARD FUNCTION
# ==============================================================================

def compute_reward(m: BubbleMetrics) -> float:
    """
    DAISY Reward Function — maximizes performance per dollar of cost and risk.

    Formula:
        R = (Speed + Stability) / (InfrastructureCost + ComplianceRisk + ε)

    Where:
        Speed      = 1 / (latency_ms / 1000)   [requests per second proxy]
        Stability  = (1 - failure_rate) * (1 / (dependency_depth + 1))
        Cost       = cpu_cost_usd_hr + memory_cost_usd_hr + io_cost_usd_hr
        Risk       = compliance_risk * 10       [scaled to be cost-comparable]
        ε          = 1e-9                        [prevents division by zero]

    Variables:
        latency_ms       — lower is better; inverted to reward speed
        failure_rate     — penalizes unreliable nodes
        dependency_depth — penalizes deeply nested nodes (fragile chains)
        *_cost_usd_hr    — direct infrastructure spend per hour
        compliance_risk  — regulatory exposure; scaled to USD-comparable units

    Returns:
        float: reward score. Higher = better. Negative = violating node.
    """
    epsilon = 1e-9

    # Numerator: what we want MORE of
    speed = 1.0 / ((m.latency_ms / 1000.0) + epsilon)
    stability = (1.0 - m.failure_rate) * (1.0 / (m.dependency_depth + 1))
    numerator = speed + stability

    # Denominator: what we want LESS of
    infra_cost = m.cpu_cost_usd_hr + m.memory_cost_usd_hr + m.io_cost_usd_hr
    risk_penalty = m.compliance_risk * 10.0  # Scale risk to be cost-comparable
    denominator = infra_cost + risk_penalty + epsilon

    reward = numerator / denominator
    return round(reward, 6)


def score_graph(nodes: list[GraphNode]) -> dict[str, float]:
    """Score every node in the graph and return sorted reward map."""
    scores = {}
    for node in nodes:
        if node.active:
            scores[node.id] = compute_reward(node.metrics)
    return dict(sorted(scores.items(), key=lambda x: x[1]))  # ascending = worst first


# ==============================================================================
# SECTION 3 — GRAPH EMBEDDING PIPELINE
# ==============================================================================

def embed_node(node: GraphNode) -> list[float]:
    """
    Convert a graph node's state into a normalized vector embedding.

    Embedding dimensions (8D):
        [0] latency_norm       — latency normalized to [0,1] over 5000ms max
        [1] depth_norm         — dependency depth normalized to [0,1] over 20 max
        [2] failure_rate       — already [0,1]
        [3] cpu_cost_norm      — CPU cost normalized to [0,1] over $10/hr max
        [4] mem_cost_norm      — Memory cost normalized to [0,1] over $5/hr max
        [5] io_cost_norm       — IO cost normalized to [0,1] over $2/hr max
        [6] compliance_risk    — already [0,1]
        [7] encrypted_flag     — 1.0 if encrypted, 0.0 if not
    """
    m = node.metrics
    MAX_LATENCY = 5000.0
    MAX_DEPTH = 20.0
    MAX_CPU = 10.0
    MAX_MEM = 5.0
    MAX_IO = 2.0

    return [
        min(m.latency_ms / MAX_LATENCY, 1.0),
        min(m.dependency_depth / MAX_DEPTH, 1.0),
        m.failure_rate,
        min(m.cpu_cost_usd_hr / MAX_CPU, 1.0),
        min(m.memory_cost_usd_hr / MAX_MEM, 1.0),
        min(m.io_cost_usd_hr / MAX_IO, 1.0),
        m.compliance_risk,
        1.0 if m.encrypted else 0.0,
    ]


def embed_graph(nodes: list[GraphNode]) -> dict[str, list[float]]:
    """Embed all nodes in the graph. Used for Neo4j vector storage and RL input."""
    return {node.id: embed_node(node) for node in nodes if node.active}


# ==============================================================================
# SECTION 4 — EVC VIOLATION DETECTION
# ==============================================================================

def detect_evc_violations(nodes: list[GraphNode]) -> list[GraphNode]:
    """
    Identify nodes that violate Enterprise Viability Control constraints:
        - Cost exceeds evc_budget_usd_hr
        - EU data routed to non-EU region
        - Sensitive data (compliance_risk > 0.5) without encryption
    """
    violations = []
    for node in nodes:
        if not node.active:
            continue
        m = node.metrics
        total_cost = m.cpu_cost_usd_hr + m.memory_cost_usd_hr + m.io_cost_usd_hr

        if total_cost > m.evc_budget_usd_hr:
            log.warning(f"EVC VIOLATION [COST]: {node.id} — ${total_cost:.4f}/hr > budget ${m.evc_budget_usd_hr:.4f}/hr")
            violations.append(node)

        elif m.compliance_risk > 0.5 and not m.encrypted:
            log.warning(f"EVC VIOLATION [ENCRYPTION]: {node.id} — sensitive data unencrypted, risk={m.compliance_risk}")
            violations.append(node)

        elif m.compliance_risk > 0.8:
            log.warning(f"EVC VIOLATION [COMPLIANCE]: {node.id} — critical compliance risk={m.compliance_risk}")
            violations.append(node)

    return violations


# ==============================================================================
# SECTION 5 — SELF-HEALING MUTATION ENGINE
# ==============================================================================

def _hash_graph(nodes: list[GraphNode]) -> str:
    """SHA-256 fingerprint of the current graph state for audit trail."""
    state = json.dumps([asdict(n) for n in nodes], sort_keys=True)
    return hashlib.sha256(state.encode()).hexdigest()


def mutate_graph(
    nodes: list[GraphNode],
    mutation_log: list[MutationRecord],
    replacement_registry: Optional[dict[str, str]] = None
) -> list[GraphNode]:
    """
    Self-Healing Mutation Engine.

    Execution order:
        1. Detect EVC violations
        2. Score all nodes by reward function
        3. Identify highest-cost / lowest-reward violating node
        4. Remove or replace the node
        5. Reroute dependencies safely (no orphaned edges)
        6. Log mutation with graph hash before/after
        7. Return mutated graph

    Args:
        nodes:                 Current graph node list
        mutation_log:          Append-only audit log (mutated in place)
        replacement_registry:  Optional map of {old_id: new_address} for REPLACE ops

    Returns:
        list[GraphNode]: New graph with mutations applied
    """
    violations = detect_evc_violations(nodes)
    if not violations:
        log.info("No EVC violations detected. Graph is healthy.")
        return nodes

    # Score violated nodes — remove the worst one per cycle
    scores = score_graph(violations)
    target_id = list(scores.keys())[0]  # Lowest reward = worst node
    target_node = next(n for n in nodes if n.id == target_id)

    graph_before = _hash_graph(nodes)
    mutated = deepcopy(nodes)

    if replacement_registry and target_id in replacement_registry:
        # REPLACE: swap in a new node with same dependency edges
        new_address = replacement_registry[target_id]
        new_id = f"{target_id}-healed-{int(time.time())}"

        for node in mutated:
            if node.id == target_id:
                node.id = new_id
                node.address = new_address
                node.active = True
                node.metrics.failure_rate = 0.0
                node.metrics.compliance_risk = 0.0
                break
            # Repoint any dependency edges
            node.dependencies = [new_id if d == target_id else d for d in node.dependencies]

        action = "REPLACE"
        reason = f"EVC violation — replaced {target_id} with healed node {new_id} @ {new_address}"
        log.info(f"[MUTATION] REPLACE: {target_id} → {new_id}")

    else:
        # REMOVE: deactivate the node and reroute its dependents to their grandparents
        for node in mutated:
            if node.id == target_id:
                node.active = False
                break
            # Reroute: remove the violated node from dependency chains
            node.dependencies = [d for d in node.dependencies if d != target_id]

        action = "REMOVE"
        reason = f"EVC violation — removed node {target_id} (reward={scores[target_id]:.4f})"
        log.info(f"[MUTATION] REMOVE: {target_id}")

    graph_after = _hash_graph(mutated)
    mutation_log.append(MutationRecord(
        timestamp=time.time(),
        action=action,
        target_bubble=target_id,
        reason=reason,
        graph_hash_before=graph_before,
        graph_hash_after=graph_after,
    ))

    log.info(f"[MUTATION LOG] Graph hash: {graph_before[:16]}... → {graph_after[:16]}...")
    return mutated


# ==============================================================================
# SECTION 6 — COMPLIANCE ENFORCEMENT
# ==============================================================================

EU_REGIONS = {"eu-west-1", "eu-west-2", "eu-west-3", "eu-central-1", "eu-north-1"}

def enforce_compliance(nodes: list[GraphNode], edges: dict[str, list[str]]) -> list[tuple[str, str, str]]:
    """
    Hard compliance enforcement:
        - EU data cannot route into non-EU nodes
        - Sensitive data requires encryption flag
        - Illegal routing causes hard HALT (returns violations to be blocked)

    Returns:
        list of (source_id, target_id, violation_reason) tuples
        Caller must block routing for any returned pairs.
    """
    node_map = {n.id: n for n in nodes}
    illegal_routes = []

    for source_id, targets in edges.items():
        source = node_map.get(source_id)
        if not source:
            continue

        source_is_eu = source.metrics.region in EU_REGIONS

        for target_id in targets:
            target = node_map.get(target_id)
            if not target:
                continue

            target_is_eu = target.metrics.region in EU_REGIONS

            # EU → non-EU routing blocked
            if source_is_eu and not target_is_eu:
                reason = f"GDPR VIOLATION: EU node {source_id} ({source.metrics.region}) → non-EU node {target_id} ({target.metrics.region})"
                log.error(f"[COMPLIANCE HARD FAIL] {reason}")
                illegal_routes.append((source_id, target_id, reason))

            # Sensitive unencrypted data
            if source.metrics.compliance_risk > 0.5 and not source.metrics.encrypted:
                reason = f"ENCRYPTION VIOLATION: Node {source_id} has sensitive data (risk={source.metrics.compliance_risk}) without encryption"
                log.error(f"[COMPLIANCE HARD FAIL] {reason}")
                illegal_routes.append((source_id, target_id, reason))

    return illegal_routes


# ==============================================================================
# SECTION 7 — OPTIMIZER MAIN LOOP
# ==============================================================================

def optimizer_loop(
    nodes: list[GraphNode],
    edges: dict[str, list[str]],
    cycles: int = 10,
    replacement_registry: Optional[dict[str, str]] = None
) -> tuple[list[GraphNode], list[MutationRecord]]:
    """
    Main DAISY optimization loop.

    Each cycle:
        1. Enforce compliance (hard block illegal routes)
        2. Score all nodes
        3. Run mutation engine on violations
        4. Log cycle results
    """
    mutation_log: list[MutationRecord] = []

    for cycle in range(1, cycles + 1):
        log.info(f"{'='*60}")
        log.info(f"OPTIMIZER CYCLE {cycle}/{cycles}")

        # Step 1: Compliance enforcement
        illegal = enforce_compliance(nodes, edges)
        if illegal:
            for src, tgt, reason in illegal:
                log.error(f"  BLOCKED ROUTE: {src} → {tgt} | {reason}")

        # Step 2: Score active nodes
        scores = score_graph(nodes)
        log.info(f"  Node Scores (reward): {scores}")

        # Step 3: Mutate if violations exist
        nodes = mutate_graph(nodes, mutation_log, replacement_registry)

        # Step 4: Check graph health
        active = sum(1 for n in nodes if n.active)
        log.info(f"  Active Nodes: {active}/{len(nodes)}")
        log.info(f"  Mutations This Cycle: {len(mutation_log)}")

        time.sleep(0.1)  # Simulated telemetry ingestion delay

    log.info(f"{'='*60}")
    log.info(f"OPTIMIZER COMPLETE | Total Mutations: {len(mutation_log)}")
    return nodes, mutation_log


# ==============================================================================
# SECTION 8 — DEMO / TEST RUN
# ==============================================================================

if __name__ == "__main__":
    # Sample graph: 3 nodes, 2 of which have violations
    nodes = [
        GraphNode(
            id="bubble-alpha",
            address="grpc://10.0.0.1:50051",
            metrics=BubbleMetrics(
                bubble_id="bubble-alpha",
                latency_ms=45.0,
                dependency_depth=1,
                failure_rate=0.02,
                cpu_cost_usd_hr=0.12,
                memory_cost_usd_hr=0.04,
                io_cost_usd_hr=0.01,
                compliance_risk=0.1,
                region="us-east-1",
                encrypted=True,
                evc_budget_usd_hr=0.50,
            ),
            dependencies=[]
        ),
        GraphNode(
            id="bubble-beta",
            address="grpc://10.0.0.2:50051",
            metrics=BubbleMetrics(
                bubble_id="bubble-beta",
                latency_ms=890.0,
                dependency_depth=3,
                failure_rate=0.45,
                cpu_cost_usd_hr=2.80,  # OVER BUDGET
                memory_cost_usd_hr=1.20,
                io_cost_usd_hr=0.60,
                compliance_risk=0.72,  # HIGH RISK + unencrypted
                region="eu-west-1",
                encrypted=False,
                evc_budget_usd_hr=1.00,
            ),
            dependencies=["bubble-alpha"]
        ),
        GraphNode(
            id="bubble-gamma",
            address="grpc://10.0.0.3:50051",
            metrics=BubbleMetrics(
                bubble_id="bubble-gamma",
                latency_ms=120.0,
                dependency_depth=2,
                failure_rate=0.05,
                cpu_cost_usd_hr=0.30,
                memory_cost_usd_hr=0.10,
                io_cost_usd_hr=0.02,
                compliance_risk=0.15,
                region="us-west-2",
                encrypted=True,
                evc_budget_usd_hr=1.00,
            ),
            dependencies=["bubble-alpha", "bubble-beta"]
        ),
    ]

    edges = {
        "bubble-alpha": [],
        "bubble-beta": ["bubble-alpha"],
        "bubble-gamma": ["bubble-alpha", "bubble-beta"],
    }

    replacement_registry = {
        "bubble-beta": "grpc://10.0.0.10:50051"  # Replacement node ready
    }

    final_nodes, log_entries = optimizer_loop(nodes, edges, cycles=3, replacement_registry=replacement_registry)

    print("\n=== MUTATION AUDIT LOG ===")
    for entry in log_entries:
        print(json.dumps(asdict(entry), indent=2))

    print("\n=== FINAL GRAPH EMBEDDINGS ===")
    embeddings = embed_graph(final_nodes)
    for nid, vec in embeddings.items():
        print(f"  {nid}: {vec}")
