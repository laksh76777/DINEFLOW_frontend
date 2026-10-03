import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  ChefHat,
  Coffee,
  Sparkles,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Layers,
  Thermometer,
  ShieldCheck,
  Utensils,
  Plus,
} from 'lucide-react';
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
  Modal,
  Input,
  Select,
} from '../components/ui';
import { orderService, IOrder } from '../services/orderService';
import { socketService } from '../services/socketService';
import { toast } from '../stores/useToastStore';

interface KitchenStationData {
  id: string;
  name: string;
  code: string;
  iconType: 'flame' | 'chef' | 'beverage' | 'dessert';
  leadChef: string;
  chefTitle: string;
  shiftHours: string;
  assistantsCount: number;
  status: 'OPERATIONAL' | 'PEAK_LOAD' | 'PAUSED';
  targetSla: string;
  equipmentNote: string;
  specialties: string[];
}

export const KitchenStationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeOrders, setActiveOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Station definitions with realistic culinary staffing for Rasrang
  const [stations, setStations] = useState<KitchenStationData[]>([
    {
      id: 'st-main',
      name: 'Main Kitchen (Curries & Dum Degs)',
      code: 'MAIN_KITCHEN',
      iconType: 'chef',
      leadChef: 'Chef Rajesh Kumar',
      chefTitle: 'Executive Head Chef',
      shiftHours: '4:00 PM – 11:30 PM',
      assistantsCount: 2,
      status: 'OPERATIONAL',
      targetSla: '14 min',
      equipmentNote: 'Copper Handis & Dum Degs Simmering',
      specialties: ['Awadhi Gosht Dum Biryani', 'Dal Makhani Bukhara', 'Butter Chicken Aslam'],
    },
    {
      id: 'st-tandoor',
      name: 'Charcoal Tandoor & Live Grills',
      code: 'TANDOOR',
      iconType: 'flame',
      leadChef: 'Chef Vikram Singh',
      chefTitle: 'Master Tandoori Ustād',
      shiftHours: '4:30 PM – 11:30 PM',
      assistantsCount: 1,
      status: 'OPERATIONAL',
      targetSla: '12 min',
      equipmentNote: 'Twin Clay Tandoors at 420°C',
      specialties: ['Smoked Malai Paneer Tikka', 'Tandoori Bharwan Khumb', 'Galouti Kebab'],
    },
    {
      id: 'st-bev',
      name: 'Artisanal Beverage & Mocktail Bar',
      code: 'BEVERAGE',
      iconType: 'beverage',
      leadChef: 'Arjun Nair',
      chefTitle: 'Head Mixologist',
      shiftHours: '5:00 PM – Midnight',
      assistantsCount: 1,
      status: 'OPERATIONAL',
      targetSla: '6 min',
      equipmentNote: 'Cold extraction & botanical infusion station',
      specialties: ['Masala Shikanji Spritz', 'Royal Kesari Thandai', 'Smoked Plum Cooler'],
    },
    {
      id: 'st-des',
      name: 'Dessert & Confectionery Lab',
      code: 'DESSERT',
      iconType: 'dessert',
      leadChef: 'Chef Sunita Rao',
      chefTitle: 'Master Pastry Chef',
      shiftHours: '5:00 PM – 11:30 PM',
      assistantsCount: 1,
      status: 'OPERATIONAL',
      targetSla: '8 min',
      equipmentNote: 'Saffron blast chiller & gold leaf station',
      specialties: ['Saffron Pistachio Shahi Tukda', 'Kesari Angoori Rasmalai'],
    },
  ]);

  // Modal for reassigning station chef
  const [reassignStation, setReassignStation] = useState<KitchenStationData | null>(null);
  const [newChefName, setNewChefName] = useState('');
  const [newChefTitle, setNewChefTitle] = useState('');

  const fetchActiveOrders = async () => {
    try {
      const orders = await orderService.getActiveKitchenOrders();
      if (Array.isArray(orders)) {
        setActiveOrders(orders);
      }
    } catch (err: any) {
      console.warn('Could not fetch active kitchen tickets:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();

    const socket = socketService.getSocket();
    socketService.joinKitchen();

    const handleOrderUpdate = () => {
      fetchActiveOrders();
    };

    socket.on('NEW_ORDER', handleOrderUpdate);
    socket.on('ORDER_ACCEPTED', handleOrderUpdate);
    socket.on('ORDER_PREPARING', handleOrderUpdate);
    socket.on('ORDER_READY', handleOrderUpdate);
    socket.on('ORDER_UPDATED', handleOrderUpdate);

    return () => {
      socket.off('NEW_ORDER', handleOrderUpdate);
      socket.off('ORDER_ACCEPTED', handleOrderUpdate);
      socket.off('ORDER_PREPARING', handleOrderUpdate);
      socket.off('ORDER_READY', handleOrderUpdate);
      socket.off('ORDER_UPDATED', handleOrderUpdate);
    };
  }, []);

  const getStationItems = (code: string) => {
    const matchedItems: Array<{ dishName: string; quantity: number; tableNumber: string; roundNumber: number; notes?: string }> = [];
    activeOrders.forEach((order) => {
      order.items?.forEach((item) => {
        const itemStation = item.kitchenStation || 'MAIN_KITCHEN';
        if (
          itemStation === code ||
          (code === 'MAIN_KITCHEN' && (!item.kitchenStation || item.kitchenStation === 'MAIN_KITCHEN')) ||
          (code === 'TANDOOR' && (item.kitchenStation === 'TANDOOR' || item.kitchenStation === 'GRILL')) ||
          (code === 'BEVERAGE' && (item.kitchenStation === 'BEVERAGE' || item.kitchenStation === 'BAR')) ||
          (code === 'DESSERT' && item.kitchenStation === 'DESSERT')
        ) {
          matchedItems.push({
            dishName: item.name,
            quantity: item.quantity,
            tableNumber: order.tableNumber,
            roundNumber: order.roundNumber,
            notes: item.notes,
          });
        }
      });
    });
    return matchedItems;
  };

  const toggleStationStatus = (stationId: string) => {
    setStations((prev) =>
      prev.map((s) => {
        if (s.id !== stationId) return s;
        const nextStatus = s.status === 'OPERATIONAL' ? 'PEAK_LOAD' : s.status === 'PEAK_LOAD' ? 'PAUSED' : 'OPERATIONAL';
        toast.info('Station Updated', `${s.name} status set to ${nextStatus}`);
        return { ...s, status: nextStatus };
      })
    );
  };

  const handleSaveReassignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignStation || !newChefName.trim()) return;

    setStations((prev) =>
      prev.map((s) =>
        s.id === reassignStation.id
          ? { ...s, leadChef: newChefName.trim(), chefTitle: newChefTitle.trim() || s.chefTitle }
          : s
      )
    );
    toast.success('Chef Assigned', `${newChefName} assigned as lead for ${reassignStation.name}`);
    setReassignStation(null);
    setNewChefName('');
    setNewChefTitle('');
  };

  const totalKitchenChefs = stations.reduce((sum, s) => sum + 1 + s.assistantsCount, 0);
  const totalActiveDishes = activeOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0);

  return (
    <div className="space-y-6 text-[#211d1a] font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#e9e3dc]">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#d96236] mb-1 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            <span>KITCHEN OPERATIONS • PRODUCTION HUBS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#211d1a] tracking-tight">
            Kitchen Stations & Chef Command
          </h1>
          <p className="text-xs text-[#7b726a] mt-1">
            Real-time culinary line tracking, chef assignments, and live ticket pacing across Rasrang's preparation stations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/kitchen')}
            className="flex items-center gap-1.5 text-xs shadow-2xs font-semibold"
          >
            <span>Open Live KDS</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsRefreshing(true);
              fetchActiveOrders();
              toast.info('Stations Synced', 'Live kitchen load refreshed');
            }}
            className="flex items-center gap-1.5 text-xs shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>
        </div>
      </div>

      {/* KPI Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Active Stations</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {stations.filter((s) => s.status !== 'PAUSED').length} / {stations.length}
            </div>
            <span className="text-[10px] text-[#23865b] font-bold">100% lines operational</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff4ef] text-[#d96236] flex items-center justify-center shadow-2xs">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Chefs On Duty</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {totalKitchenChefs}
            </div>
            <span className="text-[10px] text-[#3974b9] font-bold">4 Leads • 5 Assistants</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#eaf2fb] text-[#3974b9] flex items-center justify-center shadow-2xs">
            <ChefHat className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Dishes in Prep</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              {totalActiveDishes}
            </div>
            <span className="text-[10px] text-[#bf7a13] font-bold">
              {activeOrders.length} active table tickets
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#fff8e7] text-[#bf7a13] flex items-center justify-center shadow-2xs">
            <Utensils className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-[#e9e3dc] rounded-2xl p-4.5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#7b726a]">Kitchen SLA Pacing</span>
            <div className="text-2xl font-black text-[#211d1a] tracking-tight mt-1">
              12.4m
            </div>
            <span className="text-[10px] text-[#23865b] font-bold">1.6m ahead of SLA</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#e8f6ef] text-[#23865b] flex items-center justify-center shadow-2xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Production Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {stations.map((st) => {
          const itemsCooking = getStationItems(st.code);
          const loadPercentage = Math.min(itemsCooking.length * 20 + (st.status === 'PEAK_LOAD' ? 30 : 15), 100);

          return (
            <div
              key={st.id}
              className="bg-white border border-[#e9e3dc] rounded-2xl p-5 shadow-2xs space-y-4 hover:shadow-sm transition-all"
            >
              {/* Station Card Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#e9e3dc]">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#fff4ef] text-[#d96236] border border-[#ffc9b5] flex items-center justify-center shrink-0 shadow-2xs">
                    {st.iconType === 'flame' ? (
                      <Flame className="w-6 h-6" />
                    ) : st.iconType === 'chef' ? (
                      <ChefHat className="w-6 h-6" />
                    ) : st.iconType === 'beverage' ? (
                      <Coffee className="w-6 h-6" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#211d1a]">{st.name}</h3>
                    <p className="text-[11px] text-[#7b726a] font-mono mt-0.5">
                      CODE: {st.code} • Target SLA: {st.targetSla}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    onClick={() => toggleStationStatus(st.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                      st.status === 'OPERATIONAL'
                        ? 'bg-[#e8f6ef] text-[#23865b] border border-[#a5d8be]'
                        : st.status === 'PEAK_LOAD'
                        ? 'bg-[#fff8e7] text-[#bf7a13] border border-[#fed7aa]'
                        : 'bg-[#fde8e8] text-[#c54e4a] border border-[#fca5a5]'
                    }`}
                    title="Click to toggle status (Operational / Peak / Paused)"
                  >
                    {st.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Chef On Duty & Equipment Status */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#fbf9f6] border border-[#e9e3dc] rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-[#7b726a] uppercase font-bold block">
                    Station Lead Chef
                  </span>
                  <strong className="text-xs font-bold text-[#211d1a] block truncate">
                    {st.leadChef}
                  </strong>
                  <span className="text-[10px] text-[#be4d27] block truncate">{st.chefTitle}</span>
                </div>

                <div>
                  <span className="text-[10px] text-[#7b726a] uppercase font-bold block">
                    Shift & Team
                  </span>
                  <strong className="text-xs text-[#211d1a] block">
                    1 Lead + {st.assistantsCount} Cooks
                  </strong>
                  <span className="text-[10px] text-[#7b726a] block truncate">{st.shiftHours}</span>
                </div>
              </div>

              {/* Station Load & Current Volume */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#7b726a] font-medium flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-[#d96236]" />
                    <span>Station Load Pacing</span>
                  </span>
                  <span className="font-bold text-[#211d1a]">
                    {itemsCooking.length} tickets ({loadPercentage}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-[#f5f1ec] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      loadPercentage > 75
                        ? 'bg-[#c54e4a]'
                        : loadPercentage > 40
                        ? 'bg-[#d97706]'
                        : 'bg-[#23865b]'
                    }`}
                    style={{ width: `${Math.max(loadPercentage, 10)}%` }}
                  />
                </div>
                <div className="text-[10px] text-[#7b726a] italic">
                  Equipment status: {st.equipmentNote}
                </div>
              </div>

              {/* Active Dishes Currently Routed to this Station */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7b726a] block">
                  Active Live Orders On Station:
                </span>
                {itemsCooking.length === 0 ? (
                  <div className="p-2.5 rounded-lg bg-[#fbf9f6] border border-[#e9e3dc] text-[11px] text-[#7b726a] flex items-center justify-between">
                    <span>Station clear • Ready for next ticket</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#23865b]" />
                  </div>
                ) : (
                  <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                    {itemsCooking.map((it, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded-lg bg-[#fbf9f6] border border-[#e9e3dc] flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-4 h-4 rounded bg-[#fff4ef] text-[#be4d27] font-bold text-[10px] flex items-center justify-center shrink-0">
                            {it.quantity}
                          </span>
                          <span className="font-semibold text-[#211d1a] truncate">{it.dishName}</span>
                          {it.notes && (
                            <span className="text-[9px] text-[#bf7a13] font-mono">({it.notes})</span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[#7b726a] shrink-0 font-bold">
                          Table {it.tableNumber}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="pt-2 border-t border-[#e9e3dc] flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReassignStation(st);
                    setNewChefName(st.leadChef);
                    setNewChefTitle(st.chefTitle);
                  }}
                  className="text-xs text-[#d96236] hover:bg-[#fff4ef] px-2 py-1"
                >
                  Reassign Chef
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/kitchen')}
                  className="text-xs px-2.5 py-1"
                >
                  View Station KDS
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete Chef & Line Cook Duty Roster */}
      <div className="bg-white border border-[#e9e3dc] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#e9e3dc]">
          <div>
            <h3 className="text-base font-bold text-[#211d1a] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#d96236]" />
              <span>Kitchen Staff & Chef Duty Roster</span>
            </h3>
            <p className="text-xs text-[#7b726a]">
              Master chef credentials, culinary stations, and active shift rosters for Rasrang dinner service.
            </p>
          </div>
          <Badge variant="success" size="sm" dot>
            6 Chefs Active
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Chef Name</TableHead>
              <TableHead>Assigned Station</TableHead>
              <TableHead>Culinary Designation</TableHead>
              <TableHead>Shift Window</TableHead>
              <TableHead>Line Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              {
                name: 'Chef Rajesh Kumar',
                station: 'Main Kitchen (Curries & Rice)',
                title: 'Executive Head Chef',
                shift: '4:00 PM – 11:30 PM',
                status: 'On Station',
              },
              {
                name: 'Chef Vikram Singh',
                station: 'Charcoal Tandoor & Grills',
                title: 'Master Tandoori Ustād',
                shift: '4:30 PM – 11:30 PM',
                status: 'On Station',
              },
              {
                name: 'Arjun Nair',
                station: 'Beverage & Mocktail Bar',
                title: 'Head Mixologist',
                shift: '5:00 PM – Midnight',
                status: 'On Station',
              },
              {
                name: 'Chef Sunita Rao',
                station: 'Dessert Lab',
                title: 'Master Pastry Chef',
                shift: '5:00 PM – 11:30 PM',
                status: 'On Station',
              },
              {
                name: 'Manish Rawat',
                station: 'Main Kitchen Line 2',
                title: 'Senior Line Cook',
                shift: '4:00 PM – Midnight',
                status: 'On Station',
              },
              {
                name: 'Gurpreet Singh',
                station: 'Tandoor Assistant',
                title: 'Breads & Roti Cook',
                shift: '4:30 PM – 11:30 PM',
                status: 'On Station',
              },
            ].map((chef, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div className="font-bold text-xs text-[#211d1a]">{chef.name}</div>
                  <div className="text-[10px] text-[#7b726a]">Rasrang Kitchen Crew</div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-semibold text-[#be4d27]">{chef.station}</span>
                </TableCell>
                <TableCell className="text-xs text-[#49423c]">{chef.title}</TableCell>
                <TableCell className="text-xs font-mono text-[#7b726a]">{chef.shift}</TableCell>
                <TableCell>
                  <Badge variant="success" size="sm" dot>
                    {chef.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-[#d96236]"
                    onClick={() => toast.info('Staff Assignment', `${chef.name} verified on duty`)}
                  >
                    Check In
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal: Reassign Chef */}
      {reassignStation && (
        <Modal
          isOpen={!!reassignStation}
          onClose={() => setReassignStation(null)}
          title={`Reassign Station Lead • ${reassignStation.name}`}
          size="sm"
        >
          <form onSubmit={handleSaveReassignment} className="space-y-4">
            <Input
              label="New Lead Chef Name"
              placeholder="e.g. Chef Rajesh Kumar"
              value={newChefName}
              onChange={(e) => setNewChefName(e.target.value)}
              required
            />
            <Input
              label="Chef Designation / Title"
              placeholder="e.g. Executive Head Chef"
              value={newChefTitle}
              onChange={(e) => setNewChefTitle(e.target.value)}
            />
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e9e3dc]">
              <Button
                variant="secondary"
                size="sm"
                type="button"
                onClick={() => setReassignStation(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Confirm Assignment
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default KitchenStationsPage;
