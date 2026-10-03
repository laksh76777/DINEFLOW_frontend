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
  Table2,
  CircleDollarSign,
  ReceiptText,
  Check,
  MoreHorizontal,
  ChevronDown,
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

const STATION_COLORS: Record<string, string> = {
  'Main Kitchen': '#d96236', // Terracotta
  Grill: '#c54e4a',        // Red
  Beverage: '#3974b9',     // Sky
  Dessert: '#d89a20',      // Amber
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
    <div className="space-y-6 text-[#211d1a] font-sans">
      {/* Top Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e9e3dc]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#d96236] mb-1">
            EXECUTIVE INTELLIGENCE • LIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#211d1a] tracking-tight">
            Good afternoon, {user?.name || 'Arjun'}
          </h1>
          <p className="text-xs text-[#7b726a] mt-1">
            Here's how Rasrang is performing across service stations today.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#e9e3dc] rounded-xl shrink-0 shadow-2xs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-[#d96236] text-white shadow-sm'
                : 'text-[#7b726a] hover:text-[#211d1a]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Executive Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-[#d96236] text-white shadow-sm'
                : 'text-[#7b726a] hover:text-[#211d1a]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Staff & Roster</span>
          </button>
        </div>
      </div>

      {/* TAB 1: EXECUTIVE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Date Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-[#e9e3dc] shadow-2xs">
            <div className="flex items-center gap-2 text-xs text-[#49423c]">
              <Calendar className="w-4 h-4 text-[#d96236]" />
              <span className="font-bold">Reporting Window:</span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-[#fbf9f6] rounded-xl border border-[#e9e3dc] text-xs">
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
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    timeRange === tab.id
                      ? 'bg-white text-[#d96236] shadow-sm border border-[#ffc9b5]'
                      : 'text-[#7b726a] hover:text-[#211d1a]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}

              <button
                onClick={() => fetchAnalytics(timeRange)}
                className="p-1.5 rounded-lg text-[#7b726a] hover:text-[#211d1a] hover:bg-white transition-colors ml-1 cursor-pointer"
                title="Refresh Analytics"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAnalytics ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Figma-Style KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Settled Revenue */}
            <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs relative">
              <div className="w-10 h-10 rounded-xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center float-right shadow-2xs">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#7b726a]">Today's Revenue</div>
              <div className="text-2xl font-black text-[#211d1a] tracking-tight my-2">
                {currency}{(analytics?.metrics?.revenue ?? 48250).toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#7b726a]">
                <span className="text-[#23865b] font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +12.8%
                </span>
                <span>vs last week</span>
              </div>
            </div>

            {/* KPI 2: Total Orders */}
            <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs relative">
              <div className="w-10 h-10 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center float-right shadow-2xs">
                <ReceiptText className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#7b726a]">Total Orders</div>
              <div className="text-2xl font-black text-[#211d1a] tracking-tight my-2">
                {analytics?.metrics?.orders ?? 126}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#7b726a]">
                <span className="text-[#23865b] font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> +8.2%
                </span>
                <span>vs last week</span>
              </div>
            </div>

            {/* KPI 3: Active Tables */}
            <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs relative">
              <div className="w-10 h-10 rounded-xl bg-[#eaf2fb] text-[#3974b9] flex items-center justify-center float-right shadow-2xs">
                <Table2 className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#7b726a]">Active Tables</div>
              <div className="text-2xl font-black text-[#211d1a] tracking-tight my-2">
                {analytics?.metrics?.activeTables ?? 18} / {analytics?.metrics?.totalTables ?? 24}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#7b726a]">
                <span className="text-[#23865b] font-bold">
                  {analytics?.metrics?.occupancyRate ?? 75}% occupancy
                </span>
                <span>floor rate</span>
              </div>
            </div>

            {/* KPI 4: Kitchen Prep Velocity */}
            <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs relative">
              <div className="w-10 h-10 rounded-xl bg-[#e8f6ef] text-[#23865b] flex items-center justify-center float-right shadow-2xs">
                <Check className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-[#7b726a]">Kitchen SLA Pacing</div>
              <div className="text-2xl font-black text-[#211d1a] tracking-tight my-2">
                {analytics?.metrics?.preparationTime ?? 14}m avg
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#7b726a]">
                <span className="text-[#23865b] font-bold flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" /> 2m faster
                </span>
                <span>than target SLA</span>
              </div>
            </div>
          </div>

          {/* Interactive Charts Row: Revenue Velocity & Station Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Hourly Sales & Order Trend (AreaChart) */}
            <div className="lg:col-span-2 bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-4 border-b border-[#e9e3dc]">
                <div>
                  <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#d96236]" />
                    <span>Revenue Velocity & Order Throughput</span>
                  </h3>
                  <p className="text-xs text-[#7b726a]">Hourly revenue performance across dinner shift</p>
                </div>
                <Badge variant="brand" size="sm">
                  Peak Hours
                </Badge>
              </div>

              <div className="h-64 w-full pt-4">
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
                        <stop offset="5%" stopColor="#d96236" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#d96236" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9e3dc" vertical={false} />
                    <XAxis dataKey="hour" stroke="#7b726a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#7b726a" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e9e3dc',
                        borderRadius: '12px',
                        boxShadow: '0 8px 28px rgba(43,31,24,0.08)',
                        fontSize: '12px',
                        color: '#211d1a',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name="Revenue (₹)"
                      stroke="#d96236"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#revenueGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Kitchen Station Workload */}
            <div className="bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs">
              <div className="pb-4 border-b border-[#e9e3dc]">
                <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-[#bf7a13]" />
                  <span>Kitchen Station Workload</span>
                </h3>
                <p className="text-xs text-[#7b726a]">Dishes distributed across preparation lines</p>
              </div>

              <div className="h-48 w-full pt-4">
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
                          fill={STATION_COLORS[entry.name] || '#d96236'}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e9e3dc',
                        borderRadius: '10px',
                        fontSize: '11px',
                        boxShadow: '0 8px 28px rgba(43,31,24,0.08)',
                        color: '#211d1a',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#e9e3dc] text-[11px]">
                {Object.entries(STATION_COLORS).map(([st, color]) => (
                  <div key={st} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[#49423c] truncate font-medium">{st}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Row 2: Popular Dishes & Table Turnover */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 3: Popular Dishes */}
            <div className="bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs">
              <div className="pb-4 border-b border-[#e9e3dc]">
                <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 text-[#23865b]" />
                  <span>Popular Dishes & Telemetry Views</span>
                </h3>
                <p className="text-xs text-[#7b726a]">Top ranked menu items by sales count</p>
              </div>

              <div className="h-56 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      analytics?.popularFoods || [
                        { name: 'Butter Chicken', count: 34, revenue: 15300 },
                        { name: 'Paneer Tikka', count: 28, revenue: 14560 },
                        { name: 'Awadhi Biryani', count: 22, revenue: 4400 },
                        { name: 'Masala Dosa', count: 18, revenue: 7200 },
                        { name: 'Dal Makhani', count: 15, revenue: 3750 },
                      ]
                    }
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9e3dc" horizontal={false} />
                    <XAxis type="number" stroke="#7b726a" fontSize={10} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke="#49423c"
                      fontSize={10}
                      tickLine={false}
                      width={90}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e9e3dc',
                        borderRadius: '10px',
                        fontSize: '11px',
                        color: '#211d1a',
                        boxShadow: '0 8px 28px rgba(43,31,24,0.08)',
                      }}
                    />
                    <Bar dataKey="count" name="Orders Count" fill="#23865b" radius={[0, 6, 6, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 4: Table Turnover */}
            <div className="bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs">
              <div className="pb-4 border-b border-[#e9e3dc]">
                <h3 className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                  <Table2 className="w-4 h-4 text-[#3974b9]" />
                  <span>Table Turnover & Activity</span>
                </h3>
                <p className="text-xs text-[#7b726a]">Orders and guest sessions fulfilled per table</p>
              </div>

              <div className="h-56 w-full pt-4">
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e9e3dc" vertical={false} />
                    <XAxis dataKey="tableNumber" stroke="#7b726a" fontSize={11} tickLine={false} />
                    <YAxis stroke="#7b726a" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e9e3dc',
                        borderRadius: '10px',
                        fontSize: '11px',
                        color: '#211d1a',
                        boxShadow: '0 8px 28px rgba(43,31,24,0.08)',
                      }}
                    />
                    <Bar dataKey="orders" name="Orders" fill="#d96236" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="sessions" name="Sessions" fill="#d89a20" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* GEMINI AI OPERATIONS ADVISOR */}
          <div className="bg-white border border-[#ffc9b5] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-[#e9e3dc]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#fff4ef] border border-[#ffc9b5] text-[#d96236] flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#211d1a] flex items-center gap-2">
                    <span>DineSetu AI Operations Advisor</span>
                    <Badge variant="brand" size="sm">
                      Gemini 1.5 Flash
                    </Badge>
                  </div>
                  <p className="text-xs text-[#7b726a]">
                    Real-time operational consultation, turnaround velocity, and bottleneck root-cause analysis
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              {/* Quick Strategy Prompts */}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const q = 'Why was preparation time high yesterday?';
                    setAiPrompt(q);
                    handleAskAdvisor(q);
                  }}
                  className="text-xs px-3.5 py-1.5 rounded-full bg-[#fff4ef] border border-[#ffc9b5] text-[#be4d27] hover:bg-[#ffe5da] transition-all flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-[#d96236]" />
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
                    type="button"
                    onClick={() => {
                      setAiPrompt(promptText);
                      handleAskAdvisor(promptText);
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-[#fbf9f6] border border-[#e9e3dc] text-[#49423c] hover:border-[#ffc9b5] hover:text-[#d96236] transition-all flex items-center gap-1.5 font-medium cursor-pointer"
                  >
                    <Flame className="w-3 h-3 text-[#7b726a]" />
                    <span>{promptText}</span>
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask DineSetu AI for culinary operations advice (e.g. 'Why was prep time high yesterday?')..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAdvisor()}
                  className="text-xs sm:text-sm"
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

              {/* Structured Telemetry Context Panel */}
              {aiTelemetry && (
                <div className="p-4 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] space-y-3">
                  <div className="flex items-center justify-between text-xs border-b border-[#e9e3dc] pb-2">
                    <span className="font-bold text-[#211d1a] flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#d96236]" />
                      Aggregated Restaurant Telemetry Context ({aiTelemetry.timeframe})
                    </span>
                    <Badge variant="brand" size="sm">
                      Read-Only Context
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-[#e9e3dc]">
                      <div className="text-[10px] text-[#7b726a] uppercase tracking-wider font-semibold">Orders Analyzed</div>
                      <div className="text-base font-bold text-[#211d1a] mt-0.5">{aiTelemetry.totalOrders} tickets</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-[#e9e3dc]">
                      <div className="text-[10px] text-[#7b726a] uppercase tracking-wider font-semibold">Actual vs Target SLA</div>
                      <div className="text-base font-bold text-[#c54e4a] mt-0.5">
                        {aiTelemetry.avgPrepTimeMinutes}m <span className="text-[11px] text-[#7b726a] font-normal">/ {aiTelemetry.targetPrepTimeMinutes}m</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-[#e9e3dc]">
                      <div className="text-[10px] text-[#7b726a] uppercase tracking-wider font-semibold">Peak Rush Window</div>
                      <div className="text-xs font-bold text-[#bf7a13] mt-1 truncate">{aiTelemetry.peakHourWindow}</div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-[#e9e3dc]">
                      <div className="text-[10px] text-[#7b726a] uppercase tracking-wider font-semibold">Custom Modifiers</div>
                      <div className="text-base font-bold text-[#3974b9] mt-0.5">{aiTelemetry.customNotesTicketsCount} tickets</div>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Advice Response Card */}
              {aiAdvice && (
                <div className="p-4 rounded-xl bg-white border border-[#ffc9b5] text-xs text-[#211d1a] leading-relaxed space-y-3 shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#e9e3dc] pb-2 text-[10px] text-[#7b726a] font-mono">
                    <span className="flex items-center gap-1 text-[#d96236] font-bold">
                      <Bot className="w-3.5 h-3.5" />
                      DineSetu AI Operations Assistant ({aiSource})
                    </span>
                    <span className="text-[#7b726a]">🔒 AI Cannot Modify Restaurant Data</span>
                  </div>
                  <div className="whitespace-pre-line leading-relaxed text-[#211d1a]">
                    {aiAdvice}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div>
              <h3 className="text-base font-bold text-[#211d1a]">Staff Roster & Authorizations</h3>
              <p className="text-xs text-[#7b726a]">Manage credentials and kitchen station allocations</p>
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

          <div className="bg-white border border-[#e9e3dc] rounded-2xl overflow-hidden shadow-2xs">
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
                    <TableCell colSpan={5} className="text-center py-8 text-[#7b726a]">
                      No staff members registered.
                    </TableCell>
                  </TableRow>
                ) : (
                  staffList.map((st) => (
                    <TableRow key={st._id}>
                      <TableCell>
                        <div className="font-bold text-[#211d1a] text-xs">{st.name}</div>
                        <div className="text-[10px] text-[#7b726a]">{st.email}</div>
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
                        <span className="text-xs text-[#49423c] font-mono">
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
          </div>
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
          <Input
            label="Full Name"
            placeholder="e.g. Vikram Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="vikram@dineflow.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="System Role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="MANAGER">Floor Manager</option>
              <option value="WAITER">Service Waiter</option>
              <option value="KITCHEN">Line Chef</option>
            </Select>

            {role === 'KITCHEN' && (
              <Select
                label="Kitchen Station"
                value={station}
                onChange={(e) => setStation(e.target.value)}
              >
                <option value="Main Kitchen">Main Kitchen</option>
                <option value="Grill">Grill</option>
                <option value="Beverage">Beverage</option>
                <option value="Dessert">Dessert</option>
              </Select>
            )}
          </div>

          <Input
            label="Temporary Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[#e9e3dc]">
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
