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
} from 'lucide-react';
import { tableService } from '../services/tableService';
import { staffRequestService } from '../services/staffRequestService';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [shiftStaff, setShiftStaff] = useState<any[]>([]);
  const [activeTablesCount, setActiveTablesCount] = useState(18);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(3);
  const [tablesList, setTablesList] = useState<any[]>([
    { tableNumber: '01', capacity: 4, status: 'AVAILABLE' },
    { tableNumber: '02', capacity: 2, status: 'ACTIVE', order: '₹1,240' },
    { tableNumber: '03', capacity: 4, status: 'ORDERING', order: '18 min' },
    { tableNumber: '04', capacity: 6, status: 'PAYMENT_PENDING', order: '₹2,840' },
    { tableNumber: '05', capacity: 2, status: 'READY', order: '3 items' },
    { tableNumber: '06', capacity: 4, status: 'ACTIVE', order: '₹1,920' },
    { tableNumber: '07', capacity: 4, status: 'ORDERING', order: '8 min' },
    { tableNumber: '08', capacity: 2, status: 'AVAILABLE' },
  ]);

  const fetchManagerData = () => {
    fetch('/api/users?active=true', {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) setShiftStaff(data.data);
      })
      .catch((_) => {});

    tableService
      .getAllTables()
      .then((tbls: any[]) => {
        if (tbls && tbls.length > 0) {
          setTablesList(tbls);
          setActiveTablesCount(tbls.filter((t: any) => t.status !== 'AVAILABLE').length);
        }
      })
      .catch(() => {});

    staffRequestService
      .getActiveRequests()
      .then((reqs) => {
        if (reqs && reqs.length > 0) setPendingRequestsCount(reqs.length);
      })
      .catch((_) => {});
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  const requests = [
    {
      table: '07',
      request: 'Water requested',
      age: '1 min',
      tone: 'bg-[#eaf2fb] text-[#3974b9] border-[#bfdbfe]',
      icon: Droplets,
    },
    {
      table: '04',
      request: 'Bill requested',
      age: '4 min',
      tone: 'bg-[#fff8e7] text-[#bf7a13] border-[#fed7aa]',
      icon: ReceiptText,
    },
    {
      table: '11',
      request: 'Needs assistance',
      age: '6 min',
      tone: 'bg-[#fff4ef] text-[#d96236] border-[#ffc9b5]',
      icon: Bell,
    },
  ];

  const getTableTone = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return 'border-[#e9e3dc] bg-white text-[#7b726a]';
      case 'ACTIVE':
        return 'border-[#bfdbfe] bg-[#eaf2fb] text-[#3974b9]';
      case 'ORDERING':
        return 'border-[#fed7aa] bg-[#fff8e7] text-[#bf7a13]';
      case 'PAYMENT_PENDING':
        return 'border-[#ffc9b5] bg-[#fff4ef] text-[#d96236]';
      case 'READY':
        return 'border-[#a5d8be] bg-[#e8f6ef] text-[#23865b]';
      default:
        return 'border-[#e9e3dc] bg-white text-[#7b726a]';
    }
  };

  return (
    <div className="space-y-6 text-[#211d1a] font-sans">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e9e3dc]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#3974b9] mb-1">
            DINNER SERVICE • LIVE OPERATIONS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#211d1a] tracking-tight">
            Operations Command Center
          </h1>
          <p className="text-xs text-[#7b726a] mt-1">
            A real-time operational overview of your floor tables, kitchen stations, and service team.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-[#e8f6ef] border border-[#a5d8be] text-[#23865b] text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#23865b] animate-pulse" />
            <span>All Systems Operational</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              fetchManagerData();
              toast.info('Floor Synced', 'Live floor & service queues refreshed');
            }}
          >
            Sync
          </Button>
        </div>
      </div>

      {/* Manager Metric Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Active Tables</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {activeTablesCount} / 24
            </div>
            <span className="text-[10px] text-[#23865b] font-bold">75% floor occupancy</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center shadow-2xs">
            <Table2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Open Orders</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">18</div>
            <span className="text-[10px] text-[#bf7a13] font-bold">5 orders in preparation</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center shadow-2xs">
            <ReceiptText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Avg. Prep Time</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">13.2m</div>
            <span className="text-[10px] text-[#23865b] font-bold">1.8m faster than SLA</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#e8f6ef] text-[#23865b] flex items-center justify-center shadow-2xs">
            <Clock3 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Today's Sales</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">₹48,250</div>
            <span className="text-[10px] text-[#3974b9] font-bold">+12.8% ahead</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eaf2fb] text-[#3974b9] flex items-center justify-center shadow-2xs">
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
              <p className="text-xs text-[#7b726a]">Main Dining Room • 24 Tables</p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#7b726a]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f5f1ec] border border-[#e9e3dc]" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3974b9]" /> Dining
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#bf7a13]" /> Ordering
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/manager/floor')}
                className="text-xs text-[#3974b9]"
              >
                Full Floor Plan <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Tables Layout */}
          <div className="p-4 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] grid grid-cols-2 sm:grid-cols-4 gap-3.5 min-h-[300px]">
            {tablesList.map((t, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border bg-white flex flex-col justify-between items-center text-center shadow-2xs hover:shadow-sm transition-all cursor-pointer ${
                  t.status === 'AVAILABLE'
                    ? 'border-[#e9e3dc]'
                    : t.status === 'READY'
                    ? 'border-[#a5d8be] bg-[#e8f6ef]/30'
                    : 'border-[#bfdbfe]'
                }`}
                onClick={() => navigate('/manager/floor')}
              >
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
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

                <div className="my-2">
                  <div className="text-xl font-black text-[#211d1a]">
                    T-{t.tableNumber || idx + 1}
                  </div>
                  <div className="text-[10px] text-[#7b726a]">{t.capacity || 4} Guests</div>
                </div>

                <div className="text-[10px] font-bold text-[#49423c]">
                  {t.order || (t.status === 'AVAILABLE' ? 'Vacant' : 'Session Active')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Service Requests & Pulse */}
        <div className="space-y-6">
          {/* Active Service Requests */}
          <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e9e3dc]">
              <div>
                <h3 className="text-sm font-bold text-[#211d1a]">Service Requests</h3>
                <p className="text-[11px] text-[#7b726a]">{pendingRequestsCount} active diner assistance calls</p>
              </div>
              <Badge variant="warning" size="sm" dot>
                Live Queue
              </Badge>
            </div>

            <div className="space-y-2">
              {requests.map((req, idx) => {
                const Icon = req.icon;
                return (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-[#fbf9f6] border border-[#e9e3dc] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${req.tone}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <strong className="text-xs text-[#211d1a] block truncate">{req.request}</strong>
                        <span className="text-[10px] text-[#7b726a]">Table {req.table} • {req.age} ago</span>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="text-xs shrink-0 py-1 px-2.5"
                      onClick={() => toast.success('Staff Assigned', `Waiter dispatched to Table ${req.table}`)}
                    >
                      Assign
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kitchen Pulse */}
          <div className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#e9e3dc]">
              <div>
                <h3 className="text-sm font-bold text-[#211d1a]">Kitchen Pulse</h3>
                <p className="text-[11px] text-[#7b726a]">Current station load & active ticket volume</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/kitchen')}
                className="text-xs text-[#d96236]"
              >
                Open KDS <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>

            <div className="space-y-3 pt-1">
              {[
                { name: 'Main Kitchen', count: 9, load: 72, color: 'bg-[#d96236]' },
                { name: 'Tandoor & Grill', count: 5, load: 46, color: 'bg-[#bf7a13]' },
                { name: 'Beverage Bar', count: 4, load: 34, color: 'bg-[#3974b9]' },
              ].map((st, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#211d1a]">{st.name}</span>
                    <span className="text-[11px] text-[#7b726a]">{st.count} orders ({st.load}%)</span>
                  </div>
                  <div className="h-2 w-full bg-[#f5f1ec] rounded-full overflow-hidden">
                    <div className={`h-full ${st.color} rounded-full transition-all`} style={{ width: `${st.load}%` }} />
                  </div>
                </div>
              ))}
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
              <span>Active Shift Roster</span>
            </h3>
            <p className="text-xs text-[#7b726a]">Current team members on duty across service and kitchen stations.</p>
          </div>
          <Badge variant="success" size="sm" dot>
            {shiftStaff.length || 12} On Duty
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
                  { name: 'Riya Sharma', email: 'riya@dineflow.com', role: 'WAITER', station: 'West Wing' },
                  { name: 'Aman Khanna', email: 'aman@dineflow.com', role: 'KITCHEN', station: 'Tandoor' },
                  { name: 'Neha Patel', email: 'neha@dineflow.com', role: 'WAITER', station: 'Terrace' },
                ]
            ).map((st, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="font-bold text-[#211d1a] text-xs">{st.name}</div>
                  <div className="text-[10px] text-[#7b726a]">{st.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={st.role === 'KITCHEN' ? 'station' : 'neutral'} size="sm">
                    {st.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-[#49423c]">
                  {st.station || (st.role === 'WAITER' ? 'Main Dining Floor' : 'All Zones')}
                </TableCell>
                <TableCell>
                  <Badge variant="success" size="sm" dot>
                    Active
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-[#7b726a] font-mono">
                  Shift On
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
