import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ConciergeBell,
  Check,
  Droplets,
  ReceiptText,
  Utensils,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Bell,
  RefreshCw,
  Eye,
  CreditCard,
  Download,
  Users,
  Sparkles,
  Info,
  ChevronRight,
  UtensilsCrossed,
  Volume2,
  VolumeX,
  ChefHat,
  Table2,
  DollarSign,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Modal,
  EmptyState,
} from '../components/ui';
import { useAuthStore } from '../stores/useAuthStore';
import { orderService, IOrder } from '../services/orderService';
import { staffRequestService, StaffRequestItem } from '../services/staffRequestService';
import { tableService, TableItem } from '../services/tableService';
import { paymentService, BillSummary } from '../services/paymentService';
import { socketService } from '../services/socketService';
import { toast } from '../stores/useToastStore';
import { soundManager } from '../utils/sound';

export const WaiterDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [readyOrders, setReadyOrders] = useState<IOrder[]>([]);
  const [staffRequests, setStaffRequests] = useState<StaffRequestItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active filter tab for requests: 'ALL' | 'ASSISTANCE' | 'BILLS'
  const [requestFilter, setRequestFilter] = useState<'ALL' | 'ASSISTANCE' | 'BILLS'>('ALL');

  // Sound alert toggle
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundManager.isEnabled());

  // Bill Settlement Modal for Waiter
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedTableNumber, setSelectedTableNumber] = useState<string>('');
  const [billSummary, setBillSummary] = useState<BillSummary | null>(null);
  const [isSettlingPayment, setIsSettlingPayment] = useState(false);

  // Completed item animation tracking
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Load all floor data
  const loadFloorData = async () => {
    try {
      const [allKitchenOrders, requests, tableList] = await Promise.all([
        orderService.getActiveKitchenOrders(),
        staffRequestService.getActiveRequests(),
        tableService.getAllTables(),
      ]);

      setReadyOrders(allKitchenOrders.filter((o: IOrder) => o.status === 'READY'));
      setStaffRequests(requests);
      setTables(tableList);
    } catch (err: any) {
      console.error('Error loading waiter data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFloorData();

    // Socket.IO listeners
    socketService.joinWaiter();
    const socket = socketService.getSocket();

    // 1. Food becomes ready for delivery
    socket.on('ORDER_READY', (readyData: any) => {
      soundManager.playOrderReadyChime();
      loadFloorData();
      toast.info(
        `Dishes Plated: Table ${readyData.tableNumber}!`,
        `Round #${readyData.roundNumber} waiting on kitchen pass.`
      );
    });

    // 2. Customer service requests (Water, Cutlery, Waiter, Bill)
    socket.on('STAFF_REQUEST', (req: StaffRequestItem) => {
      setStaffRequests((prev) => {
        if (prev.some((r) => r._id === req._id)) return prev;
        return [req, ...prev];
      });

      // Subtle notification chime
      soundManager.playKitchenOrderChime();
      toast.warning(
        `Table ${req.tableNumber} Request`,
        `${req.memberName || 'Diner'} requested: ${req.requestType}`
      );
    });

    socket.on('STAFF_REQUEST_UPDATED', (updatedReq: StaffRequestItem) => {
      if (updatedReq.status === 'COMPLETED') {
        setStaffRequests((prev) => prev.filter((r) => r._id !== updatedReq._id));
      } else {
        setStaffRequests((prev) =>
          prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
        );
      }
    });

    // 3. Live table status changes
    socket.on('TABLE_UPDATED', (tbl: TableItem) => {
      setTables((prev) => prev.map((t) => (t._id === tbl._id ? tbl : t)));
    });

    return () => {
      socket.off('ORDER_READY');
      socket.off('STAFF_REQUEST');
      socket.off('STAFF_REQUEST_UPDATED');
      socket.off('TABLE_UPDATED');
    };
  }, []);

  // Action: Waiter serves food to table with subtle animation
  const handleMarkServed = async (orderId: string, tableNumber: string) => {
    setCompletingId(orderId);
    try {
      await orderService.serveOrder(orderId);
      setTimeout(() => {
        setReadyOrders((prev) => prev.filter((o) => o._id !== orderId));
        setCompletingId(null);
        loadFloorData();
      }, 300);

      toast.success(
        `Delivered to Table ${tableNumber}`,
        'Dishes marked as SERVED to guests.'
      );
    } catch (err: any) {
      setCompletingId(null);
      toast.error('Failed to mark served', err.message);
    }
  };

  // Action: Complete assistance call
  const handleResolveRequest = async (id: string) => {
    setCompletingId(id);
    try {
      await staffRequestService.resolveRequest(id);
      setTimeout(() => {
        setStaffRequests((prev) => prev.filter((r) => r._id !== id));
        setCompletingId(null);
      }, 300);
      toast.success('Assistance Completed', 'Request cleared from service queue.');
    } catch (err: any) {
      setCompletingId(null);
      toast.error('Failed to resolve', err.message);
    }
  };

  // Action: Open Bill for Table
  const handleOpenTableBill = async (tbl: TableItem) => {
    const sId = (tbl as any).activeSessionId || tbl.activeSession?.id;
    if (!sId) {
      toast.info('No Active Session', `Table ${tbl.tableNumber} is currently available.`);
      return;
    }

    try {
      setSelectedSessionId(sId);
      setSelectedTableNumber(tbl.tableNumber);
      const data = await paymentService.getBillSummary(sId);
      setBillSummary(data);
    } catch (err: any) {
      toast.error('Could not fetch bill', err.message);
    }
  };

  // Action: Waiter records cash / POS settlement
  const handleSettleBill = async () => {
    if (!selectedSessionId || !billSummary) return;

    setIsSettlingPayment(true);
    try {
      await paymentService.simulatePayment({
        sessionId: selectedSessionId,
        method: 'CASH',
        payerName: `Settled by Waiter (${user?.name || 'Floor Staff'})`,
      });

      toast.success('Bill Settled', `Table ${selectedTableNumber} has been released and cleared.`);
      setBillSummary(null);
      setSelectedSessionId(null);
      loadFloorData();
    } catch (err: any) {
      toast.error('Settlement Failed', err.message);
    } finally {
      setIsSettlingPayment(false);
    }
  };

  const handleToggleSound = () => {
    const nextState = soundManager.toggleSound();
    setIsSoundEnabled(nextState);
    toast.info(nextState ? 'Service Chimes ON' : 'Service Chimes Muted');
  };

  // Request Helpers
  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'Water':
        return <Droplets className="w-4 h-4 text-[#3974b9]" />;
      case 'Cutlery':
        return <Utensils className="w-4 h-4 text-[#bf7a13]" />;
      case 'Call Waiter':
        return <Bell className="w-4 h-4 text-[#d96236]" />;
      case 'Request Bill':
      case 'BILL':
        return <ReceiptText className="w-4 h-4 text-[#d96236]" />;
      default:
        return <Info className="w-4 h-4 text-[#7b726a]" />;
    }
  };

  const occupiedCount = tables.filter((t) => t.status !== 'AVAILABLE').length;

  return (
    <div className="space-y-6 text-[#211d1a] font-sans selection:bg-[#23865b] selection:text-white">
      {/* 1. Header & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e9e3dc]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#23865b] mb-1">
            FLOOR SERVICE • ACTIVE SHIFT
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#211d1a] tracking-tight">
            Your Service Section
          </h1>
          <p className="text-xs text-[#7b726a] mt-1">
            Good evening, {user?.name || 'Riya'}. {readyOrders.length} orders ready on pass, {staffRequests.length} diner requests pending.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-[#e8f6ef] border border-[#a5d8be] text-[#23865b] text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#23865b] animate-pulse" />
            <span>Shift Active • 4h 12m</span>
          </div>

          <button
            type="button"
            onClick={handleToggleSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              isSoundEnabled
                ? 'bg-[#e8f6ef] text-[#23865b] border-[#a5d8be]'
                : 'bg-white text-[#7b726a] border-[#e9e3dc]'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#23865b]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isSoundEnabled ? 'Chimes ON' : 'Muted'}</span>
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadFloorData}
            className="text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync
          </Button>
        </div>
      </div>

      {/* 2. Waiter Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">My Assigned Tables</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {tables.length || 8}
            </div>
            <span className="text-[10px] text-[#7b726a] font-medium">{occupiedCount || 6} occupied</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center">
            <Table2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Ready to Serve</span>
            <div className="text-2xl font-black text-[#23865b] tracking-tight mt-1">
              {readyOrders.length}
            </div>
            <span className="text-[10px] text-[#23865b] font-bold">Pick up from kitchen pass</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#e8f6ef] text-[#23865b] flex items-center justify-center">
            <ChefHat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Open Requests</span>
            <div className="text-2xl font-black text-[#bf7a13] tracking-tight mt-1">
              {staffRequests.length}
            </div>
            <span className="text-[10px] text-[#bf7a13] font-bold">Immediate attention needed</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Main Operational Panels: Ready to Serve & Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Ready to Serve */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e9e3dc]">
            <div>
              <h3 className="text-base font-bold text-[#211d1a]">Ready to Serve</h3>
              <p className="text-xs text-[#7b726a]">Plated orders waiting on the kitchen pass</p>
            </div>
            <Badge variant="success" size="sm">
              {readyOrders.length} Ready
            </Badge>
          </div>

          <div className="space-y-3">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#fbf9f6] border border-dashed border-[#e9e3dc] text-xs text-[#7b726a]">
                All plated orders have been served to guests. Kitchen is clear!
              </div>
            ) : (
              readyOrders.map((ord) => (
                <div
                  key={ord._id}
                  className="p-4 rounded-xl border border-[#a5d8be] bg-[#e8f6ef]/40 flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#e8f6ef] text-[#23865b] border border-[#a5d8be] flex items-center justify-center shrink-0">
                      <ChefHat className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-black text-[#211d1a] flex items-center gap-2">
                        <span>TABLE {ord.tableNumber}</span>
                        <span className="text-[10px] text-[#7b726a] font-mono">#{ord._id.slice(-4).toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-[#49423c] truncate mt-0.5">
                        {ord.items.map((i) => `${i.quantity}× ${i.name}`).join(' • ')}
                      </p>
                      <span className="text-[10px] text-[#23865b] font-bold">Ready on pass</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    className="shrink-0 bg-[#23865b] hover:bg-[#1d704c] text-white font-bold"
                    onClick={() => handleMarkServed(ord._id, ord.tableNumber)}
                    isLoading={completingId === ord._id}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Serve
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panel 2: Service Requests */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e9e3dc]">
            <div>
              <h3 className="text-base font-bold text-[#211d1a]">Service Requests</h3>
              <p className="text-xs text-[#7b726a]">Newest diner assistance calls appear first</p>
            </div>
            <Badge variant="warning" size="sm" dot>
              {staffRequests.length} Open
            </Badge>
          </div>

          <div className="space-y-3">
            {staffRequests.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#fbf9f6] border border-dashed border-[#e9e3dc] text-xs text-[#7b726a]">
                No pending assistance requests. All tables are cared for!
              </div>
            ) : (
              staffRequests.map((req) => (
                <div
                  key={req._id}
                  className="p-3.5 rounded-xl border border-[#e9e3dc] bg-[#fbf9f6] flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#e9e3dc] flex items-center justify-center shrink-0 shadow-2xs">
                      {getRequestIcon(req.requestType)}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs text-[#211d1a] block truncate">
                        {req.requestType}
                      </strong>
                      <span className="text-[10px] text-[#7b726a]">
                        Table {req.tableNumber} • {req.memberName || 'Diner'}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0 text-xs font-bold"
                    onClick={() => handleResolveRequest(req._id)}
                    isLoading={completingId === req._id}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Complete
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Floor Table Overview */}
      <div className="bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e9e3dc]">
          <div>
            <h3 className="text-base font-bold text-[#211d1a]">My Section Tables</h3>
            <p className="text-xs text-[#7b726a]">West Wing • Click any table to review bill or close session</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {(tables.length > 0
            ? tables
            : [
                { tableNumber: '01', capacity: 4, status: 'AVAILABLE' },
                { tableNumber: '02', capacity: 2, status: 'ACTIVE' },
                { tableNumber: '03', capacity: 4, status: 'ORDERING' },
                { tableNumber: '04', capacity: 6, status: 'PAYMENT_PENDING' },
                { tableNumber: '05', capacity: 2, status: 'READY' },
                { tableNumber: '06', capacity: 4, status: 'ACTIVE' },
                { tableNumber: '07', capacity: 4, status: 'ORDERING' },
                { tableNumber: '08', capacity: 2, status: 'AVAILABLE' },
              ]
          ).map((t, idx) => (
            <div
              key={idx}
              onClick={() => handleOpenTableBill(t as any)}
              className={`p-3 rounded-xl border bg-white flex flex-col justify-between items-center text-center shadow-2xs hover:shadow-sm transition-all cursor-pointer ${
                t.status === 'AVAILABLE'
                  ? 'border-[#e9e3dc]'
                  : t.status === 'READY'
                  ? 'border-[#a5d8be] bg-[#e8f6ef]/30'
                  : 'border-[#bfdbfe]'
              }`}
            >
              <span
                className={`text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                  t.status === 'AVAILABLE'
                    ? 'bg-[#f5f1ec] text-[#7b726a]'
                    : t.status === 'READY'
                    ? 'bg-[#e8f6ef] text-[#23865b]'
                    : t.status === 'ORDERING'
                    ? 'bg-[#fff8e7] text-[#bf7a13]'
                    : 'bg-[#eaf2fb] text-[#3974b9]'
                }`}
              >
                {t.status}
              </span>
              <div className="text-lg font-black text-[#211d1a] my-1">
                T-{t.tableNumber}
              </div>
              <div className="text-[9px] text-[#7b726a]">{t.capacity || 4} seats</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bill Settlement Modal */}
      <Modal
        isOpen={Boolean(billSummary)}
        onClose={() => setBillSummary(null)}
        title={`Table ${selectedTableNumber} Bill Settlement`}
        size="md"
      >
        {billSummary && (
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] flex justify-between">
              <div>
                <span className="text-[10px] text-[#7b726a]">Dining Session</span>
                <div className="font-bold text-[#211d1a]">Table #{selectedTableNumber}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#7b726a]">Total Payable</span>
                <div className="text-base font-black text-[#211d1a]">₹{billSummary.summary.grandTotal.toFixed(2)}</div>
              </div>
            </div>

            <div className="divide-y divide-[#e9e3dc] max-h-56 overflow-y-auto">
              {billSummary.summary.items.map((it: any, i: number) => (
                <div key={i} className="py-2 flex justify-between">
                  <span>
                    <b>{it.quantity}×</b> {it.name}
                  </span>
                  <span className="font-bold">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-[#fbf9f6] rounded-xl border border-[#e9e3dc] space-y-1">
              <div className="flex justify-between text-[#7b726a]">
                <span>Subtotal</span>
                <span>₹{billSummary.summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#7b726a]">
                <span>Tax & Service</span>
                <span>₹{(billSummary.summary.tax + billSummary.summary.serviceCharge).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-black text-sm text-[#211d1a] pt-1 border-t border-[#e9e3dc]">
                <span>Grand Total</span>
                <span>₹{billSummary.summary.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full font-bold bg-[#23865b] hover:bg-[#1d704c] text-white"
              onClick={handleSettleBill}
              isLoading={isSettlingPayment}
            >
              Record Settlement & Clear Table
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
