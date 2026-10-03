import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ConciergeBell,
  Check,
  Droplet,
  Receipt,
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
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  PageHeader,
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

  // Action: Acknowledge assistance call
  const handleAcknowledgeRequest = async (id: string) => {
    try {
      const updated = await staffRequestService.acknowledgeRequest(id);
      setStaffRequests((prev) => prev.map((r) => (r._id === id ? updated : r)));
      toast.info('Acknowledged', `Customer informed you are attending Table ${updated.tableNumber}`);
    } catch (err: any) {
      toast.error('Failed to acknowledge', err.message);
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
        return <Droplet className="w-4 h-4 text-cyan-400" />;
      case 'Cutlery':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'Call Waiter':
        return <Bell className="w-4 h-4 text-purple-400" />;
      case 'Request Bill':
      case 'BILL':
        return <Receipt className="w-4 h-4 text-orange-400" />;
      default:
        return <Info className="w-4 h-4 text-stone-400" />;
    }
  };

  // Filter requests
  const filteredRequests = staffRequests.filter((r) => {
    if (requestFilter === 'BILLS') return r.requestType === 'Request Bill';
    if (requestFilter === 'ASSISTANCE') return r.requestType !== 'Request Bill';
    return true;
  });

  const billRequestsCount = staffRequests.filter((r) => r.requestType === 'Request Bill').length;
  const assistanceRequestsCount = staffRequests.filter((r) => r.requestType !== 'Request Bill').length;
  const occupiedTables = tables.filter((t) => t.status !== 'AVAILABLE');

  return (
    <div className="space-y-6 selection:bg-orange-500 selection:text-white">
      {/* 1. Header & Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-950/40 shrink-0">
            <ConciergeBell className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-black text-white flex items-center gap-2">
              <span>Waiter Service Terminal</span>
              <Badge variant="success" size="sm" dot>
                Floor Active
              </Badge>
            </div>
            <p className="text-xs text-stone-400 font-mono">
              Staff: <strong className="text-stone-200">{user?.name || 'Staff Member'}</strong> • Real-time alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isSoundEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-stone-950 text-stone-500 border-stone-800'
            }`}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isSoundEnabled ? 'Chimes ON' : 'Muted'}</span>
          </button>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadFloorData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Key Service Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-stone-400 uppercase font-mono font-bold">Food on Pass</div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-0.5">{readyOrders.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ConciergeBell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-stone-400 uppercase font-mono font-bold">Assistance Calls</div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{assistanceRequestsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-stone-400 uppercase font-mono font-bold">Bill Requests</div>
            <div className="text-2xl font-black text-orange-400 font-mono mt-0.5">{billRequestsCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <Receipt className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs text-stone-400 uppercase font-mono font-bold">Occupied Tables</div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">
              {occupiedTables.length} / {tables.length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. READY FOOD ON PASS: PICKUP & SERVE */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">
              Ready on Kitchen Pass ({readyOrders.length})
            </h2>
          </div>
          <span className="text-xs text-stone-400">Plated dishes waiting for floor delivery</span>
        </div>

        {readyOrders.length === 0 ? (
          <div className="p-6 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-xs text-stone-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>All kitchen tickets have been served to guests. Pass is clear.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {readyOrders.map((order) => {
              const isCompleting = completingId === order._id;

              return (
                <motion.div
                  key={order._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: isCompleting ? 0.4 : 1, scale: isCompleting ? 0.95 : 1 }}
                  className="p-4 rounded-2xl bg-stone-900/95 border border-emerald-500/50 shadow-glow-green space-y-3 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-stone-950 font-mono font-black text-sm shadow-md">
                        TABLE {order.tableNumber}
                      </span>
                      <span className="text-xs text-stone-300 font-mono font-bold">
                        Round #{order.roundNumber}
                      </span>
                    </div>
                    <Badge variant="success" size="sm" dot>
                      Ready for Pickup
                    </Badge>
                  </div>

                  <div className="divide-y divide-stone-800/80 text-xs py-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span className="font-bold text-white">
                          <span className="text-emerald-400 mr-1.5">{item.quantity}×</span>
                          {item.name}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{item.kitchenStation}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="success"
                    size="md"
                    className="w-full font-bold shadow-md shadow-emerald-950/60"
                    leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
                    onClick={() => handleMarkServed(order._id, order.tableNumber)}
                  >
                    Mark Dishes Served to Table {order.tableNumber}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. REAL-TIME SERVICE REQUESTS & BILL REQUESTS */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono">
              Guest Assistance & Bill Calls ({staffRequests.length})
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setRequestFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                requestFilter === 'ALL'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-white'
              }`}
            >
              All ({staffRequests.length})
            </button>
            <button
              onClick={() => setRequestFilter('ASSISTANCE')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                requestFilter === 'ASSISTANCE'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-white'
              }`}
            >
              Service ({assistanceRequestsCount})
            </button>
            <button
              onClick={() => setRequestFilter('BILLS')}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                requestFilter === 'BILLS'
                  ? 'bg-orange-500 text-white font-bold shadow-sm'
                  : 'bg-stone-900 text-stone-400 border border-stone-800 hover:text-white'
              }`}
            >
              Bills ({billRequestsCount})
            </button>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="p-6 rounded-2xl bg-stone-900/40 border border-dashed border-stone-800 text-xs text-stone-400 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No pending diner calls in this category. Floor service running smoothly.</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredRequests.map((req) => {
              const isAcknowledged = req.status === 'IN_PROGRESS' || req.status === 'ACCEPTED';
              const isBillReq = req.requestType === 'Request Bill';
              const isCompleting = completingId === req._id;

              return (
                <motion.div
                  key={req._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: isCompleting ? 0.3 : 1, scale: isCompleting ? 0.95 : 1 }}
                  className={`p-4 rounded-2xl bg-stone-900/95 border transition-all shadow-xl space-y-3 ${
                    isBillReq
                      ? 'border-orange-500/80 ring-1 ring-orange-500/30'
                      : isAcknowledged
                      ? 'border-cyan-500/50'
                      : 'border-amber-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black text-white font-mono">
                        TABLE {req.tableNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded-lg bg-stone-800">
                        {getRequestIcon(req.requestType)}
                      </span>
                      <span className="text-xs font-bold text-white">{req.requestType}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs py-1">
                    <div className="text-stone-300">
                      Guest: <strong>{req.memberName || 'Diner'}</strong>
                    </div>

                    {req.notes ? (
                      <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-300 italic">
                        "{req.notes}"
                      </div>
                    ) : null}

                    {isAcknowledged ? (
                      <div className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>Attended by: {req.handledByStaffName || 'Staff'}</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 pt-1 border-t border-stone-800/80">
                    {!isAcknowledged ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-stone-700 hover:border-amber-500"
                        onClick={() => handleAcknowledgeRequest(req._id)}
                      >
                        Acknowledge
                      </Button>
                    ) : null}

                    {isBillReq ? (
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 text-xs font-bold shadow-md bg-orange-500 hover:bg-orange-600 text-white"
                        onClick={() => {
                          const tableItem = tables.find((t) => t.tableNumber === req.tableNumber);
                          if (tableItem) handleOpenTableBill(tableItem);
                          else {
                            setSelectedSessionId(req.session);
                            setSelectedTableNumber(req.tableNumber);
                            paymentService.getBillSummary(req.session).then(setBillSummary).catch((e) => toast.error(e.message));
                          }
                        }}
                      >
                        Settle Bill
                      </Button>
                    ) : null}

                    <Button
                      variant={isBillReq ? 'outline' : 'primary'}
                      size="sm"
                      className="flex-1 text-xs font-bold"
                      onClick={() => handleResolveRequest(req._id)}
                    >
                      Complete
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. LIVE FLOOR TABLES OVERVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-orange-400" />
            <span>Floor Tables Overview ({tables.length})</span>
          </h2>
          <span className="text-xs text-stone-400">Click any occupied table to inspect or settle bill</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {tables.map((tbl) => {
            const isAvail = tbl.status === 'AVAILABLE';
            const isReady = tbl.status === 'READY';
            const isPayment = tbl.status === 'PAYMENT' || tbl.status === 'PAYMENT_PENDING';
            const isPrep = tbl.status === 'PREPARING';

            return (
              <motion.div
                key={tbl._id}
                whileHover={{ scale: 1.03 }}
                onClick={() => handleOpenTableBill(tbl)}
                className={`p-3.5 rounded-2xl border text-center cursor-pointer transition-all shadow-md ${
                  isAvail
                    ? 'bg-stone-900/60 border-stone-800 hover:border-emerald-500/40 text-stone-400'
                    : isReady
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-glow-green'
                    : isPayment
                    ? 'bg-orange-950/40 border-orange-500 text-orange-300 shadow-glow-orange'
                    : isPrep
                    ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300'
                    : 'bg-stone-900 border-amber-500/60 text-amber-300'
                }`}
              >
                <div className="text-lg font-black font-mono text-white">
                  T-{tbl.tableNumber}
                </div>
                <div className="text-[10px] uppercase font-bold mt-1 tracking-wider">
                  {tbl.status}
                </div>
                <div className="text-[10px] text-stone-500 mt-0.5">Cap: {tbl.capacity}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 6. BILL SUMMARY & SETTLEMENT MODAL */}
      <Modal
        isOpen={!!billSummary}
        onClose={() => setBillSummary(null)}
        title={`Table ${selectedTableNumber} - Bill Settlement`}
        size="md"
      >
        {billSummary && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Items Subtotal ({billSummary.summary.itemCount} items)</span>
                <span className="font-mono text-white">
                  {billSummary.restaurant.currency}
                  {billSummary.summary.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>GST ({billSummary.restaurant.taxRate}%)</span>
                <span className="font-mono text-white">
                  {billSummary.restaurant.currency}
                  {billSummary.summary.tax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Service Charge ({billSummary.restaurant.serviceRate}%)</span>
                <span className="font-mono text-white">
                  {billSummary.restaurant.currency}
                  {billSummary.summary.serviceCharge.toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-sm font-extrabold text-white">
                <span>Grand Total:</span>
                <span className="text-base text-orange-400 font-mono">
                  {billSummary.restaurant.currency}
                  {billSummary.summary.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Split Breakdown */}
            {billSummary.memberSplits && billSummary.memberSplits.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-xs font-bold text-stone-300">Individual Diner Breakdown:</div>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {billSummary.memberSplits.map((sp, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-xl bg-stone-900/90 border border-stone-800 flex justify-between text-xs"
                    >
                      <span className="font-bold text-white">{sp.memberName}</span>
                      <span className="font-mono text-orange-300 font-bold">
                        {billSummary.restaurant.currency}
                        {sp.grandTotal.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cash / POS Settlement Button */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full font-bold shadow-glow-orange"
                onClick={handleSettleBill}
                isLoading={isSettlingPayment}
                leftIcon={<CreditCard className="w-4 h-4" />}
              >
                Record Cash / POS Settlement ({billSummary.restaurant.currency}
                {billSummary.summary.grandTotal.toFixed(2)})
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WaiterDashboard;
