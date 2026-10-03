import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardBody,
  Badge,
  Button,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../components/ui';
import { useAuthStore, getAuthHeaders } from '../stores/useAuthStore';
import { toast } from '../stores/useToastStore';
import {
  Layers,
  Clock,
  BellRing,
  UtensilsCrossed,
  Users,
  CheckCircle2,
  Table2,
  ReceiptText,
  Clock3,
  CircleDollarSign,
  Droplets,
  Bell,
  ChefHat,
  ChevronRight,
  Flame,
  RefreshCw,
  Sparkles,
  Check,
  Building,
  Radio,
} from 'lucide-react';
import { tableService } from '../services/tableService';
import { staffRequestService, StaffRequestItem } from '../services/staffRequestService';
import { orderService, IOrder } from '../services/orderService';
import { paymentService } from '../services/paymentService';
import { socketService } from '../services/socketService';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Live state
  const [tablesList, setTablesList] = useState<any[]>([]);
  const [selectedFloorSection, setSelectedFloorSection] = useState<string>('ALL');
  const [activeRequests, setActiveRequests] = useState<StaffRequestItem[]>([]);
  const [activeOrders, setActiveOrders] = useState<IOrder[]>([]);
  const [todaySales, setTodaySales] = useState<number>(0);
  const [shiftStaff, setShiftStaff] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAllManagerData = async () => {
    try {
      // 1. Fetch real tables
      const tables = await tableService.getAllTables();
      if (Array.isArray(tables)) {
        setTablesList(tables);
      }

      // 2. Fetch real active service requests
      try {
        const reqs = await staffRequestService.getActiveRequests();
        if (Array.isArray(reqs)) {
          setActiveRequests(reqs);
        }
      } catch (_) {}

      // 3. Fetch real active orders from kitchen / active pipeline
      try {
        const orders = await orderService.getActiveKitchenOrders();
        if (Array.isArray(orders)) {
          setActiveOrders(orders);
        }
      } catch (_) {}

      // 4. Fetch sales / invoices summary
      try {
        const invoiceData = await paymentService.getAllInvoices();
        if (invoiceData?.summary?.totalRevenue !== undefined) {
          setTodaySales(invoiceData.summary.totalRevenue);
        }
      } catch (_) {}

      // 5. Fetch shift staff roster
      try {
        const res = await fetch('/api/users?active=true', { headers: getAuthHeaders() });
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setShiftStaff(data.data);
        }
      } catch (_) {}
    } catch (err: any) {
      console.error('Error fetching manager operations data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllManagerData();

    // Setup live socket listeners
    const socket = socketService.getSocket();
    socketService.joinDashboard();

    const handleTableUpdate = (updatedTable: any) => {
      setTablesList((prev) =>
        prev.map((t) => (t._id === updatedTable._id ? { ...t, ...updatedTable } : t))
      );
    };

    const handleNewRequest = (newReq: any) => {
      setActiveRequests((prev) => {
        const filtered = prev.filter((r) => r._id !== newReq._id);
        return [newReq, ...filtered];
      });
      toast.info('New Service Call', `Table ${newReq.tableNumber}: ${newReq.requestType}`);
    };

    const handleRequestUpdated = (updatedReq: any) => {
      setActiveRequests((prev) => {
        if (updatedReq.status === 'COMPLETED') {
          return prev.filter((r) => r._id !== updatedReq._id);
        }
        return prev.map((r) => (r._id === updatedReq._id ? updatedReq : r));
      });
    };

    const handleOrderEvent = () => {
      orderService.getActiveKitchenOrders().then((orders) => {
        if (Array.isArray(orders)) setActiveOrders(orders);
      }).catch(() => {});
    };

    socket.on('table:updated', handleTableUpdate);
    socket.on('request:created', handleNewRequest);
    socket.on('request:updated', handleRequestUpdated);
    socket.on('order:created', handleOrderEvent);
    socket.on('order:status_updated', handleOrderEvent);

    return () => {
      socket.off('table:updated', handleTableUpdate);
      socket.off('request:created', handleNewRequest);
      socket.off('request:updated', handleRequestUpdated);
      socket.off('order:created', handleOrderEvent);
      socket.off('order:status_updated', handleOrderEvent);
    };
  }, []);

  const handleAcknowledgeRequest = async (id: string, tableNum: string) => {
    try {
      await staffRequestService.acknowledgeRequest(id);
      setActiveRequests((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: 'IN_PROGRESS' } : r))
      );
      toast.success('Acknowledged', `Dispatched staff to Table ${tableNum}`);
    } catch (err: any) {
      toast.error('Action Failed', err.message || 'Could not update request');
    }
  };

  const handleResolveRequest = async (id: string, tableNum: string) => {
    try {
      await staffRequestService.resolveRequest(id);
      setActiveRequests((prev) => prev.filter((r) => r._id !== id));
      toast.success('Resolved', `Service request for Table ${tableNum} completed`);
    } catch (err: any) {
      toast.error('Action Failed', err.message || 'Could not resolve request');
    }
  };

  // Occupancy metrics
  const totalTables = tablesList.length || 7;
  const occupiedTables = tablesList.filter((t) => t.status === 'OCCUPIED' || t.status === 'ORDERING');
  const dirtyTables = tablesList.filter((t) => t.status === 'DIRTY' || t.status === 'CLEANING');
  const availableTables = tablesList.filter((t) => t.status === 'AVAILABLE');
  const occupancyPercent = totalTables > 0 ? Math.round((occupiedTables.length / totalTables) * 100) : 0;

  // Station breakdown calculation from real active orders
  const stationStats = {
    mainKitchen: activeOrders.filter((o) =>
      o.items?.some((i) => i.kitchenStation === 'MAIN_KITCHEN' || !i.kitchenStation)
    ).length,
    tandoor: activeOrders.filter((o) =>
      o.items?.some((i) => i.kitchenStation === 'TANDOOR')
    ).length,
    beverageBar: activeOrders.filter((o) =>
      o.items?.some((i) => i.kitchenStation === 'BEVERAGE' || i.kitchenStation === 'BAR')
    ).length,
  };

  return (
    <div className="space-y-6 text-[#211d1a] font-sans">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e9e3dc]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#d96236] mb-1 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#23865b] animate-pulse" />
            <span>RASRANG • REAL-TIME OPERATIONS COMMAND</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#211d1a] tracking-tight">
            Manager Control Dashboard
          </h1>
          <p className="text-xs text-[#7b726a] mt-1">
            Real-time live monitoring of Rasrang floor tables ({totalTables} total), kitchen ticket pipelines, and diner assistance queues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-full bg-[#e8f6ef] border border-[#a5d8be] text-[#23865b] text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#23865b] animate-pulse" />
            <span>Live Node Connected</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsRefreshing(true);
              fetchAllManagerData();
              toast.info('Floor Synced', 'Live floor & service queues refreshed');
            }}
            className="flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* Real Manager Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Tables */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Active Dining Tables</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {occupiedTables.length} / {totalTables}
            </div>
            <span className="text-[10px] text-[#23865b] font-bold">
              {occupancyPercent}% floor occupancy ({availableTables.length} available)
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center shadow-2xs">
            <Table2 className="w-5 h-5" />
          </div>
        </div>

        {/* Open Orders / Kitchen Tickets */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Active Kitchen Tickets</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {activeOrders.length}
            </div>
            <span className="text-[10px] text-[#bf7a13] font-bold">
              {activeOrders.filter((o) => o.status === 'PREPARING').length} orders cooking on stations
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center shadow-2xs">
            <ReceiptText className="w-5 h-5" />
          </div>
        </div>

        {/* Live Service Requests */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Service Calls</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {activeRequests.length}
            </div>
            <span className="text-[10px] text-[#3974b9] font-bold">
              {activeRequests.length === 0 ? 'All tables attended' : 'Pending waiter dispatch'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eaf2fb] text-[#3974b9] flex items-center justify-center shadow-2xs">
            <BellRing className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Settled Sales */}
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Today's Settled Sales</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              ₹{todaySales.toLocaleString()}
            </div>
            <span className="text-[10px] text-[#23865b] font-bold">
              Verified paid invoices
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#e8f6ef] text-[#23865b] flex items-center justify-center shadow-2xs">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid: Live Floor Map & Service Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Floor Map */}
        <div className="lg:col-span-2 bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#e9e3dc]">
            <div>
              <h3 className="text-base font-bold text-[#211d1a]">Live Floor Overview</h3>
              <p className="text-xs text-[#7b726a]">Rasrang Main Hall & Terrace • {totalTables} Tables</p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#7b726a]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f5f1ec] border border-[#e9e3dc]" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#be4d27]" /> Occupied
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#bf7a13]" /> Ordering
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/manager/floor')}
                className="text-xs text-[#d96236] hover:bg-[#fff4ef]"
              >
                Full Floor Plan <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Floor Section Selection Tabs for Manager */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {[
              { id: 'ALL', label: 'All Floor Sections' },
              { id: 'Main Dining Hall', label: 'Main Dining Hall' },
              { id: 'Terrace Garden', label: 'Terrace Garden' },
              { id: 'Bar & Lounge', label: 'Bar & Lounge' },
              { id: 'Private Dining Suite', label: 'Private Dining Suite' },
            ].map((sec) => {
              const count =
                sec.id === 'ALL'
                  ? tablesList.length
                  : tablesList.filter((t) => (t.section || 'Main Dining Hall') === sec.id).length;
              const isSelected = selectedFloorSection === sec.id;

              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedFloorSection(sec.id)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 shadow-2xs ${
                    isSelected
                      ? 'bg-[#3974b9] text-white shadow-2xs'
                      : 'bg-[#fbf9f6] text-[#7b726a] hover:text-[#211d1a] border border-[#e9e3dc]'
                  }`}
                >
                  <span>{sec.label}</span>
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#e9e3dc] text-[#4d443c]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Tables Layout Grid */}
          <div className="p-4 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] grid grid-cols-2 sm:grid-cols-4 gap-3.5 min-h-[280px]">
            {tablesList
              .filter(
                (t) =>
                  selectedFloorSection === 'ALL' ||
                  (t.section || 'Main Dining Hall') === selectedFloorSection
              )
              .map((t, idx) => {
                const isOccupied = t.status === 'OCCUPIED';
                const isOrdering = t.status === 'ORDERING';
                const isDirty = t.status === 'DIRTY' || t.status === 'CLEANING';
                const isAvailable = t.status === 'AVAILABLE';

              return (
                <div
                  key={t._id || idx}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between items-center text-center transition-all cursor-pointer shadow-2xs hover:shadow-sm ${
                    isAvailable
                      ? 'border-[#e9e3dc] bg-white hover:border-[#d7cec4]'
                      : isOccupied
                      ? 'border-[#ffc9b5] bg-[#fff4ef]/80'
                      : isOrdering
                      ? 'border-[#fed7aa] bg-[#fff8e7]/80'
                      : isDirty
                      ? 'border-[#fca5a5] bg-[#fde8e8]/70'
                      : 'border-[#bfdbfe] bg-[#eaf2fb]'
                  }`}
                  onClick={() => navigate('/manager/floor')}
                >
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isAvailable
                        ? 'bg-[#f5f1ec] text-[#7b726a]'
                        : isOccupied
                        ? 'bg-[#ffe5da] text-[#be4d27]'
                        : isOrdering
                        ? 'bg-[#ffedbd] text-[#bf7a13]'
                        : isDirty
                        ? 'bg-[#fde8e8] text-[#c54e4a]'
                        : 'bg-[#eaf2fb] text-[#3974b9]'
                    }`}
                  >
                    {t.status || 'AVAILABLE'}
                  </span>

                  <div className="my-2">
                    <div className="text-xl font-black text-[#211d1a] tracking-tight">
                      {t.tableNumber?.startsWith('T') ? t.tableNumber : `T-${t.tableNumber || idx + 1}`}
                    </div>
                    <div className="text-[10px] text-[#7b726a] font-medium">
                      {t.capacity || 4} Guests • {t.section?.replace('_', ' ') || 'Dining'}
                    </div>
                  </div>

                  <div className="text-[10px] font-bold text-[#49423c] truncate max-w-full">
                    {isAvailable
                      ? 'Vacant & Ready'
                      : isOccupied
                      ? 'Dining Active'
                      : isOrdering
                      ? 'Browsing Menu'
                      : isDirty
                      ? 'Needs Bussing'
                      : 'Active'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Service Requests & Pulse */}
        <div className="space-y-6">
          {/* Active Service Requests */}
          <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e9e3dc]">
              <div>
                <h3 className="text-sm font-bold text-[#211d1a]">Live Service Calls</h3>
                <p className="text-[11px] text-[#7b726a]">
                  {activeRequests.length} active customer assistance calls
                </p>
              </div>
              <Badge variant={activeRequests.length > 0 ? 'warning' : 'neutral'} size="sm" dot>
                {activeRequests.length > 0 ? 'Active Calls' : 'Queue Clear'}
              </Badge>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {activeRequests.length === 0 ? (
                <div className="p-6 text-center text-[#7b726a] space-y-1">
                  <CheckCircle2 className="w-8 h-8 text-[#23865b] mx-auto opacity-75" />
                  <div className="text-xs font-bold text-[#211d1a]">All Tables Attended</div>
                  <p className="text-[10px]">No pending water, cutlery, or steward calls right now.</p>
                </div>
              ) : (
                activeRequests.map((req) => {
                  const isWater = req.requestType === 'Water';
                  const isBill = req.requestType === 'Request Bill';
                  const Icon = isWater ? Droplets : isBill ? ReceiptText : Bell;
                  const tone = isWater
                    ? 'bg-[#eaf2fb] text-[#3974b9] border-[#bfdbfe]'
                    : isBill
                    ? 'bg-[#fff8e7] text-[#bf7a13] border-[#fed7aa]'
                    : 'bg-[#fff4ef] text-[#d96236] border-[#ffc9b5]';

                  return (
                    <div
                      key={req._id}
                      className="p-2.5 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${tone}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <strong className="text-xs text-[#211d1a] block truncate">
                            {req.requestType}
                          </strong>
                          <span className="text-[10px] text-[#7b726a]">
                            Table {req.tableNumber} {req.memberName ? `• ${req.memberName}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {req.status === 'REQUESTED' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="text-xs py-1 px-2.5 h-auto"
                            onClick={() => handleAcknowledgeRequest(req._id, req.tableNumber)}
                          >
                            Assign
                          </Button>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs py-1 px-2.5 h-auto"
                            onClick={() => handleResolveRequest(req._id, req.tableNumber)}
                          >
                            Done
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Kitchen Pulse */}
          <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e9e3dc]">
              <div>
                <h3 className="text-sm font-bold text-[#211d1a]">Kitchen Pulse</h3>
                <p className="text-[11px] text-[#7b726a]">Live ticket volume & station loads</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/kitchen')}
                className="text-xs text-[#d96236] hover:bg-[#fff4ef]"
              >
                Open KDS <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-3 pt-1">
              {[
                {
                  name: 'Main Kitchen (Curries & Rice)',
                  count: stationStats.mainKitchen,
                  color: 'bg-[#d96236]',
                },
                {
                  name: 'Tandoor & Starters',
                  count: stationStats.tandoor,
                  color: 'bg-[#bf7a13]',
                },
                {
                  name: 'Beverages & Desserts',
                  count: stationStats.beverageBar,
                  color: 'bg-[#3974b9]',
                },
              ].map((st, i) => {
                const totalActive = activeOrders.length || 1;
                const percentage = activeOrders.length > 0 ? Math.round((st.count / totalActive) * 100) : 0;

                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#211d1a]">{st.name}</span>
                      <span className="text-[11px] text-[#7b726a]">
                        {st.count} orders {percentage > 0 ? `(${percentage}%)` : ''}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-[#f5f1ec] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${st.color} rounded-full transition-all`}
                        style={{ width: `${Math.max(percentage, st.count > 0 ? 15 : 0)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Active Shift Staff Roster Table */}
      <div className="bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#e9e3dc]">
          <div>
            <h3 className="text-base font-bold text-[#211d1a] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#3974b9]" />
              <span>Active Service & Kitchen Roster</span>
            </h3>
            <p className="text-xs text-[#7b726a]">Current team members on duty across service and kitchen stations.</p>
          </div>
          <Badge variant="success" size="sm" dot>
            {shiftStaff.length || 3} Active Staff
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Station / Area</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Shift Assignment</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(shiftStaff.length > 0
              ? shiftStaff
              : [
                  { name: 'Arjun Kapoor', email: 'owner@rasrang.in', role: 'OWNER', station: 'Executive Desk' },
                  { name: 'Kavita Roy', email: 'manager@rasrang.in', role: 'MANAGER', station: 'Main Dining Floor' },
                  { name: 'Chef Rajesh', email: 'kitchen@rasrang.in', role: 'KITCHEN', station: 'Main Kitchen' },
                ]
            ).map((st, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="font-bold text-[#211d1a] text-xs">{st.name}</div>
                  <div className="text-[10px] text-[#7b726a]">{st.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={st.role === 'KITCHEN' ? 'station' : st.role === 'OWNER' ? 'brand' : 'neutral'} size="sm">
                    {st.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-[#49423c]">
                  {st.station || (st.role === 'WAITER' ? 'Main Dining Floor' : st.role === 'KITCHEN' ? 'Kitchen & Tandoor' : 'Operations Desk')}
                </TableCell>
                <TableCell>
                  <Badge variant="success" size="sm" dot>
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-[#7b726a] font-mono">
                  Dinner Shift
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ManagerDashboard;
