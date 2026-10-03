import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChefHat,
  Flame,
  Coffee,
  IceCream,
  Clock,
  Check,
  Play,
  CheckCircle2,
  AlertCircle,
  Bell,
  RefreshCw,
  Eye,
  Slash,
  Search,
  Filter,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
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
import { orderService, IOrder, IOrderItem } from '../services/orderService';
import { menuService, MenuItem } from '../services/menuService';
import { socketService } from '../services/socketService';
import { toast } from '../stores/useToastStore';
import { soundManager } from '../utils/sound';

export const KitchenDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [selectedStation, setSelectedStation] = useState<string>(user?.station || 'ALL');
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Sound Notification Control (User-controlled)
  const [isSoundEnabled, setIsSoundEnabled] = useState(soundManager.isEnabled());

  // Real-time ticking timer counter for countdown/elapsed timers
  const [currentTime, setCurrentTime] = useState(Date.now());

  // 86 Out-of-Stock Management Modal
  const [is86ModalOpen, setIs86ModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [togglingItem, setTogglingItem] = useState<string | null>(null);

  // Stations configuration (Phase 9)
  const stations = [
    { id: 'ALL', label: 'All Stations', icon: UtensilsCrossed },
    { id: 'Main Kitchen', label: 'Main Kitchen', icon: ChefHat },
    { id: 'Grill', label: 'Grill', icon: Flame },
    { id: 'Beverage', label: 'Beverage', icon: Coffee },
    { id: 'Dessert', label: 'Dessert', icon: IceCream },
  ];

  // Update timer every second for live ticket timers
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  // Fetch active kitchen orders
  const fetchActiveOrders = async () => {
    try {
      const data = await orderService.getActiveKitchenOrders(
        selectedStation === 'ALL' ? undefined : selectedStation
      );
      setOrders(data);
    } catch (err: any) {
      console.error('Failed to fetch kitchen orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch menu items for 86 control
  const fetchMenuItems = async () => {
    try {
      const items = await menuService.getMenuItems();
      setMenuItems(items);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle audio alerts
  const handleToggleSound = () => {
    const nextState = soundManager.toggleSound();
    setIsSoundEnabled(nextState);
    toast.info(nextState ? 'Kitchen Audio Chimes ON' : 'Kitchen Audio Chimes Muted');
  };

  // Socket.IO Listeners for Phase 9 Events
  useEffect(() => {
    fetchActiveOrders();
    fetchMenuItems();

    // Join station room
    socketService.joinKitchen(selectedStation === 'ALL' ? undefined : selectedStation);
    const socket = socketService.getSocket();

    // 1. Event: NEW_ORDER
    socket.on('NEW_ORDER', (newOrder: IOrder) => {
      setOrders((prev) => {
        if (prev.some((o) => o._id === newOrder._id)) return prev;
        return [newOrder, ...prev];
      });

      soundManager.playKitchenOrderChime();
      toast.info(
        `NEW ORDER: Table ${newOrder.tableNumber}`,
        `Round #${newOrder.roundNumber} placed by ${newOrder.placedByMemberName}`
      );
    });

    // 2. Event: ORDER_ACCEPTED
    socket.on('ORDER_ACCEPTED', (order: IOrder) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    });

    // 3. Event: ORDER_PREPARING
    socket.on('ORDER_PREPARING', (order: IOrder) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    });

    // 4. Event: ORDER_READY
    socket.on('ORDER_READY', (order: IOrder) => {
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
      soundManager.playOrderReadyChime();
    });

    // 5. General Order Update
    socket.on('ORDER_UPDATED', (updatedOrder: IOrder) => {
      setOrders((prev) =>
        prev
          .map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
          .filter((o) => o.status !== 'CANCELLED' && o.status !== 'SERVED')
      );
    });

    return () => {
      socket.off('NEW_ORDER');
      socket.off('ORDER_ACCEPTED');
      socket.off('ORDER_PREPARING');
      socket.off('ORDER_READY');
      socket.off('ORDER_UPDATED');
    };
  }, [selectedStation]);

  // Status transitions
  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const updated = await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      toast.success(
        `Order Updated to ${status}`,
        `Table ${updated.tableNumber} (Round #${updated.roundNumber})`
      );
    } catch (err: any) {
      toast.error('Failed to update ticket', err.message);
    }
  };

  // Item Checkoff Action in Prep Column
  const handleToggleItemStatus = async (orderId: string, item: IOrderItem) => {
    const nextStatus = item.status === 'READY' ? 'PREPARING' : 'READY';
    try {
      const updated = await orderService.updateOrderItemStatus(orderId, item._id, nextStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      toast.info(`${item.name} Marked ${nextStatus}`, `Table ${updated.tableNumber}`);
    } catch (err: any) {
      toast.error('Failed to update item status', err.message);
    }
  };

  // 86 Out of Stock Toggle
  const handleToggleAvailability = async (item: MenuItem) => {
    setTogglingItem(item._id);
    try {
      const updated = await menuService.toggleAvailability(item._id, !item.available);
      setMenuItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
      toast.success(
        updated.available ? `In Stock: ${item.name}` : `86'd (Sold Out): ${item.name}`
      );
    } catch (err: any) {
      toast.error('Failed to toggle availability', err.message);
    } finally {
      setTogglingItem(null);
    }
  };

  // Calculate live elapsed and countdown timers
  const formatTimer = (dateStr: string) => {
    const elapsedSeconds = Math.max(0, Math.floor((currentTime - new Date(dateStr).getTime()) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const getElapsedMinutes = (dateStr: string) => {
    return Math.floor((currentTime - new Date(dateStr).getTime()) / 60000);
  };

  // 4 Columns as required by Phase 9: NEW, ACCEPTED, PREPARING, READY
  const newTickets = orders.filter((o) => o.status === 'PLACED');
  const acceptedTickets = orders.filter((o) => o.status === 'ACCEPTED');
  const preparingTickets = orders.filter((o) => o.status === 'PREPARING');
  const readyTickets = orders.filter((o) => o.status === 'READY');

  return (
    <div className="space-y-5 selection:bg-amber-500 selection:text-stone-950">
      {/* 1. KDS Executive Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-amber-950/40 shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-black text-white flex items-center gap-2">
              <span>Kitchen Display System (KDS)</span>
              <Badge variant="station" size="sm">
                {selectedStation}
              </Badge>
            </div>
            <p className="text-xs text-stone-400 font-mono">
              FIFO Live Kitchen Dispatch • Active Tickets: {orders.length}
            </p>
          </div>
        </div>

        {/* Station Tabs + Sound Controls + 86 Modal */}
        <div className="flex flex-wrap items-center gap-2">
          {stations.map((st) => {
            const Icon = st.icon;
            const isSelected = selectedStation === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setSelectedStation(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-950/40'
                    : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{st.label}</span>
              </button>
            );
          })}

          {/* Sound Notification Toggle Button */}
          <button
            onClick={handleToggleSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isSoundEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-stone-950 text-stone-500 border-stone-800'
            }`}
            title={isSoundEnabled ? 'Audio Alerts ON' : 'Audio Alerts Muted'}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isSoundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIs86ModalOpen(true)}
            className="text-xs border-stone-700 hover:border-amber-500"
            leftIcon={<Slash className="w-3.5 h-3.5 text-rose-400" />}
          >
            86 Control
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchActiveOrders}
            className="text-xs"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. 4-COLUMN KDS BOARD: NEW | ACCEPTED | PREPARING | READY */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* ======================================================== */}
        {/* COLUMN 1: NEW (PLACED) */}
        {/* ======================================================== */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                1. NEW
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-black border border-amber-500/30">
              {newTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {newTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-stone-900/30 border border-dashed border-stone-800 text-xs text-stone-500">
                No new tickets waiting
              </div>
            ) : (
              newTickets.map((ticket) => {
                const elapsedMin = getElapsedMinutes(ticket.createdAt);
                const isUrgent = elapsedMin > 8;

                return (
                  <motion.div
                    key={ticket._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`rounded-2xl bg-stone-900/95 border transition-all shadow-xl overflow-hidden ${
                      isUrgent
                        ? 'border-rose-500 ring-2 ring-rose-500/30'
                        : 'border-amber-500/50 shadow-amber-950/20'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className="p-3 bg-amber-950/20 border-b border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-xl font-black text-white font-mono tracking-tight">
                          TABLE {ticket.tableNumber}
                        </div>
                        <div className="text-[11px] text-amber-400 font-mono font-bold">
                          Round #{ticket.roundNumber} • Ticket #{ticket._id.slice(-4).toUpperCase()}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-mono font-bold flex items-center gap-1 justify-end ${
                            isUrgent ? 'text-rose-400 font-black' : 'text-stone-300'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimer(ticket.createdAt)}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-medium">
                          👤 {ticket.placedByMemberName}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-3.5 space-y-3">
                      <div className="divide-y divide-stone-800/80">
                        {ticket.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5 min-w-0">
                              <div className="text-sm font-black text-stone-100">
                                <span className="text-amber-400 mr-1.5">{item.quantity}×</span>
                                {item.name}
                              </div>
                              {item.notes ? (
                                <div className="p-1 rounded bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
                                  Note: "{item.notes}"
                                </div>
                              ) : null}
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 shrink-0 font-mono">
                              {item.kitchenStation}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button: Accept Ticket (Phase 9 ORDER_ACCEPTED) */}
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full font-bold shadow-md bg-amber-500 hover:bg-amber-600 text-stone-950"
                        onClick={() => handleUpdateOrderStatus(ticket._id, 'ACCEPTED')}
                        leftIcon={<Check className="w-4 h-4 stroke-[3]" />}
                      >
                        Accept Ticket
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 2: ACCEPTED */}
        {/* ======================================================== */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b-2 border-cyan-500/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                2. ACCEPTED
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono font-black border border-cyan-500/30">
              {acceptedTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {acceptedTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-stone-900/30 border border-dashed border-stone-800 text-xs text-stone-500">
                No tickets in accepted queue
              </div>
            ) : (
              acceptedTickets.map((ticket) => {
                const elapsedMin = getElapsedMinutes(ticket.acceptedAt || ticket.createdAt);

                return (
                  <motion.div
                    key={ticket._id}
                    layout
                    className="rounded-2xl bg-stone-900/95 border border-cyan-500/40 shadow-xl overflow-hidden"
                  >
                    <div className="p-3 bg-cyan-950/20 border-b border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-xl font-black text-white font-mono tracking-tight">
                          TABLE {ticket.tableNumber}
                        </div>
                        <div className="text-[11px] text-cyan-400 font-mono font-bold">
                          Round #{ticket.roundNumber} • Ticket #{ticket._id.slice(-4).toUpperCase()}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1 justify-end">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimer(ticket.acceptedAt || ticket.createdAt)}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-medium">
                          👤 {ticket.placedByMemberName}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-3">
                      <div className="divide-y divide-stone-800/80">
                        {ticket.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5 min-w-0">
                              <div className="text-sm font-black text-stone-100">
                                <span className="text-cyan-400 mr-1.5">{item.quantity}×</span>
                                {item.name}
                              </div>
                              {item.notes ? (
                                <div className="p-1 rounded bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-300 font-medium">
                                  Note: "{item.notes}"
                                </div>
                              ) : null}
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 shrink-0 font-mono">
                              {item.kitchenStation}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Action Button: Start Prep (Phase 9 ORDER_PREPARING) */}
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full font-bold shadow-md bg-cyan-600 hover:bg-cyan-700 text-white"
                        onClick={() => handleUpdateOrderStatus(ticket._id, 'PREPARING')}
                        leftIcon={<Play className="w-4 h-4 fill-current" />}
                      >
                        Start Cooking / Prep
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 3: PREPARING (ACTIVE COOKING) */}
        {/* ======================================================== */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b-2 border-indigo-500/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                3. PREPARING
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-black border border-indigo-500/30">
              {preparingTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {preparingTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-stone-900/30 border border-dashed border-stone-800 text-xs text-stone-500">
                No orders currently in prep
              </div>
            ) : (
              preparingTickets.map((ticket) => {
                const elapsedMin = getElapsedMinutes(ticket.preparingAt || ticket.createdAt);
                const isOverdue = elapsedMin > 18;

                return (
                  <motion.div
                    key={ticket._id}
                    layout
                    className={`rounded-2xl bg-stone-900/95 border transition-all shadow-xl overflow-hidden ${
                      isOverdue
                        ? 'border-rose-500 ring-2 ring-rose-500/30'
                        : 'border-indigo-500/40'
                    }`}
                  >
                    <div className="p-3 bg-indigo-950/20 border-b border-stone-800 flex items-center justify-between">
                      <div>
                        <div className="text-xl font-black text-white font-mono tracking-tight">
                          TABLE {ticket.tableNumber}
                        </div>
                        <div className="text-[11px] text-indigo-400 font-mono font-bold">
                          Round #{ticket.roundNumber} • Ticket #{ticket._id.slice(-4).toUpperCase()}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-mono font-bold flex items-center gap-1 justify-end ${
                            isOverdue ? 'text-rose-400 animate-bounce' : 'text-indigo-300'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          {formatTimer(ticket.preparingAt || ticket.createdAt)}
                        </span>
                        <span className="text-[10px] text-stone-400 block font-medium">
                          👤 {ticket.placedByMemberName}
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 space-y-3">
                      {/* Interactive Item Checkoff List */}
                      <div className="space-y-2">
                        {ticket.items.map((item, idx) => {
                          const isItemReady = item.status === 'READY';
                          return (
                            <div
                              key={idx}
                              onClick={() => handleToggleItemStatus(ticket._id, item)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                                isItemReady
                                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                                  : 'bg-stone-950 border-stone-800 text-stone-200 hover:border-stone-700'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div
                                  className={`text-xs font-bold ${
                                    isItemReady ? 'line-through opacity-70' : 'text-white'
                                  }`}
                                >
                                  {item.quantity}× {item.name}
                                </div>
                                {item.notes && (
                                  <div className="text-[10px] text-amber-400 italic">
                                    "{item.notes}"
                                  </div>
                                )}
                              </div>

                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isItemReady
                                    ? 'bg-emerald-500 border-emerald-400 text-white'
                                    : 'border-stone-700 text-stone-600'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Action Button: Mark Ready (Phase 9 ORDER_READY) */}
                      <Button
                        variant="success"
                        size="md"
                        className="w-full font-bold shadow-md shadow-emerald-950/50"
                        onClick={() => handleUpdateOrderStatus(ticket._id, 'READY')}
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                      >
                        Mark Ticket Ready
                      </Button>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* COLUMN 4: READY (FOR WAITER PICKUP) */}
        {/* ======================================================== */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500/80 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono">
                4. READY
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-black border border-emerald-500/30">
              {readyTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {readyTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-stone-900/30 border border-dashed border-stone-800 text-xs text-stone-500">
                No orders waiting on pass
              </div>
            ) : (
              readyTickets.map((ticket) => (
                <motion.div
                  key={ticket._id}
                  layout
                  className="rounded-2xl bg-stone-900/95 border border-emerald-500/50 shadow-glow-green overflow-hidden"
                >
                  <div className="p-3 bg-emerald-950/20 border-b border-stone-800 flex items-center justify-between">
                    <div>
                      <div className="text-xl font-black text-white font-mono tracking-tight">
                        TABLE {ticket.tableNumber}
                      </div>
                      <div className="text-[11px] text-emerald-400 font-mono font-bold">
                        Round #{ticket.roundNumber} • Ticket #{ticket._id.slice(-4).toUpperCase()}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-300 flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready
                      </span>
                      <span className="text-[10px] text-stone-400 block font-medium">
                        👤 {ticket.placedByMemberName}
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-3">
                    <div className="text-xs text-stone-200 divide-y divide-stone-800/80">
                      {ticket.items.map((i, idx) => (
                        <div key={idx} className="py-1 flex justify-between">
                          <span className="font-bold">
                            {i.quantity}× {i.name}
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">{i.kitchenStation}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 animate-bounce" />
                      <span>Waiter floor notification broadcasted</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-bold border-stone-700 hover:border-emerald-500"
                      onClick={() => handleUpdateOrderStatus(ticket._id, 'SERVED')}
                    >
                      Mark Ticket Served
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. 86 (OUT-OF-STOCK) DISH MANAGEMENT MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={is86ModalOpen}
        onClose={() => setIs86ModalOpen(false)}
        title="Kitchen 86 Control (Out-of-Stock Dishes)"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-xs text-stone-400 leading-relaxed">
            Quickly toggle dishes when ingredients deplete. 86'd items will be instantly disabled across
            customer digital menus in real-time via Socket.IO.
          </p>

          <div className="divide-y divide-stone-800/80 max-h-80 overflow-y-auto pr-1">
            {menuItems.map((item) => (
              <div key={item._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-white truncate">{item.name}</div>
                  <div className="text-[10px] text-stone-400">
                    Station: {item.kitchenStationId || 'Main Kitchen'} • {item.foodType}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant={item.available ? 'outline' : 'danger'}
                  className="py-1 px-3 text-xs font-bold shrink-0"
                  onClick={() => handleToggleAvailability(item)}
                  isLoading={togglingItem === item._id}
                >
                  {item.available ? 'In Stock (86 It)' : "86'd (Re-enable)"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KitchenDashboard;
