import React, { useState } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Search, 
  Send, 
  Bot, 
  RefreshCw,
  FileSpreadsheet,
  Check,
  X
} from 'lucide-react';
import { PurchaseOrder, Invoice, DocumentParseResult } from '../types';

interface ProcurementViewProps {
  orders: PurchaseOrder[];
  invoices: Invoice[];
  onAddOrder: (po: PurchaseOrder) => void;
  onApproveOrder: (id: string) => void;
  onReconcileInvoice: (id: string) => void;
  onAddLog: (log: any) => void;
}

const SAMPLE_INVOICE_TEXT = `INVOICE #INV-2026-9910
Vendor: Apex Semiconductor Components (Code: APEX-SEM)
Date: 2026-08-03
PO Number Ref: PO-2026-8849
Payment Terms: 2/10 Net 30

Line Items:
1. SKU: ARM-CORTEX-X4 | Description: ARM Cortex-X4 Industrial Module | Qty: 500 | Unit Price: $85.00 | Total: $42,500.00
2. SKU: VR-REG-33V | Description: High Precision Voltage Regulator | Qty: 2000 | Unit Price: $3.00 | Total: $6,000.00

Subtotal: $48,500.00
Tax (0% B2B Tax Exempt): $0.00
Grand Total Due: $48,500.00

Bank Routing: 121000358 | Account: 8849201920`;

export const ProcurementView: React.FC<ProcurementViewProps> = ({
  orders,
  invoices,
  onAddOrder,
  onApproveOrder,
  onReconcileInvoice,
  onAddLog
}) => {
  const [activeTab, setActiveTab] = useState<'parser' | 'orders' | 'invoices' | 'rfq'>('orders');
  
  // Document Parser state
  const [docText, setDocText] = useState(SAMPLE_INVOICE_TEXT);
  const [docType, setDocType] = useState<'Invoice' | 'Purchase Order'>('Invoice');
  const [isParsing, setIsParsing] = useState(false);
  const [parseResult, setParseResult] = useState<DocumentParseResult | null>(null);

  // RFQ Modal State
  const [rfqProduct, setRfqProduct] = useState('High Density Server Rack Enclosures (Aluminum CNC)');
  const [rfqQuantity, setRfqQuantity] = useState(250);
  const [rfqTargetPrice, setRfqTargetPrice] = useState(195.00);
  const [isGeneratingRfq, setIsGeneratingRfq] = useState(false);
  const [rfqResult, setRfqResult] = useState<any>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');

  // Call Server-Side Gemini API for Document Analysis
  const handleParseDocument = async () => {
    setIsParsing(true);
    try {
      const res = await fetch('/api/ai/parse-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent: docText, docType })
      });
      const data = await res.json();
      setParseResult(data);
      onAddLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        agentName: 'AI Document Parser',
        actionType: 'OCR & Line Item Extraction',
        details: `Successfully analyzed ${docType} from ${data.vendorName || 'Vendor'}. Confidence: ${data.confidence || 95}%.`,
        status: data.detectedFlags?.length > 0 ? 'warning' : 'success'
      });
    } catch (error) {
      console.error('Document parsing failed:', error);
    } finally {
      setIsParsing(false);
    }
  };

  // Call Server-Side Gemini API for RFQ Generation
  const handleGenerateRfq = async () => {
    setIsGeneratingRfq(true);
    try {
      const res = await fetch('/api/ai/generate-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirements: rfqProduct,
          quantity: rfqQuantity,
          targetPrice: rfqTargetPrice,
          vendorNames: ['Apex Semiconductor Components', 'NovaTech Enclosures']
        })
      });
      const data = await res.json();
      setRfqResult(data);
      onAddLog({
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        agentName: 'RFQ Agent',
        actionType: 'Strategic Negotiation Draft',
        details: `Generated autonomous RFQ #${data.rfqNumber || 'RFQ-2026'} for ${rfqQuantity} units of ${rfqProduct}.`,
        status: 'success'
      });
    } catch (error) {
      console.error('RFQ generation failed:', error);
    } finally {
      setIsGeneratingRfq(false);
    }
  };

  const filteredOrders = orders.filter(o => 
    o.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredInvoices = invoices.filter(i => 
    i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      
      {/* View Header & Sub-navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span>Autonomous Procurement & 3-Way Reconciler</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            AI-driven PO generation, automated OCR invoice matching, and supplier RFQ negotiation.
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'orders' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Purchase Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'invoices' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab('parser')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
              activeTab === 'parser' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Parser</span>
          </button>
          <button
            onClick={() => setActiveTab('rfq')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'rfq' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            AI RFQ Draft
          </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      {(activeTab === 'orders' || activeTab === 'invoices') && (
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by PO number, invoice, or supplier name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
          />
        </div>
      )}

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'orders' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Purchase Order Register</h3>
            <span className="text-xs text-emerald-400 font-mono">100% Audit Tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                  <th className="py-3 px-4">PO Number</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Order Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-center">Creation Source</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">{po.poNumber}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{po.vendorName}</td>
                    <td className="py-3 px-4 text-slate-400">{po.orderDate}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        po.status === 'submitted' ? 'bg-blue-950 text-blue-300 border-blue-500/30' :
                        po.status === 'fulfilled' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' :
                        po.status === 'pending_approval' ? 'bg-amber-950 text-amber-300 border-amber-500/30' :
                        'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {po.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-center">
                      {po.autonomousCreated ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/30">
                          <Bot className="w-3 h-3" />
                          <span>AI Agent</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500">Manual Entry</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {po.status === 'pending_approval' ? (
                        <button
                          onClick={() => onApproveOrder(po.id)}
                          className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-all"
                        >
                          Approve PO
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Verified</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES & 3-WAY MATCHING */}
      {activeTab === 'invoices' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">3-Way Invoice Reconciliation Ledger</h3>
            <span className="text-xs text-slate-400">PO vs Invoice Variance Guard</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">PO Ref</th>
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">OCR Confidence</th>
                  <th className="py-3 px-4 text-right">Invoice Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-200">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400">{inv.poNumber}</td>
                    <td className="py-3 px-4 text-slate-300 font-medium">{inv.vendorName}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                        inv.status === 'matched' ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30' :
                        inv.status === 'discrepancy' ? 'bg-red-950 text-red-300 border-red-500/30' :
                        inv.status === 'paid' ? 'bg-blue-950 text-blue-300 border-blue-500/30' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{inv.ocrConfidence}%</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-100">${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 px-4 text-right">
                      {inv.status === 'discrepancy' ? (
                        <button
                          onClick={() => onReconcileInvoice(inv.id)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] transition-all"
                        >
                          Auto-Override & Match
                        </button>
                      ) : (
                        <span className="text-[10px] text-slate-500">Reconciled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AI DOCUMENT PARSER */}
      {activeTab === 'parser' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Left: Input Text / Sample Document */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200 flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <span>Input Document Raw Payload</span>
              </label>

              <div className="flex items-center space-x-2">
                <select
                  value={docType}
                  onChange={(e: any) => setDocType(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                >
                  <option value="Invoice">Invoice</option>
                  <option value="Purchase Order">Purchase Order</option>
                  <option value="RFQ">RFQ</option>
                </select>
              </div>
            </div>

            <textarea
              rows={12}
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/50"
              placeholder="Paste raw B2B document text here..."
            />

            <button
              onClick={handleParseDocument}
              disabled={isParsing}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isParsing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini Parsing B2B Entities...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Parse Document with Gemini AI</span>
                </>
              )}
            </button>
          </div>

          {/* Right: Parsed Output JSON & Analysis */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            {parseResult ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs text-emerald-400 font-semibold">{parseResult.docType} Extracted</span>
                    <h4 className="text-base font-bold text-white">{parseResult.vendorName}</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Extracted</div>
                    <div className="text-lg font-bold text-slate-100">${parseResult.totalAmount?.toLocaleString()}</div>
                  </div>
                </div>

                {/* AI Analysis Summary */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl">
                  <div className="text-xs font-semibold text-emerald-400 mb-1 flex items-center space-x-1">
                    <Bot className="w-3.5 h-3.5" />
                    <span>AI Strategic Findings</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{parseResult.aiAnalysis}</p>
                </div>

                {/* Detected Flags */}
                {parseResult.detectedFlags && parseResult.detectedFlags.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-amber-400">Discrepancy / Risk Flags:</span>
                    {parseResult.detectedFlags.map((flag, idx) => (
                      <div key={idx} className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-300 flex items-center space-x-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Extracted Line Items */}
                <div>
                  <h5 className="text-xs font-semibold text-slate-300 mb-2">Parsed Line Items</h5>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {parseResult.lineItems?.map((li) => (
                      <div key={li.id} className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200">{li.name}</div>
                          <div className="text-[10px] text-slate-400">SKU: {li.sku} • Qty: {li.quantity} @ ${li.unitPrice}</div>
                        </div>
                        <div className="font-bold text-slate-100">${li.totalPrice.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Sparkles className="w-8 h-8 text-slate-600 mb-2 animate-bounce" />
                <p className="text-xs">Select or paste document payload and click "Parse Document" to extract structured B2B entities via server-side Gemini AI.</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: AI RFQ GENERATOR */}
      {activeTab === 'rfq' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Autonomous RFQ & Vendor Negotiation Generator</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Required Item / Specs</label>
                <input
                  type="text"
                  value={rfqProduct}
                  onChange={(e) => setRfqProduct(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Quantity</label>
                  <input
                    type="number"
                    value={rfqQuantity}
                    onChange={(e) => setRfqQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Target Price / Unit ($)</label>
                  <input
                    type="number"
                    value={rfqTargetPrice}
                    onChange={(e) => setRfqTargetPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateRfq}
                disabled={isGeneratingRfq}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                {isGeneratingRfq ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Gemini Drafting RFQ Strategy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate RFQ Strategy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between">
            {rfqResult ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold font-mono text-emerald-400">{rfqResult.rfqNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Ready to Dispatch
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1">Negotiation Strategy</h4>
                  <p className="text-xs text-slate-400 p-2.5 bg-slate-950 rounded-xl border border-slate-800 leading-relaxed">
                    {rfqResult.negotiationStrategy}
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-slate-300 mb-1">Formatted Supplier Dispatch Email</h4>
                  <pre className="text-[11px] font-mono text-slate-300 p-3 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap max-h-48">
                    {rfqResult.emailDraft}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Send className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs">Define volume and target pricing to draft automated supplier RFQs using Gemini AI.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
