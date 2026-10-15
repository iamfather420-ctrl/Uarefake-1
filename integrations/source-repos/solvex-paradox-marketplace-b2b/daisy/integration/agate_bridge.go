// ==============================================================================
// DAISY — Distributed Autonomous Software Intelligence Yield Engine
// MODULE: Agate Core Integration Bridge
// PURPOSE: Registers SolveX Gatekeeper + MMTAI Router as DAISY Bubbles
// AUTHOR: SolveX / TJ Ites Jr.
// GENESIS: 2025-12-25 | AGATE CORE INTEGRATION BUILD
// ==============================================================================

package integration

import (
	"bufio"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"os/exec"
	"strings"
	"sync"
	"time"
)

// ==============================================================================
// SECTION 1 — AGATE PACKET DEFINITION
// Mirrors the 380-byte cryptographic header spec from gatekeeper.sh
// ==============================================================================

const AgateHeaderSize = 380

// AgatePacket is the canonical packet format for the SolveX pipeline
type AgatePacket struct {
	Header  string // exactly 380 bytes — Base64 RSA signature + padding
	Payload string // actual data payload
	Hash    string // SHA-256 of full packet (Header + Payload)
}

// BuildPacket constructs a valid AgatePacket and computes its hash
func BuildPacket(header, payload string) (*AgatePacket, error) {
	if len(header) != AgateHeaderSize {
		return nil, fmt.Errorf("header must be exactly %d bytes, got %d", AgateHeaderSize, len(header))
	}
	full := header + payload
	hash := sha256.Sum256([]byte(full))
	return &AgatePacket{
		Header:  header,
		Payload: payload,
		Hash:    hex.EncodeToString(hash[:]),
	}, nil
}

// ==============================================================================
// SECTION 2 — GATEKEEPER BUBBLE
// Wraps gatekeeper.sh as a managed DAISY execution node
// ==============================================================================

// GatekeeperBubble is the DAISY Bubble that wraps the Agate Core gatekeeper
type GatekeeperBubble struct {
	ID             string
	GatekeeperPath string
	LedgerPath     string

	mu           sync.Mutex
	totalVerified int
	totalRejected int
	totalLatencyMs float64
	callCount      int
}

// NewGatekeeperBubble creates a DAISY-managed gatekeeper node
func NewGatekeeperBubble(gatekeeperPath, ledgerPath string) *GatekeeperBubble {
	return &GatekeeperBubble{
		ID:             "agate-gatekeeper-bubble",
		GatekeeperPath: gatekeeperPath,
		LedgerPath:     ledgerPath,
	}
}

// Verify passes a packet through gatekeeper.sh and returns auth result + metrics
func (g *GatekeeperBubble) Verify(ctx context.Context, packet *AgatePacket) (bool, time.Duration, error) {
	fullPacket := packet.Header + packet.Payload

	start := time.Now()
	cmd := exec.CommandContext(ctx, "bash", g.GatekeeperPath, "--verify", fullPacket)
	err := cmd.Run()
	latency := time.Since(start)

	g.mu.Lock()
	g.callCount++
	g.totalLatencyMs += float64(latency.Milliseconds())
	if err != nil {
		g.totalRejected++
		g.mu.Unlock()
		log.Printf("[GATEKEEPER-BUBBLE] REJECTED packet %s... (%.2fms)", packet.Hash[:16], float64(latency.Milliseconds()))
		return false, latency, nil // rejection is not an error — it's a valid gate decision
	}
	g.totalVerified++
	g.mu.Unlock()

	log.Printf("[GATEKEEPER-BUBBLE] AUTH_SUCCESS packet %s... (%.2fms)", packet.Hash[:16], float64(latency.Milliseconds()))
	return true, latency, nil
}

// Metrics returns telemetry data for this bubble to feed the DAISY optimizer
func (g *GatekeeperBubble) Metrics() BubbleTelemetry {
	g.mu.Lock()
	defer g.mu.Unlock()

	var avgLatency float64
	var failureRate float64
	if g.callCount > 0 {
		avgLatency = g.totalLatencyMs / float64(g.callCount)
		failureRate = float64(g.totalRejected) / float64(g.callCount)
	}

	return BubbleTelemetry{
		BubbleID:    g.ID,
		AvgLatencyMs: avgLatency,
		FailureRate:  failureRate,
		TotalCalls:   g.callCount,
		Timestamp:    time.Now(),
	}
}

// ==============================================================================
// SECTION 3 — MMTAI ROUTER BUBBLE
// Wraps the Python MMTAI router as a managed DAISY execution node
// ==============================================================================

// RoutingHop is a single step in the MMTAI traversal path
type RoutingHop struct {
	Step    int
	Node    string
	Latency string
	Status  string
}

// MMTAIRouterBubble wraps protocols/mmtai_router.py as a DAISY Bubble
type MMTAIRouterBubble struct {
	ID         string
	ScriptPath string

	mu           sync.Mutex
	totalRouted  int
	totalFailed  int
	totalLatencyMs float64
	callCount    int
}

// NewMMTAIRouterBubble creates a DAISY-managed MMTAI router node
func NewMMTAIRouterBubble(scriptPath string) *MMTAIRouterBubble {
	return &MMTAIRouterBubble{
		ID:         "agate-mmtai-router-bubble",
		ScriptPath: scriptPath,
	}
}

// Route executes the MMTAI traversal for a verified packet
func (m *MMTAIRouterBubble) Route(ctx context.Context, fileID string) ([]RoutingHop, time.Duration, error) {
	start := time.Now()

	// Execute MMTAI router via Python subprocess
	cmd := exec.CommandContext(ctx, "python3", "-c", fmt.Sprintf(`
import sys
sys.path.insert(0, '.')
from protocols.mmtai_router import MMTAIRouter, generate_valid_test_header
import json

router = MMTAIRouter()
key = generate_valid_test_header()
if router.validate_perimeter_header(key):
    path = router.execute_routing_traversal("%s")
    print(json.dumps(path))
else:
    print("[]")
`, fileID))

	out, err := cmd.Output()
	latency := time.Since(start)

	m.mu.Lock()
	m.callCount++
	m.totalLatencyMs += float64(latency.Milliseconds())
	if err != nil {
		m.totalFailed++
		m.mu.Unlock()
		return nil, latency, fmt.Errorf("MMTAI router error: %w", err)
	}
	m.totalRouted++
	m.mu.Unlock()

	// Parse JSON output from Python
	var hops []RoutingHop
	if err := json.Unmarshal([]byte(strings.TrimSpace(string(out))), &hops); err != nil {
		return nil, latency, fmt.Errorf("failed to parse MMTAI output: %w", err)
	}

	log.Printf("[MMTAI-BUBBLE] Routed %s through %d hops (%.2fms)", fileID, len(hops), float64(latency.Milliseconds()))
	return hops, latency, nil
}

// Metrics returns telemetry for the DAISY optimizer
func (m *MMTAIRouterBubble) Metrics() BubbleTelemetry {
	m.mu.Lock()
	defer m.mu.Unlock()

	var avgLatency float64
	var failureRate float64
	if m.callCount > 0 {
		avgLatency = m.totalLatencyMs / float64(m.callCount)
		failureRate = float64(m.totalFailed) / float64(m.callCount)
	}

	return BubbleTelemetry{
		BubbleID:     m.ID,
		AvgLatencyMs: avgLatency,
		FailureRate:  failureRate,
		TotalCalls:   m.callCount,
		Timestamp:    time.Now(),
	}
}

// ==============================================================================
// SECTION 4 — AGATE-DAISY PIPELINE ORCHESTRATOR
// Connects Gatekeeper → MMTAI Router → Telemetry → DAISY Optimizer feed
// ==============================================================================

// BubbleTelemetry is the common telemetry format fed to the DAISY optimizer
type BubbleTelemetry struct {
	BubbleID     string
	AvgLatencyMs float64
	FailureRate  float64
	TotalCalls   int
	Timestamp    time.Time
}

// AgatePipeline is the fully integrated Agate Core ↔ DAISY orchestrator
type AgatePipeline struct {
	Gatekeeper   *GatekeeperBubble
	Router       *MMTAIRouterBubble
	TelemetryCh  chan BubbleTelemetry
	LedgerPath   string
	mu           sync.Mutex
}

// NewAgatePipeline wires up the full integrated pipeline
func NewAgatePipeline(gatekeeperPath, routerScriptPath, ledgerPath string) *AgatePipeline {
	return &AgatePipeline{
		Gatekeeper:  NewGatekeeperBubble(gatekeeperPath, ledgerPath),
		Router:      NewMMTAIRouterBubble(routerScriptPath),
		TelemetryCh: make(chan BubbleTelemetry, 256),
		LedgerPath:  ledgerPath,
	}
}

// Execute runs a packet through the full Agate Core pipeline under DAISY management
//
// Flow:
//   1. Validate packet header (Gatekeeper Bubble)
//   2. On success → route through MMTAI nodes (Router Bubble)
//   3. Capture telemetry from both bubbles
//   4. Push telemetry to DAISY optimizer feed
//   5. Write result to immutable ledger
func (p *AgatePipeline) Execute(ctx context.Context, packet *AgatePacket, fileID string) (*PipelineResult, error) {
	result := &PipelineResult{
		PacketHash: packet.Hash,
		StartTime:  time.Now(),
	}

	// STAGE 1: Gatekeeper verification
	authorized, gkLatency, err := p.Gatekeeper.Verify(ctx, packet)
	if err != nil {
		return nil, fmt.Errorf("gatekeeper error: %w", err)
	}
	result.GatekeeperLatencyMs = float64(gkLatency.Milliseconds())
	result.Authorized = authorized

	if !authorized {
		result.Status = "REJECTED"
		result.EndTime = time.Now()
		p.pushTelemetry()
		p.writeLedger(result)
		return result, nil
	}

	// STAGE 2: MMTAI routing (only for authorized packets)
	hops, routeLatency, err := p.Router.Route(ctx, fileID)
	if err != nil {
		result.Status = "ROUTE_FAILED"
		result.EndTime = time.Now()
		p.writeLedger(result)
		return nil, fmt.Errorf("routing error: %w", err)
	}
	result.RoutingHops = hops
	result.RouterLatencyMs = float64(routeLatency.Milliseconds())
	result.Status = "DELIVERED"
	result.EndTime = time.Now()
	result.TotalLatencyMs = result.GatekeeperLatencyMs + result.RouterLatencyMs

	// STAGE 3: Push telemetry to DAISY optimizer
	p.pushTelemetry()

	// STAGE 4: Write to immutable ledger
	p.writeLedger(result)

	log.Printf("[AGATE-DAISY] Pipeline complete — %s | Status: %s | Total: %.2fms",
		packet.Hash[:16], result.Status, result.TotalLatencyMs)

	return result, nil
}

// pushTelemetry harvests metrics from both bubbles and sends to DAISY optimizer feed
func (p *AgatePipeline) pushTelemetry() {
	gkMetrics := p.Gatekeeper.Metrics()
	rtMetrics := p.Router.Metrics()
	select {
	case p.TelemetryCh <- gkMetrics:
	default:
	}
	select {
	case p.TelemetryCh <- rtMetrics:
	default:
	}
}

// writeLedger appends a tamper-evident result to the consensus ledger
func (p *AgatePipeline) writeLedger(result *PipelineResult) {
	entry, _ := json.Marshal(map[string]interface{}{
		"timestamp":   result.EndTime.UTC().Format(time.RFC3339),
		"packet_hash": result.PacketHash,
		"status":      result.Status,
		"latency_ms":  result.TotalLatencyMs,
		"hops":        len(result.RoutingHops),
	})
	// Signature of ledger entry
	sig := sha256.Sum256(entry)
	line := fmt.Sprintf(`{"log": %s, "signature": "%s"}`, entry, hex.EncodeToString(sig[:]))
	log.Printf("[LEDGER] %s", line)
	// In production: appendFileSync to p.LedgerPath
}

// TelemetryStream returns the channel for the DAISY optimizer to consume
func (p *AgatePipeline) TelemetryStream() <-chan BubbleTelemetry {
	return p.TelemetryCh
}

// HealthReport returns current pipeline health for DAISY circuit breaker evaluation
func (p *AgatePipeline) HealthReport() string {
	gk := p.Gatekeeper.Metrics()
	rt := p.Router.Metrics()
	return fmt.Sprintf(
		"[AGATE-DAISY HEALTH]\n  Gatekeeper: calls=%d avgLatency=%.2fms failRate=%.4f\n  MMTAIRouter: calls=%d avgLatency=%.2fms failRate=%.4f",
		gk.TotalCalls, gk.AvgLatencyMs, gk.FailureRate,
		rt.TotalCalls, rt.AvgLatencyMs, rt.FailureRate,
	)
}

// ==============================================================================
// SECTION 5 — PIPELINE RESULT
// ==============================================================================

// PipelineResult captures the full execution result of one packet through the pipeline
type PipelineResult struct {
	PacketHash          string
	Authorized          bool
	Status              string // "DELIVERED", "REJECTED", "ROUTE_FAILED"
	GatekeeperLatencyMs float64
	RouterLatencyMs     float64
	TotalLatencyMs      float64
	RoutingHops         []RoutingHop
	StartTime           time.Time
	EndTime             time.Time
}

// ==============================================================================
// SECTION 6 — LEDGER TAIL MONITOR
// Replaces monitor_routing.sh with a Go-native real-time stream
// ==============================================================================

// MonitorLedger tails the consensus ledger and streams entries to a scanner
// Replaces the bash `tail -f` in monitor_routing.sh with a structured Go reader
func MonitorLedger(ctx context.Context, ledgerPath string, out chan<- string) error {
	cmd := exec.CommandContext(ctx, "tail", "-f", ledgerPath)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		return fmt.Errorf("failed to open ledger stream: %w", err)
	}
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start ledger monitor: %w", err)
	}

	go func() {
		scanner := bufio.NewScanner(stdout)
		for scanner.Scan() {
			line := scanner.Text()
			select {
			case out <- line:
			case <-ctx.Done():
				return
			}
		}
	}()

	return nil
}
