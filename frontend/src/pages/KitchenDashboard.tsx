import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ChefHat,
  Flame,
  Coffee,
  IceCream,
  Clock,
  Check,
  Play,
  CheckCircle2,
  Bell,
  RefreshCw,
  Slash,
  Volume2,
  VolumeX,
  UtensilsCrossed,
} from 'lucide-react';
import {
  Badge,
  Button,
  Modal,
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
    { id: 'ALL', label: 'All Orders', icon: UtensilsCrossed },
    { id: 'Main Kitchen', label: 'Main Kitchen', icon: ChefHat },
    { id: 'Grill', label: 'Tandoor & Grill', icon: Flame },
    { id: 'Beverage', label: 'Beverages', icon: Coffee },
    { id: 'Dessert', label: 'Desserts', icon: IceCream },
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
      if (isSoundEnabled) soundManager.playKitchenOrderChime();
      toast.info('New Ticket Arrived', `Table #${newOrder.tableNumber} - Round ${newOrder.roundNumber}`);
    });

    // 2. Event: ORDER_STATUS_CHANGED
    socket.on('ORDER_STATUS_CHANGED', ({ orderId, status }: { orderId: string; status: any }) => {
      setOrders((prev) =>
        prev
          .map((o) => (o._id === orderId ? { ...o, status } : o))
          .filter((o) => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
      );
    });

    // 3. Event: ORDER_UPDATED
    socket.on('ORDER_UPDATED', (updatedOrder: IOrder) => {
      setOrders((prev) => prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)));
    });

    // 4. Event: ITEM_AVAILABILITY_CHANGED
    socket.on('ITEM_AVAILABILITY_CHANGED', ({ itemId, available }: { itemId: string; available: boolean }) => {
      setMenuItems((prev) => prev.map((i) => (i._id === itemId ? { ...i, available } : i)));
    });

    return () => {
      socket.off('NEW_ORDER');
      socket.off('ORDER_STATUS_CHANGED');
      socket.off('ORDER_UPDATED');
      socket.off('ITEM_AVAILABILITY_CHANGED');
    };
  }, [selectedStation, isSoundEnabled]);

  // Handle status update
  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev
          .map((o) => (o._id === orderId ? { ...o, status } : o))
          .filter((o) => o.status !== 'COMPLETED')
      );
      if (status === 'READY') {
        toast.success('Food Ready', 'Waiter floor alerted for pickup');
      }
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  // Toggle item-level completion
  const handleToggleItemStatus = async (orderId: string, item: IOrderItem) => {
    const nextStatus: IOrderItem['status'] = item.status === 'READY' ? 'PREPARING' : 'READY';
    try {
      await orderService.updateOrderItemStatus(orderId, item._id, nextStatus);
      setOrders((prev) =>
        prev.map((ord) => {
          if (ord._id !== orderId) return ord;
          const updatedItems: IOrderItem[] = ord.items.map((it) =>
            it._id === item._id ? { ...it, status: nextStatus } : it
          );
          return { ...ord, items: updatedItems };
        })
      );
    } catch (err: any) {
      toast.error('Error updating item', err.message);
    }
  };

  // Toggle 86 availability
  const handleToggleAvailability = async (item: MenuItem) => {
    setTogglingItem(item._id);
    try {
      const updated = await menuService.toggleAvailability(item._id, !item.available);
      setMenuItems((prev) => prev.map((i) => (i._id === item._id ? updated : i)));
      toast.info(
        updated.available ? 'Dish Restocked' : 'Dish Marked 86',
        `${updated.name} is now ${updated.available ? 'available' : 'unavailable'} for diners`
      );
    } catch (err: any) {
      toast.error('Failed to toggle availability', err.message);
    } finally {
      setTogglingItem(null);
    }
  };

  // Calculate live elapsed timer
  const formatTimer = (dateStr: string) => {
    const elapsedSeconds = Math.max(0, Math.floor((currentTime - new Date(dateStr).getTime()) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  const getElapsedMinutes = (dateStr: string) => {
    return Math.floor((currentTime - new Date(dateStr).getTime()) / 60000);
  };

  // 4 Columns: NEW, ACCEPTED, PREPARING, READY
  const newTickets = orders.filter((o) => o.status === 'PLACED');
  const acceptedTickets = orders.filter((o) => o.status === 'ACCEPTED');
  const preparingTickets = orders.filter((o) => o.status === 'PREPARING');
  const readyTickets = orders.filter((o) => o.status === 'READY');

  return (
    <div className="space-y-5 text-[#211d1a] font-sans selection:bg-[#d96236] selection:text-white">
      {/* 1. KDS Executive Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-[#e9e3dc] shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#d96236] flex items-center justify-center text-white shadow-md shadow-[#d96236]/25 shrink-0">
            <ChefHat className="w-6 h-6" />
          </div>
          <div>
            <div className="text-base font-black text-[#211d1a] flex items-center gap-2">
              <span>Kitchen Display System (KDS)</span>
              <Badge variant="brand" size="sm">
                {selectedStation}
              </Badge>
            </div>
            <p className="text-xs text-[#7b726a] font-mono">
              Service in motion • {orders.length} active tickets across floor
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
                type="button"
                onClick={() => setSelectedStation(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#d96236] text-white shadow-sm'
                    : 'bg-[#fbf9f6] text-[#49423c] hover:bg-[#fff4ef] hover:text-[#d96236] border border-[#e9e3dc]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{st.label}</span>
              </button>
            );
          })}

          {/* Sound Notification Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
              isSoundEnabled
                ? 'bg-[#e8f6ef] text-[#23865b] border-[#a5d8be]'
                : 'bg-[#fbf9f6] text-[#7b726a] border-[#e9e3dc]'
            }`}
            title={isSoundEnabled ? 'Audio Alerts ON' : 'Audio Alerts Muted'}
          >
            {isSoundEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#23865b]" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{isSoundEnabled ? 'Sound ON' : 'Muted'}</span>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIs86ModalOpen(true)}
            className="text-xs border-[#e9e3dc] text-[#c54e4a] hover:bg-[#fde8e8]"
            leftIcon={<Slash className="w-3.5 h-3.5 text-[#c54e4a]" />}
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

      {/* 2. 4-COLUMN KDS BOARD: NEW | ACCEPTED | PREPARING | READY */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* COLUMN 1: NEW */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#bf7a13] px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#bf7a13] animate-ping" />
              <h3 className="text-sm font-black text-[#211d1a] uppercase tracking-wider font-mono">
                1. NEW ORDERS
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#fff8e7] text-[#bf7a13] text-xs font-mono font-black border border-[#fed7aa]">
              {newTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {newTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-[#e9e3dc] text-xs text-[#7b726a]">
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
                    className={`rounded-2xl bg-white border transition-all shadow-sm overflow-hidden ${
                      isUrgent
                        ? 'border-[#c54e4a] ring-2 ring-[#c54e4a]/20'
                        : 'border-[#fed7aa]'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className="p-3.5 bg-[#fff8e7]/60 border-b border-[#fed7aa] flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-black text-[#211d1a] font-mono tracking-tight">
                          TABLE {ticket.tableNumber}
                        </div>
                        <div className="text-[11px] text-[#bf7a13] font-mono font-bold">
                          Round #{ticket.roundNumber} • #{ticket._id.slice(-4).toUpperCase()}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-mono font-bold flex items-center gap-1 justify-end ${
                            isUrgent ? 'text-[#c54e4a] font-black' : 'text-[#49423c]'
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {formatTimer(ticket.createdAt)}
                        </span>
                        <span className="text-[10px] text-[#7b726a] block font-medium">
                          👤 {ticket.placedByMemberName}
                        </span>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="p-4 space-y-3">
                      <div className="divide-y divide-[#e9e3dc]">
                        {ticket.items.map((item, idx) => (
                          <div key={idx} className="py-2 flex items-start justify-between gap-2 text-xs">
                            <div className="space-y-0.5 min-w-0">
                              <div className="text-sm font-black text-[#211d1a]">
                                <span className="text-[#d96236] mr-1.5">{item.quantity}×</span>
                                {item.name}
                              </div>
                              {item.notes ? (
                                <div className="p-1 rounded bg-[#fff8e7] border border-[#fed7aa] text-[11px] text-[#bf7a13] font-medium">
                                  Note: "{item.notes}"
                                </div>
                              ) : null}
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#f5f1ec] text-[#7b726a] shrink-0 font-mono">
                              {item.kitchenStation}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        className="w-full font-bold shadow-sm bg-[#bf7a13] hover:bg-[#a6680d] text-white"
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

        {/* COLUMN 2: ACCEPTED */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#3974b9] px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3974b9]" />
              <h3 className="text-sm font-black text-[#211d1a] uppercase tracking-wider font-mono">
                2. QUEUED
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#eaf2fb] text-[#3974b9] text-xs font-mono font-black border border-[#bfdbfe]">
              {acceptedTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {acceptedTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-[#e9e3dc] text-xs text-[#7b726a]">
                No tickets in accepted queue
              </div>
            ) : (
              acceptedTickets.map((ticket) => (
                <motion.div
                  key={ticket._id}
                  layout
                  className="rounded-2xl bg-white border border-[#bfdbfe] shadow-sm overflow-hidden"
                >
                  <div className="p-3.5 bg-[#eaf2fb]/60 border-b border-[#bfdbfe] flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-[#211d1a] font-mono tracking-tight">
                        TABLE {ticket.tableNumber}
                      </div>
                      <div className="text-[11px] text-[#3974b9] font-mono font-bold">
                        Round #{ticket.roundNumber} • #{ticket._id.slice(-4).toUpperCase()}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#3974b9] flex items-center gap-1 justify-end">
                        <Clock className="w-3.5 h-3.5" />
                        {formatTimer(ticket.acceptedAt || ticket.createdAt)}
                      </span>
                      <span className="text-[10px] text-[#7b726a] block font-medium">
                        👤 {ticket.placedByMemberName}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="divide-y divide-[#e9e3dc]">
                      {ticket.items.map((item, idx) => (
                        <div key={idx} className="py-2 flex items-start justify-between gap-2 text-xs">
                          <div className="space-y-0.5 min-w-0">
                            <div className="text-sm font-black text-[#211d1a]">
                              <span className="text-[#3974b9] mr-1.5">{item.quantity}×</span>
                              {item.name}
                            </div>
                            {item.notes ? (
                              <div className="p-1 rounded bg-[#fff8e7] border border-[#fed7aa] text-[11px] text-[#bf7a13] font-medium">
                                Note: "{item.notes}"
                              </div>
                            ) : null}
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#f5f1ec] text-[#7b726a] shrink-0 font-mono">
                            {item.kitchenStation}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="primary"
                      size="md"
                      className="w-full font-bold shadow-sm bg-[#3974b9] hover:bg-[#2b5990] text-white"
                      onClick={() => handleUpdateOrderStatus(ticket._id, 'PREPARING')}
                      leftIcon={<Play className="w-4 h-4 fill-current" />}
                    >
                      Start Cooking / Prep
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* COLUMN 3: PREPARING */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#d96236] px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d96236] animate-pulse" />
              <h3 className="text-sm font-black text-[#211d1a] uppercase tracking-wider font-mono">
                3. PREPARING
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#fff4ef] text-[#d96236] text-xs font-mono font-black border border-[#ffc9b5]">
              {preparingTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {preparingTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-[#e9e3dc] text-xs text-[#7b726a]">
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
                    className={`rounded-2xl bg-white border transition-all shadow-sm overflow-hidden ${
                      isOverdue
                        ? 'border-[#c54e4a] ring-2 ring-[#c54e4a]/20'
                        : 'border-[#ffc9b5]'
                    }`}
                  >
                    <div className="p-3.5 bg-[#fff4ef]/60 border-b border-[#ffc9b5] flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-black text-[#211d1a] font-mono tracking-tight">
                          TABLE {ticket.tableNumber}
                        </div>
                        <div className="text-[11px] text-[#d96236] font-mono font-bold">
                          Round #{ticket.roundNumber} • #{ticket._id.slice(-4).toUpperCase()}
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-xs font-mono font-bold flex items-center gap-1 justify-end ${
                            isOverdue ? 'text-[#c54e4a] animate-bounce font-black' : 'text-[#d96236]'
                          }`}
                        >
                          <Flame className="w-3.5 h-3.5 fill-current" />
                          {formatTimer(ticket.preparingAt || ticket.createdAt)}
                        </span>
                        <span className="text-[10px] text-[#7b726a] block font-medium">
                          👤 {ticket.placedByMemberName}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="space-y-2">
                        {ticket.items.map((item, idx) => {
                          const isItemReady = item.status === 'READY';
                          return (
                            <div
                              key={idx}
                              onClick={() => handleToggleItemStatus(ticket._id, item)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                                isItemReady
                                  ? 'bg-[#e8f6ef] border-[#a5d8be] text-[#23865b]'
                                  : 'bg-[#fbf9f6] border-[#e9e3dc] text-[#211d1a] hover:border-[#ffc9b5]'
                              }`}
                            >
                              <div className="min-w-0 pr-2">
                                <div
                                  className={`text-xs font-bold ${
                                    isItemReady ? 'line-through opacity-70' : 'text-[#211d1a]'
                                  }`}
                                >
                                  {item.quantity}× {item.name}
                                </div>
                                {item.notes && (
                                  <div className="text-[10px] text-[#bf7a13] italic">
                                    "{item.notes}"
                                  </div>
                                )}
                              </div>

                              <div
                                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border ${
                                  isItemReady
                                    ? 'bg-[#23865b] border-[#23865b] text-white'
                                    : 'border-[#d7cec4] text-[#a89d91]'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        className="w-full font-bold shadow-sm bg-[#23865b] hover:bg-[#1d704c] text-white"
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

        {/* COLUMN 4: READY */}
        <div className="space-y-3 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#23865b] px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#23865b]" />
              <h3 className="text-sm font-black text-[#211d1a] uppercase tracking-wider font-mono">
                4. READY FOR PASS
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-[#e8f6ef] text-[#23865b] text-xs font-mono font-black border border-[#a5d8be]">
              {readyTickets.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {readyTickets.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white border border-dashed border-[#e9e3dc] text-xs text-[#7b726a]">
                No orders waiting on pass
              </div>
            ) : (
              readyTickets.map((ticket) => (
                <motion.div
                  key={ticket._id}
                  layout
                  className="rounded-2xl bg-white border border-[#a5d8be] shadow-sm overflow-hidden"
                >
                  <div className="p-3.5 bg-[#e8f6ef]/60 border-b border-[#a5d8be] flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-black text-[#211d1a] font-mono tracking-tight">
                        TABLE {ticket.tableNumber}
                      </div>
                      <div className="text-[11px] text-[#23865b] font-mono font-bold">
                        Round #{ticket.roundNumber} • #{ticket._id.slice(-4).toUpperCase()}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-[#23865b] flex items-center gap-1 justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Ready
                      </span>
                      <span className="text-[10px] text-[#7b726a] block font-medium">
                        👤 {ticket.placedByMemberName}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div className="text-xs text-[#211d1a] divide-y divide-[#e9e3dc]">
                      {ticket.items.map((i, idx) => (
                        <div key={idx} className="py-1 flex justify-between">
                          <span className="font-bold">
                            {i.quantity}× {i.name}
                          </span>
                          <span className="text-[10px] text-[#7b726a] font-mono">{i.kitchenStation}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-2 rounded-xl bg-[#e8f6ef] border border-[#a5d8be] text-[11px] text-[#23865b] flex items-center gap-1.5 font-medium">
                      <Bell className="w-3.5 h-3.5 animate-bounce" />
                      <span>Waiter floor notification broadcasted</span>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full text-xs font-bold"
                      onClick={() => handleUpdateOrderStatus(ticket._id, 'SERVED')}
                    >
                      Handed to Waiter (Mark Served)
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. 86 (OUT-OF-STOCK) DISH MANAGEMENT MODAL */}
      <Modal
        isOpen={is86ModalOpen}
        onClose={() => setIs86ModalOpen(false)}
        title="Kitchen 86 Control (Out-of-Stock Dishes)"
        size="md"
      >
        <div className="space-y-3">
          <p className="text-xs text-[#7b726a] leading-relaxed">
            Quickly toggle dishes when ingredients deplete. 86'd items will be instantly disabled across
            customer digital menus in real-time via Socket.IO.
          </p>

          <div className="divide-y divide-[#e9e3dc] max-h-80 overflow-y-auto pr-1">
            {menuItems.map((item) => (
              <div key={item._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-[#211d1a] truncate">{item.name}</div>
                  <div className="text-[10px] text-[#7b726a]">
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
