import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Plus,
  RefreshCw,
  Printer,
  Download,
  Users,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Power,
  RotateCw,
  Clock,
  UtensilsCrossed,
  Receipt,
  Bell,
  CreditCard,
  ChefHat,
  Flame,
  Check,
  Search,
  Filter,
  X,
  Share2,
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Input,
  Select,
  Modal,
  PageHeader,
  EmptyState,
} from '../components/ui';
import { tableService, TableItem, TableStatus } from '../services/tableService';
import { restaurantService, RestaurantProfile } from '../services/restaurantService';
import { socketService } from '../services/socketService';
import { toast } from '../stores/useToastStore';
import { soundManager } from '../utils/sound';

export const FloorPlanPage: React.FC = () => {
  const [tables, setTables] = useState<TableItem[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // View Mode: 'FLOOR_VISUALIZER' (Live Floor View) vs 'TABLE_MANAGEMENT' (QR codes & config)
  const [viewMode, setViewMode] = useState<'FLOOR_VISUALIZER' | 'TABLE_MANAGEMENT'>('FLOOR_VISUALIZER');

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');

  // Selected Table for Full Live Inspector (Phase 11)
  const [inspectingTableId, setInspectingTableId] = useState<string | null>(null);
  const [tableLiveDetails, setTableLiveDetails] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [inspectTab, setInspectTab] = useState<'members' | 'orders' | 'bill' | 'requests' | 'payment' | 'timeline'>('orders');

  // Real-time animation pulse triggers for specific table IDs
  const [animatedTableId, setAnimatedTableId] = useState<{ id: string; type: 'order' | 'ready' | 'paid' | 'avail' } | null>(null);

  // Table Management Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<TableItem | null>(null);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);

  // Form states
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState<number>(4);
  const [section, setSection] = useState('Main Dining Hall');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Load all tables and restaurant profile
  const loadTablesAndProfile = async () => {
    setIsLoading(true);
    try {
      const [tableData, restData] = await Promise.all([
        tableService.getAllTables(),
        restaurantService.getProfile(),
      ]);
      setTables(tableData);
      setRestaurant(restData);
    } catch (err: any) {
      toast.error('Failed to load floor tables', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTablesAndProfile();

    // Join Dashboard Socket Room for Live Floor Updates
    socketService.joinDashboard();
    const socket = socketService.getSocket();

    // 1. Table state updated
    socket.on('TABLE_UPDATED', (updatedTable: TableItem) => {
      setTables((prev) => prev.map((t) => (t._id === updatedTable._id ? updatedTable : t)));

      if (updatedTable.status === 'AVAILABLE') {
        triggerTableAnimation(updatedTable._id, 'avail');
      }
    });

    // 2. New order placed at a table
    socket.on('NEW_ORDER', (order: any) => {
      if (order.table) {
        triggerTableAnimation(order.table, 'order');
      }
      loadTablesAndProfile();
    });

    // 3. Food ready on kitchen pass
    socket.on('ORDER_READY', (data: any) => {
      const matchedTable = tables.find((t) => t.tableNumber === data.tableNumber);
      if (matchedTable) {
        triggerTableAnimation(matchedTable._id, 'ready');
      }
    });

    // 4. Payment completed
    socket.on('PAYMENT_COMPLETED', (data: any) => {
      loadTablesAndProfile();
    });

    return () => {
      socket.off('TABLE_UPDATED');
      socket.off('NEW_ORDER');
      socket.off('ORDER_READY');
      socket.off('PAYMENT_COMPLETED');
    };
  }, []);

  // Trigger subtle visual pulse on a table card
  const triggerTableAnimation = (tableId: string, type: 'order' | 'ready' | 'paid' | 'avail') => {
    setAnimatedTableId({ id: tableId, type });
    setTimeout(() => setAnimatedTableId(null), 3000);
  };

  // Inspect Table Details (Phase 11 Click Table to View)
  const handleInspectTable = async (table: TableItem) => {
    setInspectingTableId(table._id);
    setIsLoadingDetails(true);
    setInspectTab('orders');

    try {
      const details = await tableService.getTableLiveDetails(table._id);
      setTableLiveDetails(details);
    } catch (err: any) {
      toast.error('Failed to load table details', err.message);
      setInspectingTableId(null);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle Save Table (Add or Edit)
  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;

    setIsSubmitting(true);
    try {
      if (editingTable) {
        const updated = await tableService.updateTable(editingTable._id, {
          tableNumber: tableNumber.trim(),
          capacity: Number(capacity),
          section,
        });
        setTables((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
        toast.success('Table Updated', `Table ${updated.tableNumber} saved`);
      } else {
        const created = await tableService.createTable({
          tableNumber: tableNumber.trim(),
          capacity: Number(capacity),
          section,
        });
        setTables((prev) => [...prev, created]);
        toast.success('Table Created', `Table ${created.tableNumber} added with unique QR token`);
      }
      setIsAddModalOpen(false);
      setEditingTable(null);
      setTableNumber('');
      setCapacity(4);
    } catch (err: any) {
      toast.error('Operation Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Status Color & Label Helpers
  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          bg: 'bg-stone-900/80',
          border: 'border-emerald-500/30',
          ring: 'ring-emerald-500/20',
          text: 'text-emerald-400',
          badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50',
          dot: 'bg-emerald-400',
          label: 'AVAILABLE',
        };
      case 'ACTIVE':
      case 'OCCUPIED':
        return {
          bg: 'bg-cyan-950/20',
          border: 'border-cyan-500/50',
          ring: 'ring-cyan-500/30',
          text: 'text-cyan-300',
          badge: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50',
          dot: 'bg-cyan-400 animate-pulse',
          label: 'SEATED / ACTIVE',
        };
      case 'ORDERING':
        return {
          bg: 'bg-blue-950/20',
          border: 'border-blue-500/50',
          ring: 'ring-blue-500/30',
          text: 'text-blue-300',
          badge: 'bg-blue-950/80 text-blue-300 border-blue-700/50',
          dot: 'bg-blue-400 animate-pulse',
          label: 'ORDERING',
        };
      case 'PREPARING':
        return {
          bg: 'bg-amber-950/20',
          border: 'border-amber-500/60',
          ring: 'ring-amber-500/30',
          text: 'text-amber-300',
          badge: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
          dot: 'bg-amber-400 animate-pulse',
          label: 'PREPARING',
        };
      case 'READY':
        return {
          bg: 'bg-emerald-950/40',
          border: 'border-emerald-400 shadow-glow-green',
          ring: 'ring-2 ring-emerald-400',
          text: 'text-emerald-300 font-black',
          badge: 'bg-emerald-500 text-stone-950 font-black border-emerald-400',
          dot: 'bg-emerald-300 animate-ping',
          label: 'FOOD READY',
        };
      case 'SERVING':
        return {
          bg: 'bg-indigo-950/30',
          border: 'border-indigo-500/60',
          ring: 'ring-indigo-500/30',
          text: 'text-indigo-300',
          badge: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
          dot: 'bg-indigo-400',
          label: 'SERVING',
        };
      case 'PAYMENT_PENDING':
      case 'PAYMENT':
        return {
          bg: 'bg-orange-950/30',
          border: 'border-orange-500 shadow-glow-orange',
          ring: 'ring-2 ring-orange-500',
          text: 'text-orange-300 font-black',
          badge: 'bg-orange-500 text-white font-bold border-orange-400',
          dot: 'bg-orange-400 animate-bounce',
          label: 'BILL REQUESTED',
        };
      default:
        return {
          bg: 'bg-stone-900',
          border: 'border-stone-800',
          ring: 'ring-stone-700',
          text: 'text-stone-300',
          badge: 'bg-stone-800 text-stone-300 border-stone-700',
          dot: 'bg-stone-500',
          label: String(status),
        };
    }
  };

  // Section List
  const sections = Array.from(new Set(tables.map((t) => t.section || 'Main Dining Hall')));

  // Filtered Tables
  const filteredTables = tables.filter((t) => {
    if (sectionFilter !== 'ALL' && (t.section || 'Main Dining Hall') !== sectionFilter) return false;
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'AVAILABLE' && t.status !== 'AVAILABLE') return false;
      if (statusFilter === 'OCCUPIED' && t.status === 'AVAILABLE') return false;
      if (statusFilter === 'PREPARING' && t.status !== 'PREPARING') return false;
      if (statusFilter === 'READY' && t.status !== 'READY') return false;
      if (statusFilter === 'PAYMENT' && t.status !== 'PAYMENT' && t.status !== 'PAYMENT_PENDING') return false;
    }
    return true;
  });

  // Overview Counts
  const occupiedCount = tables.filter((t) => t.status !== 'AVAILABLE').length;
  const readyCount = tables.filter((t) => t.status === 'READY').length;
  const preparingCount = tables.filter((t) => t.status === 'PREPARING').length;
  const billCount = tables.filter((t) => t.status === 'PAYMENT' || t.status === 'PAYMENT_PENDING').length;

  return (
    <div className="space-y-6 selection:bg-orange-500 selection:text-white">
      {/* 1. Page Header & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-stone-900/90 border border-stone-800 shadow-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-white font-serif tracking-tight">
              Live Restaurant Floor View
            </h1>
            <Badge variant="brand" size="sm">
              Phase 11
            </Badge>
          </div>
          <p className="text-xs text-stone-400 mt-0.5 font-mono">
            Interactive table layout • Real-time socket sync • Floor occupancy: {occupiedCount}/{tables.length}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-stone-950 rounded-2xl border border-stone-800">
            <button
              onClick={() => setViewMode('FLOOR_VISUALIZER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'FLOOR_VISUALIZER'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-950'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Live Floor</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE_MANAGEMENT')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'TABLE_MANAGEMENT'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-950'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR & Tables</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingTable(null);
              setTableNumber('');
              setCapacity(4);
              setIsAddModalOpen(true);
            }}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            className="text-xs font-bold"
          >
            Add Table
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={loadTablesAndProfile}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            className="text-xs"
          >
            Sync
          </Button>
        </div>
      </div>

      {/* 2. Quick Floor Statistics HUD */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono text-stone-400 uppercase font-bold">Occupied Tables</div>
            <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">
              {occupiedCount} / {tables.length}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/30">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono text-stone-400 uppercase font-bold">Cooking / In Prep</div>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">
              {preparingCount} tables
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Flame className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono text-stone-400 uppercase font-bold">Food Ready on Pass</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">
              {readyCount} tables
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <ChefHat className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-[10px] font-mono text-stone-400 uppercase font-bold">Bill Settlement</div>
            <div className="text-xl font-black text-orange-400 font-mono mt-0.5">
              {billCount} tables
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/30">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. Section and Status Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900/60 border border-stone-800/80">
        {/* Status Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
          {[
            { id: 'ALL', label: 'All Tables' },
            { id: 'AVAILABLE', label: 'Available' },
            { id: 'OCCUPIED', label: 'Active' },
            { id: 'PREPARING', label: 'Preparing' },
            { id: 'READY', label: 'Food Ready' },
            { id: 'PAYMENT', label: 'Bill Pending' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-950'
                  : 'bg-stone-950 text-stone-400 hover:text-white border border-stone-800'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Section Filter */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          <span className="text-stone-400">Section:</span>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="bg-stone-950 border border-stone-800 text-white rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-orange-500"
          >
            <option value="ALL">All Sections</option>
            {sections.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. LIVE INTERACTIVE FLOOR VISUALIZER (PHASE 11 REQUIREMENT) */}
      {/* ============================================================ */}
      {viewMode === 'FLOOR_VISUALIZER' && (
        <div className="space-y-4">
          <div className="p-4 sm:p-6 rounded-3xl bg-stone-950 border border-stone-800/80 shadow-2xl relative overflow-hidden">
            {/* Ambient Floor Grid Backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#292524_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between border-b border-stone-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-stone-200 uppercase tracking-wider font-mono">
                    Floor Map • {sectionFilter === 'ALL' ? 'Full Dining Room' : sectionFilter}
                  </span>
                </div>
                <span className="text-[11px] text-stone-400">Click any table to inspect live session</span>
              </div>

              {/* Modern Table Cards / Circles Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {filteredTables.map((tbl) => {
                  const style = getStatusColor(tbl.status);
                  const isAnimating = animatedTableId?.id === tbl._id;
                  const isInspected = inspectingTableId === tbl._id;
                  const isRoundTable = tbl.capacity <= 4;

                  return (
                    <motion.div
                      key={tbl._id}
                      layout
                      whileHover={{ scale: 1.05, y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleInspectTable(tbl)}
                      className={`relative cursor-pointer transition-all flex flex-col items-center justify-center text-center p-4 ${
                        isRoundTable ? 'rounded-full aspect-square' : 'rounded-3xl aspect-[1.1/1]'
                      } ${style.bg} border-2 ${style.border} ${
                        isInspected ? 'ring-4 ring-orange-500 shadow-glow-orange' : ''
                      } ${
                        isAnimating ? 'ring-4 ring-amber-400 animate-bounce' : ''
                      } shadow-xl hover:shadow-2xl group`}
                    >
                      {/* Radial Seating Dots around Table */}
                      <div className="absolute inset-1 pointer-events-none flex items-center justify-center">
                        <div className="w-full h-full rounded-full border border-dashed border-stone-700/40 opacity-50" />
                      </div>

                      {/* Top Status Indicator Dot */}
                      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 z-10">
                        <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      </div>

                      {/* Center: Table Number in Bold High-Contrast Typography */}
                      <div className="relative z-10 space-y-0.5 mt-2">
                        <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight drop-shadow-md">
                          {tbl.tableNumber}
                        </div>
                        <div className="text-[10px] font-mono text-stone-400 uppercase font-semibold">
                          Cap: {tbl.capacity}
                        </div>
                      </div>

                      {/* Bottom Status Pill */}
                      <div className="relative z-10 mt-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border shadow-sm ${style.badge}`}
                        >
                          {style.label}
                        </span>
                      </div>

                      {/* Active Diners Callout if Seated */}
                      {tbl.status !== 'AVAILABLE' && (
                        <div className="absolute -bottom-2 bg-stone-900 text-stone-300 border border-stone-700 rounded-full px-2 py-0.5 text-[9px] font-mono font-bold shadow flex items-center gap-1">
                          <Users className="w-2.5 h-2.5 text-orange-400" />
                          <span>Seated</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. TABLE MANAGEMENT & QR DOWNLOAD VIEW */}
      {/* ============================================================ */}
      {viewMode === 'TABLE_MANAGEMENT' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTables.map((tbl) => {
              const style = getStatusColor(tbl.status);

              return (
                <Card key={tbl._id} variant="default" className="border-stone-800 shadow-xl overflow-hidden">
                  <CardHeader className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-900/60">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black font-mono text-white">
                        TABLE {tbl.tableNumber}
                      </span>
                      <span className="text-xs text-stone-400 font-mono">({tbl.section})</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${style.badge}`}>
                      {tbl.status}
                    </span>
                  </CardHeader>

                  <CardBody className="p-4 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      {/* QR Thumbnail */}
                      <div
                        onClick={() => setSelectedTableForQr(tbl)}
                        className="w-20 h-20 rounded-2xl bg-white p-1.5 cursor-pointer shadow-lg hover:scale-105 transition-transform shrink-0"
                      >
                        <img
                          src={tbl.qrCode.qrDataUrl}
                          alt={`QR Table ${tbl.tableNumber}`}
                          className="w-full h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 space-y-1 text-xs text-stone-400">
                        <div>
                          Capacity: <strong className="text-white">{tbl.capacity} Seats</strong>
                        </div>
                        <div>
                          Token: <span className="font-mono text-orange-400">{tbl.qrCode.token}</span>
                        </div>
                        <div className="text-[10px] text-stone-500">
                          Gen: {new Date(tbl.qrCode.generatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Management Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedTableForQr(tbl)}
                      >
                        Enlarge QR
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs"
                        leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setEditingTable(tbl);
                          setTableNumber(tbl.tableNumber);
                          setCapacity(tbl.capacity);
                          setSection(tbl.section);
                          setIsAddModalOpen(true);
                        }}
                      >
                        Edit Table
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. TABLE LIVE INSPECTOR MODAL (PHASE 11 CLICK TABLE TO VIEW) */}
      {/* ============================================================ */}
      <Modal
        isOpen={!!inspectingTableId}
        onClose={() => setInspectingTableId(null)}
        title={tableLiveDetails ? `Table ${tableLiveDetails.table.tableNumber} Live Terminal` : 'Loading Table...'}
        size="lg"
      >
        {isLoadingDetails ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-orange-500 mx-auto" />
            <p className="text-xs text-stone-400 font-mono">Fetching real-time dining state...</p>
          </div>
        ) : tableLiveDetails ? (
          <div className="space-y-4">
            {/* Top Table Summary Bar */}
            <div className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-white font-mono">
                    TABLE {tableLiveDetails.table.tableNumber}
                  </span>
                  <Badge variant="brand" size="sm">
                    {tableLiveDetails.table.section}
                  </Badge>
                  <span className="text-xs text-stone-400">Cap: {tableLiveDetails.table.capacity}</span>
                </div>

                <div className="text-xs text-stone-400 mt-0.5">
                  {tableLiveDetails.session ? (
                    <span>
                      Active Session #{tableLiveDetails.session.sessionNumber} • Started{' '}
                      {new Date(tableLiveDetails.session.startedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-bold">Table is currently AVAILABLE</span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-stone-400 block font-mono">Current Bill</span>
                <span className="text-lg font-black text-orange-400 font-mono">
                  ₹{tableLiveDetails.currentBill.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 6 Tabs as specified in Phase 11: members, orders, current bill, requests, payment, timeline */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 bg-stone-950 p-1 rounded-2xl border border-stone-800">
              {[
                { id: 'orders', label: 'Orders', count: tableLiveDetails.orders?.length || 0 },
                { id: 'members', label: 'Members', count: tableLiveDetails.members?.length || 0 },
                { id: 'bill', label: 'Bill', count: null },
                { id: 'requests', label: 'Requests', count: tableLiveDetails.requests?.length || 0 },
                { id: 'payment', label: 'Payment', count: null },
                { id: 'timeline', label: 'Timeline', count: tableLiveDetails.timeline?.length || 0 },
              ].map((tb) => (
                <button
                  key={tb.id}
                  onClick={() => setInspectTab(tb.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1 ${
                    inspectTab === tb.id
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  <span>{tb.label}</span>
                  {tb.count !== null && tb.count > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-stone-800 text-stone-200">
                      {tb.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: ORDERS */}
            {inspectTab === 'orders' && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {tableLiveDetails.orders.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">No orders placed yet.</div>
                ) : (
                  tableLiveDetails.orders.map((ord: any) => (
                    <div key={ord._id} className="p-3 rounded-xl bg-stone-900 border border-stone-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
                        <span className="font-bold text-orange-400 font-mono">ROUND #{ord.roundNumber}</span>
                        <span className="text-stone-400">By: {ord.placedByMemberName}</span>
                        <Badge variant="station" size="sm">
                          {ord.status}
                        </Badge>
                      </div>

                      <div className="divide-y divide-stone-800/80">
                        {ord.items.map((it: any, i: number) => (
                          <div key={i} className="py-1 flex items-center justify-between">
                            <span className="font-bold text-white">
                              {it.quantity}× {it.name}
                            </span>
                            <span className="font-mono text-stone-300">
                              ₹{(it.priceSnapshot * it.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: MEMBERS */}
            {inspectTab === 'members' && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {tableLiveDetails.members.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">No diners seated at this table.</div>
                ) : (
                  tableLiveDetails.members.map((m: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                          {m.displayName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{m.displayName}</div>
                          <div className="text-[10px] text-stone-500 font-mono">ID: {m.temporaryMemberId}</div>
                        </div>
                      </div>

                      <span className="text-[10px] text-stone-400 font-mono">
                        Joined {new Date(m.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: CURRENT BILL */}
            {inspectTab === 'bill' && (
              <div className="space-y-3 text-xs p-4 rounded-2xl bg-stone-900 border border-stone-800">
                <div className="flex justify-between text-stone-400">
                  <span>Subtotal ({tableLiveDetails.currentBill.itemCount} items)</span>
                  <span className="font-mono text-white">₹{tableLiveDetails.currentBill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>GST (5%)</span>
                  <span className="font-mono text-white">₹{tableLiveDetails.currentBill.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-stone-400">
                  <span>Service Charge (5%)</span>
                  <span className="font-mono text-white">₹{tableLiveDetails.currentBill.serviceCharge.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between items-center text-sm font-extrabold text-white">
                  <span>Grand Total:</span>
                  <span className="text-base text-orange-400 font-mono">
                    ₹{tableLiveDetails.currentBill.grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: REQUESTS */}
            {inspectTab === 'requests' && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {tableLiveDetails.requests.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">No service assistance calls.</div>
                ) : (
                  tableLiveDetails.requests.map((r: any) => (
                    <div key={r._id} className="p-3 rounded-xl bg-stone-900 border border-stone-800 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <Bell className="w-3.5 h-3.5 text-amber-400" />
                          <span>{r.requestType}</span>
                        </div>
                        {r.notes && <div className="text-[10px] text-amber-300 italic">"{r.notes}"</div>}
                      </div>

                      <Badge variant={r.status === 'COMPLETED' ? 'success' : 'warning'} size="sm">
                        {r.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB CONTENT: PAYMENT */}
            {inspectTab === 'payment' && (
              <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 text-xs space-y-2">
                {tableLiveDetails.payment ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Payment Completed</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Transaction ID:</span>
                      <span className="font-mono text-white">{tableLiveDetails.payment.transactionId}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Method:</span>
                      <span className="font-mono text-white">{tableLiveDetails.payment.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-stone-400">
                      <span>Amount Settled:</span>
                      <span className="font-mono text-emerald-400 font-bold">
                        ₹{tableLiveDetails.payment.amount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center text-stone-400">
                    No payment settled yet for this active table.
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: TIMELINE */}
            {inspectTab === 'timeline' && (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {tableLiveDetails.timeline.length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500">No events in timeline.</div>
                ) : (
                  <div className="relative border-l border-stone-800 ml-3 space-y-4 py-2">
                    {tableLiveDetails.timeline.map((ev: any, idx: number) => (
                      <div key={idx} className="relative pl-6 text-xs">
                        <div className="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full bg-orange-500 border-2 border-stone-950" />
                        <div className="font-bold text-white">{ev.title}</div>
                        <div className="text-[10px] text-stone-400">{ev.description}</div>
                        <div className="text-[9px] text-stone-500 font-mono">
                          {new Date(ev.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* 7. Enlarged QR Code Modal */}
      <Modal
        isOpen={!!selectedTableForQr}
        onClose={() => setSelectedTableForQr(null)}
        title={selectedTableForQr ? `Table ${selectedTableForQr.tableNumber} QR Code` : 'Table QR'}
        size="sm"
      >
        {selectedTableForQr && (
          <div className="text-center space-y-4">
            <div className="w-56 h-56 mx-auto rounded-2xl bg-white p-3 shadow-xl">
              <img
                src={selectedTableForQr.qrCode.qrDataUrl}
                alt="Table QR"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Table {selectedTableForQr.tableNumber}</h3>
              <p className="text-xs text-stone-400 font-mono">Token: {selectedTableForQr.qrCode.token}</p>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full"
              onClick={() => tableService.downloadQrPng(selectedTableForQr.qrCode.token, selectedTableForQr.tableNumber)}
              leftIcon={<Download className="w-4 h-4" />}
            >
              Download Printable PNG
            </Button>
          </div>
        )}
      </Modal>

      {/* 8. Add / Edit Table Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingTable ? `Edit Table ${editingTable.tableNumber}` : 'Create New Dining Table'}
        size="sm"
      >
        <form onSubmit={handleSaveTable} className="space-y-4">
          <Input
            label="Table Number / Identifier"
            placeholder="e.g. 07, T-12, Rooftop-1"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            required
          />

          <Input
            label="Seating Capacity"
            type="number"
            min={1}
            max={24}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            required
          />

          <Select
            label="Floor Section"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="Main Dining Hall">Main Dining Hall</option>
            <option value="Terrace Garden">Terrace Garden</option>
            <option value="Bar & Lounge">Bar & Lounge</option>
            <option value="Private Dining Suite">Private Dining Suite</option>
          </Select>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold shadow-glow-orange"
            isLoading={isSubmitting}
          >
            {editingTable ? 'Save Table Changes' : 'Generate Table & QR Token'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default FloorPlanPage;
