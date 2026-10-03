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
  PageHeader,
  Skeleton,
} from '../components/ui';
import { useAuthStore, getAuthHeaders } from '../stores/useAuthStore';
import { analyticsService, DashboardAnalytics } from '../services/analyticsService';
import { toast } from '../stores/useToastStore';
import {
  Users,
  UserPlus,
  ShieldCheck,
  TrendingUp,
  Store,
  QrCode,
  UtensilsCrossed,
  Check,
  X,
  Sparkles,
  Phone,
  Mail,
  Lock,
  DollarSign,
  Clock,
  Send,
  Bot,
  Layers,
  ArrowUpRight,
  Flame,
  ChefHat,
  RefreshCw,
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
  'Main Kitchen': '#f97316',
  Grill: '#ef4444',
  Beverage: '#06b6d4',
  Dessert: '#a855f7',
};

export const OwnerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'analytics' | 'staff'>('analytics');

  // Analytics State
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  // Gemini AI Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string>('');
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

  // 1. Fetch Analytics
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true);
    try {
      const data = await analyticsService.getDashboardAnalytics();
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
    fetchAnalytics();
    fetchStaff();
  }, []);

  // Handle AI Advisor Query
  const handleAskAdvisor = async (customPrompt?: string) => {
    const question = customPrompt || aiPrompt;
    if (!question.trim()) return;

    setIsAskingAi(true);
    try {
      const res = await analyticsService.askAiAdvisor(question);
      setAiAdvice(res.advice);
      setAiSource(res.source);
      toast.success('AI Advisor Generated Insights');
    } catch (err: any) {
      toast.error('AI Advisor Error', err.message);
    } finally {
      setIsAskingAi(false);
    }
  };

  // Handle Staff Creation
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Validation Error', 'Name and email are required');
      return;
    }

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

      toast.success('Staff Created!', `${name} added as ${role}`);
      setIsStaffModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      fetchStaff();
    } catch (err: any) {
      toast.error('Staff Creation Failed', err.message);
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

  const currency = analytics?.metrics.currency || '₹';

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
          title="Restaurant Executive Overview"
          description={`Welcome, ${user?.name || 'Owner'}. Real-time business intelligence, floor operations, and AI advisor.`}
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
            <span>Executive Analytics & AI</span>
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

      {/* TAB 1: EXECUTIVE ANALYTICS & GEMINI AI ADVISOR */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-4 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider">
                  Settled Revenue
                </span>
                <div className="text-2xl font-black text-white font-mono flex items-center gap-1">
                  <span>{currency}</span>
                  <span>{analytics?.metrics.totalRevenue.toLocaleString() || '18,450'}</span>
                </div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Verified via DineFlow Pay</span>
                </div>
              </CardBody>
            </Card>

            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-4 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider">
                  Floor Occupancy
                </span>
                <div className="text-2xl font-black text-white font-mono">
                  {analytics?.metrics.occupancyRate ?? 67}%
                </div>
                <div className="text-[11px] text-stone-400">
                  {analytics?.metrics.occupiedTables ?? 6} of {analytics?.metrics.totalTables ?? 9} tables active
                </div>
              </CardBody>
            </Card>

            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-4 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider">
                  Average Dining Time
                </span>
                <div className="text-2xl font-black text-white font-mono flex items-center gap-1">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <span>{analytics?.metrics.avgDiningMinutes ?? 38}m</span>
                </div>
                <div className="text-[11px] text-stone-400">Seated to bill settled</div>
              </CardBody>
            </Card>

            <Card variant="glass" className="border-stone-800">
              <CardBody className="p-4 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-mono tracking-wider">
                  Average Ticket Size
                </span>
                <div className="text-2xl font-black text-white font-mono">
                  {currency}
                  {analytics?.metrics.avgTicket ?? 920}
                </div>
                <div className="text-[11px] text-stone-400">Per settled dining party</div>
              </CardBody>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Hourly Order Volume Area Chart */}
            <Card variant="default" className="lg:col-span-2 border-stone-800">
              <CardHeader className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-orange-400" />
                    <span>Hourly Order Volume & Sales Trend</span>
                  </h3>
                  <p className="text-xs text-stone-400">Peak dining hours & throughput distribution</p>
                </div>
                <Badge variant="brand" size="sm">
                  Dinner Rush
                </Badge>
              </CardHeader>

              <CardBody className="p-4">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={
                        analytics?.hourlyDistribution || [
                          { hour: '12 PM', orders: 12, revenue: 4800 },
                          { hour: '1 PM', orders: 28, revenue: 11400 },
                          { hour: '2 PM', orders: 22, revenue: 9200 },
                          { hour: '3 PM', orders: 8, revenue: 3200 },
                          { hour: '5 PM', orders: 9, revenue: 3600 },
                          { hour: '7 PM', orders: 35, revenue: 15600 },
                          { hour: '8 PM', orders: 48, revenue: 21200 },
                          { hour: '9 PM', orders: 42, revenue: 18900 },
                        ]
                      }
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
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
                        dataKey="orders"
                        stroke="#f97316"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#orderGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardBody>
            </Card>

            {/* Kitchen Station Load Distribution */}
            <Card variant="default" className="border-stone-800">
              <CardHeader className="pb-2 border-b border-stone-800/80">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-400" />
                  <span>Kitchen Station Workload</span>
                </h3>
                <p className="text-xs text-stone-400">Total items routed by culinary pass</p>
              </CardHeader>

              <CardBody className="p-4 space-y-4">
                <div className="h-44 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        analytics?.stationData || [
                          { name: 'Main Kitchen', value: 42 },
                          { name: 'Grill', value: 28 },
                          { name: 'Beverage', value: 34 },
                          { name: 'Dessert', value: 16 },
                        ]
                      }
                      layout="vertical"
                      margin={{ top: 5, right: 15, left: 15, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
                      <XAxis type="number" stroke="#78716c" fontSize={10} tickLine={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#a8a29e"
                        fontSize={10}
                        tickLine={false}
                        width={75}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1c1917',
                          borderColor: '#44403c',
                          borderRadius: '0.5rem',
                          fontSize: '11px',
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {(analytics?.stationData || []).map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATION_COLORS[entry.name] || '#f97316'}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Popular Dishes Quick List */}
                <div className="pt-2 border-t border-stone-800 space-y-1.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 font-bold block">
                    Top Selling Specialties
                  </span>
                  {(analytics?.popularItems || [
                    { name: 'Dal Bukhara Royale', count: 32, revenue: 14400 },
                    { name: 'Tandoori Truffle Kulcha', count: 28, revenue: 5600 },
                    { name: 'Smoked Butter Chicken', count: 24, revenue: 12480 },
                  ]).slice(0, 3).map((dish, i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1">
                      <span className="text-stone-200 truncate pr-2 font-medium">
                        #{i + 1} {dish.name}
                      </span>
                      <span className="font-mono text-orange-400 font-bold shrink-0">
                        {dish.count} ordered
                      </span>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

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
                {[
                  'Analyze tonight\'s dinner rush bottlenecks',
                  'Suggest high-margin appetizer pairings',
                  'Recommend table turnaround optimizations',
                  'How to increase dessert attachment rate?',
                ].map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setAiPrompt(promptText);
                      handleAskAdvisor(promptText);
                    }}
                    className="px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-orange-500/50 text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-orange-400" />
                    <span>{promptText}</span>
                  </button>
                ))}
              </div>

              {/* Input Area */}
              <div className="flex gap-2">
                <Input
                  placeholder="Ask the AI Advisor anything about restaurant operations, menu engineering, or staff load..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAskAdvisor();
                  }}
                  className="flex-1"
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleAskAdvisor()}
                  isLoading={isAskingAi}
                  rightIcon={<Send className="w-3.5 h-3.5" />}
                  className="font-bold shrink-0"
                >
                  Consult AI
                </Button>
              </div>

              {/* AI Advice Output Display */}
              {aiAdvice && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-stone-950 border border-stone-800 text-xs text-stone-200 space-y-2 leading-relaxed"
                >
                  <div className="flex items-center justify-between text-[10px] text-stone-400 border-b border-stone-800 pb-2">
                    <span className="flex items-center gap-1.5 font-bold text-orange-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      Strategic Operational Brief
                    </span>
                    <span className="font-mono text-stone-500">Source: {aiSource}</span>
                  </div>

                  <div className="prose prose-invert prose-xs max-w-none whitespace-pre-wrap pt-1">
                    {aiAdvice}
                  </div>
                </motion.div>
              )}
            </CardBody>
          </Card>
        </div>
      )}

      {/* TAB 2: STAFF & ACCESS CONTROL */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Restaurant Staff Roster</h2>
              <p className="text-xs text-stone-400">
                Create role-based accounts for Managers, Chefs, and Waiters.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<UserPlus className="w-4 h-4" />}
              onClick={() => setIsStaffModalOpen(true)}
            >
              Add Staff Member
            </Button>
          </div>

          <Card variant="default">
            <CardBody className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Station</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingStaff ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-xs text-stone-500">
                        Loading staff roster...
                      </TableCell>
                    </TableRow>
                  ) : (
                    staffList.map((staff) => (
                      <TableRow key={staff._id}>
                        <TableCell>
                          <div className="font-bold text-white text-xs">{staff.name}</div>
                          <div className="text-[11px] text-stone-400">{staff.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="brand" size="sm">
                            {staff.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-stone-300">
                            {staff.station || '—'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={staff.active ? 'success' : 'danger'} size="sm" dot>
                            {staff.active ? 'Active' : 'Deactivated'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {staff.role !== 'OWNER' && (
                            <Button
                              variant={staff.active ? 'ghost' : 'outline'}
                              size="sm"
                              className="text-xs"
                              onClick={() => handleToggleActive(staff._id, staff.active, staff.name)}
                            >
                              {staff.active ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title="Create Restaurant Staff Account"
        size="md"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Sanjeev Kapoor"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. chef@dineflow.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Phone (Optional)"
            placeholder="+91 98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Select
            label="Assigned Role"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="MANAGER">Restaurant Manager</option>
            <option value="KITCHEN">Kitchen Chef</option>
            <option value="WAITER">Waiter / Service Staff</option>
          </Select>

          {role === 'KITCHEN' && (
            <Select
              label="Assigned Culinary Station"
              value={station}
              onChange={(e) => setStation(e.target.value)}
            >
              <option value="Main Kitchen">Main Kitchen</option>
              <option value="Grill">Grill & Tandoor</option>
              <option value="Beverage">Beverage Bar</option>
              <option value="Dessert">Dessert & Pastry</option>
            </Select>
          )}

          <Input
            label="Temporary Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full font-bold"
            isLoading={isSubmitting}
          >
            Create Staff Account
          </Button>
        </form>
      </Modal>
    </div>
  );
};
