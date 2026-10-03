import React, { useState } from 'react';
import { Card, CardHeader, CardBody, Badge, Button } from '../components/ui';
import { toast } from '../stores/useToastStore';
import { ChefHat, Flame, Coffee, IceCream, Clock, Check, Play, AlertCircle } from 'lucide-react';

export const KitchenPreview: React.FC = () => {
  const [activeStation, setActiveStation] = useState('ALL');

  const stations = [
    { id: 'ALL', label: 'All Stations', count: 6 },
    { id: 'MAIN_KITCHEN', label: 'Main Kitchen', count: 3, icon: ChefHat },
    { id: 'GRILL', label: 'Grill & Tandoor', count: 2, icon: Flame },
    { id: 'BEVERAGE', label: 'Beverage Bar', count: 1, icon: Coffee },
    { id: 'DESSERT', label: 'Dessert', count: 0, icon: IceCream },
  ];

  return (
    <div className="space-y-4">
      {/* Station Selector Bar */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#e9e3dc]">
        {stations.map((st) => (
          <button
            key={st.id}
            onClick={() => setActiveStation(st.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeStation === st.id
                ? 'bg-[#d96236] text-white shadow-sm'
                : 'bg-white text-[#7b726a] hover:text-[#211d1a] border border-[#e9e3dc]'
            }`}
          >
            <span>{st.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                activeStation === st.id ? 'bg-white/20 text-white font-black' : 'bg-[#f5f1ec] text-[#4d443c]'
              }`}
            >
              {st.count}
            </span>
          </button>
        ))}
      </div>

      {/* KDS Kanban Ticket Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* NEW Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-black uppercase tracking-wider text-[#dc2626]">
            <span>● New Tickets</span>
            <span className="font-mono">1</span>
          </div>
          <Card variant="default" className="border-[#fecaca] bg-white shadow-sm">
            <CardHeader className="p-3 bg-[#fef2f2] border-b border-[#fecaca] flex items-center justify-between">
              <div>
                <span className="text-base font-black text-[#211d1a] font-mono">T-07</span>
                <span className="text-[11px] text-[#7b726a] ml-2">Round 2</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[#dc2626] font-mono font-bold">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>01:42</span>
              </div>
            </CardHeader>
            <CardBody className="p-3 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#211d1a]">
                <span>2x Paneer Tikka</span>
                <Badge variant="veg" size="sm">
                  Veg
                </Badge>
              </div>
              <div className="text-[11px] text-[#d97706] italic">Note: Extra mint chutney on side</div>
              <Button
                size="sm"
                variant="primary"
                className="w-full mt-2"
                onClick={() => toast.success('Ticket Accepted', 'Moved to PREPARING')}
              >
                Accept Ticket
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* ACCEPTED Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-black uppercase tracking-wider text-[#d97706]">
            <span>● Accepted</span>
            <span className="font-mono">1</span>
          </div>
          <Card variant="default" className="border-[#e9e3dc] bg-white shadow-sm">
            <CardHeader className="p-3 bg-[#fbf9f6] border-b border-[#e9e3dc] flex items-center justify-between">
              <div>
                <span className="text-base font-black text-[#211d1a] font-mono">T-03</span>
                <span className="text-[11px] text-[#7b726a] ml-2">Round 1</span>
              </div>
              <span className="text-[11px] text-[#7b726a] font-mono">03:15</span>
            </CardHeader>
            <CardBody className="p-3 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#211d1a]">
                <span>1x Dal Makhani</span>
                <Badge variant="veg" size="sm">
                  Veg
                </Badge>
              </div>
              <div className="flex justify-between font-bold text-[#211d1a]">
                <span>2x Garlic Naan</span>
                <Badge variant="veg" size="sm">
                  Veg
                </Badge>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2"
                leftIcon={<Play className="w-3.5 h-3.5 text-[#d97706]" />}
                onClick={() => toast.info('Cooking Started', 'Table 03 timer running')}
              >
                Start Cooking
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* PREPARING Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-black uppercase tracking-wider text-[#d96236]">
            <span>● Preparing</span>
            <span className="font-mono">2</span>
          </div>
          <Card variant="default" className="border-[#ffc9b5] bg-white shadow-sm">
            <CardHeader className="p-3 bg-[#fff4ef] border-b border-[#ffc9b5] flex items-center justify-between">
              <div>
                <span className="text-base font-black text-[#211d1a] font-mono">T-11</span>
                <span className="text-[11px] text-[#7b726a] ml-2">Round 1</span>
              </div>
              <span className="text-[11px] text-[#d96236] font-mono font-bold">08:40</span>
            </CardHeader>
            <CardBody className="p-3 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-[#211d1a]">
                <span>1x Murgh Biryani</span>
                <Badge variant="non-veg" size="sm">
                  Non-Veg
                </Badge>
              </div>
              <Button
                size="sm"
                variant="success"
                className="w-full mt-2"
                leftIcon={<Check className="w-3.5 h-3.5 text-white" />}
                onClick={() => toast.success('Order Ready', 'Waiter alerted for pickup at T-11')}
              >
                Mark as Ready
              </Button>
            </CardBody>
          </Card>
        </div>

        {/* READY Column */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-black uppercase tracking-wider text-[#059669]">
            <span>● Ready for Pickup</span>
            <span className="font-mono">1</span>
          </div>
          <Card variant="default" className="border-[#a7f3d0] bg-white shadow-sm">
            <CardHeader className="p-3 bg-[#ecfdf5] border-b border-[#a7f3d0] flex items-center justify-between">
              <div>
                <span className="text-base font-black text-[#211d1a] font-mono">T-04</span>
                <span className="text-[11px] text-[#7b726a] ml-2">Round 1</span>
              </div>
              <Badge variant="success" size="sm" dot>
                Ready
              </Badge>
            </CardHeader>
            <CardBody className="p-3 space-y-2 text-xs">
              <div className="font-bold text-[#059669]">2x Fresh Lime Soda</div>
              <p className="text-[11px] text-[#7b726a]">Waiter notified 45s ago</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
