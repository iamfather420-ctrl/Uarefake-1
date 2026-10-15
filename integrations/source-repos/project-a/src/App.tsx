import React, { useState, useEffect } from 'react';
import { ViewMode, DeviceView, PurchaseOrder, Invoice, WarehouseItem, Vendor, WorkflowRule, ExecutionLog, DaisyChain, ParadoxAnomaly, MarketplaceListing, MarketplaceBid, MMTAIPeer, MMTAISecurityAudit } from './types';
import { 
  INITIAL_PURCHASE_ORDERS, 
  INITIAL_INVOICES, 
  INITIAL_INVENTORY, 
  INITIAL_VENDORS, 
  INITIAL_WORKFLOWS, 
  INITIAL_EXECUTION_LOGS,
  INITIAL_54_DAISY_CHAINS,
  INITIAL_88_PARADOX_ANOMALIES,
  INITIAL_MARKETPLACE_LISTINGS,
  INITIAL_MARKETPLACE_BIDS,
  INITIAL_MMTAI_PEERS,
  INITIAL_MMTAI_AUDITS
} from './sovereignData';


import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { AndroidFrame } from './components/AndroidFrame';
import { DashboardView } from './components/DashboardView';
import { ProcurementView } from './components/ProcurementView';
import { InventoryView } from './components/InventoryView';
import { VendorView } from './components/VendorView';
import { FinanceView } from './components/FinanceView';
import { WorkflowView } from './components/WorkflowView';
import { DaisyPipelineView } from './components/DaisyPipelineView';
import { ParadoxBoxView } from './components/ParadoxBoxView';
import { MarketplaceView } from './components/MarketplaceView';
import { MmtaiSecurityView } from './components/MmtaiSecurityView';
import { JitBuildView } from './components/JitBuildView';
import { AgentBrainView } from './components/AgentBrainView';
import { DaisyChatView } from './components/DaisyChatView';
import { AiAssistantModal } from './components/AiAssistantModal';
import { INITIAL_JIT_BUILD_TASKS } from './engine/jitBuildEngine';
import { INITIAL_BRAIN_STATE } from './engine/agenticBrainEngine';
import { JitBuildTask, AgentBrainState, AgenticGoalNode } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewMode>('dashboard');
  const [deviceView, setDeviceView] = useState<DeviceView>('desktop');
  
  // App Core State
  const [orders, setOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [inventory, setInventory] = useState<WarehouseItem[]>(INITIAL_INVENTORY);
  const [vendors, setVendors] = useState<Vendor[]>(INITIAL_VENDORS);
  const [workflows, setWorkflows] = useState<WorkflowRule[]>(INITIAL_WORKFLOWS);
  const [daisyChains, setDaisyChains] = useState<DaisyChain[]>(INITIAL_54_DAISY_CHAINS);
  const [paradoxAnomalies, setParadoxAnomalies] = useState<ParadoxAnomaly[]>(INITIAL_88_PARADOX_ANOMALIES);
  const [listings, setListings] = useState<MarketplaceListing[]>(INITIAL_MARKETPLACE_LISTINGS);
  const [bids, setBids] = useState<MarketplaceBid[]>(INITIAL_MARKETPLACE_BIDS);
  const [peers, setPeers] = useState<MMTAIPeer[]>(INITIAL_MMTAI_PEERS);
  const [audits, setAudits] = useState<MMTAISecurityAudit[]>(INITIAL_MMTAI_AUDITS);
  const [jitTasks, setJitTasks] = useState<JitBuildTask[]>(INITIAL_JIT_BUILD_TASKS);
  const [brainState, setBrainState] = useState<AgentBrainState>(INITIAL_BRAIN_STATE);
  const [logs, setLogs] = useState<ExecutionLog[]>(INITIAL_EXECUTION_LOGS);


  // Autonomous Engine Controls
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(true);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // Autonomous Background Engine Simulation Ticker
  useEffect(() => {
    if (!isAgentRunning) return;

    const interval = setInterval(() => {
      const timestamp = new Date().toLocaleString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const randomActions = [
        {
          agentName: 'Replenishment Engine',
          actionType: 'Safety Buffer Scan',
          details: 'Scanned 4 SKUs across West Coast & APAC hubs. All items within threshold limits.',
          status: 'success' as const
        },
        {
          agentName: 'Vendor Risk Sentinel',
          actionType: 'SLA Audit',
          details: 'Checked Apex Semiconductor delivery tracking. SLA compliance active at 99.2%.',
          status: 'success' as const
        },
        {
          agentName: 'AP Treasury Agent',
          actionType: 'Discount Monitor',
          details: 'Monitored early payment discount windows. 0 pending invoice payouts due today.',
          status: 'success' as const
        }
      ];

      const chosen = randomActions[Math.floor(Math.random() * randomActions.length)];
      const newLog: ExecutionLog = {
        id: `LOG-${Date.now()}`,
        timestamp,
        ...chosen
      };

      setLogs(prev => [newLog, ...prev.slice(0, 25)]);
    }, 12000);

    return () => clearInterval(interval);
  }, [isAgentRunning]);

  // Handler functions
  const handleAddLog = (newLog: ExecutionLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  const handleApproveOrder = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'submitted' } : o));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      agentName: 'Procurement AI',
      actionType: 'PO Approval',
      details: `Approved Purchase Order ${id} for supplier fulfillment.`,
      status: 'success',
      entityId: id,
      entityType: 'PO'
    });
  };

  const handleReconcileInvoice = (id: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: 'matched' } : i));
    handleAddLog({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      agentName: 'Reconciliation AI',
      actionType: 'Manual Match Override',
      details: `Reconciled Invoice ${id} with corresponding Purchase Order.`,
      status: 'success',
      entityId: id,
      entityType: 'Invoice'
    });
  };

  const handleToggleAutoReplenish = (sku: string) => {
    setInventory(prev => prev.map(item => 
      item.sku === sku ? { ...item, autoReplenishEnabled: !item.autoReplenishEnabled } : item
    ));
  };

  const handleTriggerReorderBatch = () => {
    const lowStockItems = inventory.filter(i => i.currentStock <= i.reorderPoint);
    if (lowStockItems.length === 0) {
      handleAddLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        agentName: 'Replenishment Agent',
        actionType: 'Reorder Sweep',
        details: 'Inventory levels optimal across all warehouses. No reorders needed.',
        status: 'success'
      });
      return;
    }

    // Auto-create PO for low stock item
    const newPos: PurchaseOrder[] = lowStockItems.map(item => ({
      id: `PO-${Math.floor(1000 + Math.random() * 9000)}`,
      poNumber: `PO-2026-${Math.floor(8000 + Math.random() * 1000)}`,
      vendorName: 'Apex Semiconductor Components',
      vendorId: item.supplierId,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDelivery: '2026-08-15',
      status: 'pending_approval',
      totalAmount: item.unitCost * item.reorderQuantity,
      autonomousCreated: true,
      approvalRuleTriggered: `Stock drop detected on SKU ${item.sku}`,
      items: [
        {
          id: `li-${Date.now()}`,
          name: item.name,
          sku: item.sku,
          quantity: item.reorderQuantity,
          unitPrice: item.unitCost,
          totalPrice: item.unitCost * item.reorderQuantity
        }
      ]
    }));

    setOrders(prev => [...newPos, ...prev]);
    handleAddLog({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      agentName: 'Replenishment Agent',
      actionType: 'Batch Reorder Dispatch',
      details: `Auto-created ${newPos.length} Purchase Orders for critical stock items (${lowStockItems.map(i => i.sku).join(', ')}).`,
      status: 'success'
    });
  };

  const handleToggleWorkflow = (id: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, isEnabled: !w.isEnabled } : w));
  };

  const handleAddWorkflow = (rule: WorkflowRule) => {
    setWorkflows(prev => [rule, ...prev]);
    handleAddLog({
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      agentName: 'Rule Orchestrator',
      actionType: 'Rule Creation',
      details: `Configured new autonomous workflow rule "${rule.name}".`,
      status: 'success'
    });
  };

  const handleResolveParadox = (id: string) => {
    setParadoxAnomalies(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' as const } : a));
  };

  const handleTriggerDaisyChain = (chainId: string) => {
    setDaisyChains(prev => prev.map(c => c.id === chainId ? { ...c, executionsToday: c.executionsToday + 1, lastSuccess: 'Just now' } : c));
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'daisy_chat':
        return (
          <DaisyChatView
            brainState={brainState}
            onUpdateGoal={(updatedGoal) => setBrainState(prev => ({
              ...prev,
              activeGoals: prev.activeGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
            }))}
            onAddLog={handleAddLog}
            onNavigateToTab={(view) => setActiveTab(view)}
          />
        );
      case 'dashboard':
        return (
          <DashboardView
            orders={orders}
            invoices={invoices}
            inventory={inventory}
            vendors={vendors}
            logs={logs}
            onNavigate={(view) => setActiveTab(view)}
            isAgentRunning={isAgentRunning}
          />
        );
      case 'daisy':
        return (
          <DaisyPipelineView
            daisyChains={daisyChains}
            onTriggerChain={handleTriggerDaisyChain}
            onAddLog={handleAddLog}
          />
        );
      case 'paradox':
        return (
          <ParadoxBoxView
            anomalies={paradoxAnomalies}
            onResolveParadox={handleResolveParadox}
            onAddLog={handleAddLog}
          />
        );
      case 'marketplace':
        return (
          <MarketplaceView
            listings={listings}
            bids={bids}
            onPlaceBid={(newBid) => setBids(prev => [newBid, ...prev])}
            onAddLog={handleAddLog}
          />
        );
      case 'mmtai':
        return (
          <MmtaiSecurityView
            peers={peers}
            audits={audits}
            onAddLog={handleAddLog}
          />
        );
      case 'jit_build':
        return (
          <JitBuildView
            tasks={jitTasks}
            onAddJitTask={(newTask) => setJitTasks(prev => [newTask, ...prev])}
            onAddLog={handleAddLog}
          />
        );
      case 'agent_brain':
        return (
          <AgentBrainView
            brainState={brainState}
            onUpdateGoal={(updatedGoal) => setBrainState(prev => ({
              ...prev,
              activeGoals: prev.activeGoals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
            }))}
            onAddLog={handleAddLog}
          />
        );
      case 'procurement':

        return (
          <ProcurementView
            orders={orders}
            invoices={invoices}
            onAddOrder={(po) => setOrders(prev => [po, ...prev])}
            onApproveOrder={handleApproveOrder}
            onReconcileInvoice={handleReconcileInvoice}
            onAddLog={handleAddLog}
          />
        );
      case 'inventory':
        return (
          <InventoryView
            inventory={inventory}
            onToggleAutoReplenish={handleToggleAutoReplenish}
            onTriggerReorderBatch={handleTriggerReorderBatch}
          />
        );
      case 'vendors':
        return (
          <VendorView
            vendors={vendors}
            onAddLog={handleAddLog}
          />
        );
      case 'finance':
        return (
          <FinanceView
            invoices={invoices}
            onAddLog={handleAddLog}
          />
        );
      case 'workflows':
        return (
          <WorkflowView
            workflows={workflows}
            logs={logs}
            onToggleWorkflow={handleToggleWorkflow}
            onAddWorkflow={handleAddWorkflow}
            isAgentRunning={isAgentRunning}
            setIsAgentRunning={setIsAgentRunning}
          />
        );
      default:
        return null;
    }
  };

  const viewTitles: Record<ViewMode, string> = {
    dashboard: 'Dashboard',
    daisy: 'Daisy Chains',
    daisy_chat: 'Daisy Assistant',
    paradox: 'Paradox Box',
    agent_brain: 'Agentic Cognitive Brain',
    jit_build: 'JIT Software Compiler',
    marketplace: 'Marketplace',
    mmtai: 'MMTAI Protocol',
    procurement: 'Procurement & POs',
    inventory: 'Inventory Hub',
    vendors: 'Vendor Matrix',
    finance: 'AP/AR Finance',
    workflows: 'Automation Rules'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Desktop Navigation Header (Hidden in mobile device frame) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        deviceView={deviceView}
        setDeviceView={setDeviceView}
        isAgentRunning={isAgentRunning}
        setIsAgentRunning={setIsAgentRunning}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
      />

      {/* Main View Layout (Desktop Container or Android Device Shell) */}
      <AndroidFrame
        deviceView={deviceView}
        setDeviceView={setDeviceView}
        logs={logs}
        activeViewTitle={viewTitles[activeTab]}
        isAgentRunning={isAgentRunning}
        toggleAgentRunning={() => setIsAgentRunning(!isAgentRunning)}
      >
        <div className={deviceView === 'desktop' ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6' : ''}>
          {renderActiveView()}
        </div>

        {/* Mobile View Bottom Navigation Bar */}
        {deviceView === 'mobile' && (
          <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
        )}
      </AndroidFrame>

      {/* Floating AI B2B Co-Pilot Assistant Modal */}
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onTriggerAction={(action) => console.log(action)}
      />
    </div>
  );
}
