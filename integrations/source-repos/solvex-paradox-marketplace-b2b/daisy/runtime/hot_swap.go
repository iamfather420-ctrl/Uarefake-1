// ==============================================================================
// DAISY — Distributed Autonomous Software Intelligence Yield Engine
// MODULE: Hot-Swap Runtime Engine
// AUTHOR: SolveX / TJ Ites Jr.
// GENESIS: 2025-12-25 | AGATE CORE INTEGRATION BUILD
// ==============================================================================

package runtime

import (
	"context"
	"fmt"
	"log"
	"sync"
	"time"

	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/health/grpc_health_v1"
)

// BubbleState represents the lifecycle state of an execution node
type BubbleState int

const (
	BubbleActive      BubbleState = iota
	BubbleSwapping
	BubbleDraining
	BubbleFailed
	BubbleTerminated
)

// CircuitState tracks the breaker status per bubble
type CircuitState int

const (
	CircuitClosed   CircuitState = iota // Normal operation
	CircuitOpen                         // Failing — reject requests
	CircuitHalfOpen                     // Probing recovery
)

// Bubble is a single execution unit in the DAISY graph
type Bubble struct {
	ID           string
	NodeAddress  string
	State        BubbleState
	Circuit      CircuitState
	FailureCount int
	LastFailure  time.Time
	Conn         *grpc.ClientConn
	mu           sync.RWMutex
}

// BubbleGraph is the full runtime execution graph
type BubbleGraph struct {
	Bubbles     map[string]*Bubble
	Edges       map[string][]string // adjacency list: nodeID -> []dependencyIDs
	mu          sync.RWMutex
	swapQueue   chan SwapRequest
	telemetry   chan TelemetryEvent
}

// SwapRequest represents a hot-swap operation
type SwapRequest struct {
	OldBubbleID  string
	NewAddress   string
	ResponseChan chan error
}

// TelemetryEvent carries runtime metrics from a bubble
type TelemetryEvent struct {
	BubbleID    string
	Latency     float64
	CPUUsage    float64
	MemoryMB    float64
	ErrorRate   float64
	Timestamp   time.Time
}

const (
	MaxFailures        = 5
	CircuitResetWindow = 30 * time.Second
	DrainTimeout       = 10 * time.Second
	SwapTimeout        = 15 * time.Second
)

// NewBubbleGraph initializes the runtime graph
func NewBubbleGraph() *BubbleGraph {
	g := &BubbleGraph{
		Bubbles:   make(map[string]*Bubble),
		Edges:     make(map[string][]string),
		swapQueue: make(chan SwapRequest, 64),
		telemetry: make(chan TelemetryEvent, 512),
	}
	go g.swapWorker()
	go g.telemetryWorker()
	return g
}

// RegisterBubble adds a new execution node to the live graph
func (g *BubbleGraph) RegisterBubble(id, address string) error {
	conn, err := grpc.Dial(address,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
		grpc.WithTimeout(5*time.Second),
	)
	if err != nil {
		return fmt.Errorf("failed to connect bubble %s at %s: %w", id, address, err)
	}

	g.mu.Lock()
	defer g.mu.Unlock()
	g.Bubbles[id] = &Bubble{
		ID:          id,
		NodeAddress: address,
		State:       BubbleActive,
		Circuit:     CircuitClosed,
		Conn:        conn,
	}
	log.Printf("[DAISY] Bubble registered: %s @ %s", id, address)
	return nil
}

// HotSwap replaces a running bubble without dropping traffic
func (g *BubbleGraph) HotSwap(oldID, newAddress string) error {
	resp := make(chan error, 1)
	g.swapQueue <- SwapRequest{
		OldBubbleID:  oldID,
		NewAddress:   newAddress,
		ResponseChan: resp,
	}
	select {
	case err := <-resp:
		return err
	case <-time.After(SwapTimeout):
		return fmt.Errorf("hot-swap timeout for bubble %s", oldID)
	}
}

// swapWorker processes swap requests sequentially to avoid graph corruption
func (g *BubbleGraph) swapWorker() {
	for req := range g.swapQueue {
		req.ResponseChan <- g.executeSwap(req.OldBubbleID, req.NewAddress)
	}
}

// executeSwap performs the actual atomic node replacement
func (g *BubbleGraph) executeSwap(oldID, newAddress string) error {
	g.mu.Lock()
	old, exists := g.Bubbles[oldID]
	if !exists {
		g.mu.Unlock()
		return fmt.Errorf("bubble %s not found in graph", oldID)
	}

	// Mark old bubble as draining — stop routing new requests to it
	old.mu.Lock()
	old.State = BubbleDraining
	old.mu.Unlock()
	g.mu.Unlock()

	log.Printf("[DAISY] Draining bubble %s...", oldID)
	time.Sleep(DrainTimeout) // Wait for in-flight requests to complete

	// Connect to new bubble
	newConn, err := grpc.Dial(newAddress,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
		grpc.WithTimeout(5*time.Second),
	)
	if err != nil {
		// Rollback: restore old bubble to active
		old.mu.Lock()
		old.State = BubbleActive
		old.mu.Unlock()
		return fmt.Errorf("new bubble connection failed, rolled back: %w", err)
	}

	// Health check on new bubble before committing the swap
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	hc := grpc_health_v1.NewHealthClient(newConn)
	resp, err := hc.Check(ctx, &grpc_health_v1.HealthCheckRequest{})
	if err != nil || resp.Status != grpc_health_v1.HealthCheckResponse_SERVING {
		newConn.Close()
		old.mu.Lock()
		old.State = BubbleActive
		old.mu.Unlock()
		return fmt.Errorf("new bubble health check failed, rolled back")
	}

	// Commit swap atomically
	newBubbleID := fmt.Sprintf("%s-v2-%d", oldID, time.Now().Unix())
	g.mu.Lock()
	// Repoint all edges from old bubble to new bubble
	for src, deps := range g.Edges {
		for i, dep := range deps {
			if dep == oldID {
				g.Edges[src][i] = newBubbleID
			}
		}
	}
	g.Bubbles[newBubbleID] = &Bubble{
		ID:          newBubbleID,
		NodeAddress: newAddress,
		State:       BubbleActive,
		Circuit:     CircuitClosed,
		Conn:        newConn,
	}
	// Copy edges from old to new
	if edges, ok := g.Edges[oldID]; ok {
		g.Edges[newBubbleID] = edges
		delete(g.Edges, oldID)
	}
	// Terminate old bubble
	old.State = BubbleTerminated
	old.Conn.Close()
	delete(g.Bubbles, oldID)
	g.mu.Unlock()

	log.Printf("[DAISY] Hot-swap complete: %s → %s", oldID, newBubbleID)
	return nil
}

// Route returns the active bubble to handle a request for a given node
// Respects circuit breaker state
func (g *BubbleGraph) Route(bubbleID string) (*Bubble, error) {
	g.mu.RLock()
	bubble, exists := g.Bubbles[bubbleID]
	g.mu.RUnlock()

	if !exists {
		return nil, fmt.Errorf("bubble %s not found", bubbleID)
	}

	bubble.mu.RLock()
	state := bubble.State
	circuit := bubble.Circuit
	bubble.mu.RUnlock()

	if state != BubbleActive {
		return nil, fmt.Errorf("bubble %s not in active state: %d", bubbleID, state)
	}

	switch circuit {
	case CircuitOpen:
		// Check if reset window has passed
		bubble.mu.RLock()
		lastFail := bubble.LastFailure
		bubble.mu.RUnlock()
		if time.Since(lastFail) > CircuitResetWindow {
			bubble.mu.Lock()
			bubble.Circuit = CircuitHalfOpen
			bubble.mu.Unlock()
			return bubble, nil
		}
		return nil, fmt.Errorf("circuit open for bubble %s — requests rejected", bubbleID)
	case CircuitHalfOpen, CircuitClosed:
		return bubble, nil
	}
	return nil, fmt.Errorf("unknown circuit state for bubble %s", bubbleID)
}

// RecordFailure increments the failure count and trips the circuit breaker if needed
func (g *BubbleGraph) RecordFailure(bubbleID string) {
	g.mu.RLock()
	bubble, exists := g.Bubbles[bubbleID]
	g.mu.RUnlock()
	if !exists {
		return
	}

	bubble.mu.Lock()
	defer bubble.mu.Unlock()
	bubble.FailureCount++
	bubble.LastFailure = time.Now()

	if bubble.FailureCount >= MaxFailures {
		bubble.Circuit = CircuitOpen
		bubble.State = BubbleFailed
		log.Printf("[DAISY] Circuit OPEN for bubble %s after %d failures", bubbleID, bubble.FailureCount)
	}
}

// RecordSuccess resets circuit breaker on successful probe
func (g *BubbleGraph) RecordSuccess(bubbleID string) {
	g.mu.RLock()
	bubble, exists := g.Bubbles[bubbleID]
	g.mu.RUnlock()
	if !exists {
		return
	}
	bubble.mu.Lock()
	defer bubble.mu.Unlock()
	bubble.Circuit = CircuitClosed
	bubble.FailureCount = 0
	bubble.State = BubbleActive
}

// telemetryWorker processes live metrics from pods
func (g *BubbleGraph) telemetryWorker() {
	for event := range g.telemetry {
		log.Printf("[TELEMETRY] Bubble=%s Latency=%.3fms CPU=%.1f%% Mem=%.1fMB ErrRate=%.4f",
			event.BubbleID, event.Latency, event.CPUUsage, event.MemoryMB, event.ErrorRate)
		// Metrics are forwarded to the AI optimizer via this channel in production
		// The Neo4j node metadata is updated via the graph sync service
	}
}

// PushTelemetry allows pods to stream metrics into the runtime graph
func (g *BubbleGraph) PushTelemetry(event TelemetryEvent) {
	select {
	case g.telemetry <- event:
	default:
		log.Printf("[DAISY] Telemetry buffer full — dropping event for bubble %s", event.BubbleID)
	}
}
