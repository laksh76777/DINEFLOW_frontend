import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Input,
  Select,
  Modal,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  PageHeader,
  Skeleton,
} from '../components/ui';
import { useAuthStore, getAuthHeaders } from '../stores/useAuthStore';
import { analyticsService, DashboardAnalytics } from '../services/analyticsService';
import { aiService } from '../services/aiService';
import { toast } from '../stores/useToastStore';
import {
  Users,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  Clock,
  Send,
  Bot,
  Layers,
  ArrowUpRight,
  Flame,
  ChefHat,
  RefreshCw,
  Eye,
  ShoppingBag,
  DollarSign,
  AlertTriangle,
  Calendar,
  UtensilsCrossed,
  CheckCircle2,
} from 'lucide-react';
import { Role } from '../types/auth';

interface StaffUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  station?: string;
  active: boolean;
  createdAt: string;
}

// Consistent, curated modern palette for stations
const STATION_COLORS: Record<string, string> = {
  'Main Kitchen': '#f59e0b', // Amber
  Grill: '#ef4444',        // Red
  Beverage: '#0284c7',     // Sky
  Dessert: '#a855f7',      // Purple
};

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'staff'>('analytics');

  // Date Filter (Phase 14)
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d' | 'all'>('all');

  // Analytics State
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Gemini AI Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string>('');
  const [aiTelemetry, setAiTelemetry] = useState<any | null>(null);
  const [isAskingAi, setIsAskingAi] = useState(false);

  // Staff State
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  // Form State for creating new staff
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('MANAGER');
  const [station, setStation] = useState('Main Kitchen');
  const [password, setPassword] = useState('dineflow123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Fetch Analytics with Time Range
  const fetchAnalytics = async (range: 'today' | '7d' | '30d' | 'all' = timeRange) => {
    setIsLoadingAnalytics(true);
    try {
      const data = await analyticsService.getDashboardAnalytics(range);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  // 2. Fetch Staff
  const fetchStaff = async () => {
    setIsLoadingStaff(true);
    try {
      const res = await fetch('/api/users', { headers: getAuthHeaders() });
      const data = await res.json();
      if (data.success) {
        setStaffList(data.data);
      }
    } catch (err: any) {
      toast.error('Failed to load staff list', err.message);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeRange);
    fetchStaff();
  }, []);

  const handleTimeRangeChange = (range: 'today' | '7d' | '30d' | 'all') => {
    setTimeRange(range);
    fetchAnalytics(range);
  };

  // Handle AI Operations Advisor Query (Phase 15)
  const handleAskAdvisor = async (customPrompt?: string) => {
    const question = customPrompt || aiPrompt;
    if (!question.trim()) return;

    setIsAskingAi(true);
    try {
      const res = await aiService.getOperationsAdvice(question, 'yesterday');
      setAiAdvice(res.explanation);
      setAiSource(res.source);
      setAiTelemetry(res.structuredContext);
      toast.success('AI Operations Advisor', 'Telemetry aggregated and explanation generated');
    } catch (err: any) {
      toast.error('AI Operations Advisor Error', err.message);
    } finally {
      setIsAskingAi(false);
    }
  };

  // Create Staff Member
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name,
          email,
          phone,
          role,
          station: role === 'KITCHEN' ? station : undefined,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create staff member');

      toast.success('Staff Member Created', `${name} can now sign in as ${role}`);
      setIsStaffModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('dineflow123');
      fetchStaff();
    } catch (err: any) {
      toast.error('Creation Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Active Status
  const handleToggleActive = async (targetId: string, currentActive: boolean, staffName: string) => {
    try {
      const res = await fetch(`/api/users/${targetId}/active`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ active: !currentActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.info('Status Updated', `${staffName} has been ${!currentActive ? 'activated' : 'deactivated'}`);
      setStaffList((prev) =>
        prev.map((s) => (s._id === targetId ? { ...s, active: !currentActive } : s))
      );
    } catch (err: any) {
      toast.error('Failed to update status', err.message);
    }
  };

  const currency = analytics?.currency || '₹';

  return (
    <div className="space-y-6">
      {/* Top Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          badge={
            <Badge variant="brand" size="sm" dot>
              Owner Console
            </Badge>
          }
          title="Restaurant Executive Intelligence"
          description={`Welcome, ${user?.name || 'Owner'}. Real-time business metrics, customer telemetry, and AI operations.`}
        />

        {/* Tab Toggle */}
        <div className="flex items-center gap-2 p-1 bg-stone-900 border border-stone-800 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-950'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Executive Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'staff'
                ? 'bg-orange-500 text-white shadow-md shadow-orange-950'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff & Roster</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE ANALYTICS (PHASE 14) */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Date Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-stone-900/60 border border-stone-800">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <Calendar className="w-4 h-4 text-orange-400" />
              <span className="font-bold">Reporting Window:</span>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-stone-950 rounded-xl border border-stone-800 text-xs">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: 'Last 7 Days' },
                  { id: '30d', label: 'Last 30 Days' },
                  { id: 'all', label: 'All Time' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTimeRangeChange(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                    timeRange === tab.id
                      ? 'bg-orange-500 text-white shadow-md shadow-orange-950'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                onClick={() => fetchAnalytics(timeRange)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors ml-1"
                title="Refresh Analytics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Animated KPI Counters (Phase 14) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* KPI 1: Settled Revenue */}
            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-3.5 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block">
                  Settled Revenue
                </span>
                <motion.div
                  key={analytics?.metrics.revenue}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-black text-white font-mono flex items-center gap-0.5"
                >
                  <span>{currency}</span>
                  <span>{(analytics?.metrics.revenue ?? 0).toLocaleString()}</span>
                </motion.div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>DineFlow Pay Demo</span>
                </div>
              </CardBody>
            </Card>

            {/* KPI 2: Total Orders */}
            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-3.5 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block">
                  Total Orders
                </span>
                <motion.div
                  key={analytics?.metrics.orders}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-black text-white font-mono"
                >
                  {analytics?.metrics.orders ?? 0}
                </motion.div>
                <div className="text-[10px] text-stone-400">
                  AOV: <span className="text-orange-400 font-mono font-bold">{currency}{analytics?.metrics.averageOrderValue ?? 0}</span>
                </div>
              </CardBody>
            </Card>

            {/* KPI 3: Active Tables */}
            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-3.5 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block">
                  Active Tables
                </span>
                <motion.div
                  key={analytics?.metrics.activeTables}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-xl font-black text-white font-mono"
                >
                  {analytics?.metrics.activeTables ?? 0} / {analytics?.metrics.totalTables ?? 0}
                </motion.div>
                <div className="text-[10px] text-stone-400">
                  {analytics?.metrics.occupancyRate ?? 0}% floor occupancy
                </div>
              </CardBody>
            </Card>

            {/* KPI 4: Avg Dining Duration */}
            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-3.5 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block">
                  Avg Session Time
                </span>
                <div className="text-xl font-black text-white font-mono flex items-center gap-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span>{analytics?.metrics.averageSessionDuration ?? 38}m</span>
                </div>
                <div className="text-[10px] text-stone-400">Seated to payment</div>
              </CardBody>
            </Card>

            {/* KPI 5: Avg Preparation Time */}
            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-3.5 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block">
                  Kitchen Prep Time
                </span>
                <div className="text-xl font-black text-white font-mono flex items-center gap-1">
                  <ChefHat className="w-4 h-4 text-orange-400" />
                  <span>{analytics?.metrics.preparationTime ?? 14}m</span>
                </div>
                <div className="text-[10px] text-emerald-400">Order placed to ready</div>
              </CardBody>
            </Card>

            {/* KPI 6: Item Views Telemetry */}
            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-3.5 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider block">
                  Digital Item Views
                </span>
                <div className="text-xl font-black text-white font-mono flex items-center gap-1">
                  <Eye className="w-4 h-4 text-sky-400" />
                  <span>{analytics?.metrics.totalItemViews ?? 0}</span>
                </div>
                <div className="text-[10px] text-stone-400">Customer telemetry</div>
              </CardBody>
            </Card>
          </div>

          {/* Interactive Recharts Row 1: Sales/Order Trends & Peak Hours */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Hourly Sales & Order Trend (AreaChart) */}
            <Card variant="default" className="lg:col-span-2 border-stone-800">
              <CardHeader className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span>Hourly Dining & Revenue Trend</span>
                  </h3>
                  <p className="text-xs text-stone-400">Sales velocity and order throughput by hour</p>
                </div>
                <Badge variant="brand" size="sm">
                  Rush Hours
                </Badge>
              </CardHeader>

              <CardBody className="p-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        analytics?.peakHours || [
                          { hour: '12 PM', orders: 12, revenue: 4800 },
                          { hour: '1 PM', orders: 28, revenue: 11400 },
                          { hour: '2 PM', orders: 22, revenue: 9200 },
                          { hour: '7 PM', orders: 35, revenue: 15600 },
                          { hour: '8 PM', orders: 48, revenue: 21200 },
                          { hour: '9 PM', orders: 42, revenue: 18900 },
                        ]
                      }
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis dataKey="hour" stroke="#78716c" fontSize={11} tickLine={false} />
                      <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          borderColor: '#44403c',
                          borderRadius: '0.75rem',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (₹)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#revenueGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Chart 2: Kitchen Station Workload (PieChart / Donut) */}
            <Card variant="default" className="border-stone-800">
              <CardHeader className="pb-2 border-b border-stone-800/80">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>Kitchen Station Workload</span>
                </h3>
                <p className="text-xs text-stone-400">Total dishes prepared across stations</p>
              </CardHeader>

              <CardBody className="p-4 space-y-3">
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={
                          analytics?.stationWorkload || [
                            { name: 'Main Kitchen', value: 45 },
                            { name: 'Grill', value: 25 },
                            { name: 'Beverage', value: 20 },
                            { name: 'Dessert', value: 10 },
                          ]
                        }
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {(analytics?.stationWorkload || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATION_COLORS[entry.name] || '#f59e0b'}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          borderColor: '#44403c',
                          borderRadius: '0.5rem',
                          fontSize: '11px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800 text-[11px]">
                  {Object.entries(STATION_COLORS).map(([st, color]) => (
                    <div key={st} className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <span className="text-stone-300 truncate">{st}</span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Interactive Recharts Row 2: Popular Foods & Table Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 3: Popular Foods & Item Views */}
            <Card variant="default" className="border-stone-800">
              <CardHeader className="pb-2 border-b border-stone-800/80">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-emerald-400" />
                  <span>Popular Dishes & Telemetry Views</span>
                </h3>
                <p className="text-xs text-stone-400">Customer favorites vs. digital menu views</p>
              </CardHeader>

              <CardBody className="p-4">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        analytics?.popularFoods || [
                          { name: 'Dal Bukhara Royale', count: 34, revenue: 15300 },
                          { name: 'Smoked Butter Chicken', count: 28, revenue: 14560 },
                          { name: 'Tandoori Truffle Kulcha', count: 22, revenue: 4400 },
                          { name: 'Paneer Tikka Kebab', count: 18, revenue: 7200 },
                          { name: 'Artisan Mango Lassi', count: 15, revenue: 3750 },
                        ]
                      }
                      layout="vertical"
                      margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis type="number" stroke="#78716c" fontSize={10} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#a8a29e"
                        fontSize={10}
                        tickLine={false}
                        width={90}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          borderColor: '#44403c',
                          borderRadius: '0.5rem',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="count" name="Orders Count" fill="#10b981" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Chart 4: Table Usage & Efficiency */}
            <Card variant="default" className="border-stone-800">
              <CardHeader className="pb-2 border-b border-stone-800/80">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>Table Turnover & Usage Frequency</span>
                </h3>
                <p className="text-xs text-stone-400">Total orders and dining sessions per table</p>
              </CardHeader>

              <CardBody className="p-4">
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        analytics?.tableUsage?.slice(0, 8) || [
                          { tableNumber: '01', sessions: 6, orders: 18 },
                          { tableNumber: '02', sessions: 5, orders: 14 },
                          { tableNumber: '03', sessions: 4, orders: 12 },
                          { tableNumber: '04', sessions: 6, orders: 16 },
                          { tableNumber: '05', sessions: 3, orders: 9 },
                          { tableNumber: '06', sessions: 7, orders: 20 },
                        ]
                      }
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis dataKey="tableNumber" stroke="#78716c" fontSize={11} tickLine={false} />
                      <YAxis stroke="#78716c" fontSize={11} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          borderColor: '#44403c',
                          borderRadius: '0.5rem',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="orders" name="Orders" fill="#0284c7" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="sessions" name="Sessions" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Sold-out Frequency Alert Card (Phase 14) */}
          {analytics?.soldOutFrequency && (
            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      Inventory & Sold-Out Frequency ({analytics.soldOutFrequency.count} Items 86'd)
                    </h4>
                    <p className="text-xs text-stone-400">
                      {analytics.soldOutFrequency.count === 0
                        ? 'All dishes are currently available across kitchen stations.'
                        : `Items currently marked sold out: ${analytics.soldOutFrequency.items.map((i) => i.name).join(', ')}`}
                    </p>
                  </div>
                </div>

                <Badge variant={analytics.soldOutFrequency.count > 0 ? 'warning' : 'success'} size="sm">
                  {analytics.soldOutFrequency.count > 0 ? 'Action Recommended' : 'Optimal Inventory'}
                </Badge>
              </CardBody>
            </Card>
          )}

          {/* GEMINI AI OPERATIONS ADVISOR */}
          <Card variant="glass" className="border-orange-500/40 shadow-glow-orange">
            <CardHeader className="p-4 border-b border-stone-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>DineFlow AI Operations Advisor</span>
                    <Badge variant="brand" size="sm">
                      Gemini 1.5 Flash
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-400">
                    Real-time operational consultation, margin optimization, and turnaround analytics
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardBody className="p-4 space-y-4">
              {/* Quick Strategy Prompts */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const q = 'Why was preparation time high yesterday?';
                    setAiPrompt(q);
                    handleAskAdvisor(q);
                  }}
                  className="text-xs px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/60 text-orange-300 hover:bg-orange-500/30 hover:text-white transition-all flex items-center gap-1.5 font-semibold shadow-xs"
                >
                  <Clock className="w-3.5 h-3.5 text-orange-400" />
                  <span>"Why was preparation time high yesterday?"</span>
                </button>

                {[
                  'Analyze station bottlenecks during dinner rush',
                  'Recommend kitchen mise-en-place pacing',
                  'Suggest high-margin appetizer pairings',
                  'How to increase dessert attachment rate?',
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setAiPrompt(promptText);
                      handleAskAdvisor(promptText);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:border-orange-500/50 hover:text-white transition-all flex items-center gap-1.5"
                  >
                    <Flame className="w-3 h-3 text-stone-400" />
                    <span>{promptText}</span>
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask DineFlow AI for culinary operations advice (e.g. 'Why was prep time high yesterday?')..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor()}
                  className="bg-stone-900/90 text-xs sm:text-sm"
                />
                <Button
                  variant="primary"
                  onClick={() => handleAskAdvisor()}
                  isLoading={isAskingAi}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                  className="font-bold shrink-0"
                >
                  Consult AI
                </Button>
              </div>

              {/* Structured Telemetry Metrics Panel */}
              {aiTelemetry && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-stone-950 border border-stone-800/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs border-b border-stone-800/80 pb-2">
                    <span className="font-bold text-stone-300 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-orange-400" />
                      Aggregated Restaurant Telemetry Context ({aiTelemetry.timeframe})
                    </span>
                    <Badge variant="brand" size="sm">
                      Strictly Read-Only Data
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Orders Analyzed</div>
                      <div className="text-base font-bold text-white mt-0.5">{aiTelemetry.totalOrders} tickets</div>
                    </div>

                    <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Actual vs Target SLA</div>
                      <div className="text-base font-bold text-rose-400 mt-0.5">
                        {aiTelemetry.avgPrepTimeMinutes}m <span className="text-[11px] text-stone-400 font-normal">/ {aiTelemetry.targetPrepTimeMinutes}m</span>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Peak Rush Window</div>
                      <div className="text-xs font-bold text-amber-400 mt-1 truncate">{aiTelemetry.peakHourWindow}</div>
                    </div>

                    <div className="p-2 rounded-lg bg-stone-900/80 border border-stone-800">
                      <div className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Custom Modifiers</div>
                      <div className="text-base font-bold text-sky-400 mt-0.5">{aiTelemetry.customNotesTicketsCount} tickets</div>
                    </div>
                  </div>

                  {aiTelemetry.slowestDishes && aiTelemetry.slowestDishes.length > 0 && (
                    <div className="text-[11px] text-stone-400 pt-1 flex flex-wrap gap-2 items-center">
                      <span className="font-semibold text-stone-300">Longest Prep Dishes:</span>
                      {aiTelemetry.slowestDishes.map((dish: any, idx: number) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-stone-200">
                          {dish.name} (~{dish.avgTimeMinutes}m)
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* AI Advice Response Card */}
              {aiAdvice && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-stone-900/90 border border-orange-500/30 text-xs text-stone-200 leading-relaxed space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2 text-[10px] text-stone-400 font-mono">
                    <span className="flex items-center gap-1 text-orange-400 font-bold">
                      <Bot className="w-3.5 h-3.5" />
                      DineFlow AI Operations Assistant ({aiSource})
                    </span>
                    <span className="text-stone-400">🔒 AI Cannot Modify Restaurant Data</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-stone-200">
                    {aiAdvice}
                  </div>
                </motion.div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 2: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Staff Roster & Authorizations</h3>
              <p className="text-xs text-stone-400">Manage credentials and kitchen station allocations</p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => setIsStaffModalOpen(true)}
              leftIcon={<UserPlus className="w-4 h-4" />}
              className="font-bold"
            >
              Add Staff Member
            </Button>
          </div>

          <Card variant="glass" className="border-stone-800 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Station / Floor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {isLoadingStaff ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Skeleton className="h-6 w-48 mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : staffList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-stone-400">
                      No staff members registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((st) => (
                    <TableRow key={st._id}>
                      <TableCell>
                        <div className="font-bold text-white text-xs">{st.name}</div>
                        <div className="text-[10px] text-stone-400">{st.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            st.role === 'OWNER'
                              ? 'brand'
                              : st.role === 'MANAGER'
                              ? 'brand'
                              : st.role === 'KITCHEN'
                              ? 'warning'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {st.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-stone-300 font-mono">
                          {st.role === 'KITCHEN' ? st.station || 'Main Kitchen' : 'Dining Floor'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={st.active ? 'success' : 'neutral'} size="sm" dot>
                          {st.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {st.role !== 'OWNER' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] py-1 px-2.5 h-auto"
                            onClick={() => handleToggleActive(st._id, st.active, st.name)}
                          >
                            {st.active ? 'Deactivate' : 'Activate'}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Add Restaurant Employee"
        size="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">Full Name</label>
            <Input
              placeholder="e.g. Vikram Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">Email Address</label>
            <Input
              type="email"
              placeholder="vikram@dineflow.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-300">System Role</label>
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="MANAGER">Floor Manager</option>
                <option value="WAITER">Service Waiter</option>
                <option value="KITCHEN">Line Chef</option>
              </Select>
            </div>

            {role === 'KITCHEN' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300">Station</label>
                <Select
                  value={station}
                  onChange={(e) => setStation(e.target.value)}
                >
                  <option value="Main Kitchen">Main Kitchen</option>
                  <option value="Grill">Grill</option>
                  <option value="Beverage">Beverage</option>
                  <option value="Dessert">Dessert</option>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-300">Temporary Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-stone-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsStaffModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="font-bold"
            >
              Create Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
