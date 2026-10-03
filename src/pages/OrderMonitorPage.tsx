import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  UtensilsCrossed,
  ChefHat,
  Flame,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Search,
  Filter,
  ArrowRight,
  Check,
  X,
  Volume2,
  VolumeX,
  Bell,
  Eye,
  Radio,
  Coffee,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Input,
  Select,
  EmptyState,
} from '../components/ui';
import { orderService, IOrder } from '../services/orderService';
import { socketService } from '../services/socketService';
import { toast } from '../stores/useToastStore';
import { soundManager } from '../utils/sound';

export const OrderMonitorPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [stationFilter, setStationFilter] = useState<string>('ALL');
  const [tableFilter, setTableFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const fetchOrders = async () => {
    try {
      const data = await orderService.getActiveKitchenOrders(
        stationFilter !== 'ALL' ? stationFilter : undefined
      );
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err: any) {
      console.warn('Failed to fetch active orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const socket = socketService.getSocket();
    socketService.joinKitchen();

    const handleNewOrder = (newOrder: any) => {
      setOrders((prev) => {
        const filtered = prev.filter((o) => o._id !== newOrder._id);
        return [newOrder, ...filtered];
      });
      if (soundEnabled) {
        soundManager.playOrderReceivedChime();
      }
      toast.info(
        `New Order • Table ${newOrder.tableNumber}`,
        `Round #${newOrder.roundNumber || 1} received (${newOrder.items?.length || 1} dishes)`
      );
    };

    const handleOrderUpdate = (updatedOrder: any) => {
      setOrders((prev) => {
        if (updatedOrder.status === 'COMPLETED' || updatedOrder.status === 'CANCELLED') {
          return prev.filter((o) => o._id !== updatedOrder._id);
        }
        return prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o));
      });
    };

    socket.on('NEW_ORDER', handleNewOrder);
    socket.on('ORDER_ACCEPTED', handleOrderUpdate);
    socket.on('ORDER_PREPARING', handleOrderUpdate);
    socket.on('ORDER_READY', handleOrderUpdate);
    socket.on('ORDER_UPDATED', handleOrderUpdate);

    return () => {
      socket.off('NEW_ORDER', handleNewOrder);
      socket.off('ORDER_ACCEPTED', handleOrderUpdate);
      socket.off('ORDER_PREPARING', handleOrderUpdate);
      socket.off('ORDER_READY', handleOrderUpdate);
      socket.off('ORDER_UPDATED', handleOrderUpdate);
    };
  }, [soundEnabled, stationFilter]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: status as any } : o))
      );
      toast.success('Order Updated', `Ticket status transitioned to ${status}`);
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Could not update order status');
    }
  };

  const handleServeOrder = async (orderId: string, tableNumber: string) => {
    try {
      await orderService.serveOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: 'SERVED' } : o))
      );
      toast.success('Dispatched', `Order for Table ${tableNumber} marked as SERVED`);
    } catch (err: any) {
      toast.error('Action Failed', err.message || 'Could not mark order served');
    }
  };

  const getTimeElapsed = (createdAt: string) => {
    const diffMs = new Date().getTime() - new Date(createdAt).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    return `${diffMins} min ago`;
  };

  const isOverdue = (createdAt: string) => {
    const diffMs = new Date().getTime() - new Date(createdAt).getTime();
    return diffMs > 15 * 60000; // Warning if order in prep > 15 mins
  };

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (tableFilter !== 'ALL' && o.tableNumber !== tableFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTable = o.tableNumber?.toLowerCase().includes(q);
      const matchPayer = o.placedByMemberName?.toLowerCase().includes(q);
      const matchDish = o.items?.some((i) => i.name?.toLowerCase().includes(q));
      if (!matchTable && !matchPayer && !matchDish) return false;
    }
    return true;
  });

  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const placedCount = orders.filter((o) => o.status === 'PLACED').length;

  return (
    <div className="space-y-6 text-[#211d1a] font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e9e3dc]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#3974b9] mb-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#23865b] animate-pulse" />
            <span>KITCHEN FLOW • LIVE ORDER MONITOR</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#211d1a] tracking-tight">
            Order Expedite Monitor
          </h1>
          <p className="text-xs text-[#7b726a] mt-1">
            Real-time live queue of active kitchen orders, preparation status, dish routing, and table delivery pacing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
              soundEnabled
                ? 'bg-[#eaf2fb] text-[#3974b9] border-[#bfdbfe]'
                : 'bg-white text-[#7b726a] border-[#e9e3dc]'
            }`}
            title={soundEnabled ? 'Chimes Enabled on New Orders' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Audio Chime ON' : 'Muted'}</span>
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsRefreshing(true);
              fetchOrders();
              toast.info('Refreshed', 'Order queue synced with kitchen server');
            }}
            className="flex items-center gap-1.5 text-xs shadow-2xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/kitchen')}
            className="flex items-center gap-1.5 text-xs shadow-2xs font-bold"
          >
            <span>Kitchen KDS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* KPI Financial Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Active Tickets</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {orders.length}
            </div>
            <span className="text-[10px] text-[#3974b9] font-bold">
              {filteredOrders.length} displayed in filter
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eaf2fb] text-[#3974b9] flex items-center justify-center shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">In Preparation</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {preparingCount}
            </div>
            <span className="text-[10px] text-[#bf7a13] font-bold">
              Active cooking lines
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center shadow-2xs">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Ready on Pass</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {readyCount}
            </div>
            <span className="text-[10px] text-[#23865b] font-bold">
              Awaiting steward delivery
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#e8f6ef] text-[#23865b] flex items-center justify-center shadow-2xs">
            <ChefHat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">New Placed Orders</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {placedCount}
            </div>
            <span className="text-[10px] text-[#be4d27] font-bold">
              Incoming guest rounds
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center shadow-2xs">
            <Bell className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Filter Bar */}
      <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4 shadow-2xs flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex-1 min-w-[220px] relative">
          <Search className="w-4 h-4 text-[#7b726a] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dish name, Table number, or guest name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] placeholder-[#7b726a] focus:outline-none focus:border-[#3974b9] transition-colors"
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

        {/* Status Filter */}
        <div className="w-36">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] focus:outline-none focus:border-[#3974b9] font-medium"
          >
            <option value="ALL">All Status</option>
            <option value="PLACED">PLACED</option>
            <option value="PREPARING">PREPARING</option>
            <option value="READY">READY</option>
            <option value="SERVED">SERVED</option>
          </select>
        </div>

        {/* Station Filter */}
        <div className="w-40">
          <select
            value={stationFilter}
            onChange={(e) => setStationFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] focus:outline-none focus:border-[#3974b9] font-medium"
          >
            <option value="ALL">All Stations</option>
            <option value="MAIN_KITCHEN">Main Kitchen</option>
            <option value="TANDOOR">Tandoor & Grill</option>
            <option value="BEVERAGE">Beverage Bar</option>
            <option value="DESSERT">Dessert Lab</option>
          </select>
        </div>

        {/* Table Filter */}
        <div className="w-32">
          <select
            value={tableFilter}
            onChange={(e) => setTableFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs text-[#211d1a] focus:outline-none focus:border-[#3974b9] font-medium"
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

        {(statusFilter !== 'ALL' || stationFilter !== 'ALL' || tableFilter !== 'ALL' || searchQuery) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('ALL');
              setStationFilter('ALL');
              setTableFilter('ALL');
              setSearchQuery('');
            }}
            className="text-xs text-[#3974b9] hover:bg-[#eaf2fb]"
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Live Order Tickets Grid */}
      {isLoading ? (
        <div className="p-16 text-center text-[#7b726a] text-xs">
          <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin text-[#3974b9]" />
          Connecting to kitchen order stream...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 bg-white border border-[#e9e3dc] rounded-2xl text-center space-y-3 shadow-2xs">
          <div className="w-12 h-12 rounded-2xl bg-[#eaf2fb] text-[#3974b9] mx-auto flex items-center justify-center">
            <UtensilsCrossed className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-[#211d1a]">No active orders in monitor</div>
            <p className="text-xs text-[#7b726a] mt-1 max-w-sm mx-auto">
              All placed customer tickets have been completed and served. New diner orders from table QRs will appear here in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOrders.map((order) => {
            const overdue = isOverdue(order.createdAt);
            const status = order.status;

            return (
              <div
                key={order._id}
                className={`bg-white border rounded-2xl p-5 shadow-2xs flex flex-col justify-between transition-all hover:shadow-sm ${
                  status === 'READY'
                    ? 'border-[#a5d8be] bg-[#e8f6ef]/20'
                    : status === 'PREPARING'
                    ? 'border-[#fed7aa]'
                    : status === 'PLACED'
                    ? 'border-[#bfdbfe]'
                    : 'border-[#e9e3dc]'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Card Header: Table + Time */}
                  <div className="flex items-start justify-between gap-2 border-b border-[#e9e3dc] pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#fff4ef] text-[#be4d27] font-mono font-bold text-xs border border-[#ffc9b5]">
                          Table {order.tableNumber}
                        </span>
                        <span className="text-xs font-mono font-bold text-[#211d1a]">
                          Round #{order.roundNumber || 1}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#7b726a] mt-1">
                        Diner: <strong className="text-[#211d1a]">{order.placedByMemberName || 'Guest'}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase inline-block ${
                          status === 'READY'
                            ? 'bg-[#e8f6ef] text-[#23865b] border border-[#a5d8be]'
                            : status === 'PREPARING'
                            ? 'bg-[#fff8e7] text-[#bf7a13] border border-[#fed7aa]'
                            : status === 'PLACED'
                            ? 'bg-[#eaf2fb] text-[#3974b9] border border-[#bfdbfe]'
                            : 'bg-[#f5f1ec] text-[#7b726a]'
                        }`}
                      >
                        {status}
                      </span>
                      <div
                        className={`text-[10px] font-mono mt-1 ${
                          overdue ? 'text-[#c54e4a] font-bold animate-pulse' : 'text-[#7b726a]'
                        }`}
                      >
                        {getTimeElapsed(order.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Itemized Order Breakdown */}
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {order.items?.map((item, idx) => (
                      <div
                        key={item._id || idx}
                        className="p-2 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-5 h-5 rounded bg-white text-[#211d1a] font-bold text-[10px] border border-[#e9e3dc] flex items-center justify-center shrink-0">
                              {item.quantity}×
                            </span>
                            <span className="font-semibold text-[#211d1a] truncate">{item.name}</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white border border-[#e9e3dc] text-[#7b726a] shrink-0">
                            {item.kitchenStation || 'MAIN'}
                          </span>
                        </div>

                        {item.notes && (
                          <div className="text-[10px] text-[#bf7a13] pl-7 italic">
                            Note: {item.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="pt-3 border-t border-[#e9e3dc] mt-3 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-[#7b726a] font-mono">
                    ID: {order._id.slice(-6)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {status === 'PLACED' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(order._id, 'PREPARING')}
                        className="text-xs py-1 px-2.5 h-auto font-bold"
                      >
                        Accept to Kitchen
                      </Button>
                    )}

                    {status === 'PREPARING' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleUpdateStatus(order._id, 'READY')}
                        className="text-xs py-1 px-2.5 h-auto font-bold bg-[#059669] hover:bg-[#047857] border-[#047857]"
                      >
                        Mark Ready on Pass
                      </Button>
                    )}

                    {status === 'READY' && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleServeOrder(order._id, order.tableNumber)}
                        className="text-xs py-1 px-2.5 h-auto font-bold bg-[#7c3aed] hover:bg-[#6d28d9] border-[#6d28d9]"
                      >
                        Mark Served
                      </Button>
                    )}

                    {status === 'SERVED' && (
                      <Badge variant="success" size="sm" dot>
                        Delivered
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrderMonitorPage;
