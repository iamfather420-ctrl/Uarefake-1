// ==============================================================================
// DAISY — Distributed Autonomous Software Intelligence Yield Engine
// MODULE: EVC Real-Time Cost Engine
// AUTHOR: SolveX / TJ Ites Jr.
// GENESIS: 2025-12-25 | AGATE CORE INTEGRATION BUILD
// ==============================================================================

package evc

import (
	"fmt"
	"log"
	"math"
	"sync"
	"time"
)

// RegionMultiplier defines cost scaling per cloud region
var RegionMultiplier = map[string]float64{
	"us-east-1":    1.00, // baseline
	"us-west-2":    1.05,
	"eu-west-1":    1.15,
	"eu-central-1": 1.18,
	"ap-southeast-1": 1.22,
	"ap-northeast-1": 1.25,
	"ca-central-1": 1.10,
	"sa-east-1":    1.30,
}

// PricingModel defines the per-unit cost rates
type PricingModel struct {
	CPUPerCoreHour    float64 // USD per vCPU core per hour
	MemoryPerGBHour   float64 // USD per GB RAM per hour
	IOPerGBTransfer   float64 // USD per GB of I/O transfer
	StoragePerGBMonth float64 // USD per GB stored per month
}

// DefaultPricing mirrors AWS on-demand pricing baseline (2026)
var DefaultPricing = PricingModel{
	CPUPerCoreHour:    0.0464,
	MemoryPerGBHour:   0.0116,
	IOPerGBTransfer:   0.09,
	StoragePerGBMonth: 0.023,
}

// BubbleCostSnapshot captures the real-time cost of a single execution node
type BubbleCostSnapshot struct {
	BubbleID        string
	Region          string
	CPUCores        float64
	MemoryGB        float64
	IOTransferGBHr  float64
	StorageGB       float64
	Timestamp       time.Time

	// Computed fields
	CPUCostHr       float64
	MemoryCostHr    float64
	IOCostHr        float64
	StorageCostHr   float64
	RegionMultiplier float64
	TotalCostHr     float64
	EVCBudgetHr     float64
	IsOverBudget    bool
	ScalingFactor   float64 // How far over/under budget (1.0 = at budget)
}

// EVCEngine manages real-time cost computation across the bubble graph
type EVCEngine struct {
	pricing  PricingModel
	snapshots map[string]*BubbleCostSnapshot
	mu       sync.RWMutex
	alerts   chan EVCAlert
}

// EVCAlert is emitted when a bubble exceeds its budget
type EVCAlert struct {
	BubbleID      string
	TotalCostHr   float64
	BudgetHr      float64
	ScalingFactor float64
	Timestamp     time.Time
	Severity      string // "WARN", "CRITICAL"
}

// NewEVCEngine initializes the cost engine with default pricing
func NewEVCEngine() *EVCEngine {
	return &EVCEngine{
		pricing:   DefaultPricing,
		snapshots: make(map[string]*BubbleCostSnapshot),
		alerts:    make(chan EVCAlert, 256),
	}
}

// ComputeCost calculates the full hourly cost for a bubble snapshot
func (e *EVCEngine) ComputeCost(snap *BubbleCostSnapshot) *BubbleCostSnapshot {
	multiplier, ok := RegionMultiplier[snap.Region]
	if !ok {
		multiplier = 1.20 // Unknown region — apply conservative multiplier
		log.Printf("[EVC] Unknown region %q — applying default multiplier 1.20", snap.Region)
	}

	cpuCost := snap.CPUCores * e.pricing.CPUPerCoreHour * multiplier
	memCost := snap.MemoryGB * e.pricing.MemoryPerGBHour * multiplier
	ioCost := snap.IOTransferGBHr * e.pricing.IOPerGBTransfer * multiplier
	// Storage cost prorated to hourly
	storageCostHr := (snap.StorageGB * e.pricing.StoragePerGBMonth * multiplier) / (24 * 30)
	total := cpuCost + memCost + ioCost + storageCostHr

	snap.CPUCostHr = round(cpuCost, 6)
	snap.MemoryCostHr = round(memCost, 6)
	snap.IOCostHr = round(ioCost, 6)
	snap.StorageCostHr = round(storageCostHr, 6)
	snap.RegionMultiplier = multiplier
	snap.TotalCostHr = round(total, 6)
	snap.Timestamp = time.Now()

	if snap.EVCBudgetHr > 0 {
		snap.ScalingFactor = round(total/snap.EVCBudgetHr, 4)
		snap.IsOverBudget = total > snap.EVCBudgetHr
	} else {
		snap.ScalingFactor = math.Inf(1)
		snap.IsOverBudget = true
	}

	return snap
}

// Ingest processes a new cost snapshot and stores it, emitting alerts if needed
func (e *EVCEngine) Ingest(snap BubbleCostSnapshot) *BubbleCostSnapshot {
	computed := e.ComputeCost(&snap)

	e.mu.Lock()
	e.snapshots[computed.BubbleID] = computed
	e.mu.Unlock()

	if computed.IsOverBudget {
		severity := "WARN"
		if computed.ScalingFactor > 2.0 {
			severity = "CRITICAL"
		}
		alert := EVCAlert{
			BubbleID:      computed.BubbleID,
			TotalCostHr:   computed.TotalCostHr,
			BudgetHr:      computed.EVCBudgetHr,
			ScalingFactor: computed.ScalingFactor,
			Timestamp:     computed.Timestamp,
			Severity:      severity,
		}
		select {
		case e.alerts <- alert:
		default:
			log.Printf("[EVC] Alert buffer full — dropping alert for %s", computed.BubbleID)
		}
		log.Printf("[EVC] %s BUDGET EXCEEDED: %s — $%.4f/hr vs budget $%.4f/hr (x%.2f)",
			severity, computed.BubbleID, computed.TotalCostHr, computed.EVCBudgetHr, computed.ScalingFactor)
	}

	return computed
}

// GetSnapshot returns the latest cost snapshot for a bubble
func (e *EVCEngine) GetSnapshot(bubbleID string) (*BubbleCostSnapshot, error) {
	e.mu.RLock()
	defer e.mu.RUnlock()
	snap, ok := e.snapshots[bubbleID]
	if !ok {
		return nil, fmt.Errorf("no snapshot for bubble %s", bubbleID)
	}
	return snap, nil
}

// Alerts returns the alert channel for consumption by the optimizer
func (e *EVCEngine) Alerts() <-chan EVCAlert {
	return e.alerts
}

// Summary returns a cost breakdown across all tracked bubbles
func (e *EVCEngine) Summary() string {
	e.mu.RLock()
	defer e.mu.RUnlock()
	var totalHr float64
	summary := "[EVC COST SUMMARY]\n"
	for id, snap := range e.snapshots {
		summary += fmt.Sprintf("  %-30s $%.4f/hr  (CPU: $%.4f  MEM: $%.4f  IO: $%.4f  Region: %s  x%.2f)\n",
			id, snap.TotalCostHr,
			snap.CPUCostHr, snap.MemoryCostHr, snap.IOCostHr,
			snap.Region, snap.RegionMultiplier,
		)
		totalHr += snap.TotalCostHr
	}
	summary += fmt.Sprintf("  %-30s $%.4f/hr  (~$%.2f/day)\n", "TOTAL", totalHr, totalHr*24)
	return summary
}

func round(val float64, precision int) float64 {
	p := math.Pow(10, float64(precision))
	return math.Round(val*p) / p
}
