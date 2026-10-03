import React, { useState, useEffect } from 'react';
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
  PageHeader,
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
  AlertCircle,
  Flame,
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { tableService } from '../services/tableService';
import { staffRequestService } from '../services/staffRequestService';

export const ManagerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [shiftStaff, setShiftStaff] = useState<any[]>([]);
  const [activeTablesCount, setActiveTablesCount] = useState(0);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fetchManagerData = () => {
    fetch('/api/users?active=true', {
      headers: getAuthHeaders(),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setShiftStaff(data.data);
      })
      .catch((_) => {});

    tableService.getAllTables().then((tbls: any[]) => {
      setActiveTablesCount(tbls.filter((t: any) => t.status !== 'AVAILABLE').length);
    }).catch(() => {});

    staffRequestService.getActiveRequests().then((reqs) => {
      setPendingRequestsCount(reqs.length);
    }).catch((_) => {});
  };

  useEffect(() => {
    fetchManagerData();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader
        badge={
          <Badge variant="success" size="sm" dot>
            Shift Supervisor
          </Badge>
        }
        title="Manager Floor Operations"
        description={`Logged in as ${user?.name || 'Manager'}. Oversee floor table turnover, kitchen coordination, and shift roster.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/manager/floor')}
            >
              Floor Plan
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/manager/menu')}
            >
              Menu Items
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                fetchManagerData();
                toast.info('Floor Synced', 'All active table sessions refreshed');
              }}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card variant="default">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase">Active Floor Tables</div>
              <div className="text-2xl font-black text-white mt-1">{activeTablesCount} Active</div>
              <div className="text-[11px] text-emerald-400 mt-1">Live table sessions running</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase">Kitchen Average Time</div>
              <div className="text-2xl font-black text-white mt-1">13.2 mins</div>
              <div className="text-[11px] text-emerald-400 mt-1">Target: &lt;15 mins</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        <Card variant="default">
          <CardBody className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-semibold uppercase">Service Requests</div>
              <div className="text-2xl font-black text-white mt-1">{pendingRequestsCount} Pending</div>
              <div className="text-[11px] text-amber-400 mt-1">Active diner assistance calls</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <BellRing className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Active Shift Staff Roster */}
      <Card variant="default">
        <CardHeader className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>Active Shift Roster</span>
            </h3>
            <p className="text-xs text-stone-400 mt-0.5">
              Current team members on duty across service and kitchen stations.
            </p>
          </div>
          <Badge variant="success" size="sm" dot>
            {shiftStaff.length} On Duty
          </Badge>
        </CardHeader>
        <CardBody className="p-0">
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
              {shiftStaff.map((st) => (
                <TableRow key={st._id}>
                  <TableCell>
                    <div className="font-bold text-white">{st.name}</div>
                    <div className="text-xs text-stone-400">{st.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={st.role === 'KITCHEN' ? 'station' : 'neutral'} size="sm">
                      {st.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-stone-300">
                    {st.station || (st.role === 'WAITER' ? 'Main Dining Floor' : 'All Zones')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" size="sm" dot>
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-stone-400">
                    Logged in
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};
