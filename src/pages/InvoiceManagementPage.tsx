import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Search,
  Download,
  Filter,
  RefreshCw,
  Printer,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Copy,
  Check,
  X,
  ChevronDown,
  Layers,
  UtensilsCrossed,
  ShieldCheck,
} from 'lucide-react';
import {
  Card,
  CardBody,
  Badge,
  Button,
  Input,
  Select,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EmptyState,
} from '../components/ui';
import { paymentService, InvoiceRecord } from '../services/paymentService';
import { toast } from '../stores/useToastStore';

export const InvoiceManagementPage: React.FC = () => {
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTax: 0,
    paidCount: 0,
    avgTicket: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tableFilter, setTableFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected invoice for detail modal / tax receipt
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await paymentService.getAllInvoices({
        table: tableFilter !== 'ALL' ? tableFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchQuery.trim() || undefined,
      });
      setInvoices(data.invoices);
      setSummary(data.summary);
    } catch (err: any) {
      toast.error('Failed to load invoices', err.message || 'Server error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [tableFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied', `Copied ${text} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter((inv) => {
    if (methodFilter !== 'ALL' && inv.paymentMethod !== methodFilter) return false;
    return true;
  });

  const exportCsv = () => {
    if (filteredInvoices.length === 0) {
      toast.error('Export Error', 'No invoice records to export.');
      return;
    }
    const headers = ['Invoice Number', 'Table', 'Date', 'Payer', 'Items Count', 'Subtotal', 'Tax', 'Service Charge', 'Total', 'Payment Mode', 'Status', 'Transaction ID'];
    const rows = filteredInvoices.map((inv) => [
      inv.invoiceNumber,
      inv.table,
      new Date(inv.createdAt).toLocaleString(),
      inv.payerName || 'Guest',
      inv.items?.length || inv.quantities || 1,
      inv.subtotal,
      inv.tax,
      inv.serviceCharge,
      inv.total,
      inv.paymentMethod,
      inv.status,
      inv.transactionId,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rasrang_Invoices_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export Successful', `Exported ${filteredInvoices.length} billing records.`);
  };

  return (
    <div className="space-y-6 text-[#211d1a] font-sans">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e9e3dc]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#d96236] mb-1 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" />
            <span>FINANCIAL OPERATIONS • RASRANG</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#211d1a] tracking-tight">
            Billing & Invoices Registry
          </h1>
          <p className="text-xs text-[#7b726a] mt-1">
            Official GST records, transaction receipts, and settled orders ledger for Rasrang Modern Indian Dining.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={exportCsv}
            className="flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              fetchInvoices();
              toast.info('Refreshed', 'Invoice registry synced with live transactions');
            }}
            className="flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </Button>
        </div>
      </div>

      {/* KPI Financial Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Revenue */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Settled Revenue</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              ₹{summary.totalRevenue.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#23865b] font-bold flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" /> 100% Collected & Verified
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#e8f6ef] text-[#23865b] flex items-center justify-center shadow-2xs">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        {/* Invoices Count */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Settled Invoices</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {summary.paidCount}
            </div>
            <span className="text-[10px] text-[#3974b9] font-bold">
              {filteredInvoices.length} displayed in ledger
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eaf2fb] text-[#3974b9] flex items-center justify-center shadow-2xs">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Average Ticket</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              ₹{summary.avgTicket.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#7b726a] font-medium">Per completed dining party</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center shadow-2xs">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* GST / Taxes */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Tax & GST (5%)</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              ₹{summary.totalTax.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#d96236] font-bold">CGST (2.5%) + SGST (2.5%)</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center shadow-2xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4 shadow-2xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-[#7b726a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, guest name, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] placeholder-[#7b726a] focus:outline-none focus:border-[#d96236] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7b726a] hover:text-[#211d1a]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Table Filter */}
        <div className="w-36">
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] focus:outline-none focus:border-[#d96236] font-medium"
          >
            <option value="ALL">All Tables</option>
            <option value="T01">Table T01</option>
            <option value="T02">Table T02</option>
            <option value="T03">Table T03</option>
            <option value="T04">Table T04</option>
            <option value="T05">Table T05</option>
            <option value="T06">Table T06</option>
            <option value="T07">Table T07</option>
          </select>
        </div>

        {/* Payment Method Filter */}
        <div className="w-36">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] focus:outline-none focus:border-[#d96236] font-medium"
          >
            <option value="ALL">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="CARD">Credit/Debit Card</option>
            <option value="NET_BANKING">Net Banking</option>
            <option value="CASH">Cash</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-32">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] focus:outline-none focus:border-[#d96236] font-medium"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">PAID</option>
            <option value="PENDING">PENDING</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>

        {(tableFilter !== 'ALL' || methodFilter !== 'ALL' || statusFilter !== 'ALL' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setTableFilter('ALL');
              setMethodFilter('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-[#d96236] hover:bg-[#fff4ef]"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-[#e9e3dc] rounded-2xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#e9e3dc] flex items-center justify-between bg-[#fbf9f6]/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#211d1a]">Transaction Invoices</span>
            <span className="px-2 py-0.5 rounded-full bg-[#f5f1ec] text-[#7b726a] text-[10px] font-bold">
              {filteredInvoices.length} Records
            </span>
          </div>
          <span className="text-[11px] text-[#7b726a]">Real-time encrypted digital invoices</span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-[#7b726a] text-xs">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-[#d96236]" />
            Loading official invoices ledger...
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#f5f1ec] text-[#7b726a] mx-auto flex items-center justify-center">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#211d1a]">No invoice records found</div>
              <p className="text-xs text-[#7b726a] mt-1 max-w-sm mx-auto">
                No invoices match your current filter parameters or no guest transactions have completed yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Guest / Payer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Tax (5%)</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv) => (
                  <TableRow key={inv._id} className="hover:bg-[#fbf9f6] transition-colors">
                    {/* Invoice ID */}
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-bold text-[#211d1a]">
                          {inv.invoiceNumber}
                        </span>
                        <button
                          onClick={() => copyToClipboard(inv.invoiceNumber, inv._id)}
                          className="p-1 rounded text-[#7b726a] hover:text-[#211d1a] transition-colors"
                          title="Copy Invoice Number"
                        >
                          {copiedId === inv._id ? (
                            <Check className="w-3 h-3 text-[#23865b]" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <div className="text-[10px] text-[#7b726a] font-mono mt-0.5">
                        TXN: {inv.transactionId || 'N/A'}
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-[#49423c] whitespace-nowrap">
                      {new Date(inv.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                      <div className="text-[10px] text-[#7b726a]">
                        {new Date(inv.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </TableCell>

                    {/* Table */}
                    <TableCell>
                      <span className="px-2 py-0.5 rounded-md bg-[#fff4ef] text-[#be4d27] font-mono font-bold text-xs border border-[#ffc9b5]">
                        {inv.table}
                      </span>
                    </TableCell>

                    {/* Payer */}
                    <TableCell>
                      <div className="text-xs font-bold text-[#211d1a]">
                        {inv.payerName || 'Table Guest'}
                      </div>
                      <div className="text-[10px] text-[#7b726a]">
                        {inv.splitType === 'FULL' ? 'Single Full Bill' : inv.splitType || 'Full Settlement'}
                      </div>
                    </TableCell>

                    {/* Items */}
                    <TableCell>
                      <div className="text-xs text-[#49423c] max-w-[180px] truncate" title={inv.items?.map((i) => `${i.name} (${i.quantity})`).join(', ')}>
                        {inv.items && inv.items.length > 0 ? (
                          <>
                            <span className="font-semibold text-[#211d1a]">
                              {inv.items[0].name}
                            </span>
                            {inv.items.length > 1 && (
                              <span className="text-[10px] text-[#7b726a]"> +{inv.items.length - 1} more</span>
                            )}
                          </>
                        ) : (
                          `${inv.quantities || 1} course items`
                        )}
                      </div>
                      <div className="text-[10px] text-[#7b726a]">
                        Subtotal: ₹{inv.subtotal}
                      </div>
                    </TableCell>

                    {/* Method */}
                    <TableCell>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          inv.paymentMethod === 'UPI'
                            ? 'bg-[#f3e8ff] text-[#7e22ce] border border-[#e9d5ff]'
                            : inv.paymentMethod === 'CARD'
                            ? 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]'
                            : 'bg-[#fef3c7] text-[#b45309] border border-[#fde68a]'
                        }`}
                      >
                        {inv.paymentMethod}
                      </span>
                    </TableCell>

                    {/* Tax */}
                    <TableCell className="text-xs text-[#49423c] font-mono">
                      ₹{inv.tax}
                      <div className="text-[9px] text-[#7b726a]">GST 5%</div>
                    </TableCell>

                    {/* Grand Total */}
                    <TableCell className="text-right">
                      <div className="text-sm font-black text-[#211d1a]">
                        ₹{inv.total.toLocaleString()}
                      </div>
                      {inv.serviceCharge > 0 && (
                        <div className="text-[9px] text-[#7b726a]">
                          incl. ₹{inv.serviceCharge} service
                        </div>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="text-center">
                      <Badge
                        variant={inv.status === 'PAID' ? 'success' : inv.status === 'PENDING' ? 'warning' : 'danger'}
                        size="sm"
                        dot
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsReceiptModalOpen(true);
                          }}
                          className="text-xs py-1 px-2.5 h-auto shadow-2xs font-semibold"
                        >
                          View Bill
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Modern Tax Invoice / Receipt Modal */}
      {isReceiptModalOpen && selectedInvoice && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Official GST Tax Invoice"
          size="lg"
        >
          <div className="space-y-6 text-[#211d1a] font-sans print:p-0">
            {/* Branded Receipt Card */}
            <div className="p-6 bg-[#fffdfa] border border-[#ecd7b7] rounded-2xl shadow-xs space-y-5">
              {/* Receipt Header */}
              <div className="flex items-start justify-between border-b border-[#ecd7b7] pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#d96236] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      RR
                    </div>
                    <span className="text-lg font-black text-[#211d1a] tracking-tight">
                      Rasrang
                    </span>
                  </div>
                  <div className="text-xs text-[#7b726a] mt-1 font-medium">
                    Modern Indian Dining Experience
                  </div>
                  <div className="text-[11px] text-[#7b726a]">
                    Plot 42, Galleria Boulevard, Sector 29, Gurugram, India
                  </div>
                  <div className="text-[11px] font-mono font-semibold text-[#be4d27] mt-0.5">
                    GSTIN: 07AAAAA0000A1Z5
                  </div>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-md bg-[#e8f6ef] text-[#23865b] font-bold text-xs border border-[#a5d8be]">
                    TAX INVOICE • PAID
                  </span>
                  <div className="text-xs font-mono font-bold text-[#211d1a] mt-2">
                    {selectedInvoice.invoiceNumber}
                  </div>
                  <div className="text-[11px] text-[#7b726a]">
                    {new Date(selectedInvoice.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Table & Session Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-[#7b726a] uppercase font-bold block">Table Number</span>
                  <strong className="text-sm text-[#211d1a] font-mono">{selectedInvoice.table}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#7b726a] uppercase font-bold block">Payer / Guest</span>
                  <strong className="text-xs text-[#211d1a]">{selectedInvoice.payerName || 'Table Guest'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#7b726a] uppercase font-bold block">Payment Method</span>
                  <strong className="text-xs text-[#211d1a]">{selectedInvoice.paymentMethod}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#7b726a] uppercase font-bold block">Transaction ID</span>
                  <strong className="text-[10px] text-[#7b726a] font-mono truncate block" title={selectedInvoice.transactionId}>
                    {selectedInvoice.transactionId}
                  </strong>
                </div>
              </div>

              {/* Itemized Order Breakdown */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#7b726a] pb-1 border-b border-[#ecd7b7]">
                  Itemized Order Breakdown
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-[#f5f1ec]">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded bg-[#f5f1ec] text-[#49423c] font-bold text-[10px] flex items-center justify-center">
                            {item.quantity}×
                          </span>
                          <span className="font-semibold text-[#211d1a]">{item.name}</span>
                        </div>
                        <div className="font-mono text-[#211d1a]">₹{item.total || item.price * item.quantity}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-[#7b726a] py-2">Standard dining order items included in this bill.</div>
                  )}
                </div>
              </div>

              {/* Totals & Tax Calculation Breakdown */}
              <div className="p-4 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] space-y-2 text-xs">
                <div className="flex justify-between text-[#7b726a]">
                  <span>Items Subtotal</span>
                  <span className="font-mono font-medium text-[#211d1a]">₹{selectedInvoice.subtotal}</span>
                </div>
                <div className="flex justify-between text-[#7b726a]">
                  <span>CGST (2.5%)</span>
                  <span className="font-mono text-[#211d1a]">₹{Math.round(selectedInvoice.tax / 2)}</span>
                </div>
                <div className="flex justify-between text-[#7b726a]">
                  <span>SGST (2.5%)</span>
                  <span className="font-mono text-[#211d1a]">₹{Math.round(selectedInvoice.tax / 2)}</span>
                </div>
                {selectedInvoice.serviceCharge > 0 && (
                  <div className="flex justify-between text-[#7b726a]">
                    <span>Service Charge (5%)</span>
                    <span className="font-mono text-[#211d1a]">₹{selectedInvoice.serviceCharge}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#e9e3dc] flex justify-between items-center text-sm font-black text-[#211d1a]">
                  <span>Total Amount Paid</span>
                  <span className="text-base text-[#d96236] font-mono">
                    ₹{selectedInvoice.total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Receipt Footer */}
              <div className="text-center pt-2 border-t border-[#ecd7b7] text-[10px] text-[#7b726a] space-y-1">
                <p className="font-medium">Thank you for dining at Rasrang Modern Indian Dining!</p>
                <p className="font-mono text-[9px] text-[#a89d91]">
                  DineSetu Table Intelligence Ledger • Digital Node Verified
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsReceiptModalOpen(false)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handlePrint}
                className="flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Tax Invoice</span>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InvoiceManagementPage;
